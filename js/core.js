/* =====================================================================
   NÚCLEO — navegação, peças compartilhadas e eventos.
   O conteúdo do site vem de data.js e do Editor (Painel → Editor do site).
   ===================================================================== */
(function () {
  "use strict";
  const D = window.VB_DATA, B = window.VB, S = B.state;
  const view = document.getElementById("view");
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/<\/?(b|strong|i|em|u|br)\s*\/?>/gi, (m) => (/br/i.test(m) ? " " : "")).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clone = (o) => JSON.parse(JSON.stringify(o == null ? null : o));

  const ui = {
    page: null, param: null, fEsp: "todas", fSt: "todas", fTipo: "todos",
    confirmSlot: null, pendingSlot: null, openSlot: null, em: false, inl: {}, inlN: 0,
    pnTab: "entrar", tab: "ficha", mtab: "fichas", exp: {}, confirm: null, editProfile: false,
    d: {}, dk: {}, ed: { sec: "site", open: null, dirty: false, next: null }, stale: false
  };
  const A = window.VBA = { views: {}, act: {}, sub: {}, ui, X: null };

  /* ---------------- conteúdo ---------------- */
  function C(sec) {
    if (ui.inl && ui.inl[sec] !== undefined) return sec === "site" ? Object.assign({}, D.site, ui.inl.site) : ui.inl[sec];
    if (sec === "textos" || sec === "layout" || sec === "estilos") return S.pub[sec] || {};
    if (sec === "mercado") return S.mercado || D.mercado;
    if (sec === "notas") return S.notas || { texto: "" };
    const v = S.pub[sec];
    if (sec === "site") return Object.assign({}, D.site, v || {});
    return v !== undefined && v !== null ? v : D[sec];
  }
  function index() {
    const esp = {}, grp = {}, loc = {}, slot = {};
    C("especies").forEach(e => { esp[e.id] = e; });
    C("grupos").forEach(g => { grp[g.id] = g; });
    C("locais").forEach(l => { loc[l.id] = l; });
    const slots = C("vagas").map((v, idx) => { const g = grp[v.grupo] || { nome: "", especie: "" }; const e = esp[g.especie] || { nome: "", cor: "#B89B72", id: "" }; return Object.assign({}, v, { g, e, idx, cor: e.cor || "#B89B72" }); });
    slots.forEach(s => { slot[s.id] = s; });
    return { esp, grp, loc, slot, slots, site: C("site") };
  }

  /* ---------------- utilidades ---------------- */
  const H = 3600000;
  const PUB = { livre: ["Disponível", "st-livre"], reservada: ["Reservada", "st-reservada"], analise: ["Em análise", "st-analise"], ocupada: ["Ocupada", "st-ocupada"] };
  const RST = { reservada: ["Aguardando ficha", "st-reservada"], recusada: ["Ajustes pedidos", "st-ajustes"], ficha_enviada: ["Em análise", "st-analise"], aprovada: ["Aprovada", "st-livre"] };
  const SIL = '<svg viewBox="0 0 120 120" aria-hidden="true"><path fill="currentColor" d="M60 12c13.3 0 23 10.6 23 25.5S73.3 66 60 66 37 52.4 37 37.5 46.7 12 60 12zM12 120c2.4-27 21.7-46 48-46s45.6 19 48 46z"/></svg>';
  const ZOOM = '<span class="zoom-badge" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></span>';
  const XSVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  const me = () => B.user;
  const myRes = () => (me() ? S.reservas[me().uid] || null : null);
  const abertas = () => S.config.inscricoesAbertas !== false;
  const initials = (s) => esc(String(s || "?").trim().charAt(0).toUpperCase() || "?");
  const validUrl = (u) => /^https?:\/\/[^\s"'<>]+$/i.test(String(u || "").trim());
  const getPath = (o, p) => p.split(".").reduce((c, k) => (c == null ? undefined : c[k]), o);
  function setPath(o, p, v) { const ks = p.split("."); let c = o; for (let i = 0; i < ks.length - 1; i++) { if (c[ks[i]] == null) c[ks[i]] = {}; c = c[ks[i]]; } c[ks[ks.length - 1]] = v; }
  function fmtDate(ms, withTime) {
    try { return new Intl.DateTimeFormat("pt-BR", withTime ? { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" } : { day: "numeric", month: "long", year: "numeric" }).format(new Date(ms)); }
    catch (e) { return new Date(ms).toLocaleDateString(); }
  }
  function dur(ms) { const m = Math.round(Math.abs(ms) / 60000); if (m < 60) return m + " min"; const h = Math.round(m / 60); return h < 48 ? h + " h" : Math.round(h / 24) + " dias"; }
  function deadline(r) {
    if (!r || !r.criadoEm || (r.status !== "reservada" && r.status !== "recusada")) return null;
    const due = r.criadoEm + (Number(A.X.site.prazoFichaHoras) || 72) * H, left = due - Date.now();
    return left < 0 ? { late: true, txt: "Prazo da ficha vencido há " + dur(left) } : { late: false, txt: "Prazo da ficha: " + fmtDate(due, true) + " (faltam " + dur(left) + ")" };
  }
  function parseLines(lines) {
    const out = {};
    (lines || []).forEach(l => { const m = /^\s*(\d+)\s*x\s+(.+)$/i.exec(l); const n = m ? m[2].trim() : String(l).trim(); if (n) out[n] = (out[n] || 0) + (m ? parseInt(m[1], 10) : 1); });
    return out;
  }
  function toast(msg, bad) { const t = $("#toast"); t.textContent = msg; t.className = "toast" + (bad ? " bad" : ""); t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => { t.hidden = true; }, bad ? 5200 : 3200); }
  async function run(fn, okMsg) { try { await fn(); if (okMsg) toast(okMsg); return true; } catch (e) { if (!e || !e.friendly) console.error(e); toast((e && e.message) || "Algo deu errado. Tente de novo.", true); return false; } }

  /* ---------------- vagas ---------------- */
  function slotState(id) {
    const v = S.vagas[id];
    if (!v) return { st: "livre" };
    const r = S.reservas[v.uid];
    if (!r || r.slotId !== id) return { st: "reservada", uid: v.uid, r: null };
    return { st: ({ reservada: "reservada", recusada: "reservada", ficha_enviada: "analise", aprovada: "ocupada" })[r.status] || "reservada", uid: v.uid, r };
  }
  function counts(list) { const c = { livre: 0, reservada: 0, analise: 0, ocupada: 0, total: list.length }; list.forEach(s => { c[slotState(s.id).st]++; }); return c; }
  function meter(c, compact) {
    const seg = (k) => (c[k] ? `<i class="m-${k}" style="flex:${c[k]}"></i>` : "");
    const parts = [];
    if (c.livre) parts.push(c.livre + (c.livre === 1 ? " livre" : " livres"));
    if (c.reservada) parts.push(c.reservada + (c.reservada === 1 ? " reservada" : " reservadas"));
    if (c.analise) parts.push(c.analise + " em análise");
    if (c.ocupada) parts.push(c.ocupada + (c.ocupada === 1 ? " ocupada" : " ocupadas"));
    const t = parts.join(" · ") || "Sem vagas";
    return `<div class="meter"><div class="meter-bar" role="img" aria-label="${esc(t)}">${seg("livre")}${seg("reservada")}${seg("analise")}${seg("ocupada")}</div>${compact ? "" : `<span class="meter-txt">${esc(t)}</span>`}</div>`;
  }
  const charName = (slot, r) => (r && r.status === "aprovada" && r.ficha && r.ficha.nome) ? r.ficha.nome : (slot.nome || slot.papel);
  const slotPhoto = (slot, r) => (r && r.status === "aprovada" && r.ficha && r.ficha.imagem) ? r.ficha.imagem : (slot.img || "");

  /* ---------------- imagens ---------------- */
  function imgTag(ref, alt, extra) {
    if (!ref) return "";
    const now = B.imgNow(ref), db = ref.indexOf("db:") === 0;
    return `<img${now ? ` src="${esc(now)}"` : ""}${db ? ` data-ref="${esc(ref)}"` : ""} alt="${esc(alt || "")}"${db ? "" : ' loading="lazy"'} data-fb="1"${extra || ""}>`;
  }
  function hydrate(root) {
    (root || document).querySelectorAll("img[data-ref]:not([src])").forEach(im => { B.imgLoad(im.dataset.ref).then(src => { if (src) im.src = src; else im.remove(); }); });
  }
  const zoomAttrs = (ref, cap) => ` data-act="zoom" data-ref="${esc(ref)}" data-cap="${esc(cap || "")}" role="button" tabindex="0" aria-label="Ampliar foto${cap ? ": " + esc(cap) : ""}"`;
  function tile(ref, cap, cls, noZoom) {
    return `<figure class="tile ${ref ? "" : "ph"} ${cls || ""}"${ref && !noZoom ? zoomAttrs(ref, cap) : ""}>${imgTag(ref, cap)}${ref && !noZoom ? ZOOM : ""}</figure>`;
  }
  function slotImg(slot, st, r) {
    const ref = slotPhoto(slot, r), [lbl, cls] = PUB[st];
    return `<div class="slot-img"${ref ? zoomAttrs(ref, charName(slot, r)) : ""}><div class="slot-ph">${SIL}</div>${imgTag(ref, "")}${ref ? ZOOM : ""}<span class="pill ${cls}">${lbl}</span></div>`;
  }
  function compress(file, max, limit) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onerror = () => rej(new Error("Não foi possível ler o arquivo."));
      fr.onload = () => {
        const im = new Image();
        im.onerror = () => rej(new Error("Esse arquivo não parece ser uma imagem."));
        im.onload = () => {
          let scale = Math.min(1, max / Math.max(im.width, im.height)), q = 0.82, out = "";
          for (let i = 0; i < 6; i++) {
            const c = document.createElement("canvas");
            c.width = Math.max(1, Math.round(im.width * scale)); c.height = Math.max(1, Math.round(im.height * scale));
            const g = c.getContext("2d"); g.fillStyle = "#0D0809"; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0, c.width, c.height);
            out = c.toDataURL("image/jpeg", q);
            if (out.length <= limit) return res(out);
            scale *= 0.8; q = Math.max(0.55, q - 0.08);
          }
          rej(new Error("A foto é grande demais. Tente uma imagem menor."));
        };
        im.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }

  /* ---------------- cartão de vaga ---------------- */
  function slotCard(slot) {
    const s = slotState(slot.id), r = s.r, u = me(), mine = u && s.uid === u.uid, [lbl, cls] = PUB[s.st];
    const jog = esc((r && r.jogador) || "outro jogador");
    const meta = s.st === "livre" ? "Vaga aberta" : mine ? "Esta é a sua vaga" : s.st === "reservada" ? "Reservada por " + jog : s.st === "analise" ? "Ficha de " + jog + " em análise" : "Jogador: " + jog;
    const named = charName(slot, r) !== slot.papel;
    let actions;
    if (ui.confirmSlot === slot.id && s.st === "livre") {
      actions = `<div class="confirm-box"><span>Reservar <b>${esc(slot.papel)}</b>? Você terá ${esc(A.X.site.prazoFichaHoras)} horas para enviar a ficha.</span><div class="btn-row"><button class="btn btn-primary btn-sm" data-act="reserve-confirm" data-slot="${slot.id}" type="button">Confirmar reserva</button><button class="btn btn-quiet btn-sm" data-act="reserve-back" type="button">Voltar</button></div></div>`;
    } else if (mine) actions = `<a class="btn btn-ghost btn-sm" href="#painel">Abrir meu painel</a>`;
    else if (s.st === "livre") actions = (abertas() ? `<button class="btn btn-primary btn-sm" data-act="reserve" data-slot="${slot.id}" type="button">Reservar vaga</button>` : `<button class="btn btn-ghost btn-sm" type="button" disabled>Inscrições fechadas</button>`) + `<button class="btn btn-quiet btn-sm" data-act="open" data-slot="${slot.id}" type="button">Detalhes</button>`;
    else actions = `<button class="btn btn-ghost btn-sm" data-act="open" data-slot="${slot.id}" type="button">${s.st === "ocupada" ? "Ver personagem" : "Detalhes"}</button>`;
    const fc = r && r.status === "aprovada" && r.ficha && r.ficha.faceclaim ? ` · FC: ${esc(r.ficha.faceclaim)}` : "";
    return `<article class="slot" style="--fac:${esc(slot.cor)}">${slotImg(slot, s.st, r)}
      <div class="slot-body">
        <p class="slot-role">${esc(slot.e.nome)} · ${esc(slot.g.nome)}</p>
        ${named && !(r && r.status === "aprovada" && r.ficha && r.ficha.nome) ? A.E("vagas." + slot.idx + ".nome", slot.nome, "h3", "slot-name") : named ? `<h3 class="slot-name">${esc(charName(slot, r))}</h3>` : A.E("vagas." + slot.idx + ".papel", slot.papel, "h3", "slot-name")}
        ${named ? `<p class="small" style="margin:0">${A.E("vagas." + slot.idx + ".papel", slot.papel)}${fc}</p>` : ""}
        ${A.E("vagas." + slot.idx + ".desc", slot.desc, "p", "slot-desc")}
        <p class="slot-meta"><span class="pill ${cls}">${lbl}</span><span>${meta}</span></p>
        <div class="slot-actions">${actions}</div>
      </div></article>`;
  }
  const FICHA_PUB = [["idade", "Idade"], ["faceclaim", "Faceclaim"], ["ocupacao", "Ocupação"], ["aparencia", "Aparência"], ["personalidade", "Personalidade"], ["historia", "História"], ["habilidades", "Habilidades e características"], ["ganchos", "Relações e ganchos"]];
  function fichaView(f, withName) {
    const rows = (withName ? [["nome", "Nome"]] : []).concat(FICHA_PUB).filter(([k]) => f && String(f[k] || "").trim()).map(([k, l]) => `<div><dt>${l}</dt><dd>${esc(f[k])}</dd></div>`).join("");
    return rows ? `<dl class="ficha-view">${rows}</dl>` : `<p class="muted" style="margin:0">Ficha ainda não enviada.</p>`;
  }
  function attrView(at) {
    const list = C("atributos");
    return `<div class="attrs">${list.map(a => { const v = Math.max(0, Number((at || {})[a.id]) || 0); return `<div class="attr"><b>${esc(a.nome)}</b><small>${esc(a.desc)}</small><span class="stepper"><span class="pips" role="img" aria-label="${v} pontos">${Array.from({ length: Math.max(5, v) }, (_, i) => `<i class="${i < v ? "on" : ""}"></i>`).join("")}</span></span></div>`; }).join("")}</div>`;
  }
  const editLink = (sec, id, label) => (me() && me().isAdmin ? `<a class="edit-link" href="#editor" data-act="ed-go" data-sec="${sec}" data-id="${esc(id || "")}">✎ ${esc(label || "Editar")}</a>` : "");

  /* ---------------- modal de vaga ---------------- */
  function renderModal() {
    const m = $("#modal"), slot = ui.openSlot && A.X.slot[ui.openSlot];
    if (!slot) { m.hidden = true; m.innerHTML = ""; lockScroll(); return; }
    const st = slotState(slot.id), r = st.r, [lbl, cls] = PUB[st.st], u = me(), mine = u && st.uid === u.uid;
    let info = "";
    if (st.st === "ocupada" && r) info = `<div class="panel" style="padding:16px"><div class="sub-head"><h3 class="h3">Ficha</h3><span class="small">Jogador: ${esc(r.jogador)}</span></div>${fichaView(r.ficha)}</div>`;
    else if (st.st !== "livre") info = `<p class="muted ui" style="margin:0">${st.st === "analise" ? "Ficha em análise" : "Vaga reservada"}${r ? " · jogador: " + esc(r.jogador) : ""}.</p>`;
    let act = "";
    if (mine) act = `<a class="btn btn-primary" href="#painel" data-act="modal-close">Abrir meu painel</a>`;
    else if (st.st === "livre") act = ui.confirmSlot === slot.id
      ? `<div class="confirm-box"><span>Reservar <b>${esc(slot.papel)}</b>? Você terá ${esc(A.X.site.prazoFichaHoras)} horas para enviar a ficha.</span><div class="btn-row"><button class="btn btn-primary btn-sm" type="button" data-act="reserve-confirm" data-slot="${slot.id}">Confirmar reserva</button><button class="btn btn-quiet btn-sm" type="button" data-act="reserve-back">Voltar</button></div></div>`
      : (abertas() ? `<button class="btn btn-primary" type="button" data-act="reserve" data-slot="${slot.id}">Reservar vaga</button>` : `<button class="btn btn-ghost" type="button" disabled>Inscrições fechadas</button>`);
    m.innerHTML = `<div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-t" style="--fac:${esc(slot.cor)}">
      <div class="modal-close"><button class="round-btn" type="button" data-act="modal-close" aria-label="Fechar">${XSVG}</button></div>
      <div class="modal-top">${slotImg(slot, st.st, r)}<div style="display:grid;gap:6px;min-width:0;padding-bottom:4px">
        <span class="slot-role">${esc(slot.e.nome)} · ${esc(slot.g.nome)}</span>
        <h2 id="modal-t" class="slot-name" style="font-size:30px">${esc(charName(slot, r))}</h2>
        <span class="small">${esc(slot.papel)}</span><span><span class="pill ${cls}">${lbl}</span></span></div></div>
      <div class="modal-body"><p style="margin:0;color:var(--bone-2)">${esc(slot.desc)}</p>${info}${act ? `<div class="btn-row">${act}</div>` : ""}</div></div>`;
    m.hidden = false; hydrate(m); lockScroll();
  }
  function lockScroll() { document.documentElement.style.overflow = (ui.openSlot || !$("#drawer").hidden || !$("#lightbox").hidden) ? "hidden" : ""; }

  /* ---------------- foto ampliada ---------------- */
  let lbReturn = null;
  async function openLightbox(ref, cap, from) {
    const src = await B.imgLoad(ref); if (!src) return;
    const lb = $("#lightbox"); lbReturn = from || null;
    lb.innerHTML = `<button class="round-btn lb-close" type="button" data-act="lb-close" aria-label="Fechar foto">${XSVG}</button><figure class="lb-fig"><img src="${esc(src)}" alt="${esc(cap)}">${cap ? `<figcaption>${esc(cap)}</figcaption>` : ""}</figure>`;
    lb.hidden = false; lockScroll(); lb.querySelector(".lb-close").focus();
  }
  function closeLightbox() {
    const lb = $("#lightbox"); if (lb.hidden) return;
    lb.hidden = true; lb.innerHTML = ""; lockScroll();
    if (lbReturn && document.body.contains(lbReturn)) { try { lbReturn.focus({ preventScroll: true }); } catch (e) {} }
    lbReturn = null;
  }

  /* ---------------- moldura ---------------- */
  const NAV = [["inicio", "Início"], ["cidade", "A Cidade"], ["locais", "Locais"], ["especies", "Espécies"], ["personagens", "Personagens"], ["jornal", "Jornal"], ["regras", "Regras"], ["mercado", "Mercado"], ["painel", "Painel"]];
  const navPage = () => (ui.page === "local" ? "locais" : ui.page === "editor" ? "painel" : ui.page);
  function chrome() {
    const u = me(), cur = navPage(), site = A.X.site;
    const links = (cls) => NAV.map(([k, n]) => `<a href="#${k}"${k === cur ? ' aria-current="page"' : ""}${cls || ""}>${n}</a>`).join("");
    $("#nav").innerHTML = links();
    $("#foot-links").innerHTML = links();
    $("#logo").innerHTML = `${site.icone ? imgTag(site.icone, "", ' class="logo-ic"') : ""}<span class="logo-t">${esc(site.nome)}</span>`;
    $("#foot-name").textContent = site.nome;
    $("#foot-meta").textContent = [site.cenario, site.genero, A.X.slots.length + " vagas"].filter(Boolean).join(" · ");
    $("#auth-slot").innerHTML = u ? `<a class="chip-user" href="#painel" aria-label="Seu painel"><span class="avatar">${initials(u.nick || u.email)}</span><span>${esc(u.nick || "Painel")}</span></a>` : `<a class="btn btn-ghost btn-sm" href="#painel">Entrar</a>`;
    $("#demo-bar").hidden = B.mode !== "demo";
    document.title = site.nome;
    if (A.emBar) A.emBar();
    document.body.classList.toggle("em", !!ui.em);
    hydrate($("#logo"));
    if (!$("#drawer").hidden) $("#drawer").innerHTML = `<div class="drawer-panel" role="dialog" aria-modal="true" aria-label="Menu"><button class="btn btn-ghost btn-sm" style="align-self:flex-end;margin-bottom:8px" type="button" data-act="drawer-close">Fechar</button>${links(' data-act="drawer-close"')}</div>`;
  }
  function openDrawer(open) { const d = $("#drawer"); d.hidden = !open; $("#menu-btn").setAttribute("aria-expanded", String(open)); if (open) chrome(); lockScroll(); }

  /* ---------------- navegação e desenho ---------------- */
  function parseRoute() {
    const h = decodeURIComponent((location.hash || "").replace(/^#/, ""));
    if (h.indexOf("local-") === 0) return { page: "local", param: h.slice(6) };
    if (h.indexOf("esp-") === 0) return { page: "especies", param: null, anchor: h };
    if (A.views[h]) return { page: h, param: null };
    return { page: "inicio", param: null };
  }
  function render() {
    A.X = index();
    const y = window.scrollY, fn = A.views[ui.page] || A.views.inicio;
    view.innerHTML = S.loaded ? fn(ui.param) : `<div class="loading">Abrindo os portões de Vallumbría…</div>`;
    hydrate(view); chrome();
    if (ui.openSlot) renderModal();
    window.scrollTo(0, y);
    ui.stale = false;
  }
  function navigate() {
    const r = parseRoute(), changed = r.page !== ui.page || r.param !== ui.param;
    ui.page = r.page; ui.param = r.param; ui.confirmSlot = null; ui.confirm = null;
    render();
    if (r.anchor) requestAnimationFrame(() => { const el = document.getElementById(r.anchor); if (el) el.scrollIntoView({ block: "start" }); });
    else if (changed) { window.scrollTo(0, 0); try { view.focus({ preventScroll: true }); } catch (e) {} }
  }
  const typing = () => { const a = document.activeElement; return !!a && (a.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) && a.type !== "checkbox" && a.type !== "file" && (view.contains(a)); };
  function refresh() { if (!ui.page) return; if (typing()) { ui.stale = true; return; } render(); }

  /* ---------------- reservas ---------------- */
  A.act.reserve = (t) => {
    const id = t.dataset.slot;
    if (!me()) { ui.pendingSlot = id; ui.pnTab = "criar"; ui.openSlot = null; location.hash = "painel"; toast("Entre ou crie uma conta para reservar."); return; }
    if (myRes()) { toast("Você já tem uma vaga reservada. Cancele a atual no Painel para trocar.", true); return; }
    ui.confirmSlot = id; render();
  };
  A.act["reserve-back"] = () => { ui.confirmSlot = null; render(); };
  A.act["reserve-confirm"] = async (t) => {
    const ok = await run(() => B.reserve(t.dataset.slot), "Vaga reservada! Agora preencha sua ficha.");
    ui.confirmSlot = null; ui.pendingSlot = null;
    if (ok) { ui.openSlot = null; ui.tab = "ficha"; if (ui.page === "painel") render(); else location.hash = "painel"; } else render();
  };
  A.act.open = (t) => { ui.openSlot = t.dataset.slot; ui.confirmSlot = null; renderModal(); };
  A.act["modal-close"] = () => { ui.openSlot = null; ui.confirmSlot = null; renderModal(); };
  A.act.zoom = (t) => openLightbox(t.dataset.ref, t.dataset.cap, t);
  A.act["lb-close"] = closeLightbox;
  A.act["drawer-open"] = () => openDrawer($("#drawer").hidden);
  A.act["drawer-close"] = () => openDrawer(false);
  A.act.set = (t) => { ui[t.dataset.k] = t.dataset.v; ui.confirm = null; render(); };
  A.act.toggle = (t) => { const k = t.dataset.k; ui.exp[k] = !ui.exp[k]; ui.confirm = null; render(); };
  A.act.ask = (t) => { ui.confirm = t.dataset.k; render(); };
  A.act.unask = () => { ui.confirm = null; render(); };
  A.act.copy = (t) => {
    const done = () => toast("Link copiado.");
    const fb = () => { const code = t.parentElement && t.parentElement.querySelector("code"); if (code) { const rg = document.createRange(); rg.selectNodeContents(code); const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(rg); } toast("Selecionei o link. Copie com o menu do aparelho."); };
    try { navigator.clipboard.writeText(t.dataset.v || "").then(done, fb); } catch (e) { fb(); }
  };

  /* ---------------- eventos ---------------- */
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-act]");
    if (!t) {
      if (e.target.id === "lightbox" || (e.target.closest(".lb-fig") && e.target.tagName !== "IMG")) closeLightbox();
      else if (e.target.id === "modal") A.act["modal-close"]();
      else if (e.target.id === "drawer") openDrawer(false);
      return;
    }
    const fn = A.act[t.dataset.act];
    if (fn) fn(t, e);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { if (!$("#lightbox").hidden) closeLightbox(); else if (ui.openSlot) A.act["modal-close"](); else if (!$("#drawer").hidden) openDrawer(false); return; }
    const t = e.target;
    if ((e.key === "Enter" || e.key === " ") && t.getAttribute && t.getAttribute("role") === "button" && t.dataset.act) { e.preventDefault(); const fn = A.act[t.dataset.act]; if (fn) fn(t, e); }
  });
  document.addEventListener("error", (e) => {
    const t = e.target;
    if (t && t.tagName === "IMG" && t.dataset && t.dataset.fb) { const w = t.parentElement; if (w && w.dataset.act === "zoom") { w.removeAttribute("data-act"); w.removeAttribute("role"); w.removeAttribute("tabindex"); const z = w.querySelector(".zoom-badge"); if (z) z.remove(); if (w.classList.contains("tile")) w.classList.add("ph"); } t.remove(); }
  }, true);
  function bind(el) {
    const p = el.dataset.d; let v;
    if (el.type === "checkbox") v = el.checked;
    else {
      v = el.value; const t = el.dataset.dt;
      if (t === "num") v = v === "" ? "" : Number(v);
      else if (t === "lines") v = v.split("\n").map(s => s.trim()).filter(Boolean);
      else if (t === "paras") v = v.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
      else if (t === "pairs") { const k = el.dataset.pk || "rotulo"; v = v.split("\n").map(s => s.trim()).filter(Boolean).map(s => { const i = s.indexOf(":"); return i < 0 ? { [k]: s, texto: "" } : { [k]: s.slice(0, i).trim(), texto: s.slice(i + 1).trim() }; }); }
    }
    setPath(ui.d, p, v);
    if (p.indexOf("ed.") === 0 && A.edDirty) A.edDirty();
  }
  document.addEventListener("input", (e) => { if (e.target.dataset && e.target.dataset.d) bind(e.target); });
  document.addEventListener("change", async (e) => {
    const el = e.target;
    if (!el.dataset) return;
    if (el.dataset.d) { bind(el); if (el.dataset.rr) render(); return; }
    if (el.dataset.up && el.files && el.files[0]) {
      const foto = el.dataset.kind === "foto";
      toast("Enviando foto…");
      try {
        const url = await compress(el.files[0], foto ? 900 : 1400, foto ? 800000 : 900000);
        const ref = foto ? await B.saveFoto(url) : await B.admin.saveImage(url);
        if (el.dataset.up.charAt(0) === "@") A.inlSet(el.dataset.up.slice(1), ref); else setPath(ui.d, el.dataset.up, ref);
        if (el.dataset.up.indexOf("ed.") === 0 && A.edDirty) A.edDirty();
        toast("Foto enviada."); render();
      } catch (err) { toast((err && err.message) || "Não foi possível enviar a foto.", true); }
    }
  });
  document.addEventListener("focusout", () => { if (ui.stale) setTimeout(() => { if (ui.stale && !typing()) render(); }, 60); });
  let lastSubmitter = null;
  document.addEventListener("click", (e) => { const b = e.target.closest && e.target.closest("button[type=submit]"); if (b) lastSubmitter = b; }, true);
  document.addEventListener("submit", async (e) => {
    const f = e.target; e.preventDefault();
    const fn = A.sub[f.dataset.form || f.id]; if (!fn) return;
    const btns = f.querySelectorAll("button"), msg = f.querySelector(".form-msg");
    if (msg) msg.hidden = true;
    btns.forEach(b => { b.disabled = true; });
    try { await fn(f, e.submitter || lastSubmitter); }
    catch (err) { if (!err || !err.friendly) console.error(err); const m = (err && err.message) || "Algo deu errado. Tente de novo."; if (msg && document.body.contains(msg)) { msg.textContent = m; msg.hidden = false; } else toast(m, true); }
    finally { btns.forEach(b => { if (document.body.contains(b)) b.disabled = false; }); }
  });

  Object.assign(A, { C, D, B, S, $, esc, clone, me, myRes, abertas, initials, validUrl, getPath, setPath, fmtDate, dur, deadline, parseLines, toast, run, fail: (m) => { const e = new Error(m); e.friendly = true; throw e; },
    slotState, counts, meter, charName, slotPhoto, imgTag, tile, slotImg, slotCard, fichaView, attrView, editLink, render, refresh, PUB, RST, XSVG });

  A.boot = () => {
    window.addEventListener("hashchange", navigate);
    B.on(() => { if (!ui.page) { if (S.loaded) navigate(); } else refresh(); });
    Promise.resolve(B.ready).then(() => { if (!ui.page && S.loaded) navigate(); });
    setTimeout(() => { if (!ui.page) { S.loaded = true; navigate(); } }, 5000);
  };
})();
