/**
 * secretarias.js — Prefeitura de Campina Grande do Sul
 *
 * Funcionalidades:
 *  1. Acessibilidade eMAG — controle de fonte e alto contraste
 *  2. Sistema de abas (tabs) com suporte a teclado
 *  3. VLibras — widget de Língua Brasileira de Sinais
 *  4. Atalhos de teclado eMAG (Alt+1 / Alt+2 / Alt+3)
 */


/* ══════════════════════════════════════════════════════════════
   1. ACESSIBILIDADE eMAG
   Gerencia o tamanho da fonte e o modo de alto contraste.
   Os valores são persistidos no localStorage entre sessões.
══════════════════════════════════════════════════════════════ */

(function () {

  /* --- Configurações de fonte --- */
  var FONTE_BASE = 16; // tamanho padrão em px
  var FONTE_MIN  = 14; // menor tamanho permitido
  var FONTE_MAX  = 22; // maior tamanho permitido
  var FONTE_STEP = 2;  // incremento/decremento por clique

  /* --- Chaves de armazenamento --- */
  var FONTE_KEY     = 'pmcgs_fontSize';
  var CONTRASTE_KEY = 'pmcgs_highContrast';


  /* ── Funções de fonte ─────────────────────────────────────── */

  /**
   * Aplica o tamanho de fonte ao elemento <html>.
   * Garante que o valor fique dentro dos limites (min/max).
   * @param {number} px - Tamanho desejado em pixels
   */
  function aplicarFonte(px) {
    px = Math.min(FONTE_MAX, Math.max(FONTE_MIN, px));
    document.documentElement.style.fontSize = px + 'px';
    try {
      localStorage.setItem(FONTE_KEY, px);
    } catch (e) {
      // localStorage indisponível (modo privado ou bloqueado)
    }
  }

  /**
   * Retorna o tamanho de fonte atual em pixels.
   * @returns {number}
   */
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
    } catch (e) {
      // localStorage indisponível
    }
  })();


  /* ── Funções de alto contraste ────────────────────────────── */

  /**
   * Ativa ou desativa o modo de alto contraste.
   * Adiciona/remove a classe .high-contrast no <body>
   * e atualiza aria-pressed nos botões de contraste.
   * @param {boolean} ativo
   */
  function aplicarContraste(ativo) {
    document.body.classList.toggle('high-contrast', ativo);

    // Atualizar aria-pressed nos botões (barra superior + sidebar)
    ['pi-btn-contraste', 'pi-sb-btn-contraste'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (btn) {
        btn.setAttribute('aria-pressed', ativo ? 'true' : 'false');
      }
    });

    try {
      localStorage.setItem(CONTRASTE_KEY, ativo ? '1' : '0');
    } catch (e) {
      // localStorage indisponível
    }
  }

  /* Restaurar contraste salvo ao carregar a página */
  (function restaurarContraste() {
    try {
      if (localStorage.getItem(CONTRASTE_KEY) === '1') {
        aplicarContraste(true);
      }
    } catch (e) {
      // localStorage indisponível
    }
  })();


  /* ── Utilitário: vincular evento de clique por ID ─────────── */

  /**
   * Adiciona listener de clique a um elemento pelo ID.
   * Previne o comportamento padrão (útil para links com href="#").
   * @param {string} id - ID do elemento
   * @param {Function} fn - Função a executar no clique
   */
  function bind(id, fn) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', function (e) {
      e.preventDefault();
      fn();
    });
  }


  /* ── Botões da barra superior ─────────────────────────────── */

  bind('pi-btn-fonte-aumentar', function () {
    aplicarFonte(fonteAtual() + FONTE_STEP);
  });

  bind('pi-btn-fonte-diminuir', function () {
    aplicarFonte(fonteAtual() - FONTE_STEP);
  });

  bind('pi-btn-fonte-resetar', function () {
    aplicarFonte(FONTE_BASE);
  });

  bind('pi-btn-contraste', function () {
    aplicarContraste(!document.body.classList.contains('high-contrast'));
  });


  /* ── Botões da sidebar ────────────────────────────────────── */

  bind('pi-sb-fonte-aumentar', function () {
    aplicarFonte(fonteAtual() + FONTE_STEP);
  });

  bind('pi-sb-fonte-diminuir', function () {
    aplicarFonte(fonteAtual() - FONTE_STEP);
  });

  bind('pi-sb-fonte-resetar', function () {
    aplicarFonte(FONTE_BASE);
  });

  bind('pi-sb-btn-contraste', function () {
    aplicarContraste(!document.body.classList.contains('high-contrast'));
  });

})();


