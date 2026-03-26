/**
 * registrar-pedido.js — Scripts da página Registrar Pedido (e-SIC)
 * Prefeitura de Campina Grande do Sul
 *
 * Funcionalidades:
 * 1. Validação e envio do formulário de registro de pedido
 * 2. Geração de número de protocolo provisório
 * 3. Exibição da confirmação pós-envio
 * 4. Botão "Registrar novo pedido"
 */

(function () {
  'use strict';

  function initFormularioPedido() {
    var form         = document.getElementById('esic-pedido-form');
    var confirmacao  = document.getElementById('esic-confirmacao');
    var numProtocolo = document.getElementById('esic-protocolo-numero');
    var btnNovo      = document.getElementById('esic-novo-pedido-btn');

    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var valido = true;

      form.querySelectorAll('[required]').forEach(function (campo) {
        campo.classList.remove('esic-form-input--erro');

        if (campo.type === 'checkbox') {
          if (!campo.checked) {
            campo.parentElement.classList.add('esic-form-check--erro');
            valido = false;
          } else {
            campo.parentElement.classList.remove('esic-form-check--erro');
          }
        } else {
          if (!campo.value.trim()) {
            campo.classList.add('esic-form-input--erro');
            valido = false;
          }
        }
      });

      if (!valido) {
        var primeiroErro = form.querySelector('.esic-form-input--erro, .esic-form-check--erro input');
        if (primeiroErro) primeiroErro.focus();
        return;
      }

      // Gera protocolo provisório (substituir por retorno real do backend)
      var agora      = new Date();
      var protocolo  = 'e-SIC-' + agora.getFullYear() + '-' +
                       String(Math.floor(Math.random() * 900000) + 100000);

      if (numProtocolo) numProtocolo.textContent = protocolo;

      form.hidden = true;
      if (confirmacao) {
        confirmacao.hidden = false;
        confirmacao.focus();
      }
    });

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
        var primeiroCampo = form.querySelector('[required]');
        if (primeiroCampo) primeiroCampo.focus();
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initFormularioPedido();
  });

})();