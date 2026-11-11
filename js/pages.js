/* =====================================================================
   PÁGINAS PÚBLICAS — início, cidade, locais, espécies, personagens,
   jornal, regras e mercado.
   ===================================================================== */
(function () {
  "use strict";
  const A = window.VBA, V = A.views, ui = A.ui;
  const { esc } = A;

  /* ---------------- lua (lobisomens dependem dela) ---------------- */
  const SYN = 29.530588853, REF = Date.UTC(2000, 0, 6, 18, 14) ;
  function moon(t) {
    const age = (((t - REF) / 86400000) % SYN + SYN) % SYN;
    const names = ["Lua nova", "Lua crescente", "Quarto crescente", "Crescente gibosa", "Lua cheia", "Minguante gibosa", "Quarto minguante", "Lua minguante"];
    const idx = Math.floor(((age / SYN) * 8) + 0.5) % 8;
    const illum = Math.round((1 - Math.cos(2 * Math.PI * age / SYN)) / 2 * 100);
    let toFull = SYN / 2 - age; if (toFull < 0) toFull += SYN;
    return { age, name: names[idx], illum, full: t + toFull * 86400000, waxing: age < SYN / 2 };
  }
  function moonSVG(m) {
    const r = 40, k = Math.cos(2 * Math.PI * m.age / SYN), sweepOuter = m.waxing ? 1 : 0;
    const rx = Math.abs(k) * r, inner = k > 0 ? (m.waxing ? 0 : 1) : (m.waxing ? 1 : 0);
    const path = `M42 2 A${r} ${r} 0 0 ${sweepOuter} 42 82 A${rx.toFixed(2)} ${r} 0 0 ${inner} 42 2Z`;
    return `<svg viewBox="0 0 84 84" role="img" aria-label="${esc(m.name)}, ${m.illum}% iluminada"><circle cx="42" cy="42" r="40" fill="#221718" stroke="#574044"/><path d="${path}" fill="#EDE3D6"/></svg>`;
  }
  function tonight() {
    const m = moon(Date.now()), dias = Math.round((m.full - Date.now()) / 86400000);
    const prox = dias <= 0 ? "Esta noite" : dias === 1 ? "Amanhã" : "Em " + dias + " dias";
    const hoje = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Madrid" }).format(new Date());
    const hora = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" }).format(new Date());
    const aviso = m.illum >= 97 ? "Lua cheia. A Reserva fica fechada até o amanhecer." : dias <= 3 ? "A lua cheia se aproxima. Evite as trilhas depois do anoitecer." : "Noite comum em Vallumbría. Até onde se sabe.";
    return `<div class="panel tonight">${moonSVG(m)}<div><p class="eyebrow">Esta noite em Vallumbría</p><h3>${esc(m.name)}</h3><p class="small" style="margin:4px 0 0">${esc(aviso)}</p></div>
      <dl><div><dt>Hoje</dt><dd>${esc(hoje)}</dd></div><div><dt>Hora local</dt><dd>${esc(hora)}</dd></div><div><dt>Lua iluminada</dt><dd>${m.illum}%</dd></div><div><dt>Próxima cheia</dt><dd>${esc(prox)}</dd></div></dl></div>`;
  }

  /* ---------------- início ---------------- */
  V.inicio = () => {
    const X = A.X, s = X.site, c = A.counts(X.slots), posts = sortedPosts().slice(0, 3);
    const esps = A.C("especies").map(e => { const k = A.counts(X.slots.filter(v => v.e.id === e.id)); return `<a class="esp-card" href="#esp-${esc(e.id)}" style="--fac:${esc(e.cor)}"><h3>${esc(e.nome)}</h3><p>${esc(e.resumo)}</p>${A.meter(k)}</a>`; }).join("");
    return `<section class="hero"><div class="wrap">
        ${s.capa ? `<div class="hero-art">${A.imgTag(s.capa, s.nome)}</div><h1 class="sr">${esc(s.nome)}</h1>` : `<h1 class="display hero-name">${esc(s.nome)}</h1>`}
        <p class="hero-lema">${esc(s.lema)}</p>
        <p class="hero-tag">${esc(s.tagline)}</p>
        <div class="btn-row" style="justify-content:center"><a class="btn btn-primary" href="#personagens">Escolher personagem</a><a class="btn btn-ghost" href="#cidade">Conhecer a cidade</a></div>
        ${A.editLink("site", "", "Editar capa e textos")}
      </div></section>

      <section class="wrap" style="padding-top:24px"><div class="grid g2">
        ${tonight()}
        <div class="panel" style="display:grid;gap:12px;align-content:start"><div class="sub-head"><p class="eyebrow">Mural de avisos</p><a class="small" href="#jornal">Ver jornal</a></div>
          <div class="mural">${posts.map(p => `<a href="#jornal"><span class="small">${esc(tipoNome(p.tipo))} · ${esc(fmtD(p.data))}</span><b>${esc(p.titulo)}</b></a>`).join("") || `<p class="muted" style="margin:0">Nenhum aviso por enquanto.</p>`}</div></div>
      </div></section>

      <section class="sec"><div class="wrap split">
        <div class="split-aside"><p class="eyebrow">Ideia base</p><h2 class="sec-title">Uma cidade apagada do mapa.</h2>
          <dl class="facts" style="margin-top:18px"><div><dt>Cenário</dt><dd>${esc(s.cenario)}</dd></div><div><dt>Estilo</dt><dd>${esc(s.estilo)}</dd></div><div><dt>Gênero</dt><dd>${esc(s.genero)}</dd></div><div><dt>Formato</dt><dd>${esc(s.formato)}</dd></div><div><dt>Plataforma</dt><dd>${esc(s.plataforma)}</dd></div><div><dt>Vagas livres</dt><dd>${c.livre} de ${c.total}</dd></div></dl></div>
        <div class="prose"><p class="dropcap">${esc(s.resumo)}</p><p class="small">Inspirações: ${esc((s.inspiracoes || []).join(", "))}</p></div>
      </div></section>

      <section class="parch"><div class="wrap sec">
        <div class="sec-head"><p class="eyebrow">Conheça Vallumbría</p><h2 class="sec-title">História e estabelecimentos</h2></div>
        <div class="loc-strip">${A.C("locais").map(l => `<a class="loc-mini" href="#local-${esc(l.id)}">${A.tile(l.img, l.nome, "", true)}<span>${esc(l.nome)}</span></a>`).join("")}</div>
        <p style="margin:22px 0 0" class="on-parch"><a class="btn btn-ghost btn-sm" href="#locais">Ver todos os locais</a></p>
      </div></section>

      <section class="sec"><div class="wrap">
        <div class="sec-head"><p class="eyebrow">Diretório de personagens</p><h2 class="sec-title">Quatro espécies, ${c.total} vagas</h2></div>
        <div class="grid g4">${esps}</div>
      </div></section>

      <section class="wrap" style="padding-bottom:40px"><div class="cta"><div style="display:grid;gap:14px;justify-items:start">
        <p class="eyebrow">${c.livre} vagas abertas</p><h2>Alguns segredos é melhor deixar enterrados.</h2>
        <p class="lead" style="font-size:18px">Reserve uma vaga, monte sua ficha com atributos e kit inicial e espere a aprovação do mestre.</p>
        <div class="btn-row"><a class="btn btn-primary" href="#personagens">Ver vagas</a><a class="btn btn-ghost" href="#regras">Regras</a></div></div>
        ${s.icone ? A.imgTag(s.icone, "", ' class="cta-ic"') : ""}</div></section>`;
  };

  /* ---------------- cidade ---------------- */
  function pageHero(eyebrow, title, lead, img, extra) {
    return `<section class="page-hero${img ? " has-img" : ""}">${img ? A.imgTag(img, "", ' class="bg"') : ""}<div class="wrap">${extra || ""}<p class="eyebrow">${esc(eyebrow)}</p><h1 class="display">${esc(title)}</h1>${lead ? `<p class="lead">${esc(lead)}</p>` : ""}</div></section>`;
  }
  A.pageHero = pageHero;
  V.cidade = () => {
    const c = A.C("cidade"), tr = A.C("trama"), s = A.X.site;
    return `${pageHero("Sobre a cidade", c.titulo || "A Cidade", s.tagline, c.img)}
      <section class="sec"><div class="wrap split">
        <div class="split-aside">${A.tile(c.img, c.titulo)}<div style="margin-top:12px">${A.editLink("cidade", "", "Editar a cidade")}</div></div>
        <div class="prose">${(c.paragrafos || []).map((p, i) => `<p${i === 0 ? ' class="dropcap"' : ""}>${esc(p)}</p>`).join("")}</div>
      </div></section>
      <section class="sec" style="padding-top:0"><div class="wrap">
        <div class="sec-head"><p class="eyebrow">Sobre a trama</p><h2 class="sec-title">O que a terra começou a revelar</h2>${A.editLink("trama", "", "Editar a trama")}</div>
        <div class="grid" style="gap:0">${tr.map((t, i) => `<article class="split" style="padding:26px 0;border-top:1px solid var(--line)">
          <div><p class="eyebrow">${["I", "II", "III", "IV", "V", "VI", "VII", "VIII"][i] || i + 1}</p><h3 class="h3" style="font-size:clamp(26px,3.6vw,34px)">${esc(t.titulo)}</h3>${t.img ? `<div style="margin-top:14px">${A.tile(t.img, t.titulo)}</div>` : ""}</div>
          <div class="prose">${(t.texto || []).map(p => `<p>${esc(p)}</p>`).join("")}</div></article>`).join("")}</div>
      </div></section>`;
  };

  /* ---------------- locais ---------------- */
  V.locais = () => `${pageHero("Mapa da cidade", "Locais", "Cada estabelecimento tem sua história, seu funcionamento e as pessoas que circulam por ele.")}
    <section class="sec" style="padding-top:28px"><div class="wrap">${A.editLink("locais", "", "Editar locais")}
      <div class="grid g3" style="margin-top:14px">${A.C("locais").map(l => `<a class="loc-card" href="#local-${esc(l.id)}">${A.tile(l.img, l.nome, "", true)}<div><p class="eyebrow">${esc(l.rotulo || "")}</p><h3>${esc(l.nome)}</h3><p>${esc(l.resumo)}</p></div></a>`).join("")}</div>
    </div></section>`;

  V.local = (id) => {
    const X = A.X, l = X.loc[id];
    if (!l) return `${pageHero("Locais", "Local não encontrado", "")}<section class="sec"><div class="wrap"><a class="btn btn-ghost" href="#locais">Voltar aos locais</a></div></section>`;
    const groups = A.C("grupos").filter(g => g.local === l.id);
    const people = X.slots.filter(s => groups.some(g => g.id === s.grupo));
    const block = (t, arr) => (arr && arr.length ? `<div><h2 class="h3" style="margin-bottom:10px">${t}</h2><div class="prose">${arr.map(p => `<p>${esc(p)}</p>`).join("")}</div></div>` : "");
    const all = A.C("locais"), i = all.findIndex(x => x.id === id), next = all[(i + 1) % all.length];
    return `${pageHero(l.rotulo || "Local", l.nome, l.resumo, l.img, `<a class="crumb" href="#locais">← Todos os locais</a>`)}
      <section class="sec"><div class="wrap split">
        <div class="split-aside" style="display:grid;gap:14px">${A.tile(l.img, l.nome)}${A.editLink("locais", l.id, "Editar este local")}
          ${groups.length ? `<div><p class="eyebrow" style="margin-bottom:8px">Quem circula por aqui</p><ul class="who">${people.map(s => { const st = A.slotState(s.id); return `<li><span>${esc(A.charName(s, st.r))} <span class="muted">· ${esc(s.g.nome)}</span></span><span class="pill ${A.PUB[st.st][1]}">${A.PUB[st.st][0]}</span></li>`; }).join("")}</ul></div>` : ""}</div>
        <div style="display:grid;gap:30px">${block("Descrição", l.descricao)}${block("História", l.historia)}${block("Funcionamento", l.funcionamento)}${block("Ligação com a trama", l.trama)}
          ${next && next.id !== id ? `<a class="loc-card" href="#local-${esc(next.id)}" style="grid-template-rows:none"><div><p class="eyebrow">Próximo local</p><h3>${esc(next.nome)}</h3></div></a>` : ""}</div>
      </div></section>`;
  };

  /* ---------------- espécies ---------------- */
  V.especies = () => {
    const X = A.X;
    return `${pageHero("Sobre as espécies", "Espécies", "Humanos, vampiros, lobisomens e feiticeiros convivem sob acordos silenciosos.")}
      <div class="wrap" style="padding-block:16px"><nav class="chips" aria-label="Espécies">${A.C("especies").map(e => `<a class="chip" href="#esp-${esc(e.id)}"><span class="dot" style="color:${esc(e.cor)}"></span>${esc(e.nome)}</a>`).join("")}</nav></div>
      ${A.C("especies").map(e => {
        const list = X.slots.filter(s => s.e.id === e.id), c = A.counts(list), grps = A.C("grupos").filter(g => g.especie === e.id);
        return `<section class="esp-sec" id="esp-${esc(e.id)}" style="--fac:${esc(e.cor)}"><div class="wrap sec">
          <div class="esp-head">${A.tile(e.img, e.nome)}<div style="display:grid;gap:14px"><p class="eyebrow" style="color:var(--fac)">${c.total} vagas · ${c.livre} livres</p><h2>${esc(e.nome)}</h2><div class="prose">${(e.texto || []).map(p => `<p>${esc(p)}</p>`).join("")}</div>${A.editLink("especies", e.id, "Editar espécie")}</div></div>
          ${(e.tracos || []).length ? `<dl class="grid g3" style="margin:28px 0 0">${e.tracos.map(t => `<div class="trait"><dt>${esc(t.rotulo)}</dt><dd>${esc(t.texto)}</dd></div>`).join("")}</dl>` : ""}
          ${(e.kit || []).length ? `<p class="small" style="margin:16px 0 0">Kit inicial: ${esc(e.kit.join(", "))}</p>` : ""}
          ${grps.map(g => { const gl = list.filter(s => s.grupo === g.id); return gl.length ? `<div class="sub-head"><div><h3 class="h3">${esc(g.nome)}</h3><p class="small" style="margin:2px 0 0;max-width:60ch">${esc(g.desc)}</p></div><span class="meter-txt">${A.counts(gl).livre} de ${gl.length} livres</span></div><div class="slots">${gl.map(A.slotCard).join("")}</div>` : ""; }).join("")}
        </div></section>`;
      }).join("")}`;
  };

  /* ---------------- diretório ---------------- */
  V.personagens = () => {
    const X = A.X, all = A.counts(X.slots), esps = A.C("especies");
    const fe = [["todas", "Todas", null]].concat(esps.map(e => [e.id, e.nome, e.cor])).map(([id, n, cor]) => `<button class="chip" type="button" data-act="set" data-k="fEsp" data-v="${esc(id)}" aria-pressed="${ui.fEsp === id}">${cor ? `<span class="dot" style="color:${esc(cor)}"></span>` : ""}${esc(n)}</button>`).join("");
    const fs = [["todas", "Todas", all.total], ["livre", "Disponíveis", all.livre], ["reservada", "Reservadas", all.reservada], ["analise", "Em análise", all.analise], ["ocupada", "Ocupadas", all.ocupada]].map(([id, n, k]) => `<button class="chip" type="button" data-act="set" data-k="fSt" data-v="${id}" aria-pressed="${ui.fSt === id}">${n} <span class="n">${k}</span></button>`).join("");
    const list = X.slots.filter(s => (ui.fEsp === "todas" || s.e.id === ui.fEsp) && (ui.fSt === "todas" || A.slotState(s.id).st === ui.fSt));
    return `${pageHero("Diretório · " + X.slots.length + " vagas", "Personagens", "Consulte os personagens disponíveis e os já ocupados. Cada vaga mostra espécie, ocupação e situação.")}
      <section class="sec" style="padding-top:26px"><div class="wrap">
        <div class="panel" style="display:grid;gap:10px;margin-bottom:18px">${A.meter(all)}</div>
        ${!A.abertas() ? `<div class="callout" style="margin-bottom:18px"><b>Inscrições fechadas</b>O mestre pausou as reservas por enquanto.</div>` : ""}
        <div class="filters"><div class="chips" role="group" aria-label="Filtrar por espécie">${fe}</div><div class="chips" role="group" aria-label="Filtrar por situação">${fs}</div></div>
        ${list.length ? `<div class="slots">${list.map(A.slotCard).join("")}</div>` : `<div class="empty"><b>Nenhuma vaga com esses filtros.</b><button class="btn btn-ghost btn-sm" type="button" data-act="set" data-k="fSt" data-v="todas">Limpar filtro</button></div>`}
      </div></section>`;
  };

  /* ---------------- jornal ---------------- */
  const TIPOS = { aviso: "Aviso", noticia: "Notícia", evento: "Evento", contrato: "Contrato", documento: "Arquivo" };
  const tipoNome = (t) => TIPOS[t] || "Notícia";
  A.TIPOS = TIPOS;
  function fmtD(d) { if (!d) return ""; const t = Date.parse(d + "T12:00:00"); return isNaN(t) ? d : A.fmtDate(t); }
  function sortedPosts() { return A.C("jornal").slice().sort((a, b) => (b.fixado ? 1 : 0) - (a.fixado ? 1 : 0) || String(b.data || "").localeCompare(String(a.data || ""))); }
  V.jornal = () => {
    const s = A.X.site, f = ui.fTipo;
    const chips = [["todos", "Tudo"]].concat(Object.keys(TIPOS).map(k => [k, TIPOS[k] + "s"])).map(([k, n]) => `<button class="chip" type="button" data-act="set" data-k="fTipo" data-v="${k}" aria-pressed="${f === k}">${esc(k === "noticia" ? "Notícias" : n)}</button>`).join("");
    const posts = sortedPosts().filter(p => f === "todos" || p.tipo === f);
    return `<section class="sec" style="padding-top:28px"><div class="wrap"><div class="parch paper">
      <div class="masthead"><h2>El Eco de ${esc(s.nome)}</h2><p>Mural de avisos · Eventos · Contratos · Arquivo da cidade</p></div>
      <div class="chips" style="margin-bottom:6px">${chips}</div>${A.me() && A.me().isAdmin ? `<p style="margin:10px 0 0"><a class="btn btn-ghost btn-sm" href="#editor" data-act="ed-go" data-sec="jornal" data-id="">Publicar ou editar</a></p>` : ""}
      <div class="posts">${posts.map(p => `<article class="post"><div class="post-meta"><span class="tag">${esc(tipoNome(p.tipo))}</span>${p.fixado ? "<span>Fixado</span>" : ""}<span>${esc(fmtD(p.data))}</span></div>
        <h3>${esc(p.titulo)}</h3>${p.img ? A.tile(p.img, p.titulo) : ""}<div class="prose">${(p.texto || []).map(t => `<p>${esc(t)}</p>`).join("")}</div>${p.recompensa ? `<p class="post-reward" style="margin:0">Recompensa: ${esc(p.recompensa)}</p>` : ""}</article>`).join("") || `<p class="muted" style="padding:20px 0">Nada publicado nesta seção.</p>`}</div>
    </div></div></section>`;
  };
  A.sortedPosts = sortedPosts; A.tipoNome = tipoNome; A.fmtD = fmtD;

  /* ---------------- regras ---------------- */
  V.regras = () => {
    const R = A.C("regras"), s = A.X.site;
    const passos = [["Crie sua conta", "No Painel, cadastre-se com e-mail, senha e seu nome de jogador."], ["Reserve uma vaga", "Escolha um personagem no diretório. Cada pessoa pode ter uma vaga."], ["Monte a ficha", "Você tem " + s.prazoFichaHoras + " horas para preencher a ficha e distribuir " + s.pontosIniciais + " pontos de atributo."], ["Aprovação", "Aprovada a ficha, você recebe o kit inicial da sua espécie, " + s.saldoInicial + " " + s.moeda + " e o link do grupo."]];
    return `${pageHero("Como funciona", "Regras", "Dinâmica do jogo, convivência e o caminho até a sua vaga.")}
      <section class="sec" style="padding-top:28px"><div class="wrap">${A.editLink("regras", "", "Editar regras")}
        <div class="sub-head" style="margin-top:14px"><h2 class="h3">Dinâmica</h2></div>
        <dl class="grid g3" style="margin:0">${(R.dinamica || []).map(d => `<div class="trait"><dt>${esc(d.rotulo)}</dt><dd>${esc(d.texto)}</dd></div>`).join("")}</dl>
        <div class="sub-head"><h2 class="h3">Do cadastro à primeira cena</h2></div>
        <ol class="rules">${passos.map(p => `<li><div><h3>${esc(p[0])}</h3><p>${esc(p[1])}</p></div></li>`).join("")}</ol>
        <div class="sub-head"><h2 class="h3">Atributos</h2></div>
        <dl class="grid g3" style="margin:0">${A.C("atributos").map(a => `<div class="trait"><dt>${esc(a.nome)}</dt><dd>${esc(a.desc)}</dd></div>`).join("")}</dl>
        <div class="sub-head"><h2 class="h3">Convivência</h2></div>
        <ol class="rules">${(R.lista || []).map(r => `<li><div><h3>${esc(r.titulo)}</h3><p>${esc(r.texto)}</p></div></li>`).join("")}</ol>
      </div></section>`;
  };

  /* ---------------- mercado ---------------- */
  V.mercado = () => {
    const s = A.X.site, u = A.me(), r = A.myRes(), ok = !!(u && r && r.status === "aprovada");
    const w = u ? A.S.carteiras[u.uid] : null;
    const items = A.C("mercado").filter(i => i.ativo || (u && u.isAdmin));
    const cats = [...new Set(items.map(i => i.categoria || "Outros"))];
    let gate;
    if (!u) gate = `<div class="callout c-info"><b>Área reservada</b>Entre na sua conta para comprar. O mercado abre para quem tem ficha aprovada.</div>`;
    else if (!ok) gate = `<div class="callout c-info"><b>Ainda não</b>O mercado abre para você depois que sua ficha for aprovada.</div>`;
    else gate = `<div class="callout c-ok"><b>Sua carteira</b>${w ? `${esc(w.saldo)} ${esc(s.moeda)}. Os pedidos ficam pendentes até a feiticeira entregar.` : "Sua carteira ainda está sendo preparada pelo mestre."} <a href="#painel" data-act="set" data-k="tab" data-v="carteira">Ver inventário</a></div>`;
    return `${pageHero("Apotecário · fundos da loja", "Mercado paralelo", "Verbena, poções, amuletos e armas. Pague em " + s.moeda + ". O estoque é limitado e alguns itens só aparecem quando a trama permite.", "img/botica.webp")}
      <section class="sec" style="padding-top:26px"><div class="wrap" style="display:grid;gap:18px">${gate}${A.editLink("mercado", "", "Editar estoque e preços")}
        ${cats.map(cat => `<div><div class="sub-head" style="margin-top:12px"><h2 class="h3">${esc(cat)}</h2></div><div class="grid g3">${items.filter(i => (i.categoria || "Outros") === cat).map(i => {
          const esgot = !(Number(i.estoque) > 0), ped = ui.d.qty && ui.d.qty[i.id];
          return `<article class="item${i.ativo ? "" : " off"}">${i.img ? A.tile(i.img, i.nome) : ""}<h3>${esc(i.nome)}</h3>${i.restrito ? `<span class="tag" style="color:var(--brass);justify-self:start">Só ${esc(i.restrito)}</span>` : ""}${i.ativo ? "" : `<span class="tag" style="color:var(--bone-3);justify-self:start">Oculto para jogadores</span>`}<p>${esc(i.desc)}</p>
            <div class="item-foot"><span class="price">${esc(i.preco)} <small>${esc(s.moeda)}</small></span><span class="small">${esgot ? "Esgotado" : "Estoque: " + esc(i.estoque)}</span></div>
            ${ok && i.ativo && !esgot ? `<form class="btn-row" data-form="pedido" data-item="${esc(i.id)}"><label class="sr" for="q-${esc(i.id)}">Quantidade</label><input class="input qty" id="q-${esc(i.id)}" name="q" type="number" min="1" max="${Math.min(20, Number(i.estoque) || 1)}" value="${ped || 1}"><button class="btn btn-primary btn-sm" type="submit">Pedir</button></form>` : ""}</article>`; }).join("")}</div></div>`).join("")}
      </div></section>`;
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
