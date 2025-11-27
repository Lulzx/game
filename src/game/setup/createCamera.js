import * as THREE from 'three';

export function createCamera() {
    const camera = new THREE.PerspectiveCamera(
        65,
        window.innerWidth / window.innerHeight,
        0.5,
        1500
    );
    camera.position.set(0, 10, 20);
    return camera;
}
