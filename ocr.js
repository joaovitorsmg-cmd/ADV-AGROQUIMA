// ═══════════════════════════════════════════════════════════════════════
// ocr.js — leitura automática de notas fiscais (foto ou PDF)
// ═══════════════════════════════════════════════════════════════════════
// Roda 100% no dispositivo (sem enviar a imagem para nenhum servidor de terceiros):
//  - Tesseract.js faz OCR de fotos de nota fiscal.
//  - PDF.js extrai o texto de PDFs (a maioria das NF-e em PDF já tem texto embutido,
//    sem precisar de OCR; só renderiza+OCR se o PDF for uma imagem escaneada).
// As bibliotecas são carregadas sob demanda (só quando o usuário anexa um arquivo) e
// ficam cacheadas pelo Service Worker após o primeiro uso, para funcionar offline depois.
// ═══════════════════════════════════════════════════════════════════════

const OCR_CDN = {
  tesseract: 'https://unpkg.com/tesseract.js@5.1.0/dist/tesseract.min.js',
  // pdfjs-dist 4.x só publica build ESM (.mjs) nesses caminhos — por isso é
  // carregado via import() dinâmico abaixo, em vez de <script> clássico.
  pdfjs: 'https://unpkg.com/pdfjs-dist@4.0.379/build/pdf.min.mjs',
  pdfjsWorker: 'https://unpkg.com/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs'
};

let _ocrLibsCarregadas = false;
function carregarScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Não foi possível carregar ' + src));
    document.head.appendChild(s);
  });
}

async function carregarLibsOCR() {
  if (_ocrLibsCarregadas) return;
  await Promise.all([
    carregarScript(OCR_CDN.tesseract),
    (async () => {
      if (!window.pdfjsLib) window.pdfjsLib = await import(OCR_CDN.pdfjs);
    })()
  ]);
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = OCR_CDN.pdfjsWorker;
  _ocrLibsCarregadas = true;
}

