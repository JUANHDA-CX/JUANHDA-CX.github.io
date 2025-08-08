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
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
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
};

// Sound

document.addEventListener("DOMContentLoaded", function () {
    const audio = new Audio("/sound/click-HeroHero.mp3");
    audio.volume = 0.25;
    const elements = document.querySelectorAll(".audioclick");

    elements.forEach((element) => {
        element.addEventListener("click", (event) => {
            if (element.tagName !== "INPUT") {
                event.preventDefault();
                event.stopPropagation();
            }
            audio.play();
            setTimeout(() => {
                if (element.hasAttribute("href")) {
                    if (element.getAttribute("target") === "_blank") {
                        window.open(element.getAttribute("href"), "_blank");
                    } else {
                        window.location.href = element.getAttribute("href");
                    }
                }
            }, 500);
        });
    });
});

// vibration

document.addEventListener("DOMContentLoaded", function () {

    const buzz = document.querySelectorAll(".buzz");
    buzz.forEach((element) => {
        element.addEventListener("click", (event) => {
            navigator.vibrate(100);
            console.log(" 'buzz ', vibrate");
        });
    });
});

// Pantalla de carga

window.addEventListener("load", function () {
    const loader = document.querySelector(".loader");
    loader.className += " hidden";
});

// Ocultar boton de desplazamiento

window.addEventListener("scroll", function () {
    var Fbutton = document.getElementById("Fbutton");
    if (window.scrollY > 350) {
        Fbutton.style.display = "block";
    } else {
        Fbutton.style.display = "none";
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

document.addEventListener("DOMContentLoaded", (event) => {
    var currentLanguage = localStorage.getItem("language") || "Spanish";
    var button = document.getElementById("language-switch-button");
    var iconEnglishDark = document.createElement("img");
    iconEnglishDark.src = "icons/icon_english_dark.svg";
    var iconSpanishDark = document.createElement("img");
    iconSpanishDark.src = "icons/icon_spanish_dark.svg";

    // Función para actualizar SOLO el idioma del select custom
    function updateCustomSelectLanguage(lang) {
        const customOptions = document.querySelectorAll('.custom-option');
        const customTriggerText = document.querySelector('.custom-select-trigger span');

        // 1. Actualizar texto del trigger (si no hay selección)
        if (!customTriggerText.textContent.trim() ||
            customTriggerText.textContent === "Select a category" ||
            customTriggerText.textContent === "Seleccione una categoría") {
            customTriggerText.textContent = lang === 'Spanish'
                ? "Seleccione una categoría"
                : "Select a category";
        }

        // 2. Actualizar texto de las opciones
        customOptions.forEach(option => {
            option.textContent = lang === 'Spanish'
                ? option.getAttribute('data-text-es')
                : option.getAttribute('data-text-en');
        });

        // 3. Si hay una opción seleccionada, actualizar el trigger
        const selectedOption = document.querySelector('.custom-option.selected');
        if (selectedOption) {
            customTriggerText.textContent = selectedOption.textContent;
        }
    }

    // Función para actualizar el formulario
    function updateFormLanguage(lang) {
        // Si el formulario de contacto no está en la página, no hacer nada.
        // Esto previene errores en páginas que no tienen el formulario.
        const contactForm = document.getElementById('contact-form');
        if (!contactForm) {
            return;
        }

        // Actualizar placeholders
        document.querySelectorAll('[data-placeholder-es]').forEach(element => {
            element.placeholder = lang === 'Spanish'
                ? element.getAttribute('data-placeholder-es')
                : element.getAttribute('data-placeholder-en');
        });

        updateCustomSelectLanguage(lang);

        // Actualizar select
        const select = document.getElementById('formSelect');
        if (select) {
            const defaultOption = select.querySelector('option[value=""]');
            if (defaultOption) {
                defaultOption.textContent = lang === 'Spanish'
                    ? defaultOption.getAttribute('data-default-es')
                    : defaultOption.getAttribute('data-default-en');
            }

            select.querySelectorAll('option[value]').forEach(option => {
                option.textContent = lang === 'Spanish'
                    ? option.getAttribute('data-text-es')
                    : option.getAttribute('data-text-en');
            });
        }

        // Actualizar botones
        document.querySelectorAll('input[type="submit"], input[type="reset"]').forEach(button => {
            button.value = lang === 'Spanish'
                ? button.getAttribute('data-value-es')
                : button.getAttribute('data-value-en');
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
        updateFormLanguage('Spanish');
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
        updateFormLanguage('English');
    }

    // Inicialización
    if (currentLanguage === "Spanish") {
        displayContentInSpanish();
        button.appendChild(iconSpanishDark);
    } else {
        displayContentInEnglish();
        button.appendChild(iconEnglishDark);
    }

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
    });
});

/* FORM */


document.addEventListener('DOMContentLoaded', function () {
    const customSelects = document.querySelectorAll('.custom-select-wrapper');

    customSelects.forEach(wrapper => {
        const nativeSelect = wrapper.querySelector('.custom-select');
        const customContainer = wrapper.querySelector('.custom-select-container');
        const customTrigger = wrapper.querySelector('.custom-select-trigger');
        const customOptions = wrapper.querySelectorAll('.custom-option');

        // Set initial value
        if (nativeSelect.value) {
            customTrigger.querySelector('span').textContent =
                nativeSelect.querySelector(`option[value="${nativeSelect.value}"]`).textContent;
        }

        // Toggle dropdown
        customTrigger.addEventListener('click', function (e) {
            e.stopPropagation();
            customContainer.classList.toggle('open');
            closeAllSelects(customContainer);
        });

        // Select option
        customOptions.forEach(option => {
            option.addEventListener('click', function () {
                const value = this.getAttribute('data-value');
                const text = this.textContent;

                // Update custom select
                customTrigger.querySelector('span').textContent = text;
                customOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');

                // Update native select
                nativeSelect.value = value;
                nativeSelect.dispatchEvent(new Event('change'));

                // Close dropdown
                customContainer.classList.remove('open');
            });
        });

        // Close when clicking outside
        document.addEventListener('click', function () {
            customContainer.classList.remove('open');
        });

        // Keyboard navigation
        customTrigger.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                customContainer.classList.toggle('open');
            }
        });

        // Sync with native select changes
        nativeSelect.addEventListener('change', function () {
            if (this.value) {
                customTrigger.querySelector('span').textContent =
                    this.querySelector(`option[value="${this.value}"]`).textContent;
            }
        });
    });

    function closeAllSelects(currentSelect) {
        document.querySelectorAll('.custom-select-container').forEach(select => {
            if (select !== currentSelect) {
                select.classList.remove('open');
            }
        });
    }
});