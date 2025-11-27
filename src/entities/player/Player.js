import * as THREE from 'three';
import { GameState } from '../../core/GameState.js';
import { buildPlayerModel } from './PlayerModel.js';
import { updatePlayerMovement } from './PlayerMovement.js';

/**
 * GTA V style player with momentum-based movement and procedural animation.
 */
export class Player {
    constructor() {
        // Physics state
        this.velocity = new THREE.Vector3();
        this.acceleration = new THREE.Vector3();
        this.rotation = 0;
        this.targetRotation = 0;
        this.angularVelocity = 0;
        
        // Movement state
        this.moveState = 'idle'; // 'idle', 'walking', 'jogging', 'sprinting', 'stopping'
        this.strafing = false;
        this.movementBlend = 0; // 0 = idle, 1 = full speed
        
        // Grounded state
        this.isGrounded = true;
        this.groundY = 0;
        this.verticalVelocity = 0;
        
        // Procedural animation state
        this.anim = {
            cycle: 0,           // Main walk/run cycle
            cycleSpeed: 0,      // Current animation speed
            strideLength: 0,    // Current stride
            
            // Limb phases
            leftLegPhase: 0,
            rightLegPhase: Math.PI,
            leftArmPhase: Math.PI,
            rightArmPhase: 0,
            
            // Body motion
            bodyBob: 0,
            bodyLean: 0,
            bodyTwist: 0,
            hipSway: 0,
            turnLean: 0,
            
            // Blend weights
            walkWeight: 0,
            runWeight: 0,
            idleWeight: 1,
            
            // Idle animation
            breatheCycle: 0,
            lookAround: 0
        };
        
        // Foot IK targets (for future ground adaptation)
        this.footIK = {
            leftTarget: new THREE.Vector3(),
            rightTarget: new THREE.Vector3(),
            leftPlanted: false,
            rightPlanted: false
        };
        
        // Mesh and parts
        const { group, parts } = buildPlayerModel();
        this.group = group;
        this.parts = parts;
    }
    
    update(controls, deltaTime) {
        updatePlayerMovement(this, controls, deltaTime);
    }
    
    /**
     * Jump (GTA V style)
     */
    jump() {
        if (this.isGrounded) {
            const cfg = GameState.player;
            this.verticalVelocity = cfg.jumpForce;
            this.isGrounded = false;
        }
    }
    
    /**
     * Teleport player to position
     */
    teleportTo(x, y, z) {
        this.group.position.set(x, y, z);
        this.velocity.set(0, 0, 0);
    }
    
    /**
     * Get current speed
     */
    getSpeed() {
        return Math.sqrt(this.velocity.x ** 2 + this.velocity.z ** 2);
    }
    
    isMoving() {
        return this.getSpeed() > 0.1;
    }
}
