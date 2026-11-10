// Pixel art de verdade, desenhada na resolucao propria de cada estilo (nada de ampliar ou borrar).
// Motor: cada forma e rasterizada direto no grid do nivel e sombreada em faixas duras (rampas de cor com troca de matiz:
// sombra azulada, luz amarelada), com tramado opcional e contorno colorido. Os detalhes (olhos, costuras, dobras) so entram
// quando a resolucao comporta: s=2 (32 bits) e s=4 (64 bits). 8 bits e desenhado a mao, pixel por pixel, com poucas cores.
const Px = (() => {
  const hex = h => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16));
  const hx = c => '#' + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  function ramp(base, n = 4) { // escuro -> claro
    const b = hex(base), mid = Math.floor((n - 1) * .6), out = [];
    for (let i = 0; i < n; i++) {
      if (i < mid) { const k = (mid - i) / mid; out.push(hx(mix(b, [38, 28, 92], .30 * k).map(v => v * (1 - .22 * k)))); }
      else if (i > mid) { const k = (i - mid) / (n - 1 - mid); out.push(hx(mix(b, [255, 240, 190], .38 * k).map(v => v * (1 + .04 * k)))); }
      else out.push(hx(b));
    }
    return out;
  }
  class Pic {
    constructor(w, h, m = 1) { this.w = w + 2 * m; this.h = h + 2 * m; this.m = m; this.d = new Array(this.w * this.h).fill(null); }
    set(x, y, c) { x += this.m; y += this.m; if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.d[y * this.w + x] = c; }
    get(x, y) { x += this.m; y += this.m; return x < 0 || y < 0 || x >= this.w || y >= this.h ? null : this.d[y * this.w + x]; }
    canvas() {
      const c = document.createElement('canvas'); c.width = this.w; c.height = this.h; const g = c.getContext('2d');
      this.d.forEach((col, i) => { if (col) { g.fillStyle = col; g.fillRect(i % this.w, Math.floor(i / this.w), 1, 1); } });
      return c;
    }
  }
  const BAY = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
  const LZ = (() => { const v = [-.5, -.7, .55], m = Math.hypot(...v); return v.map(a => a / m); })(); // luz vem de cima-esquerda
  function shape(pic, s, x0, y0, x1, y1, test, rp, o = {}) {
    const n = rp.length;
    for (let py = Math.floor(y0 * s); py < Math.ceil(y1 * s); py++) for (let px = Math.floor(x0 * s); px < Math.ceil(x1 * s); px++) {
      const nv = test((px + .5) / s, (py + .5) / s); if (!nv) continue;
      let v = (nv[0] * LZ[0] + nv[1] * LZ[1] + nv[2] * LZ[2] + .05) / 1.05 + (o.bias || 0);
      if (o.dither) v += (BAY[py & 3][px & 3] / 16 - .5) * (1 / n) * 1.2;
      pic.set(px, py, rp[Math.max(0, Math.min(n - 1, Math.floor(v * n)))]);
    }
  }
  const E = (pic, s, cx, cy, rx, ry, rp, o) => shape(pic, s, cx - rx, cy - ry, cx + rx, cy + ry, (x, y) => {
    const nx = (x - cx) / rx, ny = (y - cy) / ry, d = nx * nx + ny * ny; return d <= 1 ? [nx, ny, Math.sqrt(1 - d)] : null; }, rp, o);
  const Rc = (pic, s, x0, y0, x1, y1, rp, o = {}) => {
    const r = o.r ?? .5, cx = (x0 + x1) / 2, hw = (x1 - x0) / 2, cy = (y0 + y1) / 2, hh = (y1 - y0) / 2;
    shape(pic, s, x0, y0, x1, y1, (x, y) => {
      const dx = Math.abs(x - cx) - (hw - r), dy = Math.abs(y - cy) - (hh - r);
      if (dx > 0 && dy > 0 && dx * dx + dy * dy > r * r) return null;
      const nx = (x - cx) / hw; return [nx, (y - cy) / hh * .45, Math.sqrt(Math.max(.05, 1 - nx * nx))]; }, rp, o);
  };
  function contorno(pic, modo = 'sel') { // pixel vazio colado numa forma: cor mais escura da vizinhanca, puxada pro roxo escuro
    const add = [];
    for (let y = 0; y < pic.h; y++) for (let x = 0; x < pic.w; x++) {
      if (pic.d[y * pic.w + x]) continue;
      let best = null, bs = 1e9;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
        const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= pic.w || yy >= pic.h) return;
        const c = pic.d[yy * pic.w + xx]; if (!c) return; const r = hex(c), sm = r[0] + r[1] + r[2]; if (sm < bs) { bs = sm; best = r; } });
      if (best) add.push([x, y, modo === 'preto' ? '#1c1018' : hx(mix(best, [22, 10, 30], .62))]);
    }
    add.forEach(([x, y, c]) => { pic.d[y * pic.w + x] = c; });
  }
  const px1 = (pic, x, y, c) => pic.set(x, y, c);

  // ---------------- fazendeiro (s = 2 -> 32 bits, s = 4 -> 64 bits) ----------------
  function olho(pic, s, ux, uy, cab) {
    const ex = Math.round(ux * s), ey = Math.round(uy * s);
    if (s === 2) {
      for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 2; dx++) px1(pic, ex - 1 + dx, ey - 1 + dy, '#1c1a28');
      px1(pic, ex - 1, ey - 1, '#b8c4f4'); px1(pic, ex - 1, ey - 3, cab); px1(pic, ex, ey - 3, cab); px1(pic, ex + 1, ey - 3, cab);
    } else {
      for (let dy = 0; dy < 5; dy++) for (let dx = 0; dx < 4; dx++) px1(pic, ex - 2 + dx, ey - 2 + dy, '#f4efe8');
      for (let dy = 0; dy < 4; dy++) for (let dx = 0; dx < 3; dx++) px1(pic, ex - 1 + dx, ey - 2 + dy, '#4a3226');
      for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) px1(pic, ex - 1 + dx, ey - 1 + dy, '#14101a');
      px1(pic, ex - 1, ey - 2, '#ffffff'); px1(pic, ex, ey - 2, '#c8d4ff');
      for (let dx = -2; dx < 3; dx++) px1(pic, ex + dx, ey - 3, '#2a1a14');
      for (let dx = -2; dx < 3; dx++) { px1(pic, ex + dx, ey - 5, cab); px1(pic, ex + dx, ey - 6, cab); }
    }
  }
  function fazendeiro(s, o = {}) {
    const pic = new Pic(16 * s, 24 * s);
    const pele = ramp('#f2b98a', 4), palha = ramp('#e2b455', 4), faixa = ramp('#a03c28', 3), cabelo = ramp(o.barba ? '#d8d8d8' : '#6b4429', 3),
      camisa = ramp('#efe9d6', 4), jeans = ramp('#3f72d6', 4), bota = ramp('#5c3a20', 3), botao = ramp('#ffd23a', 3), cabCor = o.barba ? '#bdbdbd' : '#3a2416';
    const D = s >= 2, G = s >= 4;
    // botas e pernas
    Rc(pic, s, 3.4, 22.4, 7.9, 24, bota, { r: .7 }); Rc(pic, s, 8.1, 22.4, 12.6, 24, bota, { r: .7 });
    Rc(pic, s, 4.2, 19.4, 7.95, 22.9, jeans, { r: .3 }); Rc(pic, s, 8.05, 19.4, 11.8, 22.9, jeans, { r: .3 });
    if (D) for (let y = Math.round(20.2 * s); y < Math.round(22.9 * s); y++) px1(pic, Math.round(8 * s) - 1, y, jeans[0]);
    if (D) for (let x = Math.round(3.4 * s); x < Math.round(12.6 * s); x++) if (pic.get(x, Math.round(24 * s) - 1)) px1(pic, x, Math.round(24 * s) - 1, bota[0]);
    if (G) { Rc(pic, s, 5.2, 20.6, 7, 21.8, jeans, { r: .3, bias: .25 }); Rc(pic, s, 9, 20.6, 10.8, 21.8, jeans, { r: .3, bias: .25 }); }
    // corpo
    Rc(pic, s, 6.6, 11.8, 9.4, 13.6, pele, { r: .3, bias: -.35 });
    Rc(pic, s, 3.2, 12.8, 12.8, 19.6, camisa, { r: 1.1 });
    Rc(pic, s, 1.1, 13.4, 3.3, 18.9, camisa, { r: .9 }); Rc(pic, s, 12.7, 13.4, 14.9, 18.9, camisa, { r: .9 });
    E(pic, s, 2.2, 19.5, 1.05, 1.1, pele); E(pic, s, 13.8, 19.5, 1.05, 1.1, pele);
    if (D) { for (const ax of [1.1, 12.7]) for (let x = Math.round(ax * s); x < Math.round((ax + 2.2) * s); x++) px1(pic, x, Math.round(18.4 * s), camisa[1]); }
    if (G) { [[2, 15.2], [13.2, 15.6], [2.4, 16.6], [13.6, 17]].forEach(([x, y]) => { px1(pic, Math.round(x * s), Math.round(y * s), camisa[1]); px1(pic, Math.round(x * s) + 1, Math.round(y * s) + 1, camisa[1]); }); }
    Rc(pic, s, 5, 14, 11, 19.8, jeans, { r: .6 }); Rc(pic, s, 5, 12.9, 6.3, 14.8, jeans, { r: .3 }); Rc(pic, s, 9.7, 12.9, 11, 14.8, jeans, { r: .3 });
    Rc(pic, s, 4.2, 19.2, 11.8, 20.4, jeans, { r: .2 });
    E(pic, s, 5.65, 14.8, .5, .5, botao); E(pic, s, 10.35, 14.8, .5, .5, botao);
    Rc(pic, s, 6.8, 16.2, 9.2, 18.4, jeans, { r: .3, bias: -.25 });
    if (D) { for (let x = Math.round(6.8 * s); x < Math.round(9.2 * s); x++) px1(pic, x, Math.round(16.2 * s) + 1, jeans[0]); }
    if (D) { for (let y = Math.round(14.2 * s); y < Math.round(19.4 * s); y += 2) { px1(pic, Math.round(5.3 * s), y, jeans[3]); px1(pic, Math.round(10.7 * s) - 1, y, jeans[3]); } }
    // cabeca
    E(pic, s, 8, 9.6, 4.1, 3.5, pele, { dither: G });
    E(pic, s, 3.95, 10, .8, 1, pele); E(pic, s, 12.05, 10, .8, 1, pele);
    Rc(pic, s, 3.9, 8, 4.9, 10.8, cabelo, { r: .3 }); Rc(pic, s, 11.1, 8, 12.1, 10.8, cabelo, { r: .3 });
    if (o.barba) { Rc(pic, s, 4.2, 10.8, 11.8, 13.1, ramp('#e4e4e4', 4), { r: 1.1 }); Rc(pic, s, 6.6, 11.4, 9.4, 12, pele, { r: .3 }); }
    // chapeu
    E(pic, s, 8, 6, 7.6, 1.7, palha, { dither: G });
    Rc(pic, s, 4.7, 1, 11.3, 5.6, palha, { r: 1.7, dither: G });
    Rc(pic, s, 4.7, 4.2, 11.3, 5.5, faixa, { r: .1 });
    if (G) { for (let y = Math.round(1.6 * s); y < Math.round(4 * s); y += 2) for (let x = Math.round(5.6 * s); x < Math.round(10.4 * s); x += 4) px1(pic, x + (y % 4 ? 1 : 0), y, palha[0]); }
    if (D) { for (let x = Math.round(1 * s); x < Math.round(15 * s); x += 3) px1(pic, x, Math.round(7.2 * s), palha[0]); }
    // sombra da aba no rosto
    for (let y = Math.round(7.6 * s); y < Math.round(8.5 * s); y++) for (let x = Math.round(4 * s); x < Math.round(12 * s); x++) { const c = pic.get(x, y); if (c && pele.includes(c)) px1(pic, x, y, pele[Math.max(0, pele.indexOf(c) - 1)]); }
    // rosto
    if (D) {
      olho(pic, s, 6.3, 9.7, cabCor); olho(pic, s, 9.7, 9.7, cabCor);
      const nx = Math.round(8 * s), ny = Math.round(10.7 * s);
      if (s === 2) { px1(pic, nx - 1, ny, pele[0]); px1(pic, nx, ny, pele[0]); }
      else { for (let i = -1; i < 2; i++) px1(pic, nx + i, ny + 1, pele[0]); px1(pic, nx - 1, ny, pele[0]); px1(pic, nx, ny - 1, pele[3]); px1(pic, nx, ny, pele[2]); }
      const my = Math.round(11.85 * s), mx = Math.round(7 * s), mw = Math.round(2 * s);
      if (!o.barba) {
        for (let i = 0; i < mw; i++) px1(pic, mx + i, my, '#7a2a2a');
        px1(pic, mx - 1, my - 1, '#7a2a2a'); px1(pic, mx + mw, my - 1, '#7a2a2a');
        if (G) for (let i = 1; i < mw - 1; i++) px1(pic, mx + i, my + 1, '#e07a70');
      }
      const cw = G ? 3 : 2, ch = G ? 2 : 1;
      for (const cx of [5, 10.2]) for (let dy = 0; dy < ch; dy++) for (let dx = 0; dx < cw; dx++) px1(pic, Math.round(cx * s) + dx, Math.round(11 * s) + dy, '#e8877a');
    }
    contorno(pic, 'sel');
    return pic.canvas();
  }

  // ---------------- galinha ----------------
  function galinha(s) {
    const pic = new Pic(15 * s, 13 * s);
    const c = ramp('#f7f2e6', 4), cs = ramp('#d9cfb4', 4), lar = ramp('#f2a622', 3), verm = ramp('#d93b2b', 3);
    const D = s >= 2, G = s >= 4;
    Rc(pic, s, 5.2, 10.4, 5.9, 12.8, lar, { r: 0 }); Rc(pic, s, 8, 10.4, 8.7, 12.8, lar, { r: 0 });
    Rc(pic, s, 4, 12.3, 6.9, 13, lar, { r: .2 }); Rc(pic, s, 7.1, 12.3, 10, 13, lar, { r: .2 });
    E(pic, s, 1.9, 4.4, 1.7, 2.8, cs, { dither: G }); E(pic, s, 2.9, 3.4, 1.2, 2.2, c);
    E(pic, s, 6.8, 7.4, 5.2, 3.6, c, { dither: G });
    E(pic, s, 6.2, 7.8, 2.8, 2, cs);
    if (D) for (let i = 0; i < 3; i++) { const y = Math.round((7 + i * .8) * s); for (let x = Math.round((4.6 + i * .3) * s); x < Math.round((7.6 + i * .3) * s); x += 1) if ((x + i) % 3) px1(pic, x, y, cs[0]); }
    E(pic, s, 11.4, 4.6, 2.1, 2.6, c);
    E(pic, s, 10.4, 1.7, .9, .9, verm); E(pic, s, 11.6, 1.3, .95, .95, verm); E(pic, s, 12.6, 1.9, .8, .8, verm);
    Rc(pic, s, 13.1, 4.1, 14.9, 5.1, lar, { r: 0 }); Rc(pic, s, 13.1, 5, 14.3, 5.6, lar, { r: 0, bias: -.3 });
    E(pic, s, 12.6, 6.5, .6, 1, verm);
    const ex = Math.round(12 * s), ey = Math.round(4 * s);
    if (s === 2) { px1(pic, ex, ey, '#1c1a28'); px1(pic, ex + 1, ey, '#1c1a28'); px1(pic, ex, ey + 1, '#1c1a28'); }
    else if (G) { for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 3; dx++) px1(pic, ex + dx, ey + dy, '#1c1a28'); px1(pic, ex, ey, '#ffffff'); }
    else px1(pic, ex, ey, '#1c1a28');
    contorno(pic, 'sel');
    return pic.canvas();
  }

  // ---------------- 8 bits: desenhado a mao, poucas cores ----------------
  const NES = { k: '#000000', y: '#fcb800', s: '#fc9838', w: '#fcfcfc', b: '#0058f8', n: '#a44000', e: '#000000', r: '#d82800', o: '#fc7460', g: '#bcbcbc' };
  function ascii(linhas) {
    const w = Math.max(...linhas.map(l => l.length)), c = document.createElement('canvas'); c.width = w; c.height = linhas.length; const g = c.getContext('2d');
    linhas.forEach((l, y) => [...l].forEach((ch, x) => { if (NES[ch]) { g.fillStyle = NES[ch]; g.fillRect(x, y, 1, 1); } })); return c;
  }
  const fazendeiro8 = () => ascii([
    '...kkkkkk...',
    '..kyyyyyyk..',
    '.kyyyyyyyyk.',
    'kyyyyyyyyyyk',
    '.kkkkkkkkkk.',
    '..kssssssk..',
    '..kskssksk..',
    '..kssssssk..',
    '...kkkkkk...',
    '..kwbbbbwk..',
    '.kwwbbbbwwk.',
    '.kwwbbbbwwk.',
    '.kssbbbbssk.',
    '..kbbbbbbk..',
    '..kbbkkbbk..',
    '..knnkknnk..',
    '..kkkkkkkk..']);
  const galinha8 = () => ascii([
    '.....kk...',
    '....krrk..',
    '.kk.kwwwk.',
    'kwwwwwewok',
    'kwwwwwwwk.',
    '.kwwwwwwk.',
    '..kwwwwk..',
    '...o..o...',
    '..oo..oo..']);
  return { ramp, Pic, shape, E, Rc, contorno, fazendeiro, galinha, fazendeiro8, galinha8 };
})();
