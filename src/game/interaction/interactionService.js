import { GameState } from '../../core/GameState.js';

export function handleInteraction(game) {
    const nearest = findNearestInteractable(game);
    if (!nearest) return;
    
    if (nearest.type === 'car') {
        if (GameState.mode === 'driving') {
            exitCar(game);
        } else if (GameState.mode === 'walking') {
            enterCar(game, nearest.object);
        }
    }
}

export function handleTalk(game) {
    const nearest = findNearestInteractable(game);
    if (nearest && (nearest.type === 'npc' || nearest.type === 'indoor-friend')) {
        game.ui.showFriendDialog(nearest.friend);
    }
}

export function enterCar(game, targetCar) {
    game.car = targetCar;
    game.car.isOccupied = true;
    game.car.reset();
    GameState.mode = 'driving';
    game.player.group.visible = false;
    game.ui.updateMode('driving');
}

export function exitCar(game) {
    game.car.isOccupied = false;
    GameState.mode = 'walking';
    game.player.group.visible = true;
    const exitPos = game.car.getExitPosition();
    game.player.teleportTo(exitPos.x, 0, exitPos.z);
    game.ui.updateMode('walking');
}

export function findNearestInteractable(game) {
    const pos = GameState.mode === 'driving' ? game.car.position : game.player.group.position;
    let nearest = null;
    let nearestDist = Infinity;
    
    // Check all cars
    game.cars.forEach(car => {
        const carDist = pos.distanceTo(car.position);
        
        if (GameState.mode === 'driving') {
            if (car === game.car && carDist < 3) {
                nearest = { type: 'car', object: car, distance: carDist };
                nearestDist = carDist;
            }
        } else if (carDist < 5 && carDist < nearestDist) {
            nearest = { type: 'car', object: car, distance: carDist };
            nearestDist = carDist;
        }
    });
    
    // Check NPCs
    if (GameState.mode === 'walking') {
        game.npcs.forEach(npc => {
            const dist = pos.distanceTo(npc.group.position);
            if (dist < 4 && dist < nearestDist) {
                nearest = { type: 'npc', friend: npc.friendData, distance: dist };
                nearestDist = dist;
            }
        });
    }
    
    return nearest;
}
