import * as THREE from 'three';
import { GameState } from '../../core/GameState.js';
import { applyCarInputs } from './CarControls.js';
import { updateCarVisuals } from './CarVisuals.js';

/**
 * Full vehicle physics update with drift, grip, and visual sync.
 */
export function updateCarPhysics(car, controls, deltaTime) {
    if (!car.isOccupied || GameState.mode !== 'driving') return;
    
    const cfg = GameState.vehicle;
    const isBoost = controls.isRunning();
    
    applyCarInputs(car, controls, deltaTime);
    
    // --- Calculate local velocity (car's reference frame) ---
    const forward = new THREE.Vector3(Math.sin(car.heading), 0, Math.cos(car.heading));
    const right = new THREE.Vector3(Math.cos(car.heading), 0, -Math.sin(car.heading));
    
    car.forwardSpeed = car.velocity.dot(forward);
    const lateralSpeed = car.velocity.dot(right);
    car.localVelocity.set(lateralSpeed, car.forwardSpeed);
    car.speed = car.velocity.length();
    
    // --- Engine force ---
    const maxSpeed = isBoost ? cfg.maxSpeed * cfg.boostMultiplier : cfg.maxSpeed;
    let engineForce = 0;
    
    if (car.throttle > 0) {
        // Forward acceleration (decreases as approaching max speed)
        const speedFactor = 1 - Math.pow(Math.abs(car.forwardSpeed) / maxSpeed, 2);
        engineForce = cfg.engineForce * car.throttle * Math.max(0, speedFactor);
    } else if (car.throttle < 0) {
        if (car.forwardSpeed > 0.5) {
            // Braking
            engineForce = -cfg.brakeForce * Math.abs(car.throttle);
        } else {
            // Reverse
            const reverseMax = maxSpeed * 0.3;
            const speedFactor = 1 - Math.pow(Math.abs(car.forwardSpeed) / reverseMax, 2);
            engineForce = -cfg.reverseForce * Math.abs(car.throttle) * Math.max(0, speedFactor);
        }
    }
    
    // --- Steering ---
    const speedSteerFactor = 1 / (1 + car.speed * 0.08);
    const targetSteerAngle = car.steerInput * cfg.maxSteeringAngle * speedSteerFactor;
    
    // Smooth steering
    const steerSpeed = car.steerInput !== 0 ? cfg.steeringSpeed : cfg.steeringReturnSpeed;
    car.steerAngle = THREE.MathUtils.lerp(car.steerAngle, targetSteerAngle, steerSpeed * deltaTime);
    
    // --- Tire forces ---
    let frontGrip = cfg.frontGrip;
    let rearGrip = cfg.rearGrip;

    // Weight transfer (more front grip while braking, more rear grip on accel)
    const isBraking = car.throttle < 0 && car.forwardSpeed > 0.5;
    const accelLoad = THREE.MathUtils.clamp(car.throttle, -1, 1);
    const transfer = THREE.MathUtils.clamp(accelLoad * 0.5, -0.8, 0.8);
    frontGrip *= 1 - transfer * 0.5;
    rearGrip *= 1 + transfer * 0.5;
    if (isBraking) {
        const brakeShift = Math.abs(car.throttle) * 0.6;
        frontGrip *= 1 + brakeShift;
        rearGrip *= 1 - brakeShift * 0.4;
    }
    
    // Handbrake reduces rear grip dramatically
    if (car.handbrake) {
        rearGrip *= 0.3;
        car.isDrifting = Math.abs(lateralSpeed) > 2;
    }
    
    // --- Calculate slip angle for drift detection ---
    if (car.speed > 1) {
        car.driftAngle = Math.atan2(lateralSpeed, Math.abs(car.forwardSpeed));
        car.isDrifting = Math.abs(car.driftAngle) > 0.15;
        car.driftFactor = THREE.MathUtils.lerp(car.driftFactor, car.isDrifting ? 1 : 0, deltaTime * 5);
    } else {
        car.driftAngle = 0;
        car.driftFactor *= 0.95;
    }
    
    // --- Angular velocity (turning) ---
    if (car.speed > 0.5) {
        // Ackermann-ish steering - turn rate based on steering and speed
        const turnRadius = 3.0 / Math.tan(Math.abs(car.steerAngle) + 0.001);
        const idealAngularVel = (car.forwardSpeed / turnRadius) * Math.sign(car.steerAngle);
        
        // Apply with grip factor
        const gripFactor = Math.min(frontGrip, rearGrip);
        const targetAngularVel = idealAngularVel * gripFactor;
        
        // Add drift contribution (rear slides out)
        const driftAngular = -lateralSpeed * 0.15 * (1 - rearGrip);
        
        car.angularVelocity = THREE.MathUtils.lerp(
            car.angularVelocity,
            targetAngularVel + driftAngular,
            deltaTime * 8
        );
    } else {
        car.angularVelocity *= 0.9;
    }
    
    // --- Apply forces ---
    // Engine force along forward direction
    const acceleration = new THREE.Vector3();
    acceleration.add(forward.clone().multiplyScalar(engineForce / cfg.mass));
    
    // Lateral friction (grip)
    const lateralFriction = -lateralSpeed * rearGrip * cfg.driftFactor * 8;
    acceleration.add(right.clone().multiplyScalar(lateralFriction));
    
    // Rolling resistance & drag
    const dragForce = -cfg.dragCoefficient * car.speed * car.speed * Math.sign(car.forwardSpeed);
    const rollingForce = -cfg.rollingResistance * cfg.mass * 9.8 * Math.sign(car.forwardSpeed);
    acceleration.add(forward.clone().multiplyScalar((dragForce + rollingForce) / cfg.mass));
    
    // Update velocity
    car.velocity.add(acceleration.multiplyScalar(deltaTime));
    
    // Apply angular velocity
    car.heading += car.angularVelocity * deltaTime;
    
    // Update position
    car.position.add(car.velocity.clone().multiplyScalar(deltaTime));

    // Follow terrain
    if (car.sampleGroundHeight) {
        const groundY = car.sampleGroundHeight(car.position.x, car.position.z);
        car.position.y = groundY + 0.35;
    }
    
    // --- Visual effects ---
    updateCarVisuals(car, deltaTime);
    
    // --- Update Three.js group ---
    car.group.position.copy(car.position);
    car.group.rotation.y = car.heading;
}
