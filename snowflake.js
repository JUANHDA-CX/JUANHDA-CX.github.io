(function () {
  if (document.getElementById("canvas-nieve-navidad")) return;

  const isMobile = window.innerWidth < 768;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  // === SETTINGS ===
  const config = {
    // mobile : PC
    darkSnowPath: "./src/snowflakeWhite.svg",
    whiteSnowPath: "./src/snowflakeDark.svg",
    amount: isMobile ? 25 : 100,
    baseSpeed: isMobile ? 1.0 : 1.25,
    windAngle: 85, // degrees
    turbulence: isMobile ? 0.5 : 1.0,
    maxRotationSpeed: 0.045,
    minSize: 10,
    maxSize: 25,
    minOpacity: 0.1,
    maxOpacity: 0.4,
    zIndex: 3,
  };

  let canvas, ctx, cssWidth, cssHeight, pxWidth, pxHeight;
  const flakes = [];
  let windVec = getWindVector(config.windAngle);

  // Images storage
  const imgWhite = new Image();
  const imgDark = new Image();
  let currentImage = null;
  let currentThemeCache = "";
  let bitmapWhite = null;
  let bitmapDark = null;

  // Control status
  let running = true;
  let rafId = null;
  let resizeTimer = null;
  let prevWidth = window.innerWidth;

  // --- Winds preload ---
  function getWindVector(angleDeg) {
    const rad = (angleDeg * Math.PI) / 180;
    // Normalize to 1
    const x = Math.cos(rad);
    const y = Math.sin(rad);
    const mag = Math.hypot(x, y) || 1;
    return { x: x / mag, y: y / mag };
  }

  // --- Theme status ---
  function detectImageByTheme() {
    const theme = localStorage.getItem("theme") || "light";
    currentThemeCache = theme;
    return theme === "dark" ? bitmapWhite || imgWhite : bitmapDark || imgDark;
  }

  function updateThemeIfChanged() {
    const currentTheme = localStorage.getItem("theme") || "light";
    if (currentTheme !== currentThemeCache) {
      currentThemeCache = currentTheme;
      currentImage = detectImageByTheme();
    }
  }

  window.updateSnowTheme = function () {
    updateThemeIfChanged();
  };

  // --- Setup canvas DPR ---
  function createCanvas() {
    canvas = document.createElement("canvas");
    canvas.id = "canvas-nieve-navidad"; // ID kept as is to preserve potential CSS styling
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = config.zIndex;
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d", { alpha: true });
    adjustSizes();
  }

  function adjustSizes() {
    cssWidth = window.innerWidth;
    cssHeight = window.innerHeight;
    pxWidth = Math.floor(cssWidth * dpr);
    pxHeight = Math.floor(cssHeight * dpr);
    canvas.width = pxWidth;
    canvas.height = pxHeight;
    // Transform draw CSS, rendering at pixels
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // --- Flake Class ---
  class Flake {
    constructor(start = true) {
      this.init(start);
    }

    init(start = false) {
      // Initial position
      this.x = Math.random() * cssWidth;
      this.y = start ? Math.random() * cssHeight : -config.maxSize;

      // Size and speed
      this.size =
        Math.random() * (config.maxSize - config.minSize) + config.minSize;
      this.speed = (Math.random() * 0.5 + 0.8) * config.baseSpeed;

      // Smooth lateral movement
      this.turbulenceAngle = Math.random() * Math.PI * 2;
      this.turbulenceSpeed = Math.random() * 0.05 + 0.01;
      this.amplitude = Math.random() * config.turbulence;

      // Rotation
      this.rotation = Math.random() * Math.PI * 2;
      this.spinSpeed = (Math.random() * 2 - 1) * config.maxRotationSpeed;

      // Opacity
      this.globalAlpha =
        Math.random() * (config.maxOpacity - config.minOpacity) +
        config.minOpacity;
    }

    update() {
      this.turbulenceAngle += this.turbulenceSpeed;
      const oscillation = Math.cos(this.turbulenceAngle) * this.amplitude;

      this.x += windVec.x * this.speed + oscillation;
      this.y += windVec.y * this.speed;
      this.rotation += this.spinSpeed;

      // Smooth recycling
      const margin = config.maxSize + 10;
      if (this.x > cssWidth + margin) this.x = -margin;
      else if (this.x < -margin) this.x = cssWidth + margin;

      if (this.y > cssHeight + margin) this.y = -margin;
      else if (this.y < -margin) this.y = cssHeight + margin;
    }

    draw() {
      const img = currentImage;
      if (!img) return;
      ctx.save();
      ctx.globalAlpha = this.globalAlpha;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.drawImage(img, -this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  // --- Resize with debounce and intelligence ---
  function onResize() {
    if (resizeTimer) return;
    resizeTimer = setTimeout(() => {
      resizeTimer = null;
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      const widthChanged = newWidth !== prevWidth;
      prevWidth = newWidth;

      adjustSizes();

      // Redistribute only if width changed (rotation/spin) or large variation
      if (widthChanged || Math.abs(newHeight - cssHeight) > 60) {
        for (let i = 0; i < flakes.length; i++) flakes[i].init(true);
      }
    }, 120); // Short debounce to avoid too many calculations
  }

  // --- Loop and visibility ---
  function loop() {
    if (!running) return;
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    for (let i = 0; i < flakes.length; i++) {
      const f = flakes[i];
      f.update();
      f.draw();
    }
    rafId = requestAnimationFrame(loop);
  }

  function onVisibilityChange() {
    const hidden = document.hidden;
    if (hidden) {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
    } else {
      running = true;
      rafId = requestAnimationFrame(loop);
    }
  }

  // --- Start ---
  async function init() {
    if (!document.body) {
      requestAnimationFrame(init);
      return;
    }

    createCanvas();

    // Load images with decode and createImageBitmap
    imgWhite.src = config.whiteSnowPath;
    imgDark.src = config.darkSnowPath;

    try {
      await imgWhite.decode();
    } catch {}
    try {
      await imgDark.decode();
    } catch {}

    try {
      bitmapWhite = await createImageBitmap(imgWhite);
    } catch {}
    try {
      bitmapDark = await createImageBitmap(imgDark);
    } catch {}

    currentImage = detectImageByTheme();

    // Precalculate wind (if you want to animate wind later, update windVec)
    windVec = getWindVector(config.windAngle);

    // Create flakes
    for (let i = 0; i < config.amount; i++) flakes.push(new Flake(true));

    // Events
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange, {
      passive: true,
    });

    // If theme changes in another tab
    window.addEventListener(
      "storage",
      function (e) {
        if (e.key === "theme") updateThemeIfChanged();
      },
      { passive: true }
    );

    // Lightweight poll in case your UI doesn't emit events (you can remove it if using updateSnowTheme())
    const themeInterval = setInterval(updateThemeIfChanged, 100);

    // Start
    running = true;
    loop();

    // Optional cleanup when page unloads
    window.addEventListener(
      "beforeunload",
      () => {
        clearInterval(themeInterval);
        cancelAnimationFrame(rafId);
      },
      { passive: true }
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
