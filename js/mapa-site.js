/**
 * mapa-site.js — Página Mapa do Site
 * Prefeitura de Campina Grande do Sul – PR
 *
 * Módulos:
 *   1. Controle de Fonte (eMAG)
 *   2. Alto Contraste (eMAG)
 *   3. VLibras
 *   4. Atalhos de Teclado (eMAG)
 *   5. Busca na página (filtragem das seções)
 *
 * Observação: usa as mesmas chaves de localStorage do script.js da home,
 * garantindo que as preferências do usuário sejam compartilhadas entre
 * todas as páginas do portal.
 */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════════════════
     1. CONTROLE DE FONTE
     Permite ao usuário aumentar, diminuir ou resetar o tamanho do texto.
     Preferência salva no localStorage para persistir entre páginas.
  ════════════════════════════════════════════════════════════════════════ */

  var FONTE_BASE = 16; // Tamanho padrão em px
  var FONTE_MIN  = 14; // Tamanho mínimo permitido
  var FONTE_MAX  = 22; // Tamanho máximo permitido
  var FONTE_STEP = 2;  // Incremento/decremento por clique

  // Chaves de localStorage compartilhadas com o script.js da home
  var FONTE_KEY     = 'pmcgs_fontSize';
  var CONTRASTE_KEY = 'pmcgs_highContrast';

  /**
   * Aplica o tamanho de fonte informado ao elemento <html>.
   * O valor é limitado entre FONTE_MIN e FONTE_MAX.
   * @param {number} px - Tamanho em pixels
   */
  function aplicarFonte(px) {
    px = Math.min(FONTE_MAX, Math.max(FONTE_MIN, px));
    document.documentElement.style.fontSize = px + 'px';
    try { localStorage.setItem(FONTE_KEY, px); } catch (e) {}
  }

  /**
   * Retorna o tamanho de fonte atual do elemento <html> em pixels.
   * @returns {number}
   */
  function fonteAtual() {
    var fs = document.documentElement.style.fontSize;
    return fs ? parseInt(fs, 10) : FONTE_BASE;
  }

  // Restaura o tamanho de fonte salvo pelo usuário ao carregar a página
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
     Ativa/desativa o modo de alto contraste adicionando a classe
     .high-contrast ao <body>. O estado é salvo no localStorage.
  ════════════════════════════════════════════════════════════════════════ */

  /**
   * Ativa ou desativa o modo de alto contraste.
   * Atualiza aria-pressed no botão de contraste da barra superior.
   * @param {boolean} ativo
   */
  function aplicarContraste(ativo) {
    document.body.classList.toggle('high-contrast', ativo);

    // Atualiza o estado aria-pressed no botão de contraste
    var btnContraste = document.getElementById('pi-btn-contraste');
    if (btnContraste) {
      btnContraste.setAttribute('aria-pressed', ativo ? 'true' : 'false');
    }

    try { localStorage.setItem(CONTRASTE_KEY, ativo ? '1' : '0'); } catch (e) {}
  }

  // Restaura o modo de contraste salvo pelo usuário ao carregar a página
  (function restaurarContraste() {
    try {
      if (localStorage.getItem(CONTRASTE_KEY) === '1') {
        aplicarContraste(true);
      }
    } catch (e) {}
  })();


  /* ══════════════════════════════════════════════════════════════════════
     UTILITÁRIO: vincula um evento de clique a um elemento pelo ID
  ════════════════════════════════════════════════════════════════════════ */

  /**
   * Busca o elemento pelo id e vincula a função de callback ao clique.
   * Previne o comportamento padrão do evento.
   * @param {string} id  - ID do elemento
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


  /* ══════════════════════════════════════════════════════════════════════
     VINCULAÇÃO DOS BOTÕES DA BARRA SUPERIOR
  ════════════════════════════════════════════════════════════════════════ */

  bind('pi-btn-fonte-aumentar', function () { aplicarFonte(fonteAtual() + FONTE_STEP); });
  bind('pi-btn-fonte-diminuir', function () { aplicarFonte(fonteAtual() - FONTE_STEP); });
  bind('pi-btn-fonte-resetar',  function () { aplicarFonte(FONTE_BASE); });
  bind('pi-btn-contraste', function () {
    aplicarContraste(!document.body.classList.contains('high-contrast'));
  });


  /* ══════════════════════════════════════════════════════════════════════
     5. BUSCA NA PÁGINA
     Filtragem em tempo real das seções e links do mapa do site.
     Ao digitar no campo de busca do header, as seções que não contêm
     o termo digitado são ocultadas.
  ════════════════════════════════════════════════════════════════════════ */

  /**
   * Inicializa o comportamento de busca/filtro na página de mapa do site.
   * Filtra seções com base no texto dos links e títulos.
   */
  function inicializarBusca() {
    var inputBusca = document.getElementById('pi-busca');
    if (!inputBusca) return;

    var btnBusca = document.querySelector('.pi-search-btn');

    /**
     * Executa o filtro visual das seções do mapa.
     * @param {string} termo - Texto a buscar (já em minúsculas)
     */
    function filtrarSecoes(termo) {
      var secoes = document.querySelectorAll('.ms-secao');
      var grade  = document.querySelector('.ms-grade');
      var msgVazia = document.getElementById('ms-sem-resultados');

      var totalVisiveis = 0;

      secoes.forEach(function (secao) {
        // Coleta o texto do título e de todos os links da seção
        var textoSecao = secao.textContent.toLowerCase();
        var visivel = termo === '' || textoSecao.indexOf(termo) !== -1;

        secao.style.display = visivel ? '' : 'none';

        if (visivel) totalVisiveis++;

        // Dentro de cada seção visível, destaca os links que batem
        if (visivel && termo !== '') {
          var links = secao.querySelectorAll('.ms-lista li a');
          links.forEach(function (link) {
            var textoLink = link.textContent.toLowerCase();
            var pai = link.parentElement; // <li>
            if (textoLink.indexOf(termo) !== -1) {
              pai.style.display = '';
            } else {
              // Mantém o item mas sem destaque especial — apenas oculta itens
              // que não correspondem quando a busca é específica por link
              pai.style.display = '';
            }
          });
        } else if (visivel && termo === '') {
          // Restaura todos os itens quando a busca é limpa
          var itens = secao.querySelectorAll('.ms-lista li');
          itens.forEach(function (item) {
            item.style.display = '';
          });
        }
      });

      // Exibe mensagem quando não há resultados
      if (!msgVazia && grade) {
        msgVazia = document.createElement('p');
        msgVazia.id = 'ms-sem-resultados';
        msgVazia.style.cssText = [
          'display:none',
          'text-align:center',
          'padding:40px 20px',
          'color:#4a5a4a',
          'font-size:0.9375rem',
          'background:#fff',
          'border-radius:10px',
          'border:1.5px solid #c8d8c8',
          'grid-column:1/-1'
        ].join(';');
        msgVazia.innerHTML = '<i class="fas fa-search" style="font-size:2rem;color:#9ec69e;display:block;margin-bottom:12px"></i>' +
                             'Nenhuma seção encontrada para "<strong>' + '' + '</strong>".';
        grade.appendChild(msgVazia);
      }

      if (msgVazia) {
        if (totalVisiveis === 0 && termo !== '') {
          msgVazia.querySelector('strong').textContent = termo;
          msgVazia.style.display = '';
        } else {
          msgVazia.style.display = 'none';
        }
      }
    }

    // Filtra em tempo real ao digitar
    inputBusca.addEventListener('input', function () {
      var termo = inputBusca.value.trim().toLowerCase();
      filtrarSecoes(termo);
    });

    // Filtra ao pressionar Enter
    inputBusca.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.keyCode === 13) {
        e.preventDefault();
        var termo = inputBusca.value.trim().toLowerCase();
        filtrarSecoes(termo);
      }
    });

    // Filtra ao clicar no botão de busca
    if (btnBusca) {
      btnBusca.addEventListener('click', function () {
        var termo = inputBusca.value.trim().toLowerCase();
        filtrarSecoes(termo);
      });
    }
  }

  // Inicializa a busca após o DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarBusca);
  } else {
    inicializarBusca();
  }

})();


