import * as THREE from 'three';

/**
 * Procedural city generation with buildings, roads, and landmarks
 */
export class City {
    constructor(scene) {
        this.scene = scene;
        this.buildings = [];
        this.roads = [];
        
        // City parameters
        this.cityRadius = 120;
        this.blockSize = 25;
        this.roadWidth = 8;
    }
    
    /**
     * Generate the entire city
     */
    generate() {
        this.generateRoads();
        this.generateBuildings();
        this.generateDowntown();
        this.generateLandmarks();
    }
    
    /**
     * Generate road network
     */
    generateRoads() {
        const roadMat = new THREE.MeshStandardMaterial({ 
            color: 0x333333, 
            roughness: 0.9 
        });
        
        // Main roads (grid)
        for (let i = -4; i <= 4; i++) {
            // North-South roads
            const nsRoad = new THREE.Mesh(
                new THREE.PlaneGeometry(this.roadWidth, this.cityRadius * 2),
                roadMat
            );
            nsRoad.rotation.x = -Math.PI / 2;
            nsRoad.position.set(i * this.blockSize, 0.05, 0);
            nsRoad.receiveShadow = true;
            this.scene.add(nsRoad);
            
            // East-West roads
            const ewRoad = new THREE.Mesh(
                new THREE.PlaneGeometry(this.cityRadius * 2, this.roadWidth),
                roadMat
            );
            ewRoad.rotation.x = -Math.PI / 2;
            ewRoad.position.set(0, 0.05, i * this.blockSize);
            ewRoad.receiveShadow = true;
            this.scene.add(ewRoad);
        }
        
        // Road markings
        const markingMat = new THREE.MeshStandardMaterial({ color: 0xFFFF00 });
        for (let i = -4; i <= 4; i++) {
            for (let j = -20; j <= 20; j += 3) {
                const marking = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.3, 2),
                    markingMat
                );
                marking.rotation.x = -Math.PI / 2;
                marking.position.set(i * this.blockSize, 0.06, j * 5);
                this.scene.add(marking);
            }
        }
    }
    
    /**
     * Generate buildings in city blocks
     */
    generateBuildings() {
        const buildingColors = [
            0x8899AA, 0x667788, 0x556677, 0x778899,
            0x99AABB, 0xAABBCC, 0x445566, 0x6688AA
        ];
        
        for (let bx = -3; bx <= 3; bx++) {
            for (let bz = -3; bz <= 3; bz++) {
                // Skip some blocks for variety
                if (Math.random() < 0.15) continue;
                
                // Block center
                const blockX = bx * this.blockSize;
                const blockZ = bz * this.blockSize;
                
                // Distance from center affects building height
                const distFromCenter = Math.sqrt(blockX * blockX + blockZ * blockZ);
                const heightFactor = Math.max(0.3, 1 - distFromCenter / 100);
                
                // Generate 1-4 buildings per block
                const numBuildings = 1 + Math.floor(Math.random() * 3);
                
                for (let i = 0; i < numBuildings; i++) {
                    const offsetX = (Math.random() - 0.5) * (this.blockSize - this.roadWidth - 4);
                    const offsetZ = (Math.random() - 0.5) * (this.blockSize - this.roadWidth - 4);
                    
                    const width = 4 + Math.random() * 6;
                    const depth = 4 + Math.random() * 6;
                    const height = (5 + Math.random() * 25) * heightFactor;
                    
                    this.createBuilding(
                        blockX + offsetX,
                        blockZ + offsetZ,
                        width, height, depth,
                        buildingColors[Math.floor(Math.random() * buildingColors.length)]
                    );
                }
            }
        }
    }
    
    /**
     * Create a single building
     */
    createBuilding(x, z, width, height, depth, color) {
        const building = new THREE.Group();
        
        // Main structure
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
        
        // Windows
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
                // Front windows
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
                
                // Back windows
                const backWindow = frontWindow.clone();
                backWindow.position.z = -depth / 2 - 0.01;
                backWindow.rotation.y = Math.PI;
                building.add(backWindow);
            }
        }
        
        // Rooftop details
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
        this.scene.add(building);
        this.buildings.push(building);
        
        return building;
    }
    
    /**
     * Generate downtown skyscrapers
     */
    generateDowntown() {
        // Central skyscrapers
        const skyscraperPositions = [
            { x: 0, z: -30, h: 45 },
            { x: -15, z: -25, h: 35 },
            { x: 15, z: -35, h: 40 },
            { x: -25, z: -40, h: 30 },
            { x: 25, z: -20, h: 38 }
        ];
        
        skyscraperPositions.forEach(pos => {
            this.createSkyscraper(pos.x, pos.z, pos.h);
        });
    }
    
    /**
     * Create a skyscraper
     */
    createSkyscraper(x, z, height) {
        const building = new THREE.Group();
        
        // Modern glass skyscraper
        const width = 8 + Math.random() * 4;
        const depth = 8 + Math.random() * 4;
        
        // Glass facade
        const glassMat = new THREE.MeshStandardMaterial({
            color: 0x4488AA,
            roughness: 0.1,
            metalness: 0.9,
            transparent: true,
            opacity: 0.85
        });
        
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            glassMat
        );
        body.position.y = height / 2;
        body.castShadow = true;
        building.add(body);
        
        // Frame structure
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
        
        // Vertical frames
        for (let i = 0; i < 4; i++) {
            const frame = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, height, 0.3),
                frameMat
            );
            const angle = (i / 4) * Math.PI * 2;
            frame.position.set(
                Math.cos(angle) * width * 0.45,
                height / 2,
                Math.sin(angle) * depth * 0.45
            );
            building.add(frame);
        }
        
        // Horizontal frames
        for (let floor = 0; floor < height; floor += 4) {
            const hFrame = new THREE.Mesh(
                new THREE.BoxGeometry(width + 0.2, 0.2, depth + 0.2),
                frameMat
            );
            hFrame.position.y = floor;
            building.add(hFrame);
        }
        
        // Antenna on top
        const antenna = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.2, 8),
            frameMat
        );
        antenna.position.y = height + 4;
        building.add(antenna);
        
        // Blinking light
        const lightMat = new THREE.MeshStandardMaterial({
            color: 0xFF0000,
            emissive: 0xFF0000,
            emissiveIntensity: 1
        });
        const light = new THREE.Mesh(
            new THREE.SphereGeometry(0.3),
            lightMat
        );
        light.position.y = height + 8;
        building.add(light);
        
        building.position.set(x, 0, z);
        this.scene.add(building);
        this.buildings.push(building);
    }
    
    /**
     * Generate city landmarks
     */
    generateLandmarks() {
        // Gas station
        this.createGasStation(60, 30);
        
        // Parking lot
        this.createParkingLot(-50, 40);
        
        // Park
        this.createPark(40, -60);
    }
    
    createGasStation(x, z) {
        const station = new THREE.Group();
        
        // Canopy
        const canopy = new THREE.Mesh(
            new THREE.BoxGeometry(20, 0.5, 12),
            new THREE.MeshStandardMaterial({ color: 0xDD0000 })
        );
        canopy.position.y = 5;
        canopy.castShadow = true;
        station.add(canopy);
        
        // Pillars
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0xCCCCCC });
        [[-8, -4], [-8, 4], [8, -4], [8, 4]].forEach(([px, pz]) => {
            const pillar = new THREE.Mesh(
                new THREE.CylinderGeometry(0.4, 0.4, 5),
                pillarMat
            );
            pillar.position.set(px, 2.5, pz);
            station.add(pillar);
        });
        
        // Pumps
        const pumpMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
        [-3, 0, 3].forEach(px => {
            const pump = new THREE.Mesh(
                new THREE.BoxGeometry(1, 2.5, 0.8),
                pumpMat
            );
            pump.position.set(px, 1.25, 0);
            station.add(pump);
        });
        
        // Store building
        const store = new THREE.Mesh(
            new THREE.BoxGeometry(10, 4, 8),
            new THREE.MeshStandardMaterial({ color: 0xEEEEEE })
        );
        store.position.set(0, 2, -10);
        store.castShadow = true;
        station.add(store);
        
        station.position.set(x, 0, z);
        this.scene.add(station);
    }
    
    createParkingLot(x, z) {
        // Ground
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(30, 25),
            new THREE.MeshStandardMaterial({ color: 0x444444 })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(x, 0.02, z);
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Parking lines
        const lineMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
        for (let i = -4; i <= 4; i++) {
            const line = new THREE.Mesh(
                new THREE.PlaneGeometry(0.2, 5),
                lineMat
            );
            line.rotation.x = -Math.PI / 2;
            line.position.set(x + i * 3, 0.03, z);
            this.scene.add(line);
        }
    }
    
    createPark(x, z) {
        // Grass area
        const grass = new THREE.Mesh(
            new THREE.CircleGeometry(20, 32),
            new THREE.MeshStandardMaterial({ color: 0x44AA44 })
        );
        grass.rotation.x = -Math.PI / 2;
        grass.position.set(x, 0.02, z);
        grass.receiveShadow = true;
        this.scene.add(grass);
        
        // Trees
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const dist = 10 + Math.random() * 8;
            this.createTree(x + Math.cos(angle) * dist, z + Math.sin(angle) * dist);
        }
        
        // Fountain
        this.createFountain(x, z);
    }
    
    createTree(x, z) {
        const tree = new THREE.Group();
        
        // Trunk
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.5, 3),
            new THREE.MeshStandardMaterial({ color: 0x4A3728 })
        );
        trunk.position.y = 1.5;
        trunk.castShadow = true;
        tree.add(trunk);
        
        // Foliage
        const foliage = new THREE.Mesh(
            new THREE.SphereGeometry(2.5, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0x228B22 })
        );
        foliage.position.y = 4.5;
        foliage.castShadow = true;
        tree.add(foliage);
        
        tree.position.set(x, 0, z);
        this.scene.add(tree);
    }
    
    createFountain(x, z) {
        const fountain = new THREE.Group();
        
        // Base
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(4, 4.5, 1),
            new THREE.MeshStandardMaterial({ color: 0x888888 })
        );
        base.position.y = 0.5;
        fountain.add(base);
        
        // Water
        const water = new THREE.Mesh(
            new THREE.CylinderGeometry(3.5, 3.5, 0.3),
            new THREE.MeshStandardMaterial({ 
                color: 0x4488FF, 
                transparent: true, 
                opacity: 0.7 
            })
        );
        water.position.y = 1.1;
        fountain.add(water);
        
        // Center pillar
        const pillar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.6, 3),
            new THREE.MeshStandardMaterial({ color: 0x888888 })
        );
        pillar.position.y = 2.5;
        fountain.add(pillar);
        
        fountain.position.set(x, 0, z);
        this.scene.add(fountain);
    }
    
    /**
     * Get collision boxes for all buildings
     */
    getColliders() {
        return this.buildings.map(b => ({
            position: b.position.clone(),
            radius: 8
        }));
    }
}
