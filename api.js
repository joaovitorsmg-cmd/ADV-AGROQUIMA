// ═══════════════════════════════════════════════════════════════════════
// api.js — camada de integração com a API oficial da Agroquima
// ═══════════════════════════════════════════════════════════════════════
// Hoje (API_CONFIG.modo = 'mock') tudo roda localmente no dispositivo, simulando
// o backend, para o app funcionar offline e ser testável sem depender do TI.
//
// Quando a Agroquima (Fernando/TI) disponibilizar a API real:
//   1. Preencha API_CONFIG.baseUrl e API_CONFIG.token (token fornecido pela TI).
//   2. Troque API_CONFIG.modo para 'producao'.
// Nenhuma outra mudança é necessária nas telas — todas chamam AUTH_API/DESPESAS_API,
// que decidem internamente se usam o mock local ou o fetch() real.
//
// IMPORTANTE sobre backup ao reinstalar o app: em modo mock, os dados ficam
// presos ao aparelho (localStorage), por usuário. Restaurar dados em um aparelho
// novo só é possível de fato quando a API real estiver plugada (modo 'producao'),
// pois aí os dados passam a vir do servidor da Agroquima, não do localStorage.
// ═══════════════════════════════════════════════════════════════════════

const API_CONFIG = {
  modo: 'mock', // 'mock' | 'producao'
  baseUrl: '',  // ex: 'https://api.agroquima.com.br/v1'
  token: '',    // token de integração fornecido pela TI da Agroquima
  endpoints: {
    verificarCadastro: '/usuarios/verificar-cadastro',
    criarSenha: '/usuarios/criar-senha',
    login: '/usuarios/login',
    alterarSenha: '/usuarios/alterar-senha',
    dadosUsuario: '/usuarios/dados',
    sincronizarDespesas: '/despesas/sincronizar',
    sincronizarAtividades: '/atividades/sincronizar',
    autorizarFechamento: '/despesas/autorizar-fechamento',
    confirmarFechamentoADV: '/despesas/confirmar-fechamento-adv'
  }
};

function apiAtraso(ms) { return new Promise(r => setTimeout(r, ms)); }

