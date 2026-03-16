/**
 * JS — Unidade de Saúde Municipal
 * Prefeitura de Campina Grande do Sul
 *
 * Arquivo isolado: não depende de nenhum outro JS do site.
 *
 * 1. Acessibilidade eMAG (fonte + alto contraste)
 * 2. Sistema de abas
 * 3. VLibras
 * 4. Atalhos de teclado eMAG (Alt+1 / Alt+2 / Alt+3)
 */

// ── 1. ACESSIBILIDADE eMAG ─────────────────────────────────────────────
(function () {
  var FONTE_BASE = 16, FONTE_MIN = 14, FONTE_MAX = 22, FONTE_STEP = 2;
  var FONTE_KEY = 'pmcgs_fontSize', CONTRASTE_KEY = 'pmcgs_highContrast';

  function aplicarFonte(px) {
    px = Math.min(FONTE_MAX, Math.max(FONTE_MIN, px));
    document.documentElement.style.fontSize = px + 'px';
    try { localStorage.setItem(FONTE_KEY, px); } catch (e) {}
  }

  function fonteAtual() {
    var fs = document.documentElement.style.fontSize;
    return fs ? parseInt(fs, 10) : FONTE_BASE;
  }

  (function () {
    try {
      var s = parseInt(localStorage.getItem(FONTE_KEY), 10);
      if (s && s >= FONTE_MIN && s <= FONTE_MAX) aplicarFonte(s);
    } catch (e) {}
  })();

  function aplicarContraste(ativo) {
    document.body.classList.toggle('high-contrast', ativo);
    var b = document.getElementById('pi-btn-contraste');
    if (b) b.setAttribute('aria-pressed', ativo ? 'true' : 'false');
    try { localStorage.setItem(CONTRASTE_KEY, ativo ? '1' : '0'); } catch (e) {}
  }

  (function () {
    try {
      if (localStorage.getItem(CONTRASTE_KEY) === '1') aplicarContraste(true);
    } catch (e) {}
  })();

  function bind(id, fn) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', function (e) { e.preventDefault(); fn(); });
  }

  bind('pi-btn-fonte-aumentar', function () { aplicarFonte(fonteAtual() + FONTE_STEP); });
  bind('pi-btn-fonte-diminuir', function () { aplicarFonte(fonteAtual() - FONTE_STEP); });
  bind('pi-btn-fonte-resetar',  function () { aplicarFonte(FONTE_BASE); });
  bind('pi-btn-contraste',      function () { aplicarContraste(!document.body.classList.contains('high-contrast')); });
})();


// ── 2. SISTEMA DE ABAS ────────────────────────────────────────────────
(function () {
  var botoes  = document.querySelectorAll('.sec-tab-btn');
  var paineis = document.querySelectorAll('.sec-tab-painel');

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


// ── 3. VLIBRAS ────────────────────────────────────────────────────────
if (typeof window.VLibras !== 'undefined') {
  new window.VLibras.Widget('https://vlibras.gov.br/app');
}


// ── 4. ATALHOS DE TECLADO eMAG ────────────────────────────────────────
document.addEventListener('keydown', function (e) {
  if (!e.altKey) return;

  if (e.key === '1' || e.keyCode === 49) {
    e.preventDefault();
    var el = document.getElementById('pi-conteudo');
    if (el) { el.setAttribute('tabindex', '-1'); el.focus(); el.scrollIntoView({ behavior: 'smooth' }); }
  }

  if (e.key === '2' || e.keyCode === 50) {
    e.preventDefault();
    var el = document.querySelector('#pi-nav-list .nav-link');
    if (el) el.focus();
  }

  if (e.key === '3' || e.keyCode === 51) {
    e.preventDefault();
    var el = document.getElementById('pi-footer');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
});