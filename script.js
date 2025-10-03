// SUPER SIMPLE - GUARANTEED TO WORK
console.log('Script loading...');

// Get elements
const dancersEl = document.getElementById('dancers');
const signsEl = document.getElementById('signs');
const scaryOverlay = document.getElementById('scaryOverlay');
const bgm = document.getElementById('bgm');
const scream = document.getElementById('scream');

// Simple arrays to track elements with velocity
let dancerElements = [];
let signElements = [];

// Collision detection
function checkCollision(el1, el2) {
    const rect1 = {
        left: parseInt(el1.style.left) || 0,
        top: parseInt(el1.style.top) || 0,
        width: parseInt(el1.style.width) || 150,
        height: parseInt(el1.style.height) || 150
    };
    
    const rect2 = {
        left: parseInt(el2.style.left) || 0,
        top: parseInt(el2.style.top) || 0,
        width: parseInt(el2.style.width) || 150,
        height: parseInt(el2.style.height) || 150
    };
    
    return !(rect1.left + rect1.width < rect2.left || 
             rect2.left + rect2.width < rect1.left || 
             rect1.top + rect1.height < rect2.top || 
             rect2.top + rect2.height < rect1.top);
}

// Handle collision bounce with proper physics
function handleCollision(el1, el2) {
    // Get current velocities
    const vx1 = el1.vx || 0;
    const vy1 = el1.vy || 0;
    const vx2 = el2.vx || 0;
    const vy2 = el2.vy || 0;
    
    // Calculate collision normal (direction between centers)
    const x1 = parseInt(el1.style.left) + parseInt(el1.style.width) / 2;
    const y1 = parseInt(el1.style.top) + parseInt(el1.style.height) / 2;
    const x2 = parseInt(el2.style.left) + parseInt(el2.style.width) / 2;
    const y2 = parseInt(el2.style.top) + parseInt(el2.style.height) / 2;
    
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return; // Avoid division by zero
    
    const nx = dx / distance;
    const ny = dy / distance;
    
    // Calculate relative velocity in collision normal direction
    const dvx = vx2 - vx1;
    const dvy = vy2 - vy1;
    const dvn = dvx * nx + dvy * ny;
    
    // Don't resolve if velocities are separating
    if (dvn > 0) return;
    
    // Calculate collision impulse (assuming equal mass)
    const impulse = 2 * dvn;
    
    // Apply collision impulse
    el1.vx = vx1 + impulse * nx * 0.8;
    el1.vy = vy1 + impulse * ny * 0.8;
    el2.vx = vx2 - impulse * nx * 0.8;
    el2.vy = vy2 - impulse * ny * 0.8;
}

// Create one dancer
function createDancer(src, index) {
    const div = document.createElement('div');
    div.className = 'dancer';
    div.style.backgroundImage = `url("${src}")`;
    
    // Make dancer 1 (index 0) 20% larger
    const baseSize = 150;
    const size = index === 0 ? baseSize * 1.2 : baseSize; // 20% larger for first dancer
    
    div.style.width = size + 'px';
    div.style.height = size + 'px';
    div.style.position = 'absolute';
    div.style.left = Math.random() * (window.innerWidth - size) + 'px';
    div.style.top = (Math.random() * (window.innerHeight - 300) + 2) + 'px'; // Very close to header (2px)
    div.style.zIndex = '1';
    
    // Add initial velocity
    div.vx = (Math.random() - 0.5) * 2; // Random velocity between -1 and 1
    div.vy = (Math.random() - 0.5) * 2;
    
    dancersEl.appendChild(div);
    return div;
}

