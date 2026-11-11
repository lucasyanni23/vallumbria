/* =====================================================================
   PÁGINAS PÚBLICAS — início, cidade, locais, espécies, personagens,
   jornal, regras e mercado. Cada página é feita de blocos que o mestre
   pode reordenar, ocultar e completar com fotos e textos próprios.
   Todo texto é editável no modo de edição (A.E, A.T e A.P).
   ===================================================================== */
(function () {
  "use strict";
  const A = window.VBA, V = A.views, ui = A.ui;
  const { esc } = A;
  const E = (...a) => A.E(...a), T = (...a) => A.T(...a), P = (...a) => A.P(...a);
  const idxOf = (sec, id) => A.C(sec).findIndex(x => x.id === id);

  /* ---------------- lua ---------------- */
  const SYN = 29.530588853, REF = Date.UTC(2000, 0, 6, 18, 14);
  function moon(t) {
    const age = (((t - REF) / 86400000) % SYN + SYN) % SYN;
    const names = ["Lua nova", "Lua crescente", "Quarto crescente", "Crescente gibosa", "Lua cheia", "Minguante gibosa", "Quarto minguante", "Lua minguante"];
    const idx = Math.floor(((age / SYN) * 8) + 0.5) % 8;
    const illum = Math.round((1 - Math.cos(2 * Math.PI * age / SYN)) / 2 * 100);
    let toFull = SYN / 2 - age; if (toFull < 0) toFull += SYN;
    return { age, name: names[idx], illum, full: t + toFull * 86400000, waxing: age < SYN / 2 };
  }
  function moonSVG(m) {
    const r = 40, k = Math.cos(2 * Math.PI * m.age / SYN), sweep = m.waxing ? 1 : 0, rx = Math.abs(k) * r, inner = k > 0 ? (m.waxing ? 0 : 1) : (m.waxing ? 1 : 0);
    return `<svg viewBox="0 0 84 84" role="img" aria-label="${esc(m.name)}, ${m.illum}% iluminada"><circle cx="42" cy="42" r="40" fill="#221718" stroke="#574044"/><path d="M42 2 A${r} ${r} 0 0 ${sweep} 42 82 A${rx.toFixed(2)} ${r} 0 0 ${inner} 42 2Z" fill="#EDE3D6"/></svg>`;
  }
  function tonight() {
    const m = moon(Date.now()), dias = Math.round((m.full - Date.now()) / 86400000);
    const prox = dias <= 0 ? "Esta noite" : dias === 1 ? "Amanhã" : "Em " + dias + " dias";
    const tz = { timeZone: "Europe/Madrid" };
    const hoje = new Intl.DateTimeFormat("pt-BR", Object.assign({ weekday: "long", day: "numeric", month: "long" }, tz)).format(new Date());
    const hora = new Intl.DateTimeFormat("pt-BR", Object.assign({ hour: "2-digit", minute: "2-digit" }, tz)).format(new Date());
    const aviso = m.illum >= 97 ? T("noite-cheia", "Lua cheia. A Reserva fica fechada até o amanhecer.", null, "p", "small")
      : dias <= 3 ? T("noite-perto", "A lua cheia se aproxima. Evite as trilhas depois do anoitecer.", null, "p", "small")
      : T("noite-comum", "Noite comum em Vallumbría. Até onde se sabe.", null, "p", "small");
    return `<div class="panel tonight">${moonSVG(m)}<div>${T("noite-titulo", "Esta noite em Vallumbría", null, "p", "eyebrow")}<h3>${esc(m.name)}</h3>${aviso}</div>
      <dl><div><dt>${T("noite-hoje", "Hoje")}</dt><dd>${esc(hoje)}</dd></div><div><dt>${T("noite-hora", "Hora local")}</dt><dd>${esc(hora)}</dd></div><div><dt>${T("noite-ilum", "Lua iluminada")}</dt><dd>${m.illum}%</dd></div><div><dt>${T("noite-cheia-rot", "Próxima cheia")}</dt><dd>${esc(prox)}</dd></div></dl></div>`;
  }

  /* ---------------- início ---------------- */
  V.inicio = () => {
    const X = A.X, s = X.site, c = A.counts(X.slots), posts = sortedPosts().slice(0, 3), vars = { livres: c.livre, total: c.total };
    const espIdx = {}; A.C("especies").forEach((e, i) => { espIdx[e.id] = i; });
    const B = [];
    B.push({ id: "capa", html: `<section class="hero"><div class="wrap">
        ${s.capa ? `<div class="hero-art">${A.imgTag(s.capa, s.nome)}</div><h1 class="sr">${esc(s.nome)}</h1>` : E("site.nome", s.nome, "h1", "display hero-name")}
        ${E("site.lema", s.lema, "p", "hero-lema")}${E("site.tagline", s.tagline, "p", "hero-tag")}
        <div class="btn-row" style="justify-content:center"><a class="btn btn-primary" href="#personagens">${T("home-btn1", "Escolher personagem")}</a><a class="btn btn-ghost" href="#cidade">${T("home-btn2", "Conhecer a cidade")}</a></div>
        ${A.editLink("site", "", "Trocar capa e ícone")}</div></section>` });
    B.push({ id: "noite", html: `<section class="wrap" style="padding-top:24px"><div class="grid g2">${tonight()}
        <div class="panel" style="display:grid;gap:12px;align-content:start"><div class="sub-head">${T("home-mural", "Mural de avisos", null, "p", "eyebrow")}<a class="small" href="#jornal">${T("home-mural-link", "Ver jornal")}</a></div>
          <div class="mural">${posts.map(p => `<a href="#jornal"><span class="small">${esc(tipoNome(p.tipo))} · ${esc(fmtD(p.data))}</span><b>${esc(p.titulo)}</b></a>`).join("") || `<p class="muted" style="margin:0">Nenhum aviso por enquanto.</p>`}</div></div></div></section>` });
    B.push({ id: "ideia", html: `<section class="sec"><div class="wrap split">
        <div class="split-aside">${T("home-ideia-eyebrow", "Ideia base", null, "p", "eyebrow")}${T("home-ideia-titulo", "Uma cidade apagada do mapa.", null, "h2", "sec-title")}
          <dl class="facts" style="margin-top:18px">${[["cenario", "Cenário"], ["estilo", "Estilo"], ["genero", "Gênero"], ["formato", "Formato"], ["plataforma", "Plataforma"]].map(([k, l]) => `<div><dt>${T("fato-" + k, l)}</dt><dd>${E("site." + k, s[k])}</dd></div>`).join("")}<div><dt>${T("fato-vagas", "Vagas livres")}</dt><dd>${c.livre} de ${c.total}</dd></div></dl></div>
        <div class="prose">${E("site.resumo", s.resumo, "p", "dropcap")}<p class="small">${T("home-insp", "Inspirações:")} ${esc((s.inspiracoes || []).join(", "))}</p></div></div></section>` });
    B.push({ id: "locais", html: `<section class="parch"><div class="wrap sec">
        <div class="sec-head">${T("home-loc-eyebrow", "Conheça Vallumbría", null, "p", "eyebrow")}${T("home-loc-titulo", "História e estabelecimentos", null, "h2", "sec-title")}</div>
        <div class="loc-strip">${A.C("locais").map((l, i) => `<a class="loc-mini" href="#local-${esc(l.id)}">${A.tile(l.img, l.nome, "", true)}${E("locais." + i + ".nome", l.nome)}</a>`).join("")}</div>
        <p style="margin:22px 0 0" class="on-parch"><a class="btn btn-ghost btn-sm" href="#locais">${T("home-loc-btn", "Ver todos os locais")}</a></p></div></section>` });
    B.push({ id: "especies", html: `<section class="sec"><div class="wrap">
        <div class="sec-head">${T("home-esp-eyebrow", "Diretório de personagens", null, "p", "eyebrow")}${T("home-esp-titulo", "Quatro espécies, {total} vagas", vars, "h2", "sec-title")}</div>
        <div class="grid g4">${A.C("especies").map((e, i) => `<a class="esp-card" href="#esp-${esc(e.id)}" style="--fac:${esc(e.cor)}">${E("especies." + i + ".nome", e.nome, "h3")}${E("especies." + i + ".resumo", e.resumo, "p")}${A.meter(A.counts(X.slots.filter(v => v.e.id === e.id)))}</a>`).join("")}</div></div></section>` });
    B.push({ id: "convite", html: `<section class="wrap" style="padding-bottom:40px"><div class="cta"><div style="display:grid;gap:14px;justify-items:start">
        ${T("home-cta-eyebrow", "{livres} vagas abertas", vars, "p", "eyebrow")}${T("home-cta-titulo", "Alguns segredos é melhor deixar enterrados.", vars, "h2")}
        ${T("home-cta-texto", "Reserve uma vaga, monte sua ficha com atributos e kit inicial e espere a aprovação do mestre.", vars, "p", "lead")}
        <div class="btn-row"><a class="btn btn-primary" href="#personagens">${T("home-cta-btn1", "Ver vagas")}</a><a class="btn btn-ghost" href="#regras">${T("home-cta-btn2", "Regras")}</a></div></div>
        ${s.icone ? A.imgTag(s.icone, "", ' class="cta-ic"') : ""}</div></section>` });
    return A.page("inicio", B);
  };

  /* ---------------- cidade ---------------- */
  A.pageHero = (eyebrow, title, lead, img, extra) => `<section class="page-hero${img ? " has-img" : ""}">${img ? A.imgTag(img, "", ' class="bg"') : ""}<div class="wrap">${extra || ""}<p class="eyebrow">${esc(eyebrow)}</p><h1 class="display">${esc(title)}</h1>${lead ? `<p class="lead">${esc(lead)}</p>` : ""}</div></section>`;
  V.cidade = () => {
    const c = A.C("cidade"), tr = A.C("trama"), s = A.X.site;
    return A.page("cidade", [
      { id: "topo", html: `<section class="page-hero${c.img ? " has-img" : ""}">${c.img ? A.imgTag(c.img, "", ' class="bg"') : ""}<div class="wrap">${T("cidade-eyebrow", "Sobre a cidade", null, "p", "eyebrow")}${E("cidade.titulo", c.titulo, "h1", "display")}${E("site.tagline", s.tagline, "p", "lead")}</div></section>` },
      { id: "texto", html: `<section class="sec"><div class="wrap split"><div class="split-aside">${A.tile(c.img, c.titulo)}<div style="margin-top:12px">${A.editLink("cidade", "", "Trocar foto")}</div></div><div class="prose">${P("cidade.paragrafos", c.paragrafos, "dropcap")}</div></div></section>` },
      { id: "trama", html: `<section class="sec" style="padding-top:0"><div class="wrap">
        <div class="sec-head">${T("trama-eyebrow", "Sobre a trama", null, "p", "eyebrow")}${T("trama-titulo", "O que a terra começou a revelar", null, "h2", "sec-title")}${A.editLink("trama", "", "Adicionar ou apagar capítulos")}</div>
        <div class="grid" style="gap:0">${tr.map((t, i) => `<article class="split" style="padding:26px 0;border-top:1px solid var(--line)"><div><p class="eyebrow">${["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][i] || i + 1}</p>${E("trama." + i + ".titulo", t.titulo, "h3", "h3")}${t.img ? `<div style="margin-top:14px">${A.tile(t.img, t.titulo)}</div>` : ""}</div><div class="prose">${P("trama." + i + ".texto", t.texto)}</div></article>`).join("")}</div></div></section>` }
    ]);
  };

  /* ---------------- locais ---------------- */
  V.locais = () => A.page("locais", [
    { id: "topo", html: A.heroT("locais", { eyebrow: "Mapa da cidade", title: "Locais", lead: "Cada estabelecimento tem sua história, seu funcionamento e as pessoas que circulam por ele." }) },
    { id: "lista", html: `<section class="sec" style="padding-top:28px"><div class="wrap">${A.editLink("locais", "", "Adicionar locais ou trocar fotos")}<div class="grid g3" style="margin-top:14px">${A.C("locais").map((l, i) => `<a class="loc-card" href="#local-${esc(l.id)}">${A.tile(l.img, l.nome, "", true)}<div>${E("locais." + i + ".rotulo", l.rotulo, "p", "eyebrow")}${E("locais." + i + ".nome", l.nome, "h3")}${E("locais." + i + ".resumo", l.resumo, "p")}</div></a>`).join("")}</div></div></section>` }
  ]);
  V.local = (id) => {
    const X = A.X, l = X.loc[id], i = idxOf("locais", id);
    if (!l) return `${A.pageHero("Locais", "Local não encontrado", "")}<section class="sec"><div class="wrap"><a class="btn btn-ghost" href="#locais">Voltar aos locais</a></div></section>`;
    const base = "locais." + i;
    const groups = A.C("grupos").filter(g => g.local === l.id), people = X.slots.filter(s => groups.some(g => g.id === s.grupo));
    const block = (k, t, arr) => ((arr && arr.some(Boolean)) || ui.em ? `<div>${T("local-" + k, t, null, "h2", "h3")}<div class="prose" style="margin-top:10px">${P(base + "." + k, arr)}</div></div>` : "");
    const all = A.C("locais"), next = all[(i + 1) % all.length];
    return A.page("local:" + id, [
      { id: "topo", html: `<section class="page-hero${l.img ? " has-img" : ""}">${l.img ? A.imgTag(l.img, "", ' class="bg"') : ""}<div class="wrap"><a class="crumb" href="#locais">← ${T("local-voltar", "Todos os locais")}</a>${E(base + ".rotulo", l.rotulo, "p", "eyebrow")}${E(base + ".nome", l.nome, "h1", "display")}${E(base + ".resumo", l.resumo, "p", "lead")}</div></section>` },
      { id: "conteudo", html: `<section class="sec"><div class="wrap split">
        <div class="split-aside" style="display:grid;gap:14px">${A.tile(l.img, l.nome)}${A.editLink("locais", l.id, "Trocar foto")}
          ${groups.length ? `<div>${T("local-quem", "Quem circula por aqui", null, "p", "eyebrow")}<ul class="who" style="margin-top:8px">${people.map(s => { const st = A.slotState(s.id); return `<li><span>${esc(A.charName(s, st.r))} <span class="muted">· ${esc(s.g.nome)}</span></span><span class="pill ${A.PUB[st.st][1]}">${A.PUB[st.st][0]}</span></li>`; }).join("")}</ul></div>` : ""}</div>
        <div style="display:grid;gap:30px">${block("descricao", "Descrição", l.descricao)}${block("historia", "História", l.historia)}${block("funcionamento", "Funcionamento", l.funcionamento)}${block("trama", "Ligação com a trama", l.trama)}
          ${next && next.id !== id ? `<a class="loc-card" href="#local-${esc(next.id)}" style="grid-template-rows:none"><div><p class="eyebrow">${T("local-prox", "Próximo local")}</p><h3>${esc(next.nome)}</h3></div></a>` : ""}</div></div></section>` }
    ]);
  };

  /* ---------------- espécies ---------------- */
  V.especies = () => {
    const X = A.X, esps = A.C("especies"), grs = A.C("grupos");
    const B = [{ id: "topo", html: A.heroT("especies", { eyebrow: "Sobre as espécies", title: "Espécies", lead: "Humanos, vampiros, lobisomens e feiticeiros convivem sob acordos silenciosos." }) + `<div class="wrap" style="padding-block:16px"><nav class="chips" aria-label="Espécies">${esps.map(e => `<a class="chip" href="#esp-${esc(e.id)}"><span class="dot" style="color:${esc(e.cor)}"></span>${esc(e.nome)}</a>`).join("")}</nav></div>` }];
    esps.forEach((e, ei) => {
      const list = X.slots.filter(s => s.e.id === e.id), c = A.counts(list), b = "especies." + ei;
      B.push({ id: "esp-" + e.id, html: `<section class="esp-sec" id="esp-${esc(e.id)}" style="--fac:${esc(e.cor)}"><div class="wrap sec">
        <div class="esp-head">${A.tile(e.img, e.nome)}<div style="display:grid;gap:14px"><p class="eyebrow" style="color:var(--fac)">${c.total} vagas · ${c.livre} livres</p>${E(b + ".nome", e.nome, "h2")}<div class="prose">${P(b + ".texto", e.texto)}</div>${A.editLink("especies", e.id, "Trocar foto, cor ou kit")}</div></div>
        ${(e.tracos || []).length ? `<dl class="grid g3" style="margin:28px 0 0">${e.tracos.map((t, j) => `<div class="trait"><dt>${E(b + ".tracos." + j + ".rotulo", t.rotulo)}</dt><dd>${E(b + ".tracos." + j + ".texto", t.texto)}</dd></div>`).join("")}</dl>` : ""}
        ${(e.kit || []).length ? `<p class="small" style="margin:16px 0 0">${T("esp-kit", "Kit inicial:")} ${esc(e.kit.join(", "))}</p>` : ""}
        ${grs.map((g, gi) => { if (g.especie !== e.id) return ""; const gl = list.filter(s => s.grupo === g.id); return gl.length ? `<div class="sub-head"><div>${E("grupos." + gi + ".nome", g.nome, "h3", "h3")}${E("grupos." + gi + ".desc", g.desc, "p", "small")}</div><span class="meter-txt">${A.counts(gl).livre} de ${gl.length} livres</span></div><div class="slots">${gl.map(A.slotCard).join("")}</div>` : ""; }).join("")}
      </div></section>` });
    });
    return A.page("especies", B);
  };

  /* ---------------- diretório ---------------- */
  V.personagens = () => {
    const X = A.X, all = A.counts(X.slots), esps = A.C("especies");
    const fe = [["todas", "Todas", null]].concat(esps.map(e => [e.id, e.nome, e.cor])).map(([id, n, cor]) => `<button class="chip" type="button" data-act="set" data-k="fEsp" data-v="${esc(id)}" aria-pressed="${ui.fEsp === id}">${cor ? `<span class="dot" style="color:${esc(cor)}"></span>` : ""}${esc(n)}</button>`).join("");
    const fs = [["todas", "Todas", all.total], ["livre", "Disponíveis", all.livre], ["reservada", "Reservadas", all.reservada], ["analise", "Em análise", all.analise], ["ocupada", "Ocupadas", all.ocupada]].map(([id, n, k]) => `<button class="chip" type="button" data-act="set" data-k="fSt" data-v="${id}" aria-pressed="${ui.fSt === id}">${n} <span class="n">${k}</span></button>`).join("");
    const list = X.slots.filter(s => (ui.fEsp === "todas" || s.e.id === ui.fEsp) && (ui.fSt === "todas" || A.slotState(s.id).st === ui.fSt));
    return A.page("personagens", [
      { id: "topo", html: A.heroT("personagens", { eyebrow: "Diretório · {total} vagas", title: "Personagens", lead: "Consulte os personagens disponíveis e os já ocupados. Cada vaga mostra espécie, ocupação e situação." }, "", "", { total: X.slots.length }) },
      { id: "lista", html: `<section class="sec" style="padding-top:26px"><div class="wrap">
        <div class="panel" style="display:grid;gap:10px;margin-bottom:18px">${A.meter(all)}</div>
        ${!A.abertas() ? `<div class="callout" style="margin-bottom:18px"><b>Inscrições fechadas</b>${T("insc-fechadas", "O mestre pausou as reservas por enquanto.")}</div>` : ""}
        <div class="filters"><div class="chips" role="group" aria-label="Filtrar por espécie">${fe}</div><div class="chips" role="group" aria-label="Filtrar por situação">${fs}</div></div>
        ${list.length ? `<div class="slots">${list.map(A.slotCard).join("")}</div>` : `<div class="empty"><b>Nenhuma vaga com esses filtros.</b><button class="btn btn-ghost btn-sm" type="button" data-act="set" data-k="fSt" data-v="todas">Limpar filtro</button></div>`}</div></section>` }
    ]);
  };

  /* ---------------- jornal ---------------- */
  const TIPOS = { aviso: "Aviso", noticia: "Notícia", evento: "Evento", contrato: "Contrato", documento: "Arquivo" };
  const tipoNome = (t) => TIPOS[t] || "Notícia";
  A.TIPOS = TIPOS;
  function fmtD(d) { if (!d) return ""; const t = Date.parse(d + "T12:00:00"); return isNaN(t) ? d : A.fmtDate(t); }
  function sortedPosts() { return A.C("jornal").map((p, i) => Object.assign({ _i: i }, p)).sort((a, b) => (b.fixado ? 1 : 0) - (a.fixado ? 1 : 0) || String(b.data || "").localeCompare(String(a.data || ""))); }
  V.jornal = () => {
    const s = A.X.site, f = ui.fTipo;
    const chips = [["todos", "Tudo"], ["aviso", "Avisos"], ["noticia", "Notícias"], ["evento", "Eventos"], ["contrato", "Contratos"], ["documento", "Arquivo"]].map(([k, n]) => `<button class="chip" type="button" data-act="set" data-k="fTipo" data-v="${k}" aria-pressed="${f === k}">${esc(n)}</button>`).join("");
    const posts = sortedPosts().filter(p => f === "todos" || p.tipo === f);
    return A.page("jornal", [
      { id: "jornal", html: `<section class="sec" style="padding-top:28px"><div class="wrap"><div class="parch paper">
        <div class="masthead">${T("jornal-nome", "El Eco de {cidade}", { cidade: s.nome }, "h2")}${T("jornal-sub", "Mural de avisos · Eventos · Contratos · Arquivo da cidade", null, "p")}</div>
        <div class="chips" style="margin-bottom:6px">${chips}</div>${A.me() && A.me().isAdmin ? `<p style="margin:10px 0 0"><a class="btn btn-ghost btn-sm" href="#editor" data-act="ed-go" data-sec="jornal" data-id="">Publicar notícia nova</a></p>` : ""}
        <div class="posts">${posts.map(p => { const b = "jornal." + p._i; return `<article class="post"><div class="post-meta"><span class="tag">${esc(tipoNome(p.tipo))}</span>${p.fixado ? "<span>Fixado</span>" : ""}<span>${esc(fmtD(p.data))}</span></div>
          ${E(b + ".titulo", p.titulo, "h3")}${p.img ? A.tile(p.img, p.titulo) : ""}<div class="prose">${P(b + ".texto", p.texto)}</div>${p.recompensa || ui.em ? `<p class="post-reward" style="margin:0">Recompensa: ${E(b + ".recompensa", p.recompensa, "span", "", "valor")}</p>` : ""}</article>`; }).join("") || `<p class="muted" style="padding:20px 0">Nada publicado nesta seção.</p>`}</div>
      </div></div></section>` }
    ]);
  };
  A.sortedPosts = sortedPosts; A.tipoNome = tipoNome; A.fmtD = fmtD;

  /* ---------------- regras ---------------- */
  V.regras = () => {
    const R = A.C("regras"), s = A.X.site, vars = { prazo: s.prazoFichaHoras, pontos: s.pontosIniciais, moedas: s.saldoInicial, moeda: s.moeda };
    const passos = [["Crie sua conta", "No Painel, cadastre-se com e-mail, senha e seu nome de jogador."], ["Reserve uma vaga", "Escolha um personagem no diretório. Cada pessoa pode ter uma vaga."], ["Monte a ficha", "Você tem {prazo} horas para preencher a ficha e distribuir {pontos} pontos de atributo."], ["Aprovação", "Aprovada a ficha, você recebe o kit inicial da sua espécie, {moedas} {moeda} e o link do grupo."]];
    return A.page("regras", [
      { id: "topo", html: A.heroT("regras", { eyebrow: "Como funciona", title: "Regras", lead: "Dinâmica do jogo, convivência e o caminho até a sua vaga." }) },
      { id: "dinamica", html: `<section class="wrap" style="padding-top:28px"><div class="sub-head" style="margin-top:0">${T("regras-din", "Dinâmica", null, "h2", "h3")}</div><dl class="grid g3" style="margin:0">${(R.dinamica || []).map((d, i) => `<div class="trait"><dt>${E("regras.dinamica." + i + ".rotulo", d.rotulo)}</dt><dd>${E("regras.dinamica." + i + ".texto", d.texto)}</dd></div>`).join("")}</dl></section>` },
      { id: "passos", html: `<section class="wrap"><div class="sub-head">${T("regras-passos", "Do cadastro à primeira cena", null, "h2", "h3")}</div><ol class="rules">${passos.map((p, i) => `<li><div>${T("passo" + i + "-t", p[0], vars, "h3")}${T("passo" + i + "-x", p[1], vars, "p")}</div></li>`).join("")}</ol></section>` },
      { id: "atributos", html: `<section class="wrap"><div class="sub-head">${T("regras-atr", "Atributos", null, "h2", "h3")}</div><dl class="grid g3" style="margin:0">${A.C("atributos").map((a, i) => `<div class="trait"><dt>${E("atributos." + i + ".nome", a.nome)}</dt><dd>${E("atributos." + i + ".desc", a.desc)}</dd></div>`).join("")}</dl></section>` },
      { id: "convivencia", html: `<section class="wrap" style="padding-bottom:56px"><div class="sub-head">${T("regras-conv", "Convivência", null, "h2", "h3")}</div><ol class="rules">${(R.lista || []).map((r, i) => `<li><div>${E("regras.lista." + i + ".titulo", r.titulo, "h3")}${E("regras.lista." + i + ".texto", r.texto, "p")}</div></li>`).join("")}</ol>${A.editLink("regras", "", "Adicionar ou apagar regras")}</section>` }
    ]);
  };

  /* ---------------- mercado ---------------- */
  V.mercado = () => {
    const s = A.X.site, u = A.me(), r = A.myRes(), ok = !!(u && r && r.status === "aprovada");
    const w = u ? A.S.carteiras[u.uid] : null, all = A.C("mercado");
    const items = all.map((it, i) => Object.assign({ _i: i }, it)).filter(i => i.ativo || (u && u.isAdmin));
    const cats = [...new Set(items.map(i => i.categoria || "Outros"))];
    let gate;
    if (!u) gate = `<div class="callout c-info"><b>Área reservada</b>${T("merc-anon", "Entre na sua conta para comprar. O mercado abre para quem tem ficha aprovada.")}</div>`;
    else if (!ok) gate = `<div class="callout c-info"><b>Ainda não</b>${T("merc-pend", "O mercado abre para você depois que sua ficha for aprovada.")}</div>`;
    else gate = `<div class="callout c-ok"><b>Sua carteira</b>${w ? `${esc(w.saldo)} ${esc(s.moeda)}. Os pedidos ficam pendentes até a feiticeira entregar.` : "Sua carteira ainda está sendo preparada pelo mestre."} <a href="#painel" data-act="set" data-k="tab" data-v="carteira">Ver inventário</a></div>`;
    return A.page("mercado", [
      { id: "topo", html: A.heroT("mercado", { eyebrow: "Apotecário · fundos da loja", title: "Mercado paralelo", lead: "Verbena, poções, amuletos e armas. Pague em {moeda}. O estoque é limitado e alguns itens só aparecem quando a trama permite." }, "img/botica.webp", "", { moeda: s.moeda }) },
      { id: "itens", html: `<section class="sec" style="padding-top:26px"><div class="wrap" style="display:grid;gap:18px">${gate}${A.editLink("mercado", "", "Preços, estoque e itens novos")}
        ${cats.map(cat => `<div><div class="sub-head" style="margin-top:12px"><h2 class="h3">${esc(cat)}</h2></div><div class="grid g3">${items.filter(i => (i.categoria || "Outros") === cat).map(i => {
          const esgot = !(Number(i.estoque) > 0), b = "mercado." + i._i;
          return `<article class="item${i.ativo ? "" : " off"}">${i.img ? A.tile(i.img, i.nome) : ""}${E(b + ".nome", i.nome, "h3")}${i.restrito ? `<span class="tag" style="color:var(--brass);justify-self:start">Só ${esc(i.restrito)}</span>` : ""}${i.ativo ? "" : `<span class="tag" style="color:var(--bone-3);justify-self:start">Oculto para jogadores</span>`}${E(b + ".desc", i.desc, "p")}
            <div class="item-foot"><span class="price">${esc(i.preco)} <small>${esc(s.moeda)}</small></span><span class="small">${esgot ? "Esgotado" : "Estoque: " + esc(i.estoque)}</span></div>
            ${ok && i.ativo && !esgot ? `<form class="btn-row" data-form="pedido" data-item="${esc(i.id)}"><label class="sr" for="q-${esc(i.id)}">Quantidade</label><input class="input qty" id="q-${esc(i.id)}" name="q" type="number" min="1" max="${Math.min(20, Number(i.estoque) || 1)}" value="1"><button class="btn btn-primary btn-sm" type="submit">Pedir</button></form>` : ""}</article>`; }).join("")}</div></div>`).join("")}</div></section>` }
    ]);
  };
  A.sub.pedido = async (f) => {
    const it = A.C("mercado").find(i => i.id === f.dataset.item), q = parseInt(f.q.value, 10) || 1, u = A.me();
    if (!it) return;
    const w = A.S.carteiras[u.uid], pend = Object.values(A.S.pedidos).filter(p => p.uid === u.uid && p.status === "pendente").reduce((a, p) => a + (p.total || 0), 0);
    if (w && q * it.preco + pend > (Number(w.saldo) || 0)) A.fail("Saldo insuficiente, contando os pedidos pendentes.");
    if (q > Number(it.estoque)) A.fail("Não há estoque suficiente.");
    await A.B.order(it, q); A.toast("Pedido enviado à feiticeira.");
  };
})();
