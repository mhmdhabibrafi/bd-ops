let audioCtx;
function playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.03) {
  try {
    if (typeof window === 'undefined' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch {
    // Graceful fallback
  }
}
function playBedeChime() {
  playTone(523.25, 'triangle', 0.12, 0.03);
  setTimeout(() => playTone(659.25, 'triangle', 0.16, 0.03), 80);
  setTimeout(() => playTone(783.99, 'triangle', 0.22, 0.025), 160);
}
function playSwitchTone() {
  playTone(440, 'sine', 0.09, 0.02);
  setTimeout(() => playTone(554.37, 'sine', 0.12, 0.02), 60);
}

function spawnSparkles(originEl) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!originEl) return;
  const rect = originEl.getBoundingClientRect();
  const colors = ['#38bdf8', '#818cf8', '#c084fc', '#60a5fa', '#f472b6', '#34d399'];
  for (let i = 0; i < 8; i++) {
    const spark = document.createElement('div');
    spark.className = 'sparkle-particle';
    const angle = (Math.PI * 2 * i) / 8 + (Math.random() - 0.5);
    const dist = 30 + Math.random() * 40;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist - 25;
    spark.style.setProperty('--tx', `${tx}px`);
    spark.style.setProperty('--ty', `${ty}px`);
    spark.style.color = colors[i % colors.length];
    spark.style.backgroundColor = colors[i % colors.length];
    spark.style.left = `${rect.left + rect.width / 2}px`;
    spark.style.top = `${rect.top + rect.height / 2}px`;
    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 700);
  }
}

const fields = {
  build: { symbol: 'code', title: 'Turn \u201cwhat if\u201d into \u201cit works.\u201d', description: 'From your first application to your next big idea. Explore software, exchange perspectives, and build with people who share your curiosity.', tags: ['Web Development', 'Mobile Development', 'Software Engineering'] },
  design: { symbol: 'palette', title: 'Make ideas feel right.', description: 'Connect creativity with purpose. Explore interfaces and user experiences that make technology more useful, intuitive, and human.', tags: ['UI & UX Design', 'Prototyping', 'Creative Exploration'] },
  data: { symbol: 'neurology', title: 'Find possibilities in the data.', description: 'Ask better questions, discover meaningful patterns, and experiment with intelligence that helps solve real problems.', tags: ['Data & Artificial Intelligence', 'AI Integration', 'Experimentation'] },
  systems: { symbol: 'dns', title: 'Build the foundations that last.', description: 'Explore how reliable systems work. Connect infrastructure, security, and automation to keep great ideas running.', tags: ['Cybersecurity', 'Cloud Computing', 'DevOps', 'Database & Backend Engineering', 'Automation'] }
};
const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectField(tab, userInitiated = false) {
  const field = fields[tab.dataset.field];
  tabs.forEach(item => { item.setAttribute('aria-selected', String(item === tab)); item.tabIndex = item === tab ? 0 : -1; });
  const panel = document.querySelector('#field-content');
  panel.setAttribute('aria-labelledby', tab.id);
  panel.classList.remove('field-animate');
  void panel.offsetWidth;
  panel.classList.add('field-animate');
  panel.querySelector('.field-symbol').textContent = field.symbol;
  panel.querySelector('h3').textContent = field.title;
  panel.querySelector('p').textContent = field.description;
  const tagsEl = panel.querySelector('.tags');
  if (tagsEl) {
    tagsEl.replaceChildren(...field.tags.map(label => { const tag = document.createElement('span'); tag.textContent = label; return tag; }));
  }
  if (userInitiated) playSwitchTone();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectField(tab, true));
  tab.addEventListener('keydown', event => {
    let next;
    if (['ArrowRight', 'ArrowDown'].includes(event.key)) next = (index + 1) % tabs.length;
    if (['ArrowLeft', 'ArrowUp'].includes(event.key)) next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); tabs[next].focus(); selectField(tabs[next], true); }
  });
});

