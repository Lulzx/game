import * as THREE from 'three';

export function generateLandmarks(city) {
    createGasStation(city, 60, 30);
    createParkingLot(city, -50, 40);
    createPark(city, 40, -60);
}

function createGasStation(city, x, z) {
    const station = new THREE.Group();
    
    const canopy = new THREE.Mesh(
        new THREE.BoxGeometry(20, 0.5, 12),
        new THREE.MeshStandardMaterial({ color: 0x2f3336, metalness: 0.2, roughness: 0.65 })
    );
    canopy.position.y = 5;
    canopy.castShadow = true;
    station.add(canopy);
    
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x777777, metalness: 0.3, roughness: 0.7 });
    [[-8, -4], [-8, 4], [8, -4], [8, 4]].forEach(([px, pz]) => {
        const pillar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.4, 0.4, 5),
            pillarMat
        );
        pillar.position.set(px, 2.5, pz);
        station.add(pillar);
    });
    
    const pumpMat = new THREE.MeshStandardMaterial({ color: 0xc7c7c7, metalness: 0.25, roughness: 0.6 });
    [-3, 0, 3].forEach(px => {
        const pump = new THREE.Mesh(
            new THREE.BoxGeometry(1, 2.5, 0.8),
            pumpMat
        );
        pump.position.set(px, 1.25, 0);
        station.add(pump);
    });
    
    const store = new THREE.Mesh(
        new THREE.BoxGeometry(10, 4, 8),
        new THREE.MeshStandardMaterial({ color: 0xb1b1b1, roughness: 0.65 })
    );
    store.position.set(0, 2, -10);
    store.castShadow = true;
    station.add(store);
    
    station.position.set(x, 0, z);
    city.scene.add(station);
}

function createParkingLot(city, x, z) {
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 25),
        new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.9 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(x, 0.02, z);
    ground.receiveShadow = true;
    city.scene.add(ground);
    
    const lineMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    for (let i = -4; i <= 4; i++) {
        const line = new THREE.Mesh(
            new THREE.PlaneGeometry(0.2, 5),
            lineMat
        );
        line.rotation.x = -Math.PI / 2;
        line.position.set(x + i * 3, 0.03, z);
        city.scene.add(line);
    }
}

function createPark(city, x, z) {
    const grass = new THREE.Mesh(
        new THREE.CircleGeometry(20, 32),
        new THREE.MeshStandardMaterial({ color: 0x33543b, roughness: 0.95 })
    );
    grass.rotation.x = -Math.PI / 2;
    grass.position.set(x, 0.02, z);
    grass.receiveShadow = true;
    city.scene.add(grass);
    
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const dist = 10 + Math.random() * 8;
        createTree(city, x + Math.cos(angle) * dist, z + Math.sin(angle) * dist);
    }
    
    createFountain(city, x, z);
}

function createTree(city, x, z) {
    const tree = new THREE.Group();
    
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.5, 3),
        new THREE.MeshStandardMaterial({ color: 0x4A3728, roughness: 0.92 })
    );
    trunk.position.y = 1.5;
    trunk.castShadow = true;
    tree.add(trunk);
    
    const foliage = new THREE.Mesh(
        new THREE.SphereGeometry(2.5, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x1f3a29, roughness: 0.88 })
    );
    foliage.position.y = 4.5;
    foliage.castShadow = true;
    tree.add(foliage);
    
    tree.position.set(x, 0, z);
    city.scene.add(tree);
}

function createFountain(city, x, z) {
    const fountain = new THREE.Group();
    
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(4, 4.5, 1),
        new THREE.MeshStandardMaterial({ color: 0x7a7a7a, roughness: 0.7 })
    );
    base.position.y = 0.5;
    fountain.add(base);
    
    const water = new THREE.Mesh(
        new THREE.CylinderGeometry(3.5, 3.5, 0.3),
        new THREE.MeshStandardMaterial({ 
            color: 0x2d6b8c, 
            transparent: true, 
            opacity: 0.7 
        })
    );
    water.position.y = 1.1;
    fountain.add(water);
    
    const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.6, 3),
        new THREE.MeshStandardMaterial({ color: 0x888888 })
    );
    pillar.position.y = 2.5;
    fountain.add(pillar);
    
    fountain.position.set(x, 0, z);
    city.scene.add(fountain);
}
