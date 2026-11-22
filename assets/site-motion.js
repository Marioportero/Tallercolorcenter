// Animaciones de la web del taller: entradas al hacer scroll (una sola vez), la nota de Google que sube
// y la chincheta del mapa. Sin script, todo se ve quieto y completo: la clase .rv solo la pone este archivo.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window)) return;

  // qué entra y en qué grupos se escalonan (los hermanos de un grupo entran uno tras otro)
  const groups = [
    'main > section:not(.hero) .section-head',
    '#servicios .rows > li',
    '#trabajos .wall__big, #trabajos .wall__grid > figure',
    '#taller .rows > li',
    '#seguros .rows > li, #seguros .insurers, #seguros .badge-frame',
    '#ventajas .tile',
    '#opiniones .rating, #opiniones .btn-row, #opiniones .review',
    '#presupuesto .visit, #presupuesto .form-panel',
    'footer.closing .section-head--split, footer.closing .close-pair > *',
  ];
  const items = [];
  groups.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      if (el.closest('.hero, [data-moment]')) return;          // el inicio y la foto que se revela tienen su propia entrada
      el.classList.add('rv-item');
      el.style.setProperty('--rv-d', Math.min(i, 5) * 70 + 'ms');  // escalonado de 70 ms, como mucho 5 pasos
      items.push(el);
    });
  });
  if (!items.length) return;
  root.classList.add('rv');

  // la nota 4,6 sube desde 0,0 con el mismo ritmo que las estrellas
  const countUp = el => {
    const end = parseFloat(el.textContent.replace(',', '.'));
    if (reduce || !end) return;
    const t0 = performance.now(), dur = 1100;
    const ease = t => 1 - Math.pow(1 - t, 3);
    const tick = now => {
      const t = Math.min(1, (now - t0) / dur);
      el.textContent = (end * ease(t)).toFixed(1).replace('.', ',');
      if (t < 1) requestAnimationFrame(tick);
    };
    el.textContent = '0,0';
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      const score = e.target.querySelector('.rating__score');
      if (score) countUp(score);
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  items.forEach(el => io.observe(el));

  // la chincheta cae cuando el mapa aparece
  const map = document.querySelector('.map-card');
  if (map) {
    map.classList.add('pin-wait');
    new IntersectionObserver((es, obs) => es.forEach(e => {
      if (e.isIntersecting) { setTimeout(() => map.classList.add('pin-in'), reduce ? 0 : 350); obs.disconnect(); }
    }), { threshold: 0.4 }).observe(map);
  }
})();
