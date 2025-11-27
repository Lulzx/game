import * as THREE from 'three';
import { Materials } from '../core/Materials.js';

/**
 * Environmental decorations: trees, flowers, benches, lamp posts, fountain, pond
 */
export class Environment {
    constructor(scene) {
        this.scene = scene;
        this.objects = [];
    }
    
    /**
     * Create a stylized tree
     */
    createTree(x, z, scale = 1) {
        const tree = new THREE.Group();
        
        // Trunk with slight taper
        const trunkGeo = new THREE.CylinderGeometry(0.25 * scale, 0.4 * scale, 2 * scale, 10);
        const trunk = new THREE.Mesh(trunkGeo, Materials.trunk);
        trunk.position.y = scale;
        trunk.castShadow = true;
        tree.add(trunk);
        
        // Layered foliage (3 cones for depth)
        const foliageColors = [0x228B22, 0x2E8B57, 0x3CB371];
        for (let i = 0; i < 3; i++) {
            const radius = (2.2 - i * 0.45) * scale;
            const height = 2.2 * scale;
            const foliageGeo = new THREE.ConeGeometry(radius, height, 10);
            const foliageMat = new THREE.MeshStandardMaterial({ 
                color: foliageColors[i], 
                roughness: 0.8 
            });
            const foliage = new THREE.Mesh(foliageGeo, foliageMat);
            foliage.position.y = (2.2 + i * 1.1) * scale;
            foliage.castShadow = true;
            tree.add(foliage);
        }
        
        tree.position.set(x, 0, z);
        this.scene.add(tree);
        this.objects.push(tree);
        return tree;
    }
    
    /**
     * Create a round bush tree variant
     */
    createRoundTree(x, z, scale = 1) {
        const tree = new THREE.Group();
        
        // Trunk
        const trunkGeo = new THREE.CylinderGeometry(0.2 * scale, 0.35 * scale, 1.5 * scale, 10);
        const trunk = new THREE.Mesh(trunkGeo, Materials.trunk);
        trunk.position.y = 0.75 * scale;
        trunk.castShadow = true;
        tree.add(trunk);
        
        // Round foliage
        const foliageGeo = new THREE.SphereGeometry(1.8 * scale, 16, 16);
        const foliageMat = new THREE.MeshStandardMaterial({ 
            color: 0x2E8B57, 
            roughness: 0.85 
        });
        const foliage = new THREE.Mesh(foliageGeo, foliageMat);
        foliage.position.y = 2.8 * scale;
        foliage.castShadow = true;
        tree.add(foliage);
        
        tree.position.set(x, 0, z);
        this.scene.add(tree);
        this.objects.push(tree);
        return tree;
    }
    
    /**
     * Create a flower cluster
     */
    createFlower(x, z) {
        const flower = new THREE.Group();
        
        // Stem
        const stemGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.35, 8);
        const stem = new THREE.Mesh(stemGeo, Materials.stem);
        stem.position.y = 0.175;
        flower.add(stem);
        
        // Random petal color
        const colors = [Materials.flower.red, Materials.flower.pink, Materials.flower.yellow, Materials.flower.purple, Materials.flower.white];
        const petalMat = colors[Math.floor(Math.random() * colors.length)];
        
        // Petals
        const petalGeo = new THREE.SphereGeometry(0.08, 8, 8);
        for (let i = 0; i < 5; i++) {
            const petal = new THREE.Mesh(petalGeo, petalMat);
            const angle = (i / 5) * Math.PI * 2;
            petal.position.set(Math.cos(angle) * 0.07, 0.38, Math.sin(angle) * 0.07);
            flower.add(petal);
        }
        
        // Center
        const centerGeo = new THREE.SphereGeometry(0.05, 8, 8);
        const centerMat = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
        const center = new THREE.Mesh(centerGeo, centerMat);
        center.position.y = 0.38;
        flower.add(center);
        
