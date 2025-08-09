<<<<<<< HEAD
document.addEventListener("DOMContentLoaded", function () {
    const gridItems = document.querySelectorAll(".grid-item.imgGhover");
    const galleryExpandController = document.getElementById("galleryExpandController");
    const galleryExpand = document.getElementById("galleryExpand");
    const galleryExpandBtn = document.getElementById("galleryExpandBtn");

    gridItems.forEach((item) => {
        item.addEventListener("click", function () {
            let classes = Array.from(this.classList);
            let uniqueClass = classes.find(cls => /^Code\d+$/.test(cls));

            if (uniqueClass) {
                let highResImage = document.querySelector(`img.HighReso.${uniqueClass}`);
                let lowResSrc = this.getAttribute("src");

                if (highResImage) {
                    let highResSrc = highResImage.getAttribute("data-src");

                    if (highResSrc) {
                        galleryExpand.setAttribute("src", lowResSrc);

                        console.log("Mostrando imagen de baja resolución:", lowResSrc);

                        //cargar la HighReso en segundo plano
                        let imgPreload = new Image();
                        imgPreload.src = highResSrc;

                        // carga de imagen baja y alta resolución
                        imgPreload.onload = function () {
                            galleryExpand.setAttribute("src", highResSrc);

                            console.log("Imagen de alta resolución cargada y mostrada:", highResSrc);
                        };

                        galleryExpandController.style.display = "flex";
                        document.body.style.overflow = "hidden";
                    } else {
                        console.error("La imagen de alta resolución no tiene un data-src válido.");
                    }
                } else {
                    console.error("No se encontró la imagen de alta resolución con la clase:", uniqueClass);
                }
            } else {
                console.error("No se encontró una clase única en la imagen clicada.");
            }
        });
    });

    galleryExpandBtn.addEventListener("click", function () {
        galleryExpandController.style.display = "none";
        document.body.style.overflow = "";
    });
=======
document.addEventListener("DOMContentLoaded", function () {
    const gridItems = document.querySelectorAll(".grid-item.imgGhover");
    const galleryExpandController = document.getElementById("galleryExpandController");
    const galleryExpand = document.getElementById("galleryExpand");
    const galleryExpandBtn = document.getElementById("galleryExpandBtn");

    gridItems.forEach((item) => {
        item.addEventListener("click", function () {
            let classes = Array.from(this.classList);
            let uniqueClass = classes.find(cls => /^Code\d+$/.test(cls));

            if (uniqueClass) {
                let highResImage = document.querySelector(`img.HighReso.${uniqueClass}`);
                let lowResSrc = this.getAttribute("src");

                if (highResImage) {
                    let highResSrc = highResImage.getAttribute("data-src");

                    if (highResSrc) {
                        galleryExpand.setAttribute("src", lowResSrc);

                        console.log("Mostrando imagen de baja resolución:", lowResSrc);

                        //cargar la HighReso en segundo plano
                        let imgPreload = new Image();
                        imgPreload.src = highResSrc;

                        // carga de imagen baja y alta resolución
                        imgPreload.onload = function () {
                            galleryExpand.setAttribute("src", highResSrc);

                            console.log("Imagen de alta resolución cargada y mostrada:", highResSrc);
                        };

                        galleryExpandController.style.display = "flex";
                        document.body.style.overflow = "hidden";
                    } else {
                        console.error("La imagen de alta resolución no tiene un data-src válido.");
                    }
                } else {
                    console.error("No se encontró la imagen de alta resolución con la clase:", uniqueClass);
                }
            } else {
                console.error("No se encontró una clase única en la imagen clicada.");
            }
        });
    });

    galleryExpandBtn.addEventListener("click", function () {
        galleryExpandController.style.display = "none";
        document.body.style.overflow = "";
    });
>>>>>>> c103f534d1b922d831f7fe576dfa4f31096d84f1
});