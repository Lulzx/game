import { GameState } from '../../core/GameState.js';
import { updateInteractionPrompt } from '../interaction/promptService.js';
import { updateLocation } from '../location/locationService.js';

export function runGameLoop(game) {
    const animate = () => {
        requestAnimationFrame(animate);
        
        const deltaTime = Math.min(game.clock.getDelta(), 0.1);
        GameState.deltaTime = deltaTime;
        
        // Update controls
        game.controls.update(deltaTime);

        // Update ground reference for player
        if (GameState.mode !== 'indoor' && game.terrain) {
            const groundY = game.terrain.getHeightAt(game.player.group.position.x, game.player.group.position.z);
            game.player.groundY = groundY;
        } else {
            game.player.groundY = 0;
        }
        
        // Update entities based on mode
        let currentSpeed = 0;
        let isMoving = false;
        
        if (GameState.mode === 'driving') {
            game.car.update(game.controls, deltaTime);
            game.player.group.position.copy(game.car.position);
            currentSpeed = game.car.getSpeed();
            isMoving = currentSpeed > 0.5;
            
            const drift = game.car.getDriftAmount();
            if (drift > 0.05) {
                game.cameraController.triggerShake(0.05 + drift * 0.15, 10);
            }
        } else {
            game.player.update(game.controls, deltaTime);
            currentSpeed = game.player.getSpeed();
            isMoving = game.player.isMoving();
        }

        if (game.terrain) {
            game.cars.forEach(car => car.syncToGround());
        }
        
        game.npcs.forEach(npc => npc.update(deltaTime, game.player.group.position));
        
        if (game.water) {
            game.water.update(deltaTime);
        }
        
        const target = GameState.mode === 'driving' ? game.car.group : game.player.group;
        game.cameraController.update(target, deltaTime, currentSpeed, isMoving, game.controls.isRunning());
        
        updateInteractionPrompt(game);
        updateLocation(game);
        
        const playerPos = GameState.mode === 'driving' ? game.car.position : game.player.group.position;
        const playerRot = GameState.mode === 'driving' ? game.car.heading : game.player.rotation;
        game.minimap.update(playerPos, playerRot, [], game.car, game.car.isOccupied);
        
        game.renderer.render(game.scene, game.camera);
    };
    
    animate();
}
