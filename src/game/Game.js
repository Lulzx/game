import * as THREE from 'three';
import { GameState } from '../core/GameState.js';
import { createScene } from './setup/createScene.js';
import { createRenderer } from './setup/createRenderer.js';
import { createCamera } from './setup/createCamera.js';
import { setupLighting } from './setup/setupLighting.js';
import { setupControls } from './setup/setupControls.js';
import { setupSystems } from './setup/setupSystems.js';
import { setupEvents } from './setup/setupEvents.js';
import { buildWorld } from './world/buildWorld.js';
import { runGameLoop } from './loop/gameLoop.js';
import { handleInteraction, handleTalk, enterCar, exitCar, findNearestInteractable } from './interaction/interactionService.js';
import { characters } from './data/characters.js';

/**
 * Mini GTA V - Open World Game orchestrator.
 */
export class Game {
    constructor() {
        this.scene = createScene();
        this.camera = createCamera();
        this.renderer = createRenderer();
        
        this.controls = null;
        this.cameraController = null;
        this.ui = null;
        this.minimap = null;
        this.collision = null;
        this.indoor = null;
        
        this.player = null;
        this.car = null;
        this.cars = [];
        this.npcs = [];
        
        this.terrain = null;
        this.city = null;
        this.water = null;
        this.airport = null;
        this.indoorScene = null;
        
        this.clock = new THREE.Clock();
        this.characters = characters;
        
        this.init();
    }
    
    init() {
        setupLighting(this.scene);
        
        const { controls, cameraController } = setupControls(this.camera, this.renderer.domElement, {
            onInteract: () => this.handleInteraction(),
            onTalk: () => this.handleTalk(),
            onJump: () => {
                if (GameState.mode === 'walking' || GameState.mode === 'indoor') {
                    this.player.jump();
                }
            }
        });
        this.controls = controls;
        this.cameraController = cameraController;
        
        const systems = setupSystems();
        this.ui = systems.ui;
        this.minimap = systems.minimap;
        this.collision = systems.collision;
        this.indoor = systems.indoor;
        
        buildWorld(this);
        setupEvents(this);
        this.hideLoadingScreen();
        runGameLoop(this);
    }
    
    hideLoadingScreen() {
        setTimeout(() => this.ui.hideLoadingScreen(), 1500);
    }
    
    handleInteraction() {
        handleInteraction(this);
    }
    
    handleTalk() {
        handleTalk(this);
    }
    
    enterCar(targetCar) {
        enterCar(this, targetCar);
    }
    
    exitCar() {
        exitCar(this);
    }
    
    findNearestInteractable() {
        return findNearestInteractable(this);
    }
}
