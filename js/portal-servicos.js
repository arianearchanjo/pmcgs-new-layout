/**
 * portal-servicos.js — Página Portal de Serviços
 * Prefeitura de Campina Grande do Sul – PR
 *
 * Módulos:
 *   1. Base de dados dos serviços
 *   2. Estado dos filtros ativos
 *   3. Renderização dos cards
 *   4. Lógica de filtragem e busca
 *   5. Eventos dos filtros
 *   6. Eventos da barra de pesquisa
 *   7. Acessibilidade (eMAG) — controle de fonte + contraste
 *   8. Inicialização
 */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════════════════
     1. BASE DE DADOS DOS SERVIÇOS
     Cada objeto representa um serviço municipal.
     Campos:
       id          — identificador único
       nome        — nome do serviço (usado na busca)
       descricao   — descrição curta exibida no card
       atendimento — 'online' | 'presencial' | 'hibrido'
       publico     — 'cidadao' | 'empresa' | 'servidor'
       link        — URL para iniciar o serviço
  ════════════════════════════════════════════════════════════════════════ */

  var SERVICOS = [
    {
      id: 1,
      nome: 'Acesso a Atoteca',
      descricao: 'Acesso ao sistema administrativo Atoteca para gestão de documentos municipais.',
      atendimento: 'online',
      publico: 'servidor',
      link: 'https://campinagrandedosul.pr.gov.br/atoteca'
    },
    {
      id: 2,
      nome: 'Consulta de Débitos',
      descricao: 'Consulte débitos de IPTU, ISS, taxas e outros tributos municipais.',
      atendimento: 'online',
      publico: 'cidadao',
      link: 'https://campinagrandedosul.pr.gov.br/consulta-de-debitos'
    },
    {
      id: 3,
      nome: 'Emissão de Certidão de Débitos',
      descricao: 'Emita a certidão negativa ou positiva de débitos municipais online.',
      atendimento: 'online',
      publico: 'cidadao',
      link: 'https://campinagrandedosul.pr.gov.br/emissao-da-certidao-de-debitos'
    },
    {
      id: 4,
      nome: 'Emissão de Nota Fiscal de Serviços',
      descricao: 'Emita notas fiscais de serviços eletrônicas (NFS-e) pelo portal do prestador.',
      atendimento: 'online',
      publico: 'empresa',
      link: 'https://campinagrandedosul.pr.gov.br/emissao-da-nota-fiscal-de-servicos'
    },
    {
      id: 5,
      nome: 'Consulta de Processos',
      descricao: 'Acompanhe o andamento de processos protocolados na Prefeitura.',
      atendimento: 'online',
      publico: 'cidadao',
      link: 'https://campinagrandedosul.pr.gov.br/consulta-de-processos'
    },
    {
      id: 6,
      nome: 'Ouvidoria',
      descricao: 'Registre reclamações, sugestões, elogios ou denúncias ao município.',
      atendimento: 'hibrido',
      publico: 'cidadao',
      link: 'https://campinagrandedosul.pr.gov.br/ouvidoria'
    },
    {
      id: 7,
      nome: 'Licença para Funcionamento',
      descricao: 'Solicite ou renove o Alvará de Funcionamento para estabelecimentos comerciais.',
      atendimento: 'presencial',
      publico: 'empresa',
      link: 'https://campinagrandedosul.pr.gov.br/licenca-para-funcionamento'
    },
    {
      id: 8,
      nome: 'Acesso à Informação (e-SIC)',
      descricao: 'Solicite informações públicas por meio do Sistema Eletrônico do Serviço de Informações ao Cidadão.',
      atendimento: 'online',
      publico: 'cidadao',
      link: 'https://campinagrandedosul.oxy.elotech.com.br/portaltransparencia/1/esic'
    },
    {
      id: 9,
      nome: 'Licitações e Contratos',
      descricao: 'Acompanhe editais, resultados e atas de licitações e contratos do município.',
      atendimento: 'online',
      publico: 'empresa',
      link: 'https://campinagrandedosul.pr.gov.br/licitacoes'
    },
    {
      id: 10,
      nome: 'Portal da Transparência',
      descricao: 'Acesse receitas, despesas, folha de pagamento e demais dados financeiros do município.',
      atendimento: 'online',
      publico: 'cidadao',
      link: 'https://campinagrandedosul.oxy.elotech.com.br/portaltransparencia/1/'
    },
    {
      id: 11,
      nome: 'Holerite do Servidor',
      descricao: 'Acesse seus contracheques e comprovantes de rendimentos pelo portal do servidor.',
      atendimento: 'online',
      publico: 'servidor',
      link: 'https://campinagrandedosul.pr.gov.br/holerite'
    },
    {
      id: 12,
      nome: 'Protocolo de Documentos',
      descricao: 'Protocole documentos, requerimentos e petições junto à Prefeitura.',
      atendimento: 'presencial',
      publico: 'cidadao',
      link: 'https://campinagrandedosul.pr.gov.br/protocolo'
    },
    {
      id: 13,
      nome: 'Habite-se e Alvará de Construção',
      descricao: 'Solicite aprovação de projetos, alvarás de construção e Certificado de Habite-se.',
      atendimento: 'hibrido',
      publico: 'cidadao',
      link: 'https://campinagrandedosul.pr.gov.br/habite-se'
    },
    {
      id: 14,
      nome: 'Consulta de Legislação Municipal',
      descricao: 'Pesquise leis, decretos, portarias e atos normativos do município.',
      atendimento: 'online',
      publico: 'cidadao',
      link: 'https://campinagrandedosul.pr.gov.br/consulta-legislacao-municipal'
    },
    {
      id: 15,
      nome: 'Matrícula Escolar Municipal',
      descricao: 'Realize a matrícula de alunos nas escolas e creches da rede municipal de ensino.',
      atendimento: 'hibrido',
      publico: 'cidadao',
      link: 'https://campinagrandedosul.pr.gov.br/matricula-escolar'
    },
    {
      id: 16,
      nome: 'Agendamento de Serviços de Saúde',
      descricao: 'Agende consultas, exames e procedimentos nas unidades de saúde do município.',
      atendimento: 'hibrido',
      publico: 'cidadao',
      link: 'https://campinagrandedosul.pr.gov.br/agendamento-saude'
    },
    {
      id: 17,
      nome: 'PGDI — Plano de Gestão do Desempenho',
      descricao: 'Acesse e registre as avaliações de desempenho individuais dos servidores municipais.',
      atendimento: 'online',
      publico: 'servidor',
      link: 'https://campinagrandedosul.pr.gov.br/pgdi'
    },
    {
      id: 18,
      nome: 'Endereços e Telefones Municipais',
      descricao: 'Consulte endereços, telefones e horários de atendimento das secretarias e órgãos municipais.',
      atendimento: 'online',
      publico: 'cidadao',
      link: 'https://campinagrandedosul.pr.gov.br/consulta-enderecos'
    }
  ];


  /* ══════════════════════════════════════════════════════════════════════
     2. ESTADO DOS FILTROS ATIVOS
     Controla qual opção está selecionada em cada grupo de filtro.
  ════════════════════════════════════════════════════════════════════════ */

  var estado = {
    busca:       '',       // texto digitado na barra de pesquisa
    publico:     'todos',  // 'todos' | 'cidadao' | 'empresa' | 'servidor'
    atendimento: 'todos'   // 'todos' | 'online' | 'presencial' | 'hibrido'
  };


  /* ══════════════════════════════════════════════════════════════════════
     3. RENDERIZAÇÃO DOS CARDS
     Gera o HTML de um card a partir de um objeto de serviço e o insere
     na lista. Usa template string para facilitar leitura e manutenção.
  ════════════════════════════════════════════════════════════════════════ */

  /**
   * Retorna a classe CSS e o rótulo da tag de acordo com o tipo de atendimento.
   * @param {string} atendimento
   * @returns {{ classe: string, rotulo: string }}
   */
  function obterTag(atendimento) {
    switch (atendimento) {
      case 'online':     return { classe: 'tag-online',     rotulo: 'Online' };
      case 'presencial': return { classe: 'tag-presencial', rotulo: 'Presencial' };
      case 'hibrido':    return { classe: 'tag-hibrido',    rotulo: 'Híbrido' };
      default:           return { classe: 'tag-online',     rotulo: atendimento };
    }
  }

  /**
   * Cria e retorna o elemento HTML do card de um serviço.
   * @param {Object} servico — objeto da base SERVICOS
   * @returns {HTMLElement}
   */
  function criarCard(servico) {
    var tag = obterTag(servico.atendimento);

    var article = document.createElement('article');
    article.className  = 'servico-card';
    article.setAttribute('role', 'listitem');
    article.setAttribute('data-publico',     servico.publico);
    article.setAttribute('data-atendimento', servico.atendimento);
    article.setAttribute('data-nome',        servico.nome.toLowerCase());

    article.innerHTML =
      '<span class="' + tag.classe + '">' + tag.rotulo + '</span>' +
      '<h3>' + servico.nome + '</h3>' +
      '<p>' + servico.descricao + '</p>' +
      '<a class="btn-servico" href="' + servico.link + '"' +
         ' aria-label="Iniciar: ' + servico.nome + '">' +
        '<i class="fas fa-arrow-right" aria-hidden="true"></i>' +
        ' Iniciar' +
      '</a>';

    return article;
  }

  /**
   * Renderiza todos os cards na lista do DOM.
   * Chamado uma única vez na inicialização.
   */
  function renderizarTodos() {
    var lista = document.getElementById('ps-lista');
    if (!lista) return;

    var fragment = document.createDocumentFragment();
    SERVICOS.forEach(function (s) {
      fragment.appendChild(criarCard(s));
    });
    lista.appendChild(fragment);
  }


  /* ══════════════════════════════════════════════════════════════════════
     4. LÓGICA DE FILTRAGEM E BUSCA
     Aplica os filtros ativos e a busca textual, mostrando/ocultando
     os cards sem re-renderizá-los (melhor performance).
  ════════════════════════════════════════════════════════════════════════ */

  /**
   * Aplica os filtros e a busca a todos os cards da lista.
   * Atualiza o contador de resultados e exibe/oculta a mensagem vazia.
   */
  function filtrar() {
    var lista    = document.getElementById('ps-lista');
    var contador = document.getElementById('ps-num-resultados');
    var semRes   = document.getElementById('ps-sem-resultado');

    if (!lista) return;

    var cards    = lista.querySelectorAll('.servico-card');
    var termoRaw = estado.busca.trim();

    // Normaliza o texto de busca removendo acentos para comparação mais flexível
    var termo = normalizar(termoRaw);

    var visiveis = 0;

    cards.forEach(function (card) {
      var pubCard  = card.getAttribute('data-publico');
      var atenCard = card.getAttribute('data-atendimento');
      var nomeCard = normalizar(card.getAttribute('data-nome'));

      // Verifica se o card passa em cada filtro ativo
      var passaPublico     = (estado.publico     === 'todos' || pubCard  === estado.publico);
      var passaAtendimento = (estado.atendimento === 'todos' || atenCard === estado.atendimento);
      var passaBusca       = (termo === '' || nomeCard.indexOf(termo) !== -1);

      if (passaPublico && passaAtendimento && passaBusca) {
        card.style.display = '';
        visiveis++;
      } else {
        card.style.display = 'none';
      }
    });

    // Atualiza contador
    if (contador) contador.textContent = visiveis;

    // Exibe/oculta mensagem de sem resultado
    if (semRes) {
      semRes.style.display = (visiveis === 0) ? '' : 'none';
    }
  }

  /**
   * Remove acentos e converte para minúsculas para busca insensível a acento.
   * @param {string} texto
   * @returns {string}
   */
  function normalizar(texto) {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }


  /* ══════════════════════════════════════════════════════════════════════
     5. EVENTOS DOS FILTROS
     Vincula o clique em cada botão de filtro à atualização do estado
     e à re-aplicação da filtragem.
  ════════════════════════════════════════════════════════════════════════ */

  /**
   * Inicializa os eventos de clique para todos os botões de filtro.
   * Atualiza aria-pressed e o estado interno ao clicar.
   */
  function inicializarFiltros() {
    var botoes = document.querySelectorAll('.ps-filtro-btn');

    botoes.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var grupo = btn.getAttribute('data-filtro');  // 'publico' | 'atendimento'
        var valor = btn.getAttribute('data-valor');   // 'todos' | valor específico

        // Remove o estado ativo dos outros botões do mesmo grupo
        var gruposBotoes = document.querySelectorAll('[data-filtro="' + grupo + '"]');
        gruposBotoes.forEach(function (b) {
          b.classList.remove('ativo');
          b.setAttribute('aria-pressed', 'false');
        });

        // Ativa o botão clicado
        btn.classList.add('ativo');
        btn.setAttribute('aria-pressed', 'true');

        // Atualiza o estado
        estado[grupo] = valor;

        // Re-aplica os filtros
        filtrar();
      });
    });

    // Botão de limpar filtros (na coluna de filtros)
    var btnLimpar = document.getElementById('ps-btn-limpar-filtros');
    if (btnLimpar) {
      btnLimpar.addEventListener('click', limparFiltros);
    }

    // Botão de limpar filtros (na mensagem de sem resultado)
    var btnLimparVazio = document.getElementById('ps-btn-limpar-filtros-vazio');
    if (btnLimparVazio) {
      btnLimparVazio.addEventListener('click', limparFiltros);
    }
  }

  /**
   * Reseta todos os filtros para "Todos" e limpa a barra de busca.
   */
  function limparFiltros() {
    // Reseta o estado
    estado.publico     = 'todos';
    estado.atendimento = 'todos';
    estado.busca       = '';

    // Reseta os botões de filtro
    var botoes = document.querySelectorAll('.ps-filtro-btn');
    botoes.forEach(function (btn) {
      var ativo = btn.getAttribute('data-valor') === 'todos';
      btn.classList.toggle('ativo', ativo);
      btn.setAttribute('aria-pressed', ativo ? 'true' : 'false');
    });

    // Limpa a barra de pesquisa
    var inputBusca = document.getElementById('ps-busca');
    if (inputBusca) {
      inputBusca.value = '';
    }

    // Oculta botão de limpar X
    var btnX = document.getElementById('ps-btn-limpar');
    if (btnX) btnX.style.display = 'none';

    // Re-aplica os filtros
    filtrar();
  }


  /* ══════════════════════════════════════════════════════════════════════
     6. EVENTOS DA BARRA DE PESQUISA
     Atualiza o estado de busca a cada tecla digitada (input event)
     e exibe/oculta o botão de limpar (X).
  ════════════════════════════════════════════════════════════════════════ */

  /**
   * Inicializa os eventos da barra de pesquisa de serviços.
   */
  function inicializarBusca() {
    var inputBusca = document.getElementById('ps-busca');
    var btnX       = document.getElementById('ps-btn-limpar');

    if (!inputBusca) return;

    // Atualiza a busca a cada digitação
    inputBusca.addEventListener('input', function () {
      estado.busca = inputBusca.value;

      // Exibe ou oculta o botão X
      if (btnX) {
        btnX.style.display = inputBusca.value.length > 0 ? '' : 'none';
      }

      filtrar();
    });

    // Botão X: limpa apenas o campo de busca (mantém outros filtros)
    if (btnX) {
      btnX.addEventListener('click', function () {
        inputBusca.value = '';
        estado.busca     = '';
        btnX.style.display = 'none';
        inputBusca.focus();
        filtrar();
      });
    }
  }


  /* ══════════════════════════════════════════════════════════════════════
     7. ACESSIBILIDADE (eMAG) — Controle de fonte e contraste
     Reutiliza as mesmas chaves de localStorage do acessibilidade.js,
     garantindo que as preferências persistam entre páginas.
  ════════════════════════════════════════════════════════════════════════ */

  var FONTE_BASE = 16;
  var FONTE_MIN  = 14;
  var FONTE_MAX  = 22;
  var FONTE_STEP = 2;
  var FONTE_KEY     = 'pmcgs_fontSize';
  var CONTRASTE_KEY = 'pmcgs_highContrast';

  function aplicarFonte(px) {
    px = Math.min(FONTE_MAX, Math.max(FONTE_MIN, px));
    document.documentElement.style.fontSize = px + 'px';
    try { localStorage.setItem(FONTE_KEY, px); } catch (e) {}
  }

  function fonteAtual() {
    var fs = document.documentElement.style.fontSize;
    return fs ? parseInt(fs, 10) : FONTE_BASE;
  }

  function aplicarContraste(ativo) {
    document.body.classList.toggle('high-contrast', ativo);
    var btns = [
      document.getElementById('pi-btn-contraste')
    ];
    btns.forEach(function (btn) {
      if (btn) btn.setAttribute('aria-pressed', ativo ? 'true' : 'false');
    });
    try { localStorage.setItem(CONTRASTE_KEY, ativo ? '1' : '0'); } catch (e) {}
  }

  function restaurarPreferencias() {
    try {
      var fonteS = parseInt(localStorage.getItem(FONTE_KEY), 10);
      if (fonteS && fonteS >= FONTE_MIN && fonteS <= FONTE_MAX) {
        aplicarFonte(fonteS);
      }
      if (localStorage.getItem(CONTRASTE_KEY) === '1') {
        aplicarContraste(true);
      }
    } catch (e) {}
  }

  function bind(id, fn) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', function (e) {
      e.preventDefault();
      fn();
    });
  }

  function inicializarAcessibilidade() {
    restaurarPreferencias();

    bind('pi-btn-fonte-aumentar', function () { aplicarFonte(fonteAtual() + FONTE_STEP); });
    bind('pi-btn-fonte-diminuir', function () { aplicarFonte(fonteAtual() - FONTE_STEP); });
    bind('pi-btn-fonte-resetar',  function () { aplicarFonte(FONTE_BASE); });
    bind('pi-btn-contraste', function () {
      aplicarContraste(!document.body.classList.contains('high-contrast'));
    });
  }

  /* Atalhos de teclado eMAG (Alt+1, Alt+2, Alt+3) */
  document.addEventListener('keydown', function (e) {
    if (!e.altKey) return;

    if (e.key === '1' || e.keyCode === 49) {
      e.preventDefault();
      var c = document.getElementById('ps-conteudo');
      if (c) { c.setAttribute('tabindex', '-1'); c.focus(); c.scrollIntoView({ behavior: 'smooth' }); }
    }
    if (e.key === '2' || e.keyCode === 50) {
      e.preventDefault();
      var link = document.querySelector('#pi-nav-list .nav-link');
      if (link) link.focus();
    }
    if (e.key === '3' || e.keyCode === 51) {
      e.preventDefault();
      var rodape = document.getElementById('pi-footer');
      if (rodape) rodape.scrollIntoView({ behavior: 'smooth' });
    }
  });


  /* ══════════════════════════════════════════════════════════════════════
     8. INICIALIZAÇÃO
     Ponto de entrada do script.
     Executado quando o DOM estiver completamente carregado.
  ════════════════════════════════════════════════════════════════════════ */

  document.addEventListener('DOMContentLoaded', function () {
    // 1. Renderiza todos os cards na lista
    renderizarTodos();

    // 2. Vincula eventos dos filtros
    inicializarFiltros();

    // 3. Vincula eventos da barra de pesquisa
    inicializarBusca();

    // 4. Restaura preferências de acessibilidade (fonte + contraste)
    inicializarAcessibilidade();

    // 5. Aplica os filtros iniciais para exibir o contador correto
    filtrar();
  });

})();


/* ══════════════════════════════════════════════════════════════════════
   VLibras — inicialização do widget de tradução para Libras
   (Governo Federal). O script vlibras-plugin.js deve ser carregado
   antes deste arquivo.
════════════════════════════════════════════════════════════════════════ */
if (typeof window.VLibras !== 'undefined') {
  new window.VLibras.Widget('https://vlibras.gov.br/app');
}