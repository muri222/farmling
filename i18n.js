// Idiomas do Vidinha: pt (original) e en.
// A simulacao (sim.js) escreve os acontecimentos em portugues; I18N.tr() traduz na hora de mostrar (exato > regras > frases > substantivos).
// A IA responde direto no idioma escolhido (o prompt pede). Pra adicionar um idioma: copie o bloco 'en' de UI e de TR e troque os textos.
const I18N = (() => {
  const UI = {
    pt: {
      config: 'CONFIGURAÇÕES', voltar: 'Voltar', idioma: 'Idioma', canal: 'Canal', cor: 'Cor', crt: 'Efeito CRT', mestre: 'Volume geral', fx: 'Efeitos sonoros', voz: 'Voz do texto',
      vozes: { suave: 'suave', bichinho: 'bichinho', teclado: 'teclado', mudo: 'mudo' }, topo: 'Fixar no topo', barra: 'Mostrar na barra de tarefas', cerebro: 'Cérebro (IA)',
      esconder: 'Minimizar p/ bandeja', sair: 'Sair do jogo', sim: 'sim', nao: 'não', ligado: 'ligado', desligado: 'desligado', iaOn: 'ligada', iaOff: 'desligada',
      canais: ['ROÇA', 'CASA', 'VILA', 'DIÁRIO'], estacoes: ['Primavera', 'Verão', 'Outono', 'Inverno'], mudoVol: 'MUDO',
      anos: 'anos', vida: 'Vida', animo: 'Ânimo', terra: 'Terra', bichos: 'Bichos', filhos: 'Filhos', amigos: 'Amigos', vila: 'Vila',
      zoom: 'ZOOM', seguindo: 'SEGUINDO', tempo: 'TEMPO', pausa: 'PAUSA', tituloTela: 'Clique pra puxar conversa',
      dVida: 'VIDA Nº', dJeito: 'jeito', dSonho: 'sonho', dMedo: 'medo', dBichos: 'bichos', dConhece: 'conhece', dAprendeu: 'aprendeu', dVila: 'vila', dPessoas: 'pessoas',
      dUltimos: '— últimos —', dEcos: '— ecos —', dPrimeira: 'primeira vida', dRival: 'rival', dAmigo: 'amigo', dDescobrindo: 'ainda descobrindo',
      iaTitulo: 'Cérebro do personagem', iaTexto: 'Uma IA que roda no seu computador dá vida ao fazendeiro: ele conversa, cria personalidade, lições, visitantes e acontecimentos novos. Nada sai da sua máquina.',
      iaAviso: 'Sem a IA o mundo continua vivendo, mas o personagem só repete falas prontas: não surgem histórias, lições, visitantes nem cenas inventadas, e a experiência fica sempre igual. Recomendamos instalar.',
      iaPc: 'Seu PC', nucleos: 'núcleos', iaRecomendado: 'recomendado', iaInstalado: 'instalado', iaPesado: 'pode pesar no seu PC', iaEmUso: 'em uso',
      mLeve: 'Leve', mLeveD: 'Falas simples. Roda em qualquer PC, usa pouca memória.', mRec: 'Recomendado', mRecD: 'Bom equilíbrio: falas coerentes e histórias interessantes.',
      mProf: 'Profundo', mProfD: 'Mais inteligente e criativo, mas usa mais memória e processador.',
      iaUsar: 'Usar', iaBaixar: 'Baixar e usar', iaApagar: 'Apagar', iaNao: 'Agora não (sem IA)', iaFechar: 'Fechar', iaCancelar: 'Cancelar', iaSemIa: 'Sem IA: só falas prontas.',
      iaBaixando: 'Baixando', iaErro: 'Falhou', iaTentar: 'Tente de novo', iaMudar: 'Mudar / instalar IA',
      vozEstilo: 'Estilo da voz', chatTitulo: 'CONVERSA', chatDigite: 'Fale com ele…', chatEnviar: 'Enviar', chatVazio: 'Diga oi! Ele está te esperando.', chatSemIa: 'Sem IA instalada ele só responde com falas prontas. Ative o cérebro em ⚙.', conversar: 'Conversar', histTitulo: 'HISTÓRICO', tam: 'Tamanho do jogo', tams: ['Pequeno', 'Médio', 'Grande', 'Extra grande'], expandir: 'Expandir', diarioTitulo: 'DIÁRIO', mover: 'Arraste para mover',
    },
    en: {
      config: 'SETTINGS', voltar: 'Back', idioma: 'Language', canal: 'Channel', cor: 'Color', crt: 'CRT effect', mestre: 'Master volume', fx: 'Sound effects', voz: 'Text voice',
      vozes: { suave: 'soft', bichinho: 'critter', teclado: 'keyboard', mudo: 'mute' }, topo: 'Pin on top', barra: 'Show in taskbar', cerebro: 'Brain (AI)',
      esconder: 'Hide to tray', sair: 'Quit game', sim: 'yes', nao: 'no', ligado: 'on', desligado: 'off', iaOn: 'on', iaOff: 'off',
      canais: ['FARM', 'HOME', 'VILLAGE', 'DIARY'], estacoes: ['Spring', 'Summer', 'Autumn', 'Winter'], mudoVol: 'MUTE',
      anos: 'years', vida: 'Life', animo: 'Mood', terra: 'Land', bichos: 'Animals', filhos: 'Children', amigos: 'Friends', vila: 'Village',
      zoom: 'ZOOM', seguindo: 'FOLLOWING', tempo: 'TIME', pausa: 'PAUSED', tituloTela: 'Click to start a conversation',
      dVida: 'LIFE #', dJeito: 'nature', dSonho: 'dream', dMedo: 'fear', dBichos: 'animals', dConhece: 'knows', dAprendeu: 'learned', dVila: 'village', dPessoas: 'people',
      dUltimos: '— latest —', dEcos: '— echoes —', dPrimeira: 'first life', dRival: 'rival', dAmigo: 'friend', dDescobrindo: 'still figuring it out',
      iaTitulo: "The character's brain", iaTexto: 'An AI running on your own computer brings the farmer to life: he talks, develops a personality, lessons, visitors and new events. Nothing leaves your machine.',
      iaAviso: 'Without the AI the world keeps living, but the character only repeats canned lines: no invented stories, lessons, visitors or scenes, and the experience is always the same. We recommend installing it.',
      iaPc: 'Your PC', nucleos: 'cores', iaRecomendado: 'recommended', iaInstalado: 'installed', iaPesado: 'may be heavy for your PC', iaEmUso: 'in use',
      mLeve: 'Light', mLeveD: 'Simple lines. Runs on any PC, uses little memory.', mRec: 'Recommended', mRecD: 'Good balance: coherent lines and interesting stories.',
      mProf: 'Deep', mProfD: 'Smarter and more creative, but uses more memory and CPU.',
      iaUsar: 'Use', iaBaixar: 'Download and use', iaApagar: 'Delete', iaNao: 'Not now (no AI)', iaFechar: 'Close', iaCancelar: 'Cancel', iaSemIa: 'No AI: canned lines only.',
      iaBaixando: 'Downloading', iaErro: 'Failed', iaTentar: 'Try again', iaMudar: 'Change / install AI',
      vozEstilo: 'Voice style', chatTitulo: 'CHAT', chatDigite: 'Say something…', chatEnviar: 'Send', chatVazio: 'Say hi! He has been waiting for you.', chatSemIa: 'Without an installed AI he only answers with canned lines. Turn on the brain in ⚙.', conversar: 'Chat', histTitulo: 'HISTORY', tam: 'Game size', tams: ['Small', 'Medium', 'Large', 'Extra large'], expandir: 'Expand', diarioTitulo: 'DIARY', mover: 'Drag to move',
    },
  };

  // ---- traducao do texto que a simulacao gera (pt -> en) ----
  const EXATO = {
    'Opa! Que bom te ver por aí, amigo.': 'Hey! Good to see you around, friend.', 'Boa pergunta... deixa eu pensar nisso enquanto cuido da terra.': 'Good question... let me think about it while I tend the land.',
    'Choveu a semana inteira': 'It rained all week', 'O trator quebrou': 'The tractor broke down', 'Ganhou a rifa da igreja': 'Won the church raffle',
    'Uma geada queimou parte da roça': 'A frost burned part of the farm', 'Viu uma estrela cadente': 'Saw a shooting star', 'Teve festa junina na vila': 'There was a June festival in the village',
    'O cachorro sumiu três dias e voltou': 'The dog vanished for three days and came back', 'Achou uma moeda antiga arando a terra': 'Found an old coin while plowing',
    'Passou a noite olhando o céu': 'Spent the night watching the sky', 'Uma enchente levou parte da cerca': 'A flood washed away part of the fence',
    'Uma tempestade enorme caiu do nada': 'A huge storm came out of nowhere', 'Trovões sacudiram a roça a noite toda': 'Thunder shook the farm all night',
    'Nevou na roça, coisa nunca vista por aqui': 'It snowed on the farm, never seen around here', 'Amanheceu tudo branco de neve': 'Woke up to everything white with snow',
    'Uma névoa espessa cobriu tudo e os bichos ficaram inquietos': 'A thick fog covered everything and the animals grew restless', 'Um arco-íris duplo apareceu depois da chuva': 'A double rainbow appeared after the rain',
    'Uma luz estranha desceu do céu e pairou sobre o celeiro': 'A strange light came down from the sky and hovered over the barn', 'Algo prateado passou zunindo e sumiu': 'Something silver whizzed by and vanished',
    'A vila fez um festival e todo mundo foi dançar': 'The village held a festival and everyone went dancing', 'O dia virou noite por alguns minutos: um eclipse': 'Day turned to night for a few minutes: an eclipse',
    'Fogos de artifício estouraram sem motivo aparente': 'Fireworks burst for no apparent reason', 'Uma chuva de estrelas cadentes riscou o céu a noite inteira': 'A meteor shower streaked the sky all night',
    'Teve um sonho tão vivo que acordou sem saber qual vida era a sua': 'Had a dream so vivid he woke up not knowing which life was his',
    'A colheita foi fraca, quase nada vingou': 'The harvest was poor, almost nothing grew', 'Investiu em ferramentas melhores': 'Invested in better tools', 'Comprou mais um pedaço de terra': 'Bought another piece of land',
    'Foi à feira e puxou conversa com todo mundo': 'Went to the market and chatted with everyone', 'Um cachorro vira-lata adotou a roça': 'A stray dog adopted the farm',
    'Um gato apareceu e ficou pra caçar os ratos': 'A cat showed up and stayed to hunt the rats', 'Uma geada forte castigou a roça': 'A hard frost hit the farm', 'A seca apertou e a roça sofreu': 'A drought hit and the farm suffered',
    'Casamento na vila: música e dança até de manhã': 'Village wedding: music and dancing till morning',
    // falas prontas
    'A terra devolve o que a gente dá. Hoje ela tá generosa.': 'The land gives back what we give it. Today she is generous.', 'Tem dia que a enxada pesa mais que o normal.': 'Some days the hoe weighs more than usual.',
    'Contei uma piada pra vaca. Ela não riu, mas também não foi embora.': "Told the cow a joke. She didn't laugh, but she didn't leave either.", 'Trabalho calado. A roça não gosta de conversa fiada.': "I work in silence. The farm doesn't like small talk.",
    'Sonhei com uma roça que não era minha... mas era.': "I dreamed of a farm that wasn't mine... but it was.", 'Não acredito em sorte. Acredito em chuva na hora certa.': "I don't believe in luck. I believe in rain at the right time.",
    'Um dia esse morro inteiro vai ser meu, cê vai ver.': "One day this whole hill will be mine, you'll see.", 'Não preciso de muito. Café, sombra e a terra quieta.': "I don't need much. Coffee, shade and quiet land.",
    'Cê ainda tá aí me olhando? Bom saber que tem alguém do outro lado.': "You're still there watching me? Good to know someone is on the other side.",
    // perfil e visitantes
    'ver o mar uma vez': 'see the sea once', 'ter a maior roça da região': 'own the biggest farm in the region', 'tocar sanfona numa festa': 'play the accordion at a party', 'construir uma casa de dois andares': 'build a two-story house',
    'conhecer a capital': 'visit the capital', 'deixar uma família grande': 'leave a big family', 'trovoada': 'thunderstorms', 'ficar sozinho': 'being alone', 'a seca': 'drought', 'perder a terra': 'losing the land', 'escuro': 'the dark', 'cobra': 'snakes',
    'fala com as galinhas': 'talks to the hens', 'assobia ao acordar': 'whistles on waking up', 'confere a cerca três vezes': 'checks the fence three times', 'guarda moedas numa lata': 'keeps coins in a tin',
    'conta as estrelas': 'counts the stars', 'cheira a terra antes de plantar': 'smells the soil before planting', 'já foi marinheiro por um verão': 'was a sailor for one summer', 'perdeu uma aposta e ganhou uma vaca': 'lost a bet and won a cow',
    'viu o pai plantar a primeira muda': 'watched his father plant the first seedling', 'fugiu de casa aos dez anos e voltou no dia seguinte': 'ran away from home at ten and came back the next day',
    'aprendeu a ler sozinho': 'taught himself to read', 'foi salvo de um rio por um cachorro': 'was saved from a river by a dog',
    'ainda está descobrindo o que funciona': 'still figuring out what works',
  };
  const FRASES = [ // trechos soltos
    ['a cerca da divisa', 'the boundary fence'], ['as galinhas que invadiram a horta', 'the hens that invaded the garden'], ['um empréstimo não pago', 'an unpaid loan'], ['uma fofoca sobre a colheita', 'gossip about the harvest'],
    ['uma aposta perdida', 'a lost bet'], ['o preço de um bezerro', 'the price of a calf'],
    ['viajante cansado', 'weary traveler'], ['vendedor de sementes', 'seed seller'], ['artista de circo', 'circus performer'], ['forasteiro misterioso', 'mysterious stranger'], ['professor aposentado', 'retired teacher'],
    ['pescador da cidade', 'fisherman from town'], ['músico andarilho', 'wandering musician'], ['engenheiro perdido', 'lost engineer'], ['cigano', 'gypsy'],
    ['casado com', 'married to'], ['namorando', 'dating'], ['sozinho', 'alone'], ['sem filhos', 'no children'], ['filhos:', 'children:'],
    ['primavera', 'spring'], ['verão', 'summer'], ['outono', 'autumn'], ['inverno', 'winter'],
  ];
  const SUBST = { // palavras soltas (singular e plural), sem acento obrigatorio
    galinha: 'hen', galinhas: 'hens', pato: 'duck', patos: 'ducks', porco: 'pig', porcos: 'pigs', cabra: 'goat', cabras: 'goats', ovelha: 'sheep', ovelhas: 'sheep', vaca: 'cow', vacas: 'cows',
    cavalo: 'horse', cavalos: 'horses', cachorro: 'dog', cachorros: 'dogs', gato: 'cat', gatos: 'cats',
    pintinho: 'chick', pintinhos: 'chicks', patinho: 'duckling', patinhos: 'ducklings', leitão: 'piglet', leitões: 'piglets', cabrito: 'kid', cabritos: 'kids', cordeiro: 'lamb', cordeiros: 'lambs',
    bezerro: 'calf', bezerros: 'calves', potro: 'foal', potros: 'foals', filhote: 'pup', filhotes: 'pups', gatinho: 'kitten', gatinhos: 'kittens',
    padeiro: 'baker', padeira: 'baker', professor: 'teacher', professora: 'teacher', ferreiro: 'blacksmith', ferreira: 'blacksmith', costureiro: 'tailor', costureira: 'tailor', pescador: 'fisher', pescadora: 'fisher',
    curandeiro: 'healer', curandeira: 'healer', leiteiro: 'dairy worker', leiteira: 'dairy worker', carpinteiro: 'carpenter', carpinteira: 'carpenter', feirante: 'market seller', músico: 'musician', música: 'musician',
    otimista: 'optimistic', melancólico: 'melancholic', sério: 'serious', brincalhão: 'playful', cético: 'skeptical', místico: 'mystic', sossegado: 'laid-back', ambicioso: 'ambitious', equilibrado: 'balanced',
    ferroviário: 'railway worker', ferroviária: 'railway worker', sapateiro: 'shoemaker', sapateira: 'shoemaker',
  };
  const subst = txt => txt.replace(/(?<![\p{L}])[\p{L}]+(?![\p{L}])/gu, w => SUBST[w.toLowerCase()] ? (w[0] === w[0].toUpperCase() && w.length > 1 && w !== w.toLowerCase() ? SUBST[w.toLowerCase()][0].toUpperCase() + SUBST[w.toLowerCase()].slice(1) : SUBST[w.toLowerCase()]) : w);
  let tr; // (definida abaixo) usada pelas regras recursivas
  const REGRAS = [
    [/^Colheita farta! Rendeu \$(\d+)$/, 'Bountiful harvest! Earned $$$1'],
    [/^Comprou um casal de (.+)$/, 'Bought a pair of $1'], [/^Comprou (?:um|uma) (.+)$/, 'Bought a $1'],
    [/^Vendeu (?:um|uma) (.+) pra não faltar comida$/, "Sold a $1 so food wouldn't run short"], [/^Faltou comida e (?:um|uma) (.+) não aguentou$/, "Food ran short and a $1 didn't make it"],
    [/^(?:Um|Uma) (.+) adoeceu e não resistiu$/, "A $1 fell ill and didn't survive"], [/^(.+) morreu de velhice$/, '$1 died of old age'], [/^Uma raposa levou (?:um|uma) (.+)$/, 'A fox took a $1'],
    [/^Nasceu?ram (\d+) (.+)$/, '$1 $2 were born'], [/^Nasceu um (.+)$/, 'A $1 was born'],
    [/^Conheceu (.+), (.+)$/, 'Met $1, the $2'], [/^(.+) virou (?:amigo|amiga)$/, '$1 became a friend'], [/^Desavença com (.+) por causa de (.+)$/, 'Fell out with $1 over $2'], [/^Fez as pazes com (.+)$/, 'Made peace with $1'],
    [/^(.+) espalhou uma fofoca sobre a roça$/, '$1 spread gossip about the farm'], [/^(.+) soltou os bichos por vingança$/, '$1 let the animals loose out of spite'], [/^(.+) cobrou uma dívida antiga na frente de todos$/, '$1 called in an old debt in front of everyone'],
    [/^(.+) faleceu$/, '$1 passed away'], [/^(.+) e (.+) se casaram na vila$/, '$1 and $2 got married in the village'], [/^(.+) teve um bebê, filho de (.+)$/, '$1 had a baby, child of $2'], [/^(.+) teve um bebê$/, '$1 had a baby'],
    [/^Se apaixonou por (.+)$/, 'Fell in love with $1'], [/^Casou com (.+)$/, 'Married $1'], [/^Casamento de (.+) e (.+)$/, 'Wedding of $1 and $2'], [/^O namoro com (.+) acabou$/, 'The relationship with $1 ended'],
    [/^(.+) foi embora pra cidade$/, '$1 left for the city'], [/^(.+) adoeceu e partiu$/, '$1 fell ill and passed away'], [/^Nasceu (.+), (?:filha|filho) de (.+)$/, '$1 was born, child of $2'],
    [/^(.+) cresceu e foi morar na vila$/, '$1 grew up and moved to the village'], [/^Chegou (.+), (.+)$/, '$1, a $2, arrived'], [/^(.+) seguiu viagem$/, '$1 moved on'],
    [/^(.+) descansou aos (\d+) anos$/, '$1 passed away at $2'], [/^Vida nº (\d+): (.+) começa sua roça$/, 'Life #$1: $2 starts their farm'],
    [/^Já são (\d+) anos nessa lida\. Passa rápido, viu\.$/, "That's $1 years at this work already. Time flies."], [/^Tá (.+)\. Cada estação pede um jeito de trabalhar\.$/, "It's $1. Every season asks for its own way of working."],
    [/^Tenho (.+) aqui na roça\. Dá trabalho, mas dá companhia\.$/, 'I have $1 here on the farm. It is work, but it is company.'], [/^Sabe o que eu queria\? (.+)\.$/, 'You know what I wanted? To $1.'],
    [/^Tenho medo de (.+), mas não conta pra ninguém\.$/, "I'm afraid of $1, but don't tell anyone."], [/^Dizem que eu (.+)\. É verdade\.$/, "They say I $1. It's true."],
    [/^(.+) é gente boa\. Faz falta quando some\.$/, '$1 is good people. I miss them when they are gone.'], [/^(.+) ainda me deve uma explicação\. Mas deixa pra lá\.$/, 'Still owes me an explanation. But never mind.'],
    [/^Sabe o que foi\? (.+)\. Fiquei pensando nisso\.$/, (m, x) => `You know what it was? ${tr(x)}. Been thinking about it.`], [/^(.+) disse que eu falo sozinho\. Eu falo é com você\.$/, "$1 says I talk to myself. I'm talking to you."],
    [/^(.+) anda por aqui\. Tem história pra contar, esse (.+)\.$/, '$1 is around. Has stories to tell, that $2.'], [/^(.+)\. Cê viu isso também\?$/, (m, x) => `${tr(x)}. Did you see that too?`],
    [/^Às vezes lembro de um tal de (.+)\. Nunca conheci\. Estranho, né\?$/, "Sometimes I remember someone called $1. Never met them. Strange, huh?"], [/^Vou levando, (.+) hoje\. E você\?$/, (m, h) => `Getting by, feeling ${tr(h) === 'animado' ? 'cheerful' : h === 'abatido' ? 'down' : 'calm'} today. And you?`], [/^Sou (.+), tenho (\d+) anos e vivo dessa roça\.$/, "I'm $1, I'm $2 years old and I live off this farm."],
    [/^Que lugar bonito, (.+)\.$/, 'What a lovely place, $1.'],
    [/^(.+): viveu (\d+) anos, (?:amou (.+)|nunca se apaixonou), (\d+) filho\(s\), (\d+) pedaço\(s\) de terra$/, (m, n, a, l, f, t) => `${n}: lived ${a} years, ${l ? 'loved ' + l.replace(' e ', ' and ') : 'never fell in love'}, ${f} child(ren), ${t} plot(s) of land`],
  ];
  tr = (txt, lang) => {
    lang ||= cur;
    if (lang === 'pt' || !txt) return txt;
    if (EXATO[txt]) return EXATO[txt];
    let out = txt;
    for (const [re, rep] of REGRAS) if (re.test(out)) { out = out.replace(re, rep); break; }
    for (const [pt, en] of FRASES) out = out.split(pt).join(en);
    return subst(out);
  };

  let cur = 'pt';
  const t = (k, d) => { const v = (UI[cur] || UI.pt)[k] ?? UI.pt[k] ?? k; return d ? v : v; };
  return { UI, t, tr, set: l => { if (UI[l]) cur = l; }, get: () => cur, idiomas: { pt: 'Português', en: 'English' } };
})();
if (typeof module !== 'undefined') module.exports = I18N;
