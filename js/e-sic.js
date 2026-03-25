/**
 * e-sic.js — Scripts da página e-SIC
 * Prefeitura de Campina Grande do Sul
 *
 * Funcionalidades:
 * 1. Scroll Spy — destaque da aba ativa na navegação rápida
 * 2. Busca no FAQ
 * 3. Filtro de estatísticas por ano (dados internos)
 * 4. Animação de contagem nos cards de estatísticas
 * 5. Formulário interno de pedido (sem dependências externas)
 * 6. Formulário de consulta de protocolo (sem dependências externas)
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
     PEDIDOS SIMULADOS PARA CONSULTA DE PROTOCOLO
     Substitua por integração real com o backend do portal.
  ============================================================ */
  const pedidosSimulados = {
    'e-SIC-2026-000001': { data: '10/01/2026', situacao: 'Atendido',     prazo: 'Concluído' },
    'e-SIC-2026-000002': { data: '15/01/2026', situacao: 'Em andamento', prazo: '10 dias úteis restantes' },
    'e-SIC-2025-000090': { data: '20/12/2025', situacao: 'Atendido',     prazo: 'Concluído' },
  };


  /* ============================================================
     1. SCROLL SPY — destaque da aba ativa
  ============================================================ */
  function initScrollSpy() {
    var tabLinks = document.querySelectorAll('.esic-tab-link');
    var sections = [];

    tabLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        var section = document.querySelector(href);
        if (section) {
          sections.push({ link: link, section: section });
        }
      }
    });

    if (!sections.length) return;

    function updateActive() {
      var scrollY = window.pageYOffset;
      var current = sections[0];

      sections.forEach(function (item) {
        if (item.section.offsetTop - 120 <= scrollY) {
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
  function initFaqBusca() {
    var input     = document.getElementById('esic-faq-input');
    var semResult = document.getElementById('esic-faq-sem-resultado');
    var termoSpan = document.getElementById('esic-faq-busca-termo');
    var faqItems  = document.querySelectorAll('[data-faq]');

    if (!input || !faqItems.length) return;

    function normalizar(texto) {
      return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
    }

    function filtrar() {
      var termo    = normalizar(input.value);
      var visiveis = 0;

      faqItems.forEach(function (item) {
        var pergunta = item.querySelector('.esic-faq-item__pergunta span');
        var resposta = item.querySelector('.esic-faq-item__resposta');
        var texto    = normalizar(
          (pergunta ? pergunta.textContent : '') +
          (resposta ? resposta.textContent  : '')
        );

        if (!termo || texto.indexOf(termo) !== -1) {
          item.hidden = false;
          visiveis++;
        } else {
          item.hidden = true;
          item.open   = false;
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
    input.addEventListener('search', filtrar);
  }


  /* ============================================================
     3. FILTRO DE ESTATÍSTICAS
  ============================================================ */
  function initFiltroEstatisticas() {
    var select     = document.getElementById('esic-filtro-ano');
    var btnFiltrar = document.getElementById('esic-btn-filtrar');
    var notaEl     = document.getElementById('esic-stats-nota');

    if (!select || !btnFiltrar) return;

    function aplicarFiltro() {
      var anoSelecionado = select.value;
      var dados          = estatisticasPorAno[anoSelecionado] || estatisticasPorAno['todos'];

      animarNumero('stat-pedidos',     dados.pedidos);
      animarNumero('stat-atendidos',   dados.atendidos);
      animarNumero('stat-pendentes',   dados.pendentes);
      animarNumero('stat-indeferidos', dados.indeferidos);
      animarNumero('stat-cancelados',  dados.cancelados);
      animarNumero('stat-media',       dados.media);

      if (notaEl) {
        var anoTexto = anoSelecionado === 'todos'
          ? 'Dados acumulados desde a implantação do e-SIC.'
          : 'Dados referentes ao ano de ' + anoSelecionado + '.';
        notaEl.innerHTML =
          '<i class="fas fa-info-circle" aria-hidden="true"></i> ' +
          anoTexto + ' Fonte: Sistema interno. Atualizado em março de 2026.';
      }
    }

    btnFiltrar.addEventListener('click', aplicarFiltro);

    select.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') aplicarFiltro();
    });
  }


  /* ============================================================
     4. ANIMAÇÃO DE CONTAGEM
  ============================================================ */
  function animarNumero(id, valorFinal) {
    var el = document.getElementById(id);
    if (!el) return;

    var duracao = 600;
    var inicio  = null;

    el.classList.remove('animating');
    void el.offsetWidth; // reflow forçado
    el.classList.add('animating');

    function step(timestamp) {
      if (!inicio) inicio = timestamp;
      var progresso = Math.min((timestamp - inicio) / duracao, 1);
      var eased     = 1 - Math.pow(1 - progresso, 3); // ease out cubic
      el.textContent = Math.round(valorFinal * eased);

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
  function initIntersectionAnimations() {
    if (!('IntersectionObserver' in window)) return;

    var statsSection = document.getElementById('esic-estatisticas');
    if (!statsSection) return;

    var statsObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        var dados = estatisticasPorAno['todos'];
        animarNumero('stat-pedidos',     dados.pedidos);
        animarNumero('stat-atendidos',   dados.atendidos);
        animarNumero('stat-pendentes',   dados.pendentes);
        animarNumero('stat-indeferidos', dados.indeferidos);
        animarNumero('stat-cancelados',  dados.cancelados);
        animarNumero('stat-media',       dados.media);
        statsObserver.unobserve(statsSection);
      }
    }, { threshold: 0.1 });

    statsObserver.observe(statsSection);
  }


  /* ============================================================
     6. FORMULÁRIO INTERNO — REGISTRAR PEDIDO
  ============================================================ */
  function initFormularioPedido() {
    var form         = document.getElementById('esic-pedido-form');
    var confirmacao  = document.getElementById('esic-confirmacao');
    var numProtocolo = document.getElementById('esic-protocolo-numero');
    var btnNovo      = document.getElementById('esic-novo-pedido-btn');

    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Validação básica de campos obrigatórios
      var valido = true;
      form.querySelectorAll('[required]').forEach(function (campo) {
        campo.classList.remove('esic-form-input--erro');
        if (!campo.value.trim() && campo.type !== 'checkbox') {
          campo.classList.add('esic-form-input--erro');
          valido = false;
        }
        if (campo.type === 'checkbox' && !campo.checked) {
          campo.parentElement.classList.add('esic-form-check--erro');
          valido = false;
        }
      });

      if (!valido) {
        var primeiroErro = form.querySelector('.esic-form-input--erro, .esic-form-check--erro input');
        if (primeiroErro) primeiroErro.focus();
        return;
      }

      // Gera número de protocolo interno
      var agora      = new Date();
      var ano        = agora.getFullYear();
      var sequencial = String(Math.floor(Math.random() * 900000) + 100000);
      var protocolo  = 'e-SIC-' + ano + '-' + sequencial;

      if (numProtocolo) {
        numProtocolo.textContent = protocolo;
      }

      // Oculta o formulário e exibe confirmação
      form.hidden = true;
      if (confirmacao) {
        confirmacao.hidden = false;
        confirmacao.focus();
      }
    });

    // Botão "Registrar novo pedido"
    if (btnNovo) {
      btnNovo.addEventListener('click', function () {
        form.reset();
        form.querySelectorAll('.esic-form-input--erro').forEach(function (el) {
          el.classList.remove('esic-form-input--erro');
        });
        form.querySelectorAll('.esic-form-check--erro').forEach(function (el) {
          el.classList.remove('esic-form-check--erro');
        });
        form.hidden = false;
        if (confirmacao) confirmacao.hidden = true;
        form.querySelector('[required]').focus();
      });
    }
  }


  /* ============================================================
     7. FORMULÁRIO INTERNO — CONSULTAR PROTOCOLO
  ============================================================ */
  function initFormularioConsulta() {
    var form        = document.getElementById('esic-consulta-form');
    var inputProto  = document.getElementById('esic-protocolo-input');
    var resultadoEl = document.getElementById('esic-resultado-consulta');
    var tbody       = document.getElementById('esic-resultado-tbody');

    if (!form || !inputProto) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var protocolo = inputProto.value.trim();
      if (!protocolo) {
        inputProto.focus();
        return;
      }

      var pedido = pedidosSimulados[protocolo];

      if (!tbody || !resultadoEl) return;

      if (pedido) {
        tbody.innerHTML =
          '<tr>' +
            '<td>' + escapeHTML(protocolo) + '</td>' +
            '<td>' + escapeHTML(pedido.data) + '</td>' +
            '<td>' + escapeHTML(pedido.situacao) + '</td>' +
            '<td>' + escapeHTML(pedido.prazo) + '</td>' +
          '</tr>';
      } else {
        tbody.innerHTML =
          '<tr>' +
            '<td colspan="4" style="text-align:center;color:#616161;">' +
              'Protocolo não encontrado. Verifique o número e tente novamente.' +
            '</td>' +
          '</tr>';
      }

      resultadoEl.hidden = false;
      resultadoEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  /** Sanitiza texto para inserção em HTML */
  function escapeHTML(str) {
    return String(str)
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;')
      .replace(/'/g,  '&#39;');
  }


  /* ============================================================
     INICIALIZAÇÃO
  ============================================================ */
  document.addEventListener('DOMContentLoaded', function () {
    initScrollSpy();
    initFaqBusca();
    initFiltroEstatisticas();
    initIntersectionAnimations();
    initFormularioPedido();
    initFormularioConsulta();
  });

})();