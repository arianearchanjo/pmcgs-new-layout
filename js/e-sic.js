/**
 * e-sic.js — Scripts da página e-SIC (index)
 * Prefeitura de Campina Grande do Sul
 *
 * Funcionalidades:
 * 1. Filtro de estatísticas por ano
 * 2. Animação de contagem nos cards de estatísticas
 * 3. Animação ao entrar na viewport (Intersection Observer)
 * 4. Formulário de consulta de protocolo
 *
 * REMOVIDOS (não existem mais nesta página):
 * - initScrollSpy()   → menu de abas removido do HTML
 * - initFaqBusca()    → seção FAQ removida
 * - initFormularioPedido() → formulário movido para registrar-pedido.js
 */

(function () {
  'use strict';

  /* ============================================================
     DADOS DAS ESTATÍSTICAS POR ANO
  ============================================================ */
  const estatisticasPorAno = {
    todos: { pedidos: 149, atendidos: 57, pendentes: 42, indeferidos: 44, cancelados: 6, media: 778 },
    2026:  { pedidos:   0, atendidos:  0, pendentes:  0, indeferidos:  0, cancelados: 0, media:   0 },
    2025:  { pedidos:  90, atendidos: 40, pendentes: 20, indeferidos: 25, cancelados: 5, media: 320 },
    2024:  { pedidos:  42, atendidos: 15, pendentes: 18, indeferidos: 15, cancelados: 1, media: 280 },
    2023:  { pedidos:  17, atendidos:  2, pendentes:  4, indeferidos:  4, cancelados: 0, media: 178 },
  };

  /* ============================================================
     PEDIDOS SIMULADOS — CONSULTA DE PROTOCOLO
     Substitua por integração real com o backend.
  ============================================================ */
  const pedidosSimulados = {
    'e-SIC-2026-000001': { data: '10/01/2026', situacao: 'Atendido',     prazo: 'Concluído' },
    'e-SIC-2026-000002': { data: '15/01/2026', situacao: 'Em andamento', prazo: '10 dias úteis restantes' },
    'e-SIC-2025-000090': { data: '20/12/2025', situacao: 'Atendido',     prazo: 'Concluído' },
  };


  /* ============================================================
     1. FILTRO DE ESTATÍSTICAS
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
     2. ANIMAÇÃO DE CONTAGEM
  ============================================================ */
  function animarNumero(id, valorFinal) {
    var el = document.getElementById(id);
    if (!el) return;

    var duracao = 600;
    var inicio  = null;

    el.classList.remove('animating');
    void el.offsetWidth;
    el.classList.add('animating');

    function step(timestamp) {
      if (!inicio) inicio = timestamp;
      var progresso = Math.min((timestamp - inicio) / duracao, 1);
      var eased     = 1 - Math.pow(1 - progresso, 3);
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
     3. ANIMAÇÃO AO ENTRAR NA VIEWPORT
  ============================================================ */
  function initIntersectionAnimations() {
    if (!('IntersectionObserver' in window)) return;

    var statsSection = document.getElementById('esic-estatisticas');
    if (!statsSection) return;

    var observer = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        var dados = estatisticasPorAno['todos'];
        animarNumero('stat-pedidos',     dados.pedidos);
        animarNumero('stat-atendidos',   dados.atendidos);
        animarNumero('stat-pendentes',   dados.pendentes);
        animarNumero('stat-indeferidos', dados.indeferidos);
        animarNumero('stat-cancelados',  dados.cancelados);
        animarNumero('stat-media',       dados.media);
        observer.unobserve(statsSection);
      }
    }, { threshold: 0.1 });

    observer.observe(statsSection);
  }


  /* ============================================================
     4. CONSULTAR PROTOCOLO
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
      if (!protocolo) { inputProto.focus(); return; }

      var pedido = pedidosSimulados[protocolo];
      if (!tbody || !resultadoEl) return;

      if (pedido) {
        tbody.innerHTML =
          '<tr>' +
            '<td>' + escapeHTML(protocolo)      + '</td>' +
            '<td>' + escapeHTML(pedido.data)    + '</td>' +
            '<td>' + escapeHTML(pedido.situacao)+ '</td>' +
            '<td>' + escapeHTML(pedido.prazo)   + '</td>' +
          '</tr>';
      } else {
        tbody.innerHTML =
          '<tr><td colspan="4" style="text-align:center;color:#616161;">' +
            'Protocolo não encontrado. Verifique o número e tente novamente.' +
          '</td></tr>';
      }

      resultadoEl.hidden = false;
      resultadoEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

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
    initFiltroEstatisticas();
    initIntersectionAnimations();
    initFormularioConsulta();
  });

})();