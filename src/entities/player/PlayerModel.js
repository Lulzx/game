import * as THREE from 'three';

/**
 * Builds the player mesh and returns the group with named parts for animation.
 */
export function buildPlayerModel() {
    const group = new THREE.Group();
    const parts = {};
    
    // Body (torso)
    const bodyGeo = new THREE.CylinderGeometry(0.35, 0.45, 1.0, 12);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x5DADE2, roughness: 0.6 });
    parts.body = new THREE.Mesh(bodyGeo, bodyMat);
    parts.body.position.y = 0.9;
    parts.body.castShadow = true;
    group.add(parts.body);
    
    // Head
    const headGeo = new THREE.SphereGeometry(0.4, 20, 20);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xFFDFC4, roughness: 0.8 });
    parts.head = new THREE.Mesh(headGeo, headMat);
    parts.head.position.y = 1.75;
    parts.head.castShadow = true;
    group.add(parts.head);
    
    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.08, 10, 10);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.14, 1.8, 0.32);
    group.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.14, 1.8, 0.32);
    group.add(rightEye);
    
    // Eye shine
    const shineGeo = new THREE.SphereGeometry(0.03, 8, 8);
    const shineMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const leftShine = new THREE.Mesh(shineGeo, shineMat);
    leftShine.position.set(-0.12, 1.83, 0.38);
    group.add(leftShine);
    
    const rightShine = new THREE.Mesh(shineGeo, shineMat);
    rightShine.position.set(0.16, 1.83, 0.38);
    group.add(rightShine);
    
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
    group.add(leftCheek);
    
    const rightCheek = new THREE.Mesh(cheekGeo, cheekMat);
    rightCheek.position.set(0.28, 1.68, 0.34);
    rightCheek.rotation.y = -0.4;
    group.add(rightCheek);
    
    // Hair
    const hairGeo = new THREE.SphereGeometry(0.45, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x4A3728, roughness: 0.9 });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 1.85;
    group.add(hair);
    
    // Arms (as separate objects for animation)
    const armGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.55, 10);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x5DADE2, roughness: 0.6 });
    
    // Left arm pivot
    const leftArmPivot = new THREE.Group();
    leftArmPivot.position.set(-0.5, 1.25, 0);
    parts.leftArm = new THREE.Mesh(armGeo, armMat);
    parts.leftArm.position.y = -0.25;
    parts.leftArm.castShadow = true;
    leftArmPivot.add(parts.leftArm);
    group.add(leftArmPivot);
    parts.leftArmPivot = leftArmPivot;
    
    // Right arm pivot
    const rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(0.5, 1.25, 0);
    parts.rightArm = new THREE.Mesh(armGeo, armMat);
    parts.rightArm.position.y = -0.25;
    parts.rightArm.castShadow = true;
    rightArmPivot.add(parts.rightArm);
    group.add(rightArmPivot);
    parts.rightArmPivot = rightArmPivot;
    
    // Legs (as separate objects for animation)
    const legGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.55, 10);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7 });
    
    // Left leg pivot
    const leftLegPivot = new THREE.Group();
    leftLegPivot.position.set(-0.18, 0.4, 0);
    parts.leftLeg = new THREE.Mesh(legGeo, legMat);
    parts.leftLeg.position.y = -0.2;
    parts.leftLeg.castShadow = true;
    leftLegPivot.add(parts.leftLeg);
    group.add(leftLegPivot);
    parts.leftLegPivot = leftLegPivot;
    
    // Right leg pivot
    const rightLegPivot = new THREE.Group();
    rightLegPivot.position.set(0.18, 0.4, 0);
    parts.rightLeg = new THREE.Mesh(legGeo, legMat);
    parts.rightLeg.position.y = -0.2;
    parts.rightLeg.castShadow = true;
    rightLegPivot.add(parts.rightLeg);
    group.add(rightLegPivot);
    parts.rightLegPivot = rightLegPivot;
    
    // Feet
    const footGeo = new THREE.BoxGeometry(0.16, 0.08, 0.25);
    const footMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8 });
    
    const leftFoot = new THREE.Mesh(footGeo, footMat);
    leftFoot.position.set(0, -0.5, 0.05);
    parts.leftLegPivot.add(leftFoot);
    
    const rightFoot = new THREE.Mesh(footGeo, footMat);
    rightFoot.position.set(0, -0.5, 0.05);
    parts.rightLegPivot.add(rightFoot);
    
    return { group, parts };
}
