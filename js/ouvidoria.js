/**
 * ouvidoria.js — Página da Ouvidoria
 * Prefeitura de Campina Grande do Sul – PR
 *
 * Seções:
 *   1. Tooltips Bootstrap
 *   2. Stepper interativo (Fluxo do Atendimento)
 */


/* ══════════════════════════════════════════════════════════════════════════
   1. TOOLTIPS BOOTSTRAP
   ══════════════════════════════════════════════════════════════════════════ */

$(function () {
  $('[data-toggle="tooltip"]').tooltip();
});


/* ══════════════════════════════════════════════════════════════════════════
   2. STEPPER INTERATIVO — Fluxo do Atendimento
   ══════════════════════════════════════════════════════════════════════════ */

var stepDetails = {
  1: '<b>Recebimento da Manifestação</b><ul><li>Canais disponíveis: Presencialmente, telefone, formulário eletrônico (site) e E-mail.</li><li>Tipos de manifestação: Solicitação, Denúncia, Elogio, Sugestão e Reclamação.</li></ul>',
  2: '<b>Registro no Sistema</b><ul><li>Cadastro da manifestação no sistema da ouvidoria.</li><li>Geração de protocolo para acompanhamento.</li></ul>',
  3: '<b>Análise Inicial (Triagem)</b><ul><li>Verificação de: clareza das informações, tipo e natureza da demanda.</li></ul>',
  4: '<b>Encaminhamento para o Responsável</b><ul><li>A manifestação é direcionada ao setor competente da administração pública municipal.</li></ul>',
  5: '<b>Acompanhamento Interno</b><ul><li>Monitoramento dos prazos de resposta.</li><li>Contato com o órgão caso haja necessidade de complementação ou agilidade.</li></ul>',
  6: '<b>Resposta do Órgão</b><ul><li>A resposta do setor responsável é analisada pela ouvidoria.</li><li>Se a resposta for insuficiente, retorna ao órgão para complementação.</li></ul>',
  7: '<b>Resposta da Ouvidoria para o Cidadão</b><ul><li>A resposta é encaminhada ao cidadão.</li></ul>',
  8: '<b>Encerramento da Manifestação</b><ul><li>Registro do encerramento no sistema.</li></ul>',
  9: '<b>Avaliação do Atendimento (Opcional)</b><ul><li>O cidadão pode avaliar o atendimento e registrar satisfação ou insatisfação com a resposta.</li></ul>'
};

function updateStepSelection(el) {
  document.querySelectorAll('.step-card').forEach(function (card) {
    card.classList.remove('active');
    card.setAttribute('aria-selected', 'false');
  });

  el.classList.add('active');
  el.setAttribute('aria-selected', 'true');

  var step = el.getAttribute('data-step');
  var details = document.getElementById('step-details');
  details.innerHTML = stepDetails[step];
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.step-card').forEach(function (card) {
    card.addEventListener('click', function () {
      updateStepSelection(this);
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        updateStepSelection(this);
      }
    });
  });

  // Ativa a primeira etapa ao carregar
  var firstStep = document.querySelector('.step-card[data-step="1"]');
  if (firstStep) {
    updateStepSelection(firstStep);
  }
});