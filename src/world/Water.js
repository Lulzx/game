import * as THREE from 'three';
import { Materials } from '../core/Materials.js';

/**
 * Water system with river, ocean, and animated waves
 */
export class Water {
    constructor(scene) {
        this.scene = scene;
        this.waterMeshes = [];
        this.time = 0;
        this.waveSettings = [
            { direction: new THREE.Vector2(1, 0.4).normalize(), amplitude: 0.55, wavelength: 22, speed: 2.2 },
            { direction: new THREE.Vector2(-0.6, 1).normalize(), amplitude: 0.35, wavelength: 16, speed: 1.6 },
            { direction: new THREE.Vector2(0.25, 1).normalize(), amplitude: 0.22, wavelength: 12, speed: 1.9 }
        ];
    }
    
    /**
     * Generate all water bodies
     */
    generate() {
        this.createOcean();
        this.createRiver();
        this.createLake();
    }
    
    /**
     * Create ocean at the edge of the map
     */
    createOcean() {
        const oceanGeo = new THREE.PlaneGeometry(400, 200, 64, 32);
        const oceanMat = Materials.water.clone();
        oceanMat.color = new THREE.Color(0x185a72);
        oceanMat.roughness = 0.06;
        oceanMat.metalness = 0.45;
        oceanMat.opacity = 0.95;
        
        const ocean = new THREE.Mesh(oceanGeo, oceanMat);
        ocean.rotation.x = -Math.PI / 2;
        ocean.position.set(0, -1, 350);
        ocean.receiveShadow = true;
        this.scene.add(ocean);
        this.waterMeshes.push({ mesh: ocean, type: 'ocean' });
        
        // Beach
        const beachGeo = new THREE.PlaneGeometry(400, 30);
        const beachMat = new THREE.MeshStandardMaterial({
            color: 0x8f7d63,
            roughness: 0.94,
            metalness: 0.02
        });
        const beach = new THREE.Mesh(beachGeo, beachMat);
        beach.rotation.x = -Math.PI / 2;
        beach.position.set(0, 0.05, 240);
        beach.receiveShadow = true;
        this.scene.add(beach);
    }
    
    /**
     * Create winding river
     */
    createRiver() {
        const riverPath = [];
        const riverWidth = 25;
        
        // Generate river path using sine wave
        for (let z = -300; z <= 250; z += 10) {
            const x = Math.sin(z * 0.01) * 50 + 100;
            riverPath.push({ x, z });
        }
        
        // Create river segments
        const riverMat = Materials.water.clone();
        riverMat.color = new THREE.Color(0x1d6a83);
        riverMat.opacity = 0.88;
        riverMat.transmission = 0.7;
        riverMat.roughness = 0.12;
        
        for (let i = 0; i < riverPath.length - 1; i++) {
            const curr = riverPath[i];
            const next = riverPath[i + 1];
            
            const length = Math.sqrt(
                Math.pow(next.x - curr.x, 2) + Math.pow(next.z - curr.z, 2)
            );
            const angle = Math.atan2(next.x - curr.x, next.z - curr.z);
            
            const segment = new THREE.Mesh(
                new THREE.PlaneGeometry(riverWidth, length + 2),
                riverMat
            );
            segment.rotation.x = -Math.PI / 2;
            segment.rotation.z = -angle;
            segment.position.set(
                (curr.x + next.x) / 2,
                -0.5,
                (curr.z + next.z) / 2
            );
            this.scene.add(segment);
            this.waterMeshes.push({ mesh: segment, type: 'river' });
        }
        
        // River banks
        this.createRiverBanks(riverPath, riverWidth);
    }
    
