/* ===========================================================
   OPENDAY — formulário de inscrição
   =========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-inscricao');
  if(!form) return;

  const store = getStore();
  const btn = document.getElementById('btn-submit');
  const note = document.getElementById('vagas-note');

  if(vagasDisponiveis(store) <= 0){
    btn.disabled = true;
    btn.textContent = 'Vagas esgotadas';
    note.innerHTML = 'As vagas para esta edição do OpenDay estão esgotadas. Contacte-nos para saber sobre a próxima edição.';
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');

    const dados = {
      nome: form.nome.value.trim(),
      telefone: form.telefone.value.trim(),
      email: form.email.value.trim(),
      cidade: form.cidade.value.trim(),
      profissao: form.profissao.value.trim(),
      empresa: form.empresa.value.trim(),
      interesse: form.interesse.value
    };

    let valido = true;
    const obrigatorios = ['nome','telefone','email','cidade','profissao','interesse'];
    obrigatorios.forEach(campo => {
      if(!dados[campo]){
        valido = false;
        setErro(campo, 'Campo obrigatório.');
      }
    });
    if(dados.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)){
      valido = false;
      setErro('email', 'E-mail inválido.');
    }
    if(!valido) return;

    const storeAtual = getStore();
    if(vagasDisponiveis(storeAtual) <= 0){
      note.innerHTML = 'As vagas esgotaram-se enquanto preenchia o formulário. Contacte-nos directamente.';
      btn.disabled = true;
      return;
    }

    const codigo = gerarCodigoInscricao();
    const inscricao = {
      ...dados,
      codigo,
      data: new Date().toISOString()
    };

    updateStore(s => { s.inscricoes.push(inscricao); });
    sessionStorage.setItem('openday_ultima_inscricao', JSON.stringify(inscricao));

    window.location.href = 'confirmacao.html';
  });
});

function setErro(campo, msg){
  const el = document.querySelector(`[data-error-for="${campo}"]`);
  if(el) el.textContent = msg;
}
