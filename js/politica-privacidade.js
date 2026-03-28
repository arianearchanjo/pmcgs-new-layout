/**
 * politica-privacidade.js — Prefeitura de Campina Grande do Sul
 *
 * Funcionalidades:
 *  1. Acessibilidade eMAG — controle de fonte e alto contraste
 *  2. VLibras — widget de Língua Brasileira de Sinais
 *  3. Atalhos de teclado eMAG (Alt+1 / Alt+2 / Alt+3)
 *
 * IDs esperados na sidebar desta página (prefixo pp-sb-*):
 *   pp-sb-fonte-aumentar | pp-sb-fonte-diminuir | pp-sb-fonte-resetar
 *   pp-sb-btn-contraste
 *
 * Obs.: a barra-acessibilidade global já expõe os IDs pi-btn-* via
 * acessibilidade-component.js; aqui vinculamos apenas os controles
 * locais da sidebar desta página.
 */


/* ══════════════════════════════════════════════════════════════
   1. ACESSIBILIDADE eMAG
══════════════════════════════════════════════════════════════ */

(function () {

  /* --- Configurações de fonte --- */
  var FONTE_BASE = 16;
  var FONTE_MIN  = 14;
  var FONTE_MAX  = 22;
  var FONTE_STEP = 2;

  /* --- Chaves de armazenamento (compartilhadas com todo o portal) --- */
  var FONTE_KEY     = 'pmcgs_fontSize';
  var CONTRASTE_KEY = 'pmcgs_highContrast';


  /* ── Fonte ─────────────────────────────────────────────────── */

  function aplicarFonte(px) {
    px = Math.min(FONTE_MAX, Math.max(FONTE_MIN, px));
    document.documentElement.style.fontSize = px + 'px';
    try { localStorage.setItem(FONTE_KEY, px); } catch (e) {}
  }

  function fonteAtual() {
    var fs = document.documentElement.style.fontSize;
    return fs ? parseInt(fs, 10) : FONTE_BASE;
  }

  /* Restaurar fonte salva ao carregar a página */
  (function restaurarFonte() {
    try {
      var salva = parseInt(localStorage.getItem(FONTE_KEY), 10);
      if (salva && salva >= FONTE_MIN && salva <= FONTE_MAX) {
        aplicarFonte(salva);
      }
    } catch (e) {}
  })();


  /* ── Alto contraste ─────────────────────────────────────────── */

  function aplicarContraste(ativo) {
    document.body.classList.toggle('high-contrast', ativo);

    /* Atualiza aria-pressed nos botões da barra global (pi-btn-*)
       e da sidebar local desta página (pp-sb-btn-contraste)        */
    ['pi-btn-contraste', 'pp-sb-btn-contraste'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (btn) btn.setAttribute('aria-pressed', ativo ? 'true' : 'false');
    });

    try { localStorage.setItem(CONTRASTE_KEY, ativo ? '1' : '0'); } catch (e) {}
  }

  /* Restaurar contraste salvo ao carregar a página */
  (function restaurarContraste() {
    try {
      if (localStorage.getItem(CONTRASTE_KEY) === '1') {
        aplicarContraste(true);
      }
    } catch (e) {}
  })();


  /* ── Utilitário bind ────────────────────────────────────────── */

  function bind(id, fn) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', function (e) {
      e.preventDefault();
      fn();
    });
  }


  /* ── Botões da sidebar da política de privacidade (pp-sb-*) ── */

  bind('pp-sb-fonte-aumentar', function () { aplicarFonte(fonteAtual() + FONTE_STEP); });
  bind('pp-sb-fonte-diminuir', function () { aplicarFonte(fonteAtual() - FONTE_STEP); });
  bind('pp-sb-fonte-resetar',  function () { aplicarFonte(FONTE_BASE); });
  bind('pp-sb-btn-contraste',  function () {
    aplicarContraste(!document.body.classList.contains('high-contrast'));
  });

})();


/* ══════════════════════════════════════════════════════════════
   2. VLIBRAS
══════════════════════════════════════════════════════════════ */

if (typeof window.VLibras !== 'undefined') {
  new window.VLibras.Widget('https://vlibras.gov.br/app');
}


/* ══════════════════════════════════════════════════════════════
   3. ATALHOS DE TECLADO eMAG
   Alt+1 → conteúdo principal  (#pp-conteudo)
   Alt+2 → menu de navegação   (#pi-nav-list .nav-link)
   Alt+3 → rodapé              (#pi-footer)
══════════════════════════════════════════════════════════════ */

document.addEventListener('keydown', function (e) {
  if (!e.altKey) return;

  if (e.key === '1' || e.keyCode === 49) {
    e.preventDefault();
    var conteudo = document.getElementById('pp-conteudo');
    if (conteudo) {
      conteudo.setAttribute('tabindex', '-1');
      conteudo.focus();
      conteudo.scrollIntoView({ behavior: 'smooth' });
    }
  }

  if (e.key === '2' || e.keyCode === 50) {
    e.preventDefault();
    var primeiroLink = document.querySelector('#pi-nav-list .nav-link');
    if (primeiroLink) primeiroLink.focus();
  }

  if (e.key === '3' || e.keyCode === 51) {
    e.preventDefault();
    var rodape = document.getElementById('pi-footer');
    if (rodape) rodape.scrollIntoView({ behavior: 'smooth' });
  }
});