const messages = [
  "Hey, ready to learn, collaborate, and build together?",
  "Hey, your curiosity belongs here. Let's build something great!",
  "Hey, great ideas are always built together. Welcome to BDOPS!"
];
let helloCount = 0;
let helloOverlayTimer;

function openHelloOverlay(message) {
  const overlay = document.querySelector('#bede-hello-overlay');
  if (!overlay) return;

  const textEl = document.querySelector('#bede-hello-text');
  if (textEl) textEl.textContent = message;

  const progressBar = overlay.querySelector('.bede-hello-progress-bar');
  if (progressBar) {
    progressBar.style.animation = 'none';
    void progressBar.offsetWidth;
    progressBar.style.animation = 'countdownBar 5s linear forwards';
  }

  const avatar = overlay.querySelector('.bede-hello-avatar');
  if (avatar) {
    avatar.style.animation = 'none';
    void avatar.offsetWidth;
    avatar.style.animation = '';
  }

  overlay.classList.add('active');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('bede-overlay-open');

  const figure = overlay.querySelector('.bede-hello-figure');
  if (figure) spawnSparkles(figure);

  clearTimeout(helloOverlayTimer);
  helloOverlayTimer = setTimeout(() => {
    closeHelloOverlay();
  }, 5000);
}

function closeHelloOverlay() {
  const overlay = document.querySelector('#bede-hello-overlay');
  if (!overlay) return;
  clearTimeout(helloOverlayTimer);
  overlay.classList.remove('active');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('bede-overlay-open');
}

const helloOverlay = document.querySelector('#bede-hello-overlay');
if (helloOverlay) {
  helloOverlay.addEventListener('click', (e) => {
    if (e.target.closest('.bede-hello-close') || e.target.classList.contains('bede-hello-backdrop') || e.target === helloOverlay) {
      closeHelloOverlay();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && helloOverlay.classList.contains('active')) {
      closeHelloOverlay();
    }
  });
}

function sayHello(e) {
  const message = messages[helloCount++ % messages.length];
  const msgEl = document.querySelector('.bede-message');
  if (msgEl) msgEl.textContent = message;
  playBedeChime();
  if (e && e.currentTarget) spawnSparkles(e.currentTarget);
  openHelloOverlay(message);
}
document.querySelector('.mascot-button').addEventListener('click', sayHello);
document.querySelector('.hello-button').addEventListener('click', sayHello);
document.querySelector('#year').textContent = new Date().getFullYear();
function notifyBede(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 4500);
  playBedeChime();
}
document.querySelectorAll('[data-greeting]').forEach(button => button.addEventListener('click', () => notifyBede(button.dataset.greeting)));
const moods = {
  cool: ['A little confidence. A lot of possibility.', 'BEDE wearing sunglasses'],
  idea: ['Every big thing starts with a little idea.', 'BEDE holding a light bulb'],
  code: ['In the zone. Building something that matters.', 'BEDE coding on a laptop'],
  love: ['Different people. One big community heart.', 'BEDE holding a heart'],
  celebrate: ['Small wins deserve big celebrations!', 'BEDE jumping in celebration'],
  sleep: ['Even builders need a little recharge.', 'BEDE sleeping peacefully']
};
const moodThemes = {
  cool: { glow: 'rgba(56, 189, 248, 0.35)', border: 'rgba(56, 189, 248, 0.5)' },
  idea: { glow: 'rgba(251, 191, 36, 0.35)', border: 'rgba(251, 191, 36, 0.5)' },
  code: { glow: 'rgba(99, 102, 241, 0.35)', border: 'rgba(99, 102, 241, 0.5)' },
  love: { glow: 'rgba(244, 63, 94, 0.35)', border: 'rgba(244, 63, 94, 0.5)' },
  celebrate: { glow: 'rgba(168, 85, 247, 0.35)', border: 'rgba(168, 85, 247, 0.5)' },
  sleep: { glow: 'rgba(129, 140, 248, 0.35)', border: 'rgba(129, 140, 248, 0.5)' }
};
const portrait = document.querySelector('.bede-portrait');
let poseRequest = 0;
document.querySelectorAll('[data-pose]').forEach(button => button.addEventListener('click', async (e) => {
  const request = ++poseRequest;
  const pose = button.dataset.pose;
  const target = document.querySelector('#bede-expression');
  const asset = new Image();
  asset.src = `${import.meta.env.BASE_URL}bede-${pose}.png`;
  try { await asset.decode(); } catch { notifyBede('BEDE is taking a moment. Please try again.'); return; }
  if (request !== poseRequest) return;
  target.src = asset.src;
  target.alt = moods[pose][1];
  target.classList.remove('pose-pop');
  void target.offsetWidth;
  target.classList.add('pose-pop');
  const caption = document.querySelector('#bede-caption');
  if (caption) caption.textContent = moods[pose][0];
  document.querySelectorAll('[data-pose]').forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); });
  playSwitchTone();
  if (e && e.currentTarget) spawnSparkles(e.currentTarget);
}));

