import * as THREE from 'three';
import { GameState } from '../core/GameState.js';

/**
 * GTA V style input controls with acceleration curves and smooth mouse look
 */
export class Controls {
    constructor(domElement) {
        this.domElement = domElement;
        this.keys = {};
        this.keysPrev = {};
        
        // Mouse state with GTA V style smoothing
        this.mouse = {
            rawX: 0,
            rawY: 0,
            smoothX: 0,
            smoothY: 0,
            velocityX: 0,
            velocityY: 0,
            sensitivity: 0.0018,
            aimSensitivity: 0.001,    // Lower sensitivity when aiming
            smoothing: 0.15,           // Base smoothing
            acceleration: 1.2,         // Mouse acceleration curve
            deadzone: 0.5              // Ignore tiny movements
        };
        
        this.isPointerLocked = false;
        
        // Movement input with analog-style interpolation
        this.moveInput = new THREE.Vector2();
        this.rawMoveInput = new THREE.Vector2();
        this.moveInputVelocity = new THREE.Vector2();
        
        // Input ramp-up (simulates analog stick)
        this.inputRampSpeed = 8;
        this.inputDecaySpeed = 12;
        
        // Callbacks
        this.onInteract = null;
        this.onTalk = null;
        this.onJump = null;
        this.onHorn = null;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mouseup', (e) => this.onMouseUp(e));
        
        this.domElement.addEventListener('click', () => this.requestPointerLock());
        document.addEventListener('pointerlockchange', () => this.onPointerLockChange());
        this.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    onKeyDown(e) {
        const key = e.key.toLowerCase();
        if (!this.keys[key]) {
            this.keys[key] = true;
            
            // Single-press actions (only trigger once)
            if (key === 'e' && this.onInteract) this.onInteract();
            if (key === 'f' && this.onTalk) this.onTalk();
            if (key === ' ' && this.onJump) this.onJump();
            if (key === 'h' && this.onHorn) this.onHorn();
            if (key === 'escape') document.exitPointerLock();
        }
    }
    
    onKeyUp(e) {
        this.keys[e.key.toLowerCase()] = false;
    }
    
    onMouseDown(e) {
        this.keys['mouse' + e.button] = true;
    }
    
    onMouseUp(e) {
        this.keys['mouse' + e.button] = false;
    }
    
    onMouseMove(e) {
        if (!this.isPointerLocked) return;
        
        let dx = -e.movementX; // Invert X so mouse right turns right in game space
        let dy = e.movementY;
        
        // Apply deadzone
        if (Math.abs(dx) < this.mouse.deadzone) dx = 0;
        if (Math.abs(dy) < this.mouse.deadzone) dy = 0;
        
        // Apply mouse acceleration curve (like GTA V)
        const magnitude = Math.sqrt(dx * dx + dy * dy);
        if (magnitude > 0) {
            const accelCurve = 1 + Math.pow(magnitude * 0.05, this.mouse.acceleration);
            dx *= accelCurve;
            dy *= accelCurve;
        }
        
        // Get sensitivity based on state
        const sens = this.isAiming() ? this.mouse.aimSensitivity : this.mouse.sensitivity;
        
        // Add to velocity (for momentum feel)
        this.mouse.velocityX += dx * sens;
        this.mouse.velocityY += dy * sens;
    }
    
    requestPointerLock() {
        if (!this.isPointerLocked && !GameState.isPaused) {
            this.domElement.requestPointerLock();
        }
    }
    
    onPointerLockChange() {
        this.isPointerLocked = document.pointerLockElement === this.domElement;
    }
    
    /**
     * Update controls with delta time - GTA V style smoothing
     */
    update(deltaTime) {
        // --- Mouse smoothing with momentum ---
        const smoothFactor = 1 - Math.exp(-this.mouse.smoothing * deltaTime * 60);
        
        // Apply velocity to raw position
        this.mouse.rawX += this.mouse.velocityX;
        this.mouse.rawY += this.mouse.velocityY;
        
        // Clamp vertical look
        this.mouse.rawY = THREE.MathUtils.clamp(this.mouse.rawY, -Math.PI / 2.2, Math.PI / 2.2);
        
        // Smooth interpolation
        this.mouse.smoothX = THREE.MathUtils.lerp(this.mouse.smoothX, this.mouse.rawX, smoothFactor);
        this.mouse.smoothY = THREE.MathUtils.lerp(this.mouse.smoothY, this.mouse.rawY, smoothFactor);
        
        // Decay velocity (creates smooth stop)
        const velDecay = Math.exp(-deltaTime * 14);
        this.mouse.velocityX *= velDecay;
        this.mouse.velocityY *= velDecay;
        
        // --- Movement input with analog-style ramp ---
        this.rawMoveInput.set(0, 0);
        if (this.keys['w'] || this.keys['arrowup']) this.rawMoveInput.y = -1;
        if (this.keys['s'] || this.keys['arrowdown']) this.rawMoveInput.y = 1;
        if (this.keys['a'] || this.keys['arrowleft']) this.rawMoveInput.x = -1;
        if (this.keys['d'] || this.keys['arrowright']) this.rawMoveInput.x = 1;
        
        // Normalize diagonal
        if (this.rawMoveInput.length() > 1) {
            this.rawMoveInput.normalize();
        }
        
        // Ramp up/down input (simulates analog stick response)
        const rampSpeed = this.rawMoveInput.length() > 0 ? this.inputRampSpeed : this.inputDecaySpeed;
        this.moveInput.x = THREE.MathUtils.lerp(this.moveInput.x, this.rawMoveInput.x, rampSpeed * deltaTime);
        this.moveInput.y = THREE.MathUtils.lerp(this.moveInput.y, this.rawMoveInput.y, rampSpeed * deltaTime);
        
        // Kill small values
        if (Math.abs(this.moveInput.x) < 0.01) this.moveInput.x = 0;
        if (Math.abs(this.moveInput.y) < 0.01) this.moveInput.y = 0;
        
        // Store previous keys for edge detection
        this.keysPrev = { ...this.keys };
    }
    
    // --- Getters ---
    
    isRunning() {
        return this.keys['shift'];
    }
    
    isWalking() {
        return this.keys['control'] || this.keys['alt'];
    }
    
    isAiming() {
        return this.keys['mouse2']; // Right mouse button
    }
    
    isMoving() {
        return this.moveInput.length() > 0.1;
    }
    
    getYaw() {
        return this.mouse.smoothX;
    }
    
    getPitch() {
        return this.mouse.smoothY;
    }
    
    getRawYaw() {
        return this.mouse.rawX;
    }
    
    getRawPitch() {
        return this.mouse.rawY;
    }
    
    getMoveDirection() {
        return this.moveInput.clone();
    }
    
    getMoveIntensity() {
        return Math.min(1, this.moveInput.length());
    }
    
    // Check if key was just pressed this frame
    justPressed(key) {
        return this.keys[key] && !this.keysPrev[key];
    }
    
    // Check if key was just released this frame
    justReleased(key) {
        return !this.keys[key] && this.keysPrev[key];
    }
    
    dispose() {
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
        document.removeEventListener('mousemove', this.onMouseMove);
    }
}
