import * as THREE from 'three';

export function createHangars(airport, x, z) {
    for (let i = 0; i < 3; i++) {
        const hangar = new THREE.Group();
        
        const hangarGeo = new THREE.CylinderGeometry(15, 15, 30, 16, 1, false, 0, Math.PI);
        const hangarMesh = new THREE.Mesh(
            hangarGeo,
            new THREE.MeshStandardMaterial({ color: 0x888888 })
        );
        hangarMesh.rotation.z = Math.PI / 2;
        hangarMesh.rotation.y = Math.PI / 2;
        hangarMesh.position.y = 0;
        hangarMesh.castShadow = true;
        hangar.add(hangarMesh);
        
        const wall = new THREE.Mesh(
            new THREE.PlaneGeometry(30, 15),
            new THREE.MeshStandardMaterial({ color: 0x666666 })
        );
        wall.position.set(0, 7.5, 15);
        hangar.add(wall);
        
        const door = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 12),
            new THREE.MeshStandardMaterial({ color: 0x444444 })
        );
        door.position.set(0, 6, 15.1);
        hangar.add(door);
        
        hangar.position.set(x + i * 35, 0, z);
        airport.scene.add(hangar);
        airport.trackCollider(hangar);
    }
}