/* ==========================================================================
   ANIMATION SYSTEM: Scroll-Reveal + Ticker Marquee + Micro-Interactions
   ========================================================================== */
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {

  /* 1. Scroll-reveal with fade-up */
  const revealTargets = document.querySelectorAll(
    '.section-label, .section-heading, .split > *, .intro > *, .statement, ' +
    '.audience, .field-panel, .card, .principle-row article, .project-board, ' +
    '.bede-portrait, .bede-section > div:last-child, .vision .split > *, ' +
    '.join-inner, .small-note, ' +
    '.footer-heading, .footer-top > *, .footer-wordmark, .footer-bottom'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  revealTargets.forEach(el => revealObserver.observe(el));

  /* 2. Staggered activity-grid cards */
  document.querySelectorAll('.activity-grid').forEach(grid => {
    const cards = grid.querySelectorAll('.card');
    const gridObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          cards.forEach((card, i) => {
            card.style.transitionDelay = `${i * 80}ms`;
            card.classList.add('revealed');
          });
          gridObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    gridObserver.observe(grid);
  });

  /* 3. Staggered principle-row articles */
  document.querySelectorAll('.principle-row').forEach(row => {
    const articles = row.querySelectorAll('article');
    const rowObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          articles.forEach((article, i) => {
            article.style.transitionDelay = `${i * 100}ms`;
            article.classList.add('revealed');
          });
          rowObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    rowObserver.observe(row);
  });

  /* 4. Ticker marquee infinite scroll */
  const tickerInner = document.querySelector('.ticker > div');
  if (tickerInner) {
    tickerInner.style.animation = 'tickerScroll 25s linear infinite';
  }

  /* 5. Hero entrance stagger animation */
  const heroCenter = document.querySelector('.hero-center');
  const heroStage = document.querySelector('.hero-stage');
  if (heroCenter) {
    [...heroCenter.children].forEach((child, i) => {
      child.style.opacity = '0';
      child.style.transform = 'translateY(28px)';
      child.style.transition = `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${200 + i * 130}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${200 + i * 130}ms`;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        child.style.opacity = '1';
        child.style.transform = 'translateY(0)';
      }));
    });
  }
  if (heroStage) {
    heroStage.style.opacity = '0';
    heroStage.style.transform = 'translateY(32px) scale(0.97)';
    heroStage.style.transition = 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) 500ms, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 500ms';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      heroStage.style.opacity = '1';
      heroStage.style.transform = 'translateY(0) scale(1)';
    }));
  }




  /* 8. Interactive Card Spotlight Follow */
  document.querySelectorAll('.card, .hero-stage, .bede-portrait, .project-board, .field-panel, .about-showcase, .statement').forEach(card => {
    card.addEventListener('pointermove', e => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });
  });

  /* 9. Scroll Progress Indicator */
  const scrollProgressBar = document.querySelector('#scroll-progress');
  if (scrollProgressBar) {
    window.addEventListener('scroll', () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const progress = (window.scrollY / totalScroll) * 100;
        scrollProgressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
      }
    }, { passive: true });
  }
}

