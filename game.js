// Game configuration
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 450;
canvas.height = 600;

// Game variables
let gameState = 'start'; // 'start', 'playing', 'gameover'
let score = 0;
let highScore = localStorage.getItem('doodleJumpHighScore') || 0;
let cameraY = 0;

// Player object
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 150,
    width: 50,
    height: 50,
    velocityX: 0,
    velocityY: 0,
    maxSpeed: 6,        // Maximum horizontal speed
    acceleration: 0.4,   // How quickly player accelerates
    friction: 0.85,      // Deceleration when no input (0-1, lower = more friction)
    airFriction: 0.92,   // Less friction in air for more control
    jumpPower: -12,
    gravity: 0.4,
    color: '#4CAF50',
    isOnGround: false,   // Track if player is on a platform
    direction: 1         // 1 = facing right, -1 = facing left
};

// Platform array
let platforms = [];
const platformWidth = 80;
const platformHeight = 15;
const platformGap = 80;

// Calculate maximum horizontal reach
// Player can move horizontally while jumping
// Time to reach same height = 2 * jumpPower / gravity
// Max horizontal distance = maxSpeed * time (accounting for air time)
const maxJumpTime = Math.abs(2 * player.jumpPower / player.gravity);
const maxHorizontalReach = player.maxSpeed * maxJumpTime * 0.7; // 0.7 safety factor

// Platform type probabilities and configuration
const PLATFORM_TYPES = {
    NORMAL: 'normal',
    MOVING: 'moving',
    BREAKABLE: 'breakable',
    DISAPPEARING: 'disappearing'
};

// Power-up types
const POWERUP_TYPES = {
    SPRING: 'spring',
    JETPACK: 'jetpack',
    PROPELLER: 'propeller'
};

// Power-up array
let powerups = [];

// Active power-up state
let activePowerup = {
    type: null,
    timer: 0,
    active: false
};

// Enemy types
const ENEMY_TYPES = {
    MONSTER: 'monster',
    UFO: 'ufo'
};

// Enemies and projectiles
let enemies = [];
let projectiles = [];

// Background elements
let clouds = [];
let stars = [];
let shootingStars = [];

// Audio context and sounds
let audioContext;
let sounds = {
    jump: null,
    powerup: null,
    break: null,
    gameover: null
};
let isMuted = false;

// Initialize audio
function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Web Audio API not supported');
    }
}

// Play jump sound
function playJumpSound() {
    if (!audioContext || isMuted) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Play spring sound (higher pitch jump)
function playSpringSound() {
    if (!audioContext || isMuted) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.15);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
}

// Play power-up collection sound
function playPowerupSound() {
    if (!audioContext || isMuted) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.05);
    oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

