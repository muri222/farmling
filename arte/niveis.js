// Teste de estilo: o mesmo cenario em 8, 16, 32 e 64 bits.
// 8  : meia resolucao, paleta de 16 cores estilo NES, sem sombreado
// 16 : o estilo atual (144x108)
// 32 : 2x a resolucao, bordas suaves, luz nos bonecos, sombra no chao, ceu em degrade
// 64 : 4x a resolucao (supersample na tela), luz forte, brilho e grama com textura
// shortcut: 32 e 64 reaproveitam os desenhos de 16 ampliados com suavizacao; se um deles for aprovado, desenhar os sprites de novo na resolucao propria.
const Niveis = (() => {
  const K = { 8: .5, 16: 1, 32: 2, 64: 4 };
  const NES = ['#000000', '#fcfcfc', '#bcbcbc', '#5c94fc', '#a4e4fc', '#0058f8', '#00a800', '#005800', '#b8f818', '#a44000', '#503000', '#d82800', '#fcb800', '#fc9838', '#f8b8b8', '#787878']
    .map(h => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16)));
  const tela = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };
  const rn = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  function quant(c) {
    const x = c.getContext('2d', { willReadFrequently: true }), im = x.getImageData(0, 0, c.width, c.height), d = im.data;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 128) { d[i + 3] = 0; continue; }
      let b = 0, bd = 1e9;
      NES.forEach((p, k) => { const e = (p[0] - d[i]) ** 2 + (p[1] - d[i + 1]) ** 2 + (p[2] - d[i + 2]) ** 2; if (e < bd) { bd = e; b = k; } });
      d[i] = NES[b][0]; d[i + 1] = NES[b][1]; d[i + 2] = NES[b][2]; d[i + 3] = 255;
    }
    x.putImageData(im, 0, 0); return c;
  }
  function reduz(c, f) { // pega 1 pixel de cada bloco f x f (o primeiro que nao e vazio)
    const o = tela(c.width / f, c.height / f), s = c.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, c.width, c.height), ox = o.getContext('2d'), im = ox.createImageData(o.width, o.height);
    for (let y = 0; y < o.height; y++) for (let x = 0; x < o.width; x++) {
      for (let j = 0; j < f; j++) for (let i = 0; i < f; i++) {
        const k = ((y * f + j) * c.width + x * f + i) * 4;
        if (s.data[k + 3] > 0) { const m = (y * o.width + x) * 4; im.data.set(s.data.slice(k, k + 4), m); j = f; break; }
      }
    }
    ox.putImageData(im, 0, 0); return o;
  }
  function ampliar(c, f) {
    const o = tela(c.width * f, c.height * f), x = o.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    x.drawImage(c, 0, 0, o.width, o.height); return o;
  }
  function luz(c, forca) { // topo e esquerda mais claros, base e direita mais escuros + brilho no alto
    const x = c.getContext('2d', { willReadFrequently: true }), im = x.getImageData(0, 0, c.width, c.height), d = im.data;
    for (let y = 0; y < c.height; y++) for (let xx = 0; xx < c.width; xx++) {
      const k = (y * c.width + xx) * 4; if (!d[k + 3]) continue;
      const f = 1 + forca * ((.5 - y / c.height) * .55 + (.5 - xx / c.width) * .3);
      for (let q = 0; q < 3; q++) d[k + q] = Math.max(0, Math.min(255, d[k + q] * f));
    }
    x.putImageData(im, 0, 0); return c;
  }

  // sprites crus (sem contorno), guardados uma vez
  Arte.opts.contorno = false;
  const cru = { f1: Arte.fazendeiro(1), f0: Arte.fazendeiro(0), m: Arte.mulher(0), c: Arte.crianca('#d96a3a'), g0: Arte.galinha(false), g1: Arte.galinha(true),
    vaca: Arte.vaca(), cao: Arte.cachorro(1), arv: Arte.arvore(), cel: Arte.celeiro(), p0: Arte.planta(0), p1: Arte.planta(1), p2: Arte.planta(2), p3: Arte.planta(3) };
  Arte.opts.contorno = true;
  const copia = c => { const o = tela(c.width, c.height); o.getContext('2d').drawImage(c, 0, 0); return o; };
  function prep(nv, nome) {
    let c = copia(cru[nome]);
    if (nv === 8) return quant(Arte.contorna(reduz(c, 2)));
    c = Arte.contorna(c);
    if (nv === 16) return c;
    c = ampliar(c, K[nv]);
    return luz(c, nv === 32 ? .5 : .85);
  }

  function cena(nv) {
    const k = K[nv], c = tela(144 * k, 108 * k), g = c.getContext('2d'), P = n => prep(nv, n);
    g.imageSmoothingEnabled = nv >= 32;
    const px = v => Math.round(v * k);
    const R = (x, y, w, h, col) => { g.fillStyle = col; const x0 = px(x), y0 = px(y); g.fillRect(x0, y0, Math.max(1, px(x + w) - x0), Math.max(1, px(y + h) - y0)); };
    const grad = (y0, y1, cores) => { const gr = g.createLinearGradient(0, y0 * k, 0, y1 * k); cores.forEach((s, i) => gr.addColorStop(i / (cores.length - 1), s)); g.fillStyle = gr; g.fillRect(0, y0 * k, 144 * k, (y1 - y0) * k); };
    const disco = (cx, cy, r, col) => {
      if (nv >= 32) { g.fillStyle = col; g.beginPath(); g.arc(cx * k, cy * k, r * k, 0, 7); g.fill(); return; }
      for (let dy = -r; dy <= r; dy++) { const w = Math.floor(Math.sqrt(r * r - dy * dy) + .5); R(cx - w, cy + dy, 2 * w + 1, 1, col); }
    };
    const brilho = (cx, cy, r, cor) => { const gr = g.createRadialGradient(cx * k, cy * k, 0, cx * k, cy * k, r * k); gr.addColorStop(0, cor); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect((cx - r) * k, (cy - r) * k, 2 * r * k, 2 * r * k); };
    const S = (nome, x, y, sombra = true) => {
      const s = P(nome);
      if (nv >= 32 && sombra) { g.fillStyle = `rgba(0,0,0,${nv === 64 ? .3 : .25})`; g.beginPath(); g.ellipse(px(x) + s.width / 2, px(y) + s.height - k, s.width * .42, k * 2.2, 0, 0, 7); g.fill(); }
      g.drawImage(s, px(x), px(y));
    };

    // ceu
    if (nv === 8) { R(0, 0, 144, 30, '#5c94fc'); R(0, 30, 144, 30, '#a4e4fc'); }
    else if (nv === 16) ['#3f8fe0', '#58a4ea', '#72b8f0', '#8fcaf4', '#aedaf8', '#cbe8fa'].forEach((cc, i) => R(0, i * 10, 144, 11, cc));
    else grad(0, 62, ['#2f7fdc', '#6db4ee', '#cfe9fa']);
    if (nv >= 32) brilho(112, 12, 26, 'rgba(255,240,150,.7)');
    disco(112, 12, nv === 8 ? 5 : 4, nv === 8 ? '#fcb800' : '#ffe04a');
    [[18, 12], [70, 8], [100, 24]].forEach(([a, b]) => {
      const col = '#fff';
      if (nv === 8) { R(a - 2, b, 18, 4, col); R(a + 2, b - 3, 9, 3, col); return; }
      disco(a, b, 3, col); disco(a + 6, b - 1, 4, col); disco(a + 12, b, 3, col); R(a - 2, b + 1, 16, 2, col);
      if (nv >= 16) R(a - 3, b + 3, 20, 2, '#dbe8f6');
    });
    // morros
    const morro = (f, cor, ba) => {
      if (nv >= 32) { g.fillStyle = cor; g.beginPath(); g.moveTo(0, 62 * k); for (let x = 0; x <= 144; x += 2) g.lineTo(x * k, f(x) * k); g.lineTo(144 * k, 62 * k); g.fill(); }
      else for (let x = 0; x < 144; x += nv === 8 ? 2 : 1) R(x, f(x), nv === 8 ? 2 : 1, 62 - f(x), cor);
    };
    morro(x => 46 - 6 * Math.sin(x / 19) - 3 * Math.sin(x / 7 + 2), nv === 8 ? '#5c94fc' : '#7fb0b8');
    morro(x => 54 - 4 * Math.sin(x / 11 + 1) - 2 * Math.sin(x / 5), nv === 8 ? '#005800' : '#5a9a6a');
    // chao
    if (nv === 8) R(0, 60, 144, 48, '#00a800');
    else if (nv === 16) { R(0, 60, 144, 48, '#5aa832'); R(0, 60, 144, 2, '#7bc84a'); R(0, 62, 144, 1, '#4a9028'); for (let i = 0; i < 40; i++) R(rn(i + 7) * 144, 64 + rn(i + 90) * 40, 1, 2, '#3f8a24'); }
    else {
      grad(60, 108, ['#78cf48', '#4aa22e', '#2f7a22']);
      const n = nv === 32 ? 260 : 900;
      for (let i = 0; i < n; i++) { const x = rn(i * 3) * 144, y = 61 + rn(i * 3 + 1) * 47, l = 1 + rn(i + 5) * 2; g.fillStyle = rn(i + 9) < .5 ? '#3a8a26' : '#8ad852'; g.fillRect(x * k, (y - l) * k, Math.max(1, k * .35), l * k); }
    }
    // arvore, celeiro, cerca
    S('arv', 2, 26); S('cel', 94, 18);
    for (let i = 36; i < 92; i += 9) { R(i, 59, 2, 9, nv === 8 ? '#a44000' : '#b08850'); } R(36, 61, 56, 1, nv === 8 ? '#a44000' : '#c9a56a'); R(36, 65, 56, 1, nv === 8 ? '#a44000' : '#c9a56a');
    // plantacao
    for (let l = 0; l < 3; l++) {
      const y = 72 + l * 11;
      if (nv === 8) R(34, y + 9, 108, 3, '#503000'); else { R(34, y + 10, 108, 2, '#5e3818'); R(34, y + 9, 108, 1, '#7a4a24'); }
      for (let q = 0; q < 11; q++) S('p' + Math.min(3, (q + l) % 4), 36 + q * 9.5, y - 3, false);
    }
    S('vaca', 2, 66); S('g0', 6, 90); S('g1', 20, 96); S('cao', 68, 50);
    S('f1', 56, 64); S('m', 80, 70); S('c', 98, 86);
    return nv === 8 ? quant(c) : c;
  }
  return { cena, prep, K };
})();
