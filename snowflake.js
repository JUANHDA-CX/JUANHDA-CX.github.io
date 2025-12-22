(function () {
  if (document.getElementById("canvas-nieve-navidad")) return;

  const isMobile = window.innerWidth < 768;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  // === SETTINGS ===
  const config = {
    darkSnowPath: "./src/snowflakeWhite.svg",
    whiteSnowPath: "./src/snowflakeDark.svg",
    amount: isMobile ? 30 : 120,
    baseSpeed: 64,
    windAngle: 85,
    turbulence: isMobile ? 0.5 : 1.0,
    maxRotationSpeed: 2.0,
    minSize: 8,
    maxSize: 26,
    minOpacity: 0.2,
    maxOpacity: 0.8,
    zIndex: 9999,
  };

  let canvas, ctx, cssWidth, cssHeight;
  const flakes = [];

  let windVec = { x: 0, y: 0 };
  updateWindVector(config.windAngle);

  // Imágenes
  const imgWhite = new Image();
  const imgDark = new Image();
  let currentImage = null;

  // (Delta Time)
  let lastTime = 0;
  let running = false;
  let rafId = null;
  let resizeTimer = null;

  function updateWindVector(angleDeg) {
    const rad = (angleDeg * Math.PI) / 180;
    windVec.x = Math.cos(rad);
    windVec.y = Math.sin(rad);
  }

  // --- Gestión de Tema ---
  function getThemeImage() {
    const theme = localStorage.getItem("theme") || "light";
    return theme === "dark" ? imgWhite : imgDark;
  }

  function updateTheme() {
    currentImage = getThemeImage();
  }

  // Función global para llamar desde el toggle de tema
  window.updateSnowTheme = updateTheme;

  // --- Canvas ---
  function createCanvas() {
    canvas = document.createElement("canvas");
    canvas.id = "canvas-nieve-navidad";
    Object.assign(canvas.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: config.zIndex,
    });
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });

    resize();
  }

  function resize() {
    cssWidth = window.innerWidth;
    cssHeight = window.innerHeight;

    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // --- Clase Copo ---
  class Flake {
    constructor() {
      this.init(true);
    }

    init(randomY = false) {
      this.x = Math.random() * cssWidth;
      this.y = randomY ? Math.random() * cssHeight : -config.maxSize - 10;

      // PARALAJE: El tamaño define la velocidad y opacidad.
      const depth = Math.random();

      this.size = config.minSize + depth * (config.maxSize - config.minSize);

      // Velocidad basada en profundidad
      const speedMult = 0.5 + depth * 0.8;
      this.speed = config.baseSpeed * speedMult;

      // Turbulencia
      this.turbulenceAngle = Math.random() * Math.PI * 2;
      this.turbulenceSpeed = (0.5 + Math.random()) * 2; // Rads por segundo
      this.amplitude = config.turbulence * (depth * 20);

      // Rotación
      this.rotation = Math.random() * Math.PI * 2;
      this.spinSpeed = (Math.random() - 0.5) * config.maxRotationSpeed;

      this.alpha =
        config.minOpacity + depth * (config.maxOpacity - config.minOpacity);
    }

    update(dt) {
      this.turbulenceAngle += this.turbulenceSpeed * dt;

      // Movimiento
      const sway = Math.cos(this.turbulenceAngle) * this.amplitude * dt; // Oscilación lateral
      const windX = windVec.x * this.speed * dt;
      const windY = windVec.y * this.speed * dt;

      this.x += windX + sway;
      this.y += windY; // Gravedad/Viento vertical

      this.rotation += this.spinSpeed * dt;

      // Reciclaje (Resetear si sale de pantalla)
      const buffer = config.maxSize + 20;

      if (this.y > cssHeight + buffer) {
        this.init(false);
      } else if (this.x > cssWidth + buffer) {
        this.x = -buffer;
      } else if (this.x < -buffer) {
        this.x = cssWidth + buffer;
      }
    }

    draw() {
      // No dibujar si está fuera de vista
      if (this.y < -config.maxSize * 2) return;

      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.drawImage(
        currentImage,
        -this.size / 2,
        -this.size / 2,
        this.size,
        this.size
      );
      ctx.restore();
    }
  }

  // --- Loop Principal ---
  function loop(timestamp) {
    if (!running) return;

    // Calcular Delta Time (dt) en segundos
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    ctx.clearRect(0, 0, cssWidth, cssHeight);

    for (let i = 0; i < flakes.length; i++) {
      flakes[i].update(dt);
      flakes[i].draw();
    }

    rafId = requestAnimationFrame(loop);
  }

  // --- Eventos y Control ---
  function onResize() {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const oldH = cssHeight;
      resize();
    }, 200);
  }

  function onVisibilityChange() {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(rafId);
    } else {
      running = true;
      lastTime = performance.now();
      rafId = requestAnimationFrame(loop);
    }
  }

  // --- Inicialización ---
  async function init() {
    createCanvas();

    // Cargar imágenes
    const p1 = new Promise((r) => {
      imgWhite.onload = r;
      imgWhite.src = config.whiteSnowPath;
    });
    const p2 = new Promise((r) => {
      imgDark.onload = r;
      imgDark.src = config.darkSnowPath;
    });

    try {
      await Promise.all([p1, p2]);
    } catch (e) {
      console.warn("Error cargando nieve", e);
    }

    updateTheme();

    // Crear copos
    for (let i = 0; i < config.amount; i++) {
      flakes.push(new Flake());
    }

    // Listeners
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange, {
      passive: true,
    });

    window.addEventListener(
      "storage",
      (e) => {
        if (e.key === "theme") updateTheme();
      },
      { passive: true }
    );

    running = true;
    lastTime = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
