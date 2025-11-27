import * as THREE from 'three';
import { GameState } from '../../core/GameState.js';

/**
 * Handles all procedural animation for the player.
 */
export function updatePlayerAnimation(player, deltaTime) {
    const speed = player.getSpeed();
    const cfg = GameState.player;
    
    // Blend weights based on speed
    const walkThreshold = cfg.walkSpeed;
    const jogThreshold = cfg.jogSpeed;
    const sprintThreshold = cfg.sprintSpeed;
    
    // Calculate animation intensity (0-1)
    player.movementBlend = THREE.MathUtils.lerp(
        player.movementBlend,
        Math.min(1, speed / jogThreshold),
        deltaTime * 8
    );
    
    // --- Walk/Run cycle ---
    if (speed > 0.3) {
        // Cycle speed proportional to movement speed
        const cycleSpeed = 8 + speed * 1.2;
        player.anim.cycle += deltaTime * cycleSpeed;
        
        // Stride amount based on speed
        const strideBase = speed > sprintThreshold * 0.8 ? 0.7 : (speed > jogThreshold * 0.8 ? 0.5 : 0.35);
        player.anim.strideLength = THREE.MathUtils.lerp(player.anim.strideLength, strideBase, deltaTime * 6);
        
        // --- Leg animation ---
        const legSwing = Math.sin(player.anim.cycle) * player.anim.strideLength;
        const legLift = Math.max(0, Math.sin(player.anim.cycle)) * 0.2 * player.movementBlend;
        
        player.parts.leftLegPivot.rotation.x = legSwing;
        player.parts.rightLegPivot.rotation.x = -legSwing;
        
        // --- Arm animation (opposite to legs, with slight delay) ---
        const armSwing = Math.sin(player.anim.cycle + 0.1) * player.anim.strideLength * 0.6;
        player.parts.leftArmPivot.rotation.x = -armSwing;
        player.parts.rightArmPivot.rotation.x = armSwing;
        
        // Arm side swing when sprinting
        if (speed > jogThreshold) {
            const sideSwing = Math.sin(player.anim.cycle * 2) * 0.1;
            player.parts.leftArmPivot.rotation.z = -0.2 + sideSwing;
            player.parts.rightArmPivot.rotation.z = 0.2 - sideSwing;
        }
        
        // --- Body motion ---
        // Vertical bob (double frequency)
        player.anim.bodyBob = Math.abs(Math.sin(player.anim.cycle * 2)) * 0.04 * player.movementBlend;
        
        // Hip sway (subtle)
        player.anim.hipSway = Math.sin(player.anim.cycle) * 0.03 * player.movementBlend;
        
        // Body twist (shoulders counter-rotate to hips)
        player.anim.bodyTwist = Math.sin(player.anim.cycle) * 0.08 * player.movementBlend;
        
        // Forward lean when sprinting
        const leanAmount = speed > jogThreshold ? 0.1 : 0.05;
        player.anim.bodyLean = THREE.MathUtils.lerp(player.anim.bodyLean, leanAmount * player.movementBlend, deltaTime * 5);
        
        // Apply body motion
        player.parts.body.position.y = 0.9 + player.anim.bodyBob;
        player.parts.body.rotation.x = player.anim.bodyLean;
        player.parts.body.rotation.y = player.anim.bodyTwist;
        player.parts.body.rotation.z = player.anim.hipSway + player.anim.turnLean;
        
        // Head follows body with slight lag
        player.parts.head.position.y = 1.75 + player.anim.bodyBob * 0.8;
        player.parts.head.rotation.x = player.anim.bodyLean * 0.5;
        
    } else {
        // --- Idle animation ---
        player.anim.strideLength *= 0.9;
        
        // Smooth return to idle pose
        const returnSpeed = deltaTime * 6;
        player.parts.leftLegPivot.rotation.x *= (1 - returnSpeed);
        player.parts.rightLegPivot.rotation.x *= (1 - returnSpeed);
        player.parts.leftArmPivot.rotation.x *= (1 - returnSpeed);
        player.parts.rightArmPivot.rotation.x *= (1 - returnSpeed);
        player.parts.leftArmPivot.rotation.z = THREE.MathUtils.lerp(player.parts.leftArmPivot.rotation.z, 0, returnSpeed);
        player.parts.rightArmPivot.rotation.z = THREE.MathUtils.lerp(player.parts.rightArmPivot.rotation.z, 0, returnSpeed);
        
        // Breathing
        player.anim.breatheCycle += deltaTime * 1.5;
        const breathe = Math.sin(player.anim.breatheCycle) * 0.01;
        player.parts.body.scale.set(1 + breathe, 1, 1 + breathe * 0.5);
        
        // Subtle idle sway
        const idleSway = Math.sin(player.anim.breatheCycle * 0.3) * 0.005;
        player.parts.body.rotation.z = idleSway + player.anim.turnLean * 0.5;
        
        // Reset body position
        player.parts.body.position.y = THREE.MathUtils.lerp(player.parts.body.position.y, 0.9, returnSpeed);
        player.parts.body.rotation.x = THREE.MathUtils.lerp(player.parts.body.rotation.x, 0, returnSpeed);
        player.parts.body.rotation.y *= (1 - returnSpeed);
        player.parts.head.position.y = THREE.MathUtils.lerp(player.parts.head.position.y, 1.75, returnSpeed);
        player.parts.head.rotation.x *= (1 - returnSpeed);
    }
}
