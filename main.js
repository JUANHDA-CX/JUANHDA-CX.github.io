// Dark mode

const themeColorMeta = document.getElementById("theme-color-meta");
const BarColorLight = themeColorMeta.getAttribute("data-light-color");
const BarColorDark = "hsl(250, 25%, 25%)";

function myFunction() {
  var element = document.body;
  var button = document.getElementById("myButton");
  var slider = document.querySelector(".sliderSwitch");
  element.classList.toggle("dark-mode");
  if (element.classList.contains("dark-mode")) {
    slider.classList.add("dark");
    button.checked = false;
    localStorage.setItem("theme", "dark");
    themeColorMeta.setAttribute("content", BarColorDark);
  } else {
    slider.classList.remove("dark");
    button.checked = true;
    localStorage.setItem("theme", "light");
    themeColorMeta.setAttribute("content", BarColorLight);
  }

  // Mirror on <html>: keep body/html in sync (dark-mode selectors)
  document.documentElement.classList.toggle("dark-mode", element.classList.contains("dark-mode"));

  if (window.updateSnowTheme) window.updateSnowTheme();
}

window.onload = function () {
  var element = document.body;
  var button = document.getElementById("myButton");
  var slider = document.querySelector(".sliderSwitch");
  var theme = localStorage.getItem("theme");
  if (theme === "dark") {
    element.classList.add("dark-mode");
    slider.classList.add("dark");
    button.checked = false;
    themeColorMeta.setAttribute("content", BarColorDark);
  } else if (theme === "light") {
    element.classList.remove("dark-mode");
    slider.classList.remove("dark");
    button.checked = true;
    themeColorMeta.setAttribute("content", BarColorLight);
  } else if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    element.classList.add("dark-mode");
    slider.classList.add("dark");
    localStorage.setItem("theme", "dark");
    button.checked = false;
    themeColorMeta.setAttribute("content", BarColorDark);
  } else {
    element.classList.remove("dark-mode");
    slider.classList.remove("dark");
    localStorage.setItem("theme", "light");
    button.checked = true;
    themeColorMeta.setAttribute("content", BarColorLight);
  }

  // Mirror on <html>: keep body/html in sync (dark-mode selectors)
  document.documentElement.classList.toggle("dark-mode", element.classList.contains("dark-mode"));

  if (window.updateSnowTheme) window.updateSnowTheme();
};

document.addEventListener("DOMContentLoaded", () => {
  // Sound

  const audio = new Audio("sound/click-HeroHero.mp3");
  audio.volume = 0.25;
  const elements = document.querySelectorAll(".audioclick");

  let navTimeout = null;
  let pendingElement = null;

  function cancelPendingNavigation() {
    if (navTimeout) {
      clearTimeout(navTimeout);
      navTimeout = null;
    }
    if (pendingElement) {
      audio.removeEventListener("ended", handleAudioEnded);
      pendingElement = null;
    }
  }

  function handleAudioEnded() {
    navigatePending();
  }

  function navigatePending() {
    const element = pendingElement;
    pendingElement = null;
    if (navTimeout) {
      clearTimeout(navTimeout);
      navTimeout = null;
    }
    if (!element || !element.hasAttribute("href")) {
      return;
    }
    const href = element.getAttribute("href");
    if (element.getAttribute("target") === "_blank") {
      window.open(href, "_blank");
    } else {
      window.location.href = href;
    }
  }

  function bindClickSound(element) {
    element.addEventListener("click", (event) => {
      if (element.tagName !== "INPUT") {
        event.preventDefault();
        event.stopPropagation();
      }

      // El último click gana: cancelar navegación pendiente anterior
      cancelPendingNavigation();
      audio.pause();
      audio.currentTime = 0;

      // Para los li del menú (área del padding), el destino es su <a> hijo
      const anchor =
        element.tagName === "A" ? element : element.querySelector("a[href]");

      if (anchor && anchor.hasAttribute("href")) {
        pendingElement = anchor;
        audio.addEventListener("ended", handleAudioEnded);
        // Redirigir cuando el audio termine; seguridad: máximo 1 segundo
        navTimeout = setTimeout(navigatePending, 1000);
      }

      const playPromise = audio.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(() => {
          // Si el sonido no pudo reproducirse, navegar igual
          setTimeout(navigatePending, 250);
        });
      }
    });
  }

  elements.forEach(bindClickSound);

  // El botón del menú es el <li> (padding incluido): click completo con sonido
  const menuItems = document.querySelectorAll(
    ".Nav-PrimaryH li, #Nav_secondary li"
  );
  menuItems.forEach(bindClickSound);

  // vibration

  const buzz = document.querySelectorAll(".buzz");

  buzz.forEach((element) => {
    element.addEventListener("click", (event) => {
      navigator.vibrate(100);
      //console.log("'buzz'");
    });
  });
});

