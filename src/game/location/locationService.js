import { GameState } from '../../core/GameState.js';

export function updateLocation(game) {
    const pos = GameState.mode === 'driving' ? game.car.position : game.player.group.position;
    const x = pos.x;
    const z = pos.z;
    const distFromCenter = Math.sqrt(x * x + z * z);
    
    let location = 'Los Santos';
    
    if (x < -150 && z < -100) {
        location = 'Los Santos Airport';
    } else if (z > 200) {
        location = 'Vespucci Beach';
    } else if (game.water && game.water.isInWater(x, z)) {
        location = 'Zancudo River';
    } else if (Math.sqrt(Math.pow(x + 180, 2) + Math.pow(z + 150, 2)) < 40) {
        location = 'Mirror Park Lake';
    } else if (distFromCenter < 50 && z < 0) {
        location = 'Downtown Los Santos';
    } else if (distFromCenter < 100) {
        location = 'Vinewood';
    } else if (distFromCenter > 200) {
        const height = game.terrain ? game.terrain.getHeightAt(x, z) : 0;
        if (height > 30) {
            location = 'Mount Chiliad';
        } else if (height > 15) {
            location = 'Vinewood Hills';
        } else {
            location = 'Blaine County';
        }
    } else {
        location = 'Rockford Hills';
    }
    
    GameState.currentLocation = location;
    game.ui.updateLocation(GameState.currentLocation);
}
