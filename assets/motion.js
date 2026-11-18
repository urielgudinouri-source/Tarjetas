'use strict';
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* Aparecer al hacer scroll */
  const io = new IntersectionObserver((list) => list.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target; io.unobserve(el); el.classList.add('in');
    setTimeout(() => el.classList.remove('reveal', 'in'), 1300 + parseInt(el.style.transitionDelay || 0, 10));
  }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  const SEL = '.section-heading,.steps-grid .step-card,.sample-card,.closing,.catalog-intro,.group,.collection-panel,.examples-footnote';
  const scan = () => document.querySelectorAll(SEL).forEach((el) => {
    if (el.dataset.rv) return;
    el.dataset.rv = 1;
    el.style.transitionDelay = `${([...el.parentElement.children].indexOf(el) % 4) * 90}ms`;
    el.classList.add('reveal'); io.observe(el);
  });
  scan(); new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });

  /* Las estrellas y las tarjetas del inicio siguen un poco al cursor */
  const hero = document.querySelector('.hero'), hv = document.querySelector('.hero-visual');
  if (hero && hv && matchMedia('(hover: hover)').matches) hero.addEventListener('mousemove', (e) => {
    const r = hero.getBoundingClientRect();
    hv.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5).toFixed(3));
    hv.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5).toFixed(3));
  });

  /* Luz que sigue al cursor en los bloques */
  document.addEventListener('pointermove', (e) => {
    const c = e.target.closest && e.target.closest('.step-card'); if (!c) return;
    const r = c.getBoundingClientRect(); c.style.setProperty('--mx', `${e.clientX - r.left}px`); c.style.setProperty('--my', `${e.clientY - r.top}px`);
  });

  /* La vista previa "rebota" cuando cambias el estilo */
  const pv = document.getElementById('preview'), fm = document.getElementById('card-form');
  if (pv && fm) fm.addEventListener('click', (e) => {
    if (!e.target.closest('.chip,.sw,.star')) return;
    pv.classList.remove('bump'); void pv.offsetWidth; pv.classList.add('bump');
  });
})();
