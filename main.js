// Dark mode

function myFunction() {
    var element = document.body;
    var button = document.getElementById("myButton");
    var slider = document.querySelector(".sliderSwitch");
    element.classList.toggle("dark-mode");
    if (element.classList.contains("dark-mode")) {
        slider.classList.add("dark");
        slider.classList.remove("lightfour");
        button.checked = false;
        localStorage.setItem("theme", "dark");
    } else {
        slider.classList.add("lightfour");
        slider.classList.remove("dark");
        button.checked = true;
        localStorage.setItem("theme", "light");
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
        slider.classList.remove("lightfour");
        button.checked = false;
    } else if (theme === "light") {
        element.classList.remove("dark-mode");
        slider.classList.add("lightfour");
        slider.classList.remove("dark");
        button.checked = true;
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        element.classList.add("dark-mode");
        slider.classList.add("dark");
        slider.classList.remove("lightfour");
        localStorage.setItem("theme", "dark");
        button.checked = false;
    } else {
        element.classList.remove("dark-mode");
        slider.classList.add("lightfour");
        slider.classList.remove("dark");
        localStorage.setItem("theme", "light");
        button.checked = true;
    }
};

// Sound

document.addEventListener("DOMContentLoaded", function () {
    const audio = new Audio("/sound/click-21156-666HeroHero.mp3");
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

// Pantalla de carga

window.addEventListener("load", function () {
    const loader = document.querySelector(".loader");
    loader.className += " hidden";
});

// Ocultar boton de desplazamiento

window.addEventListener("scroll", function () {
    var Fbutton = document.getElementById("Fbutton");
    if (window.scrollY > 300) {
        Fbutton.style.display = "block";
    } else {
        Fbutton.style.display = "none";
    }
});

// Animacion de desplazamiento

function init() {
    function scrollToTop() {
        $("html, body").animate({ scrollTop: 0 }, "slow");
    }
    var Fbutton = document.getElementById("Fbutton");
    Fbutton.addEventListener("click", scrollToTop);
}

document.addEventListener("DOMContentLoaded", init);

// Idioma de la pagina

document.addEventListener("DOMContentLoaded", (event) => {
    var currentLanguage = localStorage.getItem("language") || "Spanish";
    //var userLang = navigator.language || navigator.userLanguage;

    var button = document.getElementById("language-switch-button");
    var iconEnglishDark = document.createElement("img");
    iconEnglishDark.src = "icons/icon_english_dark.svg";
    var iconSpanishDark = document.createElement("img");
    iconSpanishDark.src = "icons/icon_spanish_dark.svg";

    if (currentLanguage === "Spanish") {
        displayContentInSpanish();
        button.appendChild(iconSpanishDark);
    } else {
        displayContentInEnglish();
        button.appendChild(iconEnglishDark);
    }

    button.addEventListener("click", function () {
        button.innerHTML = "";
        button.style.display = "none";
        button.offsetHeight;
        button.style.display = "";

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
    }
});