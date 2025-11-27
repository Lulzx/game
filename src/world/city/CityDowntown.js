import * as THREE from 'three';

export function generateDowntown(city) {
    const skyscraperPositions = [
        { x: 0, z: -30, h: 45 },
        { x: -15, z: -25, h: 35 },
        { x: 15, z: -35, h: 40 },
        { x: -25, z: -40, h: 30 },
        { x: 25, z: -20, h: 38 }
    ];
    
    skyscraperPositions.forEach(pos => {
        createSkyscraper(city, pos.x, pos.z, pos.h);
    });
    
    const plaza = new THREE.Mesh(
        new THREE.CircleGeometry(15, 32),
        new THREE.MeshStandardMaterial({ color: 0xCCCCCC, roughness: 0.8 })
    );
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.set(0, 0.05, -30);
    city.scene.add(plaza);
    
    for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const radius = 8 + Math.random() * 3;
        createPalmTree(city.scene, Math.cos(angle) * radius, -30 + Math.sin(angle) * radius);
    }
}

function createSkyscraper(city, x, z, height) {
    const building = new THREE.Group();
    
    const width = 8 + Math.random() * 4;
    const depth = 8 + Math.random() * 4;
    
    const glassMat = new THREE.MeshStandardMaterial({
        color: 0x4488AA,
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.85
    });
    
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        glassMat
    );
    body.position.y = height / 2;
    body.castShadow = true;
    building.add(body);
    
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    
    for (let i = 0; i < 4; i++) {
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, height, 0.3),
            frameMat
        );
        const angle = (i / 4) * Math.PI * 2;
        frame.position.set(
            Math.cos(angle) * width * 0.45,
            height / 2,
            Math.sin(angle) * depth * 0.45
        );
        building.add(frame);
    }
    
    for (let floor = 0; floor < height; floor += 4) {
        const hFrame = new THREE.Mesh(
            new THREE.BoxGeometry(width + 0.2, 0.2, depth + 0.2),
            frameMat
        );
        hFrame.position.y = floor;
        building.add(hFrame);
    }
    
    const antenna = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.2, 8),
        frameMat
    );
    antenna.position.y = height + 4;
    building.add(antenna);
    
    const lightMat = new THREE.MeshStandardMaterial({
        color: 0xFF0000,
        emissive: 0xFF0000,
        emissiveIntensity: 1
    });
    const light = new THREE.Mesh(
        new THREE.SphereGeometry(0.3),
        lightMat
    );
    light.position.y = height + 8;
    building.add(light);
    
    building.position.set(x, 0, z);
    city.scene.add(building);
    city.buildings.push(building);
}

function createPalmTree(scene, x, z) {
    const tree = new THREE.Group();
    
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.5, 8),
        new THREE.MeshStandardMaterial({ color: 0x8B5A2B })
    );
    trunk.position.y = 4;
    trunk.castShadow = true;
    tree.add(trunk);
    
    const leaves = new THREE.Mesh(
        new THREE.SphereGeometry(2.5, 6, 6),
        new THREE.MeshStandardMaterial({ color: 0x2E8B57 })
    );
    leaves.position.y = 8;
    tree.add(leaves);
    
    tree.position.set(x, 0, z);
    scene.add(tree);
}
