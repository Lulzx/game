import * as THREE from 'three';

function addEars(group, friendData) {
    const color = friendData.color;
    const emoji = friendData.emoji;
    
    if (emoji === '🐰') {
        // Bunny ears (long)
        const earGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.55, 10);
        const earMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
        
        const leftEar = new THREE.Mesh(earGeo, earMat);
        leftEar.position.set(-0.2, 2.45, 0);
        leftEar.rotation.z = 0.15;
        group.add(leftEar);
        
        const rightEar = new THREE.Mesh(earGeo, earMat);
        rightEar.position.set(0.2, 2.45, 0);
        rightEar.rotation.z = -0.15;
        group.add(rightEar);
        
        // Inner ear (pink)
        const innerGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.4, 8);
        const innerMat = new THREE.MeshStandardMaterial({ color: 0xFFB6C1 });
        
        const leftInner = new THREE.Mesh(innerGeo, innerMat);
        leftInner.position.set(-0.2, 2.45, 0.03);
        leftInner.rotation.z = 0.15;
        group.add(leftInner);
        
        const rightInner = new THREE.Mesh(innerGeo, innerMat);
        rightInner.position.set(0.2, 2.45, 0.03);
        rightInner.rotation.z = -0.15;
        group.add(rightInner);
    } else if (emoji === '🐻' || emoji === '🦊') {
        // Round ears
        const earGeo = new THREE.SphereGeometry(0.15, 12, 12);
        const earMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
        
        const leftEar = new THREE.Mesh(earGeo, earMat);
        leftEar.position.set(-0.28, 2.2, 0);
        group.add(leftEar);
        
        const rightEar = new THREE.Mesh(earGeo, earMat);
        rightEar.position.set(0.28, 2.2, 0);
        group.add(rightEar);
    } else if (emoji === '🦉') {
        // Owl tufts
        const tuftGeo = new THREE.ConeGeometry(0.1, 0.25, 8);
        const tuftMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
        
        const leftTuft = new THREE.Mesh(tuftGeo, tuftMat);
        leftTuft.position.set(-0.25, 2.3, 0);
        leftTuft.rotation.z = 0.3;
        group.add(leftTuft);
        
        const rightTuft = new THREE.Mesh(tuftGeo, tuftMat);
        rightTuft.position.set(0.25, 2.3, 0);
        rightTuft.rotation.z = -0.3;
        group.add(rightTuft);
    } else if (emoji === '🐤') {
        // Duck beak
        const beakGeo = new THREE.ConeGeometry(0.1, 0.25, 8);
        const beakMat = new THREE.MeshStandardMaterial({ color: 0xFFA500 });
        const beak = new THREE.Mesh(beakGeo, beakMat);
        beak.position.set(0, 1.7, 0.5);
        beak.rotation.x = Math.PI / 2;
        group.add(beak);
    }
}

/**
 * Builds the NPC model and returns useful part references.
 */
export function buildNPCModel(friendData) {
    const group = new THREE.Group();
    const color = friendData.color;
    
    // Body
    const bodyGeo = new THREE.CylinderGeometry(0.35, 0.45, 1.1, 12);
    const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.75;
    body.castShadow = true;
    group.add(body);
    
    // Head
    const headGeo = new THREE.SphereGeometry(0.45, 20, 20);
    const headMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.8;
    head.castShadow = true;
    group.add(head);
    
    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.1, 12, 12);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.16, 1.88, 0.36);
    group.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.16, 1.88, 0.36);
    group.add(rightEye);
    
    // Eye shine
    const shineGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const shineMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    
    const leftShine = new THREE.Mesh(shineGeo, shineMat);
    leftShine.position.set(-0.13, 1.92, 0.44);
    group.add(leftShine);
    
    const rightShine = new THREE.Mesh(shineGeo, shineMat);
    rightShine.position.set(0.19, 1.92, 0.44);
    group.add(rightShine);
    
    // Nose
    const noseGeo = new THREE.SphereGeometry(0.1, 10, 10);
    const noseMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0, 1.75, 0.4);
    group.add(nose);
    
    // Smile
    const smileGeo = new THREE.TorusGeometry(0.12, 0.025, 8, 12, Math.PI);
    const smileMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const smile = new THREE.Mesh(smileGeo, smileMat);
    smile.position.set(0, 1.65, 0.38);
    smile.rotation.x = Math.PI * 0.1;
    group.add(smile);
    
    addEars(group, friendData);
    
    // Arm for waving
    const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.45, 10);
    const armMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
    
    const armPivot = new THREE.Group();
    armPivot.position.set(0.45, 1.15, 0);
    
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.position.y = 0.2;
    arm.castShadow = true;
    armPivot.add(arm);
    group.add(armPivot);
    
    // Left arm (static)
    const leftArmPivot = new THREE.Group();
    leftArmPivot.position.set(-0.45, 1.15, 0);
    leftArmPivot.rotation.z = 0.3;
    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.y = -0.2;
    leftArmPivot.add(leftArm);
    group.add(leftArmPivot);
    
    return { group, body, head, armPivot };
}
