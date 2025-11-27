import * as THREE from 'three';
import { Materials } from '../core/Materials.js';

/**
 * Ground and path creation
 */
export class Ground {
    constructor(scene) {
        this.scene = scene;
    }
    
    /**
     * Create the main ground plane
     */
    create() {
        // Main grass ground (large circular area)
        const groundGeo = new THREE.CircleGeometry(120, 72);
        const ground = new THREE.Mesh(groundGeo, Materials.grass);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Town square plaza (central circular area)
        const plazaGeo = new THREE.CircleGeometry(13, 40);
        const plazaMat = new THREE.MeshStandardMaterial({ 
            color: 0xE8DCC8, 
            roughness: 0.85 
        });
        const plaza = new THREE.Mesh(plazaGeo, plazaMat);
        plaza.rotation.x = -Math.PI / 2;
        plaza.position.y = 0.02;
        plaza.receiveShadow = true;
        this.scene.add(plaza);
        
        // Decorative plaza border
        const borderGeo = new THREE.TorusGeometry(13, 0.25, 8, 48);
        const borderMat = new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.8 });
        const border = new THREE.Mesh(borderGeo, borderMat);
        border.rotation.x = -Math.PI / 2;
        border.position.y = 0.05;
        this.scene.add(border);
        
        // Inner decorative circle
        const innerBorderGeo = new THREE.TorusGeometry(5, 0.15, 8, 32);
        const innerBorder = new THREE.Mesh(innerBorderGeo, borderMat);
        innerBorder.rotation.x = -Math.PI / 2;
        innerBorder.position.y = 0.03;
        this.scene.add(innerBorder);
    }
    
    /**
     * Create a path between two points
     */
    createPath(x1, z1, x2, z2, width = 3) {
        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2));
        const angle = Math.atan2(x2 - x1, z2 - z1);
        
        const pathGeo = new THREE.PlaneGeometry(width, length);
        const path = new THREE.Mesh(pathGeo, Materials.path);
        path.rotation.x = -Math.PI / 2;
        path.rotation.z = -angle;
        path.position.set((x1 + x2) / 2, 0.025, (z1 + z2) / 2);
        path.receiveShadow = true;
        this.scene.add(path);
        
        // Add path edge detail
        const edgeGeo = new THREE.PlaneGeometry(width + 0.3, length + 0.3);
        const edgeMat = new THREE.MeshStandardMaterial({ color: 0xC4A87C, roughness: 0.9 });
        const edge = new THREE.Mesh(edgeGeo, edgeMat);
        edge.rotation.x = -Math.PI / 2;
        edge.rotation.z = -angle;
        edge.position.set((x1 + x2) / 2, 0.015, (z1 + z2) / 2);
        edge.receiveShadow = true;
        this.scene.add(edge);
    }
    
    /**
     * Create the road network for the town
     */
    createRoadNetwork() {
        // Main paths radiating from town square to houses
        this.createPath(0, 0, 0, -38, 3.5);   // North
        this.createPath(0, 0, 38, 0, 3.5);    // East
        this.createPath(0, 0, 0, 38, 3.5);    // South
        this.createPath(0, 0, -38, 0, 3.5);   // West
        this.createPath(0, 0, 32, -32, 3.5);  // Northeast (diagonal)
        
        // Connecting paths between houses
        this.createPath(32, -8, 8, -32, 2.5);
    }
}
