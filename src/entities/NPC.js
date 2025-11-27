import * as THREE from 'three';

/**
 * GTA V style NPC with reactive behaviors and smooth animations
 */
export class NPC {
    constructor(x, z, friendData) {
        this.group = new THREE.Group();
        this.friendData = friendData;
        this.homePosition = new THREE.Vector3(x, 0, z);
        
        // AI State
        this.state = 'idle'; // 'idle', 'alert', 'greeting', 'watching'
        this.awareness = 0;  // 0-1, how aware of player
        this.targetRotation = 0;
        this.currentRotation = 0;
        
        // Animation state
        this.anim = {
            time: Math.random() * Math.PI * 2,
            bobPhase: Math.random() * Math.PI * 2,
            breathePhase: Math.random() * Math.PI * 2,
            waveTime: 0,
            isWaving: false,
            waveIntensity: 0,
            headLookX: 0,
            headLookY: 0,
            bodyLean: 0,
            surprise: 0,  // Jump back reaction
            surpriseOffset: new THREE.Vector3()
        };
        
        // Reaction tracking
        this.lastPlayerDist = Infinity;
        this.playerApproachSpeed = 0;
        
        this.createMesh();
        this.group.position.set(x, 0, z);
        this.group.userData = { type: 'npc', friend: friendData };
    }
    