        flower.position.set(x, 0, z);
        this.scene.add(flower);
        this.objects.push(flower);
        return flower;
    }
    
    /**
     * Create a wooden bench
     */
    createBench(x, z, rotation = 0) {
        const bench = new THREE.Group();
        
        // Seat
        const seatGeo = new THREE.BoxGeometry(2, 0.12, 0.55);
        const seat = new THREE.Mesh(seatGeo, Materials.woodLight);
        seat.position.y = 0.58;
        seat.castShadow = true;
        bench.add(seat);
        
        // Seat slats
        for (let i = -0.2; i <= 0.2; i += 0.2) {
            const slatGeo = new THREE.BoxGeometry(2, 0.03, 0.12);
            const slat = new THREE.Mesh(slatGeo, Materials.woodLight);
            slat.position.set(0, 0.57, i);
            bench.add(slat);
        }
        
        // Backrest
        const backGeo = new THREE.BoxGeometry(2, 0.5, 0.08);
        const back = new THREE.Mesh(backGeo, Materials.woodLight);
        back.position.set(0, 0.95, -0.22);
        back.castShadow = true;
        bench.add(back);
        
        // Legs
        const legGeo = new THREE.BoxGeometry(0.12, 0.58, 0.45);
        [[-0.85, 0.29, 0], [0.85, 0.29, 0]].forEach(pos => {
            const leg = new THREE.Mesh(legGeo, Materials.wood);
            leg.position.set(...pos);
            leg.castShadow = true;
            bench.add(leg);
        });
        
        // Armrests
        const armGeo = new THREE.BoxGeometry(0.12, 0.08, 0.55);
        const leftArm = new THREE.Mesh(armGeo, Materials.wood);
        leftArm.position.set(-0.95, 0.85, 0);
        bench.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeo, Materials.wood);
        rightArm.position.set(0.95, 0.85, 0);
        bench.add(rightArm);
        
        bench.position.set(x, 0, z);
        bench.rotation.y = rotation;
        this.scene.add(bench);
        this.objects.push(bench);
        return bench;
    }
    
    /**
     * Create an ornate lamp post
     */
    createLampPost(x, z) {
        const lamp = new THREE.Group();
        
        // Base
        const baseGeo = new THREE.CylinderGeometry(0.25, 0.35, 0.3, 8);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.3 });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = 0.15;
        lamp.add(base);
        
        // Pole
        const poleGeo = new THREE.CylinderGeometry(0.08, 0.12, 3.8, 10);
        const pole = new THREE.Mesh(poleGeo, baseMat);
        pole.position.y = 2.2;
        lamp.add(pole);
        
        // Top ornament
        const topGeo = new THREE.SphereGeometry(0.15, 10, 10);
        const top = new THREE.Mesh(topGeo, baseMat);
        top.position.y = 4.25;
        lamp.add(top);
        
        // Lamp housing
        const housingGeo = new THREE.CylinderGeometry(0.35, 0.25, 0.5, 8);
        const housing = new THREE.Mesh(housingGeo, baseMat);
        housing.position.y = 4.0;
        lamp.add(housing);
        
        // Glass panels
        const glassGeo = new THREE.BoxGeometry(0.25, 0.35, 0.02);
        const glassMat = new THREE.MeshStandardMaterial({ 
            color: 0xFFFFDD, 
            transparent: true, 
            opacity: 0.7 
        });
        
        for (let i = 0; i < 4; i++) {
            const glass = new THREE.Mesh(glassGeo, glassMat);
            const angle = (i / 4) * Math.PI * 2;
            glass.position.set(
                Math.cos(angle) * 0.28,
                3.9,
                Math.sin(angle) * 0.28
            );
            glass.rotation.y = angle;
            lamp.add(glass);
        }
        
        // Light bulb
        const bulbGeo = new THREE.SphereGeometry(0.2, 16, 16);
        const bulbMat = new THREE.MeshStandardMaterial({ 
            color: 0xFFFFAA, 
            emissive: 0xFFFF66, 
            emissiveIntensity: 0.5 
        });
        const bulb = new THREE.Mesh(bulbGeo, bulbMat);
        bulb.position.y = 3.85;
        lamp.add(bulb);
        
        // Point light for atmosphere
        const light = new THREE.PointLight(0xFFFFAA, 0.5, 15);
        light.position.y = 3.85;
        lamp.add(light);
        
        lamp.position.set(x, 0, z);
        this.scene.add(lamp);
        this.objects.push(lamp);
        return lamp;
    }
    
    /**
     * Create a town fountain
     */
    createFountain(x, z) {
        const fountain = new THREE.Group();
        
        // Base pool
        const baseGeo = new THREE.CylinderGeometry(3.2, 3.5, 0.7, 24);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, roughness: 0.7 });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = 0.35;
        base.castShadow = true;
        base.receiveShadow = true;
        fountain.add(base);
        
        // Water pool
        const poolGeo = new THREE.CylinderGeometry(2.7, 2.7, 0.35, 24);
        const pool = new THREE.Mesh(poolGeo, Materials.water);
        pool.position.y = 0.8;
        fountain.add(pool);
        
        // Central pillar
        const pillarGeo = new THREE.CylinderGeometry(0.35, 0.45, 2.2, 12);
        const pillar = new THREE.Mesh(pillarGeo, baseMat);
        pillar.position.y = 1.8;
        pillar.castShadow = true;
        fountain.add(pillar);
        
        // Top bowl
        const bowlGeo = new THREE.SphereGeometry(0.7, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2);
        const bowl = new THREE.Mesh(bowlGeo, baseMat);
        bowl.position.y = 2.9;
        bowl.rotation.x = Math.PI;
        bowl.castShadow = true;
        fountain.add(bowl);
        
        // Decorative ring
        const ringGeo = new THREE.TorusGeometry(0.5, 0.08, 10, 20);
        const ring = new THREE.Mesh(ringGeo, baseMat);
        ring.position.y = 2.9;
        ring.rotation.x = Math.PI / 2;
        fountain.add(ring);
        
        // Water spout particles would go here (simplified with a small sphere)
        const spoutGeo = new THREE.CylinderGeometry(0.05, 0.08, 0.4, 8);
        const spoutMat = new THREE.MeshStandardMaterial({ 
            color: 0x87CEEB, 
            transparent: true, 
            opacity: 0.6 
        });
        const spout = new THREE.Mesh(spoutGeo, spoutMat);
        spout.position.y = 3.2;
        fountain.add(spout);
        
        fountain.position.set(x, 0, z);
        this.scene.add(fountain);
        this.objects.push(fountain);
        return fountain;
    }
    
    /**
     * Create a decorative pond
     */
    createPond(x, z) {
        const pond = new THREE.Group();
        
        // Water
        const waterGeo = new THREE.CircleGeometry(6, 36);
        const water = new THREE.Mesh(waterGeo, Materials.water);
        water.rotation.x = -Math.PI / 2;
        water.position.y = 0.05;
        pond.add(water);
        
        // Rocky edge
        const edgeGeo = new THREE.TorusGeometry(6, 0.45, 10, 36);
        const edgeMat = new THREE.MeshStandardMaterial({ color: 0x7B6B5A, roughness: 0.9 });
        const edge = new THREE.Mesh(edgeGeo, edgeMat);
        edge.rotation.x = -Math.PI / 2;
        edge.position.y = 0.15;
        edge.castShadow = true;
        pond.add(edge);
        
        // Lily pads
        for (let i = 0; i < 6; i++) {
            const lilyGeo = new THREE.CircleGeometry(0.45, 18);
            const lilyMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
            const lily = new THREE.Mesh(lilyGeo, lilyMat);
            lily.rotation.x = -Math.PI / 2;
            
            const angle = Math.random() * Math.PI * 2;
            const dist = 1.5 + Math.random() * 3;
            lily.position.set(Math.cos(angle) * dist, 0.08, Math.sin(angle) * dist);
            lily.rotation.z = Math.random() * Math.PI * 2;
            pond.add(lily);
            
            // Occasional flower on lily
            if (Math.random() > 0.5) {
                const flowerGeo = new THREE.SphereGeometry(0.12, 8, 8);
                const flowerMat = new THREE.MeshStandardMaterial({ color: 0xFFB6C1 });
                const flower = new THREE.Mesh(flowerGeo, flowerMat);
                flower.position.copy(lily.position);
                flower.position.y = 0.15;
                pond.add(flower);
            }
        }
        
        // Rocks around edge
        const rockGeo = new THREE.DodecahedronGeometry(0.35, 0);
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.9 });
        
        for (let i = 0; i < 8; i++) {
            const rock = new THREE.Mesh(rockGeo, rockMat);
            const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.3;
            rock.position.set(Math.cos(angle) * 6.3, 0.2, Math.sin(angle) * 6.3);
            rock.rotation.set(Math.random(), Math.random(), Math.random());
            rock.scale.setScalar(0.5 + Math.random() * 0.5);
            pond.add(rock);
        }
        
        pond.position.set(x, 0, z);
        this.scene.add(pond);
        this.objects.push(pond);
        return pond;
    }
}
