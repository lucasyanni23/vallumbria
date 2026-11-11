/* =====================================================================
   VALLUMBRÍA — CONTEÚDO INICIAL DO SITE
   Este arquivo é só o ponto de partida. Tudo aqui pode ser alterado
   pelo mestre dentro do próprio site, em Painel → Editor do site.
   O que for salvo pelo Editor passa a valer no lugar deste arquivo.
   ===================================================================== */

window.VB_DATA = {
  site: {
    nome: "Vallumbría",
    lema: "Some secrets are better left buried.",
    tagline: "Uma cidade marcada por pactos, segredos e um passado que ainda sussurra.",
    resumo: "Vallumbría é uma cidadezinha fictícia no interior da Espanha, meio apagada do mapa. Nela vivem famílias que guardam segredos há gerações e criaturas que aprenderam a conviver sob acordos silenciosos. Quando a terra começa a revelar aquilo que deveria permanecer enterrado, ninguém está preparado para descobrir o que realmente sustenta a existência da cidade.",
    cenario: "Interior da Espanha",
    estilo: "Textual · 30+ linhas",
    genero: "Real life e sobrenatural",
    formato: "Fechado por temporada",
    plataforma: "A definir",
    inspiracoes: ["Twilight", "True Blood", "Dark Shadows", "The Vampire Diaries", "The Originals", "John Wick"],
    moeda: "umbras",
    saldoInicial: 100,
    pontosIniciais: 8,
    prazoFichaHoras: 72,
    capa: "img/logo.webp",
    icone: "img/icone.webp"
  },

  cidade: {
    titulo: "Sobre a cidade",
    img: "img/cidade.webp",
    paragrafos: [
      "Vallumbría é uma pequena cidade isolada no interior da Espanha, cercada por montanhas, florestas e construções medievais. Sob sua aparência pacata, humanos, vampiros, lobisomens e feiticeiros convivem entre antigas rivalidades e alianças frágeis.",
      "Governada há gerações por uma família influente, a cidade guarda segredos que começam a vir à tona após acontecimentos misteriosos ligados à atividade mineradora local.",
      "Quem chega de fora vê ruas de pedra, uma praça com hera nas paredes e um castelo que some na neblina toda manhã. Quem mora aqui sabe em quais trilhas não se entra depois do anoitecer e quais perguntas não se faz na bodega."
    ]
  },

  trama: [
    {
      id: "pacto", titulo: "O pacto das cinco famílias", img: "",
      texto: [
        "Vallumbría foi fundada sobre um acordo entre humanos, vampiros, lobisomens e feiticeiros. Cinco famílias participaram da criação de um pacto que estabeleceu limites territoriais e regras de convivência. A família do prefeito descende de uma dessas linhagens.",
        "O problema é que o pacto está sendo quebrado. A mineradora está explorando uma região protegida por ele, e os intrusos que chegaram à cidade parecem ter alguma ligação com as famílias que desapareceram."
      ]
    },
    {
      id: "desaparecidos", titulo: "Os desaparecidos", img: "",
      texto: [
        "Durante décadas, pessoas desapareceram em Vallumbría sem deixar vestígios. Os casos foram arquivados como acidentes, fugas ou mortes não confirmadas.",
        "Nos últimos meses, os desaparecimentos começaram a aumentar. A chegada dos quatro vampiros intrusos coincide com o retorno de alguém que deveria estar morto há muitos anos."
      ]
    },
    {
      id: "hotel", titulo: "O hotel e a rede de caçadores", img: "",
      texto: [
        "O hotel de Vallumbría funciona como ponto de encontro para caçadores, mercenários e informantes de diferentes regiões. Por trás de sua fachada sofisticada, abriga uma rede clandestina responsável por intermediar contratos, oferecer recompensas e organizar caçadas a criaturas sobrenaturais.",
        "Existe um código que proíbe conflitos dentro do estabelecimento, mas nem todos respeitam suas regras. E alguns dos alvos procurados podem ser moradores da própria cidade."
      ]
    }
  ],

  especies: [
    {
      id: "vampiros", nome: "Vampiros", cor: "#C0303B", img: "img/vampiros.webp",
      resumo: "Criaturas antigas, divididas entre a aristocracia do castelo e os intrusos recém-chegados.",
      texto: [
        "São criaturas antigas que habitam Vallumbría, divididas entre uma aristocracia sobrenatural instalada no castelo e vampiros recém-chegados que ameaçam o equilíbrio da cidade.",
        "Precisam de sangue e caça para sobreviver e queimam sob a luz do sol, mas aparecem em fotografias. Podem envelhecer, embora esse processo leve centenas de anos."
      ],
      tracos: [
        { rotulo: "Sustento", texto: "Sangue e caça." },
        { rotulo: "Fraqueza", texto: "Luz do sol e verbena." },
        { rotulo: "Curiosidade", texto: "Aparecem em fotografias e envelhecem ao longo de séculos." }
      ],
      kit: ["2x Bolsa de sangue", "1x Frasco opaco"]
    },
    {
      id: "lobisomens", nome: "Lobisomens", cor: "#7FA08A", img: "img/lobisomens.webp",
      resumo: "Ligados à natureza e à Reserva, organizados em alcateia e divididos sobre o próprio futuro.",
      texto: [
        "São criaturas ligadas à natureza e aos territórios de Vallumbría, vivendo entre a sociedade humana e suas próprias tradições. Organizados em alcateias, possuem vínculos de lealdade e hierarquia, mas também enfrentam conflitos internos sobre a convivência com outras espécies e a preservação de suas terras.",
        "Suas transformações são influenciadas pela lua. A força, os sentidos aguçados e os instintos fazem parte de sua natureza. Hoje se dividem entre aqueles que preservam as tradições da alcateia e os que buscam uma vida integrada à sociedade humana."
      ],
      tracos: [
        { rotulo: "Território", texto: "Reserva Natural de Llaberia." },
        { rotulo: "Ciclo", texto: "A lua influencia a transformação." },
        { rotulo: "Conflito", texto: "Tradição da alcateia ou vida entre os humanos." }
      ],
      kit: ["1x Tintura de acônito", "1x Amuleto lunar simples"]
    },
    {
      id: "feiticeiros", nome: "Feiticeiros", cor: "#9B7BC4", img: "img/feiticeiros.webp",
      resumo: "Praticantes de magia, cada um com uma especialidade. Movem o mercado paralelo da cidade.",
      texto: [
        "São responsáveis por práticas mágicas que envolvem poções, encantamentos, rituais e manipulação de energia. Seus poderes variam conforme suas especialidades, tornando cada feiticeiro único.",
        "Alguns atuam discretamente entre os humanos, enquanto outros mantêm relações com as demais criaturas e comercializam itens sobrenaturais por meio do mercado paralelo."
      ],
      tracos: [
        { rotulo: "Ervas e alquimia", texto: "Criação de poções, antídotos, venenos e proteção." },
        { rotulo: "Adivinhação", texto: "Sonhos, presságios, leituras e visões." },
        { rotulo: "Encantamentos", texto: "Objetos mágicos, amuletos e proteção." },
        { rotulo: "Manipulação de energia", texto: "Feitiços ofensivos e defensivos." },
        { rotulo: "Rituais", texto: "Pactos, invocações e cerimônias coletivas." }
      ],
      kit: ["3x Maço de ervas", "1x Vela ritual", "1x Grimório pessoal"]
    },
    {
      id: "humanos", nome: "Humanos", cor: "#C9A46A", img: "img/humanos.webp",
      resumo: "A população da cidade. Entre poderosos e trabalhadores, tentam sobreviver aos mistérios de Vallumbría.",
      texto: [
        "São a população da cidade. Entre poderosos e trabalhadores, tentam sobreviver aos mistérios que acontecem em Vallumbría.",
        "Alguns sabem exatamente com quem dividem a mesa na bodega. Outros preferem não saber. E há os que chegaram agora e ainda acham que os avisos sobre a Reserva são superstição."
      ],
      tracos: [
        { rotulo: "Poder", texto: "Prefeitura, delegacia, jornal e mineradora são comandados por humanos." },
        { rotulo: "Risco", texto: "Sem dons sobrenaturais. Contam com informação, armas e alianças." }
      ],
      kit: ["1x Ramo de verbena", "1x Lanterna"]
    }
  ],

  grupos: [
    { id: "aristocracia", nome: "Aristocracia do Castelo", especie: "vampiros", local: "castelo", desc: "Os seis moradores fixos do castelo. Vampiros antigos que vivem nas dependências privadas e guardam os arquivos da cidade." },
    { id: "intrusos", nome: "Os Intrusos", especie: "vampiros", local: "", desc: "Quatro vampiros recém-chegados. Ninguém sabe ao certo o que procuram, mas a chegada deles abalou o equilíbrio." },
    { id: "alcateia", nome: "Alcateia Tradicional", especie: "lobisomens", local: "reserva", desc: "Os que preservam as tradições, a hierarquia e o território da Reserva." },
    { id: "integrados", nome: "Os Integrados", especie: "lobisomens", local: "", desc: "Os que buscam uma vida comum entre os humanos, com emprego, casa e contas para pagar." },
    { id: "circulo", nome: "Feiticeiros de Vallumbría", especie: "feiticeiros", local: "botica", desc: "Cinco praticantes, cada um com uma especialidade." },
    { id: "prefeitura", nome: "Família do Prefeito", especie: "humanos", local: "prefeitura", desc: "A família que governa Vallumbría há gerações e descende de uma das cinco linhagens fundadoras." },
    { id: "policia", nome: "Polícia Local", especie: "humanos", local: "delegacia", desc: "Três policiais para uma cidade com segredos demais." },
    { id: "bodega", nome: "Equipe da Bodega", especie: "humanos", local: "bodega", desc: "Quem serve, cozinha e escuta tudo no centro social da cidade." },
    { id: "cacadores", nome: "Família de Caçadores", especie: "humanos", local: "hotel", desc: "Uma família que caça vampiros e outros monstros há gerações." },
    { id: "mineradores", nome: "Mineradores", especie: "humanos", local: "mineradora", desc: "Os trabalhadores que descem às galerias e ouvem o que há lá embaixo." },
    { id: "jornalistas", nome: "Redação do Jornal", especie: "humanos", local: "jornal", desc: "Três jornalistas e uma cidade inteira que prefere o silêncio." },
    { id: "chegados", nome: "Recém-chegados e outros", especie: "humanos", local: "", desc: "Gente de fora ou moradores sem vínculo com os grupos da cidade." }
  ],

  vagas: [
    { id: "vamp-1", grupo: "aristocracia", papel: "O Patriarca ou a Matriarca", nome: "", img: "", desc: "A figura mais antiga do castelo. Fala pela aristocracia e foi quem assinou, ou viu assinarem, os acordos que mantêm a cidade em paz." },
    { id: "vamp-2", grupo: "aristocracia", papel: "O Herdeiro", nome: "", img: "", desc: "Criado para assumir o castelo um dia. Impaciente com as regras antigas e curioso demais sobre os intrusos." },
    { id: "vamp-3", grupo: "aristocracia", papel: "A Guardiã dos Arquivos", nome: "", img: "", desc: "Cuida dos arquivos históricos e dos cômodos que não aparecem nas plantas oficiais. Sabe o que está escrito e o que foi arrancado." },
    { id: "vamp-4", grupo: "aristocracia", papel: "O Diplomata", nome: "", img: "", desc: "O elo do castelo com a prefeitura e com as outras espécies. Frequenta a bodega e sorri mais do que deveria." },
    { id: "vamp-5", grupo: "aristocracia", papel: "O Executor", nome: "", img: "", desc: "Quando alguém quebra um acordo, é ele quem resolve. Poucas palavras e nenhuma pressa." },
    { id: "vamp-6", grupo: "aristocracia", papel: "A Protegida", nome: "", img: "", desc: "A mais jovem do castelo, transformada há pouco tempo para os padrões da aristocracia. Ainda se lembra bem de ser humana." },
    { id: "vamp-7", grupo: "intrusos", papel: "O Líder dos Intrusos", nome: "", img: "", desc: "Trouxe o grupo até Vallumbría e é o único que conhece o motivo inteiro da viagem." },
    { id: "vamp-8", grupo: "intrusos", papel: "A Estrategista", nome: "", img: "", desc: "Observa antes de agir. Em poucas semanas já sabe quem manda em quê na cidade." },
    { id: "vamp-9", grupo: "intrusos", papel: "O Indomado", nome: "", img: "", desc: "Caça sem pedir permissão e não reconhece a autoridade do castelo. Um problema para todos os lados." },
    { id: "vamp-10", grupo: "intrusos", papel: "O Mais Novo", nome: "", img: "", desc: "Transformado há pouco, segue o grupo por lealdade ou por falta de opção. Ainda não escolheu um lado." },

    { id: "lobo-1", grupo: "alcateia", papel: "Alfa", nome: "", img: "", desc: "Lidera a alcateia e responde por ela diante das outras espécies. Carrega o peso de manter o território." },
    { id: "lobo-2", grupo: "alcateia", papel: "Beta", nome: "", img: "", desc: "Braço direito do alfa. Leal, mas com opiniões próprias sobre como lidar com a mineradora." },
    { id: "lobo-3", grupo: "alcateia", papel: "A Anciã", nome: "", img: "", desc: "Guardiã das tradições e das histórias antigas. Lembra de coisas sobre o pacto que ninguém mais lembra." },
    { id: "lobo-4", grupo: "alcateia", papel: "O Batedor", nome: "", img: "", desc: "Conhece cada trilha e cada ruína da Reserva. Foi o primeiro a encontrar os animais mortos." },
    { id: "lobo-5", grupo: "alcateia", papel: "A Caçula", nome: "", img: "", desc: "A mais nova da alcateia, ainda aprendendo a controlar a transformação. Tem amigos humanos e não vê problema nisso." },
    { id: "lobo-6", grupo: "integrados", papel: "O Dissidente", nome: "", img: "", desc: "Rompeu com o alfa e fala pelos que querem viver entre os humanos. Ainda é respeitado, e isso incomoda." },
    { id: "lobo-7", grupo: "integrados", papel: "O Guarda-florestal", nome: "", img: "", desc: "Funcionário oficial da Reserva. Recebe salário da prefeitura para proteger a terra que a alcateia chama de sua." },
    { id: "lobo-8", grupo: "integrados", papel: "O Mineiro", nome: "", img: "", desc: "Trabalha na mineradora para sustentar a família. A alcateia vê isso como traição." },
    { id: "lobo-9", grupo: "integrados", papel: "A Enfermeira", nome: "", img: "", desc: "Atende no posto de saúde e já tratou ferimentos que nenhum humano deveria ter visto." },
    { id: "lobo-10", grupo: "integrados", papel: "O Indeciso", nome: "", img: "", desc: "Cresceu entre os dois mundos e ainda não escolheu. Cada lua cheia torna a decisão mais difícil." },

    { id: "feit-1", grupo: "circulo", papel: "Ervas e alquimia", nome: "", img: "", desc: "Dona da botica. Vende chás e pomadas no balcão e administra o mercado paralelo nos fundos." },
    { id: "feit-2", grupo: "circulo", papel: "Adivinhação", nome: "", img: "", desc: "Lê sonhos, presságios e cartas. Tem visto a mesma imagem todas as noites e ainda não contou a ninguém." },
    { id: "feit-3", grupo: "circulo", papel: "Encantamentos", nome: "", img: "", desc: "Cria amuletos e objetos de proteção. Os anéis que permitem a um vampiro andar ao sol saem das mãos dela." },
    { id: "feit-4", grupo: "circulo", papel: "Manipulação de energia", nome: "", img: "", desc: "Domina feitiços ofensivos e defensivos. Vive entre os humanos com um emprego comum e quase ninguém sabe do que é capaz." },
    { id: "feit-5", grupo: "circulo", papel: "Rituais", nome: "", img: "", desc: "Conduz pactos, invocações e cerimônias coletivas. É quem todos procuram quando um acordo precisa valer de verdade." },

    { id: "hum-1", grupo: "prefeitura", papel: "Prefeito ou Prefeita", nome: "", img: "", desc: "Comanda Vallumbría como a família sempre comandou. Decide, negocia e esconde o que for preciso para manter a cidade de pé." },
    { id: "hum-2", grupo: "prefeitura", papel: "Cônjuge do Prefeito", nome: "", img: "", desc: "Entrou para a família pelo casamento. Organiza os eventos da cidade e percebe mais do que comenta." },
    { id: "hum-3", grupo: "prefeitura", papel: "Primogênito ou Primogênita", nome: "", img: "", desc: "Preparado para herdar a prefeitura. Começa a descobrir que o cargo vem com obrigações que ninguém explicou." },
    { id: "hum-4", grupo: "prefeitura", papel: "Filho ou Filha mais nova", nome: "", img: "", desc: "Não quer saber de política. Amigo de gente que a família não aprova." },
    { id: "hum-5", grupo: "prefeitura", papel: "Parente do Prefeito", nome: "", img: "", desc: "Irmão, irmã ou cunhado. Cuida dos negócios da família e tem interesse direto na mineradora." },
    { id: "hum-6", grupo: "policia", papel: "Delegado ou Delegada", nome: "", img: "", desc: "Chefia a delegacia e assina os relatórios que explicam o inexplicável. Deve favores à prefeitura." },
    { id: "hum-7", grupo: "policia", papel: "Investigador ou Investigadora", nome: "", img: "", desc: "Reabriu por conta própria os casos de desaparecimento. Guarda cópias dos arquivos em casa." },
    { id: "hum-8", grupo: "policia", papel: "Agente novato", nome: "", img: "", desc: "Transferido há pouco tempo. Ainda acredita que tudo tem explicação." },
    { id: "hum-9", grupo: "bodega", papel: "Dono ou Dona da Bodega", nome: "", img: "", desc: "Mantém o lugar como espaço neutro. Conhece todo mundo pelo nome e pela bebida." },
    { id: "hum-10", grupo: "bodega", papel: "Cozinheira", nome: "", img: "", desc: "Trabalha ali há décadas. Sabe quem não come, quem só aparece à noite e quem pede a carne quase crua." },
    { id: "hum-11", grupo: "bodega", papel: "Atendente do balcão", nome: "", img: "", desc: "Ouve todas as conversas e vende algumas delas." },
    { id: "hum-12", grupo: "bodega", papel: "Atendente do salão", nome: "", img: "", desc: "Estuda de dia e serve mesas à noite. Já separou mais de uma briga entre espécies sem saber disso." },
    { id: "hum-13", grupo: "bodega", papel: "Atendente do turno da noite", nome: "", img: "", desc: "Fecha a bodega de madrugada. É quem vê os clientes que só chegam depois que a cidade dorme." },
    { id: "hum-14", grupo: "cacadores", papel: "Chefe da família", nome: "", img: "", desc: "Lidera a família de caçadores e negocia os contratos no hotel. Tem contas antigas a acertar em Vallumbría." },
    { id: "hum-15", grupo: "cacadores", papel: "O Primogênito", nome: "", img: "", desc: "Treinado desde criança. Segue as regras da família à risca." },
    { id: "hum-16", grupo: "cacadores", papel: "A Rastreadora", nome: "", img: "", desc: "Encontra qualquer coisa que deixe rastro. Passa mais tempo na Reserva do que seria prudente." },
    { id: "hum-17", grupo: "cacadores", papel: "O Armeiro", nome: "", img: "", desc: "Prepara estacas, balas de prata e armadilhas. Cliente frequente da botica." },
    { id: "hum-18", grupo: "cacadores", papel: "A Caçula relutante", nome: "", img: "", desc: "Nasceu na família errada. Começa a duvidar de que todo monstro mereça ser caçado." },
    { id: "hum-19", grupo: "mineradores", papel: "Capataz", nome: "", img: "", desc: "Responde pela produção e pelos turnos. Recebe ordens para manter as galerias novas em funcionamento." },
    { id: "hum-20", grupo: "mineradores", papel: "O Veterano", nome: "", img: "", desc: "Trinta anos de mina. Sabe de túneis que não estão em nenhum mapa da empresa." },
    { id: "hum-21", grupo: "mineradores", papel: "Geólogo ou Geóloga", nome: "", img: "", desc: "Analisa as amostras e não consegue explicar as alterações na composição dos minerais." },
    { id: "hum-22", grupo: "mineradores", papel: "Operador de explosivos", nome: "", img: "", desc: "Abriu a passagem para a região nova. Desde então não dorme direito." },
    { id: "hum-23", grupo: "mineradores", papel: "O Novato", nome: "", img: "", desc: "Começou há poucos meses. Foi o último a ver um dos desaparecidos." },
    { id: "hum-24", grupo: "jornalistas", papel: "Editor-chefe", nome: "", img: "", desc: "Decide o que sai no jornal e o que fica na gaveta. A gaveta está cheia." },
    { id: "hum-25", grupo: "jornalistas", papel: "Repórter investigativo", nome: "", img: "", desc: "Investiga a prefeitura e os desaparecimentos. Já recebeu avisos para parar." },
    { id: "hum-26", grupo: "jornalistas", papel: "Fotógrafo e arquivista", nome: "", img: "", desc: "Cuida do arquivo do jornal. Tem fotos antigas com rostos que não envelheceram." },
    { id: "hum-27", grupo: "chegados", papel: "Gerente do Hotel", nome: "", img: "", desc: "Recebe os hóspedes, faz cumprir o código da casa e nunca pergunta o motivo da viagem." },
    { id: "hum-28", grupo: "chegados", papel: "Médico recém-chegado", nome: "", img: "", desc: "Assumiu o posto de saúde há pouco tempo. Os prontuários antigos têm páginas faltando." },
    { id: "hum-29", grupo: "chegados", papel: "Parente de um desaparecido", nome: "", img: "", desc: "Veio de fora em busca de respostas sobre alguém que sumiu em Vallumbría." },
    { id: "hum-30", grupo: "chegados", papel: "Forasteiro", nome: "", img: "", desc: "Vaga livre para um conceito seu. Alguém que chegou à cidade por um motivo que você decide." }
  ],

  locais: [
    {
      id: "castelo", nome: "Castelo", rotulo: "Residência da aristocracia vampírica", img: "img/castelo.webp",
      resumo: "Aberto à visitação, mas parcialmente interditado. Os vampiros antigos vivem em suas dependências privadas.",
      descricao: ["Aberto à visitação, mas parcialmente interditado. Os vampiros antigos vivem em suas dependências privadas. Existem passagens subterrâneas, arquivos históricos e cômodos que não aparecem nas plantas oficiais."],
      historia: ["Erguido antes da fundação da cidade, o castelo é a construção mais antiga de Vallumbría. A ala leste foi aberta ao público como museu, e o restante segue fechado por questões de conservação, segundo a prefeitura."],
      funcionamento: ["A visitação acontece durante o dia, sempre com guia. À noite, os portões se fecham e o castelo volta a pertencer aos seus moradores."],
      trama: ["Guardião de segredos antigos. Os arquivos do castelo podem conter o texto original do pacto das cinco famílias."]
    },
    {
      id: "mineradora", nome: "Mineradora", rotulo: "Principal fonte de renda da cidade", img: "img/mineradora.webp",
      resumo: "Os trabalhadores relatam ruídos subterrâneos, desaparecimentos e alterações inexplicáveis nos minerais.",
      descricao: ["Principal fonte de renda da cidade. Os trabalhadores relatam ruídos subterrâneos, desaparecimentos, animais encontrados mortos e alterações inexplicáveis na composição dos minerais."],
      historia: ["A mina sustenta Vallumbría há gerações. Nos últimos anos, a empresa abriu galerias novas em direção a uma área que os moradores mais velhos dizem ser protegida."],
      funcionamento: ["Três turnos de trabalho. O turno da noite é o mais bem pago e o que menos gente aceita."],
      trama: ["Ponto de origem dos acontecimentos misteriosos. A exploração avança sobre uma região protegida pelo pacto."]
    },
    {
      id: "bodega", nome: "Bodega", rotulo: "O centro social de Vallumbría", img: "img/bodega.webp",
      resumo: "Onde humanos, sobrenaturais e visitantes se encontram. Um espaço neutro, embora nem sempre pacífico.",
      descricao: ["O centro social de Vallumbría. É onde humanos, sobrenaturais e visitantes se encontram. Pode funcionar como espaço neutro, embora nem sempre pacífico."],
      historia: ["Passa de geração em geração na mesma família. Dizem que os primeiros acordos entre as espécies foram discutidos nessas mesas."],
      funcionamento: ["Abre para o almoço e só fecha de madrugada. Brigas se resolvem do lado de fora."],
      trama: ["Ponto de encontro e de circulação de informações. Quem quer saber de algo em Vallumbría começa por aqui."]
    },
    {
      id: "reserva", nome: "Reserva Natural de Llaberia", rotulo: "Território dos lobisomens", img: "img/reserva.webp",
      resumo: "Trilhas antigas, ruínas e áreas que os moradores evitam depois do anoitecer.",
      descricao: ["Território de circulação dos lobisomens. Esconde trilhas antigas, ruínas e áreas que os moradores evitam frequentar depois do anoitecer. Os feiticeiros também utilizam a Reserva para encontrar materiais para encantamentos e objetos."],
      historia: ["Área de preservação ambiental oficialmente. Para a alcateia, é território garantido pelo antigo pacto."],
      funcionamento: ["Trilhas abertas ao público durante o dia. Depois do anoitecer, a recomendação da prefeitura é não entrar."],
      trama: ["Tem importância para os lobisomens e para o antigo pacto. Os limites da Reserva fazem fronteira com as galerias novas da mineradora."]
    },
    {
      id: "delegacia", nome: "Delegacia", rotulo: "Onde o inexplicável ganha explicação", img: "img/delegacia.webp",
      resumo: "Os policiais tentam explicar os acontecimentos com justificativas humanas. Alguns são coniventes, outros investigam por conta própria.",
      descricao: ["Os policiais tentam explicar os acontecimentos utilizando justificativas humanas. Alguns são coniventes com a prefeitura. Outros investigam por conta própria."],
      historia: ["Os arquivos da delegacia guardam décadas de desaparecimentos classificados como acidentes, fugas ou mortes não confirmadas."],
      funcionamento: ["Três policiais, uma viatura e um arquivo morto que ninguém tem autorização para abrir."],
      trama: ["Responsável pela investigação dos desaparecimentos e das ocorrências da cidade."]
    },
    {
      id: "jornal", nome: "Jornal", rotulo: "Pequeno veículo de comunicação local", img: "img/jornal.webp",
      resumo: "Os jornalistas podem revelar acontecimentos, investigar a prefeitura e divulgar o que deveria permanecer escondido.",
      descricao: ["Pequeno veículo de comunicação local. Os jornalistas podem ser responsáveis por revelar acontecimentos, investigar a prefeitura e divulgar informações que deveriam permanecer escondidas."],
      historia: ["Circula há mais de um século. Algumas edições antigas sumiram do arquivo."],
      funcionamento: ["Uma redação pequena, uma máquina de escrever que ainda funciona e um arquivo fotográfico que cobre toda a história da cidade."],
      trama: ["Principal veículo de notícias locais, responsável por registrar acontecimentos e investigar rumores."]
    },
    {
      id: "botica", nome: "Apotecário e Mercado Negro", rotulo: "Ervas no balcão, artefatos nos fundos", img: "img/botica.webp",
      resumo: "Uma loja de aparência tradicional que esconde um mercado discreto de itens sobrenaturais.",
      descricao: ["Uma pequena loja de aparência tradicional, administrada por uma feiticeira que comercializa ervas, poções e produtos naturais. Por trás das prateleiras comuns, porém, esconde um mercado discreto de artefatos, ingredientes raros e itens sobrenaturais, acessível apenas àqueles que conhecem sua verdadeira finalidade."],
      historia: ["A loja existe desde que há feiticeiros em Vallumbría. O estoque dos fundos muda conforme o que acontece na cidade."],
      funcionamento: ["As compras do mercado paralelo são feitas com a moeda do RP, na área do jogador. O estoque é limitado e alguns itens só aparecem em certos momentos da trama."],
      trama: ["Fornece verbena, poções, amuletos e anéis de proteção solar. Quem controla a botica sabe o que cada espécie anda comprando."]
    },
    {
      id: "hotel", nome: "Hotel", rotulo: "Território neutro para caçadores", img: "img/hotel.webp",
      resumo: "Fachada luxuosa, reuniões clandestinas e contratos de caça.",
      descricao: ["Este estabelecimento discreto funciona como território neutro para caçadores, mercenários e informantes. Por trás de sua fachada luxuosa, abriga reuniões clandestinas, negociações e contratos de caça, onde criaturas sobrenaturais podem se tornar tanto clientes quanto alvos."],
      historia: ["O hotel recebe viajantes desde que a estrada da serra foi aberta. Nem todos os hóspedes constam no livro de registro."],
      funcionamento: ["Um código proíbe conflitos dentro do estabelecimento. Os contratos e as recompensas são divulgados no mural do jornal."],
      trama: ["Sede da rede de caçadores. Alguns dos alvos procurados podem ser moradores da própria cidade."]
    },
    {
      id: "prefeitura", nome: "Prefeitura", rotulo: "Centro político e administrativo", img: "img/prefeitura.webp",
      resumo: "Comandada por uma família influente que há gerações exerce poder sobre a cidade.",
      descricao: ["A prefeitura é o centro político e administrativo de Vallumbría, comandada por uma família influente que há gerações exerce poder sobre a cidade. Sob a aparência de uma gestão tradicional, decisões, acordos e interesses particulares ajudam a manter o controle sobre os habitantes e a esconder segredos que envolvem o passado e o futuro da região."],
      historia: ["O mesmo sobrenome ocupa o gabinete desde a fundação. A família descende de uma das cinco linhagens do pacto."],
      funcionamento: ["Atendimento ao público pela manhã. As reuniões que importam acontecem depois do expediente."],
      trama: ["Controlada pela família do prefeito. É dela a autorização para a mineradora avançar."]
    }
  ],

  atributos: [
    { id: "forca", nome: "Força", desc: "Potência física e combate corpo a corpo." },
    { id: "agilidade", nome: "Agilidade", desc: "Velocidade, reflexos e furtividade." },
    { id: "vigor", nome: "Vigor", desc: "Resistência a ferimentos, venenos e cansaço." },
    { id: "astucia", nome: "Astúcia", desc: "Raciocínio, conhecimento e estratégia." },
    { id: "percepcao", nome: "Percepção", desc: "Sentidos, intuição e atenção a detalhes." },
    { id: "presenca", nome: "Presença", desc: "Carisma, intimidação e poder de convencer." }
  ],

  mercado: [
    { id: "verbena", nome: "Ramo de verbena", categoria: "Proteção", preco: 15, estoque: 20, restrito: "", ativo: true, img: "", desc: "Queima a pele de vampiros e protege a mente contra compulsão." },
    { id: "aconito", nome: "Tintura de acônito", categoria: "Proteção", preco: 20, estoque: 12, restrito: "", ativo: true, img: "", desc: "Enfraquece lobisomens. Em dose pequena, ajuda a conter a transformação." },
    { id: "sangue", nome: "Bolsa de sangue", categoria: "Sustento", preco: 10, estoque: 30, restrito: "Vampiros", ativo: true, img: "", desc: "Sangue doado, sem perguntas. Evita caçadas arriscadas." },
    { id: "cura", nome: "Poção de cura", categoria: "Poções", preco: 40, estoque: 8, restrito: "", ativo: true, img: "", desc: "Fecha ferimentos comuns em poucas horas." },
    { id: "antidoto", nome: "Antídoto", categoria: "Poções", preco: 35, estoque: 8, restrito: "", ativo: true, img: "", desc: "Neutraliza venenos, verbena e acônito no organismo." },
    { id: "sono", nome: "Poção do sono", categoria: "Poções", preco: 30, estoque: 6, restrito: "", ativo: true, img: "", desc: "Algumas gotas na bebida e a pessoa dorme por horas." },
    { id: "amuleto", nome: "Amuleto de proteção", categoria: "Encantados", preco: 60, estoque: 5, restrito: "", ativo: true, img: "", desc: "Protege contra um feitiço. Depois disso, racha." },
    { id: "anel-solar", nome: "Anel de proteção solar", categoria: "Encantados", preco: 150, estoque: 2, restrito: "Vampiros", ativo: true, img: "", desc: "Permite a um vampiro andar sob o sol enquanto estiver no dedo." },
    { id: "amuleto-lunar", nome: "Amuleto lunar", categoria: "Encantados", preco: 120, estoque: 2, restrito: "Lobisomens", ativo: true, img: "", desc: "Dá ao lobisomem mais controle durante a lua cheia." },
    { id: "estaca", nome: "Estaca de freixo", categoria: "Armas", preco: 25, estoque: 15, restrito: "", ativo: true, img: "", desc: "Simples e eficiente contra vampiros." },
    { id: "prata", nome: "Munição de prata", categoria: "Armas", preco: 45, estoque: 10, restrito: "", ativo: true, img: "", desc: "Caixa com seis balas. Ferimentos de prata demoram a fechar em lobisomens." },
    { id: "ritual", nome: "Kit de ingredientes para ritual", categoria: "Rituais", preco: 50, estoque: 6, restrito: "Feiticeiros", ativo: true, img: "", desc: "Sal negro, velas, giz e ervas secas. O suficiente para um ritual." },
    { id: "cinzas", nome: "Cinzas do pacto", categoria: "Rituais", preco: 300, estoque: 1, restrito: "", ativo: false, img: "", desc: "Item especial. Fica oculto até o mestre liberar conforme o andamento da trama." }
  ],

  jornal: [
    { id: "j-abertura", tipo: "aviso", titulo: "Inscrições abertas para a primeira temporada", data: "2026-11-10", fixado: true, recompensa: "", img: "",
      texto: ["Escolha uma vaga no diretório de personagens, reserve e envie sua ficha pela área do jogador. As vagas são limitadas por espécie."] },
    { id: "j-mina", tipo: "noticia", titulo: "Mineradora suspende turno da noite após ruídos na galeria nova", data: "2026-11-08", fixado: false, recompensa: "", img: "img/mineradora.webp",
      texto: ["Trabalhadores relataram batidas vindas de trás da rocha durante a madrugada. A empresa fala em acomodação natural do terreno e promete retomar o turno em breve.", "É a terceira paralisação desde a abertura da galeria."] },
    { id: "j-animais", tipo: "noticia", titulo: "Animais são encontrados mortos na borda da Reserva", data: "2026-11-05", fixado: false, recompensa: "", img: "",
      texto: ["Guardas da Reserva encontraram três cervos mortos perto da trilha norte. A prefeitura pede que os moradores evitem a área depois do anoitecer."] },
    { id: "j-vindima", tipo: "evento", titulo: "Festa da Vindima na Bodega", data: "2026-11-21", fixado: false, recompensa: "", img: "img/bodega.webp",
      texto: ["A cidade inteira é esperada na praça para a festa do vinho novo. Música, comida e a tradição de sempre: nessa noite, ninguém briga."] },
    { id: "j-contrato", tipo: "contrato", titulo: "Procura-se: o que anda matando os animais da trilha norte", data: "2026-11-06", fixado: false, recompensa: "150 umbras", img: "",
      texto: ["Contrato aberto no hotel. Paga-se por provas do responsável. Vivo ou morto, a critério do contratante."] },
    { id: "j-ata", tipo: "documento", titulo: "Trecho da ata de fundação de Vallumbría", data: "2026-11-01", fixado: false, recompensa: "", img: "",
      texto: ["“Ficam as cinco casas obrigadas a guardar os limites aqui traçados, cada uma em sua terra, e a não cavar onde a terra foi fechada.”", "O restante da página está ilegível."] }
  ],

  regras: {
    dinamica: [
      { rotulo: "Formato", texto: "RPG textual, com posts de 30 linhas ou mais, misturando vida real e sobrenatural." },
      { rotulo: "Temporadas", texto: "RPG fechado por temporada, com número controlado de personagens por espécie." },
      { rotulo: "O site", texto: "Aqui ficam as informações da cidade, o diretório de personagens, as fichas, o jornal e o mercado paralelo." }
    ],
    lista: [
      { titulo: "Respeito vem primeiro", texto: "Conflito é entre personagens, nunca entre pessoas. Nada de ataques pessoais, preconceito ou exposição de jogadores." },
      { titulo: "Uma vaga por jogador", texto: "Reserve uma vaga e envie a ficha dentro do prazo. Depois do prazo, a vaga pode ser liberada." },
      { titulo: "Personagens adultos", texto: "Todos os personagens e faceclaims têm 18 anos ou mais. Cada faceclaim só pode ser usado uma vez." },
      { titulo: "Sem metagaming", texto: "Seu personagem só sabe o que viveu em cena. Informação do grupo OFF ou do site não pode ser usada sem motivo na história." },
      { titulo: "Sem powerplay", texto: "Não controle o personagem de outra pessoa nem decida sozinho o resultado de uma ação contra ele." },
      { titulo: "Mortes e transformações", texto: "Só com consentimento do jogador ou em eventos anunciados pelo mestre." },
      { titulo: "Atributos e itens", texto: "Os atributos da ficha e os itens do inventário valem em cena. Usou um item, avise o mestre para dar baixa." },
      { titulo: "Conteúdo", texto: "Violência e terror fazem parte da história, sem descrições extremamente gráficas. Conteúdo sexual explícito não é permitido no grupo." }
    ]
  }
};