// Create one sign
function createSign(text, index) {
    const div = document.createElement('div');
    div.className = 'sign';
    div.textContent = text;
    div.style.width = '200px';
    div.style.height = '80px';
    div.style.position = 'absolute';
    div.style.left = Math.random() * (window.innerWidth - 200) + 'px';
    div.style.top = (Math.random() * (window.innerHeight - 300) + 2) + 'px'; // Very close to header (2px)
    div.style.fontSize = '14px';
    div.style.zIndex = '1';
    
    // Set different colors for each sign
    const colors = ['#6DB8CF', '#B07FBA', '#C5C78B'];
    div.style.backgroundColor = colors[index % colors.length];
    
    // Add initial velocity
    div.vx = (Math.random() - 0.5) * 1.5; // Slightly slower than dancers
    div.vy = (Math.random() - 0.5) * 1.5;
    
    signsEl.appendChild(div);
    return div;
}

// Physics-based animation with proper bouncing
function animate() {
    // Move dancers with velocity + slow wiggle
    dancerElements.forEach(el => {
        // Add slow wiggle to velocity (much slower)
        el.vx += (Math.random() - 0.5) * 0.1; // Very slow wiggle
        el.vy += (Math.random() - 0.5) * 0.1;
        
        // Limit velocity
        el.vx = Math.max(-2, Math.min(2, el.vx));
        el.vy = Math.max(-2, Math.min(2, el.vy));
        
        // Update position based on velocity
        const currentLeft = parseInt(el.style.left) || 0;
        const currentTop = parseInt(el.style.top) || 0;
        const newLeft = currentLeft + el.vx;
        const newTop = currentTop + el.vy;
        
        // Get actual size for wall bouncing
        const actualWidth = parseInt(el.style.width) || 150;
        const actualHeight = parseInt(el.style.height) || 150;
        
        // Bounce off walls
        if (newLeft <= 0 || newLeft >= window.innerWidth - actualWidth) {
            el.vx *= -0.8; // Bounce with some energy loss
            el.style.left = Math.max(0, Math.min(window.innerWidth - actualWidth, newLeft)) + 'px';
        } else {
            el.style.left = newLeft + 'px';
        }
        
        if (newTop <= 2 || newTop >= window.innerHeight - actualHeight) { // Very close to header (2px)
            el.vy *= -0.8; // Bounce with some energy loss
            el.style.top = Math.max(2, Math.min(window.innerHeight - actualHeight, newTop)) + 'px';
        } else {
            el.style.top = newTop + 'px';
        }
    });
    
    // Move signs with velocity + slow wiggle
    signElements.forEach(el => {
        // Add slow wiggle to velocity (much slower)
        el.vx += (Math.random() - 0.5) * 0.08; // Even slower wiggle
        el.vy += (Math.random() - 0.5) * 0.08;
        
        // Limit velocity
        el.vx = Math.max(-1.5, Math.min(1.5, el.vx));
        el.vy = Math.max(-1.5, Math.min(1.5, el.vy));
        
        // Update position based on velocity
        const currentLeft = parseInt(el.style.left) || 0;
        const currentTop = parseInt(el.style.top) || 0;
        const newLeft = currentLeft + el.vx;
        const newTop = currentTop + el.vy;
        
        // Bounce off walls
        if (newLeft <= 0 || newLeft >= window.innerWidth - 200) {
            el.vx *= -0.8; // Bounce with some energy loss
            el.style.left = Math.max(0, Math.min(window.innerWidth - 200, newLeft)) + 'px';
        } else {
            el.style.left = newLeft + 'px';
        }
        
        if (newTop <= 2 || newTop >= window.innerHeight - 80) { // Very close to header (2px)
            el.vy *= -0.8; // Bounce with some energy loss
            el.style.top = Math.max(2, Math.min(window.innerHeight - 80, newTop)) + 'px';
        } else {
            el.style.top = newTop + 'px';
        }
    });
    
    // Check collisions between all elements
    const allElements = [...dancerElements, ...signElements];
    for (let i = 0; i < allElements.length; i++) {
        for (let j = i + 1; j < allElements.length; j++) {
            if (checkCollision(allElements[i], allElements[j])) {
                handleCollision(allElements[i], allElements[j]);
            }
        }
    }
    
    // Keep animating
    requestAnimationFrame(animate);
}

// Start everything
function startEverything() {
    console.log('Starting everything...');
    
    // Clear existing
    dancersEl.innerHTML = '';
    signsEl.innerHTML = '';
    dancerElements = [];
    signElements = [];
    
    // Create 5 dancers
    const dancerSources = [
        'assets/dancers/dancer1.gif',
        'assets/dancers/dancer2.gif', 
        'assets/dancers/dancer3.gif',
        'assets/dancers/dancer4.gif',
        'assets/dancers/dancer5.gif'
    ];
    
    for (let i = 0; i < 4; i++) { // Only 4 dancers now (removed dancer 5)
        const dancer = createDancer(dancerSources[i % dancerSources.length], i);
        dancerElements.push(dancer);
    }
    
    // Create 3 signs
    const signTexts = [
        'Tráete a tus tías, abuela, vecinos… y gana un pase VIP',
        'Empieza a las 5:30 pm, pero se aconseja llegar temprano (tipo 2:00 pm), por si se acaba la cerveza',
        'Trae tus llaves para el jueguito'
    ];
    
    for (let i = 0; i < 3; i++) {
        const sign = createSign(signTexts[i], i);
        signElements.push(sign);
    }
    
    // Start animation
    animate();
    
    // Auto-start music
    console.log('🎵 Auto-starting music...');
    bgm.volume = 0.7;
    bgm.currentTime = 0;
    
    try {
        bgm.play().then(() => {
            console.log('✅ Music auto-started!');
        }).catch((err) => {
            console.log('❌ Music auto-start failed:', err);
        });
    } catch (err) {
        console.log('❌ Music auto-start failed:', err);
    }
    
    console.log('Everything started!');
}

// Scary overlay
function showScary() {
    scaryOverlay.style.display = 'flex';
    scream.play().catch(() => {});
    setTimeout(() => {
        scaryOverlay.style.display = 'none';
    }, 2000);
}

// Music start function
function startMusic() {
    console.log('🎵 Starting music from user interaction...');
    bgm.volume = 0.7;
    bgm.currentTime = 0;
    
    try {
        bgm.play().then(() => {
            console.log('✅ Music started!');
        }).catch((err) => {
            console.log('❌ Music failed to start:', err);
        });
    } catch (err) {
        console.log('❌ Music failed to start:', err);
    }
}

// Event listeners - start music on any touch/click
document.addEventListener('click', startMusic);
document.addEventListener('touchstart', startMusic);

// Visitor Counter (Hidden by default)
function updateVisitorCount() {
    // Get current count from localStorage
    let count = parseInt(localStorage.getItem('visitorCount')) || 0;
    
    // Check if this is a new visitor (not in sessionStorage)
    if (!sessionStorage.getItem('hasVisited')) {
        count++;
        localStorage.setItem('visitorCount', count);
        sessionStorage.setItem('hasVisited', 'true');
    }
    
    // Update the display
    const counterElement = document.getElementById('visitorCount');
    if (counterElement) {
        counterElement.textContent = count;
    }
    
    console.log(`Visitor count: ${count}`);
}

// Secret key combination to show/hide counter (Option+Cmd+Z on Mac)
let keySequence = [];
document.addEventListener('keydown', (e) => {
    keySequence.push(e.key);
    if (keySequence.length > 3) keySequence.shift(); // Keep only last 3 keys
    
    // Check for Option+Cmd+Z combination (Mac) or Alt+Ctrl+Z (Windows/Linux)
    if ((e.metaKey || e.ctrlKey) && e.altKey && e.key === 'Z') {
        const counter = document.getElementById('visitorCounter');
        if (counter) {
            counter.style.display = counter.style.display === 'none' ? 'block' : 'none';
            console.log('Admin counter toggled');
        }
    }
});

// AUTO START ON LOAD
window.addEventListener('load', () => {
    console.log('Page loaded, starting automatically...');
    startEverything();
    updateVisitorCount();
});

console.log('Script loaded!');