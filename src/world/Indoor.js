import * as THREE from 'three';

/**
 * Indoor scene generation for house interiors
 */
export class Indoor {
    constructor() {
        this.scene = null;
        this.friendNPC = null;
    }
    
    create(friend) {
        this.scene = new THREE.Group();
        
        this.createRoom();
        this.createFurniture();
        this.createDoor();
        this.friendNPC = this.createFriendNPC(friend);
        
        this.scene.position.set(500, 0, 500);
        return this.scene;
    }
    
    createRoom() {
        // Floor
        const floorGeo = new THREE.PlaneGeometry(20, 20);
        const floorMat = new THREE.MeshStandardMaterial({ color: 0xDEB887, roughness: 0.85 });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0.01;
        floor.receiveShadow = true;
        this.scene.add(floor);
        
        // Walls
        const wallMat = new THREE.MeshStandardMaterial({ color: 0xFFF5E6, side: THREE.DoubleSide });
        const wallGeo = new THREE.PlaneGeometry(20, 8);
        
        const backWall = new THREE.Mesh(wallGeo, wallMat);
        backWall.position.set(0, 4, -10);
        this.scene.add(backWall);
        
        const leftWall = new THREE.Mesh(wallGeo, wallMat);
        leftWall.position.set(-10, 4, 0);
        leftWall.rotation.y = Math.PI / 2;
        this.scene.add(leftWall);
        
        const rightWall = new THREE.Mesh(wallGeo, wallMat);
        rightWall.position.set(10, 4, 0);
        rightWall.rotation.y = -Math.PI / 2;
        this.scene.add(rightWall);
        
        // Lighting
        const light = new THREE.PointLight(0xFFF5E6, 0.8, 25);
        light.position.set(0, 7, 0);
        this.scene.add(light);
    }
    
    createFurniture() {
        // Couch
        const couchMat = new THREE.MeshStandardMaterial({ color: 0xC9A86C });
        const couchBase = new THREE.Mesh(new THREE.BoxGeometry(4, 0.7, 1.4), couchMat);
        couchBase.position.set(0, 0.35, -6);
        couchBase.castShadow = true;
        this.scene.add(couchBase);
        
        const couchBack = new THREE.Mesh(new THREE.BoxGeometry(4, 1.1, 0.35), couchMat);
        couchBack.position.set(0, 1.1, -6.52);
        this.scene.add(couchBack);
        
        // Coffee table
        const tableMat = new THREE.MeshStandardMaterial({ color: 0xDEB887 });
        const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.12, 20), tableMat);
        tableTop.position.set(0, 0.65, -2);
        this.scene.add(tableTop);
        
        const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.6, 10), tableMat);
        tableLeg.position.set(0, 0.3, -2);
        this.scene.add(tableLeg);
        
        // Rug
        const rugGeo = new THREE.CircleGeometry(3, 32);
        const rugMat = new THREE.MeshStandardMaterial({ color: 0xDDA0DD });
        const rug = new THREE.Mesh(rugGeo, rugMat);
        rug.rotation.x = -Math.PI / 2;
        rug.position.set(0, 0.02, -4);
        this.scene.add(rug);
        
        // Bookshelf
        const shelfMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const shelf = new THREE.Mesh(new THREE.BoxGeometry(2, 4, 0.5), shelfMat);
        shelf.position.set(-8, 2, -8);
        shelf.rotation.y = Math.PI / 5;
        this.scene.add(shelf);
        
        // Plant
        const potMat = new THREE.MeshStandardMaterial({ color: 0xCD853F });
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.3, 0.6, 10), potMat);
        pot.position.set(7, 0.3, -8);
        this.scene.add(pot);
        
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        for (let i = 0; i < 6; i++) {
            const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), leafMat);
            const angle = (i / 6) * Math.PI * 2;
            leaf.position.set(7 + Math.cos(angle) * 0.25, 0.9 + Math.random() * 0.3, -8 + Math.sin(angle) * 0.25);
            this.scene.add(leaf);
        }
    }
    
    createDoor() {
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const door = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 0.15), doorMat);
        door.position.set(0, 1.5, 9.9);
        door.userData = { type: 'exit' };
        this.scene.add(door);
    }
    
    createFriendNPC(friend) {
        const npc = new THREE.Group();
        const mat = new THREE.MeshStandardMaterial({ color: friend.color });
        
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 1.1, 12), mat);
        body.position.y = 0.75;
        npc.add(body);
        
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), mat);
        head.position.y = 1.8;
        npc.add(head);
        
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), eyeMat);
        leftEye.position.set(-0.16, 1.88, 0.36);
        npc.add(leftEye);
        
        const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), eyeMat);
        rightEye.position.set(0.16, 1.88, 0.36);
        npc.add(rightEye);
        
        npc.position.set(3, 0, 0);
        npc.userData = { type: 'indoor-friend', friend };
        this.scene.add(npc);
        return npc;
    }
    
    dispose() {
        if (this.scene) {
            this.scene.parent?.remove(this.scene);
            this.scene = null;
        }
    }
}
