'use strict';

/**
 * script.js — Portal da Prefeitura de Campina Grande do Sul
 * Organização:
 *   1. Autocomplete da busca
 *   2. Widget de Clima (Open-Meteo, sem API key)
 *   3. Acordeão de Transparência
 *   4. Filtro de Perfis de Acesso (grid de serviços)
 *   5. Acessibilidade eMAG — Controle de Fonte + Alto Contraste
 *   6. Atalhos de teclado eMAG (Alt+1 / Alt+2 / Alt+3)
 *   7. VLibras (inicialização)
 */

// ── 1. AUTOCOMPLETE DA BUSCA ─────────────────────────────────────────────────
/**
 * Inicializa o autocomplete no campo de pesquisa, se a função estiver disponível.
 * A função `autocomplete` é fornecida por script externo opcional.
 */
(function () {
  var searchEl = document.getElementById('search');
  if (searchEl && typeof autocomplete === 'function') {
    autocomplete(searchEl, 'site');
  }
})();


// ── 2. WIDGET DE CLIMA ───────────────────────────────────────────────────────
/**
 * Consulta a API Open-Meteo (sem necessidade de chave) e renderiza
 * temperatura, condição e dados extras (vento e umidade) na barra de clima.
 */
(function () {
  var LAT = -25.3072;
  var LON = -49.0539;

  // Descrições de condição baseadas no código WMO
  var WMO = {
    0: 'Céu limpo', 1: 'Principalmente limpo', 2: 'Parcialmente nublado', 3: 'Nublado',
    45: 'Névoa', 48: 'Névoa com geada',
    51: 'Garoa leve', 53: 'Garoa moderada', 55: 'Garoa intensa',
    61: 'Chuva leve', 63: 'Chuva moderada', 65: 'Chuva forte',
    71: 'Neve leve', 73: 'Neve moderada', 75: 'Neve forte',
    80: 'Pancadas leves', 81: 'Pancadas moderadas', 82: 'Pancadas fortes',
    95: 'Tempestade', 96: 'Tempestade c/ granizo', 99: 'Tempestade forte'
  };

  // Ícones Font Awesome correspondentes às condições WMO
  var ICON = {
    0: 'fa-sun', 1: 'fa-sun', 2: 'fa-cloud-sun', 3: 'fa-cloud',
    45: 'fa-smog', 48: 'fa-smog',
    51: 'fa-cloud-drizzle', 53: 'fa-cloud-drizzle', 55: 'fa-cloud-drizzle',
    61: 'fa-cloud-rain', 63: 'fa-cloud-rain', 65: 'fa-cloud-showers-heavy',
    71: 'fa-snowflake', 73: 'fa-snowflake', 75: 'fa-snowflake',
    80: 'fa-cloud-rain', 81: 'fa-cloud-showers-heavy', 82: 'fa-cloud-showers-heavy',
    95: 'fa-bolt', 96: 'fa-bolt', 99: 'fa-bolt'
  };

  /**
   * Renderiza os dados de clima no elemento #clima-info.
   * @param {number}        temp - Temperatura em graus Celsius
   * @param {number}        wind - Velocidade do vento em km/h
   * @param {number|string} umid - Umidade relativa em %
   * @param {number}        code - Código de condição WMO
   */
  function renderClima(temp, wind, umid, code) {
    var desc = WMO[code] || 'Tempo variável';
    var icon = ICON[code] || 'fa-cloud';
    var el = document.getElementById('clima-info');
    if (!el) return;
    el.innerHTML =
      '<i class="fas ' + icon + ' clima-icon"></i>' +
      '<span class="clima-temp">' + temp + '<sup>°C</sup></span>' +
      '<span class="clima-desc">' + desc + '</span>' +
      '<div class="clima-sep"></div>' +
      '<div class="clima-extras">' +
        '<span><i class="fas fa-wind"></i>' + wind + ' km/h</span>' +
        '<span><i class="fas fa-tint"></i>' + umid + '% umidade</span>' +
      '</div>';
  }

  /** Exibe mensagem de erro quando a API não responde. */
  function erroClima() {
    var el = document.getElementById('clima-info');
    if (el) {
      el.innerHTML = '<span class="clima-loader"><i class="fas fa-exclamation-circle"></i> Clima indisponível</span>';
    }
  }

  // URL da API Open-Meteo com parâmetros para Campina Grande do Sul.
  // Usa o endpoint "current" (atualizado), que retorna todos os dados
  // em um único objeto — sem necessidade de cruzar arrays horários.
  var url =
    'https://api.open-meteo.com/v1/forecast' +
    '?latitude=' + LAT +
    '&longitude=' + LON +
    '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code' +
    '&forecast_days=1' +
    '&timezone=America%2FSao_Paulo';

  if (typeof fetch !== 'undefined') {
    fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        var cur  = data.current;
        var temp = Math.round(cur.temperature_2m);
        var wind = Math.round(cur.wind_speed_10m);
        var umid = cur.relative_humidity_2m;
        var code = cur.weather_code;
        renderClima(temp, wind, umid, code);
      })
      .catch(erroClima);
  } else {
    erroClima();
  }
})();


// ── 3. ACORDEÃO DE TRANSPARÊNCIA ────────────────────────────────────────────
/**
 * Abre ou fecha um grupo do acordeão de Transparência Pública.
 * Chamado pelo atributo onclick do botão de cada grupo.
 * @param {HTMLElement} btn - O botão clicado
 */
function toggleTransp(btn) {
  var grupo = btn.closest('.transp-grupo');
  var grid  = grupo.querySelector('.transp-grid');
  var seta  = btn.querySelector('.transp-seta');
  var aberto = grupo.classList.contains('open');

  if (aberto) {
    grid.style.display = 'none';
    seta.classList.replace('fa-chevron-up', 'fa-chevron-down');
    grupo.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  } else {
    grid.style.display = 'flex';
    seta.classList.replace('fa-chevron-down', 'fa-chevron-up');
    grupo.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}


// ── 4. FILTRO DE PERFIS DE ACESSO ────────────────────────────────────────────
/**
 * Filtra o grid de serviços (#grid-acesso-rapido) de acordo com o perfil
 * selecionado (todos, cidadao, servidor, empreendedor).
 */
(function () {
  var btnsPerfil = document.querySelectorAll('.perfil-btn');
  var gridItens  = document.querySelectorAll('#grid-acesso-rapido .grid-item');

  if (!btnsPerfil.length) return;

  /**
   * Mostra apenas os cards que correspondem ao perfil selecionado.
   * @param {string} perfil - Slug do perfil (ex: 'cidadao')
   */
  function filtrar(perfil) {
    gridItens.forEach(function (col) {
      var perfis = (col.getAttribute('data-perfis') || '').split(' ');
      if (perfis.indexOf(perfil) !== -1) {
        col.classList.remove('perfil-oculto');
      } else {
        col.classList.add('perfil-oculto');
      }
    });
  }

  // Adiciona eventos de clique e teclado em cada botão de perfil
  btnsPerfil.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var perfil = btn.getAttribute('data-perfil');

      // Remove estado ativo de todos os botões
      btnsPerfil.forEach(function (b) {
        b.classList.remove('ativo');
        b.setAttribute('aria-expanded', 'false');
      });

      // Ativa o botão clicado
      btn.classList.add('ativo');
      btn.setAttribute('aria-expanded', 'true');

      filtrar(perfil);
    });

    // Suporte a navegação por teclado (Enter e Espaço)
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // Inicializa com o perfil "Todos" ativo
  filtrar('todos');
})();


// ── 5. ACESSIBILIDADE eMAG — CONTROLE DE FONTE + ALTO CONTRASTE ──────────────
/**
 * Implementa os controles de acessibilidade conforme as diretrizes eMAG:
 * - Aumento/diminuição/reset do tamanho de fonte via font-size no <html>
 * - Modo de Alto Contraste via classe .high-contrast no <body>
 * Ambas as preferências são salvas no localStorage.
 */
(function () {

  // ── Controle de Tamanho de Fonte ──────────────────────────────────────────
  // Aplica font-size em px no <html> para que todos os rem/em escalem junto.
  // Base: 16px | Mín: 14px | Máx: 22px | Step: 2px
  var FONTE_BASE = 16;
  var FONTE_MIN  = 14;
  var FONTE_MAX  = 22;
  var FONTE_STEP = 2;
  var FONTE_KEY  = 'pmcgs_fontSize';

  /**
   * Aplica o tamanho de fonte ao <html> e salva no localStorage.
   * @param {number} px - Tamanho em pixels
   */
  function aplicarFonte(px) {
    px = Math.min(FONTE_MAX, Math.max(FONTE_MIN, px));
    document.documentElement.style.fontSize = px + 'px';
    try { localStorage.setItem(FONTE_KEY, px); } catch (e) {}
  }

  /** Retorna o tamanho de fonte atual do <html> (padrão: 16px). */
  function fonteAtual() {
    var fs = document.documentElement.style.fontSize;
    return fs ? parseInt(fs, 10) : FONTE_BASE;
  }

  // Restaura a preferência de fonte salva
  (function () {
    try {
      var salvo = parseInt(localStorage.getItem(FONTE_KEY), 10);
      if (salvo && salvo >= FONTE_MIN && salvo <= FONTE_MAX) {
        aplicarFonte(salvo);
      }
    } catch (e) {}
  })();

  // ── Alto Contraste ─────────────────────────────────────────────────────────
  // Adiciona/remove a classe .high-contrast no <body>.
  // Os estilos de contraste são definidos no style.css.
  var CONTRASTE_KEY = 'pmcgs_highContrast';

  /**
   * Ativa ou desativa o modo de alto contraste.
   * @param {boolean} ativo
   */
  function aplicarContraste(ativo) {
    document.body.classList.toggle('high-contrast', ativo);
    var btn = document.getElementById('btn-contraste');
    if (btn) btn.setAttribute('aria-pressed', ativo ? 'true' : 'false');
    try { localStorage.setItem(CONTRASTE_KEY, ativo ? '1' : '0'); } catch (e) {}
  }

  // Restaura a preferência de contraste salva
  (function () {
    try {
      if (localStorage.getItem(CONTRASTE_KEY) === '1') {
        aplicarContraste(true);
      }
    } catch (e) {}
  })();

  // ── Vinculação dos botões de acessibilidade ───────────────────────────────
  /**
   * Adiciona listener de clique a um elemento pelo ID.
   * @param {string}   id - ID do elemento
   * @param {Function} fn - Callback a executar no clique
   */
  function bind(id, fn) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', function (e) { e.preventDefault(); fn(); });
  }

  bind('btn-fonte-aumentar', function () { aplicarFonte(fonteAtual() + FONTE_STEP); });
  bind('btn-fonte-diminuir', function () { aplicarFonte(fonteAtual() - FONTE_STEP); });
  bind('btn-fonte-resetar',  function () { aplicarFonte(FONTE_BASE); });
  bind('btn-contraste',      function () {
    aplicarContraste(!document.body.classList.contains('high-contrast'));
  });

})();


// ── 6. ATALHOS DE TECLADO eMAG (Alt+1 / Alt+2 / Alt+3) ──────────────────────
/**
 * Implementa os atalhos de teclado obrigatórios pela eMAG:
 *   Alt+1 → Ir para o conteúdo principal (#hero)
 *   Alt+2 → Ir para o menu principal (#pi-navbar)
 *   Alt+3 → Ir para o rodapé (footer)
 */
document.addEventListener('keydown', function (e) {
  if (!e.altKey) return;

  var el;

  // Alt+1 → conteúdo principal
  if (e.key === '1' || e.keyCode === 49) {
    e.preventDefault();
    el = document.getElementById('hero');
    if (el) { el.setAttribute('tabindex', '-1'); el.focus(); el.scrollIntoView({ behavior: 'smooth' }); }
  }

  // Alt+2 → menu principal
  if (e.key === '2' || e.keyCode === 50) {
    e.preventDefault();
    el = document.querySelector('#pi-navbar .nav-link');
    if (el) el.focus();
  }

  // Alt+3 → rodapé
  if (e.key === '3' || e.keyCode === 51) {
    e.preventDefault();
    el = document.querySelector('footer');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
});


// ── 7. VLIBRAS ───────────────────────────────────────────────────────────────
// Inicializa o plugin de tradução para Libras do Governo Federal (VLibras).
// O widget é inserido pelo HTML; aqui apenas ativamos via JS, se disponível.
if (typeof window.VLibras !== 'undefined') {
  new window.VLibras.Widget('https://vlibras.gov.br/app');
}