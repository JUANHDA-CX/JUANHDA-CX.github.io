// Halloween bat swarm.
// Same canvas pattern as snowflake.js, but the bats fly erratically instead of falling.

(function () {
  if (document.getElementById("canvas-murcielagos-halloween")) return;

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  const isMobile = window.innerWidth < 768;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  // === SETTINGS ===
  const config = {
    // Theme assets. The pale bat is used on dark mode, the dark one on light mode.
    darkBatPath: "./src/batWhite.svg",
    lightBatPath: "./src/batDark.svg",

    // Population
    amount: isMobile ? 5 : 12,

    // Size in px (wingspan). The height keeps the artwork's ratio.
    minSize: 24,
    maxSize: 64,
    aspectRatio: 2999 / 1998.84,

    // Flight
    minSpeed: 65,
    maxSpeed: 150,
    wanderStrength: 1.8,
    wanderDamping: 2.4,
    maxPitch: 0.55,
    turnChance: 0.35,
    margin: 60,

    // Turn animation: the bank eases through zero instead of flipping.
    turnDuration: 0.5,
    turnCooldownMin: 0.9,
    turnCooldownMax: 2.2,

    // Wing flap and banking
    flapSpeed: 9,
    flapDepth: 0.45,
    bankStrength: 0.6,

    // Look
    minOpacity: 0.45,
    maxOpacity: 0.9,

    // Stacking: 9999 flies above the page like the snow, lower it to fly behind content.
    zIndex: 9999,
    // The gallery viewer backdrop sits at z-index 3, so the swarm drops behind it.
    viewerZIndex: 2,
  };

  let canvas, ctx, cssWidth, cssHeight;
  const bats = [];

  // Imágenes
  const imgDark = new Image(); // Used on the dark theme.
  const imgLight = new Image(); // Used on the light theme.
  let currentImage = null;

  // Delta time
  let lastTime = 0;
  let running = false;
  let rafId = null;
  let resizeTimer = null;
  let viewerPaused = false;

  // --- Gestión de Tema ---
  function getThemeImage() {
    const theme = localStorage.getItem("theme") || "light";
    return theme === "dark" ? imgDark : imgLight;
  }

  function updateTheme() {
    currentImage = getThemeImage();
  }

  // Global hook called from the theme toggle in main.js.
  window.updateBatTheme = updateTheme;

  // --- Canvas ---
  function createCanvas() {
    canvas = document.createElement("canvas");
    canvas.id = "canvas-murcielagos-halloween";
    canvas.style.zIndex = config.zIndex;
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d", { alpha: true });

    resize();
  }

  function resize() {
    cssWidth = window.innerWidth;
    cssHeight = window.innerHeight;

    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // --- Clase Murciélago ---
  class Bat {
    constructor() {
      // PARALAJE: el tamaño define velocidad y opacidad.
      const depth = Math.random();

      this.width = config.minSize + depth * (config.maxSize - config.minSize);
      this.height = this.width / config.aspectRatio;
      this.speed = config.minSpeed + depth * (config.maxSpeed - config.minSpeed);
      this.alpha =
        config.minOpacity + depth * (config.maxOpacity - config.minOpacity);

      // Horizontal heading: -1 flies left, 1 flies right.
      this.dir = Math.random() < 0.5 ? -1 : 1;

      // Bank sign, eased through zero during a turn instead of flipping.
      this.bankSign = this.dir;
      this.turning = false;
      this.turnTime = 0;
      this.turnFrom = this.dir;
      this.turnCooldown = 0;
      this.turnDip = 1;

      // Vertical heading: a damped random walk inside [-maxPitch, maxPitch].
      this.pitch = (Math.random() - 0.5) * config.maxPitch;
      this.pitchVel = (Math.random() - 0.5) * config.wanderStrength;

      // Wing flap and banking
      this.phase = Math.random() * Math.PI * 2;
      this.flap = 1;
      this.bank = 0;

      this.x = Math.random() * cssWidth;
      this.y = Math.random() * cssHeight;
    }

    beginTurn() {
      if (this.turning) return;

      this.turning = true;
      this.turnTime = 0;
      this.turnFrom = this.dir;
      this.turnFlipped = false;
    }

    update(dt) {
      if (this.turnCooldown > 0) this.turnCooldown -= dt;

      // Sudden direction changes: the bat doubles back on itself.
      if (
        !this.turning &&
        this.turnCooldown <= 0 &&
        Math.random() < config.turnChance * dt
      ) {
        this.beginTurn();
        this.pitchVel += (Math.random() - 0.5) * 2.4;
      }

      // Turn animation: the bank eases through zero, so the Z rotation never
      // jumps from one side to the other in a single frame.
      if (this.turning) {
        this.turnTime += dt;

        const progress = Math.min(this.turnTime / config.turnDuration, 1);
        const eased = progress * progress * (3 - 2 * progress);

        this.bankSign = this.turnFrom * Math.cos(Math.PI * eased);
        this.turnDip = 1 - 0.85 * Math.sin(Math.PI * progress);

        // Reverse the travel at the halfway point, while the bank is level
        // and the horizontal speed is at its lowest.
        if (progress >= 0.5 && !this.turnFlipped) {
          this.turnFlipped = true;
          this.dir = -this.turnFrom;
        }

        if (progress >= 1) {
          this.turning = false;
          this.dir = -this.turnFrom;
          this.bankSign = this.dir;
          this.turnDip = 1;
          this.turnCooldown =
            config.turnCooldownMin +
            Math.random() * (config.turnCooldownMax - config.turnCooldownMin);
        }
      }

      // Smooth random walk of the flight angle.
      this.pitchVel += (Math.random() - 0.5) * config.wanderStrength * 4 * dt;
      this.pitchVel *= Math.exp(-config.wanderDamping * dt);
      this.pitch += this.pitchVel * dt;

      // Turn before reaching the edge: a full turn takes real distance.
      const turnLead = config.margin + this.speed * config.turnDuration;

      if (!this.turning) {
        if (this.dir > 0 && this.x > cssWidth - turnLead) this.beginTurn();
        else if (this.dir < 0 && this.x < turnLead) this.beginTurn();
      }

      // Soft vertical steering, so they never hug the top or bottom edge.
      if (this.y < config.margin) {
        this.pitch += (config.maxPitch - this.pitch) * 2 * dt;
        this.pitchVel = Math.max(this.pitchVel, 0.3);
      } else if (this.y > cssHeight - config.margin) {
        this.pitch += (-config.maxPitch - this.pitch) * 2 * dt;
        this.pitchVel = Math.min(this.pitchVel, -0.3);
      }

      this.pitch = Math.max(
        -config.maxPitch,
        Math.min(config.maxPitch, this.pitch)
      );

      // Slow down through the turn, so the reversal is not a jolt.
      this.x += this.dir * this.speed * this.turnDip * Math.cos(this.pitch) * dt;
      this.y += this.speed * Math.sin(this.pitch) * dt;

      // Wing flap: squash the wingspan instead of adding sprite frames.
      this.phase += config.flapSpeed * dt;
      this.flap = 1 - config.flapDepth * Math.abs(Math.sin(this.phase));

      // Bank toward the travel direction, scaled by how steeply it climbs or
      // dives. The sign always matches the horizontal heading.
      this.bank = Math.abs(this.pitch) * config.bankStrength * this.bankSign;
    }

    draw() {
      if (!currentImage || !currentImage.complete || !currentImage.naturalWidth)
        return;

      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.bank);
      ctx.scale(this.dir, this.flap);
      ctx.drawImage(
        currentImage,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
      ctx.restore();
    }
  }

  // --- Loop Principal ---
  function loop(timestamp) {
    if (!running) return;

    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    ctx.clearRect(0, 0, cssWidth, cssHeight);

    for (let i = 0; i < bats.length; i++) {
      bats[i].update(dt);
      bats[i].draw();
    }

    rafId = requestAnimationFrame(loop);
  }

  // --- Eventos y Control ---
  function start() {
    if (running || viewerPaused || document.hidden) return;

    running = true;
    lastTime = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    if (!running) return;

    running = false;
    cancelAnimationFrame(rafId);
  }

  function onResize() {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  }

  function onVisibilityChange() {
    if (document.hidden) stop();
    else start();
  }

  // The gallery viewer dispatches these events when it opens and closes.
  function onViewerOpen() {
    viewerPaused = true;
    if (canvas) canvas.style.zIndex = config.viewerZIndex;
    stop();
  }

  function onViewerClose() {
    viewerPaused = false;
    if (canvas) canvas.style.zIndex = config.zIndex;
    start();
  }

  // --- Inicialización ---
  async function init() {
    createCanvas();

    const load = (img, src) =>
      new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = () => {
          console.warn("Error cargando murciélago", src);
          resolve();
        };
        img.src = src;
      });

    await Promise.all([
      load(imgLight, config.lightBatPath),
      load(imgDark, config.darkBatPath),
    ]);

    updateTheme();

    for (let i = 0; i < config.amount; i++) {
      bats.push(new Bat());
    }

    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange, {
      passive: true,
    });
    document.addEventListener("viewerOpen", onViewerOpen, { passive: true });
    document.addEventListener("viewerClose", onViewerClose, { passive: true });

    window.addEventListener(
      "storage",
      (e) => {
        if (e.key === "theme") updateTheme();
      },
      { passive: true }
    );

    start();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
