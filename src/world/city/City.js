import { generateRoads } from './CityRoads.js';
import { generateBuildings } from './CityBuildings.js';
import { generateDowntown } from './CityDowntown.js';
import { generateLandmarks } from './CityLandmarks.js';

/**
 * Procedural city generation with buildings, roads, and landmarks.
 */
export class City {
    constructor(scene) {
        this.scene = scene;
        this.buildings = [];
        this.roads = [];
        
        this.cityRadius = 120;
        this.blockSize = 25;
        this.roadWidth = 8;
    }
    
    generate() {
        generateRoads(this);
        generateBuildings(this);
        generateDowntown(this);
        generateLandmarks(this);
    }
    
    getColliders() {
        return this.buildings.map(b => ({
            position: b.position.clone(),
            radius: 8
        }));
    }
}
