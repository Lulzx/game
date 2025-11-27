import * as THREE from 'three';

/**
 * Airport with runway, terminal, and aircraft
 */
export class Airport {
    constructor(scene) {
        this.scene = scene;
        this.aircraft = [];
        this.collisionMeshes = [];
    }
    
    /**
     * Generate the airport
     */
    generate() {
        // Position airport in the northwest
        const baseX = -200;
        const baseZ = -200;
        
        this.createRunway(baseX, baseZ);
        this.createTerminal(baseX + 50, baseZ);
        this.createControlTower(baseX + 80, baseZ - 30);
        this.createHangars(baseX + 30, baseZ + 60);
        this.createAircraft(baseX, baseZ);
        this.createTaxiways(baseX, baseZ);
    }
    
    /**
     * Create main runway
     */
    createRunway(x, z) {
        // Runway surface
        const runwayGeo = new THREE.PlaneGeometry(30, 200);
        const runwayMat = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.9
        });
        
        const runway = new THREE.Mesh(runwayGeo, runwayMat);
        runway.rotation.x = -Math.PI / 2;
        runway.position.set(x, 0.05, z);
        runway.receiveShadow = true;
        this.scene.add(runway);
        this.trackCollider(runway);
        
        // Center line
        const lineMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
        for (let i = -90; i <= 90; i += 8) {
            const centerLine = new THREE.Mesh(
                new THREE.PlaneGeometry(1, 5),
                lineMat
            );
            centerLine.rotation.x = -Math.PI / 2;
            centerLine.position.set(x, 0.06, z + i);
            this.scene.add(centerLine);
        }
        
        // Threshold markings
        this.createThresholdMarking(x, z - 95);
        this.createThresholdMarking(x, z + 95);
        
        // Runway numbers
        this.createRunwayNumber(x, z - 85, '09');
        this.createRunwayNumber(x, z + 85, '27');
        
        // Edge lights
        for (let i = -95; i <= 95; i += 10) {
            this.createRunwayLight(x - 14, z + i, 0xFFFFFF);
            this.createRunwayLight(x + 14, z + i, 0xFFFFFF);
        }
        
        // Approach lights
        for (let i = 1; i <= 5; i++) {
            this.createRunwayLight(x, z - 95 - i * 10, 0xFF0000);
            this.createRunwayLight(x, z + 95 + i * 10, 0xFF0000);
        }
    }
    
    createThresholdMarking(x, z) {
        const markMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
        for (let i = -5; i <= 5; i += 2) {
            const mark = new THREE.Mesh(
                new THREE.PlaneGeometry(1.5, 15),
                markMat
            );
            mark.rotation.x = -Math.PI / 2;
            mark.position.set(x + i * 2, 0.06, z);
            this.scene.add(mark);
        }
    }
    
    createRunwayNumber(x, z, number) {
        // Simplified - just a marker
        const marker = new THREE.Mesh(
            new THREE.PlaneGeometry(8, 12),
            new THREE.MeshStandardMaterial({ color: 0xCCCCCC })
        );
        marker.rotation.x = -Math.PI / 2;
        marker.position.set(x, 0.06, z);
        this.scene.add(marker);
    }
    
    createRunwayLight(x, z, color) {
        const light = new THREE.Mesh(
            new THREE.SphereGeometry(0.3),
            new THREE.MeshStandardMaterial({
                color,
                emissive: color,
                emissiveIntensity: 0.8
            })
        );
        light.position.set(x, 0.3, z);
        this.scene.add(light);
    }
    
    /**
     * Create terminal building
     */
    createTerminal(x, z) {
        const terminal = new THREE.Group();
        
        // Main building
        const mainBuilding = new THREE.Mesh(
            new THREE.BoxGeometry(60, 12, 25),
            new THREE.MeshStandardMaterial({ color: 0xDDDDDD })
        );
        mainBuilding.position.y = 6;
        mainBuilding.castShadow = true;
        terminal.add(mainBuilding);
        
        // Glass facade
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
        
        // Control tower extension
        const towerBase = new THREE.Mesh(
            new THREE.CylinderGeometry(4, 5, 20),
            new THREE.MeshStandardMaterial({ color: 0xCCCCCC })
        );
        towerBase.position.set(25, 10, 0);
        towerBase.castShadow = true;
        terminal.add(towerBase);
        
        // Tower top (glass)
        const towerTop = new THREE.Mesh(
            new THREE.CylinderGeometry(5, 4, 5, 16),
            glassMat
        );
        towerTop.position.set(25, 22.5, 0);
        terminal.add(towerTop);
        
        // Roof
        const roof = new THREE.Mesh(
            new THREE.BoxGeometry(62, 1, 27),
            new THREE.MeshStandardMaterial({ color: 0x666666 })
        );
        roof.position.y = 12.5;
        terminal.add(roof);
        
        // Jet bridges
        for (let i = -20; i <= 20; i += 20) {
            const bridge = new THREE.Mesh(
                new THREE.BoxGeometry(4, 3, 15),
                new THREE.MeshStandardMaterial({ color: 0xAAAAAA })
            );
            bridge.position.set(i, 3, -17);
            terminal.add(bridge);
        }
        
        terminal.position.set(x, 0, z);
        this.scene.add(terminal);
        this.trackCollider(terminal);
    }
    
    /**
     * Create control tower
     */
    createControlTower(x, z) {
        const tower = new THREE.Group();
        
        // Base
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(3, 4, 25),
            new THREE.MeshStandardMaterial({ color: 0xCCCCCC })
        );
        base.position.y = 12.5;
        base.castShadow = true;
        tower.add(base);
        
        // Observation deck
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
        
        // Roof
        const roof = new THREE.Mesh(
            new THREE.ConeGeometry(6.5, 2, 16),
            new THREE.MeshStandardMaterial({ color: 0x444444 })
        );
        roof.position.y = 30;
        tower.add(roof);
        
        // Antenna
        const antenna = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.2, 8),
            new THREE.MeshStandardMaterial({ color: 0xFF0000 })
        );
        antenna.position.y = 35;
        tower.add(antenna);
        
        tower.position.set(x, 0, z);
        this.scene.add(tower);
        this.trackCollider(tower);
    }
    
    /**
     * Create hangars
     */
    createHangars(x, z) {
        for (let i = 0; i < 3; i++) {
            const hangar = new THREE.Group();
            
            // Curved roof hangar
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
            
            // Front wall with door
            const wall = new THREE.Mesh(
                new THREE.PlaneGeometry(30, 15),
                new THREE.MeshStandardMaterial({ color: 0x666666 })
            );
            wall.position.set(0, 7.5, 15);
            hangar.add(wall);
            
            // Door (darker)
            const door = new THREE.Mesh(
                new THREE.PlaneGeometry(20, 12),
                new THREE.MeshStandardMaterial({ color: 0x444444 })
            );
            door.position.set(0, 6, 15.1);
            hangar.add(door);
            
            hangar.position.set(x + i * 35, 0, z);
            this.scene.add(hangar);
            this.trackCollider(hangar);
        }
    }
    
    /**
     * Create aircraft
     */
    createAircraft(baseX, baseZ) {
        // Parked aircraft at gates
        this.trackAircraft(this.createJet(baseX + 30, baseZ - 17, Math.PI / 2));
        this.trackAircraft(this.createJet(baseX + 50, baseZ - 17, Math.PI / 2));
        this.trackAircraft(this.createJet(baseX + 70, baseZ - 17, Math.PI / 2));
        
        // Aircraft on taxiway
        this.trackAircraft(this.createJet(baseX + 10, baseZ + 50, 0));
        
        // Helicopter near hangars
        this.trackAircraft(this.createHelicopter(baseX + 60, baseZ + 80));
    }
    
    createJet(x, z, rotation = 0) {
        const jet = new THREE.Group();
        
        // Fuselage
        const fuselage = new THREE.Mesh(
            new THREE.CylinderGeometry(2, 2, 25, 12),
            new THREE.MeshStandardMaterial({ color: 0xFFFFFF })
        );
        fuselage.rotation.x = Math.PI / 2;
        fuselage.position.y = 2.5;
        fuselage.castShadow = true;
        jet.add(fuselage);
        
        // Nose cone
        const nose = new THREE.Mesh(
            new THREE.ConeGeometry(2, 4, 12),
            new THREE.MeshStandardMaterial({ color: 0xDDDDDD })
        );
        nose.rotation.x = -Math.PI / 2;
        nose.position.set(0, 2.5, 14.5);
        jet.add(nose);
        
        // Cockpit windows
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
        
        // Wings
        const wingGeo = new THREE.BoxGeometry(22, 0.3, 5);
        const wingMat = new THREE.MeshStandardMaterial({ color: 0xEEEEEE });
        const wings = new THREE.Mesh(wingGeo, wingMat);
        wings.position.set(0, 2, -2);
        wings.castShadow = true;
        jet.add(wings);
        
        // Tail
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
        
        // Engines
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
        
        // Landing gear
        const gearMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        
        // Nose gear
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
        
        // Main gear
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
        this.scene.add(jet);
        return jet;
    }
    
    createHelicopter(x, z) {
        const heli = new THREE.Group();
        
        // Body
        const body = new THREE.Mesh(
            new THREE.SphereGeometry(2, 12, 12),
            new THREE.MeshStandardMaterial({ color: 0x2244AA })
        );
        body.scale.set(1.5, 0.8, 2);
        body.position.y = 2;
        body.castShadow = true;
        heli.add(body);
        
        // Tail boom
        const tail = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.5, 5),
            new THREE.MeshStandardMaterial({ color: 0x2244AA })
        );
        tail.rotation.x = Math.PI / 2;
        tail.position.set(0, 2.2, -4);
        heli.add(tail);
        
        // Tail rotor
        const tailRotor = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 2, 0.3),
            new THREE.MeshStandardMaterial({ color: 0x333333 })
        );
        tailRotor.position.set(0.3, 2.2, -6.5);
        heli.add(tailRotor);
        
        // Main rotor mast
        const mast = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.2, 1),
            new THREE.MeshStandardMaterial({ color: 0x333333 })
        );
        mast.position.y = 3;
        heli.add(mast);
        
        // Main rotor blades
        const blade = new THREE.Mesh(
            new THREE.BoxGeometry(12, 0.1, 0.5),
            new THREE.MeshStandardMaterial({ color: 0x222222 })
        );
        blade.position.y = 3.5;
        heli.add(blade);
        
        const blade2 = blade.clone();
        blade2.rotation.y = Math.PI / 2;
        heli.add(blade2);
        
        // Skids
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
        
        // Cockpit glass
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
        this.scene.add(heli);
        return heli;
    }
    
    /**
     * Create taxiways
     */
    createTaxiways(baseX, baseZ) {
        const taxiwayMat = new THREE.MeshStandardMaterial({
            color: 0x444444,
            roughness: 0.85
        });
        
        // Main taxiway parallel to runway
        const mainTaxi = new THREE.Mesh(
            new THREE.PlaneGeometry(12, 150),
            taxiwayMat
        );
        mainTaxi.rotation.x = -Math.PI / 2;
        mainTaxi.position.set(baseX + 25, 0.04, baseZ);
        mainTaxi.receiveShadow = true;
        this.scene.add(mainTaxi);
        
        // Cross taxiways
        [-50, 0, 50].forEach(zOffset => {
            const crossTaxi = new THREE.Mesh(
                new THREE.PlaneGeometry(30, 10),
                taxiwayMat
            );
            crossTaxi.rotation.x = -Math.PI / 2;
            crossTaxi.position.set(baseX + 12, 0.04, baseZ + zOffset);
            crossTaxi.receiveShadow = true;
            this.scene.add(crossTaxi);
        });
        
        // Yellow taxiway lines
        const lineMat = new THREE.MeshStandardMaterial({ color: 0xFFCC00 });
        for (let z = -70; z <= 70; z += 5) {
            const line = new THREE.Mesh(
                new THREE.PlaneGeometry(0.3, 3),
                lineMat
            );
            line.rotation.x = -Math.PI / 2;
            line.position.set(baseX + 25, 0.05, baseZ + z);
            this.scene.add(line);
        }
    }

    trackCollider(object) {
        if (object) {
            this.collisionMeshes.push(object);
        }
    }

    trackAircraft(aircraft) {
        if (!aircraft) return;
        this.aircraft.push(aircraft);
        this.trackCollider(aircraft);
    }

    getCollisionMeshes() {
        return this.collisionMeshes;
    }
}
