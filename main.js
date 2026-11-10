const { app, BrowserWindow, ipcMain, screen, net, Tray, Menu, nativeImage } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');

// nome do jogo: "Life?" na tela (o Windows nao aceita "?" em arquivo, entao o exe/instalador se chamam Life)
app.setName('Life');
app.setAppUserModelId('com.murillo.life');
// quem ja usava a versao com o nome antigo (Vidinha) mantem saves e modelo de IA na mesma pasta
{ const velha = path.join(app.getPath('appData'), 'Vidinha'); if (fs.existsSync(velha)) app.setPath('userData', velha); }

if (!app.requestSingleInstanceLock()) app.exit(); // exit e imediato: a segunda copia nao chega a abrir nada

// ---------- modelos de IA (Qwen2.5 Instruct, GGUF Q4_K_M, so CPU pra nao brigar com jogo) ----------
const HF = 'https://huggingface.co/Qwen/';
const MODELOS = [
  { id: 'leve', arq: 'qwen2.5-0.5b-instruct-q4_k_m.gguf', url: HF + 'Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf', mb: 470, ramMin: 3, cpuMin: 2 },
  { id: 'recomendado', arq: 'qwen2.5-1.5b-instruct-q4_k_m.gguf', url: HF + 'Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf', mb: 1070, ramMin: 6, cpuMin: 4 },
  { id: 'profundo', arq: 'qwen2.5-3b-instruct-q4_k_m.gguf', url: HF + 'Qwen2.5-3B-Instruct-GGUF/resolve/main/qwen2.5-3b-instruct-q4_k_m.gguf', mb: 2010, ramMin: 12, cpuMin: 6 },
];

// ---------- configuracao do app (fica em userData/config.json) ----------
const ARQ_CFG = () => path.join(app.getPath('userData'), 'config.json');
let conf = { ia: null, perguntado: false, topo: true, barra: false };
const salvaConf = () => { try { fs.writeFileSync(ARQ_CFG(), JSON.stringify(conf)); } catch {} };
const lerConf = () => { try { Object.assign(conf, JSON.parse(fs.readFileSync(ARQ_CFG(), 'utf8'))); } catch {} };

let janela, tray, saindo = false;
const mostrar = () => { if (!janela) return; janela.show(); janela.focus(); };

function menuTray() {
  tray?.setContextMenu(Menu.buildFromTemplate([
    { label: 'Mostrar Life?', click: mostrar },
    { type: 'separator' },
    { label: 'Fixar no topo', type: 'checkbox', checked: conf.topo, click: i => setTopo(i.checked) },
    { label: 'Mostrar na barra de tarefas', type: 'checkbox', checked: conf.barra, click: i => setBarra(i.checked) },
    { type: 'separator' },
    { label: 'Sair', click: () => { saindo = true; app.quit(); } },
  ]));
}
function setTopo(v) { conf.topo = !!v; janela?.setAlwaysOnTop(conf.topo); salvaConf(); menuTray(); }
function setBarra(v) { conf.barra = !!v; janela?.setSkipTaskbar(!conf.barra); salvaConf(); menuTray(); }

