/* ===========================
   CONFETTI
=========================== */
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');

let W, H;
function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const COLORS = ['#f7a8c4','#f5c842','#7ecba1','#c9a6e8','#f08080','#7ec8e3','#ffb347'];
const SHAPES = ['circle','rect','triangle'];

class Particle {
  constructor(burst = false, bx = W/2, by = H/2) {
    this.burst = burst;
    if (burst) {
      this.x = bx;
      this.y = by;
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 8;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - 6;
      this.alpha = 1;
      this.decay = 0.015 + Math.random() * 0.015;
    } else {
      this.x  = Math.random() * W;
      this.y  = -20;
      this.vx = (Math.random() - 0.5) * 1.5;
      this.vy = 1 + Math.random() * 2.5;
      this.alpha = 1;
    }
    this.color  = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.shape  = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    this.size   = 6 + Math.random() * 10;
    this.angle  = Math.random() * Math.PI * 2;
    this.spin   = (Math.random() - 0.5) * 0.18;
    this.gravity = burst ? 0.25 : 0;
  }

  update() {
    this.x     += this.vx;
    this.y     += this.vy;
    this.angle += this.spin;
    if (this.burst) {
      this.vy    += this.gravity;
      this.alpha -= this.decay;
    } else {
      this.vy += 0.015;
    }
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle   = this.color;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    if (this.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.shape === 'rect') {
      ctx.fillRect(-this.size/2, -this.size/4, this.size, this.size/2);
    } else {
      ctx.beginPath();
      ctx.moveTo(0, -this.size/2);
      ctx.lineTo(this.size/2, this.size/2);
      ctx.lineTo(-this.size/2, this.size/2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  isDead() {
    if (this.burst) return this.alpha <= 0;
    return this.y > H + 20;
  }
}

/* Ambient falling confetti */
let particles = [];
for (let i = 0; i < 60; i++) {
  const p = new Particle();
  p.y = Math.random() * H; // start scattered
  particles.push(p);
}

function loop() {
  ctx.clearRect(0, 0, W, H);

  // spawn new ambient pieces
  if (Math.random() < 0.4) particles.push(new Particle());

  particles = particles.filter(p => !p.isDead());
  particles.forEach(p => { p.update(); p.draw(); });

  requestAnimationFrame(loop);
}
loop();

/* Burst on card pick */
function confettiBurst(x, y) {
  for (let i = 0; i < 60; i++) {
    particles.push(new Particle(true, x, y));
  }
}

/* ===========================
   CARD INTERACTIONS
=========================== */
function pick(btn) {
  const card = btn.closest('.card');
  if (card.classList.contains('picked')) return;

  card.classList.add('picked');

  const choice = card.dataset.choice;

  // Burst from card center
  const rect = card.getBoundingClientRect();
  const cx = rect.left + rect.width  / 2;
  const cy = rect.top  + rect.height / 2;
  confettiBurst(cx, cy);

  // Show modal
  document.getElementById('modal-text').textContent =
    `Wybrałaś: „${choice}". Już się cieszę! 🥰`;
  document.getElementById('modal').classList.add('active');
}

function closeModal() {
  document.getElementById('modal').classList.remove('active');
}

// Close on overlay click
document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});
