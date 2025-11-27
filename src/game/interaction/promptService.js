import { GameState } from '../../core/GameState.js';
import { findNearestInteractable } from './interactionService.js';

export function updateInteractionPrompt(game) {
    const nearest = findNearestInteractable(game);
    
    if (nearest) {
        GameState.nearbyInteractable = nearest;
        
        switch (nearest.type) {
            case 'car':
                game.ui.showInteractionPrompt(game.car.isOccupied ? 
                    'Press <strong>E</strong> to exit car' : 'Press <strong>E</strong> to enter car');
                break;
            case 'house':
                game.ui.showInteractionPrompt(`Press <strong>E</strong> to visit ${nearest.object.friend.name}`);
                break;
            case 'exit':
                game.ui.showInteractionPrompt('Press <strong>E</strong> to go outside');
                break;
            case 'npc':
            case 'indoor-friend':
                game.ui.showInteractionPrompt(`Press <strong>F</strong> to talk to ${nearest.friend.name}`);
                break;
        }
    } else {
        GameState.nearbyInteractable = null;
        game.ui.hideInteractionPrompt();
    }
}
