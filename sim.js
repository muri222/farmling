// Simulacao do fazendeiro e do mundo ao redor. 1 step = 1 mes. Tudo sai do seed (s.rng), entao e reproduzivel.
// Mundo persistente: o povo da vila (nasce, casa, tem filhos, morre, chega e vai embora) continua quando o fazendeiro morre e outro comeca.
// O fazendeiro aprende sozinho: cada decisao (comprar bicho, ferramenta, terra, conviver...) vira uma aposta cujo resultado, 10 meses depois,
// atualiza s.q (bandido multi-bracos com softmax). Esse conhecimento passa de uma vida pra outra.
const Sim = (() => {
  const H = ['Zé', 'Tonho', 'Chico', 'Bento', 'Juca', 'Nico', 'Tião', 'Dito', 'Quim', 'Lau', 'Neco', 'Zeca', 'Duda', 'Beto', 'Caio', 'Mário'];
  const M = ['Rosa', 'Dita', 'Lia', 'Nena', 'Cida', 'Tuca', 'Zefa', 'Ana', 'Maria', 'Flor', 'Lurdes', 'Nina', 'Sol', 'Bia', 'Cléo', 'Vera'];
  const OCUP = ['padeiro', 'professor', 'ferreiro', 'costureiro', 'pescador', 'curandeiro', 'leiteiro', 'carpinteiro', 'feirante', 'músico', 'ferroviário', 'sapateiro'];
  const PAPEIS = ['viajante cansado', 'vendedor de sementes', 'artista de circo', 'curandeiro', 'forasteiro misterioso', 'professor aposentado', 'cigano', 'pescador da cidade', 'músico andarilho', 'engenheiro perdido'];
  // [texto, efeito no otimismo, efeito no dinheiro]
  const ACASO = [
    ['Choveu a semana inteira', 0.02, 0], ['O trator quebrou', -0.04, -60],
    ['Ganhou a rifa da igreja', 0.05, 80], ['Uma geada queimou parte da roça', -0.05, -40],
    ['Viu uma estrela cadente', 0.04, 0], ['Teve festa junina na vila', 0.05, -10],
    ['O cachorro sumiu três dias e voltou', 0.03, 0], ['Achou uma moeda antiga arando a terra', 0.03, 20],
    ['Passou a noite olhando o céu', 0.02, 0], ['Uma enchente levou parte da cerca', -0.03, -25],
  ];
  // eventos fora do padrao: o nome da cena tambem diz qual efeito visual a tela desenha
  const CENAS = {
    tempestade: { txt: ['Uma tempestade enorme caiu do nada', 'Trovões sacudiram a roça a noite toda'], d: -0.02, $: -30, dur: 2 },
    neve: { txt: ['Nevou na roça, coisa nunca vista por aqui', 'Amanheceu tudo branco de neve'], d: 0.03, $: -10, dur: 2 },
    nevoa: { txt: ['Uma névoa espessa cobriu tudo e os bichos ficaram inquietos'], d: -0.01, $: 0, dur: 2 },
    arcoiris: { txt: ['Um arco-íris duplo apareceu depois da chuva'], d: 0.05, $: 0, dur: 2 },
    ovni: { txt: ['Uma luz estranha desceu do céu e pairou sobre o celeiro', 'Algo prateado passou zunindo e sumiu'], d: 0, $: 0, dur: 1 },
    festival: { txt: ['A vila fez um festival e todo mundo foi dançar'], d: 0.06, $: -25, dur: 2 },
    eclipse: { txt: ['O dia virou noite por alguns minutos: um eclipse'], d: 0, $: 0, dur: 1 },
    fogos: { txt: ['Fogos de artifício estouraram sem motivo aparente'], d: 0.04, $: -15, dur: 1 },
    estrelas: { txt: ['Uma chuva de estrelas cadentes riscou o céu a noite inteira'], d: 0.05, $: 0, dur: 1 },
    sonho: { txt: ['Teve um sonho tão vivo que acordou sem saber qual vida era a sua'], d: 0.02, $: 0, dur: 1 },
  };
  const SONHOS = ['ver o mar uma vez', 'ter a maior roça da região', 'tocar sanfona numa festa', 'construir uma casa de dois andares', 'conhecer a capital', 'deixar uma família grande'];
  const MEDOS = ['trovoada', 'ficar sozinho', 'a seca', 'perder a terra', 'escuro', 'cobra'];
  const MANIAS = ['fala com as galinhas', 'assobia ao acordar', 'confere a cerca três vezes', 'guarda moedas numa lata', 'conta as estrelas', 'cheira a terra antes de plantar'];
  const PASSADOS = ['já foi marinheiro por um verão', 'perdeu uma aposta e ganhou uma vaca', 'viu o pai plantar a primeira muda', 'fugiu de casa aos dez anos e voltou no dia seguinte', 'aprendeu a ler sozinho', 'foi salvo de um rio por um cachorro'];
  const MOTIVOS = ['a cerca da divisa', 'as galinhas que invadiram a horta', 'um empréstimo não pago', 'uma fofoca sobre a colheita', 'uma aposta perdida', 'o preço de um bezerro'];
  // bichos: custo, vida e idade adulta em meses; gest = meses de gestacao; cria = [min, max] por parto; prod = $/mes de cada adulto (pf: so as femeas);
  // come = unidades de comida; menor = ave (nao vira manchete); pet = nao e vendido; presa = raposa pega
  const ESP = {
    galinha: { n: 'galinha', pl: 'galinhas', fi: 'pintinho', art: 'uma', custo: 20, vida: 84, ad: 5, gest: 1, cria: [2, 5], prod: 1.3, pf: true, come: 1, venda: 12, pCria: .22, menor: 1, presa: 1 },
    pato: { n: 'pato', pl: 'patos', fi: 'patinho', art: 'um', custo: 18, vida: 84, ad: 5, gest: 1, cria: [2, 4], prod: 1.1, pf: true, come: 1, venda: 10, pCria: .2, menor: 1, presa: 1 },
    porco: { n: 'porco', pl: 'porcos', fi: 'leitão', art: 'um', custo: 90, vida: 120, ad: 8, gest: 4, cria: [2, 4], prod: 0, come: 3, venda: 130, pCria: .12 },
    cabra: { n: 'cabra', pl: 'cabras', fi: 'cabrito', art: 'uma', custo: 80, vida: 132, ad: 10, gest: 5, cria: [1, 2], prod: 4, pf: true, come: 2, venda: 70, pCria: .1, presa: 1 },
    ovelha: { n: 'ovelha', pl: 'ovelhas', fi: 'cordeiro', art: 'uma', custo: 90, vida: 132, ad: 12, gest: 5, cria: [1, 2], prod: 5, come: 2, venda: 80, pCria: .1 },
    vaca: { n: 'vaca', pl: 'vacas', fi: 'bezerro', art: 'uma', custo: 260, vida: 240, ad: 24, gest: 9, cria: [1, 1], prod: 11, pf: true, come: 6, venda: 230, pCria: .08 },
    cavalo: { n: 'cavalo', pl: 'cavalos', fi: 'potro', art: 'um', custo: 450, vida: 300, ad: 36, gest: 11, cria: [1, 1], prod: 0, come: 6, venda: 380, pCria: .06 },
    cachorro: { n: 'cachorro', pl: 'cachorros', fi: 'filhote', art: 'um', custo: 0, vida: 180, ad: 8, gest: 2, cria: [2, 4], prod: 0, come: 1, venda: 0, pCria: .05, pet: 1 },
    gato: { n: 'gato', pl: 'gatos', fi: 'gatinho', art: 'um', custo: 0, vida: 180, ad: 8, gest: 2, cria: [2, 4], prod: 0, come: 1, venda: 0, pCria: .05, pet: 1 },
  };
  const COMPRAVEIS = ['galinha', 'pato', 'porco', 'cabra', 'ovelha', 'vaca', 'cavalo'];
  const ACOES = { ferramentas: 'investir em ferramentas', galinha: 'criar galinhas', pato: 'criar patos', porco: 'criar porcos', cabra: 'criar cabras', ovelha: 'criar ovelhas',
    vaca: 'criar vacas', cavalo: 'ter um cavalo', terra: 'comprar mais terra', socializar: 'conviver com a vila', poupar: 'poupar' };
  const ESTACAO = ['primavera', 'verão', 'outono', 'inverno'], CRESC = [1, 1.2, .9, .45], RENDA = [1, 1.1, 1, .7];

  let LANG = 'pt';
  const lt = () => LANG === 'en' ? 'in English' : 'em português do Brasil'; // idioma pedido a IA
  const rnd = s => { // mulberry32 com o estado guardado no save
    s.rng = (s.rng + 0x6D2B79F5) | 0;
    let t = s.rng;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pick = (s, a) => a[Math.floor(rnd(s) * a.length)];
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const est = s => ((s.mes % 12) / 3) | 0;
  const vivos = s => s.povo.filter(p => p.vivo);
  const ocupDe = p => p.fem ? p.ocup.replace(/eiro$/, 'eira').replace(/or$/, 'ora').replace(/o$/, 'a') : p.ocup;
  const perfilAleat = s => ({ sonho: pick(s, SONHOS), medo: pick(s, MEDOS), mania: pick(s, MANIAS), passado: pick(s, PASSADOS) });
  const NOMES_BICHO = ['Mimosa', 'Estrela', 'Bidu', 'Rex', 'Mel', 'Pipoca', 'Trovão', 'Nuvem', 'Fumaça', 'Princesa', 'Belinha', 'Caramelo', 'Sultão', 'Dengo', 'Tico', 'Lua', 'Pingo', 'Mansa', 'Valente', 'Fofa', 'Marrom', 'Jade', 'Thor', 'Bolinha'];
  // bicho de criacao grande e bicho de estimacao tem nome; ave quase nunca
  const novoBicho = (s, e, fem, idade) => ({ id: ++s.proxId, e, fem, idade: idade ?? ESP[e].ad + 1 + rnd(s) * 8, prenhez: 0, nome: ESP[e].menor && rnd(s) > .12 ? null : pick(s, NOMES_BICHO) });

  function novoNpc(s, o = {}) {
    const fem = o.fem ?? rnd(s) < .5, usados = new Set(s.povo.filter(p => p.vivo).map(p => p.nome));
    let nome = o.nome;
    for (let i = 0; !nome && i < 8; i++) { const n = pick(s, fem ? M : H); if (!usados.has(n)) nome = n; }
    nome ||= pick(s, fem ? M : H);
    return { id: ++s.proxId, nome, fem, idade: o.idade ?? 18 + rnd(s) * 40, casado: o.casado ?? null, ocup: pick(s, OCUP), cor: Math.floor(rnd(s) * 360), simp: rnd(s), vivo: true, pais: o.pais || null };
  }
  function nasce(s, antigo) {
    // a personalidade nova e sorteada, com um restinho (20%) da vida anterior
    const t = k => clamp(rnd(s) * 0.8 + (antigo ? antigo.traits[k] * 0.2 : 0.1));
    const usados = new Set(vivos(s).map(p => p.nome));
    let nome = pick(s, H); for (let i = 0; usados.has(nome) && i < 8; i++) nome = pick(s, H);
    s.vida = {
      nome, idade: 18, dinheiro: 60, terra: 1, plantio: 0, ferramentas: 0,
      traits: { otimismo: t('otimismo'), humor: t('humor'), fe: t('fe'), ambicao: t('ambicao') },
      par: null, amores: [], filhos: [], maxFilhos: pick(s, [1, 1, 2, 2, 3, 4]),
      amigos: [], rel: {}, social: 0, bichos: [], pend: [], log: [], falas: [], licoes: [], perfil: perfilAleat(s), morteEm: 60 + rnd(s) * 30,
    };
    s.vida.bichos.push(novoBicho(s, 'galinha', true, 8), novoBicho(s, 'galinha', false, 8));
    s.vida.animais = 2;
  }
  function novo(seed) {
    const s = { rng: seed | 0, ciclo: 1, ecos: [], mes: 0, proxId: 0, povo: [], q: {}, n: {}, rm: 0, sabedoria: [], evento: null, visitante: null, hist: [], chat: [], memUsuario: [], nChat: 0 };
    for (const a of Object.keys(ACOES)) s.q[a] = 0;
    s.q.galinha = .15; s.q.ferramentas = .1;
    for (let i = 0; i < 9; i++) s.povo.push(novoNpc(s, { idade: 18 + rnd(s) * 45 }));
    for (let k = 0; k < 2; k++) { // dois casais de comeco
      const m = s.povo.find(p => !p.fem && !p.casado && p.idade > 22), f = s.povo.find(p => p.fem && !p.casado && p.idade > 20);
      if (m && f) { m.casado = f.id; f.casado = m.id; }
    }
    nasce(s);
    return s;
  }
  function migra(s) { // saves antigos ganham os campos novos
    s.mes ??= 0; s.hist ??= []; s.chat ??= []; s.memUsuario ??= []; s.nChat ??= 0; s.proxId ??= 1000; s.q ??= {}; s.n ??= {}; s.rm ??= 0; s.sabedoria ??= []; s.evento ??= null; s.visitante ??= null;
    for (const a of Object.keys(ACOES)) s.q[a] ??= 0;
    if (!s.povo) { s.povo = []; for (let i = 0; i < 9; i++) s.povo.push(novoNpc(s, { idade: 18 + rnd(s) * 45 })); }
    const v = s.vida;
    v.rel ??= {}; v.social ??= 0; v.pend ??= []; v.licoes ??= []; v.ferramentas ??= 0; v.perfil ??= perfilAleat(s); v.amigos ??= [];
    if (!v.bichos) { v.bichos = []; for (let i = 0; i < (v.animais || 0); i++) v.bichos.push(novoBicho(s, i % 3 === 2 ? 'vaca' : 'galinha', i % 2 === 0)); }
    v.filhos.forEach(f => { f.fem ??= rnd(s) < .5; f.id ??= ++s.proxId; });
    v.bichos.forEach(b => { if (b.nome === undefined) b.nome = ESP[b.e].menor && b.id % 8 ? null : NOMES_BICHO[b.id % NOMES_BICHO.length]; });
    if (v.par && v.par.id == null) v.par.id = null;
    return s;
  }

  const patr = v => v.bichos.reduce((a, b) => a + (b.idade >= ESP[b.e].ad ? (ESP[b.e].venda || ESP[b.e].custo) : ESP[b.e].custo * .4), 0);
  const score = v => v.dinheiro + patr(v) + v.terra * 350 + v.filhos.length * 60 + (v.par ? 80 : 0) + v.amigos.length * 25 - Object.values(v.rel).filter(r => r.rival).length * 25 + v.traits.otimismo * 120 + v.ferramentas * 100;
  const carga = v => v.bichos.reduce((a, b) => a + ESP[b.e].come * (b.idade < ESP[b.e].ad ? .5 : 1), 0);
  const capacidade = v => 4 + v.terra * 5;
  const temBicho = (v, e) => v.bichos.some(b => b.e === e);

  // ---------------- bichos: nascem, crescem, produzem, adoecem, morrem ----------------
  function bichos(s, v, e) {
    const cap = capacidade(v), nasc = [], morr = new Set(), temCao = temBicho(v, 'cachorro');
    let renda = 0;
    const machos = k => v.bichos.some(b => b.e === k && !b.fem && b.idade >= ESP[k].ad);
    for (const b of v.bichos) {
      const X = ESP[b.e]; b.idade++;
      const adulto = b.idade >= X.ad;
      if (b.prenhez > 0 && --b.prenhez === 0) {
        const n = X.cria[0] + Math.floor(rnd(s) * (X.cria[1] - X.cria[0] + 1));
        for (let i = 0; i < n; i++) nasc.push(novoBicho(s, b.e, rnd(s) < .5, 0));
        if (!X.menor || n > 3) e('bom', `${n > 1 ? 'Nasceram' : 'Nasceu'} ${n === 1 ? 'um ' + X.fi : n + ' ' + X.fi + 's'}`, .02);
      } else if (adulto && b.fem && !b.prenhez && machos(b.e) && carga(v) < cap * 1.1 && v.bichos.length + nasc.length < 40 && rnd(s) < X.pCria) b.prenhez = X.gest;
      if (adulto && (b.fem || !X.pf)) renda += X.prod;
      if (b.idade > X.vida ? rnd(s) < .15 + (b.idade - X.vida) / X.vida : rnd(s) < .003 * (1 + (carga(v) > cap ? 1.5 : 0))) {
        morr.add(b.id); if (!X.menor) e('ruim', b.idade > X.vida ? `${X.n[0].toUpperCase() + X.n.slice(1)} morreu de velhice` : `${X.art[0].toUpperCase() + X.art.slice(1)} ${X.n} adoeceu e não resistiu`, -.02);
      } else if (X.presa && !temCao && rnd(s) < .004) { morr.add(b.id); e('ruim', `Uma raposa levou ${X.art} ${X.n}`, -.02); }
    }
    v.bichos = v.bichos.filter(b => !morr.has(b.id)).concat(nasc);
    while (v.bichos.length > 36) { // sem espaço: as crias mais novas vão pra vizinhança
      const novo = v.bichos.filter(b => !ESP[b.e].pet).sort((x, y) => x.idade - y.idade)[0]; if (!novo) break;
      v.bichos.splice(v.bichos.indexOf(novo), 1);
    }
    let c = carga(v);
    if (c > cap) { // sobrou bicho: vende primeiro os machos e os mais velhos
      const vend = v.bichos.filter(b => !ESP[b.e].pet && b.idade >= ESP[b.e].ad && !b.prenhez).sort((a, b) => (a.fem - b.fem) || b.idade - a.idade);
      for (const b of vend) {
        if (c <= cap) break;
        v.dinheiro += ESP[b.e].venda * .6; c -= ESP[b.e].come; v.bichos.splice(v.bichos.indexOf(b), 1);
        if (!ESP[b.e].menor) e('bom', `Vendeu ${ESP[b.e].art} ${ESP[b.e].n} pra não faltar comida`, .01);
      }
    }
    if (c > cap * 1.25 && rnd(s) < .3) {
      const fraco = v.bichos.filter(b => !ESP[b.e].pet).sort((a, b) => b.idade - a.idade)[0];
      if (fraco) { v.bichos.splice(v.bichos.indexOf(fraco), 1); e('ruim', `Faltou comida e ${ESP[fraco.e].art} ${ESP[fraco.e].n} não aguentou`, -.03); }
    }
    v.dinheiro += renda * (1 + v.amigos.length * .02) - carga(v) * .6;
    if (!temCao && rnd(s) < .008) { v.bichos.push(novoBicho(s, 'cachorro', rnd(s) < .5)); e('bom', 'Um cachorro vira-lata adotou a roça', .03); }
    if (!temBicho(v, 'gato') && rnd(s) < .008) { v.bichos.push(novoBicho(s, 'gato', rnd(s) < .5)); e('bom', 'Um gato apareceu e ficou pra caçar os ratos', .02); }
  }

  // ---------------- decisoes aprendidas ----------------
  function decide(s, v, e) {
    if (rnd(s) > .35) return;
    const din = v.dinheiro, cap = capacidade(v), c = carga(v), opc = [];
    if (din >= 80 + 40 * v.ferramentas && v.ferramentas < 5) opc.push('ferramentas');
    for (const k of COMPRAVEIS) if (din >= ESP[k].custo + 60 && c + ESP[k].come <= cap && v.bichos.length < 40) opc.push(k);
    if (v.terra < 5 && din >= 400 * v.terra + 100) opc.push('terra');
    opc.push('socializar', 'poupar');
    let a;
    if (rnd(s) < .2) a = pick(s, opc);
    else {
      const w = opc.map(k => Math.exp((s.q[k] || 0) / .3));
      let r = rnd(s) * w.reduce((x, y) => x + y, 0);
      a = opc[opc.length - 1];
      for (let i = 0; i < opc.length; i++) { if ((r -= w[i]) <= 0) { a = opc[i]; break; } }
    }
    if (a === 'ferramentas') { v.dinheiro -= 80 + 40 * v.ferramentas; v.ferramentas++; e('bom', 'Investiu em ferramentas melhores', .02); }
    else if (a === 'terra') { v.dinheiro -= 400 * v.terra; v.terra++; e('bom', 'Comprou mais um pedaço de terra', .03); }
    else if (a === 'socializar') { v.dinheiro -= 5; v.social = 4; e('gente', 'Foi à feira e puxou conversa com todo mundo', .01); }
    else if (ESP[a]) {
      const X = ESP[a], nF = v.bichos.filter(b => b.e === a && b.fem).length, nM = v.bichos.filter(b => b.e === a && !b.fem).length;
      if (!nF && !nM && din >= 2 * X.custo + 60 && c + 2 * X.come <= cap) { v.bichos.push(novoBicho(s, a, true), novoBicho(s, a, false)); v.dinheiro -= 2 * X.custo; e('bom', `Comprou um casal de ${X.pl}`, .02); }
      else { v.bichos.push(novoBicho(s, a, !nF ? true : !nM ? false : rnd(s) < .7)); v.dinheiro -= X.custo; e('bom', `Comprou ${X.art} ${X.n}`, .02); }
    }
    v.pend.push({ a, mes: s.mes, base: score(v) });
  }
  function recompensas(s, v) { // 10 meses depois, o resultado ensina
    const prontos = v.pend.filter(p => s.mes - p.mes >= 10);
    v.pend = v.pend.filter(p => s.mes - p.mes < 10);
    for (const p of prontos) {
      const r = clamp((score(v) - p.base) / (150 + Math.abs(p.base) * .15), -1, 1);
      s.q[p.a] += .25 * ((r - s.rm) - s.q[p.a]);
      s.rm = s.rm * .97 + r * .03; s.n[p.a] = (s.n[p.a] || 0) + 1;
    }
  }
  const aprendizado = s => Object.keys(ACOES).filter(a => (s.n[a] || 0) >= 2).sort((a, b) => s.q[b] - s.q[a]);
  const insight = s => { const l = aprendizado(s); return l.length ? `${ACOES[l[0]]} costuma dar bom resultado` + (l.length > 2 ? `, e ${ACOES[l[l.length - 1]]} quase nunca vale a pena` : '') : 'ainda está descobrindo o que funciona'; };

  // ---------------- o povo da vila ----------------
  function mundo(s, v, e) {
    for (const p of s.povo) {
      if (!p.vivo) continue;
      p.idade += 1 / 12;
      if (rnd(s) < (p.idade > 62 ? (p.idade - 60) / 600 : .0003)) {
        p.vivo = false;
        if (p.casado && p.casado !== 'F') { const o = s.povo.find(x => x.id === p.casado); if (o) o.casado = null; }
        if (v.rel[p.id]) e('ruim', `${p.nome} faleceu`, -.05);
      }
    }
    s.povo = s.povo.filter(p => p.vivo || v.rel[p.id]); // mortos conhecidos ficam um tempo na memoria
    if (s.povo.length > 60) s.povo = s.povo.filter(p => p.vivo);
    const vv = vivos(s);
    const solt = vv.filter(p => !p.casado && p.idade >= 18);
    if (rnd(s) < .03) {
      const m = pick(s, solt.filter(p => !p.fem).concat([null])), f = m && solt.filter(p => p.fem && Math.abs(p.idade - m.idade) < 15);
      if (m && f.length) {
        const w = pick(s, f); m.casado = w.id; w.casado = m.id;
        if (v.rel[m.id] || v.rel[w.id]) { e('gente', `${m.nome} e ${w.nome} se casaram na vila`, .03); festa(s, 'Casamento na vila: música e dança até de manhã'); }
      }
    }
    for (const f of vv) { // nascimentos
      if (f.fem && f.casado && f.casado !== 'F' && f.idade > 18 && f.idade < 42 && vv.length < 22 && rnd(s) < .004) {
        const pai = s.povo.find(x => x.id === f.casado), k = novoNpc(s, { idade: 0, pais: [f.id, f.casado] });
        s.povo.push(k);
        if (v.rel[f.id]) e('gente', `${f.nome} teve um bebê${pai ? ', filho de ' + pai.nome : ''}`, .03);
      }
    }
    if (vv.length < 10 && rnd(s) < .04) { const p = novoNpc(s, { idade: 18 + rnd(s) * 30 }); s.povo.push(p); }
    const eleg = vv.filter(p => p.fem && !p.casado && p.idade >= 16 && p.idade <= 45).length; // a vila sempre recebe gente nova pra ele conhecer
    if (eleg < 2 && vv.length < 20 && rnd(s) < .05) { const p = novoNpc(s, { fem: true, idade: 18 + rnd(s) * 14 }); s.povo.push(p); e('gente', `Chegou na vila ${p.nome}, ${ocupDe(p)}`); }
    if (vv.length > 7 && rnd(s) < .003) { const p = pick(s, vv.filter(x => x.idade > 18 && x.casado !== 'F' && !v.rel[x.id])); if (p) p.vivo = false; }
  }
  function festa(s, txt) { if (!s.evento) s.evento = { cena: 'festival', txt, fim: s.mes + 2 }; }

  function relacoes(s, v, e) {
    const vv = vivos(s);
    const desc = vv.filter(p => p.idade >= 12 && !v.rel[p.id] && p.casado !== 'F');
    if (desc.length && rnd(s) < .1 + (v.social > 0 ? .25 : 0)) {
      const p = pick(s, desc); v.rel[p.id] = { af: clamp(-.35 + rnd(s) * .7 + (p.simp - .5) * .3, -1, 1), t: s.mes };
      e('gente', `Conheceu ${p.nome}, ${ocupDe(p)}`, .02);
    }
    if (v.social > 0) v.social--;
    const conhecidos = vv.filter(p => v.rel[p.id]);
    for (let i = 0; i < Math.min(3, conhecidos.length); i++) {
      const p = pick(s, conhecidos), r = v.rel[p.id];
      r.af = clamp(r.af + (rnd(s) - .5) * .16 + (v.traits.humor - .5) * .03 + (p.simp - .5) * .03 + (r.rival ? .012 : 0), -1, 1);
      if (r.af >= .5 && !r.amigo) { r.amigo = true; r.rival = false; e('gente', `${p.nome} virou ${p.fem ? 'amiga' : 'amigo'}`, .04); }
      else if (r.af <= -.5 && !r.rival) { r.rival = true; r.amigo = false; r.motivo = pick(s, MOTIVOS); e('ruim', `Desavença com ${p.nome} por causa de ${r.motivo}`, -.06); }
      else if (r.rival && r.af > -.2) { r.rival = false; e('bom', `Fez as pazes com ${p.nome}`, .05); }
      else if (r.amigo && r.af < .2) r.amigo = false;
      if (r.rival && rnd(s) < .03) { // rival apronta
        v.dinheiro = Math.max(0, v.dinheiro - 15 - rnd(s) * 25);
        e('ruim', pick(s, [`${p.nome} espalhou uma fofoca sobre a roça`, `${p.nome} soltou os bichos por vingança`, `${p.nome} cobrou uma dívida antiga na frente de todos`]), -.04);
      }
    }
    if (!v.par && v.idade >= 18 && v.idade < 55) { // solteiro: corteja quem conhece e procura companhia
      const alvos = conhecidos.filter(p => p.fem && !p.casado && p.idade >= 16 && p.idade <= 50 && v.rel[p.id].af > -.3);
      if (alvos.length && rnd(s) < .15) {
        const p = pick(s, alvos), r = v.rel[p.id]; r.af = clamp(r.af + .06, -1, 1);
        if (!r.corte && r.af > .1) { r.corte = true; e('amor', `Está de olho em ${p.nome}`, .03); }
      }
      if (v.idade > 24 && s.mes % 8 === 0) v.social = Math.max(v.social, 3);
    }
    v.amigos = vv.filter(p => v.rel[p.id]?.amigo).map(p => p.nome);
  }

  function amor(s, v, e) {
    const r = rnd(s), npc = v.par && s.povo.find(p => p.id === v.par.id);
    if (!v.par) {
      if (v.amores.length < 2 && v.idade < 60 && r < .08) {
        const cand = vivos(s).filter(p => p.fem && !p.casado && p.idade >= 16 && p.idade <= 50 && v.rel[p.id]?.af >= .35 && !v.amores.includes(p.nome));
        if (cand.length) { const p = pick(s, cand); v.par = { nome: p.nome, id: p.id, casados: false }; v.amores.push(p.nome); p.casado = 'F'; e('amor', `Se apaixonou por ${p.nome}`, .08); }
      }
    } else if (!v.par.casados) {
      if (r < .06) { v.par.casados = true; e('amor', `Casou com ${v.par.nome}`, .1); festa(s, `Casamento de ${v.nome} e ${v.par.nome}`); }
      else if (r < .075) { e('ruim', `O namoro com ${v.par.nome} acabou`, -.1); if (npc) npc.casado = null; v.par = null; }
    } else if (v.filhos.length < v.maxFilhos && v.idade < 55 && r < .015) {
      const fem = rnd(s) < .5, f = { id: ++s.proxId, nome: pick(s, fem ? M : H), fem, idade: 0, mae: v.par.nome };
      v.filhos.push(f); e('filho', `Nasceu ${f.nome}, ${fem ? 'filha' : 'filho'} de ${v.par.nome}`, .12);
    } else if (r > .9985) {
      e('ruim', v.par.nome + pick(s, [' foi embora pra cidade', ' adoeceu e partiu']), -.15);
      if (npc) npc.vivo = false;
      v.par = null;
    }
    for (const f of v.filhos) {
      f.idade += 1 / 12;
      if (!f.fora && f.idade >= 18) { // vira gente da vila
        f.fora = true; const k = novoNpc(s, { nome: f.nome, fem: f.fem, idade: f.idade, pais: ['F'] }); s.povo.push(k); f.npc = k.id;
        e('filho', `${f.nome} cresceu e foi morar na vila`, -.02);
      }
    }
  }

  function eventos(s, v, e) {
    const es = est(s);
    if (s.evento && s.evento.fim <= s.mes) s.evento = null;
    if (rnd(s) < .03) { const [txt, d, $] = pick(s, ACASO); v.dinheiro = Math.max(0, v.dinheiro + $); e(d < 0 ? 'ruim' : 'bom', txt, d); }
    if (es === 3 && rnd(s) < .03) { v.dinheiro = Math.max(0, v.dinheiro - 25); e('ruim', 'Uma geada forte castigou a roça', -.04); }
    if (es === 1 && rnd(s) < .025) { v.dinheiro = Math.max(0, v.dinheiro - 30); e('ruim', 'A seca apertou e a roça sofreu', -.04); }
    if (!s.evento && rnd(s) < .015) {
      const k = pick(s, Object.keys(CENAS)), c = CENAS[k], txt = pick(s, c.txt);
      s.evento = { cena: k, txt, fim: s.mes + c.dur + 1 }; v.dinheiro = Math.max(0, v.dinheiro + c.$);
      e('estranho', txt, c.d, { cena: k });
    }
    if (s.visitante && s.visitante.fim <= s.mes) { e('gente', `${s.visitante.nome} seguiu viagem`); s.visitante = null; }
    else if (!s.visitante && rnd(s) < .012) {
      const fem = rnd(s) < .5, nome = pick(s, fem ? M : H), papel = pick(s, PAPEIS);
      s.visitante = { nome, papel, fem, cor: Math.floor(rnd(s) * 360), fim: s.mes + 3 + Math.floor(rnd(s) * 4) };
      e('gente', `Chegou ${nome}, ${papel}`, .03, { visitante: true });
    }
  }

  function step(s) {
    const v = s.vida, ev = [];
    const e = (tipo, txt, d = 0, extra) => {
      const o = { tipo, txt, ...extra }; ev.push(o);
      v.log.push(Math.floor(v.idade) + ' anos: ' + txt);
      if (v.log.length > 12) v.log.shift();
      v.traits.otimismo = clamp(v.traits.otimismo + d);
      return o;
    };
    s.mes++;
    const es = est(s);
    v.idade += 1 / 12;
    const k = pick(s, ['humor', 'fe', 'ambicao']); // personalidade muda devagar
    v.traits[k] = clamp(v.traits[k] + (rnd(s) - 0.5) * 0.03);

    // roça: colhe a cada ~4 meses (as estacoes mexem no ritmo e no rendimento)
    v.plantio += 0.25 * CRESC[es];
    if (v.plantio >= 1) {
      v.plantio = 0;
      const sorte = rnd(s);
      const mult = (0.3 + sorte * 1.4) * RENDA[es] * (1 + v.ferramentas * .08) * (1 + v.amigos.length * .02) * (temBicho(v, 'cavalo') ? 1.06 : 1);
      const ganho = Math.round((30 + v.terra * 40) * mult);
      v.dinheiro += ganho;
      if (sorte < 0.1) e('ruim', 'A colheita foi fraca, quase nada vingou', -0.05);
      else if (sorte > 0.92) e('bom', 'Colheita farta! Rendeu $' + ganho, 0.05);
    }
    v.dinheiro = Math.max(0, v.dinheiro - 10 - v.filhos.length * 5);

    bichos(s, v, e);
    decide(s, v, e);
    mundo(s, v, e);
    relacoes(s, v, e);
    amor(s, v, e);
    eventos(s, v, e);
    recompensas(s, v);
    v.dinheiro = Math.max(0, v.dinheiro);
    v.animais = v.bichos.length;

    if (v.idade >= v.morteEm) {
      s.ecos.push(`${v.nome}: viveu ${Math.floor(v.idade)} anos, ` +
        (v.amores.length ? 'amou ' + v.amores.join(' e ') : 'nunca se apaixonou') +
        `, ${v.filhos.length} filho(s), ${v.terra} pedaço(s) de terra`);
      if (s.ecos.length > 5) s.ecos.shift();
      if (v.licoes.length) { s.sabedoria.push(v.licoes[v.licoes.length - 1]); if (s.sabedoria.length > 6) s.sabedoria.shift(); }
      const parNpc = v.par && s.povo.find(p => p.id === v.par.id); if (parNpc) parNpc.casado = null;
      for (const f of v.filhos) if (!f.fora) s.povo.push(novoNpc(s, { nome: f.nome, fem: f.fem, idade: f.idade, pais: ['F'] })); // orfaos ficam na vila
      ev.push({ tipo: 'morte', txt: `${v.nome} descansou aos ${Math.floor(v.idade)} anos` });
      s.ciclo++;
      nasce(s, v);
      ev.push({ tipo: 'nasce', txt: `Vida nº ${s.ciclo}: ${s.vida.nome} começa sua roça` });
    }
    return ev;
  }

  // ---------------- textos pra IA e pra tela ----------------
  const lado = (x, lo, hi) => (x < 0.35 ? lo : x > 0.65 ? hi : null);
  function persona(v) {
    const t = v.traits;
    return [lado(t.otimismo, 'melancólico', 'otimista'), lado(t.humor, 'sério', 'brincalhão'),
      lado(t.fe, 'cético', 'místico'), lado(t.ambicao, 'sossegado', 'ambicioso')].filter(Boolean).join(', ') || 'equilibrado';
  }
  const familia = v =>
    (v.par ? (v.par.casados ? 'casado com ' : 'namorando ') + v.par.nome : 'sozinho') +
    (v.filhos.length ? '; filhos: ' + v.filhos.map(f => `${f.nome} (${Math.floor(f.idade)})`).join(', ') : '; sem filhos');
  const familiaIA = v => (v.par ? (v.par.casados ? `casado com ${v.par.nome}` : `namorando ${v.par.nome}`) : 'solteiro, ainda procurando alguém para formar família') +
    (v.filhos.length ? `; filhos: ${v.filhos.map(f => `${f.nome} (${Math.floor(f.idade)})`).join(', ')}` : '; ainda sem filhos, mas sonha em ter');
  function bichosTxt(v) {
    const c = {};
    for (const b of v.bichos) {
      const X = ESP[b.e], jovem = b.idade < X.ad, k = (jovem ? X.fi : X.n) + '|' + (jovem ? X.fi + 's' : X.pl);
      c[k] = (c[k] || 0) + 1;
    }
    return Object.entries(c).map(([k, n]) => { const [si, pl] = k.split('|'); return `${n} ${n === 1 ? si : pl}`; }).join(', ') || 'nenhum';
  }
  const gentes = (s, v, f) => vivos(s).filter(p => v.rel[p.id] && f(v.rel[p.id])).map(p => p.nome);
  const amigosTxt = (s, v) => gentes(s, v, r => r.amigo).join(', ') || 'nenhum ainda';
  const rivaisTxt = (s, v) => vivos(s).filter(p => v.rel[p.id]?.rival).map(p => `${p.nome} (por causa de ${v.rel[p.id].motivo})`).join(', ') || 'ninguém';
  const humor = v => v.traits.otimismo > .6 ? 'animado' : v.traits.otimismo < .35 ? 'abatido' : 'tranquilo';

  // Prompt pra mini IA local: persona + memoria + relacoes + o que aprendeu + resquicios das vidas passadas
  function prompt(s) {
    const v = s.vida, P = v.perfil || {};
    const tema = pick({ rng: (Math.random() * 2 ** 32) | 0 }, [
      'algo que aconteceu hoje na roça', 'uma filosofia de vida que você andou pensando',
      'uma lembrança da sua vida', 'sua família ou a falta dela', 'uma pergunta curiosa pro seu amigo',
      'um sonho estranho que parecia outra vida', 'os bichos ou a terra', 'um medo ou um desejo seu',
      'alguém da vila', 'algo que você aprendeu na prática', 'a estação do ano']);
    return {
      sistema: `Você é ${v.nome}, fazendeiro de ${Math.floor(v.idade)} anos que vive dentro de uma telinha. ` +
        `Você fala com um amigo que te observa do outro lado da tela; o destino juntou vocês. ` +
        `Seu jeito: ${persona(v)}; hoje está ${humor(v)}. ` + (P.sonho ? `Seu sonho: ${P.sonho}. Seu medo: ${P.medo}. Sua mania: ${P.mania}. Seu passado: ${P.passado}. ` : '') +
        `Vida: $${Math.floor(v.dinheiro)}, ${v.terra} pedaço(s) de terra, bichos: ${bichosTxt(v)}, ${familiaIA(v)}. ` +
        `Amigos: ${amigosTxt(s, v)}. Desafetos: ${rivaisTxt(s, v)}. Estação: ${ESTACAO[est(s)]}. ` +
        `O que você aprendeu na prática: ${insight(s)}. ` + (v.licoes.length ? `Lições suas: ${v.licoes.slice(-3).join(' | ')}. ` : '') +
        (s.evento ? `Algo estranho está acontecendo: ${s.evento.txt}. ` : '') +
        (s.visitante ? `${s.visitante.nome}, ${s.visitante.papel}, está visitando você. ` : '') +
        `Acontecimentos recentes: ${v.log.slice(-5).join('; ') || 'nada ainda, acabou de começar'}. ` +
        (s.memUsuario?.length ? `O que você já sabe sobre seu amigo (quem conversa com você): ${s.memUsuario.join(' | ')}. ` : '') +
        (s.sabedoria.length ? `Sabedoria vaga de outras vidas: ${s.sabedoria.join(' | ')}. ` : '') +
        (s.ecos.length ? `Às vezes vêm lembranças vagas, como sonhos, de vidas que não são a sua: ${s.ecos.join(' | ')}. ` : '') +
        `Regras: responda ${lt()}, com UMA fala só, no máximo 130 caracteres, primeira pessoa, jeito simples de gente do campo, ` +
        `sem aspas, sem emoji, sem explicar. Não repita: ${v.falas.join(' / ') || '-'}`,
      pedido: 'Fale sobre: ' + tema,
    };
  }

  // ---- chat: o jogador conversa com o fazendeiro ----
  // O sistema (personalidade e jeito de conversar) e fixo e fica em cache na IA; a [Situação agora] muda e vai junto da mensagem.
  const promptChat = (s, msg, hist) => {
    const v = s.vida, P = v.perfil || {};
    const nomeados = v.bichos.filter(b => b.nome).slice(0, 6).map(b => `${b.nome} (${ESP[b.e].n})`).join(', ');
    const situacao = `[Situação agora: ${ESTACAO[est(s)]}; $${Math.floor(v.dinheiro)}; ${v.terra} pedaço(s) de terra; bichos: ${bichosTxt(v)}${nomeados ? ` (com nome: ${nomeados})` : ''}; ` +
      `família: ${familiaIA(v)}; amigos: ${amigosTxt(s, v)}; desafetos: ${rivaisTxt(s, v)}; ` + (s.evento ? `acontecendo: ${s.evento.txt}; ` : '') +
      (s.visitante ? `visita: ${s.visitante.nome}, ${s.visitante.papel}; ` : '') + `recentes: ${v.log.slice(-3).map(l => l.replace(/^\d+ anos: /, '')).join('; ') || 'nada'}; ` +
      `humor: ${humor(v)}; aprendeu: ${insight(s)}` + (s.memUsuario?.length ? `; sobre o amigo: ${s.memUsuario.join(' | ')}` : '') + ']';
    const anterior = hist?.length ? `[Conversa anterior: ${hist.slice(-6).map(m => `${m.q === 'u' ? 'Amigo' : v.nome}: ${m.x}`).join(' / ')}]\n` : '';
    const sistema = `Você é ${v.nome}, fazendeiro de ${Math.floor(v.idade)} anos. Você mora dentro de uma telinha de computador e conversa com um amigo que olha pra tela ` +
      `(você não sabe o nome dele: chame de "amigo"; nunca o chame pelo seu próprio nome). Seu jeito: ${persona(v)}. ` + (P.sonho ? `Seu sonho: ${P.sonho}. Seu medo: ${P.medo}. Sua mania: ${P.mania}. Seu passado: ${P.passado}. ` : '') +
      `Fale como gente de verdade: direto, caloroso e com humor, em 1 a 3 frases curtas. Primeiro RESPONDA ao que o amigo disse ou perguntou (se ele perguntou sobre você, responda de verdade); ` +
      `só depois, se quiser, acrescente algo da sua vida ou devolva uma pergunta. Use fatos concretos da linha [Situação agora] (bichos pelo nome, gente da vila). ` +
      `Nunca invente bichos, pessoas ou posses. Sem listas, sem aspas, sem emoji. Responda ${lt()}. ` +
      `Você pode se apaixonar, casar e ter filhos um dia; se estiver sozinho, diga que ainda procura alguém.`;
    return { sid: `${v.nome}|${s.ciclo}|${LANG}|${P.sonho || ''}`, sistema, situacao, anterior, fala: msg, max: 90, temp: 0.6 };
  };
  const pedidoMemoria = s => ({ sistema: SIS(), max: 50,
    pedido: `Conversa recente entre o fazendeiro ${s.vida.nome} e seu amigo:\n${s.chat.slice(-10).map(m => `${m.q === 'u' ? 'Amigo' : s.vida.nome}: ${m.x}`).join('\n')}\n` +
      `Escreva UMA frase curta (até 100 caracteres) sobre o que o fazendeiro aprendeu sobre o amigo (gostos, humor, assuntos). Sem aspas.` });
  function respostaPronta(s, msg) { // sem IA: reconhece poucas coisas e senao fala uma fala pronta
    const m = semAcento(msg).toLowerCase(), v = s.vida;
    if (/\b(oi|ola|opa|eae|hello|hi|hey)\b/.test(m)) return `Opa! Que bom te ver por aí, amigo.`;
    if (/(tudo bem|como vai|como voce esta|how are you)/.test(m)) return `Vou levando, ${humor(v)} hoje. E você?`;
    if (/(quem e voce|seu nome|who are you)/.test(m)) return `Sou ${v.nome}, tenho ${Math.floor(v.idade)} anos e vivo dessa roça.`;
    if (/\?/.test(m)) return 'Boa pergunta... deixa eu pensar nisso enquanto cuido da terra.';
    return falaPronta(s);
  }

  // Fala sem IA (sem modelo)
  function falaPronta(s) {
    const v = s.vida, t = v.traits, P = v.perfil || {}, sorteia = a => a[Math.floor(Math.random() * a.length)], ops = [
      t.otimismo > 0.5 ? 'A terra devolve o que a gente dá. Hoje ela tá generosa.' : 'Tem dia que a enxada pesa mais que o normal.',
      t.humor > 0.5 ? 'Contei uma piada pra vaca. Ela não riu, mas também não foi embora.' : 'Trabalho calado. A roça não gosta de conversa fiada.',
      t.fe > 0.5 ? 'Sonhei com uma roça que não era minha... mas era.' : 'Não acredito em sorte. Acredito em chuva na hora certa.',
      t.ambicao > 0.5 ? 'Um dia esse morro inteiro vai ser meu, cê vai ver.' : 'Não preciso de muito. Café, sombra e a terra quieta.',
      'Cê ainda tá aí me olhando? Bom saber que tem alguém do outro lado.',
      `Já são ${Math.floor(v.idade)} anos nessa lida. Passa rápido, viu.`,
      `Tá ${ESTACAO[est(s)]}. Cada estação pede um jeito de trabalhar.`,
      `Tenho ${bichosTxt(v)} aqui na roça. Dá trabalho, mas dá companhia.`,
    ];
    if (P.sonho) ops.push(`Sabe o que eu queria? ${P.sonho}.`, `Tenho medo de ${P.medo}, mas não conta pra ninguém.`, `Dizem que eu ${P.mania}. É verdade.`);
    const am = gentes(s, v, r => r.amigo), ri = gentes(s, v, r => r.rival);
    if (am.length) ops.push(`${sorteia(am)} é gente boa. Faz falta quando some.`);
    if (ri.length) ops.push(`${sorteia(ri)} ainda me deve uma explicação. Mas deixa pra lá.`);
    if (v.log.length) ops.push('Sabe o que foi? ' + v.log[v.log.length - 1].replace(/^\d+ anos: /, '') + '. Fiquei pensando nisso.');
    if (v.par) ops.push(`${v.par.nome} disse que eu falo sozinho. Eu falo é com você.`);
    if (s.visitante) ops.push(`${s.visitante.nome} anda por aqui. Tem história pra contar, esse ${s.visitante.papel}.`);
    if (s.evento) ops.push(`${s.evento.txt}. Cê viu isso também?`);
    if (s.ecos.length) ops.push(`Às vezes lembro de um tal de ${s.ecos[s.ecos.length - 1].split(':')[0]}. Nunca conheci. Estranho, né?`);
    if (v.licoes.length) ops.push(v.licoes[v.licoes.length - 1]);
    return sorteia(ops);
  }

  // ---------------- IA: pedidos de criacao e leitura do que ela devolve ----------------
  const semAcento = x => String(x).normalize('NFD').replace(/[̀-ͯ]/g, '');
  const limpa = (x, max = 90) => { // a IA pequena as vezes mistura alfabetos: so fica texto latino
    x = String(x || '').replace(/[^\p{Script=Latin}\p{N}\p{P}\s]/gu, '').replace(/[*_#`"“”]/g, '').replace(/\s+/g, ' ').trim();
    return x.length < 6 ? null : x.slice(0, max);
  };
  function leCampos(txt, chaves) { // linhas "chave: valor"
    const o = {};
    for (const l of String(txt || '').split(/\n+/)) {
      const m = l.match(/^\s*[-*•\d.)]*\s*([A-Za-zÀ-ú ]+?)\s*[:=]\s*(.+)$/);
      if (!m) continue;
      const k = chaves.find(c => c === semAcento(m[1]).toLowerCase().trim());
      if (k && !o[k]) { const v = limpa(m[2]); if (v) o[k] = v; }
    }
    return o;
  }
  const SIS = () => 'Você ajuda a criar histórias para um jogo de fazenda. Responda ' + lt() + ', frases curtas, sem explicações.';
  const pedidoPerfil = v => ({ sistema: SIS() + ' Responda APENAS 4 linhas no formato "chave: valor".', max: 120,
    pedido: `Personagem: ${v.nome}, fazendeiro de ${Math.floor(v.idade)} anos, jeito ${persona(v)}. Invente (até 60 caracteres cada):\nsonho: o que ele mais deseja\nmedo: o que o assusta\nmania: um hábito esquisito\npassado: um fato curioso da juventude` });
  const pedidoLicao = (s, v) => ({ sistema: SIS(), max: 50,
    pedido: `Acontecimentos recentes de ${v.nome}: ${v.log.slice(-6).join('; ')}. Ele ${insight(s)}. Escreva UMA lição de vida que ele tirou disso, em primeira pessoa, até 90 caracteres, sem aspas.` });
  const pedidoEvento = (s, cena) => ({ sistema: SIS(), max: 50,
    pedido: `Na roça aconteceu algo do tipo "${cena}". Descreva em UMA frase curta e criativa (até 100 caracteres), na terceira pessoa, o que ${s.vida.nome} viu.` });
  const pedidoVisitante = vis => ({ sistema: SIS() + ' Responda APENAS 2 linhas no formato "chave: valor".', max: 90,
    pedido: `Um visitante chegou na roça: ${vis.nome}, ${vis.papel}. Invente:\nsegredo: algo misterioso sobre ${vis.fem ? 'ela' : 'ele'}\nfala: a primeira coisa que diz ao fazendeiro (até 90 caracteres)` });

  return { promptChat, pedidoMemoria, respostaPronta, setLang: l => { LANG = l; }, lt, novo, step, migra, prompt, falaPronta, persona, familia, bichosTxt, insight, aprendizado, ocupDe, ESP, ACOES, CENAS, ESTACAO,
    pedidoPerfil, pedidoLicao, pedidoEvento, pedidoVisitante, leCampos, limpa, est, vivos };
})();

if (typeof module !== 'undefined') {
  module.exports = Sim;
  if (require.main === module) { // autoteste: node sim.js
    const assert = require('assert');
    const roda = (seed, anos) => {
      const s = Sim.novo(seed), st = { comPar: 0, comFilhos: 0, mortes: 0, amigos: 0, rivais: 0, estranhos: 0, visitas: 0, bichosMax: 0, povoMax: 0, povoMin: 99, dinMax: 0, nasc: 0 };
      for (let i = 0; i < 12 * anos; i++) {
        const antes = s.vida, ev = Sim.step(s);
        for (const x of ev) {
          if (x.tipo === 'morte') { st.mortes++; if (antes.par) st.comPar++; if (antes.filhos.length) st.comFilhos++; }
          if (x.tipo === 'estranho') { st.estranhos++; assert(Sim.CENAS[x.cena], 'cena valida'); }
          if (x.visitante) st.visitas++;
          if (/virou (amigo|amiga)/.test(x.txt)) st.amigos++;
          if (/Desavença/.test(x.txt)) st.rivais++;
          if (/^Nasce/.test(x.txt)) st.nasc++;
        }
        const v = s.vida, vv = Sim.vivos(s);
        assert(v.dinheiro >= 0 && s.ecos.length <= 5 && v.log.length <= 12 && s.sabedoria.length <= 6, 'limites');
        assert(v.bichos.length <= 45 && vv.length <= 40, 'populacao limitada');
        assert(v.filhos.length <= 4 && v.amores.length <= 2, 'familia limitada');
        assert(!s.visitante || s.visitante.fim > s.mes, 'visitante expira');
        assert(Object.values(s.q).every(Number.isFinite), 'q finito');
        st.bichosMax = Math.max(st.bichosMax, v.bichos.length); st.povoMax = Math.max(st.povoMax, vv.length); st.povoMin = Math.min(st.povoMin, vv.length); st.dinMax = Math.max(st.dinMax, Math.round(v.dinheiro));
      }
      return { s, st };
    };
    const a = roda(42, 3200), b = roda(42, 3200);
    assert.deepStrictEqual(a.s, b.s, 'mesmo seed, mesma historia');
    assert(a.s.ciclo > 20, 'as vidas terminam e recomecam');
    assert(Sim.prompt(a.s).sistema.includes(a.s.vida.nome) && Sim.falaPronta(a.s));
    assert(a.st.povoMin >= 3, 'a vila nao se extingue');
    assert(!/[а-я]/.test(Sim.limpa('olá mundo гаh bonito')));
    assert.deepStrictEqual(Sim.leCampos('sonho: ver o mar\n- Medo: trovão forte\nlixo', ['sonho', 'medo']), { sonho: 'ver o mar', medo: 'trovão forte' });
    const c = roda(7, 400); Sim.migra(JSON.parse(JSON.stringify(c.s)));
    console.log('ok', a.s.ciclo, 'vidas', JSON.stringify(a.st), '\nq:', JSON.stringify(Object.fromEntries(Object.entries(a.s.q).map(([k, x]) => [k, +x.toFixed(2)]))), '\n' + Sim.insight(a.s));
  }
}
