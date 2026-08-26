document.addEventListener("DOMContentLoaded", (event) => {

    gsap.registerPlugin(TextPlugin, SplitText, ScrollTrigger, ScrollSmoother);

    document.fonts.ready.then(() => {

        /* LOGO TEXT ART1*/
        gsap.from("#art1 > p.spanish", {
            duration: 5,
            text: ""
        });

        /* TEXTBLOCK ART2, ART3, ART4*/

        const artIDs = ["art2", "art3", "art4"];
        let blocktext = {};

        artIDs.forEach((id) => {
            gsap.set(`#${id}`, { opacity: 1 });

            SplitText.create(`#${id}`, {
                type: "words,lines",
                linesClass: "line",
                autoSplit: true,
                mask: "lines",
                onSplit: (self) => {
                    blocktext[id] = gsap.from(self.lines, {
                        duration: 0.6,
                        yPercent: 100,
                        opacity: 0,
                        stagger: 0.1,
                        ease: "expo.out",
                        scrollTrigger: {
                            trigger: `#${id}`,
                            start: "top bottom",
                            end: "bottom top",
                            toggleActions: "restart none restart none"
                        },
                        onComplete: () => self.revert()
                    });
                    return blocktext[id];
                }
            });
        });

    });

    /* Scroll Smoother*/
    ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1,
        effects: true,
    });

    const playhead = { frame: 0 };

    ////////////////////////////

    // Configurar efecto parallax para el banner
    function setupParallax() {
        const parallaxBg = document.querySelector('.parallax-bg-GSAP');

        gsap.to(parallaxBg, {
            ease: "none",
            scrollTrigger: {
                trigger: ".banner-container-GSAP",
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });
    }


    /* Content tittles animation*/
    const bannerContent = document.querySelector('.banner-tittle-content-GSAP');
    gsap.from(bannerContent, {
        opacity: 0,
        y: 200,
        duration: 1,
        scrollTrigger: {
            trigger: ".banner-container-GSAP",
            start: "top 80%",
            end: "bottom top",
            toggleActions: "restart none restart none"
        }
    });

    setupParallax();

    // Parallax del banner: en touch suavizado con cola (~0.8s) para evitar el corte
    // seco al frenar; en desktop se mantiene 1:1 como hasta ahora.
    const mm = gsap.matchMedia();
    mm.add("(hover: none) and (pointer: coarse)", () => {
        gsap.to(".far", {
            yPercent: 100,
            ease: "none",
            scrollTrigger: { scrub: 0.8 }
        });
        gsap.to(".mid", {
            yPercent: 200,
            ease: "none",
            scrollTrigger: { scrub: 0.8 }
        });
        gsap.to(".close", {
            yPercent: 300,
            ease: "none",
            scrollTrigger: { scrub: 0.8 }
        });
    });
    mm.add("(hover: hover)", () => {
        gsap.to(".far", {
            yPercent: 100,
            ease: "none",
            scrollTrigger: { scrub: true }
        });
        gsap.to(".mid", {
            yPercent: 200,
            ease: "none",
            scrollTrigger: { scrub: true }
        });
        gsap.to(".close", {
            yPercent: 300,
            ease: "none",
            scrollTrigger: { scrub: true }
        });
    });


    ////////////////// 




    const riveInstances = [];
    const riveVisibility = new Map();
    let scrollPauseTimeout = null;

    window.addEventListener(
        'scroll',
        function () {
            riveInstances.forEach(function (r) {
                if (riveVisibility.get(r)) r.play();
            });
            clearTimeout(scrollPauseTimeout);
            scrollPauseTimeout = setTimeout(function () {
                riveInstances.forEach(function (r) {
                    r.pause();
                });
            }, 150);
        },
        { passive: true }
    );

    function createRiveInstance(config) {
        const { canvasId, artboard, stateMachine, triggerId } = config;
        const canvas = document.getElementById(canvasId);

        const riveInstance = new rive.Rive({
            src: "src/RIVE_HomeMulti.riv",
            canvas: canvas,
            autoplay: false,
            artboard: artboard,
            stateMachines: [stateMachine],
            onLoad: () => {
                riveInstance.resizeDrawingSurfaceToCanvas();
                setupScrollTrigger(riveInstance, stateMachine, triggerId);
            }
        });

        riveInstances.push(riveInstance);
    }

    function useStateMachineInput(riveInstance, stateMachineName, inputName, initialValue) {
        const input = riveInstance.stateMachineInputs(stateMachineName).find(input => input.name === inputName);
        if (input) {
            input.value = initialValue;
        }
        return input;
    }

    function setupScrollTrigger(riveInstance, stateMachineName, triggerId) {
        const progressInput = useStateMachineInput(riveInstance, stateMachineName, 'progress', 0); // nombre del input numerico en el stateMachine de Rive editor
        const canvasEl = document.getElementById(triggerId);
        let isVisible = false;
        riveVisibility.set(riveInstance, false);

        // Pausa el render cuando el canvas no se ve, pero mantiene el progreso del scroll
        if (canvasEl && 'IntersectionObserver' in window) {
            const observer = new IntersectionObserver(
                function (entries) {
                    isVisible = entries[0].isIntersecting;
                    riveVisibility.set(riveInstance, isVisible);
                    if (isVisible) riveInstance.play();
                    else riveInstance.pause();
                },
                { threshold: 0.1 }
            );
            observer.observe(canvasEl);
        } else {
            isVisible = true;
            riveVisibility.set(riveInstance, true);
        }

        const animationTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: `#${triggerId}`,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });

        animationTimeline.to(progressInput, {
            value: 100,
            onStart: function () {
                if (isVisible) riveInstance.play();
            },
            onComplete: function () {
                riveInstance.pause();
            }
        });
    }

    function initializeAnimations(configs) {
        if (typeof rive === "undefined") return; // CDN caída: degradar sin error
        configs.forEach(config => {
            try {
                createRiveInstance(config);
            } catch (err) {
                console.warn("Rive no disponible para", config.canvasId, err);
            }
        });
    }

    const animationConfigs = [
        { canvasId: "CanvasPerson", artboard: "ArtboardPerson", stateMachine: "StateMachinePerson", triggerId: "CanvasPerson" },
        { canvasId: "CanvasServices", artboard: "ArtboardServices", stateMachine: "StateMachineServices", triggerId: "CanvasServices" },
        { canvasId: "CanvasContact", artboard: "ArtboardContact", stateMachine: "StateMachineContact", triggerId: "CanvasContact" } // New instance añadir ,
    ];

    // canvasid = nombre de Nest Artboard en Rive editor
    // artboard = nombre de Artboard en Rive editor
    // statemachine = nombre de StateMachine en Rive editor
    // triggerid = id del canvas en html

    initializeAnimations(animationConfigs);



    ////////////////////



});