/* ══════════════════════════════════════════════════════════════════════
   3. VLIBRAS
   Inicializa o widget de tradução para Libras do Governo Federal.
   O script vlibras-plugin.js deve ser carregado antes deste arquivo.
════════════════════════════════════════════════════════════════════════ */

if (typeof window.VLibras !== 'undefined') {
  new window.VLibras.Widget('https://vlibras.gov.br/app');
}


/* ══════════════════════════════════════════════════════════════════════
   4. ATALHOS DE TECLADO (eMAG)
   Implementa os atalhos de acessibilidade obrigatórios pelo eMAG 3.1:
     Alt+1 → pula para o conteúdo principal
     Alt+2 → pula para o menu de navegação
     Alt+3 → pula para o rodapé
════════════════════════════════════════════════════════════════════════ */

document.addEventListener('keydown', function (e) {
  // Ignora se Alt não está pressionado
  if (!e.altKey) return;

  // Alt+1 → conteúdo principal
  if (e.key === '1' || e.keyCode === 49) {
    e.preventDefault();
    var conteudo = document.getElementById('pi-conteudo');
    if (conteudo) {
      conteudo.setAttribute('tabindex', '-1');
      conteudo.focus();
      conteudo.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Alt+2 → primeiro item do menu de navegação
  if (e.key === '2' || e.keyCode === 50) {
    e.preventDefault();
    var primeiroLink = document.querySelector('#pi-nav-list .nav-link');
    if (primeiroLink) {
      primeiroLink.focus();
    }
  }

  // Alt+3 → rodapé da página
  if (e.key === '3' || e.keyCode === 51) {
    e.preventDefault();
    var rodape = document.getElementById('pi-footer');
    if (rodape) {
      rodape.scrollIntoView({ behavior: 'smooth' });
    }
  }
});