// Pantalla de carga: ocultar cuando el sitio es funcional (DOMContentLoaded),
// no cuando todo el contenido terminó de descargar (load)

function hideLoader() {
  const loader = document.querySelector(".loader");
  if (loader && !loader.classList.contains("hidden")) {
    loader.classList.add("hidden");
  }
}

document.addEventListener("DOMContentLoaded", hideLoader);

// Ocultar boton de desplazamiento

window.addEventListener("scroll", function () {
  const Fbutton = document.getElementById("Fbutton");
  if (Fbutton) {
    // Verificar que el botón existe
    requestAnimationFrame(() => {
      Fbutton.style.display = window.scrollY > 350 ? "block" : "none";
    });
  }
});

// Animacion de desplazamiento

function init() {
  const Fbutton = document.getElementById("Fbutton");
  Fbutton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
document.addEventListener("DOMContentLoaded", init);

// Idioma de la pagina

// Detecta el idioma inicial: usa el guardado, o detecta el idioma del
// navegador la primera vez que el usuario entra y lo guarda en localStorage.
function detectInitialLanguage() {
  var saved = localStorage.getItem("language");
  if (saved === "Spanish" || saved === "English") {
    return saved;
  }
  var browserLang = (navigator.language || "es").toLowerCase();
  var detected = browserLang.startsWith("es") ? "Spanish" : "English";
  localStorage.setItem("language", detected);
  return detected;
}

window.detectInitialLanguage = detectInitialLanguage;

// Keywords globales por idioma (SEO): el HTML trae las de español, JS las
// actualiza a inglés cuando el usuario cambia el idioma
const siteKeywords = {
  es: "Edición de Video, Edición de Fotos, Juegos, Películas, Diseño, Modelado 3D, Web, Programas, Software",
  en: "Video Edit, Photo Edit, Games, Movies, Design, 3D Model, Web, Programs, Software",
};

// Title y meta descripción según idioma (SEO)

const pageMeta = {
  "index.html": {
    es: {
      title: "Mega CX Studios | Inicio",
      description:
        "Mega CX Studios: diseño web, modelado 3D, edición de video y fotografía profesional. ¡Bienvenido!",
    },
    en: {
      title: "Mega CX Studios | Home",
      description:
        "Mega CX Studios: web design, 3D modeling, professional video and photo editing. Welcome!",
    },
  },
  "services.html": {
    es: {
      title: "Mega CX Studios | Servicios",
      description:
        "Descubre los servicios de Mega CX Studios: diseño web, modelado 3D, edición de video, fotografía y desarrollo.",
    },
    en: {
      title: "Mega CX Studios | Services",
      description:
        "Discover Mega CX Studios services: web design, 3D modeling, video editing, photography and development.",
    },
  },
  "gallery.html": {
    es: {
      title: "Mega CX Studios | Galería",
      description:
        "Explora el portafolio de Mega CX Studios: proyectos de diseño, modelado 3D, arte digital y más.",
    },
    en: {
      title: "Mega CX Studios | Gallery",
      description:
        "Explore the Mega CX Studios portfolio: design projects, 3D modeling, digital art and more.",
    },
  },
  "contact.html": {
    es: {
      title: "Mega CX Studios | Contacto",
      description:
        "Contacta con Mega CX Studios para tus proyectos de diseño web, modelado 3D y edición audiovisual.",
    },
    en: {
      title: "Mega CX Studios | Contact",
      description:
        "Contact Mega CX Studios for your web design, 3D modeling and audiovisual editing projects.",
    },
  },
};

function applyLanguageMeta(lang) {
  document.documentElement.lang = lang === "Spanish" ? "es" : "en";
  const page = (
    location.pathname.split("/").pop() || "index.html"
  ).toLowerCase();
  const meta = (pageMeta[page] || pageMeta["index.html"])[
    lang === "Spanish" ? "es" : "en"
  ];
  document.title = meta.title;
  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.setAttribute("content", meta.description);
  }
  const keywords = document.querySelector('meta[name="keywords"]');
  if (keywords) {
    keywords.setAttribute("content", siteKeywords[lang === "Spanish" ? "es" : "en"]);
  }
}

