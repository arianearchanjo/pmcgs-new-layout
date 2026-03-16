'use strict';

/**
 * JS — Portal Prefeitura de Campina Grande do Sul
 * Formulários Institucionais
 *
 * Arquivo isolado: não depende de nenhum outro JS do site.
 *
 * 1. Acessibilidade eMAG (fonte + alto contraste)
 * 2. Sistema de abas
 * 3. VLibras
 * 4. Atalhos de teclado eMAG (Alt+1 / Alt+2 / Alt+3)
 * 5. Upload — exibição do nome do arquivo
 * 6. Validação do formulário
 * 7. Limpeza de erros ao digitar
 * 8. Máscara CPF
 * 9. Máscara CEP
 * 10. Máscaras de telefone
 */


// ── 1. ACESSIBILIDADE eMAG ─────────────────────────────────────────────
(function () {
  var FONTE_BASE = 16, FONTE_MIN = 14, FONTE_MAX = 22, FONTE_STEP = 2;
  var FONTE_KEY = 'pmcgs_fontSize', CONTRASTE_KEY = 'pmcgs_highContrast';

  /** Aplica tamanho de fonte ao <html>, limitando entre FONTE_MIN e FONTE_MAX. */
  function aplicarFonte(px) {
    px = Math.min(FONTE_MAX, Math.max(FONTE_MIN, px));
    document.documentElement.style.fontSize = px + 'px';
    try { localStorage.setItem(FONTE_KEY, px); } catch (e) {}
  }

  /** Retorna o tamanho de fonte atual em px (ou FONTE_BASE como fallback). */
  function fonteAtual() {
    var fs = document.documentElement.style.fontSize;
    return fs ? parseInt(fs, 10) : FONTE_BASE;
  }

  /** Restaura fonte salva no localStorage ao carregar a página. */
  (function restaurarFonte() {
    try {
      var s = parseInt(localStorage.getItem(FONTE_KEY), 10);
      if (s && s >= FONTE_MIN && s <= FONTE_MAX) aplicarFonte(s);
    } catch (e) {}
  })();

  /**
   * Ativa ou desativa o alto contraste.
   * Atualiza a classe no <body>, os botões da barra e da sidebar,
   * e persiste a preferência no localStorage.
   * @param {boolean} ativo
   */
  function aplicarContraste(ativo) {
    document.body.classList.toggle('high-contrast', ativo);
    ['pi-btn-contraste', 'pi-sb-btn-contraste'].forEach(function (id) {
      var b = document.getElementById(id);
      if (b) b.setAttribute('aria-pressed', ativo ? 'true' : 'false');
    });
    try { localStorage.setItem(CONTRASTE_KEY, ativo ? '1' : '0'); } catch (e) {}
  }

  /** Restaura contraste salvo no localStorage ao carregar a página. */
  (function restaurarContraste() {
    try {
      if (localStorage.getItem(CONTRASTE_KEY) === '1') aplicarContraste(true);
    } catch (e) {}
  })();

  /**
   * Associa um handler de clique a um elemento pelo ID.
   * @param {string}   id
   * @param {Function} fn
   */
  function bind(id, fn) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', function (e) { e.preventDefault(); fn(); });
  }

  // Barra superior
  bind('pi-btn-fonte-aumentar', function () { aplicarFonte(fonteAtual() + FONTE_STEP); });
  bind('pi-btn-fonte-diminuir', function () { aplicarFonte(fonteAtual() - FONTE_STEP); });
  bind('pi-btn-fonte-resetar',  function () { aplicarFonte(FONTE_BASE); });
  bind('pi-btn-contraste',      function () { aplicarContraste(!document.body.classList.contains('high-contrast')); });

  // Sidebar
  bind('pi-sb-fonte-aumentar',  function () { aplicarFonte(fonteAtual() + FONTE_STEP); });
  bind('pi-sb-fonte-diminuir',  function () { aplicarFonte(fonteAtual() - FONTE_STEP); });
  bind('pi-sb-fonte-resetar',   function () { aplicarFonte(FONTE_BASE); });
  bind('pi-sb-btn-contraste',   function () { aplicarContraste(!document.body.classList.contains('high-contrast')); });
})();


// ── 2. SISTEMA DE ABAS ────────────────────────────────────────────────
(function () {
  var botoes  = document.querySelectorAll('.sec-tab-btn');
  var paineis = document.querySelectorAll('.sec-tab-painel');

  if (!botoes.length) return; /* Não é uma página com abas — encerra */

  botoes.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var alvo = btn.getAttribute('aria-controls');

      botoes.forEach(function (b) {
        b.classList.remove('ativo');
        b.setAttribute('aria-selected', 'false');
      });
      paineis.forEach(function (p) { p.classList.remove('ativo'); });

      btn.classList.add('ativo');
      btn.setAttribute('aria-selected', 'true');
      var painel = document.getElementById(alvo);
      if (painel) painel.classList.add('ativo');
    });

    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
    });
  });
})();


// ── 3. VLIBRAS ─────────────────────────────────────────────────────────
if (typeof window.VLibras !== 'undefined') {
  new window.VLibras.Widget('https://vlibras.gov.br/app');
}


