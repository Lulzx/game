import * as THREE from 'three';

export function setupLighting(scene) {
    const ambient = new THREE.HemisphereLight(0xd9e7f2, 0x5b5d4c, 0.9);
    scene.add(ambient);
    
    const sun = new THREE.DirectionalLight(0xfff3df, 1.65);
    sun.position.set(160, 240, 120);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 4096;
    sun.shadow.mapSize.height = 4096;
    sun.shadow.camera.near = 50;
    sun.shadow.camera.far = 600;
    sun.shadow.camera.left = -200;
    sun.shadow.camera.right = 200;
    sun.shadow.camera.top = 200;
    sun.shadow.camera.bottom = -200;
    sun.shadow.bias = -0.00025;
    sun.shadow.normalBias = 0.08;
    scene.add(sun);
    
    const fill = new THREE.DirectionalLight(0x9bb5c5, 0.32);
    fill.position.set(-140, 110, -100);
    scene.add(fill);
    
    const rim = new THREE.PointLight(0xc8ecff, 0.18, 260);
    rim.position.set(40, 90, -80);
    scene.add(rim);
}
