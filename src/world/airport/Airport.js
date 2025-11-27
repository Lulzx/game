import { createRunway } from './Runway.js';
import { createTerminal } from './Terminal.js';
import { createControlTower } from './ControlTower.js';
import { createHangars } from './Hangars.js';
import { createAircraft } from './Aircraft.js';
import { createTaxiways } from './Taxiways.js';

/**
 * Airport with runway, terminal, and aircraft.
 */
export class Airport {
    constructor(scene) {
        this.scene = scene;
        this.aircraft = [];
        this.collisionMeshes = [];
    }
    
    generate() {
        const baseX = -200;
        const baseZ = -200;
        
        createRunway(this, baseX, baseZ);
        createTerminal(this, baseX + 50, baseZ);
        createControlTower(this, baseX + 80, baseZ - 30);
        createHangars(this, baseX + 30, baseZ + 60);
        createAircraft(this, baseX, baseZ);
        createTaxiways(this, baseX, baseZ);
    }

    trackCollider(object) {
        if (object) {
            this.collisionMeshes.push(object);
        }
    }

    getCollisionMeshes() {
        return this.collisionMeshes;
    }
}
