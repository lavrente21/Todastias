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
    const qrBoxVazio = document.getElementById('qr-box');
    if(qrBoxVazio) qrBoxVazio.style.display = 'none';
    return;
  }
  const inscricao = JSON.parse(raw);
  box.textContent = inscricao.codigo;
  document.getElementById('conf-nome').textContent = inscricao.nome;

  const qrImg = document.getElementById('qr-img');
  if(qrImg){
    const dados = encodeURIComponent(inscricao.codigo);
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${dados}`;
  }
});
