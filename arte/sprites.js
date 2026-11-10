// Sprites do Vidinha desenhados em codigo, com contorno automatico (qualquer pixel vazio colado numa forma vira contorno).
// mk(w, h, fn) devolve um canvas (w+2) x (h+2); fn(R, D) desenha em coordenadas 0..w-1 / 0..h-1.
const OUT = '#26180f';
const Arte = (() => {
  const opts = { contorno: true };
  // contorno: pixel vazio colado numa forma vira contorno
  function contorna(c) {
    const x = c.getContext('2d', { willReadFrequently: true });
    const im = x.getImageData(0, 0, c.width, c.height), d = im.data, W = c.width, H = c.height, op = (i, j) => i >= 0 && j >= 0 && i < W && j < H && d[(j * W + i) * 4 + 3] > 0, mark = [];
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++)
      if (!op(i, j) && (op(i - 1, j) || op(i + 1, j) || op(i, j - 1) || op(i, j + 1))) mark.push((j * W + i) * 4);
    for (const k of mark) { d[k] = 0x26; d[k + 1] = 0x18; d[k + 2] = 0x0f; d[k + 3] = 255; }
    x.putImageData(im, 0, 0);
    return c;
  }
  function mk(w, h, fn, contorno = true) {
    const c = document.createElement('canvas'); c.width = w + 2; c.height = h + 2;
    const x = c.getContext('2d', { willReadFrequently: true });
    const R = (a, b, cw, ch, col) => { x.fillStyle = col; x.fillRect(a + 1, b + 1, cw, ch); };
    const D = (cx, cy, r, col) => { for (let dy = -r; dy <= r; dy++) { const dw = Math.floor(Math.sqrt(r * r - dy * dy) + .5); R(cx - dw, cy + dy, 2 * dw + 1, 1, col); } };
    fn(R, D);
    return opts.contorno && contorno ? contorna(c) : c;
  }
  const P = { pele: '#f2bd8c', pelS: '#d9905f', face: '#ec8a7c', olho: '#1c1a24', boca: '#8c2f2f', chap: '#e6b957', chapS: '#bd8c3a', chapL: '#f6d98a',
    faixa: '#a03c28', cam: '#efe9d6', camS: '#c9c0a6', mac: '#3f72d6', macS: '#2d54a8', bota: '#5c3a20', cabelo: '#6b4429', branco: '#dcdcdc', botao: '#ffd23a' };

  // passo: 0 parado, 1 e 2 alternam as pernas e os bracos
  function fazendeiro(passo = 0, o = {}) {
    const mac = o.mac || P.mac, macS = o.macS || P.macS, cab = o.cabelo || P.cabelo;
    return mk(16, 24, (R) => {
      R(5, 1, 6, 4, P.chap); R(6, 1, 3, 1, P.chapL); R(5, 3, 6, 1, P.faixa); R(2, 5, 12, 2, P.chap); R(2, 6, 12, 1, P.chapS); R(3, 4, 2, 1, P.chap); R(11, 4, 2, 1, P.chap);
      R(4, 7, 8, 6, P.pele); R(4, 12, 8, 1, P.pelS); R(4, 7, 1, 3, cab); R(11, 7, 1, 3, cab); R(5, 7, 6, 1, cab);
      R(6, 9, 1, 2, P.olho); R(9, 9, 1, 2, P.olho); R(7, 10, 2, 1, P.pelS); R(5, 11, 1, 1, P.face); R(10, 11, 1, 1, P.face); R(7, 11, 2, 1, P.boca);
      if (o.barba) { R(4, 10, 1, 3, P.branco); R(11, 10, 1, 3, P.branco); R(5, 12, 6, 1, P.branco); R(6, 11, 1, 1, P.branco); R(9, 11, 1, 1, P.branco); R(4, 7, 1, 3, P.branco); R(11, 7, 1, 3, P.branco); R(5, 7, 6, 1, P.branco); }
      R(3, 13, 10, 6, P.cam); R(3, 18, 10, 1, P.camS);
      R(5, 14, 6, 6, mac); R(4, 19, 8, 1, mac); R(5, 13, 1, 1, mac); R(10, 13, 1, 1, mac); R(5, 14, 1, 1, P.botao); R(10, 14, 1, 1, P.botao); R(7, 16, 2, 2, macS); R(5, 19, 6, 1, macS);
      const bl = passo === 1 ? 1 : 0, br = passo === 2 ? 1 : 0;
      R(1, 14 + bl, 2, 5, P.cam); R(1, 17 + bl, 2, 1, P.camS); R(1, 19 + bl, 2, 1, P.pele);
      R(13, 14 + br, 2, 5, P.cam); R(13, 17 + br, 2, 1, P.camS); R(13, 19 + br, 2, 1, P.pele);
      const le = passo === 1 ? 1 : 0, ld = passo === 2 ? 1 : 0;
      R(4, 20, 3, 3 - le, mac); R(3, 23 - le, 4, 1, P.bota); R(9, 20, 3, 3 - ld, mac); R(9, 23 - ld, 4, 1, P.bota);
    });
  }
  function mulher(passo = 0, o = {}) {
    const vest = o.vestido || '#c8489a', cab = o.cabelo || '#7a3a1e';
    return mk(16, 24, (R) => {
      R(4, 1, 8, 6, cab); R(3, 3, 2, 10, cab); R(11, 3, 2, 10, cab); R(6, 1, 3, 1, '#9a5a30');
      R(5, 5, 6, 8, P.pele); R(5, 12, 6, 1, P.pelS); R(5, 5, 6, 2, cab); R(6, 5, 1, 3, cab); R(10, 5, 1, 3, cab);
      R(6, 8, 1, 2, P.olho); R(9, 8, 1, 2, P.olho); R(5, 10, 1, 1, P.face); R(10, 10, 1, 1, P.face); R(7, 11, 2, 1, '#c03a3a');
      R(11, 4, 2, 2, '#e8c040'); // laco
      R(4, 13, 8, 5, vest); R(5, 13, 6, 1, P.pele); R(3, 18, 10, 3, vest); R(2, 21, 12, 2, vest); R(2, 22, 12, 1, '#9a2e78');
      R(6, 14, 4, 8, '#f4efe4'); R(6, 14, 4, 1, '#d8d0c0'); R(7, 16, 2, 2, '#e0d8c8');
      const b = passo ? 1 : 0;
      R(2, 13 + b, 2, 5, vest); R(2, 18 + b, 2, 1, P.pele); R(12, 13, 2, 5, vest); R(12, 18, 2, 1, P.pele);
      R(5, 23, 2, 1, '#5c3a20'); R(9, 23, 2, 1, '#5c3a20');
    });
  }
  function crianca(cor = '#d96a3a', passo = 0) {
    return mk(10, 15, (R) => {
      R(2, 1, 6, 2, P.chap); R(1, 3, 8, 1, P.chapS);
      R(2, 4, 6, 5, P.pele); R(2, 8, 6, 1, P.pelS); R(3, 6, 1, 1, P.olho); R(6, 6, 1, 1, P.olho); R(2, 7, 1, 1, P.face); R(7, 7, 1, 1, P.face); R(4, 7, 2, 1, P.boca);
      R(2, 9, 6, 3, cor); R(1, 9, 1, 3, cor); R(8, 9, 1, 3, cor); R(1, 12, 1, 1, P.pele); R(8, 12, 1, 1, P.pele);
      R(3, 12, 2, 2 - (passo === 1 ? 1 : 0), '#2a3f7a'); R(5, 12, 2, 2 - (passo === 2 ? 1 : 0), '#2a3f7a');
      R(3, 14 - (passo === 1 ? 1 : 0), 2, 1, P.bota); R(5, 14 - (passo === 2 ? 1 : 0), 2, 1, P.bota);
    });
  }
  function galinha(bica = false) {
    const c = '#f7f2e6', C = '#d9d0ba', b = bica ? 3 : 0;
    return mk(15, 12, (R, D) => {
      R(0, 3, 2, 4, C); R(1, 2, 2, 2, C); R(2, 4, 3, 3, c);
      D(6, 7, 4, c); R(3, 9, 7, 1, C); R(4, 6, 4, 3, C); R(5, 7, 2, 1, '#bfb49a');
      D(11, 3 + b, 2, c); R(10, 0 + b, 3, 1, '#d93b2b'); R(11, 1 + b, 1, 1, '#d93b2b');
      R(13, 3 + b, 2, 1, '#f2a622'); R(12, 5 + b, 1, 2, '#d93b2b'); R(11, 3 + b, 1, 1, P.olho);
      R(5, 11, 1, 2, '#f2a622'); R(8, 11, 1, 2, '#f2a622'); R(4, 13, 3, 1, '#f2a622'); R(7, 13, 3, 1, '#f2a622');
    });
  }
  function vaca() {
    const c = '#f7f2e6', C = '#d9d0ba', d = '#2e2e36', i = '#f4a9a0';
    return mk(28, 19, (R) => {
      R(4, 4, 14, 9, c); R(3, 5, 16, 7, c); R(4, 11, 14, 2, C);
      R(6, 5, 4, 3, d); R(5, 6, 1, 2, d); R(12, 8, 4, 3, d); R(13, 7, 2, 1, d); R(8, 10, 2, 2, d);
      R(8, 13, 4, 2, i); R(9, 15, 2, 1, '#e08a82');
      R(4, 13, 3, 5, c); R(8, 13, 3, 5, C); R(13, 13, 3, 5, c); R(16, 13, 3, 5, C);
      R(4, 17, 3, 2, d); R(8, 17, 3, 2, d); R(13, 17, 3, 2, d); R(16, 17, 3, 2, d);
      R(2, 5, 1, 7, c); R(1, 11, 3, 3, d);
      R(19, 3, 7, 7, c); R(19, 9, 7, 1, C); R(24, 6, 3, 4, i); R(25, 7, 1, 1, d); R(25, 9, 1, 1, '#e08a82'); R(21, 5, 1, 2, P.olho);
      R(18, 3, 2, 3, d); R(25, 2, 2, 2, d); R(20, 0, 1, 3, '#f0e2b0'); R(24, 0, 1, 3, '#f0e2b0'); R(21, 3, 3, 1, d);
    });
  }
  function cachorro(rabo = 0) {
    const D = '#cc8c4c', E = '#9c6532', F = '#ead2a8';
    return mk(18, 13, (R) => {
      R(3, 4, 10, 5, D); R(4, 8, 8, 1, F); R(2, 5, 1, 3, D);
      R(12, 2, 5, 5, D); R(15, 4, 3, 2, F); R(17, 4, 1, 1, '#222'); R(14, 3, 1, 1, P.olho); R(11, 1, 2, 4, E); R(14, 6, 2, 1, '#e87878');
      R(0, 2 + rabo, 3, 1, D); R(0, 1 + rabo, 1, 2, D);
      R(3, 9, 2, 3, E); R(6, 9, 2, 3, D); R(9, 9, 2, 3, E); R(12, 9, 2, 3, D); R(3, 12, 2, 1, F); R(6, 12, 2, 1, F); R(9, 12, 2, 1, F); R(12, 12, 2, 1, F);
    });
  }
  function arvore() {
    return mk(32, 38, (R, D) => {
      R(13, 22, 6, 15, '#6b4220'); R(13, 22, 2, 15, '#4a2c18'); R(11, 35, 10, 2, '#6b4220'); R(12, 28, 1, 1, '#3a2010'); R(17, 26, 1, 2, '#3a2010');
      D(9, 17, 8, '#2f7a2a'); D(23, 17, 8, '#2f7a2a'); D(16, 11, 10, '#2f7a2a'); D(16, 19, 9, '#2f7a2a');
      D(14, 11, 7, '#3a8f30'); D(21, 17, 5, '#3a8f30'); D(10, 18, 4, '#3a8f30'); D(16, 21, 5, '#3a8f30');
      D(12, 8, 4, '#48a63a'); D(8, 15, 2, '#48a63a'); D(19, 13, 2, '#48a63a'); D(11, 7, 2, '#6cc455'); D(7, 14, 1, '#6cc455');
      [[7, 12], [20, 8], [24, 16], [14, 15], [10, 21], [19, 21], [5, 19], [17, 5]].forEach(([x, y]) => { R(x, y, 2, 2, '#d83a2a'); R(x, y, 1, 1, '#f27a6a'); });
    });
  }
  function celeiro() {
    return mk(48, 46, (R, D) => {
      R(2, 20, 32, 24, '#b83a2a'); for (let x = 3; x < 34; x += 3) R(x, 20, 1, 24, '#8a2a1e'); R(2, 43, 32, 1, '#6a1e14');
      for (let r = 0; r < 15; r++) { const w = 6 + Math.floor(r * 2.1); R(18 - (w >> 1), 5 + r, w, 1, r % 2 ? '#7a2418' : '#8a2a1e'); R(18 - (w >> 1), 5 + r, 2, 1, '#e8d8b0'); R(17 + (w >> 1), 5 + r, 2, 1, '#e8d8b0'); }
      R(0, 19, 36, 2, '#6a1e14');
      R(12, 30, 12, 14, '#e8d8b0'); R(13, 31, 10, 12, '#a82e20');
      for (let i = 0; i < 10; i++) { R(13 + i, 31 + Math.round(i * 11 / 9), 1, 1, '#e8d8b0'); R(22 - i, 31 + Math.round(i * 11 / 9), 1, 1, '#e8d8b0'); }
      R(15, 12, 6, 6, '#3a1a12'); R(17, 12, 2, 6, '#e8d8b0'); R(15, 14, 6, 2, '#e8d8b0'); R(16, 13, 4, 1, '#5a2a1e');
      R(37, 12, 9, 32, '#c8c8c0'); R(37, 12, 2, 32, '#e8e8e0'); R(44, 12, 2, 32, '#9a9a94'); D(41, 12, 4, '#a8a8a0'); D(41, 11, 3, '#c0c0b8');
      for (let y = 18; y < 42; y += 5) R(37, y, 9, 1, '#8a8a84');
    });
  }
  // estagio: 0 semente, 1 broto, 2 crescendo, 3 madura (trigo)
  function planta(est) {
    return mk(9, 13, (R) => {
      R(1, 11, 7, 2, '#7a4a24'); R(2, 10, 5, 1, '#8a5a30');
      if (est === 0) { R(4, 9, 1, 1, '#caa060'); return; }
      const h = [0, 4, 7, 10][est];
      R(4, 11 - h, 1, h, '#2e9a2e');
      R(2, 11 - h + 1, 2, 1, '#58c83a'); R(5, 11 - h + 2, 2, 1, '#58c83a');
      if (est >= 2) { R(2, 11 - h + 4, 2, 1, '#3a8f30'); R(5, 11 - h + 5, 2, 1, '#3a8f30'); }
      if (est === 3) { R(3, 0, 3, 5, '#f0d030'); R(4, 0, 1, 5, '#c8a020'); R(2, 1, 1, 2, '#f0d030'); R(6, 2, 1, 2, '#f0d030'); R(3, 0, 1, 1, '#fff2a0'); }
    });
  }
  function casinha(parede = '#d9b88a', telhado = '#a04a30') {
    return mk(32, 32, (R) => {
      R(3, 14, 26, 17, parede);
      for (let r = 0; r < 12; r++) { const w = 6 + r * 2; R(16 - (w >> 1), 3 + r, w, 1, r % 2 ? telhado : '#b85a3c'); }
      R(22, 1, 4, 8, '#8a6a5a'); R(22, 1, 4, 1, '#6a4a3a');
      R(13, 21, 7, 10, '#5a3418'); R(18, 26, 1, 1, '#ffd23a'); R(13, 21, 7, 1, '#3a2010');
      R(5, 18, 6, 6, '#8fcaf4'); R(7, 18, 1, 6, '#3a2010'); R(5, 20, 6, 1, '#3a2010'); R(4, 18, 1, 6, '#2a6a4a'); R(11, 18, 1, 6, '#2a6a4a'); R(4, 24, 8, 1, '#6a4a30');
      R(22, 18, 6, 6, '#8fcaf4'); R(24, 18, 1, 6, '#3a2010'); R(22, 20, 6, 1, '#3a2010'); R(21, 18, 1, 6, '#2a6a4a'); R(28, 18, 1, 6, '#2a6a4a'); R(21, 24, 8, 1, '#6a4a30');
    });
  }

  // ---- mais bichos (adultos desenhados a mao; filhotes = adulto reduzido pela metade, com contorno refeito) ----
  function pinto() { return mk(8, 7, (R) => { R(1, 2, 5, 4, '#ffe45a'); R(5, 1, 2, 2, '#ffe45a'); R(7, 2, 1, 1, '#f2a622'); R(5, 2, 1, 1, '#1c1a28'); R(2, 6, 1, 1, '#f2a622'); R(4, 6, 1, 1, '#f2a622'); R(2, 3, 2, 2, '#f2cc30'); }); }
  function pato() {
    return mk(15, 12, (R, D) => {
      R(0, 4, 2, 2, '#e8e8e0'); D(6, 7, 4, '#f4f4ee'); R(3, 9, 7, 1, '#d4d4cc'); R(4, 6, 4, 3, '#dcdcd4'); D(11, 3, 2, '#2f8a4a'); R(10, 5, 3, 1, '#f4f4ee');
      R(13, 3, 3, 2, '#f2a622'); R(11, 2, 1, 1, '#1c1a28'); R(5, 11, 1, 2, '#f2a622'); R(8, 11, 1, 2, '#f2a622'); R(4, 13, 3, 1, '#f2a622'); R(7, 13, 3, 1, '#f2a622');
    });
  }
  function porco() {
    const c = '#f4a8a0', C = '#d4837c';
    return mk(24, 15, (R) => {
      R(2, 3, 14, 8, c); R(1, 4, 16, 6, c); R(2, 9, 14, 2, C); R(0, 3, 2, 2, c); R(0, 4, 1, 1, C);
      R(15, 2, 7, 8, c); R(20, 5, 4, 4, '#f08a8a'); R(21, 6, 1, 1, '#7a2a2a'); R(23, 6, 1, 1, '#7a2a2a'); R(17, 4, 1, 1, '#1c1a28'); R(15, 0, 3, 3, C); R(5, 5, 3, 2, C);
      R(3, 11, 3, 4, C); R(7, 11, 3, 4, c); R(11, 11, 3, 4, C); R(14, 11, 3, 4, c); R(3, 14, 3, 1, '#5a3a3a'); R(11, 14, 3, 1, '#5a3a3a');
    });
  }
  function cabra() {
    return mk(22, 17, (R) => {
      R(2, 4, 12, 6, '#e8e2d4'); R(1, 5, 14, 4, '#e8e2d4'); R(2, 9, 12, 1, '#c4bca8'); R(0, 3, 2, 2, '#e8e2d4');
      R(13, 1, 6, 6, '#e8e2d4'); R(17, 4, 4, 3, '#c4bca8'); R(20, 5, 1, 1, '#222'); R(15, 3, 1, 1, '#1c1a28'); R(14, 0, 1, 3, '#8a7a5a'); R(17, 0, 1, 3, '#8a7a5a'); R(16, 7, 2, 3, '#f4f0e6');
      R(3, 10, 2, 6, '#c4bca8'); R(6, 10, 2, 6, '#e8e2d4'); R(10, 10, 2, 6, '#c4bca8'); R(12, 10, 2, 6, '#e8e2d4'); R(3, 15, 2, 2, '#3a3a3a'); R(10, 15, 2, 2, '#3a3a3a');
    });
  }
  function ovelha() {
    return mk(22, 16, (R, D) => {
      D(7, 7, 6, '#f4f2ec'); D(12, 6, 5, '#f4f2ec'); D(4, 8, 4, '#f4f2ec'); D(9, 10, 5, '#e4e0d4'); D(7, 5, 3, '#fff');
      R(15, 4, 5, 6, '#4a4048'); R(19, 6, 2, 3, '#3a3238'); R(17, 6, 1, 1, '#f4f0e6'); R(14, 3, 2, 2, '#4a4048');
      R(5, 12, 2, 4, '#4a4048'); R(9, 12, 2, 4, '#4a4048'); R(12, 12, 2, 4, '#4a4048');
    });
  }
  function cavalo() {
    const c = '#9a5a30', C = '#7a4222';
    return mk(34, 28, (R) => {
      R(4, 8, 20, 10, c); R(3, 9, 22, 8, c); R(4, 16, 20, 2, C); R(0, 9, 4, 12, '#2a1a10'); R(1, 8, 3, 3, '#2a1a10');
      R(22, 1, 8, 12, c); R(27, 6, 7, 7, c); R(32, 9, 2, 2, '#2a1a10'); R(25, 3, 1, 2, '#1c1a28'); R(20, 0, 4, 12, '#2a1a10'); R(24, 0, 2, 3, c); R(28, 0, 2, 3, c);
      R(5, 18, 3, 10, C); R(9, 18, 3, 10, c); R(17, 18, 3, 10, C); R(21, 18, 3, 10, c); R(5, 26, 3, 2, '#1c1a28'); R(9, 26, 3, 2, '#1c1a28'); R(17, 26, 3, 2, '#1c1a28'); R(21, 26, 3, 2, '#1c1a28');
      R(8, 8, 8, 2, '#c0302a');
    });
  }
  function gato() {
    return mk(14, 11, (R) => {
      R(2, 4, 8, 4, '#e8943a'); R(1, 5, 10, 3, '#e8943a'); R(2, 7, 8, 1, '#c4742a'); R(3, 4, 1, 3, '#b8641e'); R(6, 4, 1, 3, '#b8641e');
      R(9, 1, 4, 5, '#e8943a'); R(9, 0, 1, 2, '#e8943a'); R(12, 0, 1, 2, '#e8943a'); R(10, 3, 1, 1, '#1c1a28'); R(12, 3, 1, 1, '#1c1a28'); R(11, 4, 1, 1, '#f08a8a');
      R(0, 1, 1, 5, '#e8943a'); R(2, 8, 2, 3, '#c4742a'); R(5, 8, 2, 3, '#e8943a'); R(8, 8, 2, 3, '#c4742a');
    });
  }
  const BICHOS = { galinha, pato, vaca, porco, cabra, ovelha, cavalo, cachorro, gato };
  // bicho(especie, filhote): filhote = metade do tamanho, redesenhado em grade menor (sem borrar)
  function bicho(e, filhote, anim = 0) {
    if (e === 'galinha' && filhote) return pinto();
    if (!filhote) return BICHOS[e](e === 'galinha' ? !!anim : e === 'cachorro' ? anim : undefined);
    const prev = opts.contorno; opts.contorno = false;
    const adulto = BICHOS[e](e === 'cachorro' ? anim : undefined); opts.contorno = prev;
    const w = adulto.width >> 1, h = adulto.height >> 1, o = document.createElement('canvas'); o.width = w; o.height = h;
    const sa = adulto.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, adulto.width, adulto.height), og = o.getContext('2d');
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
      const k = ((y * 2 + dy) * adulto.width + x * 2 + dx) * 4;
      if (sa.data[k + 3] > 0) { og.fillStyle = `rgb(${sa.data[k]},${sa.data[k + 1]},${sa.data[k + 2]})`; og.fillRect(x, y, 1, 1); break; }
    }
    return contorna(o);
  }
  return { bicho, opts, contorna, mk, fazendeiro, mulher, crianca, galinha, vaca, cachorro, arvore, celeiro, planta, casinha };
})();
