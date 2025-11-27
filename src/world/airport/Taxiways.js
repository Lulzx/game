import * as THREE from 'three';

export function createTaxiways(airport, baseX, baseZ) {
    const taxiwayMat = new THREE.MeshStandardMaterial({
        color: 0x444444,
        roughness: 0.85
    });
    
    const mainTaxi = new THREE.Mesh(
        new THREE.PlaneGeometry(12, 150),
        taxiwayMat
    );
    mainTaxi.rotation.x = -Math.PI / 2;
    mainTaxi.position.set(baseX + 25, 0.04, baseZ);
    mainTaxi.receiveShadow = true;
    airport.scene.add(mainTaxi);
    
    [-50, 0, 50].forEach(zOffset => {
        const crossTaxi = new THREE.Mesh(
            new THREE.PlaneGeometry(30, 10),
            taxiwayMat
        );
        crossTaxi.rotation.x = -Math.PI / 2;
        crossTaxi.position.set(baseX + 12, 0.04, baseZ + zOffset);
        crossTaxi.receiveShadow = true;
        airport.scene.add(crossTaxi);
    });
    
    const lineMat = new THREE.MeshStandardMaterial({ color: 0xFFCC00 });
    for (let z = -70; z <= 70; z += 5) {
        const line = new THREE.Mesh(
            new THREE.PlaneGeometry(0.3, 3),
            lineMat
        );
        line.rotation.x = -Math.PI / 2;
        line.position.set(baseX + 25, 0.05, baseZ + z);
        airport.scene.add(line);
    }
}
