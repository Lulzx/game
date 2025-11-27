import * as THREE from 'three';

export function createStreetLights(scene) {
    const lightPositions = [];
    
    // Lights along roads
    for (let i = -100; i <= 100; i += 25) {
        lightPositions.push({ x: i, z: 4 });
        lightPositions.push({ x: i, z: -4 });
        lightPositions.push({ x: 4, z: i });
        lightPositions.push({ x: -4, z: i });
    }
    
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const lightMat = new THREE.MeshStandardMaterial({
        color: 0xFFDD88,
        emissive: 0xFFAA44,
        emissiveIntensity: 0.5
    });
    
    lightPositions.forEach(pos => {
        const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.15, 6),
            poleMat
        );
        pole.position.set(pos.x, 3, pos.z);
        pole.castShadow = true;
        scene.add(pole);
        
        const head = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.3, 0.5),
            poleMat
        );
        head.position.set(pos.x, 6.2, pos.z);
        scene.add(head);
        
        const bulb = new THREE.Mesh(
            new THREE.SphereGeometry(0.2),
            lightMat
        );
        bulb.position.set(pos.x, 6, pos.z);
        scene.add(bulb);
    });
}
