/**
 * ouvidoria.js — Scripts da página Ouvidoria Geral do Município
 * Prefeitura de Campina Grande do Sul
 *
 * Funcionalidades:
 * 1. Destaque do passo ativo no fluxo de atendimento (clique/teclado)
 * 2. Botão "voltar ao topo" (mostrar/ocultar por scroll)
 * 3. Animação de entrada dos cards (Intersection Observer)
 */

(function () {
  'use strict';


  /* ============================================================
     1. FLUXO DE ATENDIMENTO — destaque ao clicar no passo
  ============================================================ */
  function initFluxoPassos() {
    var passos = document.querySelectorAll('.ouv-passo');
    if (!passos.length) return;

    passos.forEach(function (passo) {
      /* Tornar o passo clicável via teclado */
      passo.setAttribute('tabindex', '0');
      passo.setAttribute('role', 'button');

      function toggleAtivo() {
        var jaAtivo = passo.classList.contains('ouv-passo--ativo');

        /* Remove destaque de todos */
        passos.forEach(function (p) {
          p.classList.remove('ouv-passo--ativo');
        });

        /* Aplica (ou remove) no clicado */
        if (!jaAtivo) {
          passo.classList.add('ouv-passo--ativo');
          passo.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }

      passo.addEventListener('click', toggleAtivo);
      passo.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleAtivo();
        }
      });
    });
  }


  /* ============================================================
     2. BOTÃO VOLTAR AO TOPO
  ============================================================ */
  function initBackTop() {
    var btn = document.querySelector('.pi-back-top');
    if (!btn) return;

    function toggleVisivel() {
      if (window.scrollY > 400) {
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
      } else {
        btn.style.opacity = '0';
        btn.style.pointerEvents = 'none';
      }
    }

    btn.style.opacity = '0';
    btn.style.pointerEvents = 'none';
    btn.style.transition = 'opacity 0.3s ease';

    window.addEventListener('scroll', toggleVisivel, { passive: true });

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  /* ============================================================
     3. ANIMAÇÃO DE ENTRADA — cards e itens de legislação
  ============================================================ */
  function initAnimacoesEntrada() {
    if (!('IntersectionObserver' in window)) return;

    var alvos = document.querySelectorAll(
      '.ouv-card, .ouv-lei-item, .ouv-servico-item, .ouv-pesquisa-card'
    );

    if (!alvos.length) return;

    /* Prepara o estado inicial */
    alvos.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    alvos.forEach(function (el) { observer.observe(el); });
  }


  /* ============================================================
     INICIALIZAÇÃO
  ============================================================ */
  document.addEventListener('DOMContentLoaded', function () {
    initFluxoPassos();
    initBackTop();
    initAnimacoesEntrada();
  });

})();