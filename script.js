// ======================================
// PART 1
// ENVELOPE OPENING ANIMATION
// ======================================

// Elements
const openBtn = document.getElementById("openInvite");
const flap = document.querySelector(".flap");
const letter = document.querySelector(".letter");
const entry = document.getElementById("entryScreen");
const website = document.getElementById("website");
const music = document.getElementById("music");
const musicBtn = document.getElementById("musicBtn");

// Hide Website Initially
website.style.display = "none";

const leftDoor = document.querySelector(".left-door");
const rightDoor = document.querySelector(".right-door");
const seal = document.querySelector(".centerSeal");

openBtn.addEventListener("click", () => {
    // Music control
    music.currentTime = 10;
    music.play();

    // Seal disappear
    seal.classList.add("hide");

    // Doors open
    leftDoor.classList.add("open");
    rightDoor.classList.add("open");

    if (navigator.vibrate) {
        navigator.vibrate(150);
    }

    setTimeout(() => {
        entry.style.transition = "1s";
        entry.style.opacity = "0";
    }, 1800);

    setTimeout(() => {
        entry.style.display = "none";
        website.style.display = "block";
        website.style.animation = "fadeIn 1.2s";

        // ✨ FIX: Initialize scratch card canvas now that display is no longer "none"
        initScratch(); 
        reveal();
    }, 2800);
});


// ======================================
// MUSIC CONTROL
// ======================================

function toggleMusic() {
    if (music.paused) {
        music.play();
        if (musicBtn) musicBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    } else {
        music.pause();
        if (musicBtn) musicBtn.innerHTML = '<i class="fa-solid fa-music"></i>';
    }
}

if (musicBtn) {
    musicBtn.addEventListener("click", toggleMusic);
}


// ======================================
// FLOATING SPARKLES (BACKGROUND)
// ======================================

function createSparkle() {
    const sparkle = document.createElement("div");
    sparkle.innerHTML = "✨";
    sparkle.style.position = "fixed";
    sparkle.style.left = Math.random() * 100 + "vw";
    sparkle.style.top = Math.random() * 100 + "vh";
    sparkle.style.fontSize = (12 + Math.random() * 18) + "px";
    sparkle.style.pointerEvents = "none";
    sparkle.style.zIndex = "999";
    sparkle.style.animation = "floatUp 4s linear";

    document.body.appendChild(sparkle);

    setTimeout(() => {
        sparkle.remove();
    }, 4000);
}

setInterval(createSparkle, 1200);


// ======================================
// PREMIUM SCRATCH CARD
// ======================================

const canvas = document.getElementById("scratchCanvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

let isDrawing = false;
let scratchCompleted = false;

function initScratch() {
    const container = document.querySelector(".scratch-container");
    if (!container || container.offsetWidth === 0) return;

    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    canvas.style.display = "block";
    canvas.style.opacity = "1";
    canvas.style.transform = "none";

    scratchCompleted = false;

    ctx.globalCompositeOperation = "source-over";

    // Gold Gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#f7e7a1");
    gradient.addColorStop(0.5, "#d4af37");
    gradient.addColorStop(1, "#b8860b");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Shine lines
    ctx.fillStyle = "rgba(255,255,255,.12)";
    for (let i = -canvas.height; i < canvas.width; i += 40) {
        ctx.save();
        ctx.translate(i, 0);
        ctx.rotate(-0.45);
        ctx.fillRect(0, 0, 16, canvas.height * 2);
        ctx.restore();
    }

    // Overlay Texts
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = "bold 24px Cinzel";
    ctx.fillText("Scratch Here", canvas.width / 2, canvas.height / 2 - 18);

    ctx.font = "18px Poppins";
    ctx.fillText("To Reveal Date", canvas.width / 2, canvas.height / 2 + 18);

    // Swap to erase mode
    ctx.globalCompositeOperation = "destination-out";
}

function getPosition(e) {
    const rect = canvas.getBoundingClientRect();
    let x, y;

    if (e.touches && e.touches.length > 0) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
    } else {
        x = e.clientX;
        y = e.clientY;
    }

    return {
        x: x - rect.left,
        y: y - rect.top
    };
}

