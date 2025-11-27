import * as THREE from 'three';
import { GameState } from '../../core/GameState.js';
import { updatePlayerAnimation } from './PlayerAnimation.js';

/**
 * Momentum-based player movement inspired by GTA V.
 */
export function updatePlayerMovement(player, controls, deltaTime) {
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
            player.moveState = 'walking';
        } else if (isRunning) {
            targetSpeed = cfg.sprintSpeed;
            player.moveState = 'sprinting';
        } else {
            targetSpeed = cfg.jogSpeed;
            player.moveState = 'jogging';
        }
    } else {
        player.moveState = player.getSpeed() > 0.5 ? 'stopping' : 'idle';
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
    const currentSpeed = player.getSpeed();
    const currentDir = currentSpeed > 0.1 
        ? new THREE.Vector3(player.velocity.x, 0, player.velocity.z).normalize()
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
        player.velocity.x = blendedDir.x * newSpeed;
        player.velocity.z = blendedDir.z * newSpeed;
        
        // Update rotation - slower turn when sprinting (realistic)
        let turnSpeed;
        if (player.moveState === 'sprinting') {
            turnSpeed = cfg.turnSpeedSprint;
        } else if (player.moveState === 'walking') {
            turnSpeed = cfg.turnSpeedWalk;
        } else {
            turnSpeed = cfg.turnSpeedWalk;
        }
        
        // Smooth rotation towards movement direction (when pressing forward, snap to camera facing)
        const dirAngle = Math.atan2(targetDir.x, targetDir.z);
        const forwardAngle = Math.atan2(forwardVec.x, forwardVec.z);
        player.targetRotation = forwardOnly ? forwardAngle : dirAngle;
    } else {
        // Decelerate to stop
        const decelRate = cfg.deceleration;
        const newSpeed = Math.max(0, currentSpeed - decelRate * deltaTime);
        
        if (newSpeed > 0.01) {
            player.velocity.x = currentDir.x * newSpeed;
            player.velocity.z = currentDir.z * newSpeed;
        } else {
            player.velocity.x = 0;
            player.velocity.z = 0;
        }
    }
    
    // --- Rotation with momentum ---
    let rotDiff = player.targetRotation - player.rotation;
    while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
    while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
    
    // Turn speed varies with movement
    const currentTurnSpeed = player.moveState === 'idle' 
        ? cfg.turnSpeedIdle 
        : (player.moveState === 'sprinting' ? cfg.turnSpeedSprint : cfg.turnSpeedWalk);
    
    // Angular velocity approach (smoother)
    player.angularVelocity += rotDiff * currentTurnSpeed * deltaTime;
    player.angularVelocity *= Math.exp(-deltaTime * 9); // Damping
    player.rotation += player.angularVelocity;
    player.group.rotation.y = player.rotation;
    
    // Lean into turns slightly
    const leanTarget = THREE.MathUtils.clamp(player.angularVelocity * 0.35, -0.35, 0.35);
    player.anim.turnLean = THREE.MathUtils.lerp(player.anim.turnLean, leanTarget, deltaTime * 8);
    
    // --- Apply velocity to position ---
    player.group.position.x += player.velocity.x * deltaTime;
    player.group.position.z += player.velocity.z * deltaTime;
    
    // --- Gravity & ground ---
    if (!player.isGrounded) {
        player.verticalVelocity -= cfg.gravity * deltaTime;
        player.verticalVelocity = Math.max(-cfg.terminalVelocity, player.verticalVelocity);
    }
    player.group.position.y += player.verticalVelocity * deltaTime;
    
    // Simple ground check
    if (player.group.position.y <= player.groundY) {
        player.group.position.y = player.groundY;
        player.verticalVelocity = 0;
        player.isGrounded = true;
    }
    
    // --- Update procedural animation ---
    updatePlayerAnimation(player, deltaTime);
    
    // Indoor bounds
    if (GameState.mode === 'indoor') {
        player.group.position.x = THREE.MathUtils.clamp(player.group.position.x, 492, 508);
        player.group.position.z = THREE.MathUtils.clamp(player.group.position.z, 492, 509);
    }
}
