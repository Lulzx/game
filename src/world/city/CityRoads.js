import * as THREE from 'three';

export function generateRoads(city) {
    const roadMat = new THREE.MeshStandardMaterial({ 
        color: 0x333333, 
        roughness: 0.9 
    });
    
    for (let i = -4; i <= 4; i++) {
        const nsRoad = new THREE.Mesh(
            new THREE.PlaneGeometry(city.roadWidth, city.cityRadius * 2),
            roadMat
        );
        nsRoad.rotation.x = -Math.PI / 2;
        nsRoad.position.set(i * city.blockSize, 0.05, 0);
        nsRoad.receiveShadow = true;
        city.scene.add(nsRoad);
        
        const ewRoad = new THREE.Mesh(
            new THREE.PlaneGeometry(city.cityRadius * 2, city.roadWidth),
            roadMat
        );
        ewRoad.rotation.x = -Math.PI / 2;
        ewRoad.position.set(0, 0.05, i * city.blockSize);
        ewRoad.receiveShadow = true;
        city.scene.add(ewRoad);
    }
    
    const markingMat = new THREE.MeshStandardMaterial({ color: 0xFFFF00 });
    for (let i = -4; i <= 4; i++) {
        for (let j = -20; j <= 20; j += 3) {
            const marking = new THREE.Mesh(
                new THREE.PlaneGeometry(0.3, 2),
                markingMat
            );
            marking.rotation.x = -Math.PI / 2;
            marking.position.set(i * city.blockSize, 0.06, j * 5);
            city.scene.add(marking);
        }
    }
}
