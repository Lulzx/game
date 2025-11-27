import * as THREE from 'three';
import { GameState } from '../core/GameState.js';

/**
 * GTA V style player with momentum-based movement, procedural animation
 */
export class Player {
    constructor() {
        this.group = new THREE.Group();
        
        // Physics state
        this.velocity = new THREE.Vector3();
        this.acceleration = new THREE.Vector3();
        this.rotation = 0;
        this.targetRotation = 0;
        this.angularVelocity = 0;
        
        // Movement state
        this.moveState = 'idle'; // 'idle', 'walking', 'jogging', 'sprinting', 'stopping'
        this.strafing = false;
        this.movementBlend = 0; // 0 = idle, 1 = full speed
        
        // Grounded state
        this.isGrounded = true;
        this.groundY = 0;
        this.verticalVelocity = 0;
        
        // Body parts for animation
        this.parts = {};
        
        // Procedural animation state
        this.anim = {
            cycle: 0,           // Main walk/run cycle
            cycleSpeed: 0,      // Current animation speed
            strideLength: 0,    // Current stride
            
            // Limb phases
            leftLegPhase: 0,
            rightLegPhase: Math.PI,
            leftArmPhase: Math.PI,
            rightArmPhase: 0,
            
            // Body motion
            bodyBob: 0,
            bodyLean: 0,
            bodyTwist: 0,
            hipSway: 0,
            turnLean: 0,
            
            // Blend weights
            walkWeight: 0,
            runWeight: 0,
            idleWeight: 1,
            
            // Idle animation
            breatheCycle: 0,
            lookAround: 0
        };
        
        // Foot IK targets (for future ground adaptation)
        this.footIK = {
            leftTarget: new THREE.Vector3(),
            rightTarget: new THREE.Vector3(),
            leftPlanted: false,
            rightPlanted: false
        };
        
        this.createMesh();
    }
    
