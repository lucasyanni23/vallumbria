/* =====================================================================
   EDITOR DO SITE — o mestre altera textos, fotos, vagas, locais,
   mercado e jornal pelo próprio site, sem mexer em código.
   ===================================================================== */
(function () {
  "use strict";
  const A = window.VBA, V = A.views, ui = A.ui, B = A.B;
  const { esc } = A;
  const ed = ui.ed;

  const espOpts = () => A.C("especies").map(e => [e.id, e.nome]);
  const locOpts = () => [["", "Nenhum"]].concat(A.C("locais").map(l => [l.id, l.nome]));
  const grpOpts = () => {
    const es = {}; A.C("especies").forEach(e => { es[e.id] = e.nome; });
    return A.C("grupos").map(g => [g.id, (es[g.especie] || "") + " · " + g.nome]);
  };
  const tipoOpts = () => Object.keys(A.TIPOS).map(k => [k, A.TIPOS[k]]);

  /* tipos de campo: text, area, paras, lines, pairs, num, color, img, select, check, date */
  const SECS = [
    { id: "site", nome: "Identidade e capa", obj: true, help: "Nome, frases da capa, ícone e as regras de ficha (pontos, moeda e prazo).", f: [
      ["nome", "Nome do RPG", "text"], ["lema", "Lema", "text"], ["tagline", "Frase da capa", "area"], ["resumo", "Resumo geral", "area"],
      ["capa", "Imagem da capa", "img", "o logotipo no topo da página inicial"], ["icone", "Ícone", "img", "aparece no cabeçalho e no convite da página inicial"],
      ["cenario", "Cenário", "text"], ["estilo", "Estilo", "text"], ["genero", "Gênero", "text"], ["formato", "Formato", "text"], ["plataforma", "Plataforma", "text"],
      ["inspiracoes", "Inspirações", "lines", "uma por linha"], ["moeda", "Nome da moeda", "text"], ["saldoInicial", "Moedas ao aprovar a ficha", "num"],
      ["pontosIniciais", "Pontos de atributo na criação", "num"], ["prazoFichaHoras", "Prazo para enviar a ficha (horas)", "num"]] },
    { id: "cidade", nome: "A cidade", obj: true, f: [["titulo", "Título", "text"], ["img", "Foto", "img"], ["paragrafos", "Texto", "paras", "deixe uma linha em branco entre parágrafos"]] },
    { id: "trama", nome: "Trama", item: "capítulo", f: [["titulo", "Título", "text"], ["img", "Foto (opcional)", "img"], ["texto", "Texto", "paras", "deixe uma linha em branco entre parágrafos"]] },
    { id: "locais", nome: "Locais", item: "local", help: "Cada local ganha uma página própria.", f: [
      ["nome", "Nome", "text"], ["rotulo", "Subtítulo", "text"], ["img", "Foto", "img"], ["resumo", "Resumo do card", "area"],
      ["descricao", "Descrição", "paras"], ["historia", "História", "paras"], ["funcionamento", "Funcionamento", "paras"], ["trama", "Ligação com a trama", "paras"]] },
    { id: "especies", nome: "Espécies", item: "espécie", f: [
      ["nome", "Nome", "text"], ["cor", "Cor", "color"], ["img", "Foto", "img"], ["resumo", "Resumo do card", "area"], ["texto", "Texto", "paras"],
      ["tracos", "Características", "pairs", "uma por linha, no formato Título: texto"], ["kit", "Kit inicial", "lines", "um item por linha, como 2x Bolsa de sangue"]] },
    { id: "grupos", nome: "Grupos", item: "grupo", help: "Os grupos organizam as vagas dentro de cada espécie. O local liga o grupo à página do estabelecimento.", f: [
      ["nome", "Nome", "text"], ["especie", "Espécie", "select", espOpts], ["local", "Local ligado", "select", locOpts], ["desc", "Descrição", "area"]] },
    { id: "vagas", nome: "Vagas", item: "vaga", help: "Uma vaga ocupada não pode ser apagada. Libere a vaga no Painel antes.", f: [
      ["papel", "Papel", "text"], ["grupo", "Grupo", "select", grpOpts], ["nome", "Nome fixo (opcional)", "text", "deixe vazio para o jogador escolher"], ["img", "Foto da vaga", "img"], ["desc", "Descrição", "area"]] },
    { id: "atributos", nome: "Atributos", item: "atributo", f: [["nome", "Nome", "text"], ["desc", "Descrição", "area"]] },
    { id: "mercado", nome: "Mercado", item: "item", help: "Desmarque Visível para guardar um item especial até a trama liberar.", f: [
      ["nome", "Nome", "text"], ["categoria", "Categoria", "text"], ["preco", "Preço", "num"], ["estoque", "Estoque", "num"], ["ativo", "Visível para os jogadores", "check"],
      ["restrito", "Só para (opcional)", "text", "ex.: Vampiros"], ["img", "Foto (opcional)", "img"], ["desc", "Descrição", "area"]] },
    { id: "jornal", nome: "Jornal e mural", item: "publicação", top: true, f: [
      ["tipo", "Tipo", "select", tipoOpts], ["titulo", "Título", "text"], ["data", "Data", "date"], ["fixado", "Fixar no topo", "check"],
      ["recompensa", "Recompensa (contratos)", "text"], ["img", "Foto (opcional)", "img"], ["texto", "Texto", "paras"]] },
    { id: "regras", nome: "Regras", obj: true, f: [["dinamica", "Dinâmica", "pairs", "uma por linha, no formato Título: texto"], ["lista", "Regras de convivência", "pairs", "uma por linha, no formato Título: texto", "titulo"]] }
  ];
  const SEC = {}; SECS.forEach(s => { SEC[s.id] = s; });
  const title = (sec, it) => it.nome || it.titulo || it.papel || "Sem título";
  const sub = (sec, it) => {
    if (sec === "vagas") { const g = A.C("grupos").find(x => x.id === it.grupo); return (g ? g.nome : "Sem grupo") + (it.nome ? " · " + it.nome : ""); }
    if (sec === "mercado") return (it.preco || 0) + " " + A.X.site.moeda + " · estoque " + (it.estoque || 0) + (it.ativo ? "" : " · oculto");
    if (sec === "jornal") return (A.TIPOS[it.tipo] || "") + " · " + (it.data || "");
    if (sec === "grupos") { const e = A.C("especies").find(x => x.id === it.especie); return e ? e.nome : ""; }
    return it.rotulo || it.resumo || it.desc || "";
  };

  function load(sec) { ui.d.ed = A.clone(A.C(sec)); ed.dirty = false; ed.base = JSON.stringify(A.C(sec)); }
  A.edDirty = () => { ed.dirty = true; const bar = document.querySelector(".ed-bar"); if (bar) { bar.classList.add("dirty"); bar.querySelector(".state").textContent = "Alterações não salvas"; } };

  function field(path, f, val) {
    const [k, label, type, extra, pk] = f, id = "ed-" + path.replace(/\./g, "-"), dp = `data-d="ed.${path}"`;
    const hint = typeof extra === "string" ? ` <span class="hint">${esc(extra)}</span>` : "";
    if (type === "check") return `<label class="switch" for="${id}"><input type="checkbox" id="${id}" ${dp}${val ? " checked" : ""}>${esc(label)}</label>`;
    let input;
    if (type === "area") input = `<textarea class="textarea" id="${id}" ${dp} style="min-height:90px">${esc(val || "")}</textarea>`;
    else if (type === "paras") input = `<textarea class="textarea" id="${id}" ${dp} data-dt="paras" style="min-height:150px">${esc((val || []).join("\n\n"))}</textarea>`;
    else if (type === "lines") input = `<textarea class="textarea" id="${id}" ${dp} data-dt="lines" style="min-height:90px">${esc((val || []).join("\n"))}</textarea>`;
    else if (type === "pairs") { const kk = pk || "rotulo"; input = `<textarea class="textarea" id="${id}" ${dp} data-dt="pairs" data-pk="${kk}" style="min-height:150px">${esc((val || []).map(x => (x[kk] || "") + (x.texto ? ": " + x.texto : "")).join("\n"))}</textarea>`; }
    else if (type === "num") input = `<input class="input" type="number" id="${id}" ${dp} data-dt="num" value="${esc(val == null ? "" : val)}">`;
    else if (type === "date") input = `<input class="input" type="date" id="${id}" ${dp} value="${esc(val || "")}">`;
    else if (type === "color") input = `<input class="input" type="color" id="${id}" ${dp} data-rr="1" value="${esc(val || "#B89B72")}">`;
    else if (type === "select") input = `<select class="input" id="${id}" ${dp}>${extra().map(([v, n]) => `<option value="${esc(v)}"${String(val || "") === v ? " selected" : ""}>${esc(n)}</option>`).join("")}</select>`;
    else if (type === "img") {
      const shown = String(val || "").indexOf("db:") === 0 ? "" : (val || "");
      return `<div class="field"><span class="lbl">${esc(label)}${hint}</span><div class="imgf">${A.tile(val, label, "", true)}<div class="imgf-ctl"><input class="input" type="file" accept="image/*" id="${id}-up" data-up="ed.${path}" aria-label="Enviar ${esc(label)}"><input class="input" id="${id}" ${dp} value="${esc(shown)}" placeholder="${val && !shown ? "Foto enviada pelo site" : "ou cole um link https://"}" aria-label="Link de ${esc(label)}">${val ? `<button class="btn btn-quiet btn-xs" type="button" data-act="ed-noimg" data-p="${esc(path)}" style="justify-self:start">Remover foto</button>` : ""}</div></div></div>`;
    }
    else input = `<input class="input" id="${id}" ${dp} value="${esc(val || "")}">`;
    return `<div class="field"><label for="${id}">${esc(label)}${hint}</label>${input}</div>`;
  }

  V.editor = () => {
    const u = A.me();
    if (!u || !u.isAdmin) return `${A.pageHero("Editor do site", "Só para o mestre", "Entre com a conta do mestre para editar o site.")}<section class="sec"><div class="wrap"><a class="btn btn-primary" href="#painel">Ir para o Painel</a></div></section>`;
    const sec = SEC[ed.sec] || SECS[0];
    if (ui.dk.ed !== sec.id || (!ed.dirty && ed.base !== JSON.stringify(A.C(sec.id)))) { load(sec.id); ui.dk.ed = sec.id; }
    const d = ui.d.ed;
    const nav = SECS.map(s => `<button class="chip" type="button" data-act="ed-sec" data-v="${s.id}" aria-pressed="${s.id === sec.id}">${esc(s.nome)}</button>`).join("");
    let body;
    if (sec.obj) body = `<div class="panel form">${sec.f.map(f => field(f[0], f, d[f[0]])).join("")}</div>`;
    else {
      const rows = d.map((it, i) => {
        const open = ed.open === (it.id || "#" + i) || ed.open === i;
        const key = it.id || "#" + i;
        const del = ui.confirm === "del" + i
          ? `<div class="confirm-box" style="margin:0 10px 10px"><span>Apagar <b>${esc(title(sec.id, it))}</b>? A mudança só vale depois de salvar.</span><div class="btn-row"><button class="btn btn-danger btn-sm" type="button" data-act="ed-del" data-i="${i}">Apagar</button><button class="btn btn-quiet btn-sm" type="button" data-act="unask">Voltar</button></div></div>` : "";
        return `<div class="ed-item${open ? " open" : ""}"><div class="ed-row">
          <button class="t" type="button" data-act="ed-open" data-k="${esc(key)}" aria-expanded="${open}"><b>${esc(title(sec.id, it))}</b><small>${esc(sub(sec.id, it))}</small></button>
          <button class="icon-btn" type="button" data-act="ed-mv" data-i="${i}" data-n="-1" aria-label="Subir"${i === 0 ? " disabled" : ""}>↑</button>
          <button class="icon-btn" type="button" data-act="ed-mv" data-i="${i}" data-n="1" aria-label="Descer"${i === d.length - 1 ? " disabled" : ""}>↓</button>
          <button class="icon-btn" type="button" data-act="ed-dup" data-i="${i}" aria-label="Duplicar">⧉</button>
          <button class="icon-btn" type="button" data-act="ask" data-k="del${i}" aria-label="Apagar" style="color:var(--danger)">✕</button></div>${del}
          ${open ? `<div class="ed-body form">${sec.f.map(f => field(i + "." + f[0], f, it[f[0]])).join("")}</div>` : ""}</div>`;
      }).join("");
      body = `<div class="btn-row" style="margin-bottom:12px"><button class="btn btn-ghost btn-sm" type="button" data-act="ed-add">+ Adicionar ${esc(sec.item)}</button><span class="small">${d.length} ${d.length === 1 ? sec.item : "itens"}</span></div><div class="ed-list">${rows}</div>`;
    }
    const sw = ui.confirm === "edsw" ? `<div class="confirm-box" style="margin-bottom:14px"><span>Há alterações não salvas em ${esc(sec.nome)}. Descartar e trocar de seção?</span><div class="btn-row"><button class="btn btn-danger btn-sm" type="button" data-act="ed-sw-yes">Descartar e trocar</button><button class="btn btn-quiet btn-sm" type="button" data-act="unask">Continuar editando</button></div></div>` : "";
    const rst = ui.confirm === "edrst" ? `<div class="confirm-box"><span>Voltar ${esc(sec.nome)} ao conteúdo original do site? A mudança só vale depois de salvar.</span><div class="btn-row"><button class="btn btn-danger btn-sm" type="button" data-act="ed-rst-yes">Restaurar original</button><button class="btn btn-quiet btn-sm" type="button" data-act="unask">Voltar</button></div></div>` : "";
    return `${A.pageHero("Painel do mestre", "Editor do site", "Altere textos, fotos, vagas, locais, mercado e jornal. As mudanças aparecem para todos assim que você salva.", "", `<a class="crumb" href="#painel">← Voltar ao Painel</a>`)}
      <section class="sec" style="padding-top:24px"><div class="wrap">
        ${B.mode === "demo" ? `<div class="callout" style="margin-bottom:14px"><b>Modo demonstração</b>As edições ficam salvas só neste navegador até o Firebase ser ligado.</div>` : ""}
        <div class="chips" style="flex-wrap:wrap;margin-bottom:16px">${nav}</div>${sw}
        <div class="sub-head" style="margin-top:4px"><h2 class="h3">${esc(sec.nome)}</h2>${sec.help ? `<span class="small" style="max-width:60ch">${esc(sec.help)}</span>` : ""}</div>
        ${body}${rst}
        <div class="ed-bar${ed.dirty ? " dirty" : ""}"><span class="state">${ed.dirty ? "Alterações não salvas" : "Tudo salvo"}</span><div class="btn-row"><button class="btn btn-quiet btn-sm" type="button" data-act="ask" data-k="edrst">Restaurar original</button><button class="btn btn-ghost btn-sm" type="button" data-act="ed-undo">Descartar</button><button class="btn btn-primary btn-sm" type="button" data-act="ed-save">Salvar ${esc(sec.nome.toLowerCase())}</button></div></div>
      </div></section>`;
  };

  /* ---------------- ações ---------------- */
  const goSec = (s, open) => { ed.sec = s; ed.open = open || null; ui.dk.ed = null; ui.confirm = null; };
  A.act["ed-go"] = (t, e) => { if (e) e.preventDefault(); goSec(t.dataset.sec, t.dataset.id || null); ed.dirty = false; if (location.hash === "#editor") A.render(); else location.hash = "editor"; };
  A.act["ed-sec"] = (t) => { if (ed.dirty) { ed.next = t.dataset.v; ui.confirm = "edsw"; A.render(); return; } goSec(t.dataset.v); A.render(); };
  A.act["ed-sw-yes"] = () => { ed.dirty = false; goSec(ed.next); A.render(); };
  A.act["ed-open"] = (t) => { const k = t.dataset.k; ed.open = ed.open === k ? null : k; ui.confirm = null; A.render(); };
  A.act["ed-mv"] = (t) => { const d = ui.d.ed, i = +t.dataset.i, j = i + Number(t.dataset.n); if (j < 0 || j >= d.length) return; [d[i], d[j]] = [d[j], d[i]]; A.edDirty(); A.render(); };
  A.act["ed-dup"] = (t) => { const d = ui.d.ed, i = +t.dataset.i, c = A.clone(d[i]); c.id = ""; if (c.nome) c.nome += " (cópia)"; else if (c.titulo) c.titulo += " (cópia)"; else if (c.papel) c.papel += " (cópia)"; d.splice(i + 1, 0, c); ed.open = "#" + (i + 1); A.edDirty(); A.render(); };
  A.act["ed-del"] = (t) => {
    const d = ui.d.ed, i = +t.dataset.i, it = d[i];
    if (ed.sec === "vagas" && it.id && A.S.vagas[it.id]) { ui.confirm = null; A.toast("Essa vaga está ocupada ou reservada. Libere a vaga no Painel antes de apagar.", true); A.render(); return; }
    d.splice(i, 1); ui.confirm = null; ed.open = null; A.edDirty(); A.render();
  };
  A.act["ed-add"] = () => {
    const sec = ed.sec, d = ui.d.ed, it = { id: "" };
    SEC[sec].f.forEach(([k, , type, extra]) => { it[k] = type === "paras" || type === "lines" || type === "pairs" ? [] : type === "num" ? 0 : type === "check" ? true : type === "select" ? ((extra()[0] || [""])[0]) : ""; });
    if (sec === "jornal") { it.data = new Date().toISOString().slice(0, 10); it.tipo = "noticia"; it.fixado = false; }
    if (sec === "especies") it.cor = "#B89B72";
    if (sec === "grupos") it.local = "";
    if (SEC[sec].top) { d.unshift(it); ed.open = "#0"; } else { d.push(it); ed.open = "#" + (d.length - 1); }
    A.edDirty(); A.render();
    setTimeout(() => { const f = document.querySelector(".ed-item.open .ed-body input:not([type=file]), .ed-item.open .ed-body select"); if (f) f.focus(); }, 30);
  };
  A.act["ed-noimg"] = (t) => { A.setPath(ui.d, "ed." + t.dataset.p, ""); A.edDirty(); A.render(); };
  A.act["ed-undo"] = () => { load(ed.sec); ui.dk.ed = ed.sec; ui.confirm = null; A.render(); };
  A.act["ed-rst-yes"] = () => { ui.d.ed = A.clone(ed.sec === "site" ? A.D.site : A.D[ed.sec]); ui.confirm = null; A.edDirty(); A.render(); };

  const slug = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32);
  A.act["ed-save"] = async () => {
    const sec = ed.sec, cfg = SEC[sec];
    let v = A.clone(ui.d.ed);
    if (!cfg.obj) {
      const used = new Set();
      v.forEach(it => { if (it.id) used.add(it.id); });
      for (const it of v) {
        const t = title(sec, it);
        if (!t || t === "Sem título") { A.toast("Há um item sem nome ou título. Preencha antes de salvar.", true); return; }
        if (!it.id) {
          const pre = sec === "vagas" ? "v" : sec === "jornal" ? "j" : "";
          let base = sec === "vagas" ? "v-" + Math.random().toString(36).slice(2, 8) : (pre ? pre + "-" : "") + (slug(t) || "item"), id = base, n = 2;
          while (used.has(id)) id = base + "-" + n++;
          it.id = id; used.add(id);
        }
      }
      if (sec === "vagas") {
        const ids = new Set(v.map(x => x.id)), lost = Object.keys(A.S.vagas).filter(id => !ids.has(id));
        if (lost.length) { A.toast("Uma vaga ocupada foi removida. Libere a vaga no Painel antes.", true); return; }
      }
    } else if (sec === "site") {
      ["saldoInicial", "pontosIniciais", "prazoFichaHoras"].forEach(k => { v[k] = Math.max(0, Number(v[k]) || 0); });
      if (!v.nome) { A.toast("O RPG precisa de um nome.", true); return; }
    }
    if (JSON.stringify(v).length > 900000) { A.toast("Essa seção ficou grande demais para salvar. Divida o texto ou use fotos enviadas pelo botão.", true); return; }
    const ok = await A.run(() => B.admin.saveContent(sec, v), "Alterações salvas.");
    if (ok) { ui.d.ed = v; ed.base = JSON.stringify(v); ed.dirty = false; A.render(); }
  };

  window.addEventListener("beforeunload", (e) => { if (ed.dirty && ui.page === "editor") { e.preventDefault(); e.returnValue = ""; } });
  A.boot();
})();
