(function () {
  if (document.getElementById("canvas-nieve-navidad")) return;

  const isMobile = window.innerWidth < 768;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  // === SETTINGS ===
  const config = {
    darkSnowPath: "./src/snowflakeWhite.svg",
    whiteSnowPath: "./src/snowflakeDark.svg",
    amount: isMobile ? 30 : 120, // Un poco más de cantidad
    baseSpeed: 50, // Pixeles por segundo (adaptado a Delta Time)
    windAngle: 85,
    turbulence: isMobile ? 0.5 : 1.0,
    maxRotationSpeed: 2.0, // Radianes por segundo
    minSize: 8,
    maxSize: 26,
    minOpacity: 0.2,
    maxOpacity: 0.8,
    zIndex: 9999, // Asegurar que se vea
  };

  let canvas, ctx, cssWidth, cssHeight;
  const flakes = [];

  // Pre-calcular vector de viento normalizado
  let windVec = { x: 0, y: 0 };
  updateWindVector(config.windAngle);

  // Imágenes
  const imgWhite = new Image();
  const imgDark = new Image();
  let currentImage = null; // La imagen activa (bitmap o elemento)

  // Control de tiempo (Delta Time)
  let lastTime = 0;
  let running = false;
  let rafId = null;
  let resizeTimer = null;

  // --- Helpers ---
  function updateWindVector(angleDeg) {
    const rad = (angleDeg * Math.PI) / 180;
    windVec.x = Math.cos(rad);
    windVec.y = Math.sin(rad);
  }

  // --- Gestión de Tema (Optimizado) ---
  // Eliminamos el polling y usamos eventos o llamadas directas
  function getThemeImage() {
    const theme = localStorage.getItem("theme") || "light";
    return theme === "dark" ? imgWhite : imgDark;
  }

  function updateTheme() {
    currentImage = getThemeImage();
  }

  // Exponer función global para que tu UI la llame al cambiar el toggle
  window.updateSnowTheme = updateTheme;

  // --- Configuración Canvas ---
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
    // 'desynchronized' ayuda a reducir latencia en algunos navegadores

    resize();
  }

  function resize() {
    cssWidth = window.innerWidth;
    cssHeight = window.innerHeight;

    // Evitamos reasignar width/height si no cambiaron drásticamente para no parpadear
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
      // Más grande = Más cerca = Más rápido y visible.
      const depth = Math.random(); // 0 (lejos) a 1 (cerca)

      this.size = config.minSize + depth * (config.maxSize - config.minSize);

      // Velocidad basada en profundidad (depth)
      const speedMult = 0.5 + depth * 0.8;
      this.speed = config.baseSpeed * speedMult;

      // Turbulencia
      this.turbulenceAngle = Math.random() * Math.PI * 2;
      this.turbulenceSpeed = (0.5 + Math.random()) * 2; // Rads por segundo
      this.amplitude = config.turbulence * (depth * 20); // Más amplitud si está cerca

      // Rotación
      this.rotation = Math.random() * Math.PI * 2;
      this.spinSpeed = (Math.random() - 0.5) * config.maxRotationSpeed;

      this.alpha =
        config.minOpacity + depth * (config.maxOpacity - config.minOpacity);
    }

    update(dt) {
      // Avanzar ángulo de turbulencia
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

      // Chequeo límites optimizado
      if (this.y > cssHeight + buffer) {
        this.init(false); // Reiniciar arriba
      } else if (this.x > cssWidth + buffer) {
        this.x = -buffer;
      } else if (this.x < -buffer) {
        this.x = cssWidth + buffer;
      }
    }

    draw() {
      // Pequeña optimización: No dibujar si está fuera de vista (aunque el update lo maneja)
      if (this.y < -config.maxSize * 2) return;

      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      // Dibujamos centrado
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
    // Limitamos dt para evitar saltos enormes si la pestaña estuvo inactiva
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    ctx.clearRect(0, 0, cssWidth, cssHeight);

    // Iteración inversa (micro-optimización en JS, aunque hoy día V8 lo maneja bien)
    // Usamos for clásico que es más rápido que forEach
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
      // Solo reiniciamos tamaños, no los copos (para que no desaparezcan de golpe)
      const oldH = cssHeight;
      resize();
      // Si la pantalla creció mucho verticalmente, quizás queramos rellenar huecos,
      // pero por fluidez es mejor dejar que caigan.
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

    // Esperar a que carguen (evita parpadeo inicial)
    try {
      await Promise.all([p1, p2]);
    } catch (e) {
      console.warn("Error cargando nieve", e);
    }

    // Usamos createImageBitmap si está disponible para mejor rendimiento GPU
    // NOTA: Para simplificar y evitar problemas de CORS o compatibilidad SVG,
    // usamos el objeto Image directamente que es muy rápido una vez cacheado.

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

    // Listener de almacenamiento (para pestañas cruzadas)
    window.addEventListener(
      "storage",
      (e) => {
        if (e.key === "theme") updateTheme();
      },
      { passive: true }
    );

    // Arrancar
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
