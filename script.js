/**
 * V9 EXPANDED SPATIAL UI - JAVASCRIPT
 */

document.addEventListener("DOMContentLoaded", () => {
    
    gsap.registerPlugin(ScrollTrigger);

    /* ==========================================================================
       1. PRELOADER
       ========================================================================== */
    const loaderProgress = document.querySelector('.loader-progress');
    const loader = document.querySelector('.loader');
    const canvasEl = document.querySelector('.webgl');
    
    let progress = 0;
    const loadInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 5) + 2;
        if (progress > 99) progress = 99;
        loaderProgress.textContent = `${progress}%`;
    }, 15);

    document.fonts.ready.then(() => {
        clearInterval(loadInterval);
        loaderProgress.textContent = `100%`;
        
        setTimeout(() => {
            gsap.to(loader, {
                yPercent: -100,
                duration: 1.2,
                ease: "power4.inOut",
                onComplete: () => {
                    initLenis();
                    initThreeJS();
                    initGSAP();
                    canvasEl.style.opacity = '1';
                }
            });
        }, 400);
    });

    /* ==========================================================================
       2. LENIS SMOOTH SCROLLING
       ========================================================================== */
    function initLenis() {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smooth: true,
            mouseMultiplier: 0.8,
        });

        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);

        // Intercept anchor links for Lenis Smooth Scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId !== "#" && targetId !== "#projects" && targetId !== "#skills") return;
                
                if (targetId === "#projects" || targetId === "#skills") {
                    e.preventDefault();
                    lenis.scrollTo(targetId, { offset: -100 });
                }
            });
        });
    }

    /* ==========================================================================
       3. CUSTOM CURSOR & TRAIL SYSTEM
       ========================================================================== */
    const cursor = document.querySelector('.cursor');
    const trailContainer = document.querySelector('.cursor-trail-container');
    
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    const mouseParams = { x: 0, y: 0 }; 
    
    // Throttle for trail generation
    let lastTrailTime = 0;

    if (window.matchMedia("(pointer: fine)").matches) {
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX; mouseY = e.clientY;
            mouseParams.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouseParams.y = -(e.clientY / window.innerHeight) * 2 + 1;
            
            // Generate Trail
            const now = Date.now();
            if (now - lastTrailTime > 20) { // Every 20ms
                createTrailDot(mouseX, mouseY);
                lastTrailTime = now;
            }
        });

        gsap.ticker.add(() => {
            cursorX += (mouseX - cursorX) * 0.15;
            cursorY += (mouseY - cursorY) * 0.15;
            if(cursor) cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
        });

        // Hover Effects for Cursor
        document.querySelectorAll('a, .btn, .skill-pill, .project-card').forEach(el => {
            el.addEventListener('mouseenter', () => {
                if(cursor) cursor.classList.add('active');
            });
            el.addEventListener('mouseleave', () => {
                if(cursor) cursor.classList.remove('active');
            });
        });
    }

    function createTrailDot(x, y) {
        if(!trailContainer) return;
        const dot = document.createElement('div');
        dot.classList.add('trail-dot');
        dot.style.left = `${x}px`;
        dot.style.top = `${y}px`;
        trailContainer.appendChild(dot);
        
        // Randomize color slightly based on palette
        const colors = ['#ff0055', '#00e5ff', '#ffaa00'];
        dot.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        gsap.to(dot, {
            scale: 0,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
            onComplete: () => {
                dot.remove();
            }
        });
    }

    /* ==========================================================================
       4. THREE.JS VIBRANT WEBGL ENGINE
       ========================================================================== */
    let scene, camera, renderer, particles;
    
    function initThreeJS() {
        if(!canvasEl) return;
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x0b051a, 0.0008); 
        
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.z = 1000;
        
        renderer = new THREE.WebGLRenderer({
            canvas: canvasEl,
            antialias: true,
            alpha: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        const particleCount = window.innerWidth < 768 ? 3000 : 8000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        const color = new THREE.Color();
        const vibrantPalette = [0xff0055, 0x00e5ff, 0xffaa00, 0xaa00ff, 0xffffff];
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            const r = 1500 * Math.cbrt(Math.random());
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i] = r * Math.sin(phi) * Math.cos(theta);
            positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i + 2] = r * Math.cos(phi);
            
            const randomHex = vibrantPalette[Math.floor(Math.random() * vibrantPalette.length)];
            color.setHex(randomHex);
            colors[i] = color.r;
            colors[i + 1] = color.g;
            colors[i + 2] = color.b;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 4,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending
        });
        
        particles = new THREE.Points(geometry, material);
        scene.add(particles);
        
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // 3D Camera Fly-through
        ScrollTrigger.create({
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            onUpdate: (self) => {
                gsap.to(camera.position, {
                    z: 1000 - (self.progress * 1500),
                    duration: 0.5,
                    ease: "power2.out"
                });
                gsap.to(particles.rotation, {
                    z: self.progress * Math.PI * 0.5,
                    duration: 0.5,
                    ease: "power2.out"
                });
            }
        });
        
        animateThreeJS();
    }
    
    function animateThreeJS() {
        requestAnimationFrame(animateThreeJS);
        if (particles) {
            particles.rotation.y += 0.001;
            particles.rotation.x += 0.0005;
            
            gsap.to(particles.rotation, {
                x: mouseParams.y * 0.15,
                y: mouseParams.x * 0.15,
                duration: 2,
                ease: "power2.out"
            });
        }
        renderer.render(scene, camera);
    }

    /* ==========================================================================
       5. GSAP SPATIAL UI ANIMATIONS
       ========================================================================== */
    function initGSAP() {
        
        // Initial load animation
        gsap.to(".hero-card", { y: 0, opacity: 1, duration: 1.2, ease: "power4.out", delay: 0.2 });
        gsap.fromTo(".premium-header", 
            { y: -50, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.5 }
        );

        // Scroll reveals for all Spatial Cards
        const cards = document.querySelectorAll('.spatial-card:not(.hero-card):not(.premium-header)');
        cards.forEach(card => {
            gsap.to(card, {
                y: 0, opacity: 1, duration: 1, ease: "power3.out",
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%", 
                    toggleActions: "play none none reverse"
                }
            });
        });
    }

    /* ==========================================================================
       6. CONTACT MODAL LOGIC
       ========================================================================== */
    const openBtn = document.getElementById('openContactBtn');
    const navContactBtn = document.getElementById('navContactBtn');
    const closeBtn = document.getElementById('closeContactBtn');
    const modal = document.getElementById('contactModal');

    function openModal(e) {
        if(e) e.preventDefault();
        if(modal) modal.classList.add('active');
        if(cursor) cursor.classList.remove('active');
    }

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (navContactBtn) navContactBtn.addEventListener('click', openModal);

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }
});
