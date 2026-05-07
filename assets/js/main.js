// Nav: scrolled state
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// Mobile menu
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
burger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
document.querySelectorAll('.nav__mobile-link').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// Scroll-in animations
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Contact form
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const success = document.getElementById('formSuccess');
    success.classList.add('visible');
    this.querySelectorAll('input, textarea, select').forEach(el => el.value = '');
    setTimeout(() => success.classList.remove('visible'), 5000);
  });
}

// Werkwijze: animated line fill on scroll
const stepLine = document.getElementById('stepLine');
if (stepLine) {
  const track = stepLine.closest('.stappen-track');
  const updateLine = () => {
    const rect = track.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0,
      (window.innerHeight - rect.top) / (rect.height + window.innerHeight * 0.4)
    ));
    stepLine.style.height = (progress * 100) + '%';
  };
  window.addEventListener('scroll', updateLine, { passive: true });
  updateLine();
}

// Hero animations (homepage only)
const heroTitle = document.querySelector('.hero__title');
if (heroTitle) {
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&!?';

  function scrambleNode(node, delay, duration) {
    const isText   = node.nodeType === 3;
    const original = node.textContent;
    const plain    = original.trim();
    const lead     = original.slice(0, original.indexOf(plain[0]));
    const total    = Math.round(duration / 16);
    let f = 0;
    setTimeout(() => {
      const id = setInterval(() => {
        const out = Array.from(plain).map((ch, i) => {
          if (ch === ' ') return ' ';
          const revealAt = Math.floor(i / plain.length * total * 0.55);
          return f > revealAt ? ch : CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join('');
        node.textContent = lead + out;
        if (++f >= total) { node.textContent = original; clearInterval(id); }
      }, 16);
    }, delay);
  }

  const lineNode = Array.from(heroTitle.childNodes).find(n => n.nodeType === 3 && n.textContent.trim());
  const gradSpan = heroTitle.querySelector('.gradient-text');
  if (lineNode) scrambleNode(lineNode, 280, 950);
  if (gradSpan)  scrambleNode(gradSpan, 650, 780);

  // Stats counter
  setTimeout(() => {
    document.querySelectorAll('.hero__stats .stat strong').forEach(el => {
      const raw    = el.textContent.trim();
      const num    = parseInt(raw);
      const suffix = raw.replace(/[0-9]/g, '');
      if (isNaN(num)) return;
      let start = null;
      const step = ts => {
        if (!start) start = ts;
        const p    = Math.min((ts - start) / 1000, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(ease * num) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, 1500);

  // Mouse parallax on background circles
  const heroEl = document.querySelector('.hero');
  heroEl?.addEventListener('mousemove', e => {
    const { left, top, width, height } = heroEl.getBoundingClientRect();
    const x = (e.clientX - left) / width  - 0.5;
    const y = (e.clientY - top)  / height - 0.5;
    document.documentElement.style.setProperty('--cx1', `${x * -44}px`);
    document.documentElement.style.setProperty('--cy1', `${y * -44}px`);
    document.documentElement.style.setProperty('--cx2', `${x *  30}px`);
    document.documentElement.style.setProperty('--cy2', `${y *  30}px`);
  }, { passive: true });
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
