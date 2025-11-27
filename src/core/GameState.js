/**
 * Central game state management - GTA V style physics
 */
export const GameState = {
    mode: 'walking', // 'walking', 'driving', 'indoor'
    currentLocation: 'Town Square',
    nearbyInteractable: null,
    isInsideHouse: false,
    currentHouse: null,
    isPaused: false,
    deltaTime: 0,
    lastTime: 0,
    
    // GTA V style character physics
    player: {
        // Movement
        walkSpeed: 4.5,
        jogSpeed: 6.5,
        sprintSpeed: 9.5,
        acceleration: 18,          // How fast to reach max speed
        deceleration: 22,          // How fast to stop (friction)
        airControl: 0.3,           // Control while in air
        
        // Turning
        turnSpeedIdle: 8,          // Turn speed when standing still
        turnSpeedWalk: 5,          // Turn speed while walking
        turnSpeedSprint: 3,        // Turn speed while sprinting (slower, more realistic)
        
        // Vertical
        gravity: 28,
        jumpForce: 9,
        terminalVelocity: 50,
        
        // Stamina (optional)
        maxStamina: 100,
        staminaDrain: 15,          // Per second while sprinting
        staminaRegen: 25           // Per second while not sprinting
    },
    
    // GTA V style vehicle physics
    vehicle: {
        // Engine
        engineForce: 4500,
        brakeForce: 6000,
        reverseForce: 2000,
        maxSpeed: 45,              // m/s (~162 km/h)
        boostMultiplier: 1.4,
        
        // Handling
        steeringSpeed: 3.5,        // How fast steering responds
        steeringReturnSpeed: 5,    // How fast steering centers
        maxSteeringAngle: 0.6,     // Radians
        
        // Grip & Drift
        frontGrip: 1.0,
        rearGrip: 0.85,            // Less rear grip = easier drift
        driftFactor: 0.92,         // Lateral slip factor
        tractionControl: 0.95,
        
        // Mass & Inertia
        mass: 1500,                // kg
        dragCoefficient: 0.35,
        rollingResistance: 0.015,
        
        // Suspension feel
        bodyRoll: 0.08,            // How much car leans in turns
        pitchOnAccel: 0.04,        // Nose up on acceleration
        pitchOnBrake: 0.06         // Nose down on braking
    },
    
    // Camera settings - optimized for large open world
    camera: {
        // Follow - faster for responsive feel
        followSmoothing: 8,
        lookSmoothing: 15,
        
        // Distances - pulled back for better view
        walkDistance: 8,
        walkHeight: 4,
        driveDistance: 14,
        driveHeight: 5,
        driveSpeedZoom: 6,         // Extra distance at high speed
        
        // Effects
        fovBase: 65,
        fovSprintBoost: 10,
        fovDriveBoost: 20,         // Dramatic FOV at high speed
        shakeIntensity: 0,
        
        // Mouse sensitivity
        mouseSensitivity: 0.003,
        mouseSmoothing: 0.12
    }
};

export function updateGameState(updates) {
    Object.assign(GameState, updates);
}
