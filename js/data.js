/* ===========================================================
   OPENDAY — camada de dados
   Front-end apenas: guarda tudo em localStorage neste browser.
   Quando ligares um backend, substitui getStore()/setStore()
   por chamadas fetch() à tua API — o resto do site não muda.
   =========================================================== */

const OPENDAY_KEY = 'openday_store_v1';

const OPENDAY_DEFAULTS = {
  evento: {
    nome: 'OpenDay',
    subtitulo: 'Lapidação e Avaliação de Diamantes',
    conceito: 'Da lapidação ao valor',
    data: '02 de Dezembro de 2026',
    horario: '[HORÁRIO A DEFINIR]',
    duracao: '[DURAÇÃO A DEFINIR]',
    local: 'Luanda, Angola',
    endereco: '[MORADA A DEFINIR]',
    mapaUrl: '',
    vagasTotal: 40,
    gratuito: true,
    preco: '',
    organizacao: 'IOROM — Academia de Formação Mineira',
    parceiro: 'SODIAM, E.P. — Empresa Nacional de Comercialização de Diamantes de Angola'
  },
  contactos: {
    whatsapp: '+244 936 971 225',
    telefone: '+244 936 971 225',
    email: '[email protected]',
    site: 'www.openday.co.ao',
    instagram: '',
    facebook: '',
    linkedin: '',
    localizacao: 'Luanda, Angola'
  },
  formadores: [
    {
      id: 'f1',
      nome: '[Nome do Formador]',
      especialidade: 'Gemologista · Avaliação de Diamantes',
      bio: 'Especialista com percurso na análise e certificação de pedras preciosas, com foco em critérios internacionais de qualidade.',
      foto: ''
    },
    {
      id: 'f2',
      nome: '[Nome do Formador]',
      especialidade: 'Mestre Lapidador',
      bio: 'Dedicado à lapidação de diamantes, une técnica tradicional e precisão moderna na transformação da pedra bruta.',
      foto: ''
    },
    {
      id: 'f3',
      nome: '[Nome do Formador]',
      especialidade: 'Especialista em Classificação',
      bio: 'Actua na identificação e aplicação de padrões técnicos de classificação ao longo da cadeia de valor diamantífera.',
      foto: ''
    },
    {
      id: 'f4',
      nome: '[Nome do Formador]',
      especialidade: 'Consultor · Indústria Mineira',
      bio: 'Acompanha projectos de formação e desenvolvimento profissional ligados à exploração e comercialização de diamantes.',
      foto: ''
    }
  ],
  programa: [
    { hora: '09:00', titulo: 'Introdução ao Diamante', desc: 'Origem, formação e características fundamentais da pedra.' },
    { hora: '10:15', titulo: 'Lapidação', desc: 'Técnicas, ferramentas e o processo de dar forma e brilho ao diamante.' },
    { hora: '11:30', titulo: 'Avaliação', desc: 'Critérios de análise: cor, clareza, corte e quilate (os 4 C).' },
    { hora: '13:00', titulo: 'Qualidade e Classificação', desc: 'Padrões internacionais de certificação e classificação.' },
    { hora: '14:30', titulo: 'Demonstração Prática', desc: 'Sessão prática de lapidação e avaliação, acompanhada pelos formadores.' }
  ],
  inscricoes: []
};

function getStore(){
  try{
    const raw = localStorage.getItem(OPENDAY_KEY);
    if(!raw) { setStore(OPENDAY_DEFAULTS); return structuredClone(OPENDAY_DEFAULTS); }
    const parsed = JSON.parse(raw);
    // garante que campos novos nos defaults existem em stores antigos
    return {
      evento: { ...OPENDAY_DEFAULTS.evento, ...(parsed.evento||{}) },
      contactos: { ...OPENDAY_DEFAULTS.contactos, ...(parsed.contactos||{}) },
      formadores: parsed.formadores && parsed.formadores.length ? parsed.formadores : OPENDAY_DEFAULTS.formadores,
      programa: parsed.programa && parsed.programa.length ? parsed.programa : OPENDAY_DEFAULTS.programa,
      inscricoes: parsed.inscricoes || []
    };
  }catch(e){
    console.error('Erro ao ler dados do OpenDay:', e);
    return structuredClone(OPENDAY_DEFAULTS);
  }
}

function setStore(store){
  try{
    localStorage.setItem(OPENDAY_KEY, JSON.stringify(store));
    return true;
  }catch(e){
    console.error('Erro ao guardar dados do OpenDay:', e);
    return false;
  }
}

function updateStore(mutator){
  const store = getStore();
  mutator(store);
  setStore(store);
  return store;
}

function gerarCodigoInscricao(){
  const ano = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random()*9000);
  return `OD-${ano}-${rand}`;
}

function vagasOcupadas(store){
  return (store.inscricoes||[]).length;
}

function vagasDisponiveis(store){
  return Math.max(0, (store.evento.vagasTotal||0) - vagasOcupadas(store));
}