document.addEventListener("DOMContentLoaded", (event) => {
  var currentLanguage = detectInitialLanguage();
  var button = document.getElementById("language-switch-button");
  var iconEnglishDark = document.createElement("img");
  iconEnglishDark.src = "icons/icon_english_dark.svg";
  var iconSpanishDark = document.createElement("img");
  iconSpanishDark.src = "icons/icon_spanish_dark.svg";

  // Función para actualizar SOLO el idioma del select custom
  function updateCustomSelectLanguage(lang) {
    const customOptions = document.querySelectorAll(".custom-option");
    const customTriggerText = document.querySelector(
      ".custom-select-trigger span"
    );

    // 1. Actualizar texto del trigger (si no hay selección)
    if (
      !customTriggerText.textContent.trim() ||
      customTriggerText.textContent === "Select a category" ||
      customTriggerText.textContent === "Seleccione una categoría"
    ) {
      customTriggerText.textContent =
        lang === "Spanish" ? "Seleccione una categoría" : "Select a category";
    }

    // 2. Actualizar texto de las opciones
    customOptions.forEach((option) => {
      option.textContent =
        lang === "Spanish"
          ? option.getAttribute("data-text-es")
          : option.getAttribute("data-text-en");
    });

    // 3. Si hay una opción seleccionada, actualizar el trigger
    const selectedOption = document.querySelector(".custom-option.selected");
    if (selectedOption) {
      customTriggerText.textContent = selectedOption.textContent;
    }
  }

  // Función para actualizar el formulario
  function updateFormLanguage(lang) {
    // Si el formulario de contacto no está en la página, no hacer nada.
    // Esto previene errores en páginas que no tienen el formulario.
    const contactForm = document.getElementById("contact-form");
    if (!contactForm) {
      return;
    }

    // Actualizar placeholders
    document.querySelectorAll("[data-placeholder-es]").forEach((element) => {
      element.placeholder =
        lang === "Spanish"
          ? element.getAttribute("data-placeholder-es")
          : element.getAttribute("data-placeholder-en");
    });

    updateCustomSelectLanguage(lang);

    // Actualizar select
    const select = document.getElementById("formSelect-eng");
    if (select) {
      const defaultOption = select.querySelector('option[value=""]');
      if (defaultOption) {
        defaultOption.textContent =
          lang === "Spanish"
            ? defaultOption.getAttribute("data-default-es")
            : defaultOption.getAttribute("data-default-en");
      }

      select.querySelectorAll("option[value]").forEach((option) => {
        option.textContent =
          lang === "Spanish"
            ? option.getAttribute("data-text-es")
            : option.getAttribute("data-text-en");
      });
    }

    // Actualizar botones
    document
      .querySelectorAll('input[type="submit"], input[type="reset"]')
      .forEach((button) => {
        button.value =
          lang === "Spanish"
            ? button.getAttribute("data-value-es")
            : button.getAttribute("data-value-en");
      });
  }

  function displayContentInSpanish() {
    document.querySelectorAll(".english").forEach(function (element) {
      element.style.display = "none";
    });
    document.querySelectorAll(".spanish").forEach(function (element) {
      element.style.display = "block";
    });
    document.querySelectorAll(".menu-english").forEach(function (element) {
      element.style.display = "none";
    });
    document.querySelectorAll(".menu-spanish").forEach(function (element) {
      element.style.display = "inline-block";
    });
    updateFormLanguage("Spanish");
  }

  function displayContentInEnglish() {
    document.querySelectorAll(".spanish").forEach(function (element) {
      element.style.display = "none";
    });
    document.querySelectorAll(".english").forEach(function (element) {
      element.style.display = "block";
    });
    document.querySelectorAll(".menu-spanish").forEach(function (element) {
      element.style.display = "none";
    });
    document.querySelectorAll(".menu-english").forEach(function (element) {
      element.style.display = "inline-block";
    });
    updateFormLanguage("English");
  }

  // Inicialización
  if (currentLanguage === "Spanish") {
    displayContentInSpanish();
    button.appendChild(iconSpanishDark);
  } else {
    displayContentInEnglish();
    button.appendChild(iconEnglishDark);
  }

  applyLanguageMeta(currentLanguage);

  button.addEventListener("click", function () {
    button.innerHTML = "";
    if (currentLanguage === "English") {
      displayContentInSpanish();
      currentLanguage = "Spanish";
      localStorage.setItem("language", "Spanish");
      button.appendChild(iconSpanishDark);
    } else {
      displayContentInEnglish();
      currentLanguage = "English";
      localStorage.setItem("language", "English");
      button.appendChild(iconEnglishDark);
    }
    applyLanguageMeta(currentLanguage);
  });
});

