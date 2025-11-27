import * as THREE from 'three';
import { Materials } from '../core/Materials.js';

/**
 * House entity with detailed construction
 */
export class House {
    constructor(x, z, wallMat, roofMat, friend, rotation = 0) {
        this.group = new THREE.Group();
        this.friend = friend;
        this.doorPosition = new THREE.Vector3();
        
        this.createStructure(wallMat, roofMat);
        this.createDetails();
        this.createGarden();
        
        this.group.position.set(x, 0, z);
        this.group.rotation.y = rotation;
        
        // Calculate world-space door position
        const localDoor = new THREE.Vector3(0, 0, 5);
        localDoor.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotation);
        this.doorPosition.copy(new THREE.Vector3(x, 0, z)).add(localDoor);
        
        this.group.userData = { type: 'house', friend: friend, doorPosition: this.doorPosition };
    }
    
    createStructure(wallMat, roofMat) {
        // Main walls with beveled edges look
        const wallGeo = new THREE.BoxGeometry(6, 5, 6);
        const walls = new THREE.Mesh(wallGeo, wallMat);
        walls.position.y = 2.5;
        walls.castShadow = true;
        walls.receiveShadow = true;
        this.group.add(walls);
        
        // Foundation
        const foundationGeo = new THREE.BoxGeometry(6.4, 0.3, 6.4);
        const foundationMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9 });
        const foundation = new THREE.Mesh(foundationGeo, foundationMat);
        foundation.position.y = 0.15;
        foundation.receiveShadow = true;
        this.group.add(foundation);
        
        // Roof (pyramid style)
        const roofGeo = new THREE.ConeGeometry(4.8, 3, 4);
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 6.5;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        this.group.add(roof);
        
        // Roof trim
        const trimGeo = new THREE.BoxGeometry(6.2, 0.2, 6.2);
        const trimMat = new THREE.MeshStandardMaterial({ color: 0xDEB887 });
        const trim = new THREE.Mesh(trimGeo, trimMat);
        trim.position.y = 5.1;
        this.group.add(trim);
    }
    
    createDetails() {
        // Front door
        const doorGeo = new THREE.BoxGeometry(1.1, 2.1, 0.15);
        const door = new THREE.Mesh(doorGeo, Materials.door);
        door.position.set(0, 1.05, 3.0);
        this.group.add(door);
        
        // Door frame
        const frameVertGeo = new THREE.BoxGeometry(0.15, 2.4, 0.1);
        const frameMat = new THREE.MeshStandardMaterial({ color: 0xDEB887 });
        
        const leftFrame = new THREE.Mesh(frameVertGeo, frameMat);
        leftFrame.position.set(-0.65, 1.2, 3.05);
        this.group.add(leftFrame);
        
        const rightFrame = new THREE.Mesh(frameVertGeo, frameMat);
        rightFrame.position.set(0.65, 1.2, 3.05);
        this.group.add(rightFrame);
        
        const topFrameGeo = new THREE.BoxGeometry(1.45, 0.15, 0.1);
        const topFrame = new THREE.Mesh(topFrameGeo, frameMat);
        topFrame.position.set(0, 2.35, 3.05);
        this.group.add(topFrame);
        
        // Doorknob
        const knobGeo = new THREE.SphereGeometry(0.06, 10, 10);
        const knobMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.8 });
        const knob = new THREE.Mesh(knobGeo, knobMat);
        knob.position.set(0.4, 1.0, 3.1);
        this.group.add(knob);
        
        // Windows
        const windowPositions = [
            { x: -1.8, y: 2.8, z: 3.0, rx: 0 },
            { x: 1.8, y: 2.8, z: 3.0, rx: 0 },
            { x: -1.8, y: 2.8, z: -3.0, rx: Math.PI },
            { x: 1.8, y: 2.8, z: -3.0, rx: Math.PI },
            { x: 3.0, y: 2.8, z: 0, rx: Math.PI / 2 },
            { x: -3.0, y: 2.8, z: 0, rx: -Math.PI / 2 }
        ];
        
        windowPositions.forEach(pos => {
            this.createWindow(pos.x, pos.y, pos.z, pos.rx);
        });
        
        // Chimney
        const chimneyGeo = new THREE.BoxGeometry(0.8, 2.5, 0.8);
        const chimneyMat = new THREE.MeshStandardMaterial({ color: 0xCD853F, roughness: 0.8 });
        const chimney = new THREE.Mesh(chimneyGeo, chimneyMat);
        chimney.position.set(1.8, 7, -1.5);
        chimney.castShadow = true;
        this.group.add(chimney);
        
        // Chimney top
        const chimneyTopGeo = new THREE.BoxGeometry(1.0, 0.2, 1.0);
        const chimneyTop = new THREE.Mesh(chimneyTopGeo, chimneyMat);
        chimneyTop.position.set(1.8, 8.3, -1.5);
        this.group.add(chimneyTop);
    }
    
    createWindow(x, y, z, rotY) {
        const group = new THREE.Group();
        
        // Glass
        const glassGeo = new THREE.PlaneGeometry(0.9, 1.1);
        const glass = new THREE.Mesh(glassGeo, Materials.window);
        group.add(glass);
        
        // Frame
        const frameMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
        
        // Outer frame
        const frameTopGeo = new THREE.BoxGeometry(1.1, 0.08, 0.08);
        const frameTop = new THREE.Mesh(frameTopGeo, frameMat);
        frameTop.position.y = 0.58;
        group.add(frameTop);
        
        const frameBottom = new THREE.Mesh(frameTopGeo, frameMat);
        frameBottom.position.y = -0.58;
        group.add(frameBottom);
        
        const frameSideGeo = new THREE.BoxGeometry(0.08, 1.24, 0.08);
        const frameLeft = new THREE.Mesh(frameSideGeo, frameMat);
        frameLeft.position.x = -0.51;
        group.add(frameLeft);
        
        const frameRight = new THREE.Mesh(frameSideGeo, frameMat);
        frameRight.position.x = 0.51;
        group.add(frameRight);
        
        // Cross bars
        const crossHGeo = new THREE.BoxGeometry(0.9, 0.05, 0.05);
        const crossH = new THREE.Mesh(crossHGeo, frameMat);
        group.add(crossH);
        
        const crossVGeo = new THREE.BoxGeometry(0.05, 1.1, 0.05);
        const crossV = new THREE.Mesh(crossVGeo, frameMat);
        group.add(crossV);
        
        // Window sill
        const sillGeo = new THREE.BoxGeometry(1.2, 0.08, 0.2);
        const sill = new THREE.Mesh(sillGeo, frameMat);
        sill.position.set(0, -0.62, 0.1);
        group.add(sill);
        
        group.position.set(x, y, z);
        group.rotation.y = rotY;
        this.group.add(group);
    }
    
    createGarden() {
        // White picket fence
        const fenceMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.8 });
        
        // Front fence with gate opening
        for (let i = -3; i <= 3; i++) {
            if (Math.abs(i) > 0.5) { // Skip gate area
                const picketGeo = new THREE.BoxGeometry(0.1, 0.8, 0.05);
                const picket = new THREE.Mesh(picketGeo, fenceMat);
                picket.position.set(i * 0.8, 0.4, 4.5);
                this.group.add(picket);
            }
        }
        
        // Fence rail
        const railGeo = new THREE.BoxGeometry(6, 0.08, 0.05);
        const topRail = new THREE.Mesh(railGeo, fenceMat);
        topRail.position.set(0, 0.65, 4.5);
        this.group.add(topRail);
        
        const bottomRail = new THREE.Mesh(railGeo, fenceMat);
        bottomRail.position.set(0, 0.2, 4.5);
        this.group.add(bottomRail);
        
        // Flower bed
        for (let i = 0; i < 5; i++) {
            const flower = this.createFlower();
            flower.position.set(-2 + i * 1, 0, 4);
            this.group.add(flower);
        }
        
        // Mailbox
        const postGeo = new THREE.CylinderGeometry(0.08, 0.1, 1.1, 8);
        const postMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const post = new THREE.Mesh(postGeo, postMat);
        post.position.set(3.5, 0.55, 4.2);
        this.group.add(post);
        
        const mailboxGeo = new THREE.BoxGeometry(0.35, 0.25, 0.5);
        const mailboxMat = new THREE.MeshStandardMaterial({ color: this.friend.color });
        const mailbox = new THREE.Mesh(mailboxGeo, mailboxMat);
        mailbox.position.set(3.5, 1.25, 4.2);
        this.group.add(mailbox);
        
        // Welcome mat
        const matGeo = new THREE.BoxGeometry(1.2, 0.03, 0.8);
        const matMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.95 });
        const welcomeMat = new THREE.Mesh(matGeo, matMat);
        welcomeMat.position.set(0, 0.015, 3.8);
        this.group.add(welcomeMat);
    }
    
    createFlower() {
        const flower = new THREE.Group();
        
        // Stem
        const stemGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.35, 8);
        const stem = new THREE.Mesh(stemGeo, Materials.stem);
        stem.position.y = 0.175;
        flower.add(stem);
        
        // Petals
        const colors = [Materials.flower.red, Materials.flower.pink, Materials.flower.yellow, Materials.flower.purple, Materials.flower.white];
        const petalMat = colors[Math.floor(Math.random() * colors.length)];
        const petalGeo = new THREE.SphereGeometry(0.1, 8, 8);
        
        for (let i = 0; i < 5; i++) {
            const petal = new THREE.Mesh(petalGeo, petalMat);
            const angle = (i / 5) * Math.PI * 2;
            petal.position.set(Math.cos(angle) * 0.08, 0.4, Math.sin(angle) * 0.08);
            flower.add(petal);
        }
        
        // Center
        const centerGeo = new THREE.SphereGeometry(0.06, 8, 8);
        const centerMat = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
        const center = new THREE.Mesh(centerGeo, centerMat);
        center.position.y = 0.4;
        flower.add(center);
        
        return flower;
    }
    
    /**
     * Check if a position is near the door
     */
    isNearDoor(position, threshold = 4) {
        return position.distanceTo(this.doorPosition) < threshold;
    }
}
