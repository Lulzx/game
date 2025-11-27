import { Player } from '../../entities/player/Player.js';
import { Car } from '../../entities/car/Car.js';
import { NPC } from '../../entities/npc/NPC.js';
import { Terrain } from '../../world/Terrain.js';
import { City } from '../../world/city/City.js';
import { Water } from '../../world/Water.js';
import { Airport } from '../../world/airport/Airport.js';
import { createStreetLights } from './streetLights.js';
import { setupCameraColliders } from './cameraColliders.js';

export function buildWorld(game) {
    console.log('Generating open world...');
    
    // Player
    game.player = new Player();
    game.scene.add(game.player.group);
    
    // Generate terrain with hills
    game.terrain = new Terrain(game.scene);
    game.terrain.generate();
    console.log('Terrain generated');
    
    // Generate city with buildings
    game.city = new City(game.scene);
    game.city.generate();
    console.log('City generated');
    
    // Generate water (ocean, river, lake)
    game.water = new Water(game.scene);
    game.water.generate();
    console.log('Water generated');
    
    // Generate airport
    game.airport = new Airport(game.scene);
    game.airport.generate();
    console.log('Airport generated');
    
    // Main player car in city
    game.car = new Car(20, 20);
    game.car.setGroundSampler((x, z) => game.terrain ? game.terrain.getHeightAt(x, z) : 0);
    game.scene.add(game.car.group);
    game.car.syncToGround();
    game.cars.push(game.car);
    
    // Additional cars around the city
    const carPositions = [
        { x: -30, z: 10, rot: Math.PI / 4 },
        { x: 50, z: -20, rot: -Math.PI / 2 },
        { x: -15, z: -45, rot: 0 },
        { x: 70, z: 35, rot: Math.PI },
        { x: -60, z: -30, rot: Math.PI / 3 }
    ];
    
    carPositions.forEach(pos => {
        const extraCar = new Car(pos.x, pos.z);
        extraCar.heading = pos.rot;
        extraCar.group.rotation.y = pos.rot;
        extraCar.setGroundSampler((x, z) => game.terrain ? game.terrain.getHeightAt(x, z) : 0);
        extraCar.syncToGround();
        game.scene.add(extraCar.group);
        game.cars.push(extraCar);
    });
    
    // NPCs around the city
    const npcPositions = [
        { x: 15, z: -25 },
        { x: -20, z: 15 },
        { x: 40, z: 40 },
        { x: -45, z: -20 },
        { x: 60, z: -40 }
    ];
    
    npcPositions.forEach((pos, i) => {
        const npc = new NPC(pos.x, pos.z, game.characters[i % game.characters.length]);
        game.npcs.push(npc);
        game.scene.add(npc.group);
    });
    
    // Add street lights throughout city
    createStreetLights(game.scene);
    setupCameraColliders(game);
    
    console.log('World generation complete!');
}