// ── 4. ATALHOS DE TECLADO eMAG (Alt+1 / Alt+2 / Alt+3) ────────────────
document.addEventListener('keydown', function (e) {
  if (!e.altKey) return;

  var el;

  // Alt+1 → conteúdo principal
  if (e.key === '1' || e.keyCode === 49) {
    e.preventDefault();
    el = document.getElementById('pi-conteudo');
    if (el) { el.setAttribute('tabindex', '-1'); el.focus(); el.scrollIntoView({ behavior: 'smooth' }); }
  }

  // Alt+2 → menu principal
  if (e.key === '2' || e.keyCode === 50) {
    e.preventDefault();
    el = document.querySelector('#pi-nav-list .nav-link');
    if (el) el.focus();
  }

  // Alt+3 → rodapé
  if (e.key === '3' || e.keyCode === 51) {
    e.preventDefault();
    el = document.getElementById('pi-footer');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
});


// ── 5. UPLOAD — exibição do nome do arquivo ────────────────────────────
(function () {
  var input = document.getElementById('anexo-input');
  if (!input) return;

  /** Atualiza o texto exibido abaixo do campo de upload. */
  input.addEventListener('change', function () {
    var wrap = document.getElementById('nome-arquivo');
    if (!wrap) return;
    if (this.files && this.files[0]) {
      wrap.textContent = '📎 ' + this.files[0].name;
      wrap.style.display = 'block';
    } else {
      wrap.textContent = '';
      wrap.style.display = 'none';
    }
  });
})();


// ── 6. VALIDAÇÃO DO FORMULÁRIO ─────────────────────────────────────────
(function () {
  var form = document.getElementById('pi-form-ouvidoria');
  if (!form) return;

  /** IDs dos campos obrigatórios, na ordem de leitura do formulário. */
  var camposObrigatorios = [
    'assunto',
    'nome',
    'cpf',
    'email',
    'celular',
    'cep',
    'logradouro',
    'numero',
    'bairro',
    'cidade',
    'area',
    'titulo-solicitacao',
    'descricao'
  ];

  /** Marca o campo e seu .form-group com estado de erro. */
  function marcarErro(el) {
    var grp = el.closest('.form-group');
    if (!grp) return;
    grp.classList.add('has-error');
    el.classList.add('input-error');
    el.classList.remove('input-success');
  }

  /** Remove o estado de erro e marca sucesso no campo. */
  function marcarSucesso(el) {
    var grp = el.closest('.form-group');
    if (!grp) return;
    grp.classList.remove('has-error');
    el.classList.remove('input-error');
    el.classList.add('input-success');
  }

  /**
   * Exibe a mensagem de feedback (sucesso ou erro) no topo do formulário.
   * @param {'sucesso'|'erro'} tipo
   * @param {string}           mensagem
   */
  function exibirFeedback(tipo, mensagem) {
    var fb = document.getElementById('form-feedback');
    if (!fb) return;
    fb.className = 'form-alert ' + (tipo === 'sucesso' ? 'alert-success' : 'alert-error');
    fb.style.display = 'block';
    fb.textContent = mensagem;
    fb.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var valido = true;

    camposObrigatorios.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (!el.value.trim()) {
        marcarErro(el);
        valido = false;
      } else {
        marcarSucesso(el);
      }
    });

    if (!valido) {
      exibirFeedback('erro', '⚠️ Por favor, preencha todos os campos obrigatórios antes de enviar.');
    } else {
      exibirFeedback('sucesso', '✅ Manifestação enviada com sucesso! Você receberá uma confirmação por e-mail.');
      form.reset();
      form.querySelectorAll('.input-success').forEach(function (el) {
        el.classList.remove('input-success');
      });
    }
  });
})();


// ── 7. LIMPEZA DE ERROS AO DIGITAR ────────────────────────────────────
(function () {
  var form = document.getElementById('pi-form-ouvidoria');
  if (!form) return;

  form.querySelectorAll('.form-control').forEach(function (el) {
    /** Remove o estado de erro assim que o usuário começa a corrigir o campo. */
    el.addEventListener('input', function () {
      if (!this.value.trim()) return;
      var grp = this.closest('.form-group');
      if (grp) grp.classList.remove('has-error');
      this.classList.remove('input-error');
    });
  });
})();


// ── 8. MÁSCARA CPF ─────────────────────────────────────────────────────
(function () {
  var cpf = document.getElementById('cpf');
  if (!cpf) return;

  /** Formata a entrada como 000.000.000-00 em tempo real. */
  cpf.addEventListener('input', function () {
    var v = this.value.replace(/\D/g, '').substring(0, 11);
    v = v.replace(/(\d{3})(\d)/,       '$1.$2')
         .replace(/(\d{3})(\d)/,       '$1.$2')
         .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    this.value = v;
  });
})();


// ── 9. MÁSCARA CEP ─────────────────────────────────────────────────────
(function () {
  var cep = document.getElementById('cep');
  if (!cep) return;

  /** Formata a entrada como 00000-000 em tempo real. */
  cep.addEventListener('input', function () {
    var v = this.value.replace(/\D/g, '').substring(0, 8);
    this.value = v.replace(/(\d{5})(\d)/, '$1-$2');
  });
})();


// ── 10. MÁSCARAS DE TELEFONE ───────────────────────────────────────────
(function () {
  /**
   * Aplica máscara de telefone a um campo pelo ID.
   * Detecta automaticamente se é celular (9 dígitos) ou fixo (8 dígitos).
   * @param {string} id
   */
  function mascaraTelefone(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', function () {
      var v = this.value.replace(/\D/g, '').substring(0, 11);
      if (v.length <= 10) {
        // Fixo: (41) 0000-0000
        v = v.replace(/(\d{2})(\d)/,      '($1) $2')
             .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
      } else {
        // Celular: (41) 00000-0000
        v = v.replace(/(\d{2})(\d)/,      '($1) $2')
             .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
      }
      this.value = v;
    });
  }

  mascaraTelefone('telefone-fixo');
  mascaraTelefone('celular');
})();