// Play break sound
function playBreakSound() {
    if (!audioContext || isMuted) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Play game over sound
function playGameOverSound() {
    if (!audioContext || isMuted) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Play jetpack sound (continuous while active)
function playJetpackSound() {
    if (!audioContext || isMuted) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(80, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(100, audioContext.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Play shoot sound
function playShootSound() {
    if (!audioContext || isMuted) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Play enemy hit sound
function playEnemyHitSound() {
    if (!audioContext || isMuted) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

// Background music - More melodic and acoustic
let bgMusicPlaying = false;
let musicTempo = 400; // Base tempo in ms
let beatCounter = 0;

function startBackgroundMusic() {
    if (!audioContext || isMuted || bgMusicPlaying) return;
    
    bgMusicPlaying = true;
    beatCounter = 0;
    playMelodicMusic();
}

function getMusicIntensity() {
    // Return intensity level based on current score (1-5)
    if (score >= DIFFICULTY_LEVELS.HARD) {
        return 5; // Maximum intensity
    } else if (score >= DIFFICULTY_LEVELS.INTRODUCE_DISAPPEARING) {
        return 4;
    } else if (score >= DIFFICULTY_LEVELS.INTRODUCE_BREAKABLE) {
        return 3;
    } else if (score >= DIFFICULTY_LEVELS.INTRODUCE_MOVING) {
        return 2;
    } else {
        return 1; // Starting intensity
    }
}

// Musical chord progressions (frequencies in Hz)
const CHORDS = {
    C: [261.63, 329.63, 392.00],  // C-E-G
    Am: [220.00, 261.63, 329.63], // A-C-E
    F: [174.61, 220.00, 261.63],  // F-A-C
    G: [196.00, 246.94, 293.66]   // G-B-D
};

// Melody notes for a happy, uplifting tune
const MELODY_PATTERNS = {
    1: [523.25, 587.33, 659.25, 587.33, 523.25, 493.88, 523.25, 587.33], // Simple, calm
    2: [523.25, 659.25, 587.33, 698.46, 659.25, 587.33, 523.25, 493.88], // More movement
    3: [659.25, 698.46, 783.99, 698.46, 659.25, 698.46, 783.99, 659.25], // Higher, energetic
    4: [783.99, 880.00, 987.77, 880.00, 783.99, 698.46, 783.99, 880.00], // Very energetic
    5: [987.77, 880.00, 783.99, 880.00, 987.77, 1046.50, 987.77, 880.00] // Intense
};

function playMelodicMusic() {
    if (!bgMusicPlaying || isMuted) return;
    
    const intensity = getMusicIntensity();
    
    // Adjust tempo based on intensity
    musicTempo = 450 - (intensity - 1) * 50; // 450ms → 250ms
    const noteDuration = musicTempo * 0.85 / 1000;
    
    // Get melody pattern for current intensity
    const melody = MELODY_PATTERNS[intensity];
    const noteIndex = beatCounter % melody.length;
    const melodyNote = melody[noteIndex];
    
    // Chord progression (changes every 4 beats)
    const chordIndex = Math.floor(beatCounter / 4) % 4;
    const chordProgression = ['C', 'Am', 'F', 'G'];
    const currentChord = CHORDS[chordProgression[chordIndex]];
    
    // Play melody with acoustic-like tone (triangle wave with envelope)
    const melodyOsc = audioContext.createOscillator();
    const melodyGain = audioContext.createGain();
    melodyOsc.connect(melodyGain);
    melodyGain.connect(audioContext.destination);
    
    melodyOsc.type = 'triangle'; // Softer, more acoustic
    melodyOsc.frequency.setValueAtTime(melodyNote, audioContext.currentTime);
    
    // ADSR envelope for more natural sound
    melodyGain.gain.setValueAtTime(0, audioContext.currentTime);
    melodyGain.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.02); // Attack
    melodyGain.gain.linearRampToValueAtTime(0.06, audioContext.currentTime + 0.05); // Decay
    melodyGain.gain.setValueAtTime(0.06, audioContext.currentTime + noteDuration - 0.05); // Sustain
    melodyGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + noteDuration); // Release
    
    melodyOsc.start(audioContext.currentTime);
    melodyOsc.stop(audioContext.currentTime + noteDuration);
    
    // Add gentle harmony at intensity 2+
    if (intensity >= 2) {
        const harmonyOsc = audioContext.createOscillator();
        const harmonyGain = audioContext.createGain();
        harmonyOsc.connect(harmonyGain);
        harmonyGain.connect(audioContext.destination);
        
        harmonyOsc.type = 'sine';
        harmonyOsc.frequency.setValueAtTime(melodyNote * 0.75, audioContext.currentTime); // Third below
        
        harmonyGain.gain.setValueAtTime(0, audioContext.currentTime);
        harmonyGain.gain.linearRampToValueAtTime(0.03, audioContext.currentTime + 0.02);
        harmonyGain.gain.linearRampToValueAtTime(0.02, audioContext.currentTime + 0.05);
        harmonyGain.gain.setValueAtTime(0.02, audioContext.currentTime + noteDuration - 0.05);
        harmonyGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + noteDuration);
        
        harmonyOsc.start(audioContext.currentTime);
        harmonyOsc.stop(audioContext.currentTime + noteDuration);
    }
    
    // Add chord accompaniment at intensity 3+ (plays on downbeats)
    if (intensity >= 3 && beatCounter % 2 === 0) {
        currentChord.forEach((freq, i) => {
            const chordOsc = audioContext.createOscillator();
            const chordGain = audioContext.createGain();
            chordOsc.connect(chordGain);
            chordGain.connect(audioContext.destination);
            
            chordOsc.type = 'sine';
            chordOsc.frequency.setValueAtTime(freq, audioContext.currentTime);
            
            const volume = 0.015 - (i * 0.003); // Lower notes slightly louder
            chordGain.gain.setValueAtTime(0, audioContext.currentTime);
            chordGain.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.05);
            chordGain.gain.setValueAtTime(volume, audioContext.currentTime + noteDuration * 1.5);
            chordGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + noteDuration * 2);
            
            chordOsc.start(audioContext.currentTime);
            chordOsc.stop(audioContext.currentTime + noteDuration * 2);
        });
    }
    
    // Add bass line at intensity 4+
    if (intensity >= 4 && beatCounter % 2 === 0) {
        const bassOsc = audioContext.createOscillator();
        const bassGain = audioContext.createGain();
        bassOsc.connect(bassGain);
        bassGain.connect(audioContext.destination);
        
        bassOsc.type = 'sine'; // Sine wave for smooth bass
        bassOsc.frequency.setValueAtTime(currentChord[0] * 0.5, audioContext.currentTime); // Root note, octave down
        
        bassGain.gain.setValueAtTime(0, audioContext.currentTime);
        bassGain.gain.linearRampToValueAtTime(0.04, audioContext.currentTime + 0.01);
        bassGain.gain.linearRampToValueAtTime(0.03, audioContext.currentTime + 0.05);
        bassGain.gain.setValueAtTime(0.03, audioContext.currentTime + noteDuration * 1.5);
        bassGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + noteDuration * 2);
        
        bassOsc.start(audioContext.currentTime);
        bassOsc.stop(audioContext.currentTime + noteDuration * 2);
    }
    
    // Add subtle percussion at intensity 5 (hi-hat like sound)
    if (intensity >= 5 && beatCounter % 1 === 0) {
        const noiseGain = audioContext.createGain();
        noiseGain.connect(audioContext.destination);
        
        // Create filtered noise for hi-hat effect
        const bufferSize = audioContext.sampleRate * 0.05;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = audioContext.createBufferSource();
        noise.buffer = buffer;
        
        const filter = audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 8000;
        
        noise.connect(filter);
        filter.connect(noiseGain);
        
        noiseGain.gain.setValueAtTime(0.02, audioContext.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
        
        noise.start(audioContext.currentTime);
        noise.stop(audioContext.currentTime + 0.05);
    }
    
    beatCounter++;
    setTimeout(playMelodicMusic, musicTempo);
}

function stopBackgroundMusic() {
    bgMusicPlaying = false;
    beatCounter = 0;
}

function toggleMute() {
    isMuted = !isMuted;
    document.getElementById('muteBtn').textContent = isMuted ? '🔇 Unmute' : '🔊 Mute';
    
    if (isMuted) {
        stopBackgroundMusic();
    } else if (gameState === 'playing') {
        startBackgroundMusic();
    }
}

// Difficulty thresholds (based on score) - Spaced out more due to power-ups
const DIFFICULTY_LEVELS = {
    EASY: 0,           // Start: Only normal platforms
    INTRODUCE_MOVING: 300,    // Score 300: Introduce moving platforms
    INTRODUCE_BREAKABLE: 800, // Score 800: Introduce breakable platforms
    INTRODUCE_DISAPPEARING: 1400, // Score 1400: Introduce disappearing platforms
    HARD: 2000         // Score 2000+: Maximum difficulty
};

// Get platform configuration based on current score
function getPlatformConfig(currentScore) {
    if (currentScore < DIFFICULTY_LEVELS.INTRODUCE_MOVING) {
        // Level 1: Only normal platforms
        return {
            normal: 1.0
        };
    } else if (currentScore < DIFFICULTY_LEVELS.INTRODUCE_BREAKABLE) {
        // Level 2: Normal + Moving
        return {
            normal: 0.75,
            moving: 0.25
        };
    } else if (currentScore < DIFFICULTY_LEVELS.INTRODUCE_DISAPPEARING) {
        // Level 3: Normal + Moving + Breakable
        return {
            normal: 0.60,
            moving: 0.25,
            breakable: 0.15
        };
    } else if (currentScore < DIFFICULTY_LEVELS.HARD) {
        // Level 4: All platform types
        return {
            normal: 0.55,
            moving: 0.25,
            breakable: 0.10,
            disappearing: 0.10
        };
    } else {
        // Level 5: Maximum difficulty
        return {
            normal: 0.45,
            moving: 0.30,
            breakable: 0.12,
            disappearing: 0.13
        };
    }
}

// Update difficulty level display
function updateDifficultyDisplay(currentScore) {
    let level = 1;
    let name = 'Easy';
    
    if (currentScore >= DIFFICULTY_LEVELS.HARD) {
        level = 5;
        name = 'Expert';
    } else if (currentScore >= DIFFICULTY_LEVELS.INTRODUCE_DISAPPEARING) {
        level = 4;
        name = 'Hard';
    } else if (currentScore >= DIFFICULTY_LEVELS.INTRODUCE_BREAKABLE) {
        level = 3;
        name = 'Medium';
    } else if (currentScore >= DIFFICULTY_LEVELS.INTRODUCE_MOVING) {
        level = 2;
        name = 'Normal';
    }
    
    document.getElementById('difficultyLevel').textContent = level;
    document.getElementById('difficultyName').textContent = `(${name})`;
}

// Input handling
const keys = {};

// Helper function to generate random platform type based on current score
function getRandomPlatformType(currentScore) {
    const config = getPlatformConfig(currentScore);
    const rand = Math.random();
    let cumulative = 0;
    
    for (const [type, probability] of Object.entries(config)) {
        cumulative += probability;
        if (rand < cumulative) {
            return type;
        }
    }
    
    return PLATFORM_TYPES.NORMAL; // Fallback
}

// Check if a platform position is reachable from any recent platform
function isReachableFrom(newX, recentPlatforms) {
    // Check if new platform is within horizontal reach of any recent platform
    for (const platform of recentPlatforms) {
        let platformCenterX = platform.x + platform.width / 2;
        
        // For moving platforms, consider their full movement range
        if (platform.type === PLATFORM_TYPES.MOVING && platform.moveRange) {
            // Check both extreme positions of the moving platform
            const leftExtreme = platform.startX - platform.moveRange;
            const rightExtreme = platform.startX + platform.moveRange;
            
            // Check if reachable from either extreme
            for (const testX of [leftExtreme, rightExtreme, platform.startX]) {
                const testCenterX = testX + platform.width / 2;
                const newPlatformCenterX = newX + platformWidth / 2;
                
                let distance = Math.abs(newPlatformCenterX - testCenterX);
                const wrappedDistance = canvas.width - distance;
                distance = Math.min(distance, wrappedDistance);
                
                if (distance <= maxHorizontalReach) {
                    return true;
                }
            }
        } else {
            // Static platform (or normal)
            const newPlatformCenterX = newX + platformWidth / 2;
            
            // Calculate horizontal distance
            let distance = Math.abs(newPlatformCenterX - platformCenterX);
            
            // Account for screen wrapping - player can go off one edge and appear on other
            const wrappedDistance = canvas.width - distance;
            distance = Math.min(distance, wrappedDistance);
            
            // If within reach, this position is valid
            if (distance <= maxHorizontalReach) {
                return true;
            }
        }
    }
    
    return false;
}

// Generate a reachable platform X position
function getReachablePlatformX(recentPlatforms, maxAttempts = 20) {
    // Filter out broken or disappeared platforms - they're not usable
    const usablePlatforms = recentPlatforms.filter(p => !p.broken && !p.disappeared);
    
    // If no usable platforms, place randomly
    if (usablePlatforms.length === 0) {
        return Math.random() * (canvas.width - platformWidth);
    }
    
    // Try random positions first
    for (let i = 0; i < maxAttempts; i++) {
        const x = Math.random() * (canvas.width - platformWidth);
        if (isReachableFrom(x, usablePlatforms)) {
            return x;
        }
    }
    
    // If random attempts failed, place platform near a recent one
    const referencePlatform = usablePlatforms[Math.floor(Math.random() * usablePlatforms.length)];
    const centerX = referencePlatform.x + referencePlatform.width / 2;
    
    // Place within safe horizontal distance
    const maxOffset = maxHorizontalReach * 0.6; // Stay well within reach
    const offset = (Math.random() - 0.5) * 2 * maxOffset;
    let newX = centerX + offset - platformWidth / 2;
    
    // Keep within bounds
    newX = Math.max(0, Math.min(canvas.width - platformWidth, newX));
    
    return newX;
}

// Helper function to create a new platform
function createPlatform(x, y, currentScore = 0, forceNormal = false) {
    const type = forceNormal ? PLATFORM_TYPES.NORMAL : getRandomPlatformType(currentScore);
    
    const platform = {
        x: x,
        y: y,
        width: platformWidth,
        height: platformHeight,
        type: type,
        broken: false,
        disappeared: false,
        hasPowerup: false // Track if this platform has a power-up
    };
    
    // Add specific properties for moving platforms
    if (type === PLATFORM_TYPES.MOVING) {
        platform.moveSpeed = 2;
        platform.moveDirection = Math.random() > 0.5 ? 1 : -1;
        platform.moveRange = 100; // How far it moves in each direction
        platform.startX = x;
    }
    
    // Add timer for disappearing platforms
    if (type === PLATFORM_TYPES.DISAPPEARING) {
        platform.disappearTimer = 0;
        platform.touched = false;
    }
    
    // Randomly add springs to normal platforms (15% chance)
    if (type === PLATFORM_TYPES.NORMAL && Math.random() < 0.15) {
        platform.hasPowerup = true;
        createPowerup(x + platformWidth / 2 - 10, y - 15, POWERUP_TYPES.SPRING, platform);
    }
    
    return platform;
}

// Create a power-up
function createPowerup(x, y, type, attachedPlatform = null) {
    const powerup = {
        x: x,
        y: y,
        width: 20,
        height: type === POWERUP_TYPES.SPRING ? 15 : 30,
        type: type,
        collected: false,
        attachedPlatform: attachedPlatform // For springs attached to platforms
    };
    
    // Floating power-ups (jetpack, propeller) have different properties
    if (type === POWERUP_TYPES.JETPACK || type === POWERUP_TYPES.PROPELLER) {
        powerup.width = 35;
        powerup.height = 35;
    }
    
    powerups.push(powerup);
    return powerup;
}

// Generate floating power-ups (jetpack, propeller)
function generateFloatingPowerup(currentY, currentScore) {
    // Only generate if score is high enough and random chance
    if (currentScore < 100 || Math.random() > 0.05) return; // 5% chance
    
    const type = Math.random() < 0.6 ? POWERUP_TYPES.JETPACK : POWERUP_TYPES.PROPELLER;
    const x = Math.random() * (canvas.width - 35);
    
    createPowerup(x, currentY, type, null);
}

// Create an enemy
function createEnemy(x, y, type, attachedPlatform = null) {
    const enemy = {
        x: x,
        y: y,
        width: type === ENEMY_TYPES.MONSTER ? 40 : 45,
        height: type === ENEMY_TYPES.MONSTER ? 40 : 35,
        type: type,
        destroyed: false,
        attachedPlatform: attachedPlatform,
        // UFO specific properties
        floatOffset: 0,
        floatDirection: 1,
        moveDirection: Math.random() > 0.5 ? 1 : -1,
        moveSpeed: 1
    };
    
    enemies.push(enemy);
    return enemy;
}

// Check if there are springs near a position
function hasSpringNearby(x, y, checkRadius = 150) {
    return powerups.some(powerup => {
        if (powerup.type !== POWERUP_TYPES.SPRING || powerup.collected) return false;
        
        const distance = Math.sqrt(
            Math.pow(powerup.x - x, 2) + 
            Math.pow(powerup.y - y, 2)
        );
        
        return distance < checkRadius;
    });
}

// Check if a platform has a spring on it
function platformHasSpring(platform) {
    return powerups.some(powerup => {
        if (powerup.type !== POWERUP_TYPES.SPRING || powerup.collected) return false;
        return powerup.attachedPlatform === platform;
    });
}

// Generate enemies based on score with smart placement
function generateEnemy(currentY, currentScore, recentPlatforms) {
    // Only generate enemies at score 150+
    if (currentScore < 150) return;
    
    // Random chance to spawn enemy (8% chance)
    if (Math.random() > 0.08) return;
    
    // More UFOs at higher scores
    const ufoChance = Math.min(0.6, currentScore / 5000); // Max 60% UFO chance
    const type = Math.random() < ufoChance ? ENEMY_TYPES.UFO : ENEMY_TYPES.MONSTER;
    
    if (type === ENEMY_TYPES.MONSTER && recentPlatforms.length > 0) {
        // Find safe platforms (no springs and not too close to springs)
        const safePlatforms = recentPlatforms.filter(platform => {
            // Only consider normal or moving platforms
            if (platform.type !== PLATFORM_TYPES.NORMAL && platform.type !== PLATFORM_TYPES.MOVING) {
                return false;
            }
            
            // Check if this platform has a spring
            if (platformHasSpring(platform)) {
                return false;
            }
            
            // Check if there are springs nearby (within trajectory range)
            const enemyX = platform.x + platform.width / 2;
            const enemyY = platform.y - 45;
            
            if (hasSpringNearby(enemyX, enemyY, 150)) {
                return false;
            }
            
            return true;
        });
        
        // Only spawn if we found safe platforms
        if (safePlatforms.length > 0) {
            const platform = safePlatforms[Math.floor(Math.random() * safePlatforms.length)];
            createEnemy(
                platform.x + platform.width / 2 - 20,
                platform.y - 45,
                ENEMY_TYPES.MONSTER,
                platform
            );
        }
    } else if (type === ENEMY_TYPES.UFO) {
        // Place UFO floating in the air, but check for springs below
        const maxAttempts = 5;
        let placed = false;
        
        for (let i = 0; i < maxAttempts && !placed; i++) {
            const x = Math.random() * (canvas.width - 45);
            
            // Check if there are springs nearby
            if (!hasSpringNearby(x, currentY, 120)) {
                createEnemy(x, currentY, ENEMY_TYPES.UFO, null);
                placed = true;
            }
        }
    }
}

// Create a projectile
function createProjectile() {
    const projectile = {
        x: player.x + player.width / 2 - 2,
        y: player.y,
        width: 4,
        height: 12,
        velocityY: -15, // Fast upward movement
        active: true
    };
    
    projectiles.push(projectile);
    playShootSound();
}

// Initialize background elements
function initBackgroundElements() {
    clouds = [];
    stars = [];
    shootingStars = [];
    
    // Create initial clouds
    for (let i = 0; i < 8; i++) {
        clouds.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - 200,
            width: 60 + Math.random() * 80,
            height: 30 + Math.random() * 20,
            speed: 0.2 + Math.random() * 0.3,
            opacity: 0.4 + Math.random() * 0.3
        });
    }
    
    // Create initial stars
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: 1 + Math.random() * 2,
            twinkleSpeed: 0.01 + Math.random() * 0.02,
            opacity: Math.random(),
            twinkleDirection: Math.random() > 0.5 ? 1 : -1
        });
    }
}

// Get current background theme based on score
function getBackgroundTheme() {
    if (score < 300) return 'notebook';
    if (score < 800) return 'sky';
    if (score < 1400) return 'sunset';
    if (score < 2000) return 'night';
    return 'space';
}

// Update background elements
function updateBackgroundElements() {
    const theme = getBackgroundTheme();
    
    // Update clouds (for sky and sunset themes)
    if (theme === 'sky' || theme === 'sunset') {
        clouds.forEach(cloud => {
            cloud.y += cloud.speed;
            
            // Wrap around
            if (cloud.y > canvas.height + 50) {
                cloud.y = -50;
                cloud.x = Math.random() * canvas.width;
            }
        });
    }
    
    // Update stars (for night and space themes)
    if (theme === 'night' || theme === 'space') {
        stars.forEach(star => {
            star.opacity += star.twinkleSpeed * star.twinkleDirection;
            if (star.opacity <= 0.2 || star.opacity >= 1) {
                star.twinkleDirection *= -1;
            }
        });
        
        // Occasionally create shooting stars in space theme
        if (theme === 'space' && Math.random() < 0.005) {
            shootingStars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height * 0.5,
                length: 30 + Math.random() * 40,
                speed: 3 + Math.random() * 2,
                angle: Math.PI / 6, // 30 degrees
                opacity: 1,
                life: 0
            });
        }
        
        // Update shooting stars
        shootingStars = shootingStars.filter(star => {
            star.x += Math.cos(star.angle) * star.speed;
            star.y += Math.sin(star.angle) * star.speed;
            star.life += 1;
            star.opacity = Math.max(0, 1 - star.life / 60);
            return star.life < 60;
        });
    }
}

// Initialize game
function init() {
    document.getElementById('highScore').textContent = highScore;
    document.getElementById('finalHighScore').textContent = highScore;
    
    // Initialize audio
    initAudio();
    
    // Event listeners
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        
        // Shoot on spacebar or W key
        if ((e.key === ' ' || e.key === 'w' || e.key === 'W') && gameState === 'playing') {
            e.preventDefault(); // Prevent page scroll on spacebar
            createProjectile();
        }
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });
    
    // Shoot on mouse click
    canvas.addEventListener('click', () => {
        if (gameState === 'playing') {
            createProjectile();
        }
    });
    
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    document.getElementById('muteBtn').addEventListener('click', toggleMute);
    
    // Show start screen
    document.getElementById('startScreen').classList.remove('hidden');
    document.getElementById('gameOver').classList.add('hidden');
}

function startGame() {
    gameState = 'playing';
    score = 0;
    cameraY = 0;
    
    // Reset difficulty display
    updateDifficultyDisplay(0);
    
    // Reset power-ups
    powerups = [];
    activePowerup = {
        type: null,
        timer: 0,
        active: false
    };
    
    // Reset enemies and projectiles
    enemies = [];
    projectiles = [];
    
    // Initialize background elements
    initBackgroundElements();
    
    // Reset player
    player.x = canvas.width / 2 - 25;
    player.y = canvas.height - 150;
    player.velocityX = 0;
    player.velocityY = 0;
    player.direction = 1;
    player.isOnGround = false;
    
    // Start background music
    startBackgroundMusic();
    
    // Generate initial platforms
    platforms = [];
    
    // Starting platform (always normal for safety)
    platforms.push(createPlatform(
        canvas.width / 2 - platformWidth / 2,
        canvas.height - 50,
        0, // Score is 0 at start
        true // Force normal type
    ));
    
    // Generate more platforms with random types (all normal at start since score = 0)
    let currentY = canvas.height - 50;
    while (currentY > -2000) {
        currentY -= platformGap + Math.random() * 50;
        
        // Get recent platforms to ensure new one is reachable
        const recentPlatforms = platforms.slice(-3); // Look at last 3 platforms
        const platformX = getReachablePlatformX(recentPlatforms);
        
        platforms.push(createPlatform(
            platformX,
            currentY,
            0, // Score is 0 at start
            false // Allow random types (but will be all normal since score = 0)
        ));
    }
    
    // Hide start screen
    document.getElementById('startScreen').classList.add('hidden');
    
    // Start game loop
    gameLoop();
}

function restartGame() {
    document.getElementById('gameOver').classList.add('hidden');
    startGame();
}

function gameLoop() {
    if (gameState !== 'playing') return;
    
    update();
    render();
    
    requestAnimationFrame(gameLoop);
}

function update() {
    // Update background elements
    updateBackgroundElements();
    
    // Handle input with acceleration
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        // Accelerate left
        player.velocityX -= player.acceleration;
        // Cap at max speed
        if (player.velocityX < -player.maxSpeed) {
            player.velocityX = -player.maxSpeed;
        }
        player.direction = -1; // Face left
    } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        // Accelerate right
        player.velocityX += player.acceleration;
        // Cap at max speed
        if (player.velocityX > player.maxSpeed) {
            player.velocityX = player.maxSpeed;
        }
        player.direction = 1; // Face right
    } else {
        // Apply friction when no input
        // Use different friction based on whether player is on ground or in air
        const currentFriction = player.isOnGround ? player.friction : player.airFriction;
        player.velocityX *= currentFriction;
        
        // Stop completely if velocity is very small
        if (Math.abs(player.velocityX) < 0.1) {
            player.velocityX = 0;
        }
    }
    
    // Update player position
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Reset ground state (will be set to true if landing on platform)
    player.isOnGround = false;
    
    // Apply gravity (unless jetpack is active)
    if (activePowerup.type === POWERUP_TYPES.JETPACK && activePowerup.active) {
        // Jetpack overrides gravity with strong upward force
        player.velocityY = -15;
    } else if (activePowerup.type === POWERUP_TYPES.PROPELLER && activePowerup.active) {
        // Propeller provides gentle upward force
        player.velocityY = -5;
    } else {
    player.velocityY += player.gravity;
    }
    
    // Update active power-up timer
    if (activePowerup.active) {
        activePowerup.timer--;
        
        // Play jetpack sound periodically
        if (activePowerup.type === POWERUP_TYPES.JETPACK && activePowerup.timer % 10 === 0) {
            playJetpackSound();
        }
        
        if (activePowerup.timer <= 0) {
            activePowerup.active = false;
            activePowerup.type = null;
        }
    }
    
    // Wrap around screen horizontally
    if (player.x + player.width < 0) {
        player.x = canvas.width;
    } else if (player.x > canvas.width) {
        player.x = -player.width;
    }
    
    // Update platforms
        platforms.forEach(platform => {
        // Update moving platforms
        if (platform.type === PLATFORM_TYPES.MOVING && !platform.broken) {
            platform.x += platform.moveSpeed * platform.moveDirection;
            
            // Reverse direction if reached the limits
            if (platform.x < platform.startX - platform.moveRange || 
                platform.x > platform.startX + platform.moveRange) {
                platform.moveDirection *= -1;
            }
            
            // Keep moving platforms on screen
            if (platform.x < 0) {
                platform.x = 0;
                platform.moveDirection = 1;
            } else if (platform.x + platform.width > canvas.width) {
                platform.x = canvas.width - platform.width;
                platform.moveDirection = -1;
            }
        }
        
        // Update disappearing platforms
        if (platform.type === PLATFORM_TYPES.DISAPPEARING && platform.touched) {
            platform.disappearTimer++;
            // Disappear after 30 frames (about 0.5 seconds)
            if (platform.disappearTimer > 30) {
                platform.disappeared = true;
            }
        }
    });
    
    // Check platform collisions (only when falling and not using jetpack/propeller)
    if (player.velocityY > 0 && !activePowerup.active) {
        platforms.forEach(platform => {
            // Skip broken or disappeared platforms
            if (platform.broken || platform.disappeared) {
                return;
            }
            
            if (
                player.x + player.width > platform.x &&
                player.x < platform.x + platform.width &&
                player.y + player.height > platform.y &&
                player.y + player.height < platform.y + platform.height + player.velocityY &&
                player.velocityY > 0
            ) {
                // Make the player jump
                player.velocityY = player.jumpPower;
                player.isOnGround = true; // Player is on a platform
                
                // Play jump sound
                playJumpSound();
                
                // Handle special platform types
                if (platform.type === PLATFORM_TYPES.BREAKABLE) {
                    platform.broken = true;
                    playBreakSound();
                } else if (platform.type === PLATFORM_TYPES.DISAPPEARING) {
                    platform.touched = true;
                }
            }
        });
    }
    
    // Update enemies
    enemies.forEach(enemy => {
        if (enemy.destroyed) return;
        
        // Update monster position if attached to moving platform
        if (enemy.type === ENEMY_TYPES.MONSTER && enemy.attachedPlatform) {
            if (enemy.attachedPlatform.type === PLATFORM_TYPES.MOVING) {
                enemy.x = enemy.attachedPlatform.x + enemy.attachedPlatform.width / 2 - 20;
            }
        }
        
        // Update UFO floating and movement
        if (enemy.type === ENEMY_TYPES.UFO) {
            // Floating animation
            enemy.floatOffset += 0.05 * enemy.floatDirection;
            if (Math.abs(enemy.floatOffset) > 10) {
                enemy.floatDirection *= -1;
            }
            
            // Horizontal movement
            enemy.x += enemy.moveSpeed * enemy.moveDirection;
            
            // Bounce off edges
            if (enemy.x < 0 || enemy.x + enemy.width > canvas.width) {
                enemy.moveDirection *= -1;
            }
        }
    });
    
    // Update projectiles
    projectiles.forEach(projectile => {
        if (!projectile.active) return;
        
        projectile.y += projectile.velocityY;
        
        // Deactivate if off screen
        if (projectile.y < -50) {
            projectile.active = false;
        }
    });
    
    // Check projectile-enemy collisions
    projectiles.forEach(projectile => {
        if (!projectile.active) return;
        
        enemies.forEach(enemy => {
            if (enemy.destroyed) return;
            
            if (
                projectile.x + projectile.width > enemy.x &&
                projectile.x < enemy.x + enemy.width &&
                projectile.y + projectile.height > enemy.y &&
                projectile.y < enemy.y + enemy.height
            ) {
                // Hit!
                enemy.destroyed = true;
                projectile.active = false;
                playEnemyHitSound();
                
                // Award points
                score += 50;
                document.getElementById('score').textContent = score;
            }
        });
    });
    
    // Check player-enemy collisions
    enemies.forEach(enemy => {
        if (enemy.destroyed) return;
        
        const collisionBuffer = 5;
        if (
            player.x + collisionBuffer < enemy.x + enemy.width &&
            player.x + player.width - collisionBuffer > enemy.x &&
            player.y + collisionBuffer < enemy.y + enemy.height &&
            player.y + player.height - collisionBuffer > enemy.y
        ) {
            // Check if player is jumping on top of the enemy
            const playerBottom = player.y + player.height;
            const enemyTop = enemy.y;
            const enemyMiddle = enemy.y + enemy.height / 2;
            
            // If player is falling and hitting from above (landing on top)
            if (player.velocityY > 0 && playerBottom < enemyMiddle) {
                // Jump on enemy to kill it!
                enemy.destroyed = true;
                player.velocityY = player.jumpPower * 1.2; // Bounce up slightly higher
                playEnemyHitSound();
                
                // Award points for jumping on enemy
                score += 50;
                document.getElementById('score').textContent = score;
            } else {
                // Hit enemy from side or bottom - game over
                gameOver();
            }
        }
    });
    
    // Check power-up collisions
    powerups.forEach(powerup => {
        if (powerup.collected) return;
        
        // Update spring position if attached to moving platform
        if (powerup.type === POWERUP_TYPES.SPRING && powerup.attachedPlatform) {
            if (powerup.attachedPlatform.type === PLATFORM_TYPES.MOVING) {
                powerup.x = powerup.attachedPlatform.x + platformWidth / 2 - 10;
            }
        }
        
        // Check collision with player
        const collisionBuffer = 5; // Make collision a bit more forgiving
        if (
            player.x + collisionBuffer < powerup.x + powerup.width &&
            player.x + player.width - collisionBuffer > powerup.x &&
            player.y + collisionBuffer < powerup.y + powerup.height &&
            player.y + player.height - collisionBuffer > powerup.y
        ) {
            powerup.collected = true;
            
            // Apply power-up effect
            if (powerup.type === POWERUP_TYPES.SPRING) {
                // Spring gives extra high jump
                player.velocityY = player.jumpPower * 1.8;
                playSpringSound();
            } else if (powerup.type === POWERUP_TYPES.JETPACK) {
                // Activate jetpack for 3 seconds (180 frames at 60fps)
                activePowerup.type = POWERUP_TYPES.JETPACK;
                activePowerup.active = true;
                activePowerup.timer = 180;
                playPowerupSound();
            } else if (powerup.type === POWERUP_TYPES.PROPELLER) {
                // Activate propeller for 4 seconds (240 frames at 60fps)
                activePowerup.type = POWERUP_TYPES.PROPELLER;
                activePowerup.active = true;
                activePowerup.timer = 240;
                playPowerupSound();
            }
        }
    });
    
    // Move camera up when player is in upper half
    if (player.y < canvas.height / 2) {
        const diff = canvas.height / 2 - player.y;
        cameraY += diff;
        player.y = canvas.height / 2;
        
        // Move platforms down
        platforms.forEach(platform => {
            platform.y += diff;
        });
        
        // Move power-ups down
        powerups.forEach(powerup => {
            powerup.y += diff;
        });
        
        // Move enemies down
        enemies.forEach(enemy => {
            enemy.y += diff;
        });
        
        // Move projectiles down (they move up relative to world, but world moves down)
        projectiles.forEach(projectile => {
            projectile.y += diff;
        });
        
        // Update score
        score = Math.max(score, Math.floor(cameraY / 10));
        document.getElementById('score').textContent = score;
        
        // Update difficulty level display
        updateDifficultyDisplay(score);
        
        // Remove platforms that are off screen
        platforms = platforms.filter(platform => platform.y < canvas.height + 100);
        
        // Remove power-ups that are off screen
        powerups = powerups.filter(powerup => powerup.y < canvas.height + 100);
        
        // Remove enemies that are off screen
        enemies = enemies.filter(enemy => enemy.y < canvas.height + 100);
        
        // Remove inactive projectiles
        projectiles = projectiles.filter(projectile => projectile.active && projectile.y > -100);
        
        // Generate new platforms based on current difficulty
        while (platforms.length < 30) {
            const lastPlatform = platforms[platforms.length - 1];
            
            // Get recent platforms to ensure new one is reachable
            const recentPlatforms = platforms.slice(-3); // Look at last 3 platforms
            const platformX = getReachablePlatformX(recentPlatforms);
            const platformY = lastPlatform.y - platformGap - Math.random() * 50;
            
            platforms.push(createPlatform(
                platformX,
                platformY,
                score, // Use current score to determine platform types
                false // Allow random types based on score
            ));
            
            // Occasionally generate floating power-ups (jetpack/propeller)
            generateFloatingPowerup(platformY - 40, score);
            
            // Occasionally generate enemies
            const recentPlatformsForEnemy = platforms.slice(-5);
            generateEnemy(platformY - 60, score, recentPlatformsForEnemy);
        }
    }
    
    // Check game over (fell off bottom)
    if (player.y > canvas.height) {
        gameOver();
    }
}