    createMesh() {
        // Body (torso)
        const bodyGeo = new THREE.CylinderGeometry(0.35, 0.45, 1.0, 12);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x5DADE2, roughness: 0.6 });
        this.parts.body = new THREE.Mesh(bodyGeo, bodyMat);
        this.parts.body.position.y = 0.9;
        this.parts.body.castShadow = true;
        this.group.add(this.parts.body);
        
        // Head
        const headGeo = new THREE.SphereGeometry(0.4, 20, 20);
        const headMat = new THREE.MeshStandardMaterial({ color: 0xFFDFC4, roughness: 0.8 });
        this.parts.head = new THREE.Mesh(headGeo, headMat);
        this.parts.head.position.y = 1.75;
        this.parts.head.castShadow = true;
        this.group.add(this.parts.head);
        
        // Eyes
        const eyeGeo = new THREE.SphereGeometry(0.08, 10, 10);
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.14, 1.8, 0.32);
        this.group.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.14, 1.8, 0.32);
        this.group.add(rightEye);
        
        // Eye shine
        const shineGeo = new THREE.SphereGeometry(0.03, 8, 8);
        const shineMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const leftShine = new THREE.Mesh(shineGeo, shineMat);
        leftShine.position.set(-0.12, 1.83, 0.38);
        this.group.add(leftShine);
        
        const rightShine = new THREE.Mesh(shineGeo, shineMat);
        rightShine.position.set(0.16, 1.83, 0.38);
        this.group.add(rightShine);
        
        // Rosy cheeks
        const cheekGeo = new THREE.CircleGeometry(0.08, 16);
        const cheekMat = new THREE.MeshStandardMaterial({ 
            color: 0xFFB6C1, 
            transparent: true, 
            opacity: 0.6 
        });
        const leftCheek = new THREE.Mesh(cheekGeo, cheekMat);
        leftCheek.position.set(-0.28, 1.68, 0.34);
        leftCheek.rotation.y = 0.4;
        this.group.add(leftCheek);
        
        const rightCheek = new THREE.Mesh(cheekGeo, cheekMat);
        rightCheek.position.set(0.28, 1.68, 0.34);
        rightCheek.rotation.y = -0.4;
        this.group.add(rightCheek);
        
        // Hair
        const hairGeo = new THREE.SphereGeometry(0.45, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const hairMat = new THREE.MeshStandardMaterial({ color: 0x4A3728, roughness: 0.9 });
        const hair = new THREE.Mesh(hairGeo, hairMat);
        hair.position.y = 1.85;
        this.group.add(hair);
        
        // Arms (as separate objects for animation)
        const armGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.55, 10);
        const armMat = new THREE.MeshStandardMaterial({ color: 0x5DADE2, roughness: 0.6 });
        
        // Left arm pivot
        const leftArmPivot = new THREE.Group();
        leftArmPivot.position.set(-0.5, 1.25, 0);
        this.parts.leftArm = new THREE.Mesh(armGeo, armMat);
        this.parts.leftArm.position.y = -0.25;
        this.parts.leftArm.castShadow = true;
        leftArmPivot.add(this.parts.leftArm);
        this.group.add(leftArmPivot);
        this.parts.leftArmPivot = leftArmPivot;
        
        // Right arm pivot
        const rightArmPivot = new THREE.Group();
        rightArmPivot.position.set(0.5, 1.25, 0);
        this.parts.rightArm = new THREE.Mesh(armGeo, armMat);
        this.parts.rightArm.position.y = -0.25;
        this.parts.rightArm.castShadow = true;
        rightArmPivot.add(this.parts.rightArm);
        this.group.add(rightArmPivot);
        this.parts.rightArmPivot = rightArmPivot;
        
        // Legs (as separate objects for animation)
        const legGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.55, 10);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7 });
        
        // Left leg pivot
        const leftLegPivot = new THREE.Group();
        leftLegPivot.position.set(-0.18, 0.4, 0);
        this.parts.leftLeg = new THREE.Mesh(legGeo, legMat);
        this.parts.leftLeg.position.y = -0.2;
        this.parts.leftLeg.castShadow = true;
        leftLegPivot.add(this.parts.leftLeg);
        this.group.add(leftLegPivot);
        this.parts.leftLegPivot = leftLegPivot;
        
        // Right leg pivot
        const rightLegPivot = new THREE.Group();
        rightLegPivot.position.set(0.18, 0.4, 0);
        this.parts.rightLeg = new THREE.Mesh(legGeo, legMat);
        this.parts.rightLeg.position.y = -0.2;
        this.parts.rightLeg.castShadow = true;
        rightLegPivot.add(this.parts.rightLeg);
        this.group.add(rightLegPivot);
        this.parts.rightLegPivot = rightLegPivot;
        
        // Feet
        const footGeo = new THREE.BoxGeometry(0.16, 0.08, 0.25);
        const footMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8 });
        
        const leftFoot = new THREE.Mesh(footGeo, footMat);
        leftFoot.position.set(0, -0.5, 0.05);
        this.parts.leftLegPivot.add(leftFoot);
        
        const rightFoot = new THREE.Mesh(footGeo, footMat);
        rightFoot.position.set(0, -0.5, 0.05);
        this.parts.rightLegPivot.add(rightFoot);
    }
    
    /**
     * GTA V style physics update
     */
    update(controls, deltaTime) {
        if (GameState.mode !== 'walking' && GameState.mode !== 'indoor') return;
        
        const cfg = GameState.player;
        const moveInput = controls.getMoveDirection();
        const inputMagnitude = controls.getMoveIntensity();
        const isRunning = controls.isRunning();
        const isWalking = controls.isWalking();
        const yaw = controls.getYaw();
        const forwardOnly = inputMagnitude > 0.1 && moveInput.y < -0.2 && Math.abs(moveInput.x) < 0.15;
        
        // Determine target speed based on input
        let targetSpeed = 0;
        if (inputMagnitude > 0.1) {
            if (isWalking) {
                targetSpeed = cfg.walkSpeed;
                this.moveState = 'walking';
            } else if (isRunning) {
                targetSpeed = cfg.sprintSpeed;
                this.moveState = 'sprinting';
            } else {
                targetSpeed = cfg.jogSpeed;
                this.moveState = 'jogging';
            }
        } else {
            this.moveState = this.getSpeed() > 0.5 ? 'stopping' : 'idle';
        }
        
        // Calculate movement direction (camera-relative)
        const forwardVec = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw)); // Camera look direction
        const rightVec = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
        
        let targetDir;
        if (forwardOnly) {
            targetDir = forwardVec.clone();
        } else {
            targetDir = forwardVec.clone().multiplyScalar(-moveInput.y)
                .add(rightVec.clone().multiplyScalar(moveInput.x));
            if (targetDir.lengthSq() < 0.0001) {
                targetDir.copy(forwardVec);
            } else {
                targetDir.normalize();
            }
        }
        
        // Current horizontal velocity
        const currentSpeed = this.getSpeed();
        const currentDir = currentSpeed > 0.1 
            ? new THREE.Vector3(this.velocity.x, 0, this.velocity.z).normalize()
            : targetDir.clone();
        
        // --- GTA V style acceleration ---
        if (inputMagnitude > 0.1) {
            // Accelerate towards target
            const accelRate = cfg.acceleration * inputMagnitude;
            
            // Blend direction (allows for curved movement)
            const blendedDir = currentDir.clone().lerp(targetDir, deltaTime * 8).normalize();
            
            // Calculate new speed
            let newSpeed = currentSpeed;
            if (currentSpeed < targetSpeed) {
                newSpeed = Math.min(targetSpeed, currentSpeed + accelRate * deltaTime);
            } else {
                // Decelerate if over target speed
                newSpeed = Math.max(targetSpeed, currentSpeed - cfg.deceleration * 0.5 * deltaTime);
            }
            
            // Apply velocity
            this.velocity.x = blendedDir.x * newSpeed;
            this.velocity.z = blendedDir.z * newSpeed;
            
            // Update rotation - slower turn when sprinting (realistic)
            let turnSpeed;
            if (this.moveState === 'sprinting') {
                turnSpeed = cfg.turnSpeedSprint;
            } else if (this.moveState === 'walking') {
                turnSpeed = cfg.turnSpeedWalk;
            } else {
                turnSpeed = cfg.turnSpeedWalk;
            }
            
            // Smooth rotation towards movement direction (when pressing forward, snap to camera facing)
            const dirAngle = Math.atan2(targetDir.x, targetDir.z);
            const forwardAngle = Math.atan2(forwardVec.x, forwardVec.z);
            this.targetRotation = forwardOnly ? forwardAngle : dirAngle;
        } else {
            // Decelerate to stop
            const decelRate = cfg.deceleration;
            const newSpeed = Math.max(0, currentSpeed - decelRate * deltaTime);
            
            if (newSpeed > 0.01) {
                this.velocity.x = currentDir.x * newSpeed;
                this.velocity.z = currentDir.z * newSpeed;
            } else {
                this.velocity.x = 0;
                this.velocity.z = 0;
            }
        }
        
        // --- Rotation with momentum ---
        let rotDiff = this.targetRotation - this.rotation;
        while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
        while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
        
        // Turn speed varies with movement
        const currentTurnSpeed = this.moveState === 'idle' 
            ? cfg.turnSpeedIdle 
            : (this.moveState === 'sprinting' ? cfg.turnSpeedSprint : cfg.turnSpeedWalk);
        
        // Angular velocity approach (smoother)
        this.angularVelocity += rotDiff * currentTurnSpeed * deltaTime;
        this.angularVelocity *= Math.exp(-deltaTime * 9); // Damping
        this.rotation += this.angularVelocity;
        this.group.rotation.y = this.rotation;
        
        // Lean into turns slightly
        const leanTarget = THREE.MathUtils.clamp(this.angularVelocity * 0.35, -0.35, 0.35);
        this.anim.turnLean = THREE.MathUtils.lerp(this.anim.turnLean, leanTarget, deltaTime * 8);
        
        // --- Apply velocity to position ---
        this.group.position.x += this.velocity.x * deltaTime;
        this.group.position.z += this.velocity.z * deltaTime;
        
        // --- Gravity & ground ---
        if (!this.isGrounded) {
            this.verticalVelocity -= cfg.gravity * deltaTime;
            this.verticalVelocity = Math.max(-cfg.terminalVelocity, this.verticalVelocity);
        }
        this.group.position.y += this.verticalVelocity * deltaTime;
        
        // Simple ground check
        if (this.group.position.y <= this.groundY) {
            this.group.position.y = this.groundY;
            this.verticalVelocity = 0;
            this.isGrounded = true;
        }
        
        // --- Update procedural animation ---
        this.updateProceduralAnimation(deltaTime);
        
        // Indoor bounds
        if (GameState.mode === 'indoor') {
            this.group.position.x = THREE.MathUtils.clamp(this.group.position.x, 492, 508);
            this.group.position.z = THREE.MathUtils.clamp(this.group.position.z, 492, 509);
        }
    }
    
    /**
     * GTA V style procedural animation
     */
    updateProceduralAnimation(deltaTime) {
        const speed = this.getSpeed();
        const cfg = GameState.player;
        
        // Blend weights based on speed
        const walkThreshold = cfg.walkSpeed;
        const jogThreshold = cfg.jogSpeed;
        const sprintThreshold = cfg.sprintSpeed;
        
        // Calculate animation intensity (0-1)
        this.movementBlend = THREE.MathUtils.lerp(
            this.movementBlend,
            Math.min(1, speed / jogThreshold),
            deltaTime * 8
        );
        
        // --- Walk/Run cycle ---
        if (speed > 0.3) {
            // Cycle speed proportional to movement speed
            const cycleSpeed = 8 + speed * 1.2;
            this.anim.cycle += deltaTime * cycleSpeed;
            
            // Stride amount based on speed
            const strideBase = speed > sprintThreshold * 0.8 ? 0.7 : (speed > jogThreshold * 0.8 ? 0.5 : 0.35);
            this.anim.strideLength = THREE.MathUtils.lerp(this.anim.strideLength, strideBase, deltaTime * 6);
            
            // --- Leg animation ---
            const legSwing = Math.sin(this.anim.cycle) * this.anim.strideLength;
            const legLift = Math.max(0, Math.sin(this.anim.cycle)) * 0.2 * this.movementBlend;
            
            this.parts.leftLegPivot.rotation.x = legSwing;
            this.parts.rightLegPivot.rotation.x = -legSwing;
            
            // --- Arm animation (opposite to legs, with slight delay) ---
            const armSwing = Math.sin(this.anim.cycle + 0.1) * this.anim.strideLength * 0.6;
            this.parts.leftArmPivot.rotation.x = -armSwing;
            this.parts.rightArmPivot.rotation.x = armSwing;
            
            // Arm side swing when sprinting
            if (speed > jogThreshold) {
                const sideSwing = Math.sin(this.anim.cycle * 2) * 0.1;
                this.parts.leftArmPivot.rotation.z = -0.2 + sideSwing;
                this.parts.rightArmPivot.rotation.z = 0.2 - sideSwing;
            }
            
            // --- Body motion ---
            // Vertical bob (double frequency)
            this.anim.bodyBob = Math.abs(Math.sin(this.anim.cycle * 2)) * 0.04 * this.movementBlend;
            
            // Hip sway (subtle)
            this.anim.hipSway = Math.sin(this.anim.cycle) * 0.03 * this.movementBlend;
            
            // Body twist (shoulders counter-rotate to hips)
            this.anim.bodyTwist = Math.sin(this.anim.cycle) * 0.08 * this.movementBlend;
            
            // Forward lean when sprinting
            const leanAmount = speed > jogThreshold ? 0.1 : 0.05;
            this.anim.bodyLean = THREE.MathUtils.lerp(this.anim.bodyLean, leanAmount * this.movementBlend, deltaTime * 5);
            
            // Apply body motion
            this.parts.body.position.y = 0.9 + this.anim.bodyBob;
            this.parts.body.rotation.x = this.anim.bodyLean;
            this.parts.body.rotation.y = this.anim.bodyTwist;
            this.parts.body.rotation.z = this.anim.hipSway + this.anim.turnLean;
            
            // Head follows body with slight lag
            this.parts.head.position.y = 1.75 + this.anim.bodyBob * 0.8;
            this.parts.head.rotation.x = this.anim.bodyLean * 0.5;
            
        } else {
            // --- Idle animation ---
            this.anim.strideLength *= 0.9;
            
            // Smooth return to idle pose
            const returnSpeed = deltaTime * 6;
            this.parts.leftLegPivot.rotation.x *= (1 - returnSpeed);
            this.parts.rightLegPivot.rotation.x *= (1 - returnSpeed);
            this.parts.leftArmPivot.rotation.x *= (1 - returnSpeed);
            this.parts.rightArmPivot.rotation.x *= (1 - returnSpeed);
            this.parts.leftArmPivot.rotation.z = THREE.MathUtils.lerp(this.parts.leftArmPivot.rotation.z, 0, returnSpeed);
            this.parts.rightArmPivot.rotation.z = THREE.MathUtils.lerp(this.parts.rightArmPivot.rotation.z, 0, returnSpeed);
            
            // Breathing
            this.anim.breatheCycle += deltaTime * 1.5;
            const breathe = Math.sin(this.anim.breatheCycle) * 0.01;
            this.parts.body.scale.set(1 + breathe, 1, 1 + breathe * 0.5);
            
            // Subtle idle sway
            const idleSway = Math.sin(this.anim.breatheCycle * 0.3) * 0.005;
            this.parts.body.rotation.z = idleSway + this.anim.turnLean * 0.5;
            
            // Reset body position
            this.parts.body.position.y = THREE.MathUtils.lerp(this.parts.body.position.y, 0.9, returnSpeed);
            this.parts.body.rotation.x = THREE.MathUtils.lerp(this.parts.body.rotation.x, 0, returnSpeed);
            this.parts.body.rotation.y *= (1 - returnSpeed);
            this.parts.head.position.y = THREE.MathUtils.lerp(this.parts.head.position.y, 1.75, returnSpeed);
            this.parts.head.rotation.x *= (1 - returnSpeed);
        }
    }
    
    /**
     * Jump (GTA V style)
     */
    jump() {
        if (this.isGrounded) {
            const cfg = GameState.player;
            this.verticalVelocity = cfg.jumpForce;
            this.isGrounded = false;
        }
    }
    
    /**
     * Teleport player to position
     */
    teleportTo(x, y, z) {
        this.group.position.set(x, y, z);
        this.velocity.set(0, 0, 0);
    }
    
    /**
     * Get current speed
     */
    getSpeed() {
        return Math.sqrt(this.velocity.x ** 2 + this.velocity.z ** 2);
    }
    
    isMoving() {
        return this.getSpeed() > 0.1;
    }
}
