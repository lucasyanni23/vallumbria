/* =====================================================================
   EDIÇÃO NA PÁGINA — para os mestres.
   • Toque em qualquer texto para editar ali mesmo.
   • Arraste os blocos pela alça ⠿ para mudar a ordem.
   • Adicione blocos de texto, foto ou foto com texto em qualquer posição,
     numa grade de 12 colunas (largura inteira, 2/3, metade ou 1/3).
   Nada vale até clicar em Salvar na barra de edição.
   ===================================================================== */
(function () {
  "use strict";
  const A = window.VBA, ui = A.ui, B = A.B;
  const { esc } = A;
  const isAdm = () => !!(A.me() && A.me().isAdmin);

  /* ---------------- rascunho das edições ---------------- */
  A.inlSet = (path, value) => {
    const ks = path.split("."), sec = ks.shift();
    if (ui.inl[sec] === undefined) ui.inl[sec] = A.clone(sec === "site" ? Object.assign({}, A.C("site")) : A.C(sec)) || {};
    if (!ks.length) ui.inl[sec] = value; else A.setPath(ui.inl[sec], ks.join("."), value);
    ui.inlN++; bar();
  };
  const inlGet = (path) => { const ks = path.split("."), sec = ks.shift(); const base = A.C(sec); return ks.length ? A.getPath(base, ks.join(".")) : base; };

  /* ---------------- textos editáveis ---------------- */
  // E: um texto que vem do conteúdo (path = "secao.caminho.do.campo")
  // Formatação permitida: negrito, itálico, sublinhado e quebra de linha. O resto vira texto.
  const san = (v) => String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/&lt;(\/?)(b|strong|i|em|u)&gt;/gi, "<$1$2>").replace(/&lt;br\s*\/?&gt;/gi, "<br>").replace(/&amp;(amp|lt|gt);/g, "&$1;");
  const skey = (path) => path.replace(/\./g, "~");
  const align = (path) => { const st = A.C("estilos")[skey(path)]; return st && st.a ? st.a : ""; };
  A.E = (path, val, tag, cls, ph) => {
    tag = tag || "span";
    const v = val == null ? "" : String(val);
    if (!ui.em && !v.replace(/<[^>]*>/g, "").trim()) return "";
    const al = align(path);
    const ed = ui.em ? ` contenteditable="true" spellcheck="true" data-ph="${esc(ph || "Escreva aqui")}"` : "";
    return `<${tag}${cls ? ` class="${cls}"` : ""} data-e="${esc(path)}"${al ? ` style="text-align:${al}"` : ""}${ed}>${san(v)}</${tag}>`;
  };
  // T: um texto fixo da interface que o mestre pode trocar. {n} vira um número calculado.
  const fill = (t, vars) => String(t).replace(/\{(\w+)\}/g, (m, k) => (vars && k in vars ? vars[k] : m));
  A.Tt = (key, def, vars) => { const t = A.C("textos")[key]; return fill(t != null && t !== "" ? t : def, vars); };
  A.T = (key, def, vars, tag, cls) => {
    const t = A.C("textos")[key], raw = t != null && t !== "" ? t : def;
    return A.E("textos." + key, ui.em ? raw : fill(raw, vars), tag, cls, def);
  };
  // P: uma lista de parágrafos editáveis
  A.P = (path, arr, firstCls) => {
    const list = (arr || []).map((p, j) => (ui.em || p ? A.E(path + "." + j, p, "p", j === 0 && firstCls ? firstCls : "", "Escreva o parágrafo") : "")).join("");
    return list + (ui.em ? `<button class="em-add" type="button" data-act="em-para" data-p="${esc(path)}">+ parágrafo</button>` : "");
  };
  // Cabeçalho de página editável
  A.heroT = (key, d, img, extra, vars) => {
    const lead = A.T(key + "-lead", d.lead || "", vars, "p", "lead");
    return `<section class="page-hero${img ? " has-img" : ""}">${img ? A.imgTag(img, "", ' class="bg"') : ""}<div class="wrap">${extra || ""}${A.T(key + "-eyebrow", d.eyebrow, vars, "p", "eyebrow")}${A.T(key + "-title", d.title, vars, "h1", "display")}${lead}</div></section>`;
  };

  function clean(el) {
    const enc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const walk = (n) => {
      let out = "";
      n.childNodes.forEach(c => {
        if (c.nodeType === 3) { out += enc(c.nodeValue); return; }
        if (c.nodeType !== 1) return;
        const t = c.tagName.toLowerCase(), inner = walk(c), fw = (c.style && c.style.fontWeight) || "", fs = (c.style && c.style.fontStyle) || "", td = (c.style && c.style.textDecorationLine) || (c.style && c.style.textDecoration) || "";
        if (t === "br") out += "<br>";
        else if (!inner) return;
        else if (t === "b" || t === "strong" || (t === "span" && (fw === "bold" || +fw >= 600))) out += "<b>" + inner + "</b>";
        else if (t === "i" || t === "em" || (t === "span" && fs === "italic")) out += "<i>" + inner + "</i>";
        else if (t === "u" || (t === "span" && /underline/.test(td))) out += "<u>" + inner + "</u>";
        else if (t === "div" || t === "p") out += (out && !/<br>$/.test(out) ? "<br>" : "") + inner;
        else out += inner;
      });
      return out;
    };
    return walk(el).replace(/\u00a0/g, " ").replace(/(<br>){3,}/g, "<br><br>").replace(/^(\s|<br>)+|(\s|<br>)+$/g, "");
  }
  document.addEventListener("focusout", (e) => {
    const el = e.target;
    if (!el.dataset || !el.dataset.e || !ui.em) return;
    const v = clean(el);
    if (v !== String(inlGet(el.dataset.e) == null ? "" : inlGet(el.dataset.e)).trim()) A.inlSet(el.dataset.e, v);
  }, true);
  document.addEventListener("paste", (e) => {
    const el = e.target.closest && e.target.closest("[data-e][contenteditable]");
    if (!el) return;
    e.preventDefault();
    const t = (e.clipboardData || window.clipboardData).getData("text/plain");
    if (document.execCommand) document.execCommand("insertText", false, t);
  });
  document.addEventListener("keydown", (e) => {
    const el = e.target;
    if (ui.em && el.dataset && el.dataset.e && e.key === "Enter" && !/^(P|DIV)$/.test(el.tagName)) { e.preventDefault(); el.blur(); }
    else if (ui.em && el.dataset && el.dataset.e && e.key === "Enter") { e.preventDefault(); document.execCommand("insertLineBreak"); }
  });
  // No modo de edição, os links da página não navegam (para dar para tocar e editar)
  document.addEventListener("click", (e) => {
    if (!ui.em) return;
    const a = e.target.closest("#view a[href]");
    if (a && !a.dataset.act) { e.preventDefault(); if (!e.target.closest("[data-e]")) A.toast("No modo de edição os links ficam pausados. Saia da edição para navegar."); }
    const z = e.target.closest("#view [data-act=zoom]");
    if (z) { e.stopPropagation(); e.preventDefault(); }
  }, true);

  /* ---------------- barra de formatação ---------------- */
  const ICON = (d) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="${d}"/></svg>`;
  const FMT = [["bold", "<b>N</b>", "Negrito"], ["italic", "<i>I</i>", "Itálico"], ["underline", "<u>S</u>", "Sublinhado"], ["|"],
    ["a:left", ICON("M4 6h16M4 10h10M4 14h16M4 18h10"), "Alinhar à esquerda"], ["a:center", ICON("M4 6h16M7 10h10M4 14h16M7 18h10"), "Centralizar"],
    ["a:right", ICON("M4 6h16M10 10h10M4 14h16M10 18h10"), "Alinhar à direita"], ["a:justify", ICON("M4 6h16M4 10h16M4 14h16M4 18h16"), "Justificar"], ["|"],
    ["clear", "Limpar", "Limpar formatação"]];
  let fmtEl = null;
  function fmtBar() {
    let b = document.getElementById("fmt-bar");
    if (!b) { b = document.createElement("div"); b.id = "fmt-bar"; b.className = "fmt-bar"; b.setAttribute("role", "toolbar"); b.setAttribute("aria-label", "Formatação do texto"); document.body.appendChild(b); }
    return b;
  }
  function showFmt(el) {
    fmtEl = el;
    const b = fmtBar(), al = align(el.dataset.e) || "";
    b.innerHTML = FMT.map(f => f[0] === "|" ? `<span class="fmt-sep"></span>` : `<button type="button" class="fmt-btn${f[0] === "a:" + al ? " on" : ""}" data-fmt="${f[0]}" aria-label="${f[2]}" title="${f[2]}">${f[1]}</button>`).join("");
    b.hidden = false;
  }
  function hideFmt() { const b = document.getElementById("fmt-bar"); if (b) b.hidden = true; fmtEl = null; }
  A.hideFmt = hideFmt;
  document.addEventListener("focusin", (e) => { const el = e.target; if (ui.em && el.dataset && el.dataset.e && el.isContentEditable) showFmt(el); });
  document.addEventListener("focusout", () => { setTimeout(() => { const a = document.activeElement; if (!a || !a.dataset || !a.dataset.e) hideFmt(); }, 150); });
  document.addEventListener("pointerdown", (e) => {
    const btn = e.target.closest && e.target.closest("[data-fmt]");
    if (!btn) return;
    e.preventDefault();
    const el = fmtEl; if (!el) return;
    const f = btn.dataset.fmt;
    if (f.indexOf("a:") === 0) {
      const a = f.slice(2), cur = align(el.dataset.e), nv = cur === a ? "" : a;
      el.style.textAlign = nv;
      A.inlSet("estilos." + skey(el.dataset.e), nv ? { a: nv } : {});
      showFmt(el);
      return;
    }
    if (f === "clear") { const t = el.innerText; el.textContent = t; }
    else document.execCommand(f);
  });
  document.addEventListener("click", (e) => { if (e.target.closest && e.target.closest("[data-fmt]")) e.preventDefault(); });

  /* ---------------- blocos e grade ---------------- */
  const layoutOf = (pid, ids) => {
    const saved = A.C("layout")[pid];
    if (!Array.isArray(saved)) return ids.map(id => ({ id }));
    const out = saved.filter(e => e.tipo || ids.indexOf(e.id) >= 0).map(e => Object.assign({}, e));
    ids.forEach((id, k) => {
      if (out.some(e => e.id === id)) return;
      const prev = ids.slice(0, k).reverse().find(p => out.some(e => e.id === p));
      const at = prev ? out.findIndex(e => e.id === prev) + 1 : 0;
      out.splice(at, 0, { id });
    });
    return out;
  };
  const lastIds = {};
  function mat(pid) {
    const cur = A.C("layout")[pid];
    const order = layoutOf(pid, lastIds[pid] || []);
    if (!Array.isArray(cur) || JSON.stringify(cur) !== JSON.stringify(order)) A.inlSet("layout." + pid, order);
    return A.C("layout")[pid];
  }
  const WL = { 12: "Inteira", 8: "2/3", 6: "Metade", 4: "1/3" };
  function tools(pid, i, e, n) {
    const custom = !!e.tipo;
    return `<div class="blk-tools" role="toolbar" aria-label="Bloco">
      <button class="bt blk-handle" type="button" data-pid="${esc(pid)}" data-i="${i}" aria-label="Arrastar bloco" title="Arrastar">⠿</button>
      <button class="bt" type="button" data-act="blk-mv" data-pid="${esc(pid)}" data-i="${i}" data-n="-1" aria-label="Subir"${i === 0 ? " disabled" : ""}>↑</button>
      <button class="bt" type="button" data-act="blk-mv" data-pid="${esc(pid)}" data-i="${i}" data-n="1" aria-label="Descer"${i === n - 1 ? " disabled" : ""}>↓</button>
      ${custom ? `<span class="bt-group">${Object.keys(WL).sort((a, b) => b - a).map(w => `<button class="bt${Number(e.w || 12) === Number(w) ? " on" : ""}" type="button" data-act="blk-w" data-pid="${esc(pid)}" data-i="${i}" data-w="${w}" aria-label="Largura ${WL[w]}">${WL[w]}</button>`).join("")}</span>
        <button class="bt" type="button" data-act="blk-add" data-pid="${esc(pid)}" data-at="${i + 1}" data-t="texto" aria-label="Adicionar bloco depois">+</button>
        <button class="bt bad" type="button" data-act="blk-del" data-pid="${esc(pid)}" data-i="${i}" aria-label="Apagar bloco">✕</button>`
      : `<button class="bt" type="button" data-act="blk-hide" data-pid="${esc(pid)}" data-i="${i}">Ocultar</button>`}
    </div>`;
  }
  const insRow = (pid, at) => `<div class="wrap ins-row"><span>Adicionar aqui:</span><button class="btn btn-ghost btn-xs" type="button" data-act="blk-add" data-pid="${esc(pid)}" data-at="${at}" data-t="texto">+ Texto</button><button class="btn btn-ghost btn-xs" type="button" data-act="blk-add" data-pid="${esc(pid)}" data-at="${at}" data-t="foto">+ Foto</button><button class="btn btn-ghost btn-xs" type="button" data-act="blk-add" data-pid="${esc(pid)}" data-at="${at}" data-t="fototexto">+ Foto e texto</button></div>`;

  function custom(pid, e, i, n) {
    const base = "layout." + pid + "." + i, em = ui.em;
    const pic = e.img ? A.tile(e.img, e.legenda || e.titulo || "", "cb-pic") : (em ? `<figure class="tile ph cb-pic"></figure>` : "");
    const up = em && e.tipo !== "texto" ? `<div class="cb-up"><label class="btn btn-ghost btn-xs" for="up-${esc(pid)}-${i}">${e.img ? "Trocar foto" : "Enviar foto"}</label><input class="sr" type="file" accept="image/*" id="up-${esc(pid)}-${i}" data-up="@${base}.img">${e.img ? `<button class="btn btn-quiet btn-xs" type="button" data-act="blk-noimg" data-pid="${esc(pid)}" data-i="${i}">Remover foto</button>` : ""}</div>` : "";
    const txt = A.E(base + ".titulo", e.titulo, "h2", "cb-title", "Título (opcional)") + A.E(base + ".texto", e.texto, "p", "cb-text", "Texto (opcional)");
    let inner;
    if (e.tipo === "foto") inner = `${pic}${up}${A.E(base + ".legenda", e.legenda, "p", "cb-cap", "Legenda (opcional)")}`;
    else if (e.tipo === "fototexto") inner = `<div class="cb-ft${e.lado === "dir" ? " rev" : ""}"><div>${pic}${up}</div><div class="cb-body">${txt}${em ? `<button class="em-add" type="button" data-act="blk-side" data-pid="${esc(pid)}" data-i="${i}">Trocar lado da foto</button>` : ""}</div></div>`;
    else inner = `<div class="cb-body">${txt}</div>`;
    return `<div class="blk cb w-${Number(e.w) || 12}" data-blk="${i}" data-pid="${esc(pid)}">${em ? tools(pid, i, e, n) : ""}${inner}</div>`;
  }

  // Monta uma página a partir de blocos { id, html }
  A.page = (pid, blocks) => {
    const ids = blocks.map(b => b.id), by = {};
    blocks.forEach(b => { by[b.id] = b.html; });
    lastIds[pid] = ids;
    const order = layoutOf(pid, ids), n = order.length, em = ui.em;
    let out = "", grp = [];
    const flush = () => { if (grp.length) { out += `<div class="wrap cgrid">${grp.join("")}</div>`; grp = []; } };
    order.forEach((e, i) => {
      if (e.tipo) {
        if (em && !grp.length) out += insRow(pid, i);
        grp.push(custom(pid, e, i, n));
        return;
      }
      flush();
      if (em) out += insRow(pid, i);
      if (!by[e.id]) return;
      if (e.oculto) { if (em) out += `<div class="wrap"><div class="blk-hidden"><span>Bloco oculto para os visitantes</span><button class="btn btn-ghost btn-xs" type="button" data-act="blk-hide" data-pid="${esc(pid)}" data-i="${i}">Mostrar</button></div></div>`; return; }
      out += em ? `<div class="blk" data-blk="${i}" data-pid="${esc(pid)}">${tools(pid, i, e, n)}${by[e.id]}</div>` : by[e.id];
    });
    flush();
    if (em) out += insRow(pid, n);
    return out;
  };

  /* ---------------- ações dos blocos ---------------- */
  const act = A.act;
  act["blk-mv"] = (t) => { const L = mat(t.dataset.pid), i = +t.dataset.i, j = i + Number(t.dataset.n); if (j < 0 || j >= L.length) return; [L[i], L[j]] = [L[j], L[i]]; A.inlSet("layout." + t.dataset.pid, L); A.render(); };
  act["blk-hide"] = (t) => { const L = mat(t.dataset.pid), e = L[+t.dataset.i]; e.oculto = !e.oculto; if (!e.oculto) delete e.oculto; A.inlSet("layout." + t.dataset.pid, L); A.render(); };
  act["blk-del"] = (t) => { const L = mat(t.dataset.pid); L.splice(+t.dataset.i, 1); A.inlSet("layout." + t.dataset.pid, L); A.toast("Bloco removido. Use Descartar se quiser desfazer."); A.render(); };
  act["blk-w"] = (t) => { const L = mat(t.dataset.pid); L[+t.dataset.i].w = Number(t.dataset.w); A.inlSet("layout." + t.dataset.pid, L); A.render(); };
  act["blk-side"] = (t) => { const L = mat(t.dataset.pid), e = L[+t.dataset.i]; e.lado = e.lado === "dir" ? "esq" : "dir"; A.inlSet("layout." + t.dataset.pid, L); A.render(); };
  act["blk-noimg"] = (t) => { const L = mat(t.dataset.pid); L[+t.dataset.i].img = ""; A.inlSet("layout." + t.dataset.pid, L); A.render(); };
  act["blk-add"] = (t) => {
    const L = mat(t.dataset.pid), at = Math.min(+t.dataset.at, L.length);
    L.splice(at, 0, { id: "c-" + Math.random().toString(36).slice(2, 9), tipo: t.dataset.t, w: t.dataset.t === "fototexto" ? 12 : t.dataset.t === "foto" ? 6 : 12, titulo: "", texto: "", legenda: "", img: "" });
    A.inlSet("layout." + t.dataset.pid, L); A.render();
    setTimeout(() => { const b = document.querySelector(`.blk[data-pid="${t.dataset.pid}"][data-blk="${at}"]`); if (b) { b.scrollIntoView({ block: "center" }); const f = b.querySelector("[data-e]"); if (f) f.focus(); } }, 40);
  };
  act["em-para"] = (t) => { const p = t.dataset.p, arr = (inlGet(p) || []).slice(); arr.push(""); A.inlSet(p, arr); A.render(); setTimeout(() => { const el = document.querySelector(`[data-e="${p}.${arr.length - 1}"]`); if (el) el.focus(); }, 30); };

  /* ---------------- arrastar ---------------- */
  let drag = null;
  document.addEventListener("pointerdown", (e) => {
    const h = e.target.closest(".blk-handle");
    if (!h || !ui.em) return;
    e.preventDefault();
    const blk = h.closest(".blk");
    drag = { pid: h.dataset.pid, from: +h.dataset.i, el: blk, target: null, pos: null };
    blk.classList.add("dragging");
    try { h.setPointerCapture(e.pointerId); } catch (err) {}
  });
  document.addEventListener("pointermove", (e) => {
    if (!drag) return;
    e.preventDefault();
    if (e.clientY < 70) window.scrollBy(0, -14); else if (e.clientY > window.innerHeight - 90) window.scrollBy(0, 14);
    document.querySelectorAll(".blk[data-drop]").forEach(b => b.removeAttribute("data-drop"));
    const el = document.elementFromPoint(e.clientX, e.clientY), b = el && el.closest(`.blk[data-pid="${drag.pid}"]`);
    if (!b || b === drag.el) { drag.target = null; return; }
    const r = b.getBoundingClientRect(), side = b.classList.contains("cb") && r.width < b.parentElement.getBoundingClientRect().width * 0.75;
    const after = side ? e.clientX > r.left + r.width / 2 : e.clientY > r.top + r.height / 2;
    b.setAttribute("data-drop", side ? (after ? "right" : "left") : (after ? "after" : "before"));
    drag.target = +b.dataset.blk; drag.pos = after ? 1 : 0;
  }, { passive: false });
  const endDrag = () => {
    if (!drag) return;
    const d = drag; drag = null;
    document.querySelectorAll(".blk[data-drop]").forEach(b => b.removeAttribute("data-drop"));
    if (d.el) d.el.classList.remove("dragging");
    if (d.target == null) return;
    const L = mat(d.pid), [it] = L.splice(d.from, 1);
    let to = d.target + d.pos; if (d.from < to) to--;
    L.splice(Math.max(0, Math.min(L.length, to)), 0, it);
    A.inlSet("layout." + d.pid, L); A.render();
  };
  document.addEventListener("pointerup", endDrag);
  document.addEventListener("pointercancel", endDrag);

  /* ---------------- barra de edição ---------------- */
  const changes = () => Object.keys(ui.inl).length;
  function bar() {
    const el = document.getElementById("em-bar");
    if (!el) return;
    if (!isAdm()) { el.hidden = true; if (ui.em) { ui.em = false; } return; }
    const editable = ["inicio", "cidade", "locais", "local", "especies", "personagens", "jornal", "regras", "mercado"].indexOf(ui.page) >= 0;
    const n = changes();
    el.hidden = !(editable || n || ui.em);
    el.className = "em-bar" + (ui.em ? " on" : "") + (n ? " dirty" : "");
    el.innerHTML = ui.em || n
      ? `<span class="state">${ui.em ? "Editando a página" : "Edição pausada"}${n ? " · alterações não salvas" : ""}</span><span class="btn-row">${n ? `<button class="btn btn-quiet btn-sm" type="button" data-act="em-undo">Descartar</button><button class="btn btn-primary btn-sm" type="button" data-act="em-save">Salvar</button>` : ""}<button class="btn btn-ghost btn-sm" type="button" data-act="em-toggle">${ui.em ? "Sair da edição" : "Editar"}</button></span>`
      : `<button class="btn btn-primary btn-sm" type="button" data-act="em-toggle">✎ Editar esta página</button>`;
  }
  A.emBar = bar;
  act["em-toggle"] = () => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); ui.em = !ui.em; document.body.classList.toggle("em", ui.em); A.render(); if (ui.em) A.toast("Toque em um texto para editar. Arraste os blocos pela alça ⠿."); };
  act["em-undo"] = () => { ui.inl = {}; A.render(); A.toast("Alterações descartadas."); };
  act["em-save"] = async () => {
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    const secs = Object.keys(ui.inl);
    for (const sec of secs) {
      let v = ui.inl[sec];
      if (Array.isArray(v)) v = v.map(x => (x && typeof x === "object" ? Object.assign({}, x, ...["paragrafos", "texto", "descricao", "historia", "funcionamento", "trama"].filter(k => Array.isArray(x[k])).map(k => ({ [k]: x[k].filter(Boolean) }))) : x));
      else if (v && typeof v === "object" && Array.isArray(v.paragrafos)) v = Object.assign({}, v, { paragrafos: v.paragrafos.filter(Boolean) });
      if (JSON.stringify(v).length > 900000) { A.toast("A seção " + sec + " ficou grande demais para salvar.", true); return; }
      const ok = await A.run(() => B.admin.saveContent(sec, v));
      if (!ok) return;
      delete ui.inl[sec];
    }
    A.toast("Alterações salvas. Já estão no ar para todos.");
    A.render();
  };
  window.addEventListener("beforeunload", (e) => { if (changes()) { e.preventDefault(); e.returnValue = ""; } });
})();
