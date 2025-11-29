const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

// 3D Carousel Logic
let carouselState = {
    angle: 0,
    isDragging: false,
    startX: 0,
    currentX: 0,
    lastX: 0,
    velocity: 0,
    autoRotateSpeed: 0.5, /* Increased speed from 0.2 */
    isPaused: false,
    radius: 400 // Base radius, will be adjusted
};

function init3DCarousel() {
    const carousel = document.getElementById('cardsCarousel');
    const cards = carousel.querySelectorAll('.card');
    const totalCards = cards.length;

    // Calculate radius based on card width and count to form a circle
    // Circumference = totalCards * (cardWidth + gap)
    // Radius = Circumference / (2 * PI)
    const cardWidth = cards[0].offsetWidth;
    const gap = 20;
    // Adjust radius to ensure cards don't overlap too much and look good
    carouselState.radius = Math.max(300, (totalCards * (cardWidth + gap)) / (2 * Math.PI));

    // Position cards
    cards.forEach((card, index) => {
        const angle = (index / totalCards) * 360;
        // Store base angle for each card
        card.dataset.angle = angle;
        updateCardTransform(card, angle, 0);
    });

    // Event Listeners for Drag/Touch
    const container = document.querySelector('.carousel-container');

    // Touch events
    container.addEventListener('touchstart', handleDragStart, { passive: false });
    container.addEventListener('touchmove', handleDragMove, { passive: false });
    container.addEventListener('touchend', handleDragEnd);

    // Mouse events
    container.addEventListener('mousedown', handleDragStart);
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);

    // Pause on hover
    container.addEventListener('mouseenter', () => carouselState.isPaused = true);
    container.addEventListener('mouseleave', () => {
        carouselState.isPaused = false;
        // If we were dragging and left, ensure we stop dragging
        if (carouselState.isDragging) handleDragEnd();
    });

    // Start animation loop
    requestAnimationFrame(animateCarousel);
}

function updateCardTransform(card, baseAngle, rotationOffset) {
    const finalAngle = baseAngle + rotationOffset;
    // translateZ pushes the card out from center to form circle
    // rotateY rotates the card to face center (or outward)
    // We want them facing outward, so rotateY(angle) translateZ(radius)
    // But we need to rotate the CAROUSEL, not just cards. 
    // Actually, simpler approach: Rotate the CONTAINER (cardsCarousel).
    // Let's stick to rotating the container for performance.

    // Wait, if we rotate container, we don't need to update individual card transforms constantly.
    // We just set their initial positions.
    card.style.transform = `translate(-50%, -50%) rotateY(${baseAngle}deg) translateZ(${carouselState.radius}px)`;
}

function handleDragStart(e) {
    carouselState.isDragging = true;
    carouselState.isPaused = true;
    carouselState.startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    carouselState.lastX = carouselState.startX;
    carouselState.velocity = 0;

    // Prevent default only if needed (e.g. to stop scrolling on mobile while swiping carousel)
    // e.preventDefault(); 
}

function handleDragMove(e) {
    if (!carouselState.isDragging) return;

    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - carouselState.lastX;

    // Update angle based on movement
    // Sensitivity factor
    const sensitivity = 0.5;
    carouselState.angle += deltaX * sensitivity;

    carouselState.velocity = deltaX * sensitivity;
    carouselState.lastX = clientX;
}

function handleDragEnd() {
    carouselState.isDragging = false;
    carouselState.isPaused = false;
}

function animateCarousel() {
    if (!carouselState.isDragging) {
        if (!carouselState.isPaused) {
            // Auto rotation
            carouselState.angle += carouselState.autoRotateSpeed;
        } else {
            // Inertia when paused/released but not dragging? 
            // For now, just simple inertia decay if we want
            if (Math.abs(carouselState.velocity) > 0.01) {
                carouselState.angle += carouselState.velocity;
                carouselState.velocity *= 0.95; // Decay
            }
        }
    }

    const carousel = document.getElementById('cardsCarousel');
    if (carousel) {
        carousel.style.transform = `translateZ(-${carouselState.radius}px) rotateY(${carouselState.angle}deg)`;
    }

    requestAnimationFrame(animateCarousel);
}


