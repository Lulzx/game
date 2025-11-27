import * as THREE from 'three';

export function createScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x6B8CAE);
    scene.fog = new THREE.FogExp2(0x8BA4BE, 0.0015);
    return scene;
}
