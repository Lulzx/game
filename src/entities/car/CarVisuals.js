import * as THREE from 'three';
import { GameState } from '../../core/GameState.js';

/**
 * Updates roll/pitch and wheel animation for the car.
 */
export function updateCarVisuals(car, deltaTime) {
    const cfg = GameState.vehicle;
    
    // Body roll (lean into turns)
    const targetRoll = -car.angularVelocity * car.speed * cfg.bodyRoll;
    car.bodyRoll = THREE.MathUtils.lerp(car.bodyRoll, targetRoll, deltaTime * 10);
    
    // Body pitch (nose up on accel, down on brake)
    let targetPitch = 0;
    if (car.throttle > 0) targetPitch = -cfg.pitchOnAccel * car.throttle;
    if (car.throttle < 0 && car.forwardSpeed > 0) targetPitch = cfg.pitchOnBrake * Math.abs(car.throttle);
    car.bodyPitch = THREE.MathUtils.lerp(car.bodyPitch, targetPitch, deltaTime * 8);
    
    // Apply body transform (to cabin/body mesh if we had separate reference)
    // For now, apply subtle effect to whole group
    car.group.rotation.z = car.bodyRoll * 0.3;
    car.group.rotation.x = car.bodyPitch * 0.3;
    
    // Wheel rotation (spinning)
    car.wheelRotation += car.forwardSpeed * deltaTime * 2.5;
    
    // Front wheel steering angle
    car.frontWheelAngle = THREE.MathUtils.lerp(car.frontWheelAngle, car.steerAngle, deltaTime * 12);
    
    // Apply to wheel meshes
    car.wheels.forEach((wheel, i) => {
        wheel.rotation.x = car.wheelRotation;
        // Front wheels turn
        if (i < 2) {
            wheel.rotation.y = car.frontWheelAngle;
        }
    });
}