// --- Existing Particle & Matrix Code ---

function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = isMobile ? 40 : 100;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        const sizeRandom = Math.random();
        if (sizeRandom > 0.85) {
            particle.style.width = '10px';
            particle.style.height = '10px';
        } else if (sizeRandom > 0.6) {
            particle.style.width = '7px';
            particle.style.height = '7px';
        } else {
            particle.style.width = '4px';
            particle.style.height = '4px';
        }

        const gradients = [
            'radial-gradient(circle, rgba(160, 160, 255, 1) 0%, rgba(160, 160, 255, 0) 70%)',
            'radial-gradient(circle, rgba(255, 160, 255, 1) 0%, rgba(255, 160, 255, 0) 70%)',
            'radial-gradient(circle, rgba(255, 0, 204, 1) 0%, rgba(255, 0, 204, 0) 70%)',
            'radial-gradient(circle, rgba(0, 255, 204, 1) 0%, rgba(0, 255, 204, 0) 70%)'
        ];

        particle.style.background = gradients[Math.floor(Math.random() * gradients.length)];
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = 12 + Math.random() * 18 + 's';
        particle.style.setProperty('--horizontal-drift', (Math.random() - 0.5) * 200 + 'px');

        particlesContainer.appendChild(particle);
    }
}

function createMusicParticles() {
    if (isMobile) return;

    const musicSymbols = ['♪', '♫', '♩', '♬', '🎵', '🎶', '🎤', '🎧', '⚡', '✨'];
    const colors = ['#a0a0ff', '#ffa0ff', '#00f0ff', '#FF00CC', '#00FFCC'];

    setInterval(() => {
        const particle = document.createElement('div');
        particle.className = 'music-particle';
        particle.textContent = musicSymbols[Math.floor(Math.random() * musicSymbols.length)];
        particle.style.left = Math.random() * 100 + '%';
        particle.style.color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.fontSize = 18 + Math.random() * 28 + 'px';
        particle.style.animationDuration = 6 + Math.random() * 5 + 's';

        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 11000);
    }, 700);
}

function initMatrixCanvas() {
    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const characters = '01FXA$#¥£€βKPOPWARRIORS';
    const fontSize = 16;
    const columns = Math.ceil(width / fontSize);
    const drops = Array.from({ length: columns }, () => Math.random() * -100);

    const hexRadius = 40;

    function drawStaticHexagons() {
        for (let y = 0; y < height + hexRadius * 2; y += hexRadius * 1.732) {
            for (let x = 0; x < width + hexRadius * 3; x += hexRadius * 3) {
                drawHexagon(x, y, Math.random() > 0.5 ? '#00FFCC' : '#FF00CC', 0.2);
                drawHexagon(x + hexRadius * 1.5, y + hexRadius * 0.866, Math.random() > 0.5 ? '#00FFCC' : '#FF00CC', 0.15);
            }
        }
    }

    function drawHexagon(x, y, color, alpha) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = Math.PI / 3 * i;
            const hx = x + hexRadius * Math.cos(angle);
            const hy = y + hexRadius * Math.sin(angle);
            if (i === 0) {
                ctx.moveTo(hx, hy);
            } else {
                ctx.lineTo(hx, hy);
            }
        }
        ctx.closePath();
        ctx.strokeStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    drawStaticHexagons();

    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 16, 0.05)';
        ctx.fillRect(0, 0, width, height);

        ctx.font = fontSize + 'px monospace';
        for (let i = 0; i < drops.length; i++) {
            const text = characters[Math.floor(Math.random() * characters.length)];
            const x = i * fontSize;
            const y = drops[i] * fontSize;

            const color = i % 2 === 0 ? '#FF00CC' : '#00FFCC';
            ctx.fillStyle = color;
            ctx.fillText(text, x, y);

            if (y > height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i] += 1.5;
        }
    }

    setInterval(draw, isMobile ? 60 : 40);

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            // Re-init carousel on resize to adjust radius
            init3DCarousel();
        }, 250);
    });
}

