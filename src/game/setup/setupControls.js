import { Controls } from '../../systems/Controls.js';
import { CameraController } from '../../systems/CameraController.js';

export function setupControls(camera, domElement, callbacks) {
    const controls = new Controls(domElement);
    controls.onInteract = callbacks?.onInteract;
    controls.onTalk = callbacks?.onTalk;
    controls.onJump = callbacks?.onJump;
    
    const cameraController = new CameraController(camera, controls);
    return { controls, cameraController };
}