    /**
     * Create river banks with vegetation
     */
    createRiverBanks(riverPath, width) {
        const bankMat = new THREE.MeshStandardMaterial({ color: 0x3D5C3D });
        
        riverPath.forEach((point, i) => {
            if (i % 3 !== 0) return;
            
            // Left bank
            const leftBank = new THREE.Mesh(
                new THREE.CircleGeometry(3 + Math.random() * 2, 8),
                bankMat
            );
            leftBank.rotation.x = -Math.PI / 2;
            leftBank.position.set(point.x - width / 2 - 3, 0.03, point.z);
            this.scene.add(leftBank);
            
            // Right bank  
            const rightBank = new THREE.Mesh(
                new THREE.CircleGeometry(3 + Math.random() * 2, 8),
                bankMat
            );
            rightBank.rotation.x = -Math.PI / 2;
            rightBank.position.set(point.x + width / 2 + 3, 0.03, point.z);
            this.scene.add(rightBank);
            
            // Occasional trees
            if (Math.random() > 0.7) {
                this.createRiverTree(point.x - width / 2 - 8, point.z);
            }
            if (Math.random() > 0.7) {
                this.createRiverTree(point.x + width / 2 + 8, point.z);
            }
        });
    }
    
    createRiverTree(x, z) {
        const tree = new THREE.Group();
        
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.3, 2),
            new THREE.MeshStandardMaterial({ color: 0x4A3728 })
        );
        trunk.position.y = 1;
        tree.add(trunk);
        
        const foliage = new THREE.Mesh(
            new THREE.ConeGeometry(1.5, 3, 8),
            new THREE.MeshStandardMaterial({ color: 0x2D5A27 })
        );
        foliage.position.y = 3.5;
        tree.add(foliage);
        
        tree.position.set(x, 0, z);
        this.scene.add(tree);
    }
    
    /**
     * Create a small lake
     */
    createLake() {
        const lakeGeo = new THREE.CircleGeometry(30, 32);
        const lakeMat = Materials.water.clone();
        lakeMat.color = new THREE.Color(0x1f708c);
        lakeMat.opacity = 0.9;
        lakeMat.roughness = 0.1;
        
        const lake = new THREE.Mesh(lakeGeo, lakeMat);
        lake.rotation.x = -Math.PI / 2;
        lake.position.set(-180, -0.3, -150);
        this.scene.add(lake);
        this.waterMeshes.push({ mesh: lake, type: 'lake' });
        
        // Lake shore
        const shoreGeo = new THREE.RingGeometry(28, 35, 32);
        const shoreMat = new THREE.MeshStandardMaterial({
            color: 0x6b6152,
            roughness: 0.9
        });
        const shore = new THREE.Mesh(shoreGeo, shoreMat);
        shore.rotation.x = -Math.PI / 2;
        shore.position.set(-180, 0.02, -150);
        this.scene.add(shore);
    }
    
    /**
     * Animate water
     */
    update(deltaTime) {
        this.time += deltaTime;
        
        this.waterMeshes.forEach(({ mesh, type }) => {
            if (type === 'river') {
                mesh.material.opacity = 0.86 + Math.sin(this.time * 0.9) * 0.02;
                return;
            }
            
            const waveScale = type === 'lake' ? 0.35 : 1;
            const positions = mesh.geometry.attributes.position;
            const array = positions.array;
            
            for (let i = 0; i < array.length; i += 3) {
                const x = array[i];
                const y = array[i + 1];
                
                let displacement = 0;
                for (const wave of this.waveSettings) {
                    const k = (Math.PI * 2) / wave.wavelength;
                    const phase = k * (wave.direction.x * x + wave.direction.y * y) + this.time * wave.speed;
                    displacement += Math.sin(phase) * wave.amplitude * waveScale;
                }
                
                array[i + 2] = displacement;
            }
            
            positions.needsUpdate = true;
            mesh.geometry.computeVertexNormals();
        });
    }
    
    /**
     * Check if position is in water
     */
    isInWater(x, z) {
        // Check river
        const riverX = Math.sin(z * 0.01) * 50 + 100;
        if (Math.abs(x - riverX) < 12 && z > -300 && z < 250) {
            return true;
        }
        
        // Check ocean
        if (z > 250) return true;
        
        // Check lake
        const lakeDist = Math.sqrt(Math.pow(x + 180, 2) + Math.pow(z + 150, 2));
        if (lakeDist < 28) return true;
        
        return false;
    }
}