function scratch(e) {
    if (!isDrawing || scratchCompleted) return;
    if (e.cancelable) e.preventDefault();

    const pos = getPosition(e);

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 28, 0, Math.PI * 2);
    ctx.fill();
}

// Scratch Event Listeners (Desktop)
canvas.addEventListener("mousedown", function (e) {
    isDrawing = true;
    scratch(e);
});

canvas.addEventListener("mousemove", scratch);

window.addEventListener("mouseup", function () {
    if (isDrawing) {
        isDrawing = false;
        checkScratch();
    }
});

// Scratch Event Listeners (Mobile)
canvas.addEventListener("touchstart", function (e) {
    isDrawing = true;
    scratch(e);
}, { passive: false });

canvas.addEventListener("touchmove", scratch, { passive: false });

window.addEventListener("touchend", function () {
    if (isDrawing) {
        isDrawing = false;
        checkScratch();
    }
});

function checkScratch() {
    if (scratchCompleted) return;

    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = image.data;
    let transparent = 0;

    for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] === 0) {
            transparent++;
        }
    }

    const percent = transparent / (pixels.length / 4);

    if (percent > 0.60) {
        scratchCompleted = true;
        revealScratch();
    }
}

function revealScratch() {
    // Smooth transition canvas out
    canvas.style.transition = "opacity 0.8s ease, transform 0.8s ease";
    canvas.style.opacity = "0";
    canvas.style.transform = "scale(1.05)";

    // Golden flash overlay
    const flash = document.createElement("div");
    flash.style.position = "absolute";
    flash.style.inset = "0";
    flash.style.background = "radial-gradient(circle, rgba(255,215,0,0.9), transparent 70%)";
    flash.style.opacity = "0";
    flash.style.animation = "goldFlash 1s ease-out forwards";
    flash.style.pointerEvents = "none";
    flash.style.zIndex = "5";

    const container = document.querySelector(".scratch-container");
    container.appendChild(flash);

    // ✨ FIX: Set CSS translate properties dynamically for full explosion burst effect
    for (let i = 0; i < 25; i++) {
        const sparkle = document.createElement("div");
        sparkle.innerHTML = "✨";
        sparkle.style.position = "absolute";
        sparkle.style.left = "50%";
        sparkle.style.top = "50%";
        sparkle.style.fontSize = (10 + Math.random() * 18) + "px";
        
        const angle = Math.random() * Math.PI * 2;
        const distance = 60 + Math.random() * 120;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        sparkle.style.setProperty('--x', `${x}px`);
        sparkle.style.setProperty('--y', `${y}px`);
        sparkle.style.transform = "translate(-50%, -50%)";
        sparkle.style.animation = `sparkleBurst ${1 + Math.random()}s ease-out forwards`;
        sparkle.style.pointerEvents = "none";

        container.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1500);
    }

    // Trigger full library confetti
    if (typeof launchConfetti === "function") {
        launchConfetti();
    }

    if (navigator.vibrate) {
        navigator.vibrate([80, 40, 80]);
    }

    setTimeout(() => {
        canvas.style.display = "none";
    }, 800);
}

// ======================================
// FIXED: Mobile scroll up-down karne par card wapas nahi aayega
// ======================================
let lastWindowWidth = window.innerWidth;

window.addEventListener("resize", () => {
    // 1. Agar ek baar scratch ho gaya, toh fari thi initialize nahi karna hai
    if (scratchCompleted) return;

    // 2. Sirf tabhi check karo jab true width change ho (mobile scroll par width change nahi hoti, sirf height hoti hai)
    const currentWidth = window.innerWidth;
    if (currentWidth !== lastWindowWidth) {
        lastWindowWidth = currentWidth; // Width update karo

        if (document.getElementById("website").style.display !== "none") {
            initScratch();
        }
    }
});


// ======================================
// VISUAL PREMIUM EFFECTS
// ======================================

function goldDust() {
    for (let i = 0; i < 50; i++) {
        const dust = document.createElement("div");
        dust.className = "goldDust";
        dust.style.left = Math.random() * window.innerWidth + "px";
        dust.style.top = Math.random() * window.innerHeight + "px";
        dust.style.animationDuration = (1 + Math.random() * 2) + "s";

        document.body.appendChild(dust);

        setTimeout(() => {
            dust.remove();
        }, 2500);
    }
}

