import * as THREE from 'three';

/**
 * Smoothly lerps car inputs for better feel.
 */
export function applyCarInputs(car, controls, deltaTime) {
    let targetThrottle = 0;
    if (controls.keys['w']) targetThrottle = 1;
    if (controls.keys['s']) targetThrottle = -1;
    car.throttle = THREE.MathUtils.lerp(car.throttle, targetThrottle, deltaTime * 8);
    
    // Steering
    let targetSteer = 0;
    if (controls.keys['a']) targetSteer = 1;
    if (controls.keys['d']) targetSteer = -1;
    car.steerInput = THREE.MathUtils.lerp(car.steerInput, targetSteer, deltaTime * 10);
    
    // Handbrake
    car.handbrake = controls.keys[' '];
}
