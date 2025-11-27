import * as THREE from 'three';

export function createScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xb6cee8); // clear daytime sky
    scene.fog = new THREE.Fog(0xb6cee8, 180, 620);
    return scene;
}