async function apiFetch(caminho, opcoes = {}) {
  const resp = await fetch(API_CONFIG.baseUrl + caminho, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_CONFIG.token}`,
      ...(opcoes.headers || {})
    }
  });
  if (!resp.ok) throw new Error(`Falha na API (${resp.status})`);
  return resp.json();
}

async function sha256Hex(texto) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function normalizarIdentificador(id) {
  return (id || '').trim().toLowerCase();
}

// Remove máscara (pontos/barra/hífen) de CNPJ/CPF mantendo só dígitos; e-mails são
// mantidos como estão (descontado espaço), já que o ponto é parte do endereço.
// Necessário porque o campo de CNPJ/CPF no login aplica máscara automática
// enquanto o fluxo de "Primeiro acesso" aceita o identificador sem máscara —
// sem essa normalização as duas telas gerariam chaves de conta diferentes.
function chaveLimpa(identificador) {
  const id = normalizarIdentificador(identificador);
  return id.includes('@') ? id.replace(/\s+/g, '') : id.replace(/\D/g, '');
}

function chaveContaMock(identificador) {
  return 'agroquima_conta_' + chaveLimpa(identificador);
}

// ─── AUTENTICAÇÃO / CADASTRO ───
const AUTH_API = {
  // Verifica se o identificador (CNPJ/CPF/e-mail) já está pré-cadastrado na base
  // da Agroquima — pré-requisito obrigatório para o usuário poder criar sua própria senha.
  async verificarCadastro(identificador, tipo) {
    if (API_CONFIG.modo === 'producao') {
      return apiFetch(API_CONFIG.endpoints.verificarCadastro, {
        method: 'POST',
        body: JSON.stringify({ identificador, tipo })
      });
    }
    await apiAtraso(500);
    const limpo = chaveLimpa(identificador);
    const preCadastrado = (PRE_CADASTRADOS_DEMO || []).some(p =>
      chaveLimpa(p.identificador) === limpo && p.tipo === tipo
    );
    const jaTemSenha = !!localStorage.getItem(chaveContaMock(identificador));
    return { encontrado: preCadastrado || jaTemSenha, jaTemSenha };
  },

  // Cria a senha/PIN escolhida pelo usuário no primeiro acesso (exige cadastro prévio).
  async criarSenha(identificador, tipo, senha, dadosExtra = {}) {
    if (API_CONFIG.modo === 'producao') {
      return apiFetch(API_CONFIG.endpoints.criarSenha, {
        method: 'POST',
        body: JSON.stringify({ identificador, tipo, senha, ...dadosExtra })
      });
    }
    const verificacao = await this.verificarCadastro(identificador, tipo);
    if (!verificacao.encontrado) {
      throw new Error('Este identificador não está pré-cadastrado na base da Agroquima.');
    }
    const senhaHash = await sha256Hex(senha);
    localStorage.setItem(chaveContaMock(identificador), JSON.stringify({
      identificador, tipo, senhaHash, ...dadosExtra, criadoEm: new Date().toISOString()
    }));
    return { sucesso: true };
  },

  // Login com identificador + senha (todos os perfis).
  async login(identificador, senha, tipo) {
    if (API_CONFIG.modo === 'producao') {
      return apiFetch(API_CONFIG.endpoints.login, {
        method: 'POST',
        body: JSON.stringify({ identificador, senha, tipo })
      });
    }
    await apiAtraso(400);
    const conta = JSON.parse(localStorage.getItem(chaveContaMock(identificador)) || 'null');
    if (!conta) throw new Error('Conta não encontrada. Faça o primeiro acesso para criar sua senha.');
    const senhaHash = await sha256Hex(senha);
    if (senhaHash !== conta.senhaHash) throw new Error('Senha incorreta.');
    return { sucesso: true, perfil: conta };
  },

  async alterarSenha(identificador, senhaAtual, novaSenha) {
    if (API_CONFIG.modo === 'producao') {
      return apiFetch(API_CONFIG.endpoints.alterarSenha, {
        method: 'POST',
        body: JSON.stringify({ identificador, senhaAtual, novaSenha })
      });
    }
    const chave = chaveContaMock(identificador);
    const conta = JSON.parse(localStorage.getItem(chave) || 'null');
    if (!conta) throw new Error('Conta não encontrada.');
    const hashAtual = await sha256Hex(senhaAtual);
    if (hashAtual !== conta.senhaHash) throw new Error('Senha atual incorreta.');
    conta.senhaHash = await sha256Hex(novaSenha);
    localStorage.setItem(chave, JSON.stringify(conta));
    return { sucesso: true };
  }
};

// ─── DADOS (despesas/atividades) — sincronização e backup ───
const DESPESAS_API = {
  // Busca os dados do usuário no servidor (usado para restaurar após reinstalar o app).
  // Em modo mock não há servidor de fato — retorna null, mantendo só o cache local do aparelho.
  async buscarDadosUsuario(identificador) {
    if (API_CONFIG.modo === 'producao') {
      return apiFetch(`${API_CONFIG.endpoints.dadosUsuario}?identificador=${encodeURIComponent(identificador)}`);
    }
    return null;
  },

  async sincronizarDespesas(despesas) {
    if (API_CONFIG.modo === 'producao') {
      return apiFetch(API_CONFIG.endpoints.sincronizarDespesas, {
        method: 'POST',
        body: JSON.stringify({ despesas })
      });
    }
    await apiAtraso(1200);
    return { sucesso: true };
  },

  // Registra a autorização do usuário do app para o fechamento da despesa no Intra.
  // O bloqueio efetivo (impedir o Intra de fechar sem essa autorização) precisa ser
  // implementado no backend/Intra quando a API real estiver disponível — o app só
  // registra e expõe esse consentimento.
  async autorizarFechamento(despesaId, identificador) {
    if (API_CONFIG.modo === 'producao') {
      return apiFetch(API_CONFIG.endpoints.autorizarFechamento, {
        method: 'POST',
        body: JSON.stringify({ despesaId, identificador })
      });
    }
    await apiAtraso(400);
    return { sucesso: true };
  },

  // Registra a confirmação digital (clique + hash do resumo) do usuário validando
  // o fechamento do ADV após o administrativo concluir a análise no Intra.
  async confirmarFechamentoADV(identificador, hashResumo) {
    if (API_CONFIG.modo === 'producao') {
      return apiFetch(API_CONFIG.endpoints.confirmarFechamentoADV, {
        method: 'POST',
        body: JSON.stringify({ identificador, hashResumo })
      });
    }
    await apiAtraso(400);
    return { sucesso: true };
  }
};