function launchConfetti() {
    confetti({
        particleCount: 220,
        spread: 120,
        startVelocity: 45,
        origin: { y: .6 }
    });
}

// Countdown Timer
const targetDate = new Date("July 19, 2026 10:00:00").getTime();

function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
        document.getElementById("days").innerHTML = "00";
        document.getElementById("hours").innerHTML = "00";
        document.getElementById("minutes").innerHTML = "00";
        document.getElementById("seconds").innerHTML = "00";
        return;
    }

    document.getElementById("days").innerHTML = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0');
    document.getElementById("hours").innerHTML = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
    document.getElementById("minutes").innerHTML = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
    document.getElementById("seconds").innerHTML = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
}

setInterval(updateCountdown, 1000);
updateCountdown();

// Floating Hearts Engine
function createHeart() {
    const heart = document.createElement("div");
    heart.innerHTML = "❤";
    heart.className = "floating-heart";
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.fontSize = (18 + Math.random() * 25) + "px";
    heart.style.animationDuration = (5 + Math.random() * 5) + "s";

    document.body.appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 10000);
}
setInterval(createHeart, 1800);

// Falling Flower Petals Engine
const flowers = ["❤️", "✨", "🤍"];
function createPetal() {
    const petal = document.createElement("div");
    petal.className = "flower";
    petal.innerHTML = flowers[Math.floor(Math.random() * flowers.length)];
    petal.style.left = Math.random() * 100 + "vw";
    petal.style.fontSize = (18 + Math.random() * 18) + "px";
    petal.style.animationDuration = (8 + Math.random() * 6) + "s";

    document.body.appendChild(petal);

    setTimeout(() => {
        petal.remove();
    }, 14000);
}
setInterval(createPetal, 900);

// Background Gold Particles
function goldParticle() {
    const particle = document.createElement("div");
    particle.className = "goldParticle";
    particle.style.left = Math.random() * 100 + "vw";
    particle.style.top = Math.random() * 100 + "vh";
    particle.style.animationDuration = (3 + Math.random() * 3) + "s";

    document.body.appendChild(particle);

    setTimeout(() => {
        particle.remove();
    }, 6000);
}
setInterval(goldParticle, 350);


// =============================
// SCROLL REVEAL LAYOUTS
// =============================

const revealItems = document.querySelectorAll(".glass, .countdown, .venue, .rsvp, footer");

function reveal() {
    revealItems.forEach(item => {
        const top = item.getBoundingClientRect().top;
        if (top < window.innerHeight - 120) {
            item.classList.add("show");
        }
    });
}

window.addEventListener("scroll", reveal);

// Hero Parallax Effect
const hero = document.querySelector(".hero");
window.addEventListener("scroll", () => {
    let y = window.scrollY;
    if (hero) {
        hero.style.backgroundPositionY = y * 0.4 + "px";
    }
});


// =============================
// BUTTON CLICK RIPPLE EFFECT
// =============================

document.querySelectorAll(".btn, .mapBtn").forEach(btn => {
    btn.addEventListener("click", function (e) {
        const ripple = document.createElement("span");
        ripple.className = "ripple";

        const d = Math.max(this.clientWidth, this.clientHeight);
        ripple.style.width = d + "px";
        ripple.style.height = d + "px";

        ripple.style.left = e.offsetX - d / 2 + "px";
        ripple.style.top = e.offsetY - d / 2 + "px";

        this.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 700);
    });
});


// =============================
// INITIALIZE ON LOAD
// =============================

window.addEventListener("load", () => {
    console.log("Luxury Invitation Loaded ❤️");
});



const scrollIndicator = document.querySelector(".scroll-down");

window.addEventListener("scroll", () => {
    if (window.scrollY > 80) {
        scrollIndicator.style.opacity = "0";
        scrollIndicator.style.pointerEvents = "none";
    } else {
        scrollIndicator.style.opacity = "1";
    }
});


// Scratch complete
document.querySelector(".scroll-indicator").style.display = "flex";