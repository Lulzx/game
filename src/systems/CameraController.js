import * as THREE from 'three';
import { GameState } from '../core/GameState.js';

/**
 * GTA V style cinematic camera with smooth following, collision, and dynamic effects
 */
export class CameraController {
    constructor(camera, controls) {
        this.camera = camera;
        this.controls = controls;
        
        // Camera state
        this.currentPosition = new THREE.Vector3();
        this.currentLookAt = new THREE.Vector3();
        this.currentDistance = 6;
        this.currentHeight = 3;
        this.currentFOV = 60;
        
        // Velocity for smooth movement
        this.positionVelocity = new THREE.Vector3();
        this.lookAtVelocity = new THREE.Vector3();
        
        // Head bob
        this.headBob = {
            time: 0,
            x: 0,
            y: 0,
            intensity: 0
        };
        
        // Camera shake
        this.shake = {
            intensity: 0,
            decay: 5,
            offset: new THREE.Vector3()
        };
        
        // Speed-based effects
        this.speedEffects = {
            currentSpeed: 0,
            fovOffset: 0,
            distanceOffset: 0
        };
        
        // Collision detection
        this.collisionRaycaster = new THREE.Raycaster();
        this.collisionObjects = [];
    }
    
    setCollisionObjects(objects) {
        this.collisionObjects = objects;
    }
    
    /**
     * GTA V style camera update
     */
    update(target, deltaTime, speed = 0, isMoving = false, isRunning = false) {
        const cfg = GameState.camera;
        const yaw = this.controls.getYaw();
        const pitch = this.controls.getPitch();
        
        // --- Calculate target distance and height based on mode ---
        let targetDistance, targetHeight, lookAtHeight;
        
        if (GameState.mode === 'driving') {
            // Dynamic distance based on speed
            const speedFactor = Math.min(1, speed / 30);
            targetDistance = cfg.driveDistance + speedFactor * cfg.driveSpeedZoom;
            targetHeight = cfg.driveHeight + speedFactor * 1.5;
            lookAtHeight = 1.2;
            
            // Speed-based FOV
            this.speedEffects.fovOffset = THREE.MathUtils.lerp(
                this.speedEffects.fovOffset,
                speedFactor * cfg.fovDriveBoost,
                deltaTime * 3
            );
        } else if (GameState.mode === 'indoor') {
            targetDistance = 5;
            targetHeight = 2.5;
            lookAtHeight = 1.5;
            this.speedEffects.fovOffset *= 0.95;
        } else {
            // Walking/running
            const runFactor = Math.min(1, speed / 8);
            targetDistance = cfg.walkDistance + runFactor * 1.4;
            targetHeight = cfg.walkHeight + runFactor * 0.4;
            lookAtHeight = 1.6;
            
            // Sprint FOV boost
            const sprintFov = isRunning ? cfg.fovSprintBoost * (0.5 + runFactor * 0.5) : runFactor * cfg.fovSprintBoost * 0.35;
            this.speedEffects.fovOffset = THREE.MathUtils.lerp(
                this.speedEffects.fovOffset,
                sprintFov,
                deltaTime * 4
            );
        }
        
        // --- Head bob effect ---
        if (isMoving && GameState.mode !== 'driving') {
            const speedFactor = Math.min(1, speed / 9);
            const bobFreq = THREE.MathUtils.lerp(8, 15, speedFactor);
            const bobAmp = THREE.MathUtils.lerp(0.025, 0.065, speedFactor);
            
            this.headBob.time += deltaTime * bobFreq;
            this.headBob.intensity = THREE.MathUtils.lerp(this.headBob.intensity, 1, deltaTime * 8);
            
            this.headBob.y = Math.sin(this.headBob.time) * bobAmp * this.headBob.intensity;
            this.headBob.x = Math.sin(this.headBob.time * 0.5) * bobAmp * 0.5 * this.headBob.intensity;
        } else {
            this.headBob.intensity = THREE.MathUtils.lerp(this.headBob.intensity, 0, deltaTime * 6);
            this.headBob.y *= 0.9;
            this.headBob.x *= 0.9;
        }
        
        // --- Calculate ideal camera position ---
        // Smooth distance/height transitions
        this.currentDistance = THREE.MathUtils.lerp(this.currentDistance, targetDistance, deltaTime * cfg.followSmoothing);
        this.currentHeight = THREE.MathUtils.lerp(this.currentHeight, targetHeight, deltaTime * cfg.followSmoothing);
        
        // Calculate offset from yaw/pitch
        const verticalFactor = 1 - Math.abs(pitch) * 0.3; // Reduce distance when looking up/down
        const effectiveDistance = this.currentDistance * verticalFactor;
        
        const idealOffset = new THREE.Vector3(
            Math.sin(yaw) * effectiveDistance,
            this.currentHeight - pitch * 2.5,
            Math.cos(yaw) * effectiveDistance
        );
        
        // Add head bob
        idealOffset.x += this.headBob.x;
        idealOffset.y += this.headBob.y;
        
        const idealPosition = target.position.clone().add(idealOffset);
        
        // --- Camera collision detection ---
        const collisionAdjusted = this.handleCollision(target.position, idealPosition, lookAtHeight);
        
        // --- Smooth camera movement with damping ---
        const smoothing = cfg.followSmoothing * deltaTime;
        
        // Use spring-damper for more natural feel
        const targetDiff = collisionAdjusted.clone().sub(this.currentPosition);
        this.positionVelocity.add(targetDiff.multiplyScalar(smoothing * 8));
        this.positionVelocity.multiplyScalar(0.85); // Damping
        this.currentPosition.add(this.positionVelocity.clone().multiplyScalar(deltaTime * 60));
        
        // --- Camera shake ---
        if (this.shake.intensity > 0) {
            this.shake.offset.set(
                (Math.random() - 0.5) * this.shake.intensity,
                (Math.random() - 0.5) * this.shake.intensity,
                (Math.random() - 0.5) * this.shake.intensity
            );
            this.shake.intensity = Math.max(0, this.shake.intensity - this.shake.decay * deltaTime);
        } else {
            this.shake.offset.multiplyScalar(0.9);
        }
        
        // Apply to camera
        this.camera.position.copy(this.currentPosition).add(this.shake.offset);
        
        // --- Look at target ---
        const idealLookAt = target.position.clone();
        idealLookAt.y += lookAtHeight;
        
        // Smooth look-at with spring
        const lookDiff = idealLookAt.clone().sub(this.currentLookAt);
        this.lookAtVelocity.add(lookDiff.multiplyScalar(cfg.lookSmoothing * deltaTime * 8));
        this.lookAtVelocity.multiplyScalar(0.88);
        this.currentLookAt.add(this.lookAtVelocity.clone().multiplyScalar(deltaTime * 60));
        
        this.camera.lookAt(this.currentLookAt);
        
        // --- Dynamic FOV ---
        const targetFOV = cfg.fovBase + this.speedEffects.fovOffset;
        this.currentFOV = THREE.MathUtils.lerp(this.currentFOV, targetFOV, deltaTime * 5);
        this.camera.fov = this.currentFOV;
        this.camera.updateProjectionMatrix();
    }
    
    /**
     * Handle camera collision with scene geometry
     */
    handleCollision(targetPos, cameraPos, lookAtHeight) {
        if (this.collisionObjects.length === 0) return cameraPos;
        
        const lookAt = targetPos.clone();
        lookAt.y += lookAtHeight;
        
        const direction = cameraPos.clone().sub(lookAt).normalize();
        const distance = cameraPos.distanceTo(lookAt);
        
        this.collisionRaycaster.set(lookAt, direction);
        this.collisionRaycaster.far = distance;
        
        const intersects = this.collisionRaycaster.intersectObjects(this.collisionObjects, true);
        
        if (intersects.length > 0 && intersects[0].distance < distance) {
            // Move camera in front of obstacle
            const safeDistance = Math.max(1, intersects[0].distance - 0.5);
            return lookAt.clone().add(direction.multiplyScalar(safeDistance));
        }
        
        return cameraPos;
    }
    
    /**
     * Trigger camera shake
     */
    triggerShake(intensity = 0.3, decay = 8) {
        this.shake.intensity = Math.max(this.shake.intensity, intensity);
        this.shake.decay = decay;
    }
    
    /**
     * Instant snap to target (for teleportation)
     */
    snapTo(target) {
        const yaw = this.controls.getYaw();
        const offset = new THREE.Vector3(
            Math.sin(yaw) * this.currentDistance,
            this.currentHeight,
            Math.cos(yaw) * this.currentDistance
        );
        
        this.currentPosition.copy(target.position).add(offset);
        this.currentLookAt.copy(target.position);
        this.currentLookAt.y += 1.5;
        
        this.positionVelocity.set(0, 0, 0);
        this.lookAtVelocity.set(0, 0, 0);
        
        this.camera.position.copy(this.currentPosition);
        this.camera.lookAt(this.currentLookAt);
    }
}
