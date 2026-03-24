/**
 * esic.js — Scripts da página e-SIC
 * Prefeitura de Campina Grande do Sul
 *
 * Funcionalidades:
 * 1. Destaque da aba ativa da navegação rápida (scroll spy)
 * 2. Busca no FAQ
 * 3. Filtro de estatísticas por ano
 * 4. Animação de contagem nos cards de estatísticas
 */

(function () {
  'use strict';

  /* ============================================================
     DADOS DAS ESTATÍSTICAS POR ANO
     Atualize os valores conforme os dados reais do sistema.
  ============================================================ */
  const estatisticasPorAno = {
    todos: { pedidos: 149, atendidos: 57, pendentes: 42, indeferidos: 44, cancelados: 6, media: 778 },
    2026:  { pedidos:   0, atendidos:  0, pendentes:  0, indeferidos:  0, cancelados: 0, media:   0 },
    2025:  { pedidos:  90, atendidos: 40, pendentes: 20, indeferidos: 25, cancelados: 5, media: 320 },
    2024:  { pedidos:  42, atendidos: 15, pendentes: 18, indeferidos: 15, cancelados: 1, media: 280 },
    2023:  { pedidos:  17, atendidos:  2, pendentes:  4, indeferidos:  4, cancelados: 0, media: 178 },
  };


  /* ============================================================
     1. SCROLL SPY — destaque da aba ativa
  ============================================================ */
  function initScrollSpy () {
    const tabLinks  = document.querySelectorAll('.esic-tab-link');
    const sections  = [];

    tabLinks.forEach(function (link) {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const section = document.querySelector(href);
        if (section) sections.push({ link: link, section: section });
      }
    });

    if (!sections.length) return;

    function updateActive () {
      const scrollY = window.pageYOffset;
      let current   = sections[0];

      sections.forEach(function (item) {
        if (item.section.offsetTop - 100 <= scrollY) {
          current = item;
        }
      });

      tabLinks.forEach(function (link) {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      });

      if (current) {
        current.link.classList.add('active');
        current.link.setAttribute('aria-current', 'true');
      }
    }

    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
  }


  /* ============================================================
     2. BUSCA NO FAQ
  ============================================================ */
  function initFaqBusca () {
    var input     = document.getElementById('esic-faq-input');
    var semResult = document.getElementById('esic-faq-sem-resultado');
    var termoSpan = document.getElementById('esic-faq-busca-termo');
    var faqItems  = document.querySelectorAll('[data-faq]');

    if (!input || !faqItems.length) return;

    function normalizar (texto) {
      return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
    }

    function filtrar () {
      var termo        = normalizar(input.value);
      var visiveis     = 0;

      faqItems.forEach(function (item) {
        var pergunta = item.querySelector('.esic-faq-item__pergunta span');
        var resposta = item.querySelector('.esic-faq-item__resposta');
        var texto    = normalizar(
          (pergunta ? pergunta.textContent : '') +
          (resposta ? resposta.textContent : '')
        );

        if (!termo || texto.indexOf(termo) !== -1) {
          item.hidden = false;
          visiveis++;
        } else {
          item.hidden = true;
          item.open   = false; // fecha ao filtrar
        }
      });

      if (semResult) {
        if (visiveis === 0 && termo) {
          semResult.hidden = false;
          if (termoSpan) termoSpan.textContent = input.value;
        } else {
          semResult.hidden = true;
        }
      }
    }

    input.addEventListener('input', filtrar);
    input.addEventListener('search', filtrar); // evento do botão X no Chrome
  }


  /* ============================================================
     3. FILTRO DE ESTATÍSTICAS
  ============================================================ */
  function initFiltroEstatisticas () {
    var select    = document.getElementById('esic-filtro-ano');
    var btnFiltrar = document.getElementById('esic-btn-filtrar');
    var notaEl    = document.getElementById('esic-stats-nota');

    if (!select || !btnFiltrar) return;

    function aplicarFiltro () {
      var anoSelecionado = select.value;
      var dados          = estatisticasPorAno[anoSelecionado] || estatisticasPorAno['todos'];

      animarNumero('stat-pedidos',    dados.pedidos);
      animarNumero('stat-atendidos',  dados.atendidos);
      animarNumero('stat-pendentes',  dados.pendentes);
      animarNumero('stat-indeferidos',dados.indeferidos);
      animarNumero('stat-cancelados', dados.cancelados);
      animarNumero('stat-media',      dados.media);

      if (notaEl) {
        var anoTexto = anoSelecionado === 'todos'
          ? 'Dados acumulados desde a implantação do e-SIC.'
          : 'Dados referentes ao ano de ' + anoSelecionado + '.';
        notaEl.innerHTML =
          '<i class="fas fa-info-circle" aria-hidden="true"></i> ' +
          anoTexto + ' Fonte: Sistema Elotech. Atualizado em março de 2026.';
      }
    }

    btnFiltrar.addEventListener('click', aplicarFiltro);

    // Aplicar ao pressionar Enter no select
    select.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') aplicarFiltro();
    });
  }


  /* ============================================================
     4. ANIMAÇÃO DE CONTAGEM
  ============================================================ */
  function animarNumero (id, valorFinal) {
    var el = document.getElementById(id);
    if (!el) return;

    var valorInicial = 0;
    var duracao      = 600; // ms
    var inicio       = null;

    // Remove e re-adiciona classe de animação
    el.classList.remove('animating');
    void el.offsetWidth; // reflow
    el.classList.add('animating');

    function step (timestamp) {
      if (!inicio) inicio = timestamp;
      var progresso = Math.min((timestamp - inicio) / duracao, 1);
      // Easing out-cubic
      var easedProgress = 1 - Math.pow(1 - progresso, 3);
      el.textContent = Math.round(valorInicial + (valorFinal - valorInicial) * easedProgress);

      if (progresso < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = valorFinal;
        el.classList.remove('animating');
      }
    }

    requestAnimationFrame(step);
  }


  /* ============================================================
     5. ANIMAÇÃO AO ENTRAR NA VIEWPORT (Intersection Observer)
  ============================================================ */
  function initIntersectionAnimations () {
    if (!('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('esic--visivel');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    // Observa cards de estatísticas para disparar a contagem
    var statsSection = document.getElementById('esic-estatisticas');
    if (statsSection) {
      var statsObserver = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          var dados = estatisticasPorAno['todos'];
          animarNumero('stat-pedidos',    dados.pedidos);
          animarNumero('stat-atendidos',  dados.atendidos);
          animarNumero('stat-pendentes',  dados.pendentes);
          animarNumero('stat-indeferidos',dados.indeferidos);
          animarNumero('stat-cancelados', dados.cancelados);
          animarNumero('stat-media',      dados.media);
          statsObserver.unobserve(statsSection);
        }
      }, { threshold: 0.1 });

      statsObserver.observe(statsSection);
    }
  }


  /* ============================================================
     INICIALIZAÇÃO
  ============================================================ */
  document.addEventListener('DOMContentLoaded', function () {
    initScrollSpy();
    initFaqBusca();
    initFiltroEstatisticas();
    initIntersectionAnimations();
  });

})();