import * as THREE from 'three';

export function createControlTower(airport, x, z) {
    const tower = new THREE.Group();
    
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(3, 4, 25),
        new THREE.MeshStandardMaterial({ color: 0xCCCCCC })
    );
    base.position.y = 12.5;
    base.castShadow = true;
    tower.add(base);
    
    const deck = new THREE.Mesh(
        new THREE.CylinderGeometry(6, 5, 4, 16),
        new THREE.MeshStandardMaterial({
            color: 0x225588,
            transparent: true,
            opacity: 0.7,
            metalness: 0.5
        })
    );
    deck.position.y = 27;
    tower.add(deck);
    
    const roof = new THREE.Mesh(
        new THREE.ConeGeometry(6.5, 2, 16),
        new THREE.MeshStandardMaterial({ color: 0x444444 })
    );
    roof.position.y = 30;
    tower.add(roof);
    
    const antenna = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.2, 8),
        new THREE.MeshStandardMaterial({ color: 0xFF0000 })
    );
    antenna.position.y = 35;
    tower.add(antenna);
    
    tower.position.set(x, 0, z);
    airport.scene.add(tower);
    airport.trackCollider(tower);
}
