/* ===========================================================
   OPENDAY — administração
   Login simples do lado do cliente (apenas para gerir conteúdo
   do front-end via localStorage). Quando ligares um backend,
   substitui checkLogin() por uma chamada de autenticação real.
   =========================================================== */

const ADMIN_SESSION_KEY = 'openday_admin_logado';
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'openday2026';

document.addEventListener('DOMContentLoaded', () => {
  initLogin();
  initLogout();
  initNav();
  if(sessionStorage.getItem(ADMIN_SESSION_KEY) === '1'){
    showDashboard();
  }
});

/* ---------------- Login ---------------- */
function initLogin(){
  const form = document.getElementById('form-login');
  if(!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const user = document.getElementById('admin-user').value.trim();
    const pass = document.getElementById('admin-pass').value;
    const erro = document.getElementById('login-error');
    if(user === ADMIN_USER && pass === ADMIN_PASS){
      sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
      showDashboard();
    }else{
      erro.textContent = 'Utilizador ou palavra-passe incorrectos.';
    }
  });
}

function initLogout(){
  const btn = document.getElementById('btn-logout');
  if(!btn) return;
  btn.addEventListener('click', e => {
    e.preventDefault();
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    location.reload();
  });
}

function showDashboard(){
  document.getElementById('login-shell').style.display = 'none';
  document.getElementById('admin-shell').style.display = 'grid';
  renderAll();
}

/* ---------------- Navegação entre vistas ---------------- */
function initNav(){
  document.querySelectorAll('.admin-nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const view = link.getAttribute('data-view');
      document.querySelectorAll('.admin-nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      document.querySelectorAll('.admin-view').forEach(v => {
        v.style.display = v.getAttribute('data-view') === view ? 'block' : 'none';
      });
      renderAll();
    });
  });
}

function renderAll(){
  const store = getStore();
  renderDashboard(store);
  renderInscricoes(store);
  renderFormadoresAdmin(store);
  renderProgramaAdmin(store);
  fillForm('form-evento', store.evento);
  fillForm('form-contactos', store.contactos);
}

function fillForm(id, dados){
  const form = document.getElementById(id);
  if(!form) return;
  Object.keys(dados).forEach(campo => {
    if(form.elements[campo]) form.elements[campo].value = dados[campo];
  });
}

function toast(msg){
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
}

/* ---------------- Dashboard ---------------- */
function renderDashboard(store){
  const stat = id => document.getElementById(id);
  if(!stat('stat-inscricoes')) return;
  stat('stat-inscricoes').textContent = store.inscricoes.length;
  stat('stat-vagas-total').textContent = store.evento.vagasTotal;
  stat('stat-vagas-disp').textContent = vagasDisponiveis(store);
  stat('stat-formadores').textContent = store.formadores.length;

  const tbody = document.querySelector('#tabela-dashboard tbody');
  tbody.innerHTML = store.inscricoes.slice(-5).reverse().map(i => `
    <tr><td>${i.nome}</td><td>${i.cidade}</td><td>${i.interesse}</td><td><span class="pill">${i.codigo}</span></td></tr>
  `).join('') || '<tr><td colspan="4" style="color:var(--text-muted);">Ainda sem inscrições.</td></tr>';
}

/* ---------------- Inscrições ---------------- */
function renderInscricoes(store){
  const tbody = document.querySelector('#tabela-inscricoes tbody');
  if(!tbody) return;
  tbody.innerHTML = store.inscricoes.slice().reverse().map((i, idxRev) => {
    const idx = store.inscricoes.length - 1 - idxRev;
    return `
    <tr>
      <td>${i.nome}</td>
      <td>${i.telefone}<br><span style="color:var(--text-muted);font-size:.8rem;">${i.email}</span></td>
      <td>${i.cidade}</td>
      <td>${i.profissao}</td>
      <td>${i.interesse}</td>
      <td><span class="pill">${i.codigo}</span></td>
      <td><button class="icon-btn danger" data-remover-inscricao="${idx}">Remover</button></td>
    </tr>`;
  }).join('') || '<tr><td colspan="7" style="color:var(--text-muted);">Ainda sem inscrições.</td></tr>';

  tbody.querySelectorAll('[data-remover-inscricao]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-remover-inscricao'));
      updateStore(s => { s.inscricoes.splice(idx, 1); });
      toast('Inscrição removida.');
      renderAll();
    });
  });

  const btnExport = document.getElementById('btn-export-csv');
  if(btnExport && !btnExport.dataset.bound){
    btnExport.dataset.bound = '1';
    btnExport.addEventListener('click', exportarCSV);
  }
}

