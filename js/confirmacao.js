/* ===========================================================
   OPENDAY — página de confirmação
   =========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const box = document.getElementById('codigo-inscricao');
  if(!box) return;

  const raw = sessionStorage.getItem('openday_ultima_inscricao');
  if(!raw){
    box.textContent = '—';
    document.getElementById('conf-nome').textContent = 'Nenhuma inscrição encontrada nesta sessão.';
    return;
  }
  const inscricao = JSON.parse(raw);
  box.textContent = inscricao.codigo;
  document.getElementById('conf-nome').textContent = inscricao.nome;
});
