/* =====================================================================
   PAINEL — conta do jogador, ficha, atributos, carteira e inventário;
   e, para o mestre, fichas, jogadores, pedidos e configurações.
   ===================================================================== */
(function () {
  "use strict";
  const A = window.VBA, V = A.views, ui = A.ui, B = A.B, S = A.S;
  const { esc } = A;
  const MAXA = 5;
  const lvl = (xp) => Math.floor((Number(xp) || 0) / 100) + 1;

  V.painel = () => {
    const u = A.me();
    const hero = A.pageHero("Área do jogador", u ? "Painel" : "Entrar", u ? "Sua vaga, sua ficha, sua carteira e os links do grupo." : "Entre ou crie sua conta para reservar um personagem.");
    return `${hero}<section class="sec" style="padding-top:26px"><div class="wrap dash">${u ? account(u) + (u.isAdmin ? master() : player(u)) : authBox()}</div></section>`;
  };

  /* ---------------- acesso ---------------- */
  function authBox() {
    const t = ui.pnTab;
    const seg = [["entrar", "Entrar"], ["criar", "Criar conta"], ["senha", "Esqueci a senha"]].map(([k, n]) => `<button type="button" data-act="set" data-k="pnTab" data-v="${k}" aria-pressed="${t === k}">${n}</button>`).join("");
    let f;
    if (t === "entrar") f = `<form data-form="login" class="form" novalidate><div class="field"><label for="li-e">E-mail</label><input class="input" id="li-e" name="e" type="email" autocomplete="email" required></div><div class="field"><label for="li-p">Senha</label><input class="input" id="li-p" name="p" type="password" autocomplete="current-password" required></div><p class="err form-msg" hidden></p><div class="btn-row"><button class="btn btn-primary" type="submit">Entrar</button></div></form>`;
    else if (t === "criar") f = `<form data-form="signup" class="form" novalidate><div class="field"><label for="su-n">Nome de jogador <span class="hint">como você aparece no diretório</span></label><input class="input" id="su-n" name="n" maxlength="40" required></div><div class="field"><label for="su-c">Contato <span class="hint">WhatsApp ou @, visível só para o mestre</span></label><input class="input" id="su-c" name="c" maxlength="80"></div><div class="field"><label for="su-e">E-mail</label><input class="input" id="su-e" name="e" type="email" autocomplete="email" required></div><div class="field"><label for="su-p">Senha <span class="hint">mínimo de 6 caracteres</span></label><input class="input" id="su-p" name="p" type="password" autocomplete="new-password" required></div><p class="err form-msg" hidden></p><div class="btn-row"><button class="btn btn-primary" type="submit">Criar conta</button></div></form>`;
    else f = `<form data-form="reset" class="form" novalidate><p class="muted" style="margin:0">Enviamos um link para você criar uma nova senha.</p><div class="field"><label for="rp-e">E-mail da conta</label><input class="input" id="rp-e" name="e" type="email" required></div><p class="err form-msg" hidden></p><div class="btn-row"><button class="btn btn-primary" type="submit">Enviar link</button></div></form>`;
    const ps = ui.pendingSlot && A.X.slot[ui.pendingSlot];
    return `<div class="grid" style="gap:18px;max-width:560px">${B.loadError ? `<div class="callout"><b>Sem conexão</b>${esc(B.loadError)}</div>` : ""}
      ${ps ? `<div class="callout c-info"><b>Vaga escolhida</b>Depois de entrar, você confirma a reserva de ${esc(ps.papel)}.</div>` : ""}
      <div class="panel"><div class="seg" role="group" aria-label="Acesso">${seg}</div><div style="margin-top:18px">${f}</div></div>
      ${B.mode === "demo" ? `<div class="panel" style="display:grid;gap:12px"><p class="eyebrow">Teste rápido</p><p class="muted" style="margin:0">Veja o site como jogador ou como mestre com as contas de teste.</p><div class="btn-row"><button class="btn btn-ghost btn-sm" type="button" data-act="demo" data-v="jogador">Entrar como jogador</button><button class="btn btn-ghost btn-sm" type="button" data-act="demo" data-v="mestre">Entrar como mestre</button></div><p class="small" style="margin:0">jogador@demo.vb ou mestre@demo.vb · senha demo123</p></div>` : ""}</div>`;
  }
  A.act.demo = (t) => A.run(() => B.demoLogin(t.dataset.v));
  A.sub.login = async (f) => { await B.signIn(f.e.value, f.p.value); A.toast("Bem-vindo de volta a Vallumbría."); };
  A.sub.signup = async (f) => { await B.signUp(f.e.value, f.p.value, f.n.value, f.c.value); A.toast("Conta criada!"); };
  A.sub.reset = async (f) => { await B.resetPassword(f.e.value); A.toast("Se existir uma conta com esse e-mail, o link já está a caminho."); };

  function account(u) {
    const vf = B.mode === "firebase" && !u.emailVerified ? `<div class="callout"><b>Confirme seu e-mail</b>Enviamos um link de confirmação para ${esc(u.email)}. Se você for o mestre, o painel do mestre aparece depois da confirmação.<div class="btn-row" style="margin-top:10px"><button class="btn btn-ghost btn-sm" type="button" data-act="v-check">Já confirmei</button><button class="btn btn-quiet btn-sm" type="button" data-act="v-send">Reenviar e-mail</button></div></div>` : "";
    const pf = ui.editProfile ? `<form data-form="perfil" class="form panel" novalidate><div class="row2"><div class="field"><label for="pf-n">Nome de jogador</label><input class="input" id="pf-n" name="n" maxlength="40" value="${esc(u.nick)}"></div><div class="field"><label for="pf-c">Contato <span class="hint">visível só para o mestre</span></label><input class="input" id="pf-c" name="c" maxlength="80" value="${esc(u.contato)}"></div></div><p class="err form-msg" hidden></p><div class="btn-row"><button class="btn btn-primary btn-sm" type="submit">Salvar perfil</button></div></form>` : "";
    return `<div class="dash-hello"><span class="avatar">${A.initials(u.nick || u.email)}</span><div style="min-width:0;flex:1"><h2>Olá, ${esc(u.nick || "jogador")}</h2><span class="small">${esc(u.email)}${u.isAdmin ? " · mestre" : ""}</span></div>
      <div class="btn-row">${u.isAdmin ? `<a class="btn btn-primary btn-sm" href="#editor">Editor do site</a>` : ""}<button class="btn btn-ghost btn-sm" type="button" data-act="pf-toggle">${ui.editProfile ? "Fechar" : "Editar perfil"}</button><button class="btn btn-quiet btn-sm" type="button" data-act="logout">Sair</button></div></div>${vf}${pf}`;
  }
  A.act["pf-toggle"] = () => { ui.editProfile = !ui.editProfile; A.render(); };
  A.act.logout = () => { ui.editProfile = false; ui.d = {}; ui.dk = {}; A.run(() => B.signOut(), "Você saiu da conta."); };
  A.act["v-send"] = () => A.run(() => B.sendVerification(), "E-mail de confirmação enviado. Confira também o spam.");
  A.act["v-check"] = () => A.run(() => B.checkVerification(), "E-mail confirmado.");
  A.sub.perfil = async (f) => { await B.updateProfile({ nick: f.n.value, contato: f.c.value }); ui.editProfile = false; A.toast("Perfil salvo."); A.render(); };

  /* ---------------- jogador ---------------- */
  function player(u) {
    const r = A.myRes();
    if (!r || !A.X.slot[r.slotId]) return noSlot();
    const s = A.X.slot[r.slotId], [lbl, cls] = A.RST[r.status] || A.RST.reservada, dl = A.deadline(r);
    const head = `<div class="panel" style="--fac:${esc(s.cor)}"><div class="mine-head">${A.slotImg(s, A.slotState(s.id).st, r)}<div style="display:grid;gap:6px;min-width:0"><span class="slot-role">${esc(s.e.nome)} · ${esc(s.g.nome)}</span><h3 class="slot-name" style="font-size:28px">${esc(A.charName(s, r))}</h3><span class="small">${esc(s.papel)}</span><div class="btn-row" style="gap:8px"><span class="pill ${cls}">${lbl}</span>${dl ? `<span class="deadline${dl.late ? " late" : ""}">${esc(dl.txt)}</span>` : ""}</div></div></div></div>`;
    const ap = r.status === "aprovada";
    const tabs = ap ? [["ficha", "Ficha"], ["carteira", "Inventário e progressão"], ["grupo", "Grupo"]] : [["ficha", "Ficha"]];
    if (!tabs.some(t => t[0] === ui.tab)) ui.tab = "ficha";
    const seg = tabs.length > 1 ? `<div class="seg" role="group" aria-label="Seções">${tabs.map(([k, n]) => `<button type="button" data-act="set" data-k="tab" data-v="${k}" aria-pressed="${ui.tab === k}">${n}</button>`).join("")}</div>` : "";
    let body;
    if (ui.tab === "carteira") body = wallet(u, s);
    else if (ui.tab === "grupo") body = groupLinks();
    else if (ap) body = `<div class="callout c-ok"><b>Ficha aprovada</b>Bem-vindo a Vallumbría. Para alterar a ficha, fale com o mestre.</div><div class="panel"><div class="sub-head"><h3 class="h3">Atributos</h3><span class="small">Nível ${lvl((S.carteiras[u.uid] || {}).xp)}</span></div>${A.attrView(r.atributos)}</div><div class="panel"><div class="sub-head"><h3 class="h3">Ficha</h3></div>${A.fichaView(r.ficha, true)}</div>`;
    else body = (r.notaMestre ? `<div class="callout"><b>Recado do mestre</b>${esc(r.notaMestre)}</div>` : "") + (r.status === "ficha_enviada" ? `<div class="callout c-info"><b>Ficha enviada</b>O mestre vai avaliar em breve. Você ainda pode editar e reenviar.</div>` : "") + fichaForm(u, s, r);
    const cancel = ui.confirm === "cancel"
      ? `<div class="confirm-box"><span>Cancelar a reserva de <b>${esc(A.charName(s, r))}</b>? A vaga volta a ficar disponível.</span><div class="btn-row"><button class="btn btn-danger btn-sm" type="button" data-act="cancel-yes">Sim, cancelar reserva</button><button class="btn btn-quiet btn-sm" type="button" data-act="unask">Manter</button></div></div>`
      : (ap ? "" : `<div><button class="btn btn-quiet btn-sm" type="button" data-act="ask" data-k="cancel" style="color:var(--danger)">Cancelar reserva</button></div>`);
    return head + seg + body + cancel;
  }
  function noSlot() {
    let ps = ui.pendingSlot && A.X.slot[ui.pendingSlot];
    if (ps && A.slotState(ps.id).st === "livre") return `<div class="panel" style="display:grid;gap:14px;--fac:${esc(ps.cor)}"><p class="eyebrow">Confirmar reserva</p><div class="mine-head">${A.slotImg(ps, "livre", null)}<div style="display:grid;gap:4px;min-width:0"><span class="slot-role">${esc(ps.e.nome)} · ${esc(ps.g.nome)}</span><h3 class="slot-name">${esc(ps.papel)}</h3></div></div><p class="muted" style="margin:0">Depois de confirmar, você tem ${esc(A.X.site.prazoFichaHoras)} horas para enviar a ficha.</p><div class="btn-row"><button class="btn btn-primary" type="button" data-act="reserve-confirm" data-slot="${ps.id}"${A.abertas() ? "" : " disabled"}>Confirmar reserva</button><button class="btn btn-quiet" type="button" data-act="pend-clear">Escolher outra</button></div></div>`;
    return `<div class="empty"><b style="font-size:19px">Você ainda não tem uma vaga.</b><span>${ps ? "A vaga que você escolheu acabou de ser reservada por outra pessoa. " : ""}Escolha um personagem no diretório. Depois de reservar, você tem ${esc(A.X.site.prazoFichaHoras)} horas para enviar a ficha.</span>${A.abertas() ? "" : `<span class="err">As inscrições estão fechadas no momento.</span>`}<a class="btn btn-primary btn-sm" href="#personagens">Ver vagas disponíveis</a></div>`;
  }
  A.act["pend-clear"] = () => { ui.pendingSlot = null; location.hash = "personagens"; };
  A.act["cancel-yes"] = () => { ui.confirm = null; A.run(() => B.cancel(), "Reserva cancelada. A vaga está livre de novo."); };

  function fichaForm(u, s, r) {
    const key = r.slotId + "|" + (r.atualizadoEm || r.criadoEm) + "|" + r.status;
    if (ui.dk.f !== key) {
      const atr = {}; A.C("atributos").forEach(a => { atr[a.id] = Number((r.atributos || {})[a.id]) || 0; });
      ui.d.f = { ficha: Object.assign({ ocupacao: s.papel }, r.ficha || {}), atributos: atr, segredo: S.segredos[u.uid] || "" };
      ui.dk.f = key;
    }
    const d = ui.d.f, f = d.ficha, site = A.X.site, total = Number(site.pontosIniciais) || 0;
    const used = Object.values(d.atributos).reduce((a, b) => a + (Number(b) || 0), 0), left = total - used;
    const inp = (k, label, extra, hint) => `<div class="field"><label for="fc-${k}">${label}${hint ? ` <span class="hint">${hint}</span>` : ""}</label><input class="input" id="fc-${k}" data-d="f.ficha.${k}" value="${esc(f[k] || "")}" ${extra || ""}></div>`;
    const ta = (k, label, hint, h) => `<div class="field"><label for="fc-${k}">${label}${hint ? ` <span class="hint">${hint}</span>` : ""}</label><textarea class="textarea" id="fc-${k}" data-d="f.ficha.${k}" maxlength="6000"${h ? ` style="min-height:${h}px"` : ""}>${esc(f[k] || "")}</textarea></div>`;
    const attrs = A.C("atributos").map(a => { const v = d.atributos[a.id] || 0; return `<div class="attr"><b>${esc(a.nome)}</b><small>${esc(a.desc)}</small><span class="stepper"><button type="button" data-act="attr" data-a="${esc(a.id)}" data-n="-1" aria-label="Tirar ponto de ${esc(a.nome)}"${v <= 0 ? " disabled" : ""}>−</button><output aria-live="polite">${v}</output><button type="button" data-act="attr" data-a="${esc(a.id)}" data-n="1" aria-label="Pôr ponto em ${esc(a.nome)}"${v >= MAXA || left <= 0 ? " disabled" : ""}>+</button></span></div>`; }).join("");
    const kit = (s.e.kit || []);
    return `<form data-form="ficha" class="form panel" novalidate>
      <div class="sub-head"><h3 class="h3">Ficha do personagem</h3><span class="hint">Campos com * são obrigatórios para enviar</span></div>
      <div class="row2">${inp("nome", "Nome do personagem *", 'maxlength="80"')}${inp("idade", "Idade *", 'type="number" min="18" max="2000" inputmode="numeric"', "18 ou mais")}</div>
      <div class="row2">${inp("ocupacao", "Ocupação", 'maxlength="120"')}${inp("faceclaim", "Faceclaim *", 'maxlength="80" placeholder="Nome do ator ou atriz"')}</div>
      <div class="field"><span class="lbl">Foto do personagem <span class="hint">aparece no diretório depois da aprovação</span></span><div class="imgf">${A.tile(f.imagem, "", "", true)}<div class="imgf-ctl"><input class="input" type="file" accept="image/*" id="fc-foto" data-up="f.ficha.imagem" data-kind="foto" aria-label="Enviar foto do personagem"><input class="input" id="fc-imagem" data-d="f.ficha.imagem" value="${esc(String(f.imagem || "").indexOf("db:") === 0 ? "" : f.imagem || "")}" placeholder="ou cole um link https://" aria-label="Link da foto"></div></div></div>
      ${ta("aparencia", "Aparência")}${ta("personalidade", "Personalidade")}${ta("historia", "Resumo da história *", "", 200)}${ta("habilidades", "Habilidades e características", "dons, talentos, fraquezas")}${ta("ganchos", "Relações e ganchos", "aliados, rivais, dívidas")}
      <div class="field"><label for="fc-seg">Segredo <span class="hint">só o mestre vê</span></label><textarea class="textarea" id="fc-seg" data-d="f.segredo" maxlength="5000">${esc(d.segredo || "")}</textarea></div>
      <div class="sub-head"><h3 class="h3">Atributos</h3><span class="ui" style="font-weight:700;color:${left === 0 ? "var(--ok)" : "var(--warn)"}">${left} de ${total} pontos para distribuir</span></div>
      <div class="attrs">${attrs}</div>
      ${kit.length ? `<div class="callout c-info"><b>Kit inicial · ${esc(s.e.nome)}</b>${esc(kit.join(", "))}, mais ${esc(site.saldoInicial)} ${esc(site.moeda)}. Você recebe depois da aprovação.</div>` : ""}
      <p class="err form-msg" hidden></p>
      <div class="btn-row"><button class="btn btn-primary" type="submit" value="enviar">${r.status === "ficha_enviada" ? "Reenviar ao mestre" : "Enviar para aprovação"}</button><button class="btn btn-ghost" type="submit" value="rascunho">Salvar rascunho</button></div></form>`;
  }
  A.act.attr = (t) => {
    const d = ui.d.f; if (!d) return;
    const total = Number(A.X.site.pontosIniciais) || 0, used = Object.values(d.atributos).reduce((a, b) => a + (Number(b) || 0), 0);
    const n = Number(t.dataset.n), cur = d.atributos[t.dataset.a] || 0, nv = cur + n;
    if (nv < 0 || nv > MAXA || (n > 0 && used >= total)) return;
    d.atributos[t.dataset.a] = nv; A.render();
  };
  A.sub.ficha = async (f, sub) => {
    const enviar = sub && sub.value === "enviar", d = ui.d.f, fi = d.ficha, probs = [];
    Object.keys(fi).forEach(k => { fi[k] = String(fi[k] == null ? "" : fi[k]).trim(); });
    if (fi.imagem && fi.imagem.indexOf("db:") !== 0 && !A.validUrl(fi.imagem)) probs.push("o link da foto precisa começar com https://");
    if (fi.idade && (isNaN(+fi.idade) || +fi.idade < 18)) probs.push("a idade precisa ser 18 ou mais");
    if (enviar) {
      if (!fi.nome) probs.push("preencha o nome do personagem");
      if (!fi.idade) probs.push("preencha a idade");
      if (!fi.faceclaim) probs.push("informe o faceclaim");
      if ((fi.historia || "").length < 80) probs.push("escreva o resumo da história (algumas linhas)");
      const used = Object.values(d.atributos).reduce((a, b) => a + b, 0), total = Number(A.X.site.pontosIniciais) || 0;
      if (used !== total) probs.push(`distribua todos os ${total} pontos de atributo`);
    }
    if (probs.length) A.fail("Antes de " + (enviar ? "enviar" : "salvar") + ": " + probs.join("; ") + ".");
    await B.saveFicha(fi, d.atributos, enviar, d.segredo);
    A.toast(enviar ? "Ficha enviada ao mestre." : "Rascunho salvo.");
  };

  function wallet(u, s) {
    const w = S.carteiras[u.uid], site = A.X.site;
    if (!w) return `<div class="empty">Sua carteira ainda está sendo preparada pelo mestre.</div>`;
    const xp = Number(w.xp) || 0, n = lvl(xp), pct = xp % 100;
    const inv = Object.entries(w.inventario || {}).filter(([, q]) => q > 0);
    const ped = Object.entries(S.pedidos).filter(([, p]) => p.uid === u.uid).sort((a, b) => (b[1].criadoEm || 0) - (a[1].criadoEm || 0));
    const hist = (w.historico || []).slice(-8).reverse();
    return `<div class="kpis"><div class="kpi"><b>${esc(w.saldo)}</b><span>${esc(site.moeda)}</span></div><div class="kpi"><b>${n}</b><span>Nível</span></div><div class="kpi"><b>${xp}</b><span>Experiência</span></div><div class="kpi"><b>${inv.reduce((a, [, q]) => a + q, 0)}</b><span>Itens</span></div></div>
      <div class="panel" style="display:grid;gap:8px"><div class="sub-head"><h3 class="h3">Progressão</h3><span class="small">${100 - pct} XP para o nível ${n + 1}</span></div><div class="xpbar" role="img" aria-label="${pct}% do nível atual"><i style="width:${pct}%"></i></div><p class="small" style="margin:0">O mestre dá experiência por cenas, tramas e eventos. Cada nível novo pode render um ponto de atributo.</p></div>
      <div class="grid g2"><div class="panel"><div class="sub-head"><h3 class="h3">Inventário</h3><a class="small" href="#mercado">Ir ao mercado</a></div>${inv.length ? `<ul class="inv">${inv.map(([k, q]) => `<li><span>${esc(k)}</span><b>${q}x</b></li>`).join("")}</ul>` : `<p class="muted" style="margin:0">Inventário vazio.</p>`}</div>
      <div class="panel"><div class="sub-head"><h3 class="h3">Pedidos</h3></div>${ped.length ? `<ul class="inv">${ped.map(([id, p]) => `<li><span>${p.qtd}x ${esc(p.nome)} <span class="muted">· ${esc(p.total)} ${esc(site.moeda)}</span>${p.nota ? `<br><span class="small">${esc(p.nota)}</span>` : ""}</span><span style="display:flex;gap:6px;align-items:center"><span class="pill ${p.status === "entregue" ? "st-livre" : p.status === "recusado" ? "st-bad" : "st-reservada"}">${p.status === "entregue" ? "Entregue" : p.status === "recusado" ? "Recusado" : "Pendente"}</span>${p.status === "pendente" ? `<button class="btn btn-quiet btn-xs" type="button" data-act="order-cancel" data-id="${esc(id)}">Cancelar</button>` : ""}</span></li>`).join("")}</ul>` : `<p class="muted" style="margin:0">Nenhum pedido.</p>`}</div></div>
      ${hist.length ? `<div class="panel"><div class="sub-head"><h3 class="h3">Movimentações</h3></div><ul class="inv">${hist.map(h => `<li><span>${esc(h.txt)}</span><span class="small">${esc(A.fmtDate(h.t, true))}</span></li>`).join("")}</ul></div>` : ""}`;
  }
  A.act["order-cancel"] = (t) => A.run(() => B.cancelOrder(t.dataset.id), "Pedido cancelado.");
  function groupLinks() {
    const p = S.privado;
    if (!p || !(p.linkGrupo || p.linkOff)) return `<div class="empty">O mestre ainda não cadastrou os links do grupo. Eles aparecem aqui assim que forem adicionados.</div>`;
    return `<div class="panel" style="display:grid;gap:12px">${[["Grupo principal (ON)", p.linkGrupo], ["Grupo OFF", p.linkOff]].filter(x => x[1]).map(([n, l]) => `<div class="field"><span class="lbl">${n}</span><div class="copy-row"><code>${esc(l)}</code>${A.validUrl(l) ? `<a class="btn btn-primary btn-sm" href="${esc(l)}" target="_blank" rel="noopener">Abrir</a>` : ""}<button class="btn btn-ghost btn-sm" type="button" data-act="copy" data-v="${esc(l)}">Copiar</button></div></div>`).join("")}</div>`;
  }

  /* ---------------- mestre ---------------- */
  function master() {
    const res = S.reservas, all = A.counts(A.X.slots);
    const pend = Object.values(S.pedidos).filter(p => p.status === "pendente").length, emAnalise = Object.values(res).filter(r => r.status === "ficha_enviada").length;
    const tabs = [["fichas", "Fichas" + (emAnalise ? ` (${emAnalise})` : "")], ["jogadores", "Jogadores"], ["pedidos", "Pedidos" + (pend ? ` (${pend})` : "")], ["config", "Grupo e inscrições"], ["notas", "Notas do mestre"]];
    let body = "";
    if (ui.mtab === "jogadores") body = players();
    else if (ui.mtab === "pedidos") body = orders();
    else if (ui.mtab === "config") body = config();
    else if (ui.mtab === "notas") body = notes();
    else body = queue();
    return `<div class="kpis"><div class="kpi"><b>${all.livre}</b><span>Vagas livres</span></div><div class="kpi"><b>${all.reservada}</b><span>Reservadas</span></div><div class="kpi"><b>${all.analise}</b><span>Em análise</span></div><div class="kpi"><b>${all.ocupada}</b><span>Aprovadas</span></div></div>
      <div class="seg" role="group" aria-label="Painel do mestre">${tabs.map(([k, n]) => `<button type="button" data-act="set" data-k="mtab" data-v="${k}" aria-pressed="${ui.mtab === k}">${n}</button>`).join("")}</div>${body}`;
  }
  const playerLine = (uid) => { const p = S.perfis[uid] || {}, r = S.reservas[uid] || {}; return esc(r.jogador || p.nick || "Jogador") + (p.contato ? " · " + esc(p.contato) : ""); };

  function queue() {
    const res = S.reservas, f = ui.d.qf || "ficha_enviada";
    const uids = Object.keys(res).filter(u => A.X.slot[res[u].slotId]);
    const tabs = [["ficha_enviada", "Em análise"], ["reservada", "Aguardando ficha"], ["recusada", "Ajustes pedidos"], ["aprovada", "Aprovadas"], ["todas", "Todas"]];
    const list = uids.filter(u => f === "todas" || res[u].status === f).sort((a, b) => (res[a].criadoEm || 0) - (res[b].criadoEm || 0));
    return `<div class="panel" style="display:grid;gap:14px"><div class="chips">${tabs.map(([k, n]) => `<button class="chip" type="button" data-act="qf" data-v="${k}" aria-pressed="${f === k}">${n} <span class="n">${k === "todas" ? uids.length : uids.filter(u => res[u].status === k).length}</span></button>`).join("")}</div>
      <div class="queue">${list.map(uid => {
        const r = res[uid], s = A.X.slot[r.slotId], [lbl, cls] = A.RST[r.status] || A.RST.reservada, open = ui.exp["q" + uid], dl = A.deadline(r);
        let acts;
        if (ui.confirm === "aj" + uid) acts = `<div class="field"><label for="aj-${uid}">Recado para o jogador</label><textarea class="textarea" id="aj-${uid}" data-d="aj.${uid}" maxlength="2000" style="min-height:90px">${esc((ui.d.aj && ui.d.aj[uid]) || r.notaMestre || "")}</textarea></div><div class="btn-row"><button class="btn btn-primary btn-sm" type="button" data-act="aj-send" data-uid="${uid}">Enviar recado e pedir ajustes</button><button class="btn btn-quiet btn-sm" type="button" data-act="unask">Voltar</button></div>`;
        else if (ui.confirm === "rl" + uid) acts = `<div class="confirm-box"><span>Liberar a vaga de <b>${esc(r.jogador)}</b>? A reserva, a ficha e a carteira serão apagadas.</span><div class="btn-row"><button class="btn btn-danger btn-sm" type="button" data-act="release" data-uid="${uid}">Sim, liberar vaga</button><button class="btn btn-quiet btn-sm" type="button" data-act="unask">Voltar</button></div></div>`;
        else acts = `<div class="btn-row">${r.status !== "aprovada" ? `<button class="btn btn-ok btn-sm" type="button" data-act="approve" data-uid="${uid}">Aprovar e entregar kit</button><button class="btn btn-ghost btn-sm" type="button" data-act="ask" data-k="aj${uid}">Pedir ajustes</button>` : `<button class="btn btn-ghost btn-sm" type="button" data-act="back-an" data-uid="${uid}">Voltar para análise</button>`}<button class="btn btn-danger btn-sm" type="button" data-act="ask" data-k="rl${uid}">Liberar vaga</button></div>`;
        return `<div class="q-item" style="--fac:${esc(s.cor)}"><button class="q-row" type="button" data-act="toggle" data-k="q${uid}" aria-expanded="${!!open}"><span class="q-main"><b>${esc((r.ficha && r.ficha.nome) || s.papel)} · ${esc(s.e.nome)}</b><small>${playerLine(uid)}${dl ? " · " + esc(dl.txt) : ""}</small></span><span class="pill ${cls}">${lbl}</span></button>
          ${open ? `<div class="q-detail"><span class="small">${esc(s.papel)} · ${esc(s.g.nome)}${(S.perfis[uid] || {}).email ? " · " + esc(S.perfis[uid].email) : ""}</span>${r.ficha && r.ficha.imagem ? `<div style="max-width:160px">${A.tile(r.ficha.imagem, r.ficha.nome)}</div>` : ""}${A.fichaView(r.ficha, true)}<div><p class="eyebrow" style="margin-bottom:8px">Atributos</p>${A.attrView(r.atributos)}</div>${S.segredos[uid] ? `<div class="secret"><b>Segredo</b>${esc(S.segredos[uid])}</div>` : ""}${acts}</div>` : ""}</div>`;
      }).join("") || `<p class="muted" style="margin:0">Nada por aqui.</p>`}</div></div>`;
  }
  A.act.qf = (t) => { ui.d.qf = t.dataset.v; ui.confirm = null; A.render(); };
  A.act.approve = (t) => {
    const uid = t.dataset.uid, r = S.reservas[uid], s = A.X.slot[r.slotId], site = A.X.site;
    const inv = A.parseLines(s.e.kit || []);
    const w = { saldo: Number(site.saldoInicial) || 0, xp: 0, inventario: inv, historico: [{ t: Date.now(), txt: "Kit inicial e " + site.saldoInicial + " " + site.moeda }] };
    A.run(() => B.admin.setStatus(uid, "aprovada", "", w), "Ficha aprovada. Kit e moedas entregues.");
  };
  A.act["back-an"] = (t) => A.run(() => B.admin.setStatus(t.dataset.uid, "ficha_enviada", ""), "Ficha voltou para análise.");
  A.act["aj-send"] = (t) => {
    const uid = t.dataset.uid, nota = (ui.d.aj && ui.d.aj[uid]) || (document.getElementById("aj-" + uid) || {}).value || "";
    if (!nota.trim()) { A.toast("Escreva o que o jogador precisa ajustar.", true); return; }
    ui.confirm = null; if (document.activeElement) document.activeElement.blur();
    A.run(() => B.admin.setStatus(uid, "recusada", nota), "Recado enviado ao jogador.");
  };
  A.act.release = (t) => { ui.confirm = null; A.run(() => B.admin.release(t.dataset.uid), "Vaga liberada."); };

  function players() {
    const uids = Object.keys(S.reservas).filter(u => S.reservas[u].status === "aprovada");
    if (!uids.length) return `<div class="empty">Quando você aprovar fichas, os jogadores aparecem aqui com saldo, experiência, atributos e inventário.</div>`;
    const site = A.X.site;
    return `<div class="queue">${uids.map(uid => {
      const r = S.reservas[uid], s = A.X.slot[r.slotId], w = S.carteiras[uid] || { saldo: 0, xp: 0, inventario: {} }, open = ui.exp["w" + uid];
      let det = "";
      if (open) {
        const k = uid + "|" + JSON.stringify(w) + JSON.stringify(r.atributos || {});
        if (ui.dk["w" + uid] !== k) { ui.d["w" + uid] = { saldo: w.saldo, xp: w.xp, inv: Object.entries(w.inventario || {}).map(([n, q]) => q + "x " + n).join("\n"), motivo: "", at: Object.assign({}, r.atributos || {}) }; ui.dk["w" + uid] = k; }
        const d = ui.d["w" + uid];
        det = `<form class="q-detail form" data-form="wallet" data-uid="${uid}" novalidate>
          <div class="row2"><div class="field"><label for="w-s-${uid}">Saldo (${esc(site.moeda)})</label><input class="input" id="w-s-${uid}" type="number" data-d="w${uid}.saldo" data-dt="num" value="${esc(d.saldo)}"></div><div class="field"><label for="w-x-${uid}">Experiência <span class="hint">100 XP por nível</span></label><input class="input" id="w-x-${uid}" type="number" min="0" data-d="w${uid}.xp" data-dt="num" value="${esc(d.xp)}"></div></div>
          <div class="field"><label for="w-i-${uid}">Inventário <span class="hint">um item por linha, como "2x Ramo de verbena"</span></label><textarea class="textarea" id="w-i-${uid}" data-d="w${uid}.inv">${esc(d.inv)}</textarea></div>
          <div class="field"><span class="lbl">Atributos</span><div class="row2">${A.C("atributos").map(a => `<div class="field"><label for="w-a-${uid}-${esc(a.id)}">${esc(a.nome)}</label><input class="input" id="w-a-${uid}-${esc(a.id)}" type="number" min="0" max="10" data-d="w${uid}.at.${esc(a.id)}" data-dt="num" value="${esc(d.at[a.id] || 0)}"></div>`).join("")}</div></div>
          <div class="field"><label for="w-m-${uid}">Motivo <span class="hint">aparece nas movimentações do jogador</span></label><input class="input" id="w-m-${uid}" data-d="w${uid}.motivo" maxlength="140" value="${esc(d.motivo)}" placeholder="Ex.: recompensa do contrato da trilha norte"></div>
          <p class="err form-msg" hidden></p><div class="btn-row"><button class="btn btn-primary btn-sm" type="submit">Salvar jogador</button></div></form>`;
      }
      return `<div class="q-item" style="--fac:${esc(s.cor)}"><button class="q-row" type="button" data-act="toggle" data-k="w${uid}" aria-expanded="${!!open}"><span class="q-main"><b>${esc(A.charName(s, r))} · ${esc(s.e.nome)}</b><small>${playerLine(uid)}</small></span><span class="small" style="white-space:nowrap">${esc(w.saldo)} ${esc(site.moeda)} · nível ${lvl(w.xp)}</span></button>${det}</div>`;
    }).join("")}</div>`;
  }
  A.sub.wallet = async (f) => {
    const uid = f.dataset.uid, d = ui.d["w" + uid], old = S.carteiras[uid] || { historico: [] }, r = S.reservas[uid];
    const inv = A.parseLines(String(d.inv || "").split("\n"));
    const saldo = Number(d.saldo) || 0, xp = Math.max(0, Number(d.xp) || 0);
    const notes = [];
    if (saldo !== Number(old.saldo || 0)) notes.push((saldo > (old.saldo || 0) ? "+" : "") + (saldo - (old.saldo || 0)) + " " + A.X.site.moeda);
    if (xp !== Number(old.xp || 0)) notes.push((xp > (old.xp || 0) ? "+" : "") + (xp - (old.xp || 0)) + " XP");
    if (JSON.stringify(inv) !== JSON.stringify(old.inventario || {})) notes.push("inventário ajustado");
    const hist = (old.historico || []).slice(-30);
    if (notes.length) hist.push({ t: Date.now(), txt: (d.motivo ? d.motivo + ": " : "Ajuste do mestre: ") + notes.join(", ") });
    await B.admin.saveWallet(uid, { saldo, xp, inventario: inv, historico: hist });
    const at = {}; A.C("atributos").forEach(a => { at[a.id] = Math.max(0, Math.min(10, Number(d.at[a.id]) || 0)); });
    if (JSON.stringify(at) !== JSON.stringify(r.atributos || {})) await B.admin.saveFichaOf(uid, { atributos: at });
    A.toast("Jogador atualizado.");
  };

  function orders() {
    const list = Object.entries(S.pedidos).sort((a, b) => (a[1].status === "pendente" ? 0 : 1) - (b[1].status === "pendente" ? 0 : 1) || (b[1].criadoEm || 0) - (a[1].criadoEm || 0));
    const site = A.X.site;
    if (!list.length) return `<div class="empty">Nenhum pedido no mercado ainda.</div>`;
    return `<div class="panel"><ul class="inv">${list.map(([id, p]) => {
      const r = S.reservas[p.uid], s = r && A.X.slot[r.slotId], w = S.carteiras[p.uid] || { saldo: 0 };
      const st = p.status === "entregue" ? ["Entregue", "st-livre"] : p.status === "recusado" ? ["Recusado", "st-bad"] : ["Pendente", "st-reservada"];
      const acts = p.status === "pendente" ? (ui.confirm === "rf" + id ? `<span style="display:grid;gap:6px;min-width:220px"><input class="input" data-d="rf.${id}" placeholder="Motivo (opcional)" aria-label="Motivo da recusa"><span class="btn-row"><button class="btn btn-danger btn-xs" type="button" data-act="refuse" data-id="${esc(id)}">Recusar</button><button class="btn btn-quiet btn-xs" type="button" data-act="unask">Voltar</button></span></span>` : `<span class="btn-row"><button class="btn btn-ok btn-xs" type="button" data-act="deliver" data-id="${esc(id)}">Entregar</button><button class="btn btn-ghost btn-xs" type="button" data-act="ask" data-k="rf${id}">Recusar</button></span>`) : `<button class="btn btn-quiet btn-xs" type="button" data-act="ord-clear" data-id="${esc(id)}">Apagar</button>`;
      return `<li style="flex-wrap:wrap"><span><b style="color:var(--bone)">${p.qtd}x ${esc(p.nome)}</b> · ${esc(p.total)} ${esc(site.moeda)}<br><span class="small">${s ? esc(A.charName(s, r)) + " · " : ""}${playerLine(p.uid)} · saldo ${esc(w.saldo)} · ${esc(A.fmtDate(p.criadoEm, true))}</span></span><span style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span class="pill ${st[1]}">${st[0]}</span>${acts}</span></li>`;
    }).join("")}</ul></div>`;
  }
  A.act.deliver = (t) => {
    const id = t.dataset.id, p = S.pedidos[id], site = A.X.site;
    const w = A.clone(S.carteiras[p.uid] || { saldo: 0, xp: 0, inventario: {}, historico: [] });
    if ((Number(w.saldo) || 0) < p.total) { A.toast("O jogador não tem saldo suficiente para esse pedido.", true); return; }
    const merc = A.clone(A.C("mercado")), it = merc.find(i => i.id === p.itemId);
    if (it && Number(it.estoque) < p.qtd) { A.toast("Não há estoque suficiente. Aumente o estoque no Editor ou recuse.", true); return; }
    if (it) it.estoque = Number(it.estoque) - p.qtd;
    w.saldo = (Number(w.saldo) || 0) - p.total; w.inventario = w.inventario || {}; w.inventario[p.nome] = (w.inventario[p.nome] || 0) + p.qtd;
    w.historico = (w.historico || []).slice(-30); w.historico.push({ t: Date.now(), txt: `Comprou ${p.qtd}x ${p.nome} (${p.total} ${site.moeda})` });
    A.run(() => B.admin.deliver(id, p.uid, w, merc), "Pedido entregue.");
  };
  A.act.refuse = (t) => { const id = t.dataset.id; ui.confirm = null; A.run(() => B.admin.refuse(id, (ui.d.rf && ui.d.rf[id]) || ""), "Pedido recusado."); };
  A.act["ord-clear"] = (t) => A.run(() => B.admin.clearOrder(t.dataset.id));

  function config() {
    const c = S.config, p = S.privado || {};
    if (ui.dk.cfg !== JSON.stringify([c, p])) { ui.d.cfg = { ab: c.inscricoesAbertas !== false, g: p.linkGrupo || "", o: p.linkOff || "" }; ui.dk.cfg = JSON.stringify([c, p]); }
    const d = ui.d.cfg;
    return `<div class="grid g2"><form class="form panel" data-form="cfg" novalidate><div class="sub-head"><h3 class="h3">Inscrições</h3></div><label class="switch" for="cf-ab"><input type="checkbox" id="cf-ab" data-d="cfg.ab"${d.ab ? " checked" : ""}>Inscrições abertas</label><p class="small" style="margin:0">Com as inscrições fechadas, ninguém consegue reservar vagas novas.</p><div class="btn-row"><button class="btn btn-primary btn-sm" type="submit">Salvar</button></div></form>
      <form class="form panel" data-form="links" novalidate><div class="sub-head"><h3 class="h3">Links dos grupos</h3><span class="hint">só jogadores aprovados veem</span></div><div class="field"><label for="cp-g">Grupo principal (ON)</label><input class="input" id="cp-g" data-d="cfg.g" type="url" value="${esc(d.g)}" placeholder="https://chat.whatsapp.com/..."></div><div class="field"><label for="cp-o">Grupo OFF</label><input class="input" id="cp-o" data-d="cfg.o" type="url" value="${esc(d.o)}" placeholder="https://chat.whatsapp.com/..."></div><p class="err form-msg" hidden></p><div class="btn-row"><button class="btn btn-primary btn-sm" type="submit">Salvar links</button></div></form></div>
      ${B.mode === "demo" ? `<p style="margin:0"><button class="btn btn-quiet btn-sm" type="button" data-act="reset-demo">Restaurar dados de exemplo</button></p>` : ""}`;
  }
  A.sub.cfg = async () => { await B.admin.saveConfig({ inscricoesAbertas: ui.d.cfg.ab }); A.toast("Inscrições atualizadas."); };
  A.sub.links = async () => { const { g, o } = ui.d.cfg; if ((g && !A.validUrl(g)) || (o && !A.validUrl(o))) A.fail("Os links precisam começar com https://"); await B.admin.savePrivate({ linkGrupo: g.trim(), linkOff: o.trim() }); A.toast("Links salvos."); };
  A.act["reset-demo"] = () => { ui.d = {}; ui.dk = {}; A.run(() => B.resetDemo(), "Dados de exemplo restaurados."); };

  function notes() {
    const n = A.C("notas");
    if (ui.dk.notas !== JSON.stringify(n)) { ui.d.notas = n.texto || ""; ui.dk.notas = JSON.stringify(n); }
    return `<form class="form panel" data-form="notas" novalidate><div class="sub-head"><h3 class="h3">Notas do mestre</h3><span class="hint">só você vê. Bom lugar para as grandes revelações da trama</span></div><textarea class="textarea" id="mn" data-d="notas" style="min-height:320px" aria-label="Notas do mestre">${esc(ui.d.notas)}</textarea><div class="btn-row"><button class="btn btn-primary btn-sm" type="submit">Salvar notas</button></div></form>`;
  }
  A.sub.notas = async () => { await B.admin.saveContent("notas", { texto: String(ui.d.notas || "").slice(0, 60000) }); A.toast("Notas salvas."); };
})();
