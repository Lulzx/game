import * as THREE from 'three';

/**
 * GTA V style NPC update with reactive behaviors.
 */
export function updateNPC(npc, deltaTime, playerPosition) {
    const distance = npc.group.position.distanceTo(playerPosition);
    
    // Track player approach speed
    npc.playerApproachSpeed = (npc.lastPlayerDist - distance) / deltaTime;
    npc.lastPlayerDist = distance;
    
    // Update time
    npc.anim.time += deltaTime;
    npc.anim.bobPhase += deltaTime * 1.5;
    npc.anim.breathePhase += deltaTime * 1.2;

    // Decay surprise offset and keep anchored to home
    npc.anim.surpriseOffset.multiplyScalar(0.9);
    npc.group.position.x = npc.homePosition.x + npc.anim.surpriseOffset.x;
    npc.group.position.z = npc.homePosition.z + npc.anim.surpriseOffset.z;
    
    // --- AI State Machine ---
    updateAIState(npc, distance, deltaTime, playerPosition);
    
    // --- Awareness level (smooth transition) ---
    let targetAwareness = 0;
    if (distance < 15) targetAwareness = 0.3;
    if (distance < 10) targetAwareness = 0.6;
    if (distance < 5) targetAwareness = 1.0;
    npc.awareness = THREE.MathUtils.lerp(npc.awareness, targetAwareness, deltaTime * 3);
    
    // --- Body rotation (look at player) ---
    if (npc.awareness > 0.2) {
        npc.targetRotation = Math.atan2(
            playerPosition.x - npc.group.position.x,
            playerPosition.z - npc.group.position.z
        );
    }
    
    // Smooth rotation with momentum
    let rotDiff = npc.targetRotation - npc.currentRotation;
    while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
    while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
    
    const rotSpeed = npc.state === 'alert' ? 8 : 3;
    npc.currentRotation += rotDiff * rotSpeed * deltaTime;
    npc.group.rotation.y = npc.currentRotation;
    
    // --- Idle animations ---
    // Breathing (body scale)
    const breathe = Math.sin(npc.anim.breathePhase) * 0.015;
    npc.body.scale.set(1 + breathe, 1, 1 + breathe * 0.5);
    
    // Gentle bob (reduced when alert)
    const bobIntensity = 1 - npc.awareness * 0.7;
    const bob = Math.sin(npc.anim.bobPhase) * 0.04 * bobIntensity;
    npc.group.position.y = bob + npc.anim.surprise * 0.3;
    
    // Decay surprise
    npc.anim.surprise *= 0.92;
    
    // --- Head look ---
    if (npc.awareness > 0.1) {
        const headLookTarget = Math.sin(rotDiff) * 0.4 * npc.awareness;
        npc.anim.headLookX = THREE.MathUtils.lerp(npc.anim.headLookX, headLookTarget, deltaTime * 5);
        
        // Slight up/down based on distance
        const verticalLook = (distance < 3) ? 0.1 : -0.05;
        npc.anim.headLookY = THREE.MathUtils.lerp(npc.anim.headLookY, verticalLook * npc.awareness, deltaTime * 3);
    } else {
        // Idle head movement
        npc.anim.headLookX = Math.sin(npc.anim.time * 0.3) * 0.1;
        npc.anim.headLookY = Math.sin(npc.anim.time * 0.2) * 0.05;
    }
    
    npc.head.rotation.y = npc.anim.headLookX;
    npc.head.rotation.x = npc.anim.headLookY;
    npc.head.rotation.z = Math.sin(npc.anim.bobPhase * 0.5) * 0.03;
    
    // --- Body lean (towards player when interested) ---
    const targetLean = npc.awareness > 0.5 ? 0.08 : 0;
    npc.anim.bodyLean = THREE.MathUtils.lerp(npc.anim.bodyLean, targetLean, deltaTime * 4);
    npc.body.rotation.x = npc.anim.bodyLean;
    
    // --- Waving animation ---
    if (npc.state === 'greeting') {
        npc.anim.isWaving = true;
        npc.anim.waveIntensity = THREE.MathUtils.lerp(npc.anim.waveIntensity, 1, deltaTime * 5);
    } else {
        npc.anim.waveIntensity = THREE.MathUtils.lerp(npc.anim.waveIntensity, 0, deltaTime * 3);
        if (npc.anim.waveIntensity < 0.05) {
            npc.anim.isWaving = false;
        }
    }
    
    if (npc.anim.waveIntensity > 0.01) {
        npc.anim.waveTime += deltaTime * 10;
        const wave = npc.anim.waveIntensity;
        npc.armPivot.rotation.z = -1.3 * wave + Math.sin(npc.anim.waveTime) * 0.5 * wave;
        npc.armPivot.rotation.x = Math.sin(npc.anim.waveTime * 0.5) * 0.3 * wave;
    } else {
        npc.armPivot.rotation.z *= 0.9;
        npc.armPivot.rotation.x = Math.sin(npc.anim.bobPhase) * 0.05;
    }
}

/**
 * State machine that reacts to player position and velocity.
 */
export function updateAIState(npc, distance, deltaTime, playerPosition) {
    const prevState = npc.state;
    
    if (distance > 15) {
        npc.state = 'idle';
    } else if (distance > 8) {
        npc.state = 'watching';
    } else if (distance > 4) {
        npc.state = 'alert';
        if (npc.playerApproachSpeed > 8) {
            npc.anim.surprise = 1;
            if (playerPosition) {
                const away = new THREE.Vector3().subVectors(npc.group.position, playerPosition);
                away.y = 0;
                if (away.lengthSq() > 0.001) {
                    away.normalize();
                    npc.anim.surpriseOffset.copy(away.multiplyScalar(1.4));
                }
            }
        }
    } else {
        npc.state = 'greeting';
    }
    
    if (prevState !== 'alert' && npc.state === 'alert') {
        npc.anim.surprise = 0.5;
        if (playerPosition) {
            const away = new THREE.Vector3().subVectors(npc.group.position, playerPosition);
            away.y = 0;
            if (away.lengthSq() > 0.001) {
                away.normalize();
                npc.anim.surpriseOffset.copy(away.multiplyScalar(1.1));
            }
        }
    }
}
