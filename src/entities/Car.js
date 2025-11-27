import * as THREE from 'three';
import { GameState } from '../core/GameState.js';
import { Materials } from '../core/Materials.js';

/**
 * GTA V style vehicle with realistic physics, grip, weight transfer, and drifting
 */
export class Car {
    constructor(x = 0, z = 0) {
        this.group = new THREE.Group();
        this.bodyMesh = null;  // Reference for visual effects
        
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
        this.wheels = [];
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
        
        this.createMesh();
        this.group.position.copy(this.position);
    }
    
    createMesh() {
        // Main body base
        const bodyBaseGeo = new THREE.BoxGeometry(2.3, 0.7, 3.8);
        const bodyBase = new THREE.Mesh(bodyBaseGeo, Materials.car.body);
        bodyBase.position.y = 0.55;
        bodyBase.castShadow = true;
        this.group.add(bodyBase);
        
        // Rounded front
        const frontGeo = new THREE.CylinderGeometry(0.35, 0.35, 2.1, 12);
        const front = new THREE.Mesh(frontGeo, Materials.car.body);
        front.rotation.z = Math.PI / 2;
        front.position.set(0, 0.55, 1.7);
        front.castShadow = true;
        this.group.add(front);
        
        // Cabin (top)
        const cabinGeo = new THREE.BoxGeometry(2.0, 0.75, 2.0);
        const cabin = new THREE.Mesh(cabinGeo, Materials.car.body);
        cabin.position.set(0, 1.2, -0.2);
        cabin.castShadow = true;
        this.group.add(cabin);
        
        // Windshield
        const windshieldGeo = new THREE.PlaneGeometry(1.8, 0.65);
        const windshield = new THREE.Mesh(windshieldGeo, Materials.car.window);
        windshield.position.set(0, 1.25, 0.82);
        windshield.rotation.x = -0.25;
        this.group.add(windshield);
        
        // Rear window
        const rearWindowGeo = new THREE.PlaneGeometry(1.7, 0.55);
        const rearWindow = new THREE.Mesh(rearWindowGeo, Materials.car.window);
        rearWindow.position.set(0, 1.25, -1.22);
        rearWindow.rotation.x = 0.2;
        rearWindow.rotation.y = Math.PI;
        this.group.add(rearWindow);
        
        // Side windows
        const sideWindowGeo = new THREE.PlaneGeometry(1.4, 0.55);
        const leftWindow = new THREE.Mesh(sideWindowGeo, Materials.car.window);
        leftWindow.position.set(-1.01, 1.25, -0.2);
        leftWindow.rotation.y = -Math.PI / 2;
        this.group.add(leftWindow);
        
        const rightWindow = new THREE.Mesh(sideWindowGeo, Materials.car.window);
        rightWindow.position.set(1.01, 1.25, -0.2);
        rightWindow.rotation.y = Math.PI / 2;
        this.group.add(rightWindow);
        
        // Wheels
        const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 20);
        const wheelPositions = [
            [-1.0, 0.35, 1.15],
            [1.0, 0.35, 1.15],
            [-1.0, 0.35, -1.15],
            [1.0, 0.35, -1.15]
        ];
        
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeo, Materials.car.wheel);
            wheel.position.set(...pos);
            wheel.rotation.z = Math.PI / 2;
            wheel.castShadow = true;
            this.group.add(wheel);
            this.wheels.push(wheel);
            
            // Wheel rim detail
            const rimGeo = new THREE.CircleGeometry(0.25, 6);
            const rimMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.5 });
            const rimL = new THREE.Mesh(rimGeo, rimMat);
            rimL.position.set(pos[0] - 0.13, pos[1], pos[2]);
            rimL.rotation.y = -Math.PI / 2;
            this.group.add(rimL);
            
            const rimR = new THREE.Mesh(rimGeo, rimMat);
            rimR.position.set(pos[0] + 0.13, pos[1], pos[2]);
            rimR.rotation.y = Math.PI / 2;
            this.group.add(rimR);
        });
        
        // Headlights
        const headlightGeo = new THREE.SphereGeometry(0.14, 12, 12);
        const headlightMat = new THREE.MeshStandardMaterial({ 
            color: 0xFFFF99, 
            emissive: 0xFFFF66, 
            emissiveIntensity: 0.6 
        });
        
        const leftHeadlight = new THREE.Mesh(headlightGeo, headlightMat);
        leftHeadlight.position.set(-0.7, 0.55, 1.9);
        this.group.add(leftHeadlight);
        
        const rightHeadlight = new THREE.Mesh(headlightGeo, headlightMat);
        rightHeadlight.position.set(0.7, 0.55, 1.9);
        this.group.add(rightHeadlight);
        
        // Tail lights
        const tailLightGeo = new THREE.BoxGeometry(0.3, 0.15, 0.05);
        const tailLightMat = new THREE.MeshStandardMaterial({ 
            color: 0xFF3333, 
            emissive: 0xFF0000, 
            emissiveIntensity: 0.3 
        });
        
        const leftTail = new THREE.Mesh(tailLightGeo, tailLightMat);
        leftTail.position.set(-0.8, 0.65, -1.9);
        this.group.add(leftTail);
        
        const rightTail = new THREE.Mesh(tailLightGeo, tailLightMat);
        rightTail.position.set(0.8, 0.65, -1.9);
        this.group.add(rightTail);
        
        // Cute face - eyes as headlights, smile
        const smileGeo = new THREE.TorusGeometry(0.25, 0.04, 8, 16, Math.PI);
        const smileMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const smile = new THREE.Mesh(smileGeo, smileMat);
        smile.position.set(0, 0.38, 1.91);
        smile.rotation.x = Math.PI;
        this.group.add(smile);
    }
    
    /**
     * GTA V style vehicle physics update
     */
    update(controls, deltaTime) {
        if (!this.isOccupied || GameState.mode !== 'driving') return;
        
        const cfg = GameState.vehicle;
        const isBoost = controls.isRunning();
        
        // --- Process inputs ---
        this.processInputs(controls, deltaTime);
        
        // --- Calculate local velocity (car's reference frame) ---
        const forward = new THREE.Vector3(Math.sin(this.heading), 0, Math.cos(this.heading));
        const right = new THREE.Vector3(Math.cos(this.heading), 0, -Math.sin(this.heading));
        
        this.forwardSpeed = this.velocity.dot(forward);
        const lateralSpeed = this.velocity.dot(right);
        this.localVelocity.set(lateralSpeed, this.forwardSpeed);
        
        this.speed = this.velocity.length();
        
        // --- Engine force ---
        const maxSpeed = isBoost ? cfg.maxSpeed * cfg.boostMultiplier : cfg.maxSpeed;
        let engineForce = 0;
        
        if (this.throttle > 0) {
            // Forward acceleration (decreases as approaching max speed)
            const speedFactor = 1 - Math.pow(Math.abs(this.forwardSpeed) / maxSpeed, 2);
            engineForce = cfg.engineForce * this.throttle * Math.max(0, speedFactor);
        } else if (this.throttle < 0) {
            if (this.forwardSpeed > 0.5) {
                // Braking
                engineForce = -cfg.brakeForce * Math.abs(this.throttle);
            } else {
                // Reverse
                const reverseMax = maxSpeed * 0.3;
                const speedFactor = 1 - Math.pow(Math.abs(this.forwardSpeed) / reverseMax, 2);
                engineForce = -cfg.reverseForce * Math.abs(this.throttle) * Math.max(0, speedFactor);
            }
        }
        
        // --- Steering ---
        // Steering angle based on speed (tighter at low speed)
        const speedSteerFactor = 1 / (1 + this.speed * 0.08);
        const targetSteerAngle = this.steerInput * cfg.maxSteeringAngle * speedSteerFactor;
        
        // Smooth steering
        const steerSpeed = this.steerInput !== 0 ? cfg.steeringSpeed : cfg.steeringReturnSpeed;
        this.steerAngle = THREE.MathUtils.lerp(this.steerAngle, targetSteerAngle, steerSpeed * deltaTime);
        
        // --- Tire forces ---
        // Front tire grip
        let frontGrip = cfg.frontGrip;
        // Rear tire grip (less = more oversteer/drift)
        let rearGrip = cfg.rearGrip;

        // Weight transfer (more front grip while braking, more rear grip on accel)
        const isBraking = this.throttle < 0 && this.forwardSpeed > 0.5;
        const accelLoad = THREE.MathUtils.clamp(this.throttle, -1, 1);
        const transfer = THREE.MathUtils.clamp(accelLoad * 0.5, -0.8, 0.8);
        frontGrip *= 1 - transfer * 0.5;
        rearGrip *= 1 + transfer * 0.5;
        if (isBraking) {
            const brakeShift = Math.abs(this.throttle) * 0.6;
            frontGrip *= 1 + brakeShift;
            rearGrip *= 1 - brakeShift * 0.4;
        }
        
        // Handbrake reduces rear grip dramatically
        if (this.handbrake) {
            rearGrip *= 0.3;
            this.isDrifting = Math.abs(lateralSpeed) > 2;
        }
        
        // --- Calculate slip angle for drift detection ---
        if (this.speed > 1) {
            this.driftAngle = Math.atan2(lateralSpeed, Math.abs(this.forwardSpeed));
            this.isDrifting = Math.abs(this.driftAngle) > 0.15;
            this.driftFactor = THREE.MathUtils.lerp(this.driftFactor, this.isDrifting ? 1 : 0, deltaTime * 5);
        } else {
            this.driftAngle = 0;
            this.driftFactor *= 0.95;
        }
        
        // --- Angular velocity (turning) ---
        if (this.speed > 0.5) {
            // Ackermann-ish steering - turn rate based on steering and speed
            const turnRadius = 3.0 / Math.tan(Math.abs(this.steerAngle) + 0.001);
            const idealAngularVel = (this.forwardSpeed / turnRadius) * Math.sign(this.steerAngle);
            
            // Apply with grip factor
            const gripFactor = Math.min(frontGrip, rearGrip);
            const targetAngularVel = idealAngularVel * gripFactor;
            
            // Add drift contribution (rear slides out)
            const driftAngular = -lateralSpeed * 0.15 * (1 - rearGrip);
            
            this.angularVelocity = THREE.MathUtils.lerp(
                this.angularVelocity,
                targetAngularVel + driftAngular,
                deltaTime * 8
            );
        } else {
            this.angularVelocity *= 0.9;
        }
        
        // --- Apply forces ---
        // Engine force along forward direction
        const acceleration = new THREE.Vector3();
        acceleration.add(forward.clone().multiplyScalar(engineForce / cfg.mass));
        
        // Lateral friction (grip)
        const lateralFriction = -lateralSpeed * rearGrip * cfg.driftFactor * 8;
        acceleration.add(right.clone().multiplyScalar(lateralFriction));
        
        // Rolling resistance & drag
        const dragForce = -cfg.dragCoefficient * this.speed * this.speed * Math.sign(this.forwardSpeed);
        const rollingForce = -cfg.rollingResistance * cfg.mass * 9.8 * Math.sign(this.forwardSpeed);
        acceleration.add(forward.clone().multiplyScalar((dragForce + rollingForce) / cfg.mass));
        
        // Update velocity
        this.velocity.add(acceleration.multiplyScalar(deltaTime));
        
        // Apply angular velocity
        this.heading += this.angularVelocity * deltaTime;
        
        // Update position
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));

        // Follow terrain
        if (this.sampleGroundHeight) {
            const groundY = this.sampleGroundHeight(this.position.x, this.position.z);
            this.position.y = groundY + 0.35;
        }
        
        // --- Visual effects ---
        this.updateVisuals(deltaTime);
        
        // --- Update Three.js group ---
        this.group.position.copy(this.position);
        this.group.rotation.y = this.heading;
    }
    
    /**
     * Process control inputs with smoothing
     */
    processInputs(controls, deltaTime) {
        // Throttle
        let targetThrottle = 0;
        if (controls.keys['w']) targetThrottle = 1;
        if (controls.keys['s']) targetThrottle = -1;
        this.throttle = THREE.MathUtils.lerp(this.throttle, targetThrottle, deltaTime * 8);
        
        // Steering
        let targetSteer = 0;
        if (controls.keys['a']) targetSteer = 1;
        if (controls.keys['d']) targetSteer = -1;
        this.steerInput = THREE.MathUtils.lerp(this.steerInput, targetSteer, deltaTime * 10);
        
        // Handbrake
        this.handbrake = controls.keys[' '];
    }
    
    /**
     * Update visual effects (body roll, pitch, wheels)
     */
    updateVisuals(deltaTime) {
        const cfg = GameState.vehicle;
        
        // Body roll (lean into turns)
        const targetRoll = -this.angularVelocity * this.speed * cfg.bodyRoll;
        this.bodyRoll = THREE.MathUtils.lerp(this.bodyRoll, targetRoll, deltaTime * 10);
        
        // Body pitch (nose up on accel, down on brake)
        let targetPitch = 0;
        if (this.throttle > 0) targetPitch = -cfg.pitchOnAccel * this.throttle;
        if (this.throttle < 0 && this.forwardSpeed > 0) targetPitch = cfg.pitchOnBrake * Math.abs(this.throttle);
        this.bodyPitch = THREE.MathUtils.lerp(this.bodyPitch, targetPitch, deltaTime * 8);
        
        // Apply body transform (to cabin/body mesh if we had separate reference)
        // For now, apply subtle effect to whole group
        this.group.rotation.z = this.bodyRoll * 0.3;
        this.group.rotation.x = this.bodyPitch * 0.3;
        
        // Wheel rotation (spinning)
        this.wheelRotation += this.forwardSpeed * deltaTime * 2.5;
        
        // Front wheel steering angle
        this.frontWheelAngle = THREE.MathUtils.lerp(this.frontWheelAngle, this.steerAngle, deltaTime * 12);
        
        // Apply to wheel meshes
        this.wheels.forEach((wheel, i) => {
            wheel.rotation.x = this.wheelRotation;
            // Front wheels turn
            if (i < 2) {
                wheel.rotation.y = this.frontWheelAngle;
            }
        });
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
