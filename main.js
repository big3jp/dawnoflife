/* main.js */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Navigation background on scroll
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Scroll Reveal Animations (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-up');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: stop observing once revealed
                // observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // 3. Horizontal Scroll for Era Timeline (Desktop mainly)
    const eraTimeline = document.querySelector('.era-timeline');
    if (eraTimeline) {
        eraTimeline.addEventListener('wheel', (evt) => {
            // Only convert vertical scroll to horizontal if we are hovering specifically over the timeline
            if (window.innerWidth > 992) {
                evt.preventDefault();
                eraTimeline.scrollLeft += evt.deltaY * 2;
            }
        });
    }

    // 4. Bio-Particle System (Floating Cells / Plankton)
    const canvas = document.getElementById('bioCanvas');
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];
    let mouse = { x: null, y: null };

    // Track mouse for interactivity
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    // Reset mouse when leaving window
    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    window.addEventListener('resize', resize);
    resize();

    class BioParticle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            // Slightly smaller, more numerous particles for richer feel
            this.size = Math.random() * 2.5 + 0.5;

            // Slow drifing movement
            this.baseX = (Math.random() - 0.5) * 0.4;
            this.baseY = (Math.random() - 0.5) * 0.4 - 0.2; // slight upward drift
            this.vx = this.baseX;
            this.vy = this.baseY;

            // Bioluminescent colors (cyan, green, pink parasite accent)
            const colors = ['rgba(0, 255, 213, ', 'rgba(173, 255, 47, ', 'rgba(255, 0, 127, '];
            // Favor cyan heavily
            const colorSelection = Math.random() > 0.8 ? (Math.random() > 0.5 ? colors[1] : colors[2]) : colors[0];
            this.colorBase = colorSelection;

            this.opacity = Math.random() * 0.6 + 0.1;

            // Wobble effect for organic feel
            this.angle = Math.random() * Math.PI * 2;
            this.wobbleSpeed = Math.random() * 0.03 + 0.01;
        }

        update() {
            // Apply organic wobble
            this.angle += this.wobbleSpeed;
            this.x += this.vx + Math.sin(this.angle) * 0.5;
            this.y += this.vy + Math.cos(this.angle) * 0.3;

            // Mouse interaction (repel gently)
            if (mouse.x != null && mouse.y != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 200) {
                    let force = (200 - distance) / 200;
                    this.vx -= (dx / distance) * force * 0.08;
                    this.vy -= (dy / distance) * force * 0.08;
                } else {
                    // Return to base velocity gracefully
                    this.vx += (this.baseX - this.vx) * 0.02;
                    this.vy += (this.baseY - this.vy) * 0.02;
                }
            }

            // Screen wrap around with buffer
            if (this.y < -50) this.y = height + 50;
            if (this.y > height + 50) this.y = -50;
            if (this.x < -50) this.x = width + 50;
            if (this.x > width + 50) this.x = -50;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.colorBase + this.opacity + ')';
            ctx.fill();

            // Subtle Glow effect
            ctx.shadowBlur = this.size * 4;
            ctx.shadowColor = this.colorBase + '0.5)';
        }
    }

    // Determine particle count based on screen size for performance
    const particleCount = Math.floor((width * height) / 10000);
    for (let i = 0; i < Math.min(particleCount, 250); i++) {
        particles.push(new BioParticle());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Reset shadow to avoid bleed
        ctx.shadowBlur = 0;

        requestAnimationFrame(animate);
    }

    animate();

    // Prevent form submission redirect
    const form = document.querySelector('.newsletter-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalText = btn.textContent;
            btn.textContent = '登録完了！';
            btn.style.backgroundColor = '#fff';
            btn.style.color = '#000';

            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.backgroundColor = 'var(--color-primary)';
                form.reset();
            }, 3000);
        });
    }
});
