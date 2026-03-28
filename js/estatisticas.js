/**
 * estatisticas.js
 * Scripts exclusivos da página Estatísticas do e-SIC
 * Prefeitura de Campina Grande do Sul – PR
 *
 * Funcionalidades:
 * 1. Menu de navegação rápida (toggle mobile + scroll-spy)
 * 2. Filtro de estatísticas por ano
 * 3. Animação de contagem nos números
 * 4. Animação ao entrar na viewport (Intersection Observer)
 * 5. Gráficos SVG inline — pizza e barras (sem dependências externas)
 * 6. Busca/filtro nas tabelas da página
 */

(function () {
  'use strict';

  /* ============================================================
     CORES — padrão Google Charts / Elotech
  ============================================================ */
  var CORES = [
    '#3366cc', '#dc3912', '#ff9900', '#109618',
    '#990099', '#0099c6', '#dd4477', '#66aa00',
    '#b82e2e', '#316395'
  ];


  /* ============================================================
     DADOS — ESTATÍSTICAS POR ANO
  ============================================================ */
  var estatisticasPorAno = {
    todos: { pedidos: 149, atendidos: 57, pendentes: 42, indeferidos: 44, cancelados: 6,  media: 779 },
    2026:  { pedidos:   0, atendidos:  0, pendentes:  0, indeferidos:  0, cancelados: 0,  media:   0 },
    2025:  { pedidos:  90, atendidos: 40, pendentes: 20, indeferidos: 25, cancelados: 5,  media: 320 },
    2024:  { pedidos:  42, atendidos: 15, pendentes: 18, indeferidos: 15, cancelados: 1,  media: 280 },
    2023:  { pedidos:  17, atendidos:  2, pendentes:  4, indeferidos:  4, cancelados: 0,  media: 178 }
  };

  /* ── Dados fixos dos gráficos de perfil ── */
  var dadosGenero = [
    { label: 'Feminino',      valor: 20 },
    { label: 'Masculino',     valor: 51 },
    { label: 'Não Informado', valor: 78 }
  ];

  var dadosFaixaEtaria = [
    { label: 'Acima de 60 anos', valor:  1 },
    { label: 'Até 20 anos',      valor:  2 },
    { label: 'De 21 a 30 anos',  valor:  1 },
    { label: 'De 31 a 40 anos',  valor:  6 },
    { label: 'De 41 a 50 anos',  valor:  5 },
    { label: 'De 51 a 60 anos',  valor:  3 },
    { label: 'Não Informado',    valor: 94 }
  ];

  var dadosEscolaridade = [
    { label: 'Fundamental Incompleto',   valor:  2 },
    { label: 'Médio Incompleto',         valor:  4 },
    { label: 'Médio Completo',           valor:  8 },
    { label: 'Superior Incompleto',      valor:  8 },
    { label: 'Superior Completo',        valor: 19 },
    { label: 'Pós Graduação Incompleto', valor:  2 },
    { label: 'Pós Graduação Completo',   valor:  9 },
    { label: 'Mestrado Incompleto',      valor: 10 },
    { label: 'Mestrado Completo',        valor:  2 },
    { label: 'Não Informado',            valor: 85 }
  ];


  /* ============================================================
     UTILITÁRIOS
  ============================================================ */
  function qs(sel, ctx)  { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;')
      .replace(/'/g,  '&#39;');
  }

  function svgEl(tag, attrs) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    return el;
  }


  /* ============================================================
     1. MENU DE NAVEGAÇÃO RÁPIDA
  ============================================================ */
  function initNavRapida() {
    var toggle = qs('#esic-nav-toggle');
    var lista  = qs('#esic-nav-lista');
    var links  = qsa('.esic-nav-rapida__link');

    if (!toggle || !lista) return;

    /* Toggle mobile */
    toggle.addEventListener('click', function () {
      var aberto = lista.classList.toggle('open');
      toggle.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    });

    /* Navegação suave com offset do menu sticky */
    var nav = qs('#esic-nav-rapida');
    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = link.getAttribute('href');
        if (!href || href.charAt(0) !== '#') return;
        e.preventDefault();

        var alvo = document.getElementById(href.slice(1));
        if (!alvo) return;

        var offset = (nav ? nav.offsetHeight : 0) + 8;
        var top    = alvo.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });

        /* Fechar no mobile */
        lista.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    /* Scroll-spy via IntersectionObserver */
    if (!('IntersectionObserver' in window)) return;

    var secoes = [];
    links.forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) !== '#') return;
      var el = document.getElementById(href.slice(1));
      if (el) secoes.push({ el: el, link: link });
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var hit = secoes.find(function (s) { return s.el === entry.target; });
        if (!hit) return;
        links.forEach(function (l) { l.classList.remove('active'); });
        hit.link.classList.add('active');
      });
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

    secoes.forEach(function (s) { observer.observe(s.el); });
  }


  /* ============================================================
     2. FILTRO DE ANO
  ============================================================ */
  function initFiltroEstatisticas() {
    var select  = qs('#esic-filtro-ano');
    var btnFilt = qs('#esic-btn-filtrar');
    var notaEl  = qs('#esic-stats-nota');

    if (!select || !btnFilt) return;

    function aplicar() {
      var ano   = select.value;
      var dados = estatisticasPorAno[ano] || estatisticasPorAno['todos'];

      /* Tabela Relatório Anual */
      animarNumero('tbl-pedidos',     dados.pedidos);
      animarNumero('tbl-atendidos',   dados.atendidos);
      animarNumero('tbl-cancelados',  dados.cancelados);
      animarNumero('tbl-indeferidos', dados.indeferidos);

      /* Cards stat */
      animarNumero('stat-pedidos',     dados.pedidos);
      animarNumero('stat-atendidos',   dados.atendidos);
      animarNumero('stat-pendentes',   dados.pendentes);
      animarNumero('stat-indeferidos', dados.indeferidos);
      animarNumero('stat-cancelados',  dados.cancelados);
      animarNumero('stat-media',       dados.media);

      /* Tabela "Estatísticas do Ano" */
      animarNumero('ano-pedidos',     dados.pedidos);
      animarNumero('ano-atendidos',   dados.atendidos);
      animarNumero('ano-cancelados',  dados.cancelados);
      animarNumero('ano-indeferidos', dados.indeferidos);

      /* Gráficos que dependem do filtro */
      renderBarChart('esic-barchart-ano', dados);
      renderPieChart('esic-pizza-esic', 'esic-legenda-esic', [
        { label: 'Atendidos',   valor: dados.atendidos   },
        { label: 'Cancelados',  valor: dados.cancelados  },
        { label: 'Indeferidos', valor: dados.indeferidos },
        { label: 'Pendentes',   valor: dados.pendentes   }
      ]);

      /* Nota de rodapé */
      if (notaEl) {
        var texto = ano === 'todos'
          ? 'Dados acumulados desde a implantação do e-SIC.'
          : 'Dados referentes ao ano de ' + ano + '.';
        notaEl.innerHTML =
          '<i class="fas fa-info-circle" aria-hidden="true"></i> ' +
          texto + ' Fonte: Sistema interno. Atualizado em março de 2026.';
      }
    }

    btnFilt.addEventListener('click', aplicar);
    select.addEventListener('change', aplicar);
    select.addEventListener('keydown', function (e) { if (e.key === 'Enter') aplicar(); });
  }


  /* ============================================================
     3. ANIMAÇÃO DE CONTAGEM
  ============================================================ */
  function animarNumero(id, valorFinal) {
    var el = document.getElementById(id);
    if (!el) return;

    var duracao = 650;
    var inicio  = null;

    el.classList.remove('animating');
    void el.offsetWidth; /* forçar reflow */
    el.classList.add('animating');

    function step(ts) {
      if (!inicio) inicio = ts;
      var prog  = Math.min((ts - inicio) / duracao, 1);
      var eased = 1 - Math.pow(1 - prog, 3);      /* ease-out cubic */
      el.textContent = Math.round(valorFinal * eased);
      if (prog < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = valorFinal;
        el.classList.remove('animating');
      }
    }

    requestAnimationFrame(step);
  }


  /* ============================================================
     4. ANIMAÇÃO AO ENTRAR NA VIEWPORT
  ============================================================ */
  function initIntersectionAnimations() {
    if (!('IntersectionObserver' in window)) return;

    var ancora = qs('#esic-relatorio-anual') || qs('#esic-cards-totais');
    if (!ancora) return;

    var observer = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;

      var dados = estatisticasPorAno['todos'];

      animarNumero('tbl-pedidos',     dados.pedidos);
      animarNumero('tbl-atendidos',   dados.atendidos);
      animarNumero('tbl-cancelados',  dados.cancelados);
      animarNumero('tbl-indeferidos', dados.indeferidos);

      animarNumero('stat-pedidos',     dados.pedidos);
      animarNumero('stat-atendidos',   dados.atendidos);
      animarNumero('stat-pendentes',   dados.pendentes);
      animarNumero('stat-indeferidos', dados.indeferidos);
      animarNumero('stat-cancelados',  dados.cancelados);
      animarNumero('stat-media',       dados.media);

      animarNumero('ano-pedidos',     dados.pedidos);
      animarNumero('ano-atendidos',   dados.atendidos);
      animarNumero('ano-cancelados',  dados.cancelados);
      animarNumero('ano-indeferidos', dados.indeferidos);

      observer.unobserve(ancora);
    }, { threshold: 0.1 });

    observer.observe(ancora);
  }


  /* ============================================================
     5a. GRÁFICO PIZZA (SVG puro)
  ============================================================ */
  function renderPieChart(svgId, legendaId, dados) {
    var svg   = document.getElementById(svgId);
    var legEl = document.getElementById(legendaId);
    if (!svg || !legEl) return;

    /* Limpar */
    while (svg.firstChild)   svg.removeChild(svg.firstChild);
    while (legEl.firstChild) legEl.removeChild(legEl.firstChild);

    var total = dados.reduce(function (s, d) { return s + d.valor; }, 0);

    if (total === 0) {
      svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 80, fill: '#e0e0e0' }));
      var li0 = document.createElement('li');
      li0.textContent = 'Sem dados disponíveis';
      li0.style.color = '#888';
      li0.style.fontSize = '0.8rem';
      legEl.appendChild(li0);
      return;
    }

    var cx = 100, cy = 100, r = 80;
    var startAngle = -Math.PI / 2; /* início no topo */

    dados.forEach(function (d, i) {
      if (d.valor === 0) return;

      var pct      = d.valor / total;
      var angle    = pct * 2 * Math.PI;
      var endAngle = startAngle + angle;
      var cor      = CORES[i % CORES.length];

      var x1 = cx + r * Math.cos(startAngle);
      var y1 = cy + r * Math.sin(startAngle);
      var x2 = cx + r * Math.cos(endAngle);
      var y2 = cy + r * Math.sin(endAngle);
      var arc = angle > Math.PI ? 1 : 0;

      var path = svgEl('path', {
        d: [
          'M', cx, cy,
          'L', x1.toFixed(2), y1.toFixed(2),
          'A', r, r, 0, arc, 1, x2.toFixed(2), y2.toFixed(2),
          'Z'
        ].join(' '),
        fill: cor,
        stroke: '#fff',
        'stroke-width': '1.5'
      });
      svg.appendChild(path);

      /* Rótulo % no interior (só se fatia grande o suficiente) */
      if (pct > 0.07) {
        var mid = startAngle + angle / 2;
        var tx  = cx + r * 0.61 * Math.cos(mid);
        var ty  = cy + r * 0.61 * Math.sin(mid);
        var txt = svgEl('text', {
          x: tx.toFixed(2),
          y: ty.toFixed(2),
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
          'font-size': '10',
          'font-weight': 'bold',
          'font-family': 'Roboto, Arial, sans-serif',
          fill: '#fff'
        });
        txt.textContent = (pct * 100).toFixed(1) + '%';
        svg.appendChild(txt);
      }

      startAngle = endAngle;

      /* Linha de legenda */
      var li = document.createElement('li');
      li.innerHTML =
        '<span class="esic-legenda-cor" style="background:' + cor + '" aria-hidden="true"></span>' +
        '<span>' + escapeHTML(d.label) + '</span>' +
        '<span class="esic-legenda-pct">' + d.valor + '</span>';
      legEl.appendChild(li);
    });
  }


  /* ============================================================
     5b. GRÁFICO DE BARRAS (SVG puro)
  ============================================================ */
  function renderBarChart(containerId, dados) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var categorias = [
      { label: 'Pedidos',     valor: dados.pedidos,     cor: CORES[0] },
      { label: 'Atendidos',   valor: dados.atendidos,   cor: CORES[3] },
      { label: 'Pendentes',   valor: dados.pendentes,   cor: CORES[2] },
      { label: 'Indeferidos', valor: dados.indeferidos, cor: CORES[1] },
      { label: 'Cancelados',  valor: dados.cancelados,  cor: CORES[4] }
    ];

    var W = 320, H = 200;
    var pL = 36, pB = 38, pT = 18, pR = 10;
    var cW = W - pL - pR;
    var cH = H - pB - pT;

    var maxVal = Math.max.apply(null, categorias.map(function (c) { return c.valor; }));
    if (maxVal === 0) maxVal = 10;

    var barW = Math.floor(cW / categorias.length * 0.52);
    var slot = Math.floor(cW / categorias.length);

    /* Recriar SVG */
    while (container.firstChild) container.removeChild(container.firstChild);

    var ns  = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('aria-hidden', 'true');
    svg.style.width      = '100%';
    svg.style.maxHeight  = '200px';
    svg.style.display    = 'block';

    /* Linhas de grade */
    var grades = 4;
    for (var g = 0; g <= grades; g++) {
      var gy   = pT + cH - (g / grades) * cH;
      var line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', pL);
      line.setAttribute('y1', gy.toFixed(1));
      line.setAttribute('x2', W - pR);
      line.setAttribute('y2', gy.toFixed(1));
      line.setAttribute('stroke', g === 0 ? '#aaa' : '#e4ede4');
      line.setAttribute('stroke-width', g === 0 ? '1' : '0.5');
      svg.appendChild(line);

      if (g > 0) {
        var yl = document.createElementNS(ns, 'text');
        yl.setAttribute('x', (pL - 4).toString());
        yl.setAttribute('y', (gy + 3).toFixed(1));
        yl.setAttribute('text-anchor', 'end');
        yl.setAttribute('font-size', '9');
        yl.setAttribute('fill', '#888');
        yl.setAttribute('font-family', 'Roboto, Arial, sans-serif');
        yl.textContent = Math.round((g / grades) * maxVal);
        svg.appendChild(yl);
      }
    }

    /* Barras */
    categorias.forEach(function (cat, i) {
      var bH   = maxVal > 0 ? (cat.valor / maxVal) * cH : 0;
      var bX   = pL + i * slot + (slot - barW) / 2;
      var bY   = pT + cH - bH;

      var rect = document.createElementNS(ns, 'rect');
      rect.setAttribute('x',      bX.toFixed(1));
      rect.setAttribute('y',      bY.toFixed(1));
      rect.setAttribute('width',  barW.toString());
      rect.setAttribute('height', Math.max(bH, 0).toFixed(1));
      rect.setAttribute('fill',   cat.cor);
      rect.setAttribute('rx',     '3');
      rect.style.cursor      = 'default';
      rect.style.transition  = 'opacity 0.2s';
      rect.addEventListener('mouseenter', function () { rect.style.opacity = '0.78'; });
      rect.addEventListener('mouseleave', function () { rect.style.opacity = '1'; });
      svg.appendChild(rect);

      /* Valor acima da barra */
      if (cat.valor > 0) {
        var vt = document.createElementNS(ns, 'text');
        vt.setAttribute('x',             (bX + barW / 2).toFixed(1));
        vt.setAttribute('y',             (bY - 4).toFixed(1));
        vt.setAttribute('text-anchor',   'middle');
        vt.setAttribute('font-size',     '10');
        vt.setAttribute('font-weight',   'bold');
        vt.setAttribute('fill',          '#444');
        vt.setAttribute('font-family',   'Roboto, Arial, sans-serif');
        vt.textContent = cat.valor;
        svg.appendChild(vt);
      }

      /* Label eixo X */
      var xl = document.createElementNS(ns, 'text');
      xl.setAttribute('x',           (bX + barW / 2).toFixed(1));
      xl.setAttribute('y',           (pT + cH + 14).toFixed(1));
      xl.setAttribute('text-anchor', 'middle');
      xl.setAttribute('font-size',   '9');
      xl.setAttribute('fill',        '#555');
      xl.setAttribute('font-family', 'Roboto, Arial, sans-serif');
      xl.textContent = cat.label;
      svg.appendChild(xl);
    });

    container.appendChild(svg);
  }


  /* ============================================================
     6. BUSCA NAS TABELAS DA PÁGINA
  ============================================================ */
  function initBusca() {
    var input  = qs('#esic-busca-input');
    var btn    = qs('#esic-busca-btn');
    var resBox = qs('#esic-busca-resultados');
    var resCon = qs('#esic-busca-conteudo');

    if (!input) return;

    function executar() {
      var termo = input.value.trim().toLowerCase();

      /* Sem termo: restaura tudo */
      if (!termo) {
        qsa('.esic-tabela-elotech tbody tr').forEach(function (tr) {
          tr.classList.remove('esic-hidden');
        });
        if (resBox) resBox.hidden = true;
        return;
      }

      var resultados = [];

      /* Filtra linhas das tabelas */
      qsa('.esic-tabela-elotech tbody tr').forEach(function (tr) {
        var texto = (tr.textContent || '').toLowerCase();
        if (texto.indexOf(termo) !== -1) {
          tr.classList.remove('esic-hidden');

          /* Busca nome da seção mais próxima */
          var secEl   = tr.closest('section') || tr.closest('[id]');
          var titEl   = secEl ? secEl.querySelector('[class*="titulo"], h2, h3') : null;
          var celDesc = tr.cells[0] ? tr.cells[0].textContent.trim() : '';
          var celVal  = tr.cells[1] ? tr.cells[1].textContent.trim() : '';

          resultados.push({
            secao: titEl ? titEl.textContent.trim() : '',
            desc:  celDesc,
            valor: celVal
          });
        } else {
          tr.classList.add('esic-hidden');
        }
      });

      /* Painel de resultados */
      if (!resBox || !resCon) return;
      resBox.hidden = false;

      if (resultados.length === 0) {
        resCon.innerHTML =
          '<div class="esic-busca-vazio">' +
            '<i class="fas fa-search" aria-hidden="true"></i>' +
            ' Nenhum resultado para <strong>' + escapeHTML(termo) + '</strong>.' +
          '</div>';
        return;
      }

      var re  = new RegExp('(' + escapeHTML(termo).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      var html = '';

      resultados.forEach(function (r) {
        var destaque = escapeHTML(r.desc).replace(re, '<mark class="esic-busca-destaque">$1</mark>');
        html +=
          '<div class="esic-busca-item">' +
            '<span>' + destaque + '</span>' +
            '<span class="esic-busca-item__secao">' +
              escapeHTML(r.secao) + (r.valor ? ' · ' + escapeHTML(r.valor) : '') +
            '</span>' +
          '</div>';
      });

      resCon.innerHTML = html;
      resBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    btn.addEventListener('click', executar);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') executar(); });

    /* Limpa em tempo real quando o campo é esvaziado */
    input.addEventListener('input', function () {
      if (!input.value.trim()) {
        qsa('.esic-tabela-elotech tbody tr').forEach(function (tr) {
          tr.classList.remove('esic-hidden');
        });
        if (resBox) resBox.hidden = true;
      }
    });
  }


  /* ============================================================
     INICIALIZAÇÃO
  ============================================================ */
  document.addEventListener('DOMContentLoaded', function () {

    initNavRapida();
    initFiltroEstatisticas();
    initBusca();
    initIntersectionAnimations();

    /* Render inicial com dados "todos" */
    var d = estatisticasPorAno['todos'];

    renderBarChart('esic-barchart-ano', d);

    renderPieChart('esic-pizza-esic', 'esic-legenda-esic', [
      { label: 'Atendidos',   valor: d.atendidos   },
      { label: 'Cancelados',  valor: d.cancelados  },
      { label: 'Indeferidos', valor: d.indeferidos },
      { label: 'Pendentes',   valor: d.pendentes   }
    ]);

    renderPieChart('esic-pizza-genero',       'esic-legenda-genero',       dadosGenero);
    renderPieChart('esic-pizza-faixa',        'esic-legenda-faixa',        dadosFaixaEtaria);
    renderPieChart('esic-pizza-escolaridade', 'esic-legenda-escolaridade', dadosEscolaridade);

  });

})();