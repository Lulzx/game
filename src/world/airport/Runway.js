import * as THREE from 'three';

export function createRunway(airport, x, z) {
    const runwayGeo = new THREE.PlaneGeometry(30, 200);
    const runwayMat = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.9
    });
    
    const runway = new THREE.Mesh(runwayGeo, runwayMat);
    runway.rotation.x = -Math.PI / 2;
    runway.position.set(x, 0.05, z);
    runway.receiveShadow = true;
    airport.scene.add(runway);
    airport.trackCollider(runway);
    
    const lineMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    for (let i = -90; i <= 90; i += 8) {
        const centerLine = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 5),
            lineMat
        );
        centerLine.rotation.x = -Math.PI / 2;
        centerLine.position.set(x, 0.06, z + i);
        airport.scene.add(centerLine);
    }
    
    createThresholdMarking(airport, x, z - 95);
    createThresholdMarking(airport, x, z + 95);
    
    createRunwayNumber(airport, x, z - 85, '09');
    createRunwayNumber(airport, x, z + 85, '27');
    
    for (let i = -95; i <= 95; i += 10) {
        createRunwayLight(airport, x - 14, z + i, 0xFFFFFF);
        createRunwayLight(airport, x + 14, z + i, 0xFFFFFF);
    }
    
    for (let i = 1; i <= 5; i++) {
        createRunwayLight(airport, x, z - 95 - i * 10, 0xFF0000);
        createRunwayLight(airport, x, z + 95 + i * 10, 0xFF0000);
    }
}

function createThresholdMarking(airport, x, z) {
    const markMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    for (let i = -5; i <= 5; i += 2) {
        const mark = new THREE.Mesh(
            new THREE.PlaneGeometry(1.5, 15),
            markMat
        );
        mark.rotation.x = -Math.PI / 2;
        mark.position.set(x + i * 2, 0.06, z);
        airport.scene.add(mark);
    }
}

function createRunwayNumber(airport, x, z, number) {
    const marker = new THREE.Mesh(
        new THREE.PlaneGeometry(8, 12),
        new THREE.MeshStandardMaterial({ color: 0xCCCCCC })
    );
    marker.rotation.x = -Math.PI / 2;
    marker.position.set(x, 0.06, z);
    airport.scene.add(marker);
}

function createRunwayLight(airport, x, z, color) {
    const light = new THREE.Mesh(
        new THREE.SphereGeometry(0.3),
        new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 0.8
        })
    );
    light.position.set(x, 0.3, z);
    airport.scene.add(light);
}
