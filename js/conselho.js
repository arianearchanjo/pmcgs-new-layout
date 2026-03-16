/**
 * conselho.js — Template de Páginas de Conselhos Municipais
 * Prefeitura de Campina Grande do Sul – PR
 *
 * Módulos:
 *   1. Navegação de abas (tabs com ARIA)
 *   2. Acordeon de arquivos (ARIA)
 *   3. Botão "Voltar ao topo"
 *   4. Acessibilidade — controle de fonte e contraste (eMAG)
 *   5. Atalhos de teclado (eMAG: Alt+1, Alt+2, Alt+3)
 *   6. Inicialização
 */

(function () {
  'use strict';


  /* ══════════════════════════════════════════════════════════════════════
     1. NAVEGAÇÃO DE ABAS
     Gerencia a troca de painéis com suporte a ARIA e navegação
     por teclado (setas esquerda/direita conforme WAI-ARIA Authoring).
  ════════════════════════════════════════════════════════════════════════ */

  function inicializarAbas() {
    var nav    = document.querySelector('.cn-abas-nav');
    if (!nav) return;

    var botoes = nav.querySelectorAll('.cn-aba-btn');

    botoes.forEach(function (btn) {
      btn.addEventListener('click', function () {
        ativarAba(btn, botoes);
      });

      /* Navegação por teclado: setas + Home + End */
      btn.addEventListener('keydown', function (e) {
        var idx = Array.prototype.indexOf.call(botoes, btn);

        if (e.key === 'ArrowRight' || e.keyCode === 39) {
          e.preventDefault();
          var prox = botoes[(idx + 1) % botoes.length];
          prox.focus();
          ativarAba(prox, botoes);
        }

        if (e.key === 'ArrowLeft' || e.keyCode === 37) {
          e.preventDefault();
          var ant = botoes[(idx - 1 + botoes.length) % botoes.length];
          ant.focus();
          ativarAba(ant, botoes);
        }

        if (e.key === 'Home') {
          e.preventDefault();
          botoes[0].focus();
          ativarAba(botoes[0], botoes);
        }

        if (e.key === 'End') {
          e.preventDefault();
          botoes[botoes.length - 1].focus();
          ativarAba(botoes[botoes.length - 1], botoes);
        }
      });
    });
  }

  /**
   * Ativa a aba clicada e exibe o painel correspondente.
   * Desativa todas as outras abas e oculta seus painéis.
   *
   * @param {HTMLElement} abaAtiva  — botão da aba a ativar
   * @param {NodeList}    todosBtns — todos os botões da navegação
   */
  function ativarAba(abaAtiva, todosBtns) {
    todosBtns.forEach(function (btn) {
      var painel = document.getElementById(btn.getAttribute('aria-controls'));
      var esteAtivo = btn === abaAtiva;

      btn.classList.toggle('cn-aba-ativa', esteAtivo);
      btn.setAttribute('aria-selected', esteAtivo ? 'true' : 'false');
      btn.setAttribute('tabindex', esteAtivo ? '0' : '-1');

      if (painel) {
        if (esteAtivo) {
          painel.removeAttribute('hidden');
          painel.classList.add('cn-painel-ativo');
        } else {
          painel.setAttribute('hidden', '');
          painel.classList.remove('cn-painel-ativo');
        }
      }
    });
  }


  /* ══════════════════════════════════════════════════════════════════════
     2. ACORDEON DE ARQUIVOS
     Abre/fecha cada bloco de arquivos ao clicar no botão.
     Suporte a ARIA (aria-expanded) e animação de ícone.
  ════════════════════════════════════════════════════════════════════════ */

  function inicializarAcordeon() {
    var botoes = document.querySelectorAll('.cn-acordeon-btn');

    botoes.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idCorpo  = btn.getAttribute('aria-controls');
        var corpo    = document.getElementById(idCorpo);
        var aberto   = btn.getAttribute('aria-expanded') === 'true';

        if (!corpo) return;

        if (aberto) {
          /* Fechar */
          btn.setAttribute('aria-expanded', 'false');
          corpo.setAttribute('hidden', '');
        } else {
          /* Abrir */
          btn.setAttribute('aria-expanded', 'true');
          corpo.removeAttribute('hidden');
        }
      });
    });
  }


  /* ══════════════════════════════════════════════════════════════════════
     3. BOTÃO "VOLTAR AO TOPO"
     Aparece após rolar 300px. Ao clicar, retorna suavemente ao início.
  ════════════════════════════════════════════════════════════════════════ */

  function inicializarBtnTopo() {
    var btn = document.getElementById('cn-btn-topo');
    if (!btn) return;

    /* Exibe/oculta conforme posição do scroll */
    window.addEventListener('scroll', function () {
      if (window.pageYOffset > 300) {
        btn.classList.add('cn-btn-topo-visivel');
      } else {
        btn.classList.remove('cn-btn-topo-visivel');
      }
    }, { passive: true });

    /* Rola ao topo ao clicar */
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  /* ══════════════════════════════════════════════════════════════════════
     4. ACESSIBILIDADE — Controle de fonte e contraste (eMAG)
     Reutiliza as mesmas chaves de localStorage do restante do portal,
     garantindo que as preferências persistam entre páginas.
  ════════════════════════════════════════════════════════════════════════ */

  var FONTE_BASE = 16;
  var FONTE_MIN  = 14;
  var FONTE_MAX  = 22;
  var FONTE_STEP = 2;

  var FONTE_KEY     = 'pmcgs_fontSize';
  var CONTRASTE_KEY = 'pmcgs_highContrast';

  /**
   * Aplica o tamanho de fonte ao elemento <html>.
   * @param {number} px
   */
  function aplicarFonte(px) {
    px = Math.min(FONTE_MAX, Math.max(FONTE_MIN, px));
    document.documentElement.style.fontSize = px + 'px';
    try { localStorage.setItem(FONTE_KEY, px); } catch (e) {}
  }

  /**
   * Retorna o tamanho de fonte atual em px.
   * @returns {number}
   */
  function fonteAtual() {
    var fs = document.documentElement.style.fontSize;
    return fs ? parseInt(fs, 10) : FONTE_BASE;
  }

  /**
   * Ativa ou desativa o modo de alto contraste.
   * Sincroniza o atributo aria-pressed no botão da barra superior.
   * @param {boolean} ativo
   */
  function aplicarContraste(ativo) {
    document.body.classList.toggle('high-contrast', ativo);
    var btn = document.getElementById('pi-btn-contraste');
    if (btn) btn.setAttribute('aria-pressed', ativo ? 'true' : 'false');
    try { localStorage.setItem(CONTRASTE_KEY, ativo ? '1' : '0'); } catch (e) {}
  }

  /**
   * Restaura as preferências salvas pelo usuário ao carregar a página.
   */
  function restaurarPreferencias() {
    try {
      var fonteS = parseInt(localStorage.getItem(FONTE_KEY), 10);
      if (fonteS && fonteS >= FONTE_MIN && fonteS <= FONTE_MAX) {
        aplicarFonte(fonteS);
      }
      if (localStorage.getItem(CONTRASTE_KEY) === '1') {
        aplicarContraste(true);
      }
    } catch (e) {}
  }

  /**
   * Utilitário: vincula um clique a um elemento pelo ID.
   * @param {string}   id — ID do elemento
   * @param {Function} fn — callback
   */
  function bind(id, fn) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', function (e) {
      e.preventDefault();
      fn();
    });
  }

  function inicializarAcessibilidade() {
    restaurarPreferencias();

    bind('pi-btn-fonte-aumentar', function () { aplicarFonte(fonteAtual() + FONTE_STEP); });
    bind('pi-btn-fonte-diminuir', function () { aplicarFonte(fonteAtual() - FONTE_STEP); });
    bind('pi-btn-fonte-resetar',  function () { aplicarFonte(FONTE_BASE); });
    bind('pi-btn-contraste', function () {
      aplicarContraste(!document.body.classList.contains('high-contrast'));
    });
  }


  /* ══════════════════════════════════════════════════════════════════════
     5. ATALHOS DE TECLADO (eMAG)
     Alt+1 → conteúdo principal
     Alt+2 → primeiro item do menu de navegação
     Alt+3 → rodapé
  ════════════════════════════════════════════════════════════════════════ */

  document.addEventListener('keydown', function (e) {
    if (!e.altKey) return;

    /* Alt+1 — conteúdo principal */
    if (e.key === '1' || e.keyCode === 49) {
      e.preventDefault();
      var conteudo = document.getElementById('cn-conteudo');
      if (conteudo) {
        conteudo.setAttribute('tabindex', '-1');
        conteudo.focus();
        conteudo.scrollIntoView({ behavior: 'smooth' });
      }
    }

    /* Alt+2 — primeiro item do menu de navegação */
    if (e.key === '2' || e.keyCode === 50) {
      e.preventDefault();
      var primeiroLink = document.querySelector('#pi-nav-list .nav-link');
      if (primeiroLink) primeiroLink.focus();
    }

    /* Alt+3 — rodapé */
    if (e.key === '3' || e.keyCode === 51) {
      e.preventDefault();
      var rodape = document.getElementById('pi-footer');
      if (rodape) rodape.scrollIntoView({ behavior: 'smooth' });
    }
  });


  /* ══════════════════════════════════════════════════════════════════════
     6. INICIALIZAÇÃO
     Aguarda o DOM estar pronto antes de executar todos os módulos.
  ════════════════════════════════════════════════════════════════════════ */

  document.addEventListener('DOMContentLoaded', function () {
    inicializarAbas();
    inicializarAcordeon();
    inicializarBtnTopo();
    inicializarAcessibilidade();
  });

})();


/* ══════════════════════════════════════════════════════════════════════
   VLibras — inicialização do widget de tradução para Libras
   O script vlibras-plugin.js deve ser carregado antes deste arquivo.
════════════════════════════════════════════════════════════════════════ */
if (typeof window.VLibras !== 'undefined') {
  new window.VLibras.Widget('https://vlibras.gov.br/app');
}