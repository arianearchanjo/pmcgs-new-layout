/**
 * acessibilidade-component.js — Barra de Acessibilidade (Web Component unificado)
 * Prefeitura de Campina Grande do Sul – PR
 *
 * Este arquivo substitui os dois arquivos anteriores:
 *   - acessibilidade-component.js  (estrutura HTML da barra)
 *   - acessibilidade.js            (lógica de fonte, contraste, VLibras, atalhos)
 *
 * Uso em qualquer página:
 *   1. Carregue este arquivo:  <script src="path/to/acessibilidade-component.js" defer></script>
 *   2. Use a tag no HTML:      <barra-acessibilidade></barra-acessibilidade>
 *
 * Módulos internos:
 *   1. Controle de Fonte (eMAG)
 *   2. Alto Contraste (eMAG)
 *   3. VLibras
 *   4. Atalhos de Teclado (eMAG) — Alt+1, Alt+2, Alt+3
 */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════════════════
     CONFIGURAÇÕES GLOBAIS
  ════════════════════════════════════════════════════════════════════════ */

  var FONTE_BASE = 16;
  var FONTE_MIN  = 14;
  var FONTE_MAX  = 22;
  var FONTE_STEP = 2;

  // Chaves compartilhadas com outros scripts do portal (ex: script.js da home)
  var FONTE_KEY     = 'pmcgs_fontSize';
  var CONTRASTE_KEY = 'pmcgs_highContrast';


  /* ══════════════════════════════════════════════════════════════════════
     1. CONTROLE DE FONTE
  ════════════════════════════════════════════════════════════════════════ */

  function aplicarFonte(px) {
    px = Math.min(FONTE_MAX, Math.max(FONTE_MIN, px));
    document.documentElement.style.fontSize = px + 'px';
    try { localStorage.setItem(FONTE_KEY, px); } catch (e) {}
  }

  function fonteAtual() {
    var fs = document.documentElement.style.fontSize;
    return fs ? parseInt(fs, 10) : FONTE_BASE;
  }

  // Restaura preferência salva assim que o script carrega
  (function restaurarFonte() {
    try {
      var salvo = parseInt(localStorage.getItem(FONTE_KEY), 10);
      if (salvo && salvo >= FONTE_MIN && salvo <= FONTE_MAX) {
        aplicarFonte(salvo);
      }
    } catch (e) {}
  })();


  /* ══════════════════════════════════════════════════════════════════════
     2. ALTO CONTRASTE
  ════════════════════════════════════════════════════════════════════════ */

  function aplicarContraste(ativo) {
    document.body.classList.toggle('high-contrast', ativo);

    // Atualiza aria-pressed em todos os botões de contraste da página
    ['pi-btn-contraste', 'pi-sb-btn-contraste'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (btn) btn.setAttribute('aria-pressed', ativo ? 'true' : 'false');
    });

    try { localStorage.setItem(CONTRASTE_KEY, ativo ? '1' : '0'); } catch (e) {}
  }

  // Restaura preferência salva assim que o script carrega
  (function restaurarContraste() {
    try {
      if (localStorage.getItem(CONTRASTE_KEY) === '1') {
        aplicarContraste(true);
      }
    } catch (e) {}
  })();


  /* ══════════════════════════════════════════════════════════════════════
     UTILITÁRIO: vincula clique a elemento pelo ID
  ════════════════════════════════════════════════════════════════════════ */

  function bind(id, fn) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', function (e) {
      e.preventDefault();
      fn();
    });
  }


  /* ══════════════════════════════════════════════════════════════════════
     4. ATALHOS DE TECLADO (eMAG 3.1)
     Alt+1 → conteúdo principal
     Alt+2 → menu de navegação
     Alt+3 → rodapé
     Registrado uma única vez no nível do documento.
  ════════════════════════════════════════════════════════════════════════ */

  document.addEventListener('keydown', function (e) {
    if (!e.altKey) return;

    if (e.key === '1' || e.keyCode === 49) {
      e.preventDefault();
      var conteudo = document.getElementById('pi-conteudo');
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


  /* ══════════════════════════════════════════════════════════════════════
     WEB COMPONENT: <barra-acessibilidade>
     Renderiza a barra e vincula toda a lógica após inserir o HTML.
  ════════════════════════════════════════════════════════════════════════ */

  class Acessibilidade extends HTMLElement {
    connectedCallback() {
      var base = typeof getBasePath === 'function' ? getBasePath() : '';

      this.innerHTML = `
        <div id="barra-topo" role="banner">
          <div class="container">
            <div class="barra-inner">

              <div class="barra-acesso" aria-label="Controles de acessibilidade">
                <span aria-hidden="true">Acessibilidade</span>
                <a href="#" id="pi-btn-fonte-aumentar" role="button" aria-label="Aumentar fonte">A+</a>
                <a href="#" id="pi-btn-fonte-diminuir" role="button" aria-label="Diminuir fonte">A-</a>
                <a href="#" id="pi-btn-fonte-resetar"  role="button" aria-label="Restaurar fonte">A</a>
                <a href="#" id="pi-btn-contraste" class="barra-acesso-contraste"
                   role="button" aria-label="Ativar alto contraste" aria-pressed="false" title="Alto contraste">
                  <i class="fas fa-adjust" aria-hidden="true"></i>
                </a>
                <a href="${base}pages/acessibilidade/index.html" class="barra-acesso-icone" title="Página de Acessibilidade">
                  <i class="fas fa-universal-access" aria-hidden="true"></i>
                </a>
              </div>

              <div class="barra-sep" aria-hidden="true"></div>

              <nav class="barra-badges" aria-label="Acesso rápido">
                <a href="https://campinagrandedosul.pr.gov.br/mapa-do-site"
                   class="barra-acesso-icone" style="width:auto; padding:0 10px; font-size:10px; font-weight:700;">
                  <i class="fas fa-sitemap"></i>&nbsp; MAPA DO SITE
                </a>
                <a href="https://campinagrandedosul.pr.gov.br/acesso-a-informacao"
                   class="barra-acesso-icone" style="width:auto; padding:0 10px; font-size:10px; font-weight:700;">
                  <i class="fas fa-info-circle"></i>&nbsp; ACESSO À INFORMAÇÃO
                </a>
                <a href="https://campinagrandedosul.pr.gov.br/ouvidoria"
                   class="barra-acesso-icone" style="width:auto; padding:0 10px; font-size:10px; font-weight:700;">
                  <i class="fas fa-comments"></i>&nbsp; OUVIDORIA
                </a>
              </nav>

              <div class="barra-sep" aria-hidden="true"></div>

              <div class="barra-info-bloco" aria-label="Informações de atendimento">
                <div class="barra-horario">
                  <i class="fas fa-clock"></i>
                  <div class="barra-horario-texto">
                    <span class="barra-horario-dias">Seg – Sex</span>
                    <span class="barra-horario-horas">08h30–12h · 13h30–17h30</span>
                  </div>
                </div>
                <div class="barra-sep" aria-hidden="true"></div>
                <a href="tel:+554131627000" class="barra-telefone">
                  <span>(41) 3162-7000</span> <small>PREFEITURA</small>
                </a>
              </div>

            </div>
          </div>
        </div>
      `;

      // Vincula a lógica aos botões recém-renderizados
      this._bindBotoes();

      // Sincroniza o estado do contraste com o botão recém-criado
      var contrasteAtivo = document.body.classList.contains('high-contrast');
      var btnContraste = document.getElementById('pi-btn-contraste');
      if (btnContraste) {
        btnContraste.setAttribute('aria-pressed', contrasteAtivo ? 'true' : 'false');
      }
    }

    _bindBotoes() {
      // Barra superior
      bind('pi-btn-fonte-aumentar', function () { aplicarFonte(fonteAtual() + FONTE_STEP); });
      bind('pi-btn-fonte-diminuir', function () { aplicarFonte(fonteAtual() - FONTE_STEP); });
      bind('pi-btn-fonte-resetar',  function () { aplicarFonte(FONTE_BASE); });
      bind('pi-btn-contraste', function () {
        aplicarContraste(!document.body.classList.contains('high-contrast'));
      });

      // Sidebar (se existir na página)
      bind('pi-sb-fonte-aumentar', function () { aplicarFonte(fonteAtual() + FONTE_STEP); });
      bind('pi-sb-fonte-diminuir', function () { aplicarFonte(fonteAtual() - FONTE_STEP); });
      bind('pi-sb-fonte-resetar',  function () { aplicarFonte(FONTE_BASE); });
      bind('pi-sb-btn-contraste', function () {
        aplicarContraste(!document.body.classList.contains('high-contrast'));
      });
    }
  }

  customElements.define('barra-acessibilidade', Acessibilidade);


  /* ══════════════════════════════════════════════════════════════════════
     3. VLIBRAS
     Inicializa o widget após o DOM estar pronto.
     O script vlibras-plugin.js deve ser carregado antes deste arquivo.
  ════════════════════════════════════════════════════════════════════════ */

  function inicializarVLibras() {
    if (typeof window.VLibras !== 'undefined') {
      new window.VLibras.Widget('https://vlibras.gov.br/app');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarVLibras);
  } else {
    inicializarVLibras();
  }

})();