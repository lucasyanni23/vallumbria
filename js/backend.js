/* =====================================================================
   BACKEND — contas, reservas, fichas, carteiras, mercado e conteúdo.
   Usa o Firebase quando VB_CONFIG.firebase está preenchido.
   Sem Firebase, roda em modo demonstração (dados só neste navegador).
   Normalmente você não precisa editar este arquivo.
   ===================================================================== */
(function () {
  "use strict";
  const CFG = window.VB_CONFIG || {};
  const FB = !!CFG.firebase;
  const FB_VERSION = "10.12.2";
  const subs = new Set();
  const clone = (o) => JSON.parse(JSON.stringify(o == null ? null : o));
  const now = () => Date.now();
  const rid = () => Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);

  let user = null, store = null, auth = null;
  let userUnsub = [], privUnsub = null, myStatus = null;
  const S = { pub: {}, mercado: null, notas: null, vagas: {}, reservas: {}, config: {}, privado: null, perfis: {}, segredos: {}, carteiras: {}, pedidos: {}, loaded: false };

  let emitQueued = false;
  function emit() {
    if (emitQueued) return;
    emitQueued = true;
    setTimeout(() => { emitQueued = false; subs.forEach(fn => { try { fn(); } catch (e) { console.error(e); } }); }, 0);
  }
  function fail(msg) { const e = new Error(msg); e.friendly = true; throw e; }
  const txt = (t, max) => String(t == null ? "" : t).slice(0, max || 6000);
  function cleanMap(o, max) { const out = {}; Object.keys(o || {}).forEach(k => { out[k] = txt(o[k], max || 6000); }); return out; }

  /* ---------------- armazenamento: demonstração ---------------- */
  function demoStore() {
    const KEY = "vb-demo-v1";
    let docs = null;
    const ls = [];
    try { docs = JSON.parse(localStorage.getItem(KEY)); } catch (e) { docs = null; }
    if (!docs) docs = demoSeed();
    const save = () => { try { localStorage.setItem(KEY, JSON.stringify(docs)); return true; } catch (e) { return false; } };
    function fire(l) {
      if (!l.col) { l.cb(docs[l.path] ? clone(docs[l.path]) : null); return; }
      const pre = l.path + "/", out = {};
      Object.keys(docs).forEach(p => {
        if (p.indexOf(pre) !== 0 || p.indexOf("/", pre.length) >= 0) return;
        if (l.where && docs[p][l.where[0]] !== l.where[1]) return;
        out[p.slice(pre.length)] = clone(docs[p]);
      });
      l.cb(out);
    }
    const add = (l) => { ls.push(l); setTimeout(() => fire(l), 0); return () => { const i = ls.indexOf(l); if (i >= 0) ls.splice(i, 1); }; };
    return {
      get: async (p) => (docs[p] ? clone(docs[p]) : null),
      batch: async (ops) => {
        const before = JSON.stringify(docs);
        ops.forEach(o => {
          if (o.del) delete docs[o.path];
          else if (o.upd) docs[o.path] = Object.assign({}, docs[o.path], clone(o.data));
          else docs[o.path] = clone(o.data);
        });
        if (!save()) { docs = JSON.parse(before); fail("O armazenamento do modo demonstração está cheio. Remova algumas fotos e tente de novo."); }
        setTimeout(() => ls.slice().forEach(fire), 0);
      },
      listenDoc: (path, cb) => add({ path, cb }),
      listenCol: (path, cb, err, where) => add({ path, cb, col: true, where }),
      reset: () => { docs = demoSeed(); save(); setTimeout(() => ls.slice().forEach(fire), 0); }
    };
  }
  function demoSeed() {
    const H = 3600000, t = now();
    return {
      "perfis/u-mestre": { nick: "Mestre", contato: "" },
      "perfis/u-jogador": { nick: "Jogador demo", contato: "" },
      "perfis/u-ines": { nick: "Inês (exemplo)", contato: "@ines" },
      "perfis/u-caio": { nick: "Caio (exemplo)", contato: "@caio" },
      "perfis/u-bia": { nick: "Bia (exemplo)", contato: "@bia" },
      "vagas/vamp-3": { uid: "u-ines" }, "vagas/lobo-1": { uid: "u-caio" }, "vagas/hum-25": { uid: "u-bia" },
      "reservas/u-ines": { slotId: "vamp-3", status: "aprovada", jogador: "Inês (exemplo)", criadoEm: t - 90 * H, atualizadoEm: t - 60 * H, notaMestre: "",
        atributos: { forca: 2, agilidade: 3, vigor: 2, astucia: 4, percepcao: 2, presenca: 1 },
        ficha: { nome: "Leonor de Aldaz", idade: "312", faceclaim: "Exemplo de faceclaim", ocupacao: "Guardiã dos arquivos do castelo", imagem: "",
          aparencia: "Cabelos escuros presos, luvas mesmo no verão e um olhar que parece ler quem entra.",
          personalidade: "Paciente, metódica e avessa a visitas.",
          historia: "Leonor chegou ao castelo quando os arquivos ainda eram escritos à mão por ela mesma. Há páginas que só ela sabe onde estão.",
          habilidades: "Memória perfeita para documentos. Conhece todas as passagens do castelo.",
          ganchos: "Desconfia do Herdeiro. Troca favores com a redação do jornal." } },
      "reservas/u-caio": { slotId: "lobo-1", status: "ficha_enviada", jogador: "Caio (exemplo)", criadoEm: t - 30 * H, atualizadoEm: t - 3 * H, notaMestre: "",
        atributos: { forca: 4, agilidade: 2, vigor: 3, astucia: 1, percepcao: 2, presenca: 2 },
        ficha: { nome: "Iker Sarrià", idade: "41", faceclaim: "Exemplo de faceclaim", ocupacao: "Alfa da alcateia", imagem: "",
          aparencia: "Alto, barba por fazer, cicatriz no antebraço.", personalidade: "Protetor e teimoso.",
          historia: "Assumiu a alcateia depois que o pai desapareceu na Reserva, numa noite sem lua.",
          habilidades: "Liderança da alcateia e faro aguçado.", ganchos: "Em conflito aberto com o Dissidente." } },
      "reservas/u-bia": { slotId: "hum-25", status: "reservada", jogador: "Bia (exemplo)", criadoEm: t - 20 * H, notaMestre: "", ficha: {}, atributos: {} },
      "segredos/u-ines": { texto: "Arrancou ela mesma a página do pacto que fala da mina." },
      "carteiras/u-ines": { saldo: 85, xp: 140, inventario: { "Bolsa de sangue": 2, "Frasco opaco": 1, "Ramo de verbena": 1 }, historico: [{ t: t - 60 * H, txt: "Kit inicial e 100 umbras" }, { t: t - 40 * H, txt: "Comprou 1x Ramo de verbena (15 umbras)" }] },
      "pedidos/p-ex1": { uid: "u-ines", itemId: "antidoto", nome: "Antídoto", qtd: 1, total: 35, status: "pendente", criadoEm: t - 2 * H },
      "config/geral": { inscricoesAbertas: true },
      "config/privado": { linkGrupo: "https://chat.whatsapp.com/exemplo-on", linkOff: "https://chat.whatsapp.com/exemplo-off" }
    };
  }
  function demoAuth() {
    const KEY = "vb-demo-auth";
    let st = null; let cb = null;
    try { st = JSON.parse(localStorage.getItem(KEY)); } catch (e) { st = null; }
    if (!st) st = { users: { "mestre@demo.vb": { uid: "u-mestre", pass: "demo123" }, "jogador@demo.vb": { uid: "u-jogador", pass: "demo123" } }, session: null };
    const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };
    const cur = () => (st.session && st.users[st.session] ? { uid: st.users[st.session].uid, email: st.session, emailVerified: true } : null);
    const go = (email) => { st.session = email; save(); if (cb) cb(cur()); };
    return {
      onChange: (fn) => { cb = fn; setTimeout(() => fn(cur()), 0); },
      signUp: async (email, pass) => {
        email = String(email || "").trim().toLowerCase();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) fail("Digite um e-mail válido.");
        if (String(pass || "").length < 6) fail("A senha precisa ter pelo menos 6 caracteres.");
        if (st.users[email]) fail("Já existe uma conta com esse e-mail. Use Entrar.");
        st.users[email] = { uid: "u-" + rid(), pass }; go(email); return st.users[email].uid;
      },
      signIn: async (email, pass) => {
        email = String(email || "").trim().toLowerCase();
        if (!st.users[email] || st.users[email].pass !== pass) fail("E-mail ou senha incorretos.");
        go(email);
      },
      signOut: async () => go(null),
      reset: async () => fail("No modo demonstração não há e-mail de recuperação. As contas de teste usam a senha demo123."),
      sendVerification: async () => {}, reload: async () => true,
      isAdmin: async (u) => u.email === "mestre@demo.vb",
      wipe: () => { st.session = null; st.users = { "mestre@demo.vb": { uid: "u-mestre", pass: "demo123" }, "jogador@demo.vb": { uid: "u-jogador", pass: "demo123" } }; save(); if (cb) cb(null); }
    };
  }

  /* ---------------- armazenamento: Firebase ---------------- */
  function loadScript(src) {
    return new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = () => rej(new Error("Falha ao carregar " + src)); document.head.appendChild(s); });
  }
  function fbMessage(e) {
    const map = {
      "auth/invalid-email": "Digite um e-mail válido.", "auth/email-already-in-use": "Já existe uma conta com esse e-mail. Use Entrar.",
      "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.", "auth/invalid-credential": "E-mail ou senha incorretos.",
      "auth/wrong-password": "E-mail ou senha incorretos.", "auth/user-not-found": "Não encontramos uma conta com esse e-mail.",
      "auth/too-many-requests": "Muitas tentativas seguidas. Espere alguns minutos e tente de novo.",
      "auth/network-request-failed": "Sem conexão. Verifique sua internet e tente de novo.",
      "permission-denied": "Ação não permitida. Atualize a página e tente de novo.", "unavailable": "Sem conexão com o servidor. Tente de novo em instantes.",
      "auth/operation-not-allowed": "O login por e-mail e senha ainda não foi ativado no Firebase. O mestre precisa ativar em Authentication → Método de login → E-mail/senha.",
      "auth/configuration-not-found": "O login ainda não foi configurado no Firebase. O mestre precisa abrir Authentication, clicar em Vamos começar e ativar E-mail/senha.",
      "auth/unauthorized-domain": "Este endereço não está autorizado no Firebase. O mestre precisa adicioná-lo em Authentication → Configurações → Domínios autorizados.",
      "auth/admin-restricted-operation": "O cadastro de contas está bloqueado no Firebase. O mestre precisa liberar em Authentication → Configurações → Ações do usuário.",
      "failed-precondition": "O banco de dados ainda não foi criado no Firebase. O mestre precisa criar o Firestore Database.",
      "not-found": "O banco de dados ainda não foi criado no Firebase. O mestre precisa criar o Firestore Database."
    };
    if (e && e.friendly) return e.message;
    const code = (e && e.code) || "";
    if (map[code]) return map[code];
    const raw = String((e && e.message) || "");
    if (/CONFIGURATION_NOT_FOUND/i.test(raw)) return map["auth/configuration-not-found"];
    if (/OPERATION_NOT_ALLOWED/i.test(raw)) return map["auth/operation-not-allowed"];
    return "Algo deu errado" + (code ? " (" + code + ")" : raw ? " (" + raw.slice(0, 120) + ")" : "") + ". Tente de novo.";
  }
  function fbStore(db) {
    const ref = (p) => db.doc(p);
    return {
      get: async (p) => { const s = await ref(p).get(); return s.exists ? s.data() : null; },
      batch: async (ops) => {
        const b = db.batch();
        ops.forEach(o => { if (o.del) b.delete(ref(o.path)); else if (o.upd) b.update(ref(o.path), clone(o.data)); else b.set(ref(o.path), clone(o.data)); });
        await b.commit();
      },
      listenDoc: (p, cb, err) => ref(p).onSnapshot(s => cb(s.exists ? s.data() : null), e => { if (err) err(e); }),
      listenCol: (p, cb, err, where) => {
        let q = db.collection(p);
        if (where) q = q.where(where[0], "==", where[1]);
        return q.onSnapshot(s => { const o = {}; s.forEach(d => { o[d.id] = d.data(); }); cb(o); }, e => { if (err) err(e); });
      }
    };
  }
  function fbAuth(fa) {
    return {
      onChange: (fn) => fa.onAuthStateChanged(u => fn(u ? { uid: u.uid, email: (u.email || "").toLowerCase(), emailVerified: !!u.emailVerified } : null)),
      signUp: async (email, pass) => { const c = await fa.createUserWithEmailAndPassword(String(email).trim(), pass); try { await c.user.sendEmailVerification(); } catch (e) { console.warn(e); } return c.user.uid; },
      signIn: async (email, pass) => { await fa.signInWithEmailAndPassword(String(email).trim(), pass); },
      signOut: async () => { await fa.signOut(); },
      reset: async (email) => { await fa.sendPasswordResetEmail(String(email).trim()); },
      sendVerification: async () => { await fa.currentUser.sendEmailVerification(); },
      reload: async () => { await fa.currentUser.reload(); await fa.currentUser.getIdToken(true); return !!fa.currentUser.emailVerified; },
      // O mestre é definido só nas regras do Firestore. Quem consegue ler as notas do mestre é o mestre.
      isAdmin: async () => { try { await store.get("mestre/notas"); return true; } catch (e) { return false; } }
    };
  }

  /* ---------------- assinaturas ---------------- */
  function startPublic() {
    let pending = 4;
    const done = () => { if (pending > 0 && --pending === 0) { S.loaded = true; } emit(); };
    const once = () => { let f = true; return () => { if (f) { f = false; done(); } else emit(); }; };
    const a = once(), b = once(), c = once(), d = once();
    store.listenCol("conteudo", (docs) => { const o = {}; Object.keys(docs).forEach(k => { o[k] = docs[k].v; }); S.pub = o; a(); }, a);
    store.listenCol("vagas", (docs) => { S.vagas = docs; b(); }, b);
    store.listenCol("reservas", (docs) => {
      S.reservas = docs;
      if (user && !user.isAdmin) { const st = docs[user.uid] ? docs[user.uid].status : null; if (st !== myStatus) { myStatus = st; subPrivado(); } }
      c();
    }, c);
    store.listenDoc("config/geral", (doc) => { S.config = doc || {}; d(); }, d);
    store.listenDoc("reservado/mercado", (doc) => { S.mercado = doc ? doc.v : null; emit(); }, () => {});
  }
  function subPrivado() {
    if (privUnsub) { privUnsub(); privUnsub = null; }
    S.privado = null;
    if (!user) return;
    privUnsub = store.listenDoc("config/privado", (d) => { S.privado = d || {}; emit(); }, () => { S.privado = null; emit(); });
  }
  function startUser() {
    userUnsub.forEach(f => { try { f(); } catch (e) {} }); userUnsub = [];
    S.perfis = {}; S.segredos = {}; S.carteiras = {}; S.pedidos = {}; S.notas = null;
    subPrivado();
    if (!user) { emit(); return; }
    const uid = user.uid, L = (f) => userUnsub.push(f), nop = () => {};
    const setNick = () => { const p = S.perfis[uid]; if (p && user) { user.nick = p.nick || user.nick; user.contato = p.contato || ""; } };
    if (user.isAdmin) {
      L(store.listenCol("perfis", (d) => { S.perfis = d; setNick(); emit(); }, nop));
      L(store.listenCol("segredos", (d) => { const o = {}; Object.keys(d).forEach(k => { o[k] = d[k].texto || ""; }); S.segredos = o; emit(); }, nop));
      L(store.listenCol("carteiras", (d) => { S.carteiras = d; emit(); }, nop));
      L(store.listenCol("pedidos", (d) => { S.pedidos = d; emit(); }, nop));
      L(store.listenDoc("mestre/notas", (d) => { S.notas = d ? d.v : null; emit(); }, nop));
    } else {
      L(store.listenDoc("perfis/" + uid, (d) => { S.perfis = d ? { [uid]: d } : {}; setNick(); emit(); }, nop));
      L(store.listenDoc("segredos/" + uid, (d) => { S.segredos = d ? { [uid]: d.texto || "" } : {}; emit(); }, nop));
      L(store.listenDoc("carteiras/" + uid, (d) => { S.carteiras = d ? { [uid]: d } : {}; emit(); }, nop));
      L(store.listenCol("pedidos", (d) => { S.pedidos = d; emit(); }, nop, ["uid", uid]));
    }
  }
  let authSeq = 0;
  async function onAuth(u) {
    const seq = ++authSeq;
    if (!u) { user = null; myStatus = null; startUser(); return; }
    user = { uid: u.uid, email: u.email, emailVerified: u.emailVerified, isAdmin: false, nick: (user && user.uid === u.uid && user.nick) || "", contato: "" };
    myStatus = S.reservas[u.uid] ? S.reservas[u.uid].status : null;
    startUser();
    const adm = await auth.isAdmin(u);
    if (seq !== authSeq || !user) return;
    if (adm) { user.isAdmin = true; startUser(); }
  }

  /* ---------------- API ---------------- */
  const wrap = (fn) => async (...a) => { try { return await fn(...a); } catch (e) { if (!e || !e.friendly) console.error(e); fail(fbMessage(e)); } };
  const needUser = () => { if (!user) fail("Entre na sua conta primeiro."); };
  const needAdmin = () => { needUser(); if (!user.isAdmin) fail("Só o mestre pode fazer isso."); };
  const nick = (n) => String(n || "").trim().slice(0, 40);
  const imgCache = {};

  const api = {
    mode: FB ? "firebase" : "demo",
    state: S,
    get user() { return user; },
    on(fn) { subs.add(fn); return () => subs.delete(fn); },

    signUp: wrap(async (email, pass, n, contato) => {
      if (!nick(n)) fail("Escolha um nome de jogador.");
      const uid = await auth.signUp(email, pass);
      try { await store.batch([{ path: "perfis/" + uid, data: { nick: nick(n), contato: txt(contato, 80), criadoEm: now() } }]); }
      catch (e) { console.error(e); fail("Sua conta foi criada, mas o perfil não foi salvo: " + fbMessage(e) + " Depois de resolver, use Editar perfil no Painel."); }
      if (user && user.uid === uid) { user.nick = nick(n); emit(); }
    }),
    signIn: wrap((email, pass) => auth.signIn(email, pass)),
    signOut: wrap(() => auth.signOut()),
    resetPassword: wrap((email) => auth.reset(email)),
    sendVerification: wrap(() => { needUser(); return auth.sendVerification(); }),
    checkVerification: wrap(async () => {
      needUser();
      const ok = await auth.reload();
      user.emailVerified = ok;
      if (!ok) { emit(); fail("Ainda não aparece como confirmado. Abra o link do e-mail e tente de novo."); }
      if (await auth.isAdmin(user)) { user.isAdmin = true; startUser(); }
      emit();
    }),
    demoLogin: wrap(async (kind) => { if (FB) return; await auth.signIn(kind === "mestre" ? "mestre@demo.vb" : "jogador@demo.vb", "demo123"); }),
    resetDemo: wrap(async () => { if (FB) return; auth.wipe(); store.reset(); }),
    updateProfile: wrap(async ({ nick: n, contato }) => {
      needUser();
      if (!nick(n)) fail("Escolha um nome de jogador.");
      const ops = [{ path: "perfis/" + user.uid, data: { nick: nick(n), contato: txt(contato, 80), criadoEm: now() } }];
      if (S.reservas[user.uid] && S.reservas[user.uid].status !== "aprovada") { /* o nome exibido na reserva só muda pelo mestre depois de aprovada */ }
      await store.batch(ops);
    }),

    reserve: wrap(async (slotId) => {
      needUser();
      if (S.config.inscricoesAbertas === false) fail("As inscrições estão fechadas no momento.");
      if (S.reservas[user.uid]) fail("Você já tem uma vaga reservada. Cancele a atual para trocar.");
      if (S.vagas[slotId]) fail("Essa vaga acabou de ser reservada por outra pessoa.");
      try {
        await store.batch([
          { path: "vagas/" + slotId, data: { uid: user.uid, em: now() } },
          { path: "reservas/" + user.uid, data: { slotId, status: "reservada", jogador: nick(user.nick) || "Jogador", criadoEm: now(), ficha: {}, atributos: {} } }
        ]);
      } catch (e) { if (e && e.code === "permission-denied") fail("Não deu para reservar. A vaga pode ter sido pega agora mesmo ou as inscrições foram fechadas."); throw e; }
    }),
    cancel: wrap(async () => {
      needUser();
      const r = S.reservas[user.uid]; if (!r) return;
      const ops = [];
      if (S.vagas[r.slotId] && S.vagas[r.slotId].uid === user.uid) ops.push({ path: "vagas/" + r.slotId, del: true });
      ops.push({ path: "reservas/" + user.uid, del: true });
      await store.batch(ops);
    }),
    saveFicha: wrap(async (ficha, atributos, enviar, segredo) => {
      needUser();
      const r = S.reservas[user.uid];
      if (!r) fail("Você não tem uma vaga reservada.");
      if (r.status === "aprovada") fail("Sua ficha já foi aprovada. Fale com o mestre para alterar.");
      const at = {}; Object.keys(atributos || {}).forEach(k => { at[k] = Math.max(0, Math.min(10, parseInt(atributos[k], 10) || 0)); });
      const upd = { ficha: cleanMap(ficha), atributos: at, atualizadoEm: now() };
      if (enviar) upd.status = "ficha_enviada";
      await store.batch([{ path: "reservas/" + user.uid, upd: true, data: upd }, { path: "segredos/" + user.uid, data: { texto: txt(segredo, 5000), atualizadoEm: now() } }]);
    }),
    saveFoto: wrap(async (dataUrl) => {
      needUser();
      if (String(dataUrl).length > 880000) fail("A foto ficou grande demais. Tente uma imagem menor.");
      await store.batch([{ path: "fotos/" + user.uid, data: { data: dataUrl } }]);
      const ref = "db:fotos/" + user.uid + "#" + now();
      imgCache[ref] = dataUrl;
      return ref;
    }),
    order: wrap(async (item, qtd) => {
      needUser();
      const r = S.reservas[user.uid];
      if (!r || r.status !== "aprovada") fail("O mercado abre para você depois que sua ficha for aprovada.");
      qtd = Math.max(1, Math.min(20, parseInt(qtd, 10) || 1));
      await store.batch([{ path: "pedidos/" + rid(), data: { uid: user.uid, itemId: item.id, nome: txt(item.nome, 120), qtd, total: qtd * (Number(item.preco) || 0), status: "pendente", criadoEm: now() } }]);
    }),
    cancelOrder: wrap(async (id) => { needUser(); await store.batch([{ path: "pedidos/" + id, del: true }]); }),

    /* imagens: "img/arquivo.webp", "https://..." ou "db:colecao/id" */
    imgNow(ref) {
      if (!ref) return "";
      if (ref.indexOf("db:") !== 0) return ref;
      return imgCache[ref] || "";
    },
    async imgLoad(ref) {
      if (!ref || ref.indexOf("db:") !== 0) return ref || "";
      if (imgCache[ref] != null) return imgCache[ref];
      try { const d = await store.get(ref.slice(3).split("#")[0]); imgCache[ref] = (d && d.data) || ""; } catch (e) { imgCache[ref] = ""; }
      return imgCache[ref];
    },

    admin: {
      setStatus: wrap(async (uid, status, nota, carteiraInicial) => {
        needAdmin();
        const ops = [{ path: "reservas/" + uid, upd: true, data: { status, notaMestre: txt(nota, 2000), atualizadoEm: now() } }];
        if (status === "aprovada" && carteiraInicial && !S.carteiras[uid]) ops.push({ path: "carteiras/" + uid, data: carteiraInicial });
        await store.batch(ops);
      }),
      release: wrap(async (uid) => {
        needAdmin();
        const r = S.reservas[uid], ops = [];
        if (r && S.vagas[r.slotId] && S.vagas[r.slotId].uid === uid) ops.push({ path: "vagas/" + r.slotId, del: true });
        ops.push({ path: "reservas/" + uid, del: true });
        if (S.carteiras[uid]) ops.push({ path: "carteiras/" + uid, del: true });
        await store.batch(ops);
      }),
      saveFichaOf: wrap(async (uid, patch) => { needAdmin(); await store.batch([{ path: "reservas/" + uid, upd: true, data: Object.assign({ atualizadoEm: now() }, patch) }]); }),
      saveWallet: wrap(async (uid, carteira) => { needAdmin(); await store.batch([{ path: "carteiras/" + uid, data: carteira }]); }),
      deliver: wrap(async (id, uid, carteira, mercado) => {
        needAdmin();
        await store.batch([
          { path: "carteiras/" + uid, data: carteira },
          { path: "reservado/mercado", data: { v: mercado } },
          { path: "pedidos/" + id, upd: true, data: { status: "entregue", resolvidoEm: now() } }
        ]);
      }),
      refuse: wrap(async (id, nota) => { needAdmin(); await store.batch([{ path: "pedidos/" + id, upd: true, data: { status: "recusado", nota: txt(nota, 500), resolvidoEm: now() } }]); }),
      clearOrder: wrap(async (id) => { needAdmin(); await store.batch([{ path: "pedidos/" + id, del: true }]); }),
      saveConfig: wrap(async (cfg) => { needAdmin(); await store.batch([{ path: "config/geral", data: { inscricoesAbertas: !!cfg.inscricoesAbertas } }]); }),
      savePrivate: wrap(async (p) => { needAdmin(); await store.batch([{ path: "config/privado", data: { linkGrupo: txt(p.linkGrupo, 500), linkOff: txt(p.linkOff, 500) } }]); }),
      saveContent: wrap(async (sec, value) => {
        needAdmin();
        const path = sec === "mercado" ? "reservado/mercado" : sec === "notas" ? "mestre/notas" : "conteudo/" + sec;
        const data = { v: value, em: now() };
        if (sec === "vagas") data.ids = value.map(v => v.id);
        await store.batch([{ path, data }]);
      }),
      saveImage: wrap(async (dataUrl) => {
        needAdmin();
        if (String(dataUrl).length > 950000) fail("A foto ficou grande demais. Tente uma imagem menor.");
        const id = rid();
        await store.batch([{ path: "imagens/" + id, data: { data: dataUrl, em: now() } }]);
        imgCache["db:imagens/" + id] = dataUrl;
        return "db:imagens/" + id;
      })
    }
  };

  api.ready = (async () => {
    if (FB) {
      await loadScript(`https://www.gstatic.com/firebasejs/${FB_VERSION}/firebase-app-compat.js`);
      await loadScript(`https://www.gstatic.com/firebasejs/${FB_VERSION}/firebase-auth-compat.js`);
      await loadScript(`https://www.gstatic.com/firebasejs/${FB_VERSION}/firebase-firestore-compat.js`);
      const fb = window.firebase;
      fb.initializeApp(CFG.firebase);
      const fa = fb.auth(); fa.languageCode = "pt";
      store = fbStore(fb.firestore()); auth = fbAuth(fa);
    } else { store = demoStore(); auth = demoAuth(); }
    startPublic();
    await new Promise(res => { let first = true; auth.onChange(u => { onAuth(u); if (first) { first = false; res(); } }); });
  })().catch(e => { console.error(e); api.loadError = "Não foi possível conectar ao servidor. Confira a configuração em js/config.js."; S.loaded = true; emit(); });

  window.VB = api;
})();