app.whenReady().then(() => {
  lerConf();
  if (!conf.perguntado && !conf.ia) { // quem ja tinha um modelo baixado (versoes anteriores) continua com a IA ligada
    const m = ['recomendado', 'profundo', 'leve'].map(achaModelo).find(x => fs.existsSync(caminho(x)));
    if (m) { conf.ia = m.id; conf.perguntado = true; salvaConf(); }
  }
  const a = screen.getPrimaryDisplay().workArea, w = 300, h = 372;
  janela = new BrowserWindow({
    width: w, height: h, x: a.x + a.width - w - 12, y: a.y + a.height - h - 12,
    frame: false, transparent: true, resizable: false, alwaysOnTop: conf.topo, skipTaskbar: !conf.barra,
    title: 'Life?', icon: path.join(__dirname, 'assets', 'icone.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
  });
  janela.loadFile('index.html');
  // fechar so esconde: o jogo continua vivendo na bandeja (icones ocultos do Windows)
  janela.on('close', e => { if (!saindo) { e.preventDefault(); janela.hide(); } });
  try {
    tray = new Tray(nativeImage.createFromPath(path.join(__dirname, 'assets', 'icone.png')).resize({ width: 16, height: 16 }));
    tray.setToolTip('Life?');
    tray.on('click', mostrar);
    menuTray();
  } catch (e) { console.error('tray:', e.message); }
  app.getGPUInfo('basic').then(i => { gpuNome = i?.auxAttributes?.glRenderer || i?.gpuDevice?.[0]?.deviceString || ''; }).catch(() => {});
});
app.on('second-instance', mostrar);
app.on('before-quit', () => { saindo = true; });

// ---------- IA: hardware, download, escolha ----------
const caminho = m => path.join(app.getPath('userData'), m.arq);
const achaModelo = id => MODELOS.find(m => m.id === id);
let gpuNome = '';

function iaInfo() {
  const ram = os.totalmem() / 2 ** 30, cpus = os.cpus().length;
  const aguenta = m => ram >= m.ramMin && cpus >= m.cpuMin;
  return {
    ram: Math.round(ram * 10) / 10, cpus, cpu: os.cpus()[0]?.model?.trim() || '', gpu: gpuNome,
    recomendado: aguenta(achaModelo('recomendado')) ? 'recomendado' : 'leve', perguntado: conf.perguntado, ativo: conf.ia,
    modelos: MODELOS.map(m => ({ id: m.id, mb: m.mb, instalado: fs.existsSync(caminho(m)), aguenta: aguenta(m) })),
  };
}

let cancela = null;
async function baixar(m, aoProg) { // net.fetch (Chromium) confia no certificado do Kaspersky; o fetch do Node nao.
  const dest = caminho(m);
  if (fs.existsSync(dest)) return dest;
  const ac = new AbortController(); cancela = () => ac.abort();
  const r = await net.fetch(m.url, { signal: ac.signal });
  if (!r.ok) throw new Error('download ' + r.status);
  const total = +r.headers.get('content-length') || m.mb * 1048576, part = dest + '.part', out = fs.createWriteStream(part);
  let lido = 0, ult = -1;
  try {
    for await (const pedaco of r.body) {
      if (!out.write(pedaco)) await new Promise(ok => out.once('drain', ok));
      lido += pedaco.length;
      const pct = Math.floor(lido / total * 100);
      if (pct !== ult) { ult = pct; aoProg(pct, lido); }
    }
  } catch (e) { out.destroy(); try { fs.rmSync(part, { force: true }); } catch {} throw e; }
  await new Promise(ok => out.end(ok));
  fs.renameSync(part, dest);
  return dest;
}

ipcMain.handle('ia:info', () => iaInfo());
ipcMain.handle('ia:baixar', async (_e, id) => {
  const m = achaModelo(id); if (!m) return { erro: 'modelo desconhecido' };
  try { await baixar(m, (pct, lido) => janela?.webContents.send('ia:prog', { id, pct, mb: Math.round(lido / 1048576) })); return { ok: true }; }
  catch (e) { return { erro: e.name === 'AbortError' ? 'cancelado' : e.message }; }
  finally { cancela = null; }
});
ipcMain.on('ia:cancelar', () => cancela?.());
ipcMain.handle('ia:usar', (_e, id) => { // id = null: sem IA
  const m = achaModelo(id);
  conf.ia = m && fs.existsSync(caminho(m)) ? id : null; conf.perguntado = true; salvaConf();
  cerebro = null; return iaInfo();
});
ipcMain.handle('ia:remover', (_e, id) => {
  const m = achaModelo(id); if (!m) return iaInfo();
  try { fs.rmSync(caminho(m), { force: true }); } catch {}
  if (conf.ia === id) { conf.ia = null; cerebro = null; salvaConf(); }
  return iaInfo();
});

// ---------- cerebro (node-llama-cpp) ----------
let cerebro;
const carrega = () => cerebro ??= (async () => {
  const m = achaModelo(conf.ia);
  if (!m || !fs.existsSync(caminho(m))) throw new Error('sem modelo');
  const { getLlama, LlamaChatSession } = await import('node-llama-cpp');
  const llama = await getLlama({ gpu: false, build: 'never' });
  const modelo = await llama.loadModel({ modelPath: caminho(m) });
  return { ctx: await modelo.createContext({ contextSize: 2048, threads: Math.max(2, Math.min(4, os.cpus().length >> 1)) }), LlamaChatSession };
})().catch(e => { cerebro = null; throw e; });

// A fala do fazendeiro vem daqui; null = sem IA, a tela usa as falas prontas
ipcMain.handle('ia', async (_e, p) => {
  if (!conf.ia) return null;
  try {
    const { ctx, LlamaChatSession } = await carrega(), seq = ctx.getSequence();
    try {
      const ses = new LlamaChatSession({ contextSequence: seq, systemPrompt: p.sistema });
      try {
        return await ses.prompt(p.pedido, { maxTokens: p.max || 90, temperature: 0.8, topP: 0.9, topK: 40, minP: 0.05, repeatPenalty: { penalty: 1.1 }, signal: AbortSignal.timeout(90000) });
      } finally { ses.dispose(); }
    } finally { seq.dispose(); }
  } catch (e) { console.error('ia:', e.message); return null; }
});

// ---------- janela ----------
ipcMain.handle('win:estado', () => ({ topo: conf.topo, barra: conf.barra }));
ipcMain.on('win:topo', (_e, v) => setTopo(v));
ipcMain.on('win:barra', (_e, v) => setBarra(v));
ipcMain.on('win:esconder', () => janela?.hide());
// arrastar a janela: feito aqui (posicao do cursor na tela) pra funcionar em qualquer area, mesmo com janela transparente
let arrasto = null;
ipcMain.on('win:arrasta', (_e, inicio) => {
  if (!janela) return;
  const c = screen.getCursorScreenPoint();
  if (inicio || !arrasto) arrasto = { c, p: janela.getPosition() };
  else janela.setPosition(arrasto.p[0] + c.x - arrasto.c.x, arrasto.p[1] + c.y - arrasto.c.y);
});
// tamanho do jogo: pequeno/medio/grande/extra grande = fator sobre 300x372 (a janela cresce ancorada no canto, sem sair da tela)
ipcMain.handle('win:tamanho', (_e, f) => {
  if (!janela) return { f: 1 };
  const b = janela.getBounds(), wa = screen.getDisplayMatching(b).workArea;
  f = Math.min(f, wa.width / 300, wa.height / 372);
  const w = Math.round(300 * f), h = Math.round(372 * f);
  const x = Math.max(wa.x, Math.min(b.x + b.width - w, wa.x + wa.width - w)), y = Math.max(wa.y, Math.min(b.y + b.height - h, wa.y + wa.height - h));
  janela.setResizable(true); janela.setBounds({ x, y, width: w, height: h }); janela.setResizable(false);
  return { f: w / 300 };
});
ipcMain.on('sair', () => { saindo = true; app.quit(); });
// sem "window-all-closed": o jogo vive na bandeja ate o usuario escolher Sair
