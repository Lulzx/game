import * as THREE from 'three';

export function createAircraft(airport, baseX, baseZ) {
    trackAircraft(airport, createJet(airport, baseX + 30, baseZ - 17, Math.PI / 2));
    trackAircraft(airport, createJet(airport, baseX + 50, baseZ - 17, Math.PI / 2));
    trackAircraft(airport, createJet(airport, baseX + 70, baseZ - 17, Math.PI / 2));
    
    trackAircraft(airport, createJet(airport, baseX + 10, baseZ + 50, 0));
    
    trackAircraft(airport, createHelicopter(airport, baseX + 60, baseZ + 80));
}

function createJet(airport, x, z, rotation = 0) {
    const jet = new THREE.Group();
    
    const fuselage = new THREE.Mesh(
        new THREE.CylinderGeometry(2, 2, 25, 12),
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF })
    );
    fuselage.rotation.x = Math.PI / 2;
    fuselage.position.y = 2.5;
    fuselage.castShadow = true;
    jet.add(fuselage);
    
    const nose = new THREE.Mesh(
        new THREE.ConeGeometry(2, 4, 12),
        new THREE.MeshStandardMaterial({ color: 0xDDDDDD })
    );
    nose.rotation.x = -Math.PI / 2;
    nose.position.set(0, 2.5, 14.5);
    jet.add(nose);
    
    const cockpit = new THREE.Mesh(
        new THREE.SphereGeometry(1.8, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ 
            color: 0x113355,
            roughness: 0.1
        })
    );
    cockpit.position.set(0, 3.5, 10);
    cockpit.rotation.x = -0.3;
    jet.add(cockpit);
    
    const wingGeo = new THREE.BoxGeometry(22, 0.3, 5);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0xEEEEEE });
    const wings = new THREE.Mesh(wingGeo, wingMat);
    wings.position.set(0, 2, -2);
    wings.castShadow = true;
    jet.add(wings);
    
    const tailV = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 5, 4),
        wingMat
    );
    tailV.position.set(0, 5.5, -11);
    jet.add(tailV);
    
    const tailH = new THREE.Mesh(
        new THREE.BoxGeometry(8, 0.3, 3),
        wingMat
    );
    tailH.position.set(0, 7.5, -11);
    jet.add(tailH);
    
    const engineGeo = new THREE.CylinderGeometry(0.8, 1, 4, 12);
    const engineMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
    
    const leftEngine = new THREE.Mesh(engineGeo, engineMat);
    leftEngine.rotation.x = Math.PI / 2;
    leftEngine.position.set(-5, 1.5, -1);
    jet.add(leftEngine);
    
    const rightEngine = new THREE.Mesh(engineGeo, engineMat);
    rightEngine.rotation.x = Math.PI / 2;
    rightEngine.position.set(5, 1.5, -1);
    jet.add(rightEngine);
    
    const gearMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    const noseGear = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 2),
        gearMat
    );
    noseGear.position.set(0, 1, 8);
    jet.add(noseGear);
    
    const noseWheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 0.3, 12),
        gearMat
    );
    noseWheel.rotation.z = Math.PI / 2;
    noseWheel.position.set(0, 0.4, 8);
    jet.add(noseWheel);
    
    [-3, 3].forEach(xOff => {
        const mainGear = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.2, 2.5),
            gearMat
        );
        mainGear.position.set(xOff, 1.25, -2);
        jet.add(mainGear);
        
        const mainWheel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.5, 0.4, 12),
            gearMat
        );
        mainWheel.rotation.z = Math.PI / 2;
        mainWheel.position.set(xOff, 0.5, -2);
        jet.add(mainWheel);
    });
    
    jet.rotation.y = rotation;
    jet.position.set(x, 0, z);
    airport.scene.add(jet);
    return jet;
}

function createHelicopter(airport, x, z) {
    const heli = new THREE.Group();
    
    const body = new THREE.Mesh(
        new THREE.SphereGeometry(2, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0x2244AA })
    );
    body.scale.set(1.5, 0.8, 2);
    body.position.y = 2;
    body.castShadow = true;
    heli.add(body);
    
    const tail = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.5, 5),
        new THREE.MeshStandardMaterial({ color: 0x2244AA })
    );
    tail.rotation.x = Math.PI / 2;
    tail.position.set(0, 2.2, -4);
    heli.add(tail);
    
    const tailRotor = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 2, 0.3),
        new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    tailRotor.position.set(0.3, 2.2, -6.5);
    heli.add(tailRotor);
    
    const mast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 1),
        new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    mast.position.y = 3;
    heli.add(mast);
    
    const blade = new THREE.Mesh(
        new THREE.BoxGeometry(12, 0.1, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    blade.position.y = 3.5;
    heli.add(blade);
    
    const blade2 = blade.clone();
    blade2.rotation.y = Math.PI / 2;
    heli.add(blade2);
    
    const skidMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    [-1, 1].forEach(side => {
        const skid = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.1, 4),
            skidMat
        );
        skid.rotation.x = Math.PI / 2;
        skid.position.set(side * 1.5, 0.5, 0);
        heli.add(skid);
    });
    
    const glass = new THREE.Mesh(
        new THREE.SphereGeometry(1.3, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({
            color: 0x113355,
            transparent: true,
            opacity: 0.6
        })
    );
    glass.position.set(0, 2, 1.5);
    glass.rotation.x = -0.5;
    heli.add(glass);
    
    heli.position.set(x, 0, z);
    airport.scene.add(heli);
    return heli;
}

function trackAircraft(airport, aircraft) {
    if (!aircraft) return;
    airport.aircraft.push(aircraft);
    airport.trackCollider(aircraft);
}
