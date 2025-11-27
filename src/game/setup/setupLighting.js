import * as THREE from 'three';

export function setupLighting(scene) {
    const ambient = new THREE.AmbientLight(0xFFF5E6, 0.6);
    scene.add(ambient);
    
    const sun = new THREE.DirectionalLight(0xFFE8D0, 1.5);
    sun.position.set(150, 200, 100);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 4096;
    sun.shadow.mapSize.height = 4096;
    sun.shadow.camera.near = 50;
    sun.shadow.camera.far = 600;
    sun.shadow.camera.left = -200;
    sun.shadow.camera.right = 200;
    sun.shadow.camera.top = 200;
    sun.shadow.camera.bottom = -200;
    sun.shadow.bias = -0.0002;
    scene.add(sun);
    
    const fill = new THREE.DirectionalLight(0xA0D0E8, 0.4);
    fill.position.set(-100, 80, -80);
    scene.add(fill);
    
    const hemi = new THREE.HemisphereLight(0x88BBDD, 0x557744, 0.4);
    scene.add(hemi);
}
