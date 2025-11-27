import * as THREE from 'three';
import { buildCarModel } from './CarMesh.js';
import { updateCarPhysics } from './CarPhysics.js';

/**
 * GTA V style vehicle with realistic physics, grip, weight transfer, and drifting.
 */
export class Car {
    constructor(x = 0, z = 0) {
        // Scene graph
        const { group, wheels, bodyMesh } = buildCarModel();
        this.group = group;
        this.wheels = wheels;
        this.bodyMesh = bodyMesh;
        
        // Physics state
        this.position = new THREE.Vector3(x, 0, z);
        this.velocity = new THREE.Vector3();
        this.localVelocity = new THREE.Vector2(); // Forward/lateral in car space
        this.heading = 0;              // Car's facing direction
        this.angularVelocity = 0;
        this.sampleGroundHeight = null; // Optional ground sampler callback
        
        // Control state
        this.throttle = 0;             // -1 to 1
        this.brake = 0;                // 0 to 1
        this.steerInput = 0;           // -1 to 1 (input)
        this.steerAngle = 0;           // Actual wheel angle
        this.handbrake = false;
        this.isOccupied = false;
        
        // Wheel state
        this.wheelRotation = 0;
        this.frontWheelAngle = 0;
        
        // Visual effects state
        this.bodyRoll = 0;
        this.bodyPitch = 0;
        this.suspensionOffset = 0;
        
        // Drift state
        this.driftAngle = 0;
        this.isDrifting = false;
        this.driftFactor = 0;
        
        // Speed tracking
        this.speed = 0;                // m/s
        this.forwardSpeed = 0;         // Signed forward speed
        
        this.group.position.copy(this.position);
    }
    
    update(controls, deltaTime) {
        updateCarPhysics(this, controls, deltaTime);
    }

    /**
     * Provide a ground sampler callback so the car can hug terrain
     */
    setGroundSampler(fn) {
        this.sampleGroundHeight = fn;
    }

    /**
     * Force-align the car to ground height (for parked cars)
     */
    syncToGround() {
        if (!this.sampleGroundHeight) return;
        const groundY = this.sampleGroundHeight(this.position.x, this.position.z);
        this.position.y = groundY + 0.35;
        this.group.position.y = this.position.y;
    }
    
    /**
     * How much the car is sliding (0-1)
     */
    getDriftAmount() {
        return Math.min(1, Math.abs(this.driftAngle) * 2) * Math.min(1, this.speed / 20);
    }
    
    /**
     * Get current speed in m/s
     */
    getSpeed() {
        return this.speed;
    }
    
    /**
     * Get speed in km/h for UI
     */
    getSpeedKmh() {
        return this.speed * 3.6;
    }
    
    /**
     * Get the exit position for the player
     */
    getExitPosition() {
        const exitOffset = new THREE.Vector3(2.5, 0, 0);
        exitOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.heading);
        return this.position.clone().add(exitOffset);
    }
    
    /**
     * Check if a position is near the car
     */
    isNearby(position, threshold = 4) {
        return this.position.distanceTo(position) < threshold;
    }
    
    /**
     * Reset car state (when entering)
     */
    reset() {
        this.throttle = 0;
        this.brake = 0;
        this.steerInput = 0;
        this.steerAngle = 0;
        this.handbrake = false;
    }
}
