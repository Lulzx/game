import * as THREE from 'three';

/**
 * Simple collision detection system
 */
export class Collision {
    constructor() {
        this.obstacles = [];
    }
    
    addObstacle(position, radius) {
        this.obstacles.push({ position: position.clone(), radius });
    }
    
    addHouse(house) {
        // Add house as obstacle (simplified as cylinder)
        this.obstacles.push({
            position: house.group.position.clone(),
            radius: 5
        });
    }
    
    /**
     * Check and resolve collision for a position
     * @returns {THREE.Vector3} Corrected position
     */
    resolveCollision(position, entityRadius = 0.5) {
        const corrected = position.clone();
        
        for (const obstacle of this.obstacles) {
            const dist = corrected.distanceTo(obstacle.position);
            const minDist = obstacle.radius + entityRadius;
            
            if (dist < minDist && dist > 0) {
                // Push out of obstacle
                const pushDir = corrected.clone().sub(obstacle.position).normalize();
                corrected.copy(obstacle.position).add(pushDir.multiplyScalar(minDist));
            }
        }
        
        return corrected;
    }
    
    /**
     * Check if movement would cause collision
     */
    wouldCollide(from, to, entityRadius = 0.5) {
        for (const obstacle of this.obstacles) {
            const dist = to.distanceTo(obstacle.position);
            if (dist < obstacle.radius + entityRadius) {
                return true;
            }
        }
        return false;
    }
    
    clear() {
        this.obstacles = [];
    }
}
