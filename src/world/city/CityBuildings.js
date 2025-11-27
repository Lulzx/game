import * as THREE from 'three';

export function generateBuildings(city) {
    const buildingColors = [
        0x8899AA, 0x667788, 0x556677, 0x778899,
        0x99AABB, 0xAABBCC, 0x445566, 0x6688AA
    ];
    
    for (let bx = -3; bx <= 3; bx++) {
        for (let bz = -3; bz <= 3; bz++) {
            if (Math.random() < 0.15) continue;
            
            const blockX = bx * city.blockSize;
            const blockZ = bz * city.blockSize;
            
            const distFromCenter = Math.sqrt(blockX * blockX + blockZ * blockZ);
            const heightFactor = Math.max(0.3, 1 - distFromCenter / 100);
            
            const numBuildings = 1 + Math.floor(Math.random() * 3);
            
            for (let i = 0; i < numBuildings; i++) {
                const offsetX = (Math.random() - 0.5) * (city.blockSize - city.roadWidth - 4);
                const offsetZ = (Math.random() - 0.5) * (city.blockSize - city.roadWidth - 4);
                
                const width = 4 + Math.random() * 6;
                const depth = 4 + Math.random() * 6;
                const height = (5 + Math.random() * 25) * heightFactor;
                
                createBuilding(
                    city,
                    blockX + offsetX,
                    blockZ + offsetZ,
                    width, height, depth,
                    buildingColors[Math.floor(Math.random() * buildingColors.length)]
                );
            }
        }
    }
}

function createBuilding(city, x, z, width, height, depth, color) {
    const building = new THREE.Group();
    
    const bodyGeo = new THREE.BoxGeometry(width, height, depth);
    const bodyMat = new THREE.MeshStandardMaterial({ 
        color, 
        roughness: 0.7,
        metalness: 0.1
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = height / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    building.add(body);
    
    const windowMat = new THREE.MeshStandardMaterial({
        color: 0x88CCFF,
        emissive: 0x224466,
        emissiveIntensity: 0.3,
        roughness: 0.1,
        metalness: 0.8
    });
    
    const windowRows = Math.floor(height / 3);
    const windowCols = Math.floor(width / 2);
    
    for (let row = 0; row < windowRows; row++) {
        for (let col = 0; col < windowCols; col++) {
            const frontWindow = new THREE.Mesh(
                new THREE.PlaneGeometry(1.2, 1.5),
                windowMat
            );
            frontWindow.position.set(
                (col - windowCols / 2 + 0.5) * 2,
                2 + row * 3,
                depth / 2 + 0.01
            );
            building.add(frontWindow);
            
            const backWindow = frontWindow.clone();
            backWindow.position.z = -depth / 2 - 0.01;
            backWindow.rotation.y = Math.PI;
            building.add(backWindow);
        }
    }
    
    if (height > 15 && Math.random() > 0.5) {
        const roofDetail = new THREE.Mesh(
            new THREE.BoxGeometry(width * 0.3, 2, depth * 0.3),
            new THREE.MeshStandardMaterial({ color: 0x444444 })
        );
        roofDetail.position.y = height + 1;
        roofDetail.castShadow = true;
        building.add(roofDetail);
    }
    
    building.position.set(x, 0, z);
    city.scene.add(building);
    city.buildings.push(building);
    
    return building;
}
