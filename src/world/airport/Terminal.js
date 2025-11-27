import * as THREE from 'three';

export function createTerminal(airport, x, z) {
    const terminal = new THREE.Group();
    
    const mainBuilding = new THREE.Mesh(
        new THREE.BoxGeometry(60, 12, 25),
        new THREE.MeshStandardMaterial({ color: 0xDDDDDD })
    );
    mainBuilding.position.y = 6;
    mainBuilding.castShadow = true;
    terminal.add(mainBuilding);
    
    const glassMat = new THREE.MeshStandardMaterial({
        color: 0x88CCEE,
        transparent: true,
        opacity: 0.6,
        roughness: 0.1,
        metalness: 0.8
    });
    
    const glassFront = new THREE.Mesh(
        new THREE.PlaneGeometry(58, 10),
        glassMat
    );
    glassFront.position.set(0, 6, 12.6);
    terminal.add(glassFront);
    
    const towerBase = new THREE.Mesh(
        new THREE.CylinderGeometry(4, 5, 20),
        new THREE.MeshStandardMaterial({ color: 0xCCCCCC })
    );
    towerBase.position.set(25, 10, 0);
    towerBase.castShadow = true;
    terminal.add(towerBase);
    
    const towerTop = new THREE.Mesh(
        new THREE.CylinderGeometry(5, 4, 5, 16),
        glassMat
    );
    towerTop.position.set(25, 22.5, 0);
    terminal.add(towerTop);
    
    const roof = new THREE.Mesh(
        new THREE.BoxGeometry(62, 1, 27),
        new THREE.MeshStandardMaterial({ color: 0x666666 })
    );
    roof.position.y = 12.5;
    terminal.add(roof);
    
    for (let i = -20; i <= 20; i += 20) {
        const bridge = new THREE.Mesh(
            new THREE.BoxGeometry(4, 3, 15),
            new THREE.MeshStandardMaterial({ color: 0xAAAAAA })
        );
        bridge.position.set(i, 3, -17);
        terminal.add(bridge);
    }
    
    terminal.position.set(x, 0, z);
    airport.scene.add(terminal);
    airport.trackCollider(terminal);
}