function exportarCSV(){
  const { inscricoes } = getStore();
  if(!inscricoes.length){ toast('Não há inscrições para exportar.'); return; }
  const cabecalho = ['Nome','Telefone','Email','Cidade','Profissão','Empresa','Interesse','Código','Data'];
  const linhas = inscricoes.map(i => [i.nome,i.telefone,i.email,i.cidade,i.profissao,i.empresa,i.interesse,i.codigo,i.data]);
  const csv = [cabecalho, ...linhas].map(l => l.map(v => `"${String(v||'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'openday-inscricoes.csv';
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------------- Formadores ---------------- */
function renderFormadoresAdmin(store){
  const wrap = document.getElementById('lista-formadores');
  if(!wrap) return;
  const tpl = document.getElementById('tpl-formador');
  wrap.innerHTML = '';
  store.formadores.forEach(f => {
    const node = tpl.content.cloneNode(true);
    const card = node.querySelector('[data-formador-card]');
    card.querySelectorAll('[data-f]').forEach(input => { input.value = f[input.getAttribute('data-f')] || ''; });
    card.querySelector('[data-action="salvar-formador"]').addEventListener('click', () => {
      const atualizado = {};
      card.querySelectorAll('[data-f]').forEach(input => { atualizado[input.getAttribute('data-f')] = input.value.trim(); });
      updateStore(s => {
        const alvo = s.formadores.find(x => x.id === f.id);
        Object.assign(alvo, atualizado);
      });
      toast('Formador actualizado.');
      renderAll();
    });
    card.querySelector('[data-action="remover-formador"]').addEventListener('click', () => {
      updateStore(s => { s.formadores = s.formadores.filter(x => x.id !== f.id); });
      toast('Formador removido.');
      renderAll();
    });
    wrap.appendChild(node);
  });

  const btnNovo = document.getElementById('btn-novo-formador');
  if(btnNovo && !btnNovo.dataset.bound){
    btnNovo.dataset.bound = '1';
    btnNovo.addEventListener('click', () => {
      updateStore(s => {
        s.formadores.push({ id:'f'+Date.now(), nome:'Novo formador', especialidade:'', bio:'', foto:'' });
      });
      renderAll();
    });
  }
}

/* ---------------- Programa ---------------- */
function renderProgramaAdmin(store){
  const wrap = document.getElementById('lista-programa');
  if(!wrap) return;
  const tpl = document.getElementById('tpl-programa-item');
  wrap.innerHTML = '';
  store.programa.forEach((p, idx) => {
    const node = tpl.content.cloneNode(true);
    const card = node.querySelector('[data-programa-card]');
    card.querySelectorAll('[data-p]').forEach(input => { input.value = p[input.getAttribute('data-p')] || ''; });
    card.querySelector('[data-action="salvar-programa"]').addEventListener('click', () => {
      const atualizado = {};
      card.querySelectorAll('[data-p]').forEach(input => { atualizado[input.getAttribute('data-p')] = input.value.trim(); });
      updateStore(s => { Object.assign(s.programa[idx], atualizado); });
      toast('Item do programa actualizado.');
      renderAll();
    });
    card.querySelector('[data-action="remover-programa"]').addEventListener('click', () => {
      updateStore(s => { s.programa.splice(idx, 1); });
      toast('Item removido.');
      renderAll();
    });
    wrap.appendChild(node);
  });

  const btnNovo = document.getElementById('btn-novo-item-programa');
  if(btnNovo && !btnNovo.dataset.bound){
    btnNovo.dataset.bound = '1';
    btnNovo.addEventListener('click', () => {
      updateStore(s => { s.programa.push({ hora:'', titulo:'Novo item', desc:'' }); });
      renderAll();
    });
  }
}

/* ---------------- Evento & Contactos ---------------- */
document.addEventListener('submit', e => {
  if(e.target.id === 'form-evento'){
    e.preventDefault();
    const f = e.target;
    updateStore(s => {
      s.evento.data = f.data.value.trim();
      s.evento.horario = f.horario.value.trim();
      s.evento.duracao = f.duracao.value.trim();
      s.evento.local = f.local.value.trim();
      s.evento.endereco = f.endereco.value.trim();
      s.evento.vagasTotal = Number(f.vagasTotal.value) || 0;
    });
    toast('Dados do evento actualizados.');
    renderAll();
  }
  if(e.target.id === 'form-contactos'){
    e.preventDefault();
    const f = e.target;
    updateStore(s => {
      s.contactos.whatsapp = f.whatsapp.value.trim();
      s.contactos.telefone = f.telefone.value.trim();
      s.contactos.email = f.email.value.trim();
      s.contactos.localizacao = f.localizacao.value.trim();
      s.contactos.instagram = f.instagram.value.trim();
      s.contactos.facebook = f.facebook.value.trim();
      s.contactos.linkedin = f.linkedin.value.trim();
    });
    toast('Contactos actualizados.');
    renderAll();
  }
});