document.addEventListener('mousemove', function (e) {
    if (isMobile) return;

    const trailContainer = document.getElementById('mouse-trail-container');
    const particle = document.createElement('div');
    particle.className = 'mouse-trail-particle';

    particle.style.left = e.clientX + 'px';
    particle.style.top = e.clientY + 'px';
    particle.style.background = Math.random() > 0.5 ? '#FF00CC' : '#00FFCC';
    particle.style.boxShadow = `0 0 10px ${particle.style.background}`;

    trailContainer.appendChild(particle);
    setTimeout(() => particle.remove(), 800);
});

function updateDiagClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
    const dateString = now.toLocaleDateString('en-US', {
        year: 'numeric', month: '2-digit', day: '2-digit'
    });
    document.getElementById('diag-time').textContent = `${dateString} // ${timeString}`;

    if (Math.random() < 0.05) {
        document.getElementById('system-status').textContent = 'ANOMALÍA DETECTADA...';
    } else {
        document.getElementById('system-status').textContent = 'DOMINACIÓN GLOBAL: 99.9%';
    }
}

function attachCTAInteractions() {
    document.querySelectorAll('.cta-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height) * 2;
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.position = 'absolute';
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'radial-gradient(circle, rgba(255, 255, 255, 0.35) 0%, transparent 70%)';
            ripple.style.transform = 'scale(0)';
            ripple.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
            ripple.style.pointerEvents = 'none';

            button.style.position = 'relative';
            button.style.overflow = 'hidden';
            button.appendChild(ripple);

            requestAnimationFrame(() => {
                ripple.style.transform = 'scale(1)';
                ripple.style.opacity = '0';
            });

            setTimeout(() => ripple.remove(), 600);

            if (!isMobile) {
                for (let i = 0; i < 24; i++) {
                    const particle = document.createElement('div');
                    particle.style.position = 'fixed';
                    particle.style.left = e.clientX + 'px';
                    particle.style.top = e.clientY + 'px';
                    particle.style.width = '5px';
                    particle.style.height = '5px';
                    particle.style.borderRadius = '50%';
                    particle.style.background = 'radial-gradient(circle, rgba(255, 160, 255, 1) 0%, rgba(255, 160, 255, 0) 70%)';
                    particle.style.pointerEvents = 'none';
                    particle.style.zIndex = '9999';

                    const angle = (Math.PI * 2 * i) / 24;
                    const velocity = 4 + Math.random() * 8;
                    const lifetime = 400 + Math.random() * 600;

                    particle.style.transform = 'translate(0, 0)';
                    particle.style.transition = `transform ${lifetime}ms ease-out, opacity ${lifetime}ms ease-out`;
                    particle.style.opacity = '1';

                    document.body.appendChild(particle);

                    requestAnimationFrame(() => {
                        particle.style.transform = `translate(${Math.cos(angle) * velocity * 14}px, ${Math.sin(angle) * velocity * 14}px)`;
                        particle.style.opacity = '0';
                    });

                    setTimeout(() => particle.remove(), lifetime);
                }
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const heroBanner = document.getElementById('hero-banner');
    const heroSection = document.querySelector('.hero-section');

    // SOLO efecto hover, SIN parallax de scroll
    if (!isMobile) {
        const tiltFactor = 4;

        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const moveX = (e.clientX - centerX) / (rect.width / 2);
            const moveY = (e.clientY - centerY) / (rect.height / 2);

            heroBanner.style.transform = `perspective(1500px) 
                                                  rotateX(${-moveY * tiltFactor}deg) 
                                                  rotateY(${moveX * tiltFactor}deg)`;

            const title = document.querySelector('.hero-title');
            title.style.transform = `translate(${moveX * 8}px, ${moveY * 8}px)`;
        });

        heroSection.addEventListener('mouseleave', () => {
            heroBanner.style.transform = `perspective(1500px) 
                                                  rotateX(0deg) 
                                                  rotateY(0deg)`;
            document.querySelector('.hero-title').style.transform = `translate(0, 0)`;
        });
    }

    createParticles();
    createMusicParticles();
    initMatrixCanvas();
    updateDiagClock();
    setInterval(updateDiagClock, 1000);
    attachCTAInteractions();

    // Init 3D Carousel
    init3DCarousel();
});