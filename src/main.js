import * as THREE from 'three';
import { GameState } from './core/GameState.js';
import { Materials } from './core/Materials.js';
import { Controls } from './systems/Controls.js';
import { CameraController } from './systems/CameraController.js';
import { Minimap } from './systems/Minimap.js';
import { Collision } from './systems/Collision.js';
import { UI } from './ui/UI.js';
import { Player } from './entities/Player.js';
import { Car } from './entities/Car.js';
import { NPC } from './entities/NPC.js';
import { Terrain } from './world/Terrain.js';
import { City } from './world/City.js';
import { Water } from './world/Water.js';
import { Airport } from './world/Airport.js';
import { Indoor } from './world/Indoor.js';

/**
 * Mini GTA V - Open World Game
 */
class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.cameraController = null;
        this.ui = null;
        this.minimap = null;
        this.collision = null;
        
        this.player = null;
        this.car = null;
        this.cars = [];
        this.npcs = [];
        
        // World systems
        this.terrain = null;
        this.city = null;
        this.water = null;
        this.airport = null;
        this.indoor = null;
        this.indoorScene = null;
        
        this.clock = new THREE.Clock();
        
        // GTA V style characters
        this.characters = [
            { name: 'Mike', emoji: '👔', color: 0x2244AA, message: "Yo, what's up? Looking for some action around here?" },
            { name: 'Frank', emoji: '🧢', color: 0x44AA22, message: "Hey man, you need a ride? I know this city like the back of my hand." },
            { name: 'Trevor', emoji: '🎸', color: 0xAA4422, message: "HAHA! You look lost, friend. Welcome to the chaos!" },
            { name: 'Lester', emoji: '🤓', color: 0x888888, message: "I've got some intel... if you're interested in making some money." },
            { name: 'Amanda', emoji: '💄', color: 0xFF6699, message: "This city has everything - beaches, mountains, opportunity..." }
        ];
        
        this.init();
    }
    
    init() {
        this.setupScene();
        this.setupRenderer();
        this.setupCamera();
        this.setupLighting();
        this.setupControls();
        this.setupSystems();
        this.createWorld();
        this.setupEventListeners();
        this.hideLoadingScreen();
        this.animate();
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        // GTA V style sky gradient
        this.scene.background = new THREE.Color(0x6B8CAE);
        // Extended fog for large open world
        this.scene.fog = new THREE.FogExp2(0x8BA4BE, 0.0015);
    }
    
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;
        document.getElementById('game-container').appendChild(this.renderer.domElement);
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            65,  // Wider FOV for GTA feel
            window.innerWidth / window.innerHeight,
            0.5,
            1500  // Extended far plane for large world
        );
        this.camera.position.set(0, 10, 20);
    }
    
    setupLighting() {
        // Ambient light (soft overall illumination)
        const ambient = new THREE.AmbientLight(0xFFF5E6, 0.6);
        this.scene.add(ambient);
        
        // Sun light (main directional) - GTA V style warm sun
        const sun = new THREE.DirectionalLight(0xFFE8D0, 1.5);
        sun.position.set(150, 200, 100);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 4096;
        sun.shadow.mapSize.height = 4096;
        sun.shadow.camera.near = 50;
        sun.shadow.camera.far = 600;
        sun.shadow.camera.left = -200;
        sun.shadow.camera.right = 200;
        sun.shadow.camera.top = 200;
        sun.shadow.camera.bottom = -200;
        sun.shadow.bias = -0.0002;
        this.scene.add(sun);
        
        // Fill light (softer, from opposite side)
        const fill = new THREE.DirectionalLight(0xA0D0E8, 0.4);
        fill.position.set(-100, 80, -80);
        this.scene.add(fill);
        
        // Hemisphere light for natural sky/ground color
        const hemi = new THREE.HemisphereLight(0x88BBDD, 0x557744, 0.4);
        this.scene.add(hemi);
    }
    
    setupControls() {
        this.controls = new Controls(this.renderer.domElement);
        this.controls.onInteract = () => this.handleInteraction();
        this.controls.onTalk = () => this.handleTalk();
        this.controls.onJump = () => {
            if (GameState.mode === 'walking' || GameState.mode === 'indoor') {
                this.player.jump();
            }
        };
        
        this.cameraController = new CameraController(this.camera, this.controls);
    }
    
    setupSystems() {
        this.ui = new UI();
        this.minimap = new Minimap('minimap-canvas');
        this.collision = new Collision();
        this.indoor = new Indoor();
    }
    
    createWorld() {
        console.log('Generating open world...');
        
        // Player
        this.player = new Player();
        this.scene.add(this.player.group);
        
        // Generate terrain with hills
        this.terrain = new Terrain(this.scene);
        this.terrain.generate();
        console.log('Terrain generated');
        
        // Generate city with buildings
        this.city = new City(this.scene);
        this.city.generate();
        console.log('City generated');
        
        // Generate water (ocean, river, lake)
        this.water = new Water(this.scene);
        this.water.generate();
        console.log('Water generated');
        
        // Generate airport
        this.airport = new Airport(this.scene);
        this.airport.generate();
        console.log('Airport generated');
        
        // Main player car in city
        this.car = new Car(20, 20);
        this.car.setGroundSampler((x, z) => this.terrain ? this.terrain.getHeightAt(x, z) : 0);
        this.scene.add(this.car.group);
        this.car.syncToGround();
        this.cars.push(this.car);
        
        // Additional cars around the city
        const carPositions = [
            { x: -30, z: 10, rot: Math.PI / 4 },
            { x: 50, z: -20, rot: -Math.PI / 2 },
            { x: -15, z: -45, rot: 0 },
            { x: 70, z: 35, rot: Math.PI },
            { x: -60, z: -30, rot: Math.PI / 3 }
        ];
        
        carPositions.forEach(pos => {
            const extraCar = new Car(pos.x, pos.z);
            extraCar.heading = pos.rot;
            extraCar.group.rotation.y = pos.rot;
            extraCar.setGroundSampler((x, z) => this.terrain ? this.terrain.getHeightAt(x, z) : 0);
            extraCar.syncToGround();
            this.scene.add(extraCar.group);
            this.cars.push(extraCar);
        });
        
        // NPCs around the city
        const npcPositions = [
            { x: 15, z: -25 },
            { x: -20, z: 15 },
            { x: 40, z: 40 },
            { x: -45, z: -20 },
            { x: 60, z: -40 }
        ];
        
        npcPositions.forEach((pos, i) => {
            const npc = new NPC(pos.x, pos.z, this.characters[i % this.characters.length]);
            this.npcs.push(npc);
            this.scene.add(npc.group);
        });
        
        // Add street lights throughout city
        this.createStreetLights();
        this.setupCameraColliders();
        
        console.log('World generation complete!');
    }
    
    /**
     * Create street lights throughout the city
     */
    createStreetLights() {
        const lightPositions = [];
        
        // Lights along roads
        for (let i = -100; i <= 100; i += 25) {
            lightPositions.push({ x: i, z: 4 });
            lightPositions.push({ x: i, z: -4 });
            lightPositions.push({ x: 4, z: i });
            lightPositions.push({ x: -4, z: i });
        }
        
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const lightMat = new THREE.MeshStandardMaterial({
            color: 0xFFDD88,
            emissive: 0xFFAA44,
            emissiveIntensity: 0.5
        });
        
        lightPositions.forEach(pos => {
            const pole = new THREE.Mesh(
                new THREE.CylinderGeometry(0.1, 0.15, 6),
                poleMat
            );
            pole.position.set(pos.x, 3, pos.z);
            pole.castShadow = true;
            this.scene.add(pole);
            
            // Light head
            const head = new THREE.Mesh(
                new THREE.BoxGeometry(1.2, 0.3, 0.5),
                poleMat
            );
            head.position.set(pos.x, 6.2, pos.z);
            this.scene.add(head);
            
            // Light bulb
            const bulb = new THREE.Mesh(
                new THREE.SphereGeometry(0.2),
                lightMat
            );
            bulb.position.set(pos.x, 6, pos.z);
            this.scene.add(bulb);
        });
    }
    
    setupCameraColliders() {
        const colliders = [];
        if (this.terrain?.mesh) colliders.push(this.terrain.mesh);
        if (this.city?.buildings?.length) colliders.push(...this.city.buildings);
        if (this.airport?.getCollisionMeshes) {
            colliders.push(...this.airport.getCollisionMeshes());
        }
        
        // Add tall lights as lightweight blockers to reduce wall clipping
        const streetLights = this.scene.children.filter(obj => obj.geometry instanceof THREE.CylinderGeometry);
        colliders.push(...streetLights);
        
        this.cameraController.setCollisionObjects(colliders);
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.onResize());
    }
    
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    hideLoadingScreen() {
        setTimeout(() => this.ui.hideLoadingScreen(), 1500);
    }
    
    handleInteraction() {
        const nearest = this.findNearestInteractable();
        if (!nearest) return;
        
        if (nearest.type === 'car') {
            if (GameState.mode === 'driving') {
                this.exitCar();
            } else if (GameState.mode === 'walking') {
                this.enterCar(nearest.object);
            }
        }
    }
    
    handleTalk() {
        const nearest = this.findNearestInteractable();
        if (nearest && nearest.type === 'npc') {
            this.ui.showFriendDialog(nearest.friend);
        }
    }
    
    enterCar(targetCar) {
        // Set the active car to the one we're entering
        this.car = targetCar;
        this.car.isOccupied = true;
        this.car.reset();
        GameState.mode = 'driving';
        this.player.group.visible = false;
        this.ui.updateMode('driving');
    }
    
    exitCar() {
        this.car.isOccupied = false;
        GameState.mode = 'walking';
        this.player.group.visible = true;
        const exitPos = this.car.getExitPosition();
        this.player.teleportTo(exitPos.x, 0, exitPos.z);
        this.ui.updateMode('walking');
    }
    
    findNearestInteractable() {
        const pos = GameState.mode === 'driving' ? this.car.position : this.player.group.position;
        let nearest = null;
        let nearestDist = Infinity;
        
        // Check all cars
        this.cars.forEach(car => {
            const carDist = pos.distanceTo(car.position);
            
            // If we're in a car, only show exit for the car we're in
            if (GameState.mode === 'driving') {
                if (car === this.car && carDist < 3) {
                    nearest = { type: 'car', object: car, distance: carDist };
                    nearestDist = carDist;
                }
            } else if (carDist < 5 && carDist < nearestDist) {
                nearest = { type: 'car', object: car, distance: carDist };
                nearestDist = carDist;
            }
        });
        
        // Check NPCs
        if (GameState.mode === 'walking') {
            this.npcs.forEach(npc => {
                const dist = pos.distanceTo(npc.group.position);
                if (dist < 4 && dist < nearestDist) {
                    nearest = { type: 'npc', friend: npc.friendData, distance: dist };
                    nearestDist = dist;
                }
            });
        }
        
        return nearest;
    }
    
    updateInteractionPrompt() {
        const nearest = this.findNearestInteractable();
        
        if (nearest) {
            GameState.nearbyInteractable = nearest;
            
            switch (nearest.type) {
                case 'car':
                    this.ui.showInteractionPrompt(this.car.isOccupied ? 
                        'Press <strong>E</strong> to exit car' : 'Press <strong>E</strong> to enter car');
                    break;
                case 'house':
                    this.ui.showInteractionPrompt(`Press <strong>E</strong> to visit ${nearest.object.friend.name}`);
                    break;
                case 'exit':
                    this.ui.showInteractionPrompt('Press <strong>E</strong> to go outside');
                    break;
                case 'npc':
                case 'indoor-friend':
                    this.ui.showInteractionPrompt(`Press <strong>F</strong> to talk to ${nearest.friend.name}`);
                    break;
            }
        } else {
            GameState.nearbyInteractable = null;
            this.ui.hideInteractionPrompt();
        }
    }
    
    updateLocation() {
        const pos = GameState.mode === 'driving' ? this.car.position : this.player.group.position;
        const x = pos.x;
        const z = pos.z;
        const distFromCenter = Math.sqrt(x * x + z * z);
        
        // Determine location based on world zones
        let location = 'Los Santos';
        
        // Airport area (northwest)
        if (x < -150 && z < -100) {
            location = 'Los Santos Airport';
        }
        // Ocean/Beach (south)
        else if (z > 200) {
            location = 'Vespucci Beach';
        }
        // River area
        else if (this.water && this.water.isInWater(x, z)) {
            location = 'Zancudo River';
        }
        // Lake area
        else if (Math.sqrt(Math.pow(x + 180, 2) + Math.pow(z + 150, 2)) < 40) {
            location = 'Mirror Park Lake';
        }
        // Downtown (center, high buildings)
        else if (distFromCenter < 50 && z < 0) {
            location = 'Downtown Los Santos';
        }
        // City center
        else if (distFromCenter < 100) {
            location = 'Vinewood';
        }
        // Hills
        else if (distFromCenter > 200) {
            const height = this.terrain ? this.terrain.getHeightAt(x, z) : 0;
            if (height > 30) {
                location = 'Mount Chiliad';
            } else if (height > 15) {
                location = 'Vinewood Hills';
            } else {
                location = 'Blaine County';
            }
        }
        // Suburbs
        else {
            location = 'Rockford Hills';
        }
        
        GameState.currentLocation = location;
        this.ui.updateLocation(GameState.currentLocation);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = Math.min(this.clock.getDelta(), 0.1);
        GameState.deltaTime = deltaTime;
        
        // Update controls
        this.controls.update(deltaTime);

        // Update ground reference for player
        if (GameState.mode !== 'indoor' && this.terrain) {
            const groundY = this.terrain.getHeightAt(this.player.group.position.x, this.player.group.position.z);
            this.player.groundY = groundY;
        } else {
            this.player.groundY = 0;
        }
        
        // Update entities based on mode
        let currentSpeed = 0;
        let isMoving = false;
        
        if (GameState.mode === 'driving') {
            this.car.update(this.controls, deltaTime);
            this.player.group.position.copy(this.car.position);
            currentSpeed = this.car.getSpeed();
            isMoving = currentSpeed > 0.5;
            
            // Camera shake when sliding/drifting
            const drift = this.car.getDriftAmount();
            if (drift > 0.05) {
                this.cameraController.triggerShake(0.05 + drift * 0.15, 10);
            }
        } else {
            this.player.update(this.controls, deltaTime);
            currentSpeed = this.player.getSpeed();
            isMoving = this.player.isMoving();
        }

        // Keep all cars glued to terrain
        if (this.terrain) {
            this.cars.forEach(car => car.syncToGround());
        }
        
        // Update NPCs
        this.npcs.forEach(npc => npc.update(deltaTime, this.player.group.position));
        
        // Update water animation
        if (this.water) {
            this.water.update(deltaTime);
        }
        
        // Update camera with GTA V style (pass speed for dynamic effects)
        const target = GameState.mode === 'driving' ? this.car.group : this.player.group;
        this.cameraController.update(target, deltaTime, currentSpeed, isMoving, this.controls.isRunning());
        
        // Update systems
        this.updateInteractionPrompt();
        this.updateLocation();
        
        // Update minimap (pass empty array for buildings for now)
        const playerPos = GameState.mode === 'driving' ? this.car.position : this.player.group.position;
        const playerRot = GameState.mode === 'driving' ? this.car.heading : this.player.rotation;
        this.minimap.update(playerPos, playerRot, [], this.car, this.car.isOccupied);
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
}

// Start game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