/* FORM */

document.addEventListener("DOMContentLoaded", function () {
  const customSelects = document.querySelectorAll(".custom-select-wrapper");

  customSelects.forEach((wrapper) => {
    const nativeSelect = wrapper.querySelector(".custom-select");
    const customContainer = wrapper.querySelector(".custom-select-container");
    const customTrigger = wrapper.querySelector(".custom-select-trigger");
    const customOptions = wrapper.querySelectorAll(".custom-option");

    // Set initial value
    if (nativeSelect.value) {
      customTrigger.querySelector("span").textContent =
        nativeSelect.querySelector(
          `option[value="${nativeSelect.value}"]`
        ).textContent;
    }

    // Toggle dropdown
    customTrigger.addEventListener("click", function (e) {
      e.stopPropagation();
      customContainer.classList.toggle("open");
      closeAllSelects(customContainer);
    });

    // Select option
    customOptions.forEach((option) => {
      option.addEventListener("click", function () {
        const value = this.getAttribute("data-value");
        const text = this.textContent;

        // Update custom select
        customTrigger.querySelector("span").textContent = text;
        customOptions.forEach((opt) => opt.classList.remove("selected"));
        this.classList.add("selected");

        // Update native select
        nativeSelect.value = value;
        nativeSelect.dispatchEvent(new Event("change"));

        // Close dropdown
        customContainer.classList.remove("open");
      });
    });

    // Close when clicking outside
    document.addEventListener("click", function () {
      customContainer.classList.remove("open");
    });

    // Keyboard navigation
    customTrigger.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        customContainer.classList.toggle("open");
      }
    });

    // Sync with native select changes
    nativeSelect.addEventListener("change", function () {
      if (this.value) {
        customTrigger.querySelector("span").textContent = this.querySelector(
          `option[value="${this.value}"]`
        ).textContent;
      }
    });
  });

  function closeAllSelects(currentSelect) {
    document.querySelectorAll(".custom-select-container").forEach((select) => {
      if (select !== currentSelect) {
        select.classList.remove("open");
      }
    });
  }
});

//cursor animation

document.addEventListener("DOMContentLoaded", () => {
  const cursor = document.querySelector(".cursor-circle");

  cursor?.classList.remove("active");

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  const easingFactor = 0.15;
  // Distancia en px para considerar que el círculo alcanzó al mouse
  const arriveThreshold = 0.5;
  let animating = false;

  function animateCursor() {
    const targetX = mouseX - cursor.offsetWidth / 2;
    const targetY = mouseY - cursor.offsetHeight / 2;
    cursorX += (targetX - cursorX) * easingFactor;
    cursorY += (targetY - cursorY) * easingFactor;
    // Agrandado durante el click (scale), posición con easing
    const scale = cursor.classList.contains("active") ? 1.35 : 1;
    cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) scale(${scale})`;

    // Frenar el loop cuando el círculo alcanza al mouse: nunca correr sin motivo
    if (
      Math.abs(targetX - cursorX) < arriveThreshold &&
      Math.abs(targetY - cursorY) < arriveThreshold
    ) {
      animating = false;
      return;
    }
    requestAnimationFrame(animateCursor);
  }

  function startCursorLoop() {
    if (!animating) {
      animating = true;
      requestAnimationFrame(animateCursor);
    }
  }

  function stopCursorLoop() {
    animating = false;
  }

  document.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" || e.pointerType === "pen") {
      cursor?.classList.add("active");
      startCursorLoop();
    } else {
      cursor?.classList.remove("active");
      stopCursorLoop();
    }
  });

  document.addEventListener("pointerup", (e) => {
    if (e.pointerType === "mouse" || e.pointerType === "pen") {
      cursor?.classList.remove("active");
      stopCursorLoop();
    }
  });

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    startCursorLoop();
  });
});