/* ══════════════════════════════════════════════════════════════
   2. SISTEMA DE ABAS (TABS)
   Controla a troca de painéis via clique ou teclado.
   Segue o padrão ARIA: role="tab", aria-selected, aria-controls.
══════════════════════════════════════════════════════════════ */

(function () {

  var botoes  = document.querySelectorAll('.sec-tab-btn');
  var paineis = document.querySelectorAll('.sec-tab-painel');

  /**
   * Ativa a aba correspondente ao botão clicado.
   * Desativa todas as outras abas e oculta seus painéis.
   * @param {HTMLElement} btnAtivo - Botão da aba a ativar
   */
  function ativarAba(btnAtivo) {
    var alvo = btnAtivo.getAttribute('aria-controls');

    // Desativar todas as abas
    botoes.forEach(function (btn) {
      btn.classList.remove('ativo');
      btn.setAttribute('aria-selected', 'false');
    });

    // Ocultar todos os painéis
    paineis.forEach(function (painel) {
      painel.classList.remove('ativo');
    });

    // Ativar a aba e o painel selecionados
    btnAtivo.classList.add('ativo');
    btnAtivo.setAttribute('aria-selected', 'true');

    var painelAtivo = document.getElementById(alvo);
    if (painelAtivo) {
      painelAtivo.classList.add('ativo');
    }
  }

  /* Vincular eventos a cada botão de aba */
  botoes.forEach(function (btn) {

    // Clique do mouse
    btn.addEventListener('click', function () {
      ativarAba(btn);
    });

    // Suporte a teclado: Enter e Espaço ativam a aba (WCAG 2.1.1)
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        ativarAba(btn);
      }
    });

  });

})();


/* ══════════════════════════════════════════════════════════════
   3. VLIBRAS
   Inicializa o widget de tradução para Língua Brasileira de
   Sinais, fornecido pelo Governo Federal.
   O script vlibras-plugin.js deve ser carregado antes deste.
══════════════════════════════════════════════════════════════ */

if (typeof window.VLibras !== 'undefined') {
  new window.VLibras.Widget('https://vlibras.gov.br/app');
}


/* ══════════════════════════════════════════════════════════════
   4. ATALHOS DE TECLADO eMAG
   Padrão de acessibilidade do governo brasileiro (eMAG 3.1):

   Alt+1 → Ir para o conteúdo principal
   Alt+2 → Ir para o menu de navegação
   Alt+3 → Ir para o rodapé
══════════════════════════════════════════════════════════════ */

document.addEventListener('keydown', function (e) {
  if (!e.altKey) return;

  /* Alt+1 — foca e rola até o conteúdo principal */
  if (e.key === '1' || e.keyCode === 49) {
    e.preventDefault();
    var conteudo = document.getElementById('pi-conteudo');
    if (conteudo) {
      conteudo.setAttribute('tabindex', '-1');
      conteudo.focus();
      conteudo.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /* Alt+2 — foca o primeiro item do menu de navegação */
  if (e.key === '2' || e.keyCode === 50) {
    e.preventDefault();
    var primeiroLink = document.querySelector('#pi-nav-list .nav-link');
    if (primeiroLink) {
      primeiroLink.focus();
    }
  }

  /* Alt+3 — rola até o rodapé */
  if (e.key === '3' || e.keyCode === 51) {
    e.preventDefault();
    var rodape = document.getElementById('pi-footer');
    if (rodape) {
      rodape.scrollIntoView({ behavior: 'smooth' });
    }
  }

});