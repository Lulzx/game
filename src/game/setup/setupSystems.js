import { UI } from '../../ui/UI.js';
import { Minimap } from '../../systems/Minimap.js';
import { Collision } from '../../systems/Collision.js';
import { Indoor } from '../../world/Indoor.js';

export function setupSystems() {
    return {
        ui: new UI(),
        minimap: new Minimap('minimap-canvas'),
        collision: new Collision(),
        indoor: new Indoor()
    };
}