// Draw background based on current theme
function drawBackground(theme) {
    if (theme === 'notebook') {
        // Notebook paper style
        ctx.fillStyle = '#FFFEF0'; // Cream/off-white paper color
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Horizontal lines (notebook paper lines)
        ctx.strokeStyle = '#B8D4E8';
        ctx.lineWidth = 1;
        for (let y = 0; y < canvas.height; y += 25) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // Red vertical margin line
        ctx.strokeStyle = '#FFB6C1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(40, 0);
        ctx.lineTo(40, canvas.height);
        ctx.stroke();
        
    } else if (theme === 'sky') {
        // Sky with clouds
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB'); // Sky blue
        gradient.addColorStop(1, '#E0F6FF'); // Light blue
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw clouds
        clouds.forEach(cloud => {
            ctx.fillStyle = `rgba(255, 255, 255, ${cloud.opacity})`;
            ctx.beginPath();
            // Cloud made of circles
            ctx.arc(cloud.x, cloud.y, cloud.width * 0.3, 0, Math.PI * 2);
            ctx.arc(cloud.x + cloud.width * 0.3, cloud.y, cloud.width * 0.35, 0, Math.PI * 2);
            ctx.arc(cloud.x + cloud.width * 0.6, cloud.y, cloud.width * 0.3, 0, Math.PI * 2);
            ctx.fill();
        });
        
    } else if (theme === 'sunset') {
        // Sunset gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#FF6B35'); // Orange
        gradient.addColorStop(0.4, '#FF8C61'); // Light orange
        gradient.addColorStop(0.7, '#FFA07A'); // Salmon
        gradient.addColorStop(1, '#FFD1BA'); // Peach
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw clouds with sunset colors
        clouds.forEach(cloud => {
            ctx.fillStyle = `rgba(255, 100, 150, ${cloud.opacity * 0.6})`;
            ctx.beginPath();
            ctx.arc(cloud.x, cloud.y, cloud.width * 0.3, 0, Math.PI * 2);
            ctx.arc(cloud.x + cloud.width * 0.3, cloud.y, cloud.width * 0.35, 0, Math.PI * 2);
            ctx.arc(cloud.x + cloud.width * 0.6, cloud.y, cloud.width * 0.3, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Silhouette birds occasionally
        if (Math.random() > 0.98) {
            const birdX = Math.random() * canvas.width;
            const birdY = Math.random() * canvas.height * 0.3;
            ctx.strokeStyle = 'rgba(50, 30, 50, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(birdX - 5, birdY);
            ctx.quadraticCurveTo(birdX - 3, birdY - 3, birdX, birdY);
            ctx.quadraticCurveTo(birdX + 3, birdY - 3, birdX + 5, birdY);
            ctx.stroke();
        }
        
    } else if (theme === 'night') {
        // Night sky
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#0A0E27'); // Dark blue
        gradient.addColorStop(1, '#1B1464'); // Purple-ish
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw twinkling stars
        stars.forEach(star => {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw moon
        ctx.fillStyle = '#F4F1DE';
        ctx.beginPath();
        ctx.arc(canvas.width - 80, 60, 30, 0, Math.PI * 2);
        ctx.fill();
        
        // Moon craters
        ctx.fillStyle = 'rgba(200, 200, 180, 0.3)';
        ctx.beginPath();
        ctx.arc(canvas.width - 85, 55, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(canvas.width - 75, 65, 5, 0, Math.PI * 2);
        ctx.fill();
        
    } else if (theme === 'space') {
        // Deep space
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#000000'); // Black
        gradient.addColorStop(0.5, '#0D0221'); // Deep purple
        gradient.addColorStop(1, '#1A0B2E'); // Dark purple
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw stars (bigger and brighter in space)
        stars.forEach(star => {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size * 1.2, 0, Math.PI * 2);
            ctx.fill();
            
            // Star glow
            if (star.opacity > 0.7) {
                ctx.fillStyle = `rgba(200, 200, 255, ${star.opacity * 0.3})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        // Draw shooting stars
        shootingStars.forEach(star => {
            const gradient = ctx.createLinearGradient(
                star.x, star.y,
                star.x - Math.cos(star.angle) * star.length,
                star.y - Math.sin(star.angle) * star.length
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
            gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(
                star.x - Math.cos(star.angle) * star.length,
                star.y - Math.sin(star.angle) * star.length
            );
            ctx.stroke();
        });
        
        // Draw distant planets
        ctx.fillStyle = 'rgba(180, 100, 200, 0.4)';
        ctx.beginPath();
        ctx.arc(100, 100, 40, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(100, 150, 200, 0.3)';
        ctx.beginPath();
        ctx.arc(canvas.width - 120, canvas.height * 0.7, 25, 0, Math.PI * 2);
        ctx.fill();
    }
}

function render() {
    const theme = getBackgroundTheme();
    
    // Draw background based on theme
    drawBackground(theme);
    
    // Draw platforms
    platforms.forEach(platform => {
        // Skip rendering broken or disappeared platforms
        if (platform.broken || platform.disappeared) {
            return;
        }
        
        // Set color based on platform type
        switch(platform.type) {
            case PLATFORM_TYPES.NORMAL:
                ctx.fillStyle = '#8B4513'; // Brown
                break;
            case PLATFORM_TYPES.MOVING:
                ctx.fillStyle = '#4169E1'; // Royal Blue
                break;
            case PLATFORM_TYPES.BREAKABLE:
                ctx.fillStyle = '#CD853F'; // Peru/Tan (lighter brown)
                break;
            case PLATFORM_TYPES.DISAPPEARING:
                // Calculate opacity based on disappear timer
                const opacity = platform.touched ? 
                    Math.max(0.3, 1 - (platform.disappearTimer / 30)) : 1;
                ctx.fillStyle = `rgba(218, 112, 214, ${opacity})`; // Orchid/Purple
                break;
            default:
        ctx.fillStyle = '#8B4513';
        }
        
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Add visual indicators for different platform types
        if (platform.type === PLATFORM_TYPES.NORMAL) {
            // Add wood grain detail
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(platform.x, platform.y, platform.width, 5);
        } else if (platform.type === PLATFORM_TYPES.MOVING) {
            // Add arrows to show it moves
            ctx.fillStyle = '#1E90FF'; // Lighter blue
            ctx.fillRect(platform.x, platform.y, platform.width, 5);
            // Draw small arrow indicators
            ctx.fillStyle = 'white';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('◄►', platform.x + platform.width / 2, platform.y + 11);
        } else if (platform.type === PLATFORM_TYPES.BREAKABLE) {
            // Add crack lines to show it's breakable
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(platform.x + platform.width * 0.3, platform.y);
            ctx.lineTo(platform.x + platform.width * 0.3, platform.y + platform.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(platform.x + platform.width * 0.7, platform.y);
            ctx.lineTo(platform.x + platform.width * 0.7, platform.y + platform.height);
            ctx.stroke();
        } else if (platform.type === PLATFORM_TYPES.DISAPPEARING) {
            // Add dots to show it's disappearing
            ctx.fillStyle = platform.touched ? 
                `rgba(255, 255, 255, ${Math.max(0.3, 1 - (platform.disappearTimer / 30))})` : 
                'rgba(255, 255, 255, 0.8)';
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(
                    platform.x + (platform.width / 4) * (i + 0.5), 
                    platform.y + platform.height / 2, 
                    2, 
                    0, 
                    Math.PI * 2
                );
                ctx.fill();
            }
        }
    });
    
    // Draw power-ups
    powerups.forEach(powerup => {
        if (powerup.collected) return;
        
        if (powerup.type === POWERUP_TYPES.SPRING) {
            // Draw spring
            ctx.fillStyle = '#FF6B6B';
            ctx.strokeStyle = '#C92A2A';
            ctx.lineWidth = 2;
            
            // Spring coils
            const coilHeight = 3;
            const numCoils = 4;
            for (let i = 0; i < numCoils; i++) {
                ctx.fillRect(
                    powerup.x + 2,
                    powerup.y + i * coilHeight,
                    powerup.width - 4,
                    coilHeight - 1
                );
            }
            
            // Spring base
            ctx.fillStyle = '#C92A2A';
            ctx.fillRect(powerup.x, powerup.y + powerup.height - 3, powerup.width, 3);
            
        } else if (powerup.type === POWERUP_TYPES.JETPACK) {
            // Draw jetpack
            ctx.fillStyle = '#4ECDC4';
            ctx.strokeStyle = '#2A9D8F';
            ctx.lineWidth = 2;
            
            // Main body
            ctx.fillRect(powerup.x + 5, powerup.y + 5, powerup.width - 10, powerup.height - 10);
            ctx.strokeRect(powerup.x + 5, powerup.y + 5, powerup.width - 10, powerup.height - 10);
            
            // Straps
            ctx.strokeStyle = '#FFE66D';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(powerup.x + 10, powerup.y + 8);
            ctx.lineTo(powerup.x + 10, powerup.y + powerup.height - 8);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(powerup.x + powerup.width - 10, powerup.y + 8);
            ctx.lineTo(powerup.x + powerup.width - 10, powerup.y + powerup.height - 8);
            ctx.stroke();
            
            // Flames (when active on player)
            if (activePowerup.type === POWERUP_TYPES.JETPACK && activePowerup.active) {
                // This will be drawn on the player instead
            }
            
        } else if (powerup.type === POWERUP_TYPES.PROPELLER) {
            // Draw propeller hat
            ctx.fillStyle = '#F4A261';
            ctx.strokeStyle = '#E76F51';
            ctx.lineWidth = 2;
            
            // Hat base
            ctx.beginPath();
            ctx.arc(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Propeller blades (spinning effect based on frame count)
            const rotation = (Date.now() / 50) % (Math.PI * 2);
            ctx.save();
            ctx.translate(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2 - 10);
            ctx.rotate(rotation);
            
            ctx.fillStyle = '#E76F51';
            ctx.fillRect(-15, -2, 30, 4);
            ctx.fillRect(-2, -15, 4, 30);
            
            ctx.restore();
        }
    });
    
    // Draw enemies
    enemies.forEach(enemy => {
        if (enemy.destroyed) return;
        
        if (enemy.type === ENEMY_TYPES.MONSTER) {
            // Draw monster (cute but dangerous)
            const centerX = enemy.x + enemy.width / 2;
            const centerY = enemy.y + enemy.height / 2;
            
            // Body
            ctx.fillStyle = '#E53935';
            ctx.beginPath();
            ctx.arc(centerX, centerY, enemy.width / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Eyes (angry)
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(centerX - 8, centerY - 5, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX + 8, centerY - 5, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Pupils
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(centerX - 8, centerY - 3, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX + 8, centerY - 3, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Teeth
            ctx.fillStyle = 'white';
            for (let i = 0; i < 3; i++) {
                ctx.fillRect(centerX - 12 + i * 8, centerY + 8, 6, 8);
            }
            
        } else if (enemy.type === ENEMY_TYPES.UFO) {
            const centerX = enemy.x + enemy.width / 2;
            const centerY = enemy.y + enemy.height / 2 + enemy.floatOffset;
            
            // UFO body
            ctx.fillStyle = '#9C27B0';
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, enemy.width / 2, enemy.height / 2.5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // UFO dome
            ctx.fillStyle = '#BA68C8';
            ctx.beginPath();
            ctx.arc(centerX, centerY - 5, enemy.width / 3, Math.PI, 0, true);
            ctx.fill();
            
            // UFO lights
            ctx.fillStyle = '#00E676';
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(centerX - 12 + i * 12, centerY + 5, 3, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Beam indicator (subtle)
            if (Math.random() > 0.9) {
                ctx.strokeStyle = 'rgba(156, 39, 176, 0.3)';
                ctx.lineWidth = 15;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY + 10);
                ctx.lineTo(centerX, centerY + 40);
                ctx.stroke();
            }
        }
    });
    
    // Draw projectiles
    projectiles.forEach(projectile => {
        if (!projectile.active) return;
        
        // Draw bullet
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
        
        // Add glow effect
        ctx.fillStyle = '#FFEB3B';
        ctx.fillRect(projectile.x + 1, projectile.y, 2, projectile.height);
    });
    
    // Draw active power-up indicator on player
    if (activePowerup.active) {
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;
        
        if (activePowerup.type === POWERUP_TYPES.JETPACK) {
            // Draw jetpack on player's back with flames
            ctx.fillStyle = '#4ECDC4';
            ctx.fillRect(playerCenterX - 8, playerCenterY + 5, 16, 20);
            
            // Flames
            ctx.fillStyle = '#FF6B6B';
            ctx.beginPath();
            ctx.moveTo(playerCenterX - 5, playerCenterY + 25);
            ctx.lineTo(playerCenterX - 3, playerCenterY + 30 + Math.random() * 5);
            ctx.lineTo(playerCenterX, playerCenterY + 25);
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(playerCenterX + 5, playerCenterY + 25);
            ctx.lineTo(playerCenterX + 3, playerCenterY + 30 + Math.random() * 5);
            ctx.lineTo(playerCenterX, playerCenterY + 25);
            ctx.fill();
            
        } else if (activePowerup.type === POWERUP_TYPES.PROPELLER) {
            // Draw propeller hat on player's head
            const rotation = (Date.now() / 30) % (Math.PI * 2);
            ctx.save();
            ctx.translate(playerCenterX, playerCenterY - 30);
            ctx.rotate(rotation);
            
            ctx.fillStyle = '#E76F51';
            ctx.fillRect(-12, -2, 24, 4);
            ctx.fillRect(-2, -12, 4, 24);
            
            ctx.restore();
            
            // Hat base
            ctx.fillStyle = '#F4A261';
            ctx.beginPath();
            ctx.arc(playerCenterX, playerCenterY - 30, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Draw player (doodle character)
    drawPlayer();
}

function drawPlayer() {
    const x = player.x + player.width / 2;
    const y = player.y + player.height / 2;
    
    // Body
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(x, y, player.width / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye offset based on direction and movement
    const eyeOffsetX = player.direction * 2; // Eyes look in movement direction
    
    // Eyes
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x - 10, y - 5, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 10, y - 5, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupils (look in direction of movement)
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(x - 10 + eyeOffsetX, y - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 10 + eyeOffsetX, y - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Smile (or concerned face when falling fast)
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (player.velocityY > 8) {
        // Worried expression when falling fast
        ctx.arc(x, y + 5, 12, Math.PI, 0);
    } else {
        // Normal smile
    ctx.arc(x, y + 5, 12, 0, Math.PI);
    }
    ctx.stroke();
    
    // Legs (simple lines, animated based on velocity)
    ctx.strokeStyle = player.color;
    ctx.lineWidth = 4;
    
    // Legs swing slightly based on horizontal velocity for animation
    const legSwing = Math.sin(Date.now() / 100) * Math.abs(player.velocityX) * 0.5;
    
    ctx.beginPath();
    ctx.moveTo(x - 8, y + player.height / 2 - 5);
    ctx.lineTo(x - 15 + legSwing, y + player.height / 2 + 5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 8, y + player.height / 2 - 5);
    ctx.lineTo(x + 15 - legSwing, y + player.height / 2 + 5);
    ctx.stroke();
}

function gameOver() {
    gameState = 'gameover';
    
    // Stop background music and play game over sound
    stopBackgroundMusic();
    playGameOverSound();
    
    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('doodleJumpHighScore', highScore);
    }
    
    // Show game over screen
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalHighScore').textContent = highScore;
    document.getElementById('highScore').textContent = highScore;
    document.getElementById('gameOver').classList.remove('hidden');
}

// Initialize the game
init();

