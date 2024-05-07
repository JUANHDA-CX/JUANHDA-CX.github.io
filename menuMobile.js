window.addEventListener("load", () => {
    const menuButton = document.querySelector("#menuMobileToggleCheckbox");
    const body = document.querySelector("body");

    menuButton.addEventListener("change", () => {
        if (menuButton.checked) {
            body.classList.add("no-scroll-mobile");
        } else {
            body.classList.remove("no-scroll-mobile");
        }
    });
});