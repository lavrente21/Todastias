/* ===========================================================
   OPENDAY — comportamento partilhado das páginas públicas
   =========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileNav();
  initReveal();
  markActiveNav();
  renderVagasBadges();
  renderEventoInfo();
  renderContactos();
  renderFormadores();
  renderPrograma();
});

/* Header muda de aparência ao rolar */
function initHeader(){
  const header = document.querySelector('.site-header');
  if(!header) return;
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 30);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive:true });
}

/* Menu mobile */
function initMobileNav(){
  const toggle = document.querySelector('.nav-toggle');
  const list = document.querySelector('.nav-list');
  if(!toggle || !list) return;
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    list.classList.toggle('open');
  });
  list.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    toggle.classList.remove('open');
    list.classList.remove('open');
  }));
}

/* Marca o link activo consoante a página actual */
function markActiveNav(){
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-list a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if(href === path) a.classList.add('active');
  });
}

/* Animação de entrada ao rolar (um único tipo de reveal, discreto) */
function initReveal(){
  const items = document.querySelectorAll('.reveal');
  if(!items.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); obs.unobserve(e.target); } });
  }, { threshold:.15 });
  items.forEach(i => obs.observe(i));
}

/* Badges "X vagas disponíveis" onde existirem no HTML */
function renderVagasBadges(){
  const targets = document.querySelectorAll('[data-vagas-disponiveis]');
  if(!targets.length) return;
  const store = getStore();
  const disponiveis = vagasDisponiveis(store);
  targets.forEach(el => { el.textContent = disponiveis; });
  const bar = document.querySelector('[data-vagas-bar]');
  if(bar){
    const pct = store.evento.vagasTotal ? Math.min(100,(vagasOcupadas(store)/store.evento.vagasTotal)*100) : 0;
    bar.style.width = pct + '%';
  }
}

/* Preenche data/hora/local onde marcado com data-evento="campo" */
function renderEventoInfo(){
  const targets = document.querySelectorAll('[data-evento]');
  if(!targets.length) return;
  const { evento } = getStore();
  targets.forEach(el => {
    const campo = el.getAttribute('data-evento');
    if(evento[campo] !== undefined) el.textContent = evento[campo];
  });
}

/* Preenche contactos onde marcado com data-contacto="campo" */
function renderContactos(){
  const targets = document.querySelectorAll('[data-contacto]');
  if(!targets.length) return;
  const { contactos } = getStore();
  targets.forEach(el => {
    const campo = el.getAttribute('data-contacto');
    const valor = contactos[campo];
    if(!valor) { el.closest('.contact-row, .social-row a')?.classList.add('sr-only'); return; }
    if(el.tagName === 'A'){
      if(campo === 'email') el.href = 'mailto:' + valor;
      else if(campo === 'whatsapp') el.href = 'https://wa.me/' + valor.replace(/\D/g,'');
      else if(campo === 'telefone') el.href = 'tel:' + valor.replace(/\D/g,'');
      else if(campo === 'site') el.href = valor.startsWith('http') ? valor : 'https://' + valor;
      else if(['instagram','facebook','linkedin'].includes(campo)) el.href = valor;
    }
    if(el.hasAttribute('data-contacto-text')) el.textContent = valor;
  });
}

/* Grelha de formadores (página Formadores e prévia na Home) */
function renderFormadores(){
  const grid = document.querySelector('[data-formadores-grid]');
  if(!grid) return;
  const { formadores } = getStore();
  const limite = grid.hasAttribute('data-limit') ? Number(grid.getAttribute('data-limit')) : formadores.length;
  grid.innerHTML = formadores.slice(0, limite).map(f => `
    <article class="trainer reveal">
      <div class="trainer-photo">
        ${f.foto ? `<img src="${escapeHtml(f.foto)}" alt="${escapeHtml(f.nome)}">` : diamondIconSvg()}
      </div>
      <h3>${escapeHtml(f.nome)}</h3>
      <span class="role">${escapeHtml(f.especialidade)}</span>
      <p>${escapeHtml(f.bio)}</p>
    </article>
  `).join('');
  initReveal();
}

/* Lista do programa (sequência real → numerada) */
function renderPrograma(){
  const list = document.querySelector('[data-programa-list]');
  if(!list) return;
  const { programa } = getStore();
  list.innerHTML = programa.map((p,i) => `
    <div class="program-item reveal">
      <div class="program-num">${String(i+1).padStart(2,'0')}</div>
      <div>
        <span class="program-time">${escapeHtml(p.hora)}</span>
        <h3>${escapeHtml(p.titulo)}</h3>
        <p>${escapeHtml(p.desc)}</p>
      </div>
    </div>
  `).join('');
  initReveal();
}

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

function diamondIconSvg(){
  return `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 16L24 6L39 16L24 42L9 16Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M9 16H39M16 16L24 42L14.5 16M32 16L24 42L33.5 16" stroke="currentColor" stroke-width="1"/>
  </svg>`;
}