function normalizarTextoOCR(t) {
  return (t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

async function extrairTextoImagem(file) {
  await carregarLibsOCR();
  const { data } = await window.Tesseract.recognize(file, 'por');
  return data.text || '';
}

async function ocrCanvas(canvas) {
  await carregarLibsOCR();
  const { data } = await window.Tesseract.recognize(canvas, 'por');
  return data.text || '';
}

async function extrairTextoPDF(file) {
  await carregarLibsOCR();
  const buf = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
  let texto = '';
  const paginas = Math.min(pdf.numPages, 3);
  for (let i = 1; i <= paginas; i++) {
    const pagina = await pdf.getPage(i);
    const conteudo = await pagina.getTextContent();
    texto += conteudo.items.map(it => it.str).join(' ') + '\n';
  }
  if (texto.trim().length > 20) return texto; // PDF com texto embutido (NF-e digital)

  // PDF escaneado, sem texto embutido — renderiza a 1ª página e aplica OCR de imagem
  const pagina = await pdf.getPage(1);
  const viewport = pagina.getViewport({ scale: 2 });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await pagina.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
  return ocrCanvas(canvas);
}

async function extrairTextoDeArquivo(file) {
  if (file.type === 'application/pdf') return extrairTextoPDF(file);
  return extrairTextoImagem(file);
}

// ─── IDENTIFICAÇÃO DO TIPO DE DOCUMENTO ───
// Só existem 3 tipos de documento fiscal eletrônico que o app aceita como "nota
// fiscal" (NF-e, Cupom Fiscal/NFC-e/SAT e NFS-e); o que não se encaixa em nenhum
// deles e não está marcado como "nota escrita à mão" é tratado como leitura
// insuficiente — não dá para confirmar a despesa sem saber o que foi anexado.
// Padrões cobrem as variações reais de impressão de cada modelo (DANFE da NF-e
// modelo 55; DANFE NFC-e modelo 65/CF-e-SAT/cupom ECF "clássico"; NFS-e — layout
// varia por prefeitura, mas "NFS-e"/ISSQN são praticamente universais).
function detectarTipoDocumento(texto) {
  if (/\bdanfe\b|\bnf-?e\b|nota fiscal eletronica|chave de acesso/.test(texto)) return 'nfe';
  if (/nfc-?e|cupom fiscal|extrato n[ºo.]? sat|\bsat\b|cf-?e[\s-]?sat|emitido por ecf|coo\s*[:\-]?\s*\d/.test(texto)) return 'cupom';
  // BP-e (Bilhete de Passagem Eletrônico) é tecnicamente da mesma família do
  // NFC-e (documento fiscal eletrônico ao consumidor final) — tratado como "cupom".
  if (/bilhete de passagem eletr[oô]nico|\bbp-?e\b/.test(texto)) return 'cupom';
  if (/nfs-?e|nota fiscal de servi[cç]os? eletr[oô]nica|nota fiscal eletr[oô]nica de servi[cç]os?|issqn|imposto sobre servi[cç]os/.test(texto)) return 'nfse';
  // Comprovante/espelho de pedágio emitido por concessionária de rodovia: muitas
  // praças automáticas imprimem um recibo sem chave de acesso fiscal (não é NF-e/
  // NFC-e/NFS-e), mas ainda é o documento padrão de comprovação desse tipo de gasto.
  if (/pra[cç]a de ped[aá]gio|concession[aá]ria.{0,20}rodovi|tarifa de ped[aá]gio|sem parar|conectcar|veloe/.test(texto)) return 'pedagio';
  return 'desconhecido';
}

// ─── CORRELAÇÃO TIPO DE DESPESA × CONTEÚDO DA NOTA ───
// Cada tipo de despesa tem um vocabulário esperado (ex.: Refeição → "marmita",
// "self-service"; Reparos/Manutenção → "parafuso", "oficina"). Se a nota citar um
// termo claramente de OUTRO tipo e nenhum termo do tipo escolhido aparecer, é sinal
// forte de lançamento no tipo errado (ex.: nota de oficina lançada como Refeição).
// Não bloqueia o salvamento (a varredura de palavras é sujeita a falso positivo —
// nem toda nota itemiza o suficiente para confirmar), mas marca para revisão, no
// mesmo padrão já usado para ITENS_PROIBIDOS.
function verificarCorrelacaoTipoDespesa(tipoDespesa, textoNormalizado) {
  const tabela = (typeof CORRELACAO_TIPO_DESPESA !== 'undefined') ? CORRELACAO_TIPO_DESPESA : null;
  if (!tabela || !tipoDespesa || !tabela[tipoDespesa]) return { tipoDivergente: false, tipoTermoConflitante: null, tipoSugerido: null };
  const termosProprios = tabela[tipoDespesa].map(normalizarTextoOCR);
  if (termosProprios.some(t => textoNormalizado.includes(t))) {
    return { tipoDivergente: false, tipoTermoConflitante: null, tipoSugerido: null };
  }
  for (const [outroTipo, termos] of Object.entries(tabela)) {
    if (outroTipo === tipoDespesa) continue;
    const termoEncontrado = termos.map(normalizarTextoOCR).find(t => textoNormalizado.includes(t));
    if (termoEncontrado) return { tipoDivergente: true, tipoTermoConflitante: termoEncontrado, tipoSugerido: outroTipo };
  }
  return { tipoDivergente: false, tipoTermoConflitante: null, tipoSugerido: null };
}

// ─── CHAVE DE ACESSO (NF-e/NFC-e) ───
// A chave tem 44 dígitos com largura fixa por campo: cUF(2) AAMM(4) CNPJ(14)
// mod(2) serie(3) nNF(9) tpEmis(1) cNF(8) cDV(1). O número da nota (nNF) embutido
// na chave é matematicamente parte do código validado pela Sefaz — muito mais
// confiável do que tentar achar "Nº 1234" no texto solto da página.
function numeroPelaChaveDeAcesso(chave44) {
  if (!chave44 || chave44.length !== 44) return null;
  const nNF = chave44.slice(25, 34).replace(/^0+(?=\d)/, '');
  return nNF || null;
}

// ─── EXTRAÇÃO DOS CAMPOS DA NOTA ───
// A chave de acesso é impressa em 11 blocos de 4 dígitos separados por espaço
// (ex.: "5226 0500 3214 3800..."). É preciso buscar esse padrão no texto original —
// concatenar todos os dígitos da página (datas, série, CNPJ etc.) antes de procurar
// os 44 dígitos junta números de campos vizinhos e corrompe a chave encontrada.
function extrairChaveAcesso(textoOriginal) {
  const comSeparador = textoOriginal.match(/\d{4}(?:[ \t.]\d{4}){10}/);
  if (comSeparador) return comSeparador[0].replace(/\D/g, '');
  const continua = textoOriginal.match(/\b\d{44}\b/);
  return continua ? continua[0] : null;
}

function extrairNumeroPeloTexto(textoOriginal) {
  // Aceita "Nº 1234", "N° 1234", "Nº. 000.000.780" (com pontos de milhar) etc.
  const m = textoOriginal.match(/n[ºo°]\.?\s*((?:\d[.\s]?){1,14}\d)/i);
  if (!m) return null;
  const limpo = m[1].replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  return limpo || null;
}

function extrairValorTotal(texto) {
  const padroes = [
    /valor total da nota\D{0,10}?([\d.]+,\d{2})/,
    /v\.?\s*total da nota\D{0,10}?([\d.]+,\d{2})/,
    /valor total\D{0,10}?([\d.]+,\d{2})/
  ];
  for (const p of padroes) {
    const m = texto.match(p);
    if (m) return parseFloat(m[1].replace(/\./g, '').replace(',', '.'));
  }
  return null;
}

function extrairDataEmissao(texto) {
  const padroes = [
    /data da emiss[aã]o\D{0,15}?(\d{2}\/\d{2}\/\d{4})/,
    /emiss[aã]o\D{0,10}?(\d{2}\/\d{2}\/\d{4})/
  ];
  for (const p of padroes) {
    const m = texto.match(p);
    if (m) return m[1];
  }
  return null;
}

// Extrai os dados objetivos do documento (não depende do que o usuário digitou).
function extrairDadosNota(textoOriginal) {
  const texto = normalizarTextoOCR(textoOriginal);

  const chaveAcesso = extrairChaveAcesso(textoOriginal);

  const numeroDetectado = numeroPelaChaveDeAcesso(chaveAcesso) || extrairNumeroPeloTexto(textoOriginal);
  const valorDetectado = extrairValorTotal(texto);
  const dataDetectada = extrairDataEmissao(texto);
  const tipoDocumento = detectarTipoDocumento(texto);

  const listaProibidos = (typeof ITENS_PROIBIDOS !== 'undefined' ? ITENS_PROIBIDOS : ['cerveja', 'cigarro'])
    .map(normalizarTextoOCR);
  const itensDetectados = [...new Set(listaProibidos.filter(item => texto.includes(item)))];

  // Leitura insuficiente: não achou chave, nem número, nem reconheceu nenhum dos
  // 3 tipos de documento fiscal aceitos — não há base para validar a despesa.
  const leituraInsuficiente = !chaveAcesso && !numeroDetectado && tipoDocumento === 'desconhecido' && texto.trim().length < 25;

  return { textoExtraido: textoOriginal, tipoDocumento, chaveAcesso, numeroDetectado, valorDetectado, dataDetectada, itensDetectados, leituraInsuficiente };
}

// Compara os dados objetivos da nota com o que o usuário digitou no formulário.
// `entrada` = { numero, valor (number), data (DD/MM/AAAA), tipo (TIPOS_DESPESA) }
function compararNotaComFormulario(dados, entrada) {
  const soDigitos = s => (s || '').toString().replace(/\D/g, '');
  const numeroDivergente = !!(entrada.numero && dados.numeroDetectado &&
    soDigitos(entrada.numero) !== soDigitos(dados.numeroDetectado));
  const valorDivergente = !!(entrada.valor && dados.valorDetectado != null &&
    Math.abs(entrada.valor - dados.valorDetectado) > 0.01);
  const dataDivergente = !!(entrada.data && dados.dataDetectada &&
    entrada.data !== dados.dataDetectada);
  const { tipoDivergente, tipoTermoConflitante, tipoSugerido } =
    verificarCorrelacaoTipoDespesa(entrada.tipo, normalizarTextoOCR(dados.textoExtraido));
  return { ...dados, numeroDivergente, valorDivergente, dataDivergente, tipoDivergente, tipoTermoConflitante, tipoSugerido };
}

async function analisarNotaFiscal(file, entrada) {
  try {
    const texto = await extrairTextoDeArquivo(file);
    const dados = extrairDadosNota(texto);
    return compararNotaComFormulario(dados, entrada || {});
  } catch (e) {
    return {
      erro: true,
      mensagem: 'Não foi possível ler o documento automaticamente. Confira os dados manualmente.',
      leituraInsuficiente: true,
      itensDetectados: []
    };
  }
}
