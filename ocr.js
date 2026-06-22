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
  return (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
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

// Analisa o texto extraído da nota: chave de acesso (NF-e), número da nota,
// itens proibidos (ex.: cerveja, cigarro) e confiança geral da leitura.
function analisarTextoNota(textoOriginal, numeroNFInformado) {
  const texto = normalizarTextoOCR(textoOriginal);
  const apenasDigitos = texto.replace(/[^\d]/g, '');

  // Chave de acesso da NF-e: 44 dígitos consecutivos
  const matchChave = apenasDigitos.match(/\d{44}/);
  const chaveAcesso = matchChave ? matchChave[0] : null;

  // Número da nota: padrões comuns "nº 1234", "n 1234", "numero 1234", "nf-e 1234"
  const matchNumero = texto.match(/(?:n[ºo°.]?\s*|numero\s*|nf-?e\s*)(\d{2,9})/);
  const numeroDetectado = matchNumero ? matchNumero[1] : null;

  // Itens proibidos (lista vem de dados-brasil.js)
  const listaProibidos = (typeof ITENS_PROIBIDOS !== 'undefined' ? ITENS_PROIBIDOS : ['cerveja', 'cigarro'])
    .map(normalizarTextoOCR);
  const itensDetectados = [...new Set(listaProibidos.filter(item => texto.includes(item)))];

  // Leitura insuficiente: nem chave, nem número, nem texto reconhecível o bastante
  const leituraInsuficiente = !chaveAcesso && !numeroDetectado && texto.trim().length < 25;

  // Divergência entre o número digitado pelo usuário e o identificado na nota
  const numeroDivergente = !!(numeroNFInformado && numeroDetectado &&
    numeroNFInformado.replace(/\D/g, '') !== numeroDetectado.replace(/\D/g, ''));

  return {
    textoExtraido: textoOriginal,
    chaveAcesso,
    numeroDetectado,
    itensDetectados,
    leituraInsuficiente,
    numeroDivergente
  };
}

async function analisarNotaFiscal(file, numeroNFInformado) {
  try {
    const texto = await extrairTextoDeArquivo(file);
    return analisarTextoNota(texto, numeroNFInformado);
  } catch (e) {
    return {
      erro: true,
      mensagem: 'Não foi possível ler o documento automaticamente. Confira os dados manualmente.',
      leituraInsuficiente: true,
      itensDetectados: []
    };
  }
}