    createMesh() {
        const color = this.friendData.color;
        
        // Body
        const bodyGeo = new THREE.CylinderGeometry(0.35, 0.45, 1.1, 12);
        const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.75;
        body.castShadow = true;
        this.group.add(body);
        this.body = body;
        
        // Head
        const headGeo = new THREE.SphereGeometry(0.45, 20, 20);
        const headMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.8;
        head.castShadow = true;
        this.group.add(head);
        this.head = head;
        
        // Eyes
        const eyeGeo = new THREE.SphereGeometry(0.1, 12, 12);
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.16, 1.88, 0.36);
        this.group.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.16, 1.88, 0.36);
        this.group.add(rightEye);
        
        // Eye shine
        const shineGeo = new THREE.SphereGeometry(0.04, 8, 8);
        const shineMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        
        const leftShine = new THREE.Mesh(shineGeo, shineMat);
        leftShine.position.set(-0.13, 1.92, 0.44);
        this.group.add(leftShine);
        
        const rightShine = new THREE.Mesh(shineGeo, shineMat);
        rightShine.position.set(0.19, 1.92, 0.44);
        this.group.add(rightShine);
        
        // Nose
        const noseGeo = new THREE.SphereGeometry(0.1, 10, 10);
        const noseMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const nose = new THREE.Mesh(noseGeo, noseMat);
        nose.position.set(0, 1.75, 0.4);
        this.group.add(nose);
        
        // Smile
        const smileGeo = new THREE.TorusGeometry(0.12, 0.025, 8, 12, Math.PI);
        const smileMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const smile = new THREE.Mesh(smileGeo, smileMat);
        smile.position.set(0, 1.65, 0.38);
        smile.rotation.x = Math.PI * 0.1;
        this.group.add(smile);
        
        // Add ears based on animal type
        this.addEars();
        
        // Arm for waving
        const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.45, 10);
        const armMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
        
        this.armPivot = new THREE.Group();
        this.armPivot.position.set(0.45, 1.15, 0);
        
        const arm = new THREE.Mesh(armGeo, armMat);
        arm.position.y = 0.2;
        arm.castShadow = true;
        this.armPivot.add(arm);
        this.group.add(this.armPivot);
        
        // Left arm (static)
        const leftArmPivot = new THREE.Group();
        leftArmPivot.position.set(-0.45, 1.15, 0);
        leftArmPivot.rotation.z = 0.3;
        const leftArm = new THREE.Mesh(armGeo, armMat);
        leftArm.position.y = -0.2;
        leftArmPivot.add(leftArm);
        this.group.add(leftArmPivot);
    }
    
    addEars() {
        const color = this.friendData.color;
        const emoji = this.friendData.emoji;
        
        if (emoji === '🐰') {
            // Bunny ears (long)
            const earGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.55, 10);
            const earMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
            
            const leftEar = new THREE.Mesh(earGeo, earMat);
            leftEar.position.set(-0.2, 2.45, 0);
            leftEar.rotation.z = 0.15;
            this.group.add(leftEar);
            
            const rightEar = new THREE.Mesh(earGeo, earMat);
            rightEar.position.set(0.2, 2.45, 0);
            rightEar.rotation.z = -0.15;
            this.group.add(rightEar);
            
            // Inner ear (pink)
            const innerGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.4, 8);
            const innerMat = new THREE.MeshStandardMaterial({ color: 0xFFB6C1 });
            
            const leftInner = new THREE.Mesh(innerGeo, innerMat);
            leftInner.position.set(-0.2, 2.45, 0.03);
            leftInner.rotation.z = 0.15;
            this.group.add(leftInner);
            
            const rightInner = new THREE.Mesh(innerGeo, innerMat);
            rightInner.position.set(0.2, 2.45, 0.03);
            rightInner.rotation.z = -0.15;
            this.group.add(rightInner);
        } else if (emoji === '🐻' || emoji === '🦊') {
            // Round ears
            const earGeo = new THREE.SphereGeometry(0.15, 12, 12);
            const earMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
            
            const leftEar = new THREE.Mesh(earGeo, earMat);
            leftEar.position.set(-0.28, 2.2, 0);
            this.group.add(leftEar);
            
            const rightEar = new THREE.Mesh(earGeo, earMat);
            rightEar.position.set(0.28, 2.2, 0);
            this.group.add(rightEar);
        } else if (emoji === '🦉') {
            // Owl tufts
            const tuftGeo = new THREE.ConeGeometry(0.1, 0.25, 8);
            const tuftMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
            
            const leftTuft = new THREE.Mesh(tuftGeo, tuftMat);
            leftTuft.position.set(-0.25, 2.3, 0);
            leftTuft.rotation.z = 0.3;
            this.group.add(leftTuft);
            
            const rightTuft = new THREE.Mesh(tuftGeo, tuftMat);
            rightTuft.position.set(0.25, 2.3, 0);
            rightTuft.rotation.z = -0.3;
            this.group.add(rightTuft);
        } else if (emoji === '🐤') {
            // Duck beak
            const beakGeo = new THREE.ConeGeometry(0.1, 0.25, 8);
            const beakMat = new THREE.MeshStandardMaterial({ color: 0xFFA500 });
            const beak = new THREE.Mesh(beakGeo, beakMat);
            beak.position.set(0, 1.7, 0.5);
            beak.rotation.x = Math.PI / 2;
            this.group.add(beak);
        }
    }
    
    /**
     * GTA V style NPC update with reactive behaviors
     */
    update(deltaTime, playerPosition) {
        const distance = this.group.position.distanceTo(playerPosition);
        
        // Track player approach speed
        this.playerApproachSpeed = (this.lastPlayerDist - distance) / deltaTime;
        this.lastPlayerDist = distance;
        
        // Update time
        this.anim.time += deltaTime;
        this.anim.bobPhase += deltaTime * 1.5;
        this.anim.breathePhase += deltaTime * 1.2;

        // Decay surprise offset and keep anchored to home
        this.anim.surpriseOffset.multiplyScalar(0.9);
        this.group.position.x = this.homePosition.x + this.anim.surpriseOffset.x;
        this.group.position.z = this.homePosition.z + this.anim.surpriseOffset.z;
        
        // --- AI State Machine ---
        this.updateAIState(distance, deltaTime, playerPosition);
        
        // --- Awareness level (smooth transition) ---
        let targetAwareness = 0;
        if (distance < 15) targetAwareness = 0.3;
        if (distance < 10) targetAwareness = 0.6;
        if (distance < 5) targetAwareness = 1.0;
        this.awareness = THREE.MathUtils.lerp(this.awareness, targetAwareness, deltaTime * 3);
        
        // --- Body rotation (look at player) ---
        if (this.awareness > 0.2) {
            this.targetRotation = Math.atan2(
                playerPosition.x - this.group.position.x,
                playerPosition.z - this.group.position.z
            );
        }
        
        // Smooth rotation with momentum
        let rotDiff = this.targetRotation - this.currentRotation;
        while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
        while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
        
        const rotSpeed = this.state === 'alert' ? 8 : 3;
        this.currentRotation += rotDiff * rotSpeed * deltaTime;
        this.group.rotation.y = this.currentRotation;
        
        // --- Idle animations ---
        // Breathing (body scale)
        const breathe = Math.sin(this.anim.breathePhase) * 0.015;
        this.body.scale.set(1 + breathe, 1, 1 + breathe * 0.5);
        
        // Gentle bob (reduced when alert)
        const bobIntensity = 1 - this.awareness * 0.7;
        const bob = Math.sin(this.anim.bobPhase) * 0.04 * bobIntensity;
        this.group.position.y = bob + this.anim.surprise * 0.3;
        
        // Decay surprise
        this.anim.surprise *= 0.92;
        
        // --- Head look ---
        // Look at player with head (independent of body)
        if (this.awareness > 0.1) {
            const headLookTarget = Math.sin(rotDiff) * 0.4 * this.awareness;
            this.anim.headLookX = THREE.MathUtils.lerp(this.anim.headLookX, headLookTarget, deltaTime * 5);
            
            // Slight up/down based on distance
            const verticalLook = (distance < 3) ? 0.1 : -0.05;
            this.anim.headLookY = THREE.MathUtils.lerp(this.anim.headLookY, verticalLook * this.awareness, deltaTime * 3);
        } else {
            // Idle head movement
            this.anim.headLookX = Math.sin(this.anim.time * 0.3) * 0.1;
            this.anim.headLookY = Math.sin(this.anim.time * 0.2) * 0.05;
        }
        
        this.head.rotation.y = this.anim.headLookX;
        this.head.rotation.x = this.anim.headLookY;
        this.head.rotation.z = Math.sin(this.anim.bobPhase * 0.5) * 0.03;
        
        // --- Body lean (towards player when interested) ---
        const targetLean = this.awareness > 0.5 ? 0.08 : 0;
        this.anim.bodyLean = THREE.MathUtils.lerp(this.anim.bodyLean, targetLean, deltaTime * 4);
        this.body.rotation.x = this.anim.bodyLean;
        
        // --- Waving animation ---
        if (this.state === 'greeting') {
            this.anim.isWaving = true;
            this.anim.waveIntensity = THREE.MathUtils.lerp(this.anim.waveIntensity, 1, deltaTime * 5);
        } else {
            this.anim.waveIntensity = THREE.MathUtils.lerp(this.anim.waveIntensity, 0, deltaTime * 3);
            if (this.anim.waveIntensity < 0.05) {
                this.anim.isWaving = false;
            }
        }
        
        if (this.anim.waveIntensity > 0.01) {
            this.anim.waveTime += deltaTime * 10;
            const wave = this.anim.waveIntensity;
            this.armPivot.rotation.z = -1.3 * wave + Math.sin(this.anim.waveTime) * 0.5 * wave;
            this.armPivot.rotation.x = Math.sin(this.anim.waveTime * 0.5) * 0.3 * wave;
        } else {
            // Idle arm swing
            this.armPivot.rotation.z *= 0.9;
            this.armPivot.rotation.x = Math.sin(this.anim.bobPhase) * 0.05;
        }
    }
    
    /**
     * Update AI state based on player proximity and behavior
     */
    updateAIState(distance, deltaTime, playerPosition) {
        const prevState = this.state;
        
        if (distance > 15) {
            this.state = 'idle';
        } else if (distance > 8) {
            this.state = 'watching';
        } else if (distance > 4) {
            this.state = 'alert';
            // React to fast approach
            if (this.playerApproachSpeed > 8) {
                this.anim.surprise = 1;
                if (playerPosition) {
                    const away = new THREE.Vector3().subVectors(this.group.position, playerPosition);
                    away.y = 0;
                    if (away.lengthSq() > 0.001) {
                        away.normalize();
                        this.anim.surpriseOffset.copy(away.multiplyScalar(1.4));
                    }
                }
            }
        } else {
            this.state = 'greeting';
        }
        
        // Trigger surprise on state change to alert
        if (prevState !== 'alert' && this.state === 'alert') {
            this.anim.surprise = 0.5;
            if (playerPosition) {
                const away = new THREE.Vector3().subVectors(this.group.position, playerPosition);
                away.y = 0;
                if (away.lengthSq() > 0.001) {
                    away.normalize();
                    this.anim.surpriseOffset.copy(away.multiplyScalar(1.1));
                }
            }
        }
    }
    
    /**
     * Check if position is near this NPC
     */
    isNearby(position, threshold = 4) {
        return this.group.position.distanceTo(position) < threshold;
    }
}
