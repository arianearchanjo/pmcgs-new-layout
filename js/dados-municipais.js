/**
 * conheca-campina.js
 * Prefeitura de Campina Grande do Sul
 *
 * Scripts da seção "Conheça Campina".
 * Isolado: não depende de outros JS do site.
 *
 * 1. Menu lateral colapsável (mobile)
 * 2. Galeria de Prefeitos — expansão de biografia
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────────────
   * 1. MENU LATERAL — TOGGLE MOBILE
   * Controla a abertura/fechamento do menu lateral em telas pequenas.
   * ───────────────────────────────────────────────────────────────────── */
  var toggleBtn = document.getElementById('cc-menu-toggle');
  var menuLista = document.getElementById('cc-menu-lista');

  if (toggleBtn && menuLista) {
    toggleBtn.addEventListener('click', function () {
      var aberto = menuLista.classList.toggle('aberto');
      toggleBtn.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    });

    // Fecha o menu ao clicar em um link (mobile UX)
    menuLista.querySelectorAll('.cc-menu-link').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth <= 991) {
          menuLista.classList.remove('aberto');
          toggleBtn.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }


  /* ─────────────────────────────────────────────────────────────────────
   * 2. GALERIA DE PREFEITOS — EXPANSÃO DE BIOGRAFIA
   *
   * Ao clicar num card de prefeito, exibe um painel de biografia
   * logo abaixo da linha do card no grid.
   * Clicar novamente (ou clicar em outro card) fecha o painel anterior.
   * ───────────────────────────────────────────────────────────────────── */

  // Dados biográficos de cada prefeito (chave = data-id do card)
  var biografias = {
    '1': {
      nome: 'Dacyr Siqueira Trevisan',
      mandato: '1953–1956 · 1965–1968',
      foto: 'https://campinagrandedosul.pr.gov.br/Downloads/Imagens/2026/2553/wo5qrffkkt2.JPG',
      bio: 'Dacyr Siqueira Trevisan foi um dos primeiros prefeitos após a emancipação do município. Liderou o processo de estruturação administrativa de Campina Grande do Sul em seus primeiros anos como município autônomo, contribuindo para a construção das primeiras instituições públicas locais.'
    },
    '2': {
      nome: 'Ary Alves Bandeira',
      mandato: '1956–1960 · 1969–1973',
      foto: 'https://campinagrandedosul.pr.gov.br/Downloads/Imagens/2026/2553/x24xcu2umar.JPG',
      bio: 'Ary Alves Bandeira exerceu dois mandatos na prefeitura, sendo responsável por importantes obras de infraestrutura urbana. Sua gestão consolidou o crescimento ordenado do município durante a segunda metade do século XX.'
    },
    '3': {
      nome: 'Mário Strapasson',
      mandato: '1961–1965',
      foto: 'https://campinagrandedosul.pr.gov.br/Downloads/Imagens/2026/2553/thcy50of30e.JPG',
      bio: 'Mário Strapasson governou o município no período de expansão demográfica da região metropolitana de Curitiba. Durante seu mandato, foram implantados serviços essenciais para a população campinense.'
    },
    '4': {
      nome: 'João Maria de Barros',
      mandato: '1973–1977',
      foto: 'https://campinagrandedosul.pr.gov.br/Downloads/Imagens/2026/2553/14i24ttbtli.jpg',
      bio: 'João Maria de Barros administrou o município no período do regime militar, buscando equilibrar as demandas da população com as diretrizes federais da época. Sua gestão investiu em saneamento e pavimentação.'
    },
    '5': {
      nome: 'Elerian do Rocio Zanetti',
      mandato: '1977–1982 · 1989–1992 · 1997–2000 · 2001–2004',
      foto: 'https://campinagrandedosul.pr.gov.br/Downloads/Imagens/2026/2553/3udrz3elcpl.JPG',
      bio: 'Elerian do Rocio Zanetti foi o prefeito mais vezes eleito na história do município, com quatro mandatos. Sua liderança marcou diferentes fases do desenvolvimento de Campina Grande do Sul, com atuação em infraestrutura, saúde e educação ao longo de décadas.'
    },
    '6': {
      nome: 'Nivaldo Bernardi',
      mandato: '1983–1988',
      foto: 'https://campinagrandedosul.pr.gov.br/Downloads/Imagens/2026/2553/urg0t0rsfln.JPG',
      bio: 'Nivaldo Bernardi governou no período de redemocratização do Brasil. Sua gestão foi marcada pela ampliação da rede de ensino e por obras de infraestrutura no centro urbano do município.'
    },
    '7': {
      nome: 'Marco Antonio Caron',
      mandato: '1993–1996',
      foto: 'https://campinagrandedosul.pr.gov.br/Downloads/Imagens/2026/2553/ekz13uxwt4d.JPG',
      bio: 'Marco Antonio Caron assumiu a prefeitura em um período de estabilização econômica nacional com o Plano Real. Sua gestão buscou modernizar a administração municipal e ampliar os serviços à população.'
    },
    '8': {
      nome: 'Nelise Cristiane Dalprá',
      mandato: '2004–2008',
      foto: 'https://campinagrandedosul.pr.gov.br/Downloads/Imagens/2026/2553/go1fhasroqf.jpg',
      bio: 'Nelise Cristiane Dalprá foi a primeira mulher a ser eleita prefeita de Campina Grande do Sul. Durante sua gestão investiu em programas sociais, habitação e na qualificação dos serviços de saúde do município.'
    },
    '9': {
      nome: 'Luiz Carlos Assunção',
      mandato: '2008–2012 · 2013–2016',
      foto: 'https://campinagrandedosul.pr.gov.br/Downloads/Imagens/2026/2553/gcn24v3cive.jpg',
      bio: 'Luiz Carlos Assunção governou Campina Grande do Sul por dois mandatos consecutivos, entre 2008 e 2016. Sua administração foi marcada pela expansão da malha viária, modernização da gestão pública e investimentos em áreas sociais e educacionais.'
    },
    '10': {
      nome: 'Bihl Zanetti',
      mandato: '2017–2024',
      foto: 'https://campinagrandedosul.pr.gov.br/Downloads/Imagens/2026/2553/zfzdmho3kdd.jpg',
      bio: 'Bihl Zanetti administrou o município por dois mandatos, de 2017 a 2024. Sua gestão priorizou o desenvolvimento econômico, a transformação digital da prefeitura e ações de sustentabilidade ambiental.'
    },
    '11': {
      nome: 'Belenice Koffke Buff Rotini',
      mandato: 'Out.–Dez. 2024',
      foto: 'https://campinagrandedosul.pr.gov.br/Downloads/Imagens/2026/2553/1pfqvafwuqz.png',
      bio: 'Belenice Koffke Buff Rotini exerceu a função de prefeita interina no final de 2024, dando continuidade às ações administrativas no período de transição de governo.'
    },
    'atual': {
      nome: 'Luiz Carlos Assunção',
      mandato: '2025–2028 (mandato atual)',
      foto: 'https://campinagrandedosul.pr.gov.br/Downloads/Imagens/2026/2553/gcn24v3cive.jpg',
      bio: 'Luiz Carlos Assunção retornou ao cargo de prefeito de Campina Grande do Sul em 2025, eleito para o mandato 2025–2028. Com experiência acumulada em gestões anteriores, lidera o município com foco em qualidade de vida, desenvolvimento sustentável e modernização dos serviços públicos.',
      atual: true
    }
  };

  var cardAtivo = null;
  var painelAtual = null;

  var grid = document.getElementById('cc-prefeitos-grid');
  if (!grid) return;

  var cards = grid.querySelectorAll('.cc-prefeito-card');

  cards.forEach(function (card) {
    card.addEventListener('click', function () {
      var id = card.getAttribute('data-id');
      var bio = biografias[id];

      // Mesmo card: fecha
      if (cardAtivo === card) {
        fecharBio();
        return;
      }

      // Fecha painel anterior
      if (painelAtual) fecharBio();

      // Abre novo painel
      cardAtivo = card;
      card.classList.add('ativo');

      var painel = criarPainel(bio);

      // Insere o painel após o último card da mesma "linha visual" do grid
      var posInsercao = calcularPosInsercao(card);
      if (posInsercao) {
        grid.insertBefore(painel, posInsercao.nextSibling);
      } else {
        grid.appendChild(painel);
      }

      painelAtual = painel;

      // Scroll suave até o painel
      setTimeout(function () {
        painel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    });
  });

  function criarPainel(bio) {
    var painel = document.createElement('div');
    painel.className = 'cc-bio-painel' + (bio.atual ? ' dourado' : '');
    painel.setAttribute('role', 'region');
    painel.setAttribute('aria-label', 'Biografia de ' + bio.nome);

    painel.innerHTML =
      '<button class="cc-bio-fechar" aria-label="Fechar biografia" title="Fechar">&times;</button>' +
      '<div class="cc-bio-inner">' +
        '<div class="cc-bio-foto">' +
          (bio.foto ? '<img src="' + bio.foto + '" alt="Foto de ' + bio.nome + '" loading="lazy">' : '') +
        '</div>' +
        '<div class="cc-bio-texto">' +
          '<h3>' + bio.nome + '</h3>' +
          '<p class="cc-bio-mandato"><i class="fas fa-calendar-alt" aria-hidden="true"></i> ' + bio.mandato + '</p>' +
          '<p>' + bio.bio + '</p>' +
        '</div>' +
      '</div>';

    painel.querySelector('.cc-bio-fechar').addEventListener('click', function (e) {
      e.stopPropagation();
      fecharBio();
    });

    return painel;
  }

  function fecharBio() {
    if (cardAtivo) { cardAtivo.classList.remove('ativo'); }
    if (painelAtual && painelAtual.parentNode) { painelAtual.parentNode.removeChild(painelAtual); }
    cardAtivo = null;
    painelAtual = null;
  }

  /**
   * Calcula após qual elemento do grid inserir o painel,
   * de forma que ele apareça abaixo da linha visual do card clicado.
   * Usa o offsetTop do card para agrupar cards na mesma linha.
   */
  function calcularPosInsercao(cardClicado) {
    var topoCard = cardClicado.getBoundingClientRect().top;
    var ultimo = cardClicado;

    cards.forEach(function (c) {
      // Ignora o painel (não é um card)
      if (!c.getAttribute('data-id')) return;
      var topo = c.getBoundingClientRect().top;
      // Margem de tolerância de 10px para mesma linha
      if (Math.abs(topo - topoCard) < 10) {
        // Mantém o último card da linha
        if (Array.prototype.indexOf.call(grid.children, c) >
            Array.prototype.indexOf.call(grid.children, ultimo)) {
          ultimo = c;
        }
      }
    });
    return ultimo;
  }

  // Fecha ao pressionar Escape
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Escape' || e.keyCode === 27) && painelAtual) fecharBio();
  });

})();