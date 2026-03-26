'use strict';

/**
 * index.js — Portal da Prefeitura de Campina Grande do Sul
 * Organização:
 *   1. Autocomplete da busca
 *   2. Widget de Clima (Open-Meteo, sem API key)
 *   3. Acordeão de Transparência
 *   4. Filtro de Perfis de Acesso (grid de serviços)
 *   5. Acessibilidade eMAG — Controle de Fonte + Alto Contraste
 *   6. Atalhos de teclado eMAG (Alt+0 / Alt+1 / Alt+2 / Alt+3)
 *   7. Text-to-Speech (botão único inteligente)
 *   8. VLibras (inicialização)
 */

// ── 1. AUTOCOMPLETE DA BUSCA ─────────────────────────────────────────────────
(function () {
  var searchEl = document.getElementById('search');
  if (searchEl && typeof autocomplete === 'function') {
    autocomplete(searchEl, 'site');
  }
})();


// ── 2. WIDGET DE CLIMA ───────────────────────────────────────────────────────
(function () {
  var LAT = -25.3072;
  var LON = -49.0539;

  var WMO = {
    0: 'Céu limpo', 1: 'Principalmente limpo', 2: 'Parcialmente nublado', 3: 'Nublado',
    45: 'Névoa', 48: 'Névoa com geada',
    51: 'Garoa leve', 53: 'Garoa moderada', 55: 'Garoa intensa',
    61: 'Chuva leve', 63: 'Chuva moderada', 65: 'Chuva forte',
    71: 'Neve leve', 73: 'Neve moderada', 75: 'Neve forte',
    80: 'Pancadas leves', 81: 'Pancadas moderadas', 82: 'Pancadas fortes',
    95: 'Tempestade', 96: 'Tempestade c/ granizo', 99: 'Tempestade forte'
  };

  var ICON = {
    0: 'fa-sun', 1: 'fa-sun', 2: 'fa-cloud-sun', 3: 'fa-cloud',
    45: 'fa-smog', 48: 'fa-smog',
    51: 'fa-cloud-drizzle', 53: 'fa-cloud-drizzle', 55: 'fa-cloud-drizzle',
    61: 'fa-cloud-rain', 63: 'fa-cloud-rain', 65: 'fa-cloud-showers-heavy',
    71: 'fa-snowflake', 73: 'fa-snowflake', 75: 'fa-snowflake',
    80: 'fa-cloud-rain', 81: 'fa-cloud-showers-heavy', 82: 'fa-cloud-showers-heavy',
    95: 'fa-bolt', 96: 'fa-bolt', 99: 'fa-bolt'
  };

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

  function erroClima() {
    var el = document.getElementById('clima-info');
    if (el) {
      el.innerHTML = '<span class="clima-loader"><i class="fas fa-exclamation-circle"></i> Clima indisponível</span>';
    }
  }

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
(function () {
  var btnsPerfil = document.querySelectorAll('.perfil-btn');
  var gridItens  = document.querySelectorAll('#grid-acesso-rapido .grid-item');

  if (!btnsPerfil.length) return;

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

  btnsPerfil.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var perfil = btn.getAttribute('data-perfil');

      btnsPerfil.forEach(function (b) {
        b.classList.remove('ativo');
        b.setAttribute('aria-expanded', 'false');
      });

      btn.classList.add('ativo');
      btn.setAttribute('aria-expanded', 'true');

      filtrar(perfil);
    });

    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  filtrar('todos');
})();


// ── 5. ACESSIBILIDADE eMAG — CONTROLE DE FONTE + ALTO CONTRASTE ──────────────
(function () {

  var FONTE_BASE = 16;
  var FONTE_MIN  = 12;
  var FONTE_MAX  = 26;
  var FONTE_STEP = 2;
  var FONTE_KEY  = 'pmcgs_fontSize';

  function aplicarFonte(px) {
    px = Math.min(FONTE_MAX, Math.max(FONTE_MIN, px));
    document.documentElement.style.fontSize = px + 'px';
    try { localStorage.setItem(FONTE_KEY, px); } catch (e) {}
  }

  function fonteAtual() {
    var fs = document.documentElement.style.fontSize;
    return fs ? parseInt(fs, 10) : FONTE_BASE;
  }

  (function () {
    try {
      var salvo = parseInt(localStorage.getItem(FONTE_KEY), 10);
      if (salvo && salvo >= FONTE_MIN && salvo <= FONTE_MAX) {
        aplicarFonte(salvo);
      }
    } catch (e) {}
  })();

  var CONTRASTE_KEY = 'pmcgs_highContrast';

  function aplicarContraste(ativo) {
    document.body.classList.toggle('high-contrast', ativo);
    ['pi-btn-contraste', 'pi-sb-btn-contraste'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (btn) btn.setAttribute('aria-pressed', ativo ? 'true' : 'false');
    });
    try { localStorage.setItem(CONTRASTE_KEY, ativo ? '1' : '0'); } catch (e) {}
  }

  (function () {
    try {
      if (localStorage.getItem(CONTRASTE_KEY) === '1') {
        aplicarContraste(true);
      }
    } catch (e) {}
  })();

  function bind(id, fn) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', function (e) { e.preventDefault(); fn(); });
  }

  bind('pi-btn-fonte-aumentar', function () { aplicarFonte(fonteAtual() + FONTE_STEP); });
  bind('pi-btn-fonte-diminuir', function () { aplicarFonte(fonteAtual() - FONTE_STEP); });
  bind('pi-btn-fonte-resetar',  function () { aplicarFonte(FONTE_BASE); });
  bind('pi-btn-contraste', function () {
    aplicarContraste(!document.body.classList.contains('high-contrast'));
  });

  // Sidebar (se existir em outras páginas)
  bind('pi-sb-fonte-aumentar', function () { aplicarFonte(fonteAtual() + FONTE_STEP); });
  bind('pi-sb-fonte-diminuir', function () { aplicarFonte(fonteAtual() - FONTE_STEP); });
  bind('pi-sb-fonte-resetar',  function () { aplicarFonte(FONTE_BASE); });
  bind('pi-sb-btn-contraste', function () {
    aplicarContraste(!document.body.classList.contains('high-contrast'));
  });

})();


// ── 6. ATALHOS DE TECLADO eMAG (Alt+0 / Alt+1 / Alt+2 / Alt+3) ──────────────
document.addEventListener('keydown', function (e) {
  if (!e.altKey) return;

  var el;

  // Alt+0 → barra de acessibilidade
  if (e.key === '0' || e.keyCode === 48) {
    e.preventDefault();
    el = document.getElementById('barra-topo');
    if (el) { el.setAttribute('tabindex', '-1'); el.focus(); el.scrollIntoView({ behavior: 'smooth' }); }
  }

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
    el = document.getElementById('pi-footer');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
});


// ── 7. TEXT-TO-SPEECH — botão único inteligente ──────────────────────────────
(function () {

  var TAGS_IGNORADAS = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'NAV', 'HEADER', 'FOOTER', 'BUTTON', 'SELECT', 'OPTION', 'svg', 'IMG'];
  var TAGS_CURSOR    = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'A', 'SPAN', 'LABEL', 'TD', 'TH', 'CAPTION', 'BLOCKQUOTE', 'FIGCAPTION'];

  var RATE        = 0.95;
  var PITCH       = 1.0;
  var CURSOR_MIN  = 8;
  var DEBOUNCE_MS = 400;

  var _ativo             = false;
  var _voz               = null;
  var _ultimoTexto       = '';
  var _elementoDestacado = null;
  var _timerDebounce     = null;
  var _toastTimer        = null;

  function suportado() {
    return ('speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined');
  }

  function selecionarVoz() {
    var vozes = window.speechSynthesis.getVoices();
    if (!vozes || !vozes.length) return null;
    return vozes.find(function (v) { return v.lang.toLowerCase() === 'pt-br'; })
        || vozes.find(function (v) { return v.lang.toLowerCase().startsWith('pt'); })
        || vozes[0]
        || null;
  }

  function garantirVoz(callback) {
    _voz = selecionarVoz();
    if (_voz) { callback(); return; }
    var n = 0;
    var t = setInterval(function () {
      _voz = selecionarVoz();
      if (_voz || ++n > 20) { clearInterval(t); callback(); }
    }, 100);
  }

  function extrairTexto(el) {
    if (!el) return '';
    if (el.nodeType === Node.TEXT_NODE) return el.textContent.trim();
    var st = window.getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden') return '';
    if (TAGS_IGNORADAS.indexOf(el.tagName) !== -1) return '';
    var role = (el.getAttribute('role') || '').toLowerCase();
    if (role === 'navigation' || role === 'banner' || role === 'complementary') return '';
    if (el.getAttribute('aria-hidden') === 'true') return '';
    var partes = [];
    el.childNodes.forEach(function (filho) {
      var t = extrairTexto(filho);
      if (t) partes.push(t);
    });
    return partes.join(' ');
  }

  function removerDestaque() {
    if (_elementoDestacado) {
      _elementoDestacado.removeAttribute('data-tts-highlight');
      _elementoDestacado = null;
    }
  }

  function destacar(el) {
    removerDestaque();
    if (!el) return;
    _elementoDestacado = el;
    el.setAttribute('data-tts-highlight', 'true');
  }

  function promoverSemantico(el) {
    if (!el || el === document.body) return null;
    var limite   = 6;
    var conteudo = document.getElementById('pi-conteudo');
    var c        = el;
    while (c && c !== document.body && limite-- > 0) {
      if (conteudo && !conteudo.contains(c)) return null;
      if (TAGS_CURSOR.indexOf(c.tagName || '') !== -1) return c;
      c = c.parentElement;
    }
    return null;
  }

  function lerElemento(texto, el) {
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(texto);
    if (_voz) u.voice = _voz;
    u.lang  = (_voz && _voz.lang) ? _voz.lang : 'pt-BR';
    u.rate  = RATE;
    u.pitch = PITCH;
    u.onend   = function () { removerDestaque(); };
    u.onerror = function (ev) {
      if (ev.error !== 'interrupted' && ev.error !== 'canceled') console.warn('[TTS] Erro:', ev.error);
      removerDestaque();
    };
    destacar(el);
    window.speechSynthesis.speak(u);
  }

  function _onCursor(e) {
    if (!_ativo) return;
    var alvo = e.target;
    if (!alvo || alvo.nodeType !== Node.ELEMENT_NODE) return;
    var barra = document.getElementById('barra-topo');
    if (barra && barra.contains(alvo)) return;
    if (alvo.getAttribute('aria-hidden') === 'true') return;
    var elAlvo = promoverSemantico(alvo);
    if (!elAlvo) return;
    var texto = extrairTexto(elAlvo).replace(/\s+/g, ' ').trim();
    if (!texto || texto.length < CURSOR_MIN) return;
    if (texto === _ultimoTexto) return;
    clearTimeout(_timerDebounce);
    _timerDebounce = setTimeout(function () {
      if (!_ativo) return;
      _ultimoTexto = texto;
      if (!_voz) {
        garantirVoz(function () { lerElemento(texto, elAlvo); });
      } else {
        lerElemento(texto, elAlvo);
      }
    }, DEBOUNCE_MS);
  }

  function atualizarBotaoTTS() {
    var btn = document.getElementById('pi-btn-tts');
    if (!btn) return;
    var icone = btn.querySelector('i');
    if (_ativo) {
      btn.setAttribute('aria-pressed', 'true');
      btn.setAttribute('aria-label', 'Desativar leitura de texto');
      btn.setAttribute('title', 'Desativar leitura de texto');
      btn.classList.add('tts-ativo');
      if (icone) { icone.className = 'fas fa-assistive-listening-systems'; icone.setAttribute('aria-hidden', 'true'); }
    } else {
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-label', 'Converter o texto em áudio');
      btn.setAttribute('title', 'Converter o texto em áudio');
      btn.classList.remove('tts-ativo');
      if (icone) { icone.className = 'fas fa-headphones'; icone.setAttribute('aria-hidden', 'true'); }
    }
  }

  function fecharToast(toast) {
    if (!toast) return;
    clearTimeout(_toastTimer);
    toast.classList.remove('pi-toast-visivel');
    toast.classList.add('pi-toast-saindo');
    setTimeout(function () {
      if (toast && toast.parentNode) toast.parentNode.removeChild(toast);
    }, 350);
  }

  function mostrarToast(mensagem, duracao) {
    duracao = duracao || 3000;
    clearTimeout(_toastTimer);
    var toast = document.getElementById('pi-tts-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'pi-tts-toast';
      toast.setAttribute('role', 'alert');
      toast.setAttribute('aria-live', 'assertive');
      toast.setAttribute('aria-atomic', 'true');
      document.body.appendChild(toast);
    }
    toast.innerHTML =
      '<div class="pi-toast-inner">' +
        '<div class="pi-toast-header">' +
          '<span class="pi-toast-label">Informação</span>' +
          '<button class="pi-toast-close" aria-label="Fechar notificação" type="button">&#x2715;</button>' +
        '</div>' +
        '<p class="pi-toast-msg">' + mensagem + '</p>' +
      '</div>';
    toast.querySelector('.pi-toast-close').addEventListener('click', function () { fecharToast(toast); });
    toast.classList.remove('pi-toast-saindo');
    void toast.offsetWidth;
    toast.classList.add('pi-toast-visivel');
    _toastTimer = setTimeout(function () { fecharToast(toast); }, duracao);
  }

  function ativarTTS() {
    if (_ativo) return;
    _ativo       = true;
    _ultimoTexto = '';
    document.addEventListener('mouseover', _onCursor, { passive: true });
    document.addEventListener('focusin',   _onCursor, { passive: true });
    var c = document.getElementById('pi-conteudo');
    if (c) c.classList.add('tts-cursor-mode');
    atualizarBotaoTTS();
    mostrarToast('Conversor de texto para áudio ativado!');
  }

  function desativarTTS() {
    if (!_ativo) return;
    _ativo = false;
    document.removeEventListener('mouseover', _onCursor);
    document.removeEventListener('focusin',   _onCursor);
    clearTimeout(_timerDebounce);
    window.speechSynthesis.cancel();
    removerDestaque();
    var c = document.getElementById('pi-conteudo');
    if (c) c.classList.remove('tts-cursor-mode');
    atualizarBotaoTTS();
    mostrarToast('Conversor de texto para áudio desativado.');
  }

  function toggleTTS() {
    if (!suportado()) {
      mostrarToast('Seu navegador não suporta síntese de voz.');
      return;
    }
    if (_ativo) { desativarTTS(); } else { ativarTTS(); }
  }

  // Esc desativa o TTS se estiver ativo
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Escape' || e.keyCode === 27) && _ativo) {
      desativarTTS();
    }
  });

  // Vincula o botão TTS após o DOM estar pronto
  function bindTTS() {
    var btn = document.getElementById('pi-btn-tts');
    if (btn) {
      btn.addEventListener('click', function (e) { e.preventDefault(); toggleTTS(); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindTTS);
  } else {
    bindTTS();
  }

  // Injeta estilos do TTS
  (function injetarEstilosTTS() {
    if (document.getElementById('pi-tts-styles')) return;
    var style = document.createElement('style');
    style.id = 'pi-tts-styles';
    style.textContent = '\
      #pi-btn-tts { transition: color 0.2s ease, background-color 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease; }\
      #pi-btn-tts.tts-ativo, #pi-btn-tts[aria-pressed="true"] {\
        color: #fff !important; background-color: var(--cor-primaria, #1a5276) !important;\
        border-radius: 3px; opacity: 1 !important; animation: tts-ring 2s ease-in-out infinite; }\
      @keyframes tts-ring {\
        0%,100% { box-shadow: 0 0 0 2px var(--cor-primaria,#1a5276), 0 0 0 4px rgba(26,82,118,.28); }\
        50%      { box-shadow: 0 0 0 2px var(--cor-primaria,#1a5276), 0 0 0 7px rgba(26,82,118,.08); } }\
      [data-tts-highlight="true"] { outline: 2px solid var(--cor-primaria,#1a5276) !important; outline-offset: 3px !important; border-radius: 2px; }\
      .tts-cursor-mode, .tts-cursor-mode p, .tts-cursor-mode h1, .tts-cursor-mode h2,\
      .tts-cursor-mode h3, .tts-cursor-mode h4, .tts-cursor-mode h5, .tts-cursor-mode h6,\
      .tts-cursor-mode li, .tts-cursor-mode a, .tts-cursor-mode span,\
      .tts-cursor-mode td, .tts-cursor-mode th {\
        cursor: url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'22\' height=\'22\' viewBox=\'0 0 22 22\'%3E%3Ccircle cx=\'11\' cy=\'11\' r=\'10\' fill=\'%231a5276\' opacity=\'0.15\'/%3E%3Cpath d=\'M7 8.5v5l3.5-1.75L14 13.5v-5\' stroke=\'%231a5276\' stroke-width=\'1.5\' fill=\'none\' stroke-linejoin=\'round\'/%3E%3C/svg%3E") 11 11, pointer !important; }\
      @media (prefers-reduced-motion: reduce) {\
        #pi-btn-tts.tts-ativo, #pi-btn-tts[aria-pressed="true"] { animation: none !important; box-shadow: 0 0 0 2px var(--cor-primaria,#1a5276) !important; } }\
      #pi-btn-fonte-aumentar:focus-visible, #pi-btn-fonte-diminuir:focus-visible,\
      #pi-btn-fonte-resetar:focus-visible, #pi-btn-contraste:focus-visible,\
      #pi-btn-tts:focus-visible { outline: 3px solid var(--cor-primaria,#1a5276) !important; outline-offset: 2px !important; border-radius: 2px; }\
      #barra-topo:focus, #pi-conteudo:focus, #pi-footer:focus { outline: none !important; }\
      #pi-tts-toast { position:fixed; top:72px; right:16px; z-index:99999; min-width:260px; max-width:340px;\
        pointer-events:none; opacity:0; transform:translateY(-12px); transition:opacity .25s ease,transform .25s ease; }\
      #pi-tts-toast.pi-toast-visivel { opacity:1; transform:translateY(0); pointer-events:auto; }\
      #pi-tts-toast.pi-toast-saindo  { opacity:0; transform:translateY(-12px); pointer-events:none; }\
      .pi-toast-inner { background:#fff; border-left:5px solid #2e7d32; border-radius:4px;\
        box-shadow:0 4px 16px rgba(0,0,0,.18),0 1px 4px rgba(0,0,0,.10); overflow:hidden; font-family:inherit; }\
      .pi-toast-header { display:flex; align-items:center; justify-content:space-between;\
        background:#2e7d32; padding:6px 10px 6px 12px; }\
      .pi-toast-label { color:#fff; font-size:12px; font-weight:700; letter-spacing:.04em; text-transform:uppercase; }\
      .pi-toast-close { background:none; border:none; color:rgba(255,255,255,.85); font-size:14px; line-height:1;\
        cursor:pointer; padding:0 2px; margin:0; transition:color .15s; }\
      .pi-toast-close:hover { color:#fff; }\
      .pi-toast-msg { margin:0; padding:9px 12px 10px; font-size:13px; color:#1a1a1a; line-height:1.4; }\
      @media (max-width:480px) { #pi-tts-toast { right:8px; left:8px; min-width:unset; max-width:unset; } }\
      @media (prefers-reduced-motion:reduce) {\
        #pi-tts-toast { transition:opacity .15s ease; transform:none !important; }\
        #pi-tts-toast.pi-toast-saindo { transform:none !important; } }';
    document.head.appendChild(style);
  })();

})();


// ── 8. VLIBRAS ───────────────────────────────────────────────────────────────
(function inicializarVLibras() {
  if (typeof window.VLibras !== 'undefined') {
    new window.VLibras.Widget('https://vlibras.gov.br/app');
  }
})();