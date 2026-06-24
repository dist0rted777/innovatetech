// Sticky nav border on scroll
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Mobile menu toggle
const toggle = document.getElementById('navToggle');
const menu = document.getElementById('navMenu');
toggle.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
menu.addEventListener('click', e => {
  if (e.target.tagName === 'A') { menu.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); }
});

// Scroll reveal
const io = new IntersectionObserver((entries) => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();
