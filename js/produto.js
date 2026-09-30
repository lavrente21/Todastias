/* ===========================================================
   OPENDAY — galeria da página de produto (brochura)
   =========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const thumbsWrap = document.getElementById('gallery-thumbs');
  const mainImg = document.getElementById('gallery-main-img');
  if(!thumbsWrap || !mainImg) return;

  thumbsWrap.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      thumbsWrap.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      mainImg.src = btn.getAttribute('data-full');
    });
  });
});
