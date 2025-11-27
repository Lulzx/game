import * as THREE from 'three';
import { Materials } from '../../core/Materials.js';

/**
 * Builds the car mesh and returns the group with wheel references.
 */
export function buildCarModel() {
    const group = new THREE.Group();
    const wheels = [];
    let bodyMesh = null;
    
    // Main body base
    const bodyBaseGeo = new THREE.BoxGeometry(2.3, 0.7, 3.8);
    bodyMesh = new THREE.Mesh(bodyBaseGeo, Materials.car.body);
    bodyMesh.position.y = 0.55;
    bodyMesh.castShadow = true;
    group.add(bodyMesh);
    
    // Rounded front
    const frontGeo = new THREE.CylinderGeometry(0.35, 0.35, 2.1, 12);
    const front = new THREE.Mesh(frontGeo, Materials.car.body);
    front.rotation.z = Math.PI / 2;
    front.position.set(0, 0.55, 1.7);
    front.castShadow = true;
    group.add(front);
    
    // Cabin (top)
    const cabinGeo = new THREE.BoxGeometry(2.0, 0.75, 2.0);
    const cabin = new THREE.Mesh(cabinGeo, Materials.car.body);
    cabin.position.set(0, 1.2, -0.2);
    cabin.castShadow = true;
    group.add(cabin);
    
    // Windshield
    const windshieldGeo = new THREE.PlaneGeometry(1.8, 0.65);
    const windshield = new THREE.Mesh(windshieldGeo, Materials.car.window);
    windshield.position.set(0, 1.25, 0.82);
    windshield.rotation.x = -0.25;
    group.add(windshield);
    
    // Rear window
    const rearWindowGeo = new THREE.PlaneGeometry(1.7, 0.55);
    const rearWindow = new THREE.Mesh(rearWindowGeo, Materials.car.window);
    rearWindow.position.set(0, 1.25, -1.22);
    rearWindow.rotation.x = 0.2;
    rearWindow.rotation.y = Math.PI;
    group.add(rearWindow);
    
    // Side windows
    const sideWindowGeo = new THREE.PlaneGeometry(1.4, 0.55);
    const leftWindow = new THREE.Mesh(sideWindowGeo, Materials.car.window);
    leftWindow.position.set(-1.01, 1.25, -0.2);
    leftWindow.rotation.y = -Math.PI / 2;
    group.add(leftWindow);
    
    const rightWindow = new THREE.Mesh(sideWindowGeo, Materials.car.window);
    rightWindow.position.set(1.01, 1.25, -0.2);
    rightWindow.rotation.y = Math.PI / 2;
    group.add(rightWindow);
    
    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 20);
    const wheelPositions = [
        [-1.0, 0.35, 1.15],
        [1.0, 0.35, 1.15],
        [-1.0, 0.35, -1.15],
        [1.0, 0.35, -1.15]
    ];
    
    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeo, Materials.car.wheel);
        wheel.position.set(...pos);
        wheel.rotation.z = Math.PI / 2;
        wheel.castShadow = true;
        group.add(wheel);
        wheels.push(wheel);
        
        // Wheel rim detail
        const rimGeo = new THREE.CircleGeometry(0.25, 6);
        const rimMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.5 });
        const rimL = new THREE.Mesh(rimGeo, rimMat);
        rimL.position.set(pos[0] - 0.13, pos[1], pos[2]);
        rimL.rotation.y = -Math.PI / 2;
        group.add(rimL);
        
        const rimR = new THREE.Mesh(rimGeo, rimMat);
        rimR.position.set(pos[0] + 0.13, pos[1], pos[2]);
        rimR.rotation.y = Math.PI / 2;
        group.add(rimR);
    });
    
    // Headlights
    const headlightGeo = new THREE.SphereGeometry(0.14, 12, 12);
    const headlightMat = new THREE.MeshStandardMaterial({ 
        color: 0xFFFF99, 
        emissive: 0xFFFF66, 
        emissiveIntensity: 0.6 
    });
    
    const leftHeadlight = new THREE.Mesh(headlightGeo, headlightMat);
    leftHeadlight.position.set(-0.7, 0.55, 1.9);
    group.add(leftHeadlight);
    
    const rightHeadlight = new THREE.Mesh(headlightGeo, headlightMat);
    rightHeadlight.position.set(0.7, 0.55, 1.9);
    group.add(rightHeadlight);
    
    // Tail lights
    const tailLightGeo = new THREE.BoxGeometry(0.3, 0.15, 0.05);
    const tailLightMat = new THREE.MeshStandardMaterial({ 
        color: 0xFF3333, 
        emissive: 0xFF0000, 
        emissiveIntensity: 0.3 
    });
    
    const leftTail = new THREE.Mesh(tailLightGeo, tailLightMat);
    leftTail.position.set(-0.8, 0.65, -1.9);
    group.add(leftTail);
    
    const rightTail = new THREE.Mesh(tailLightGeo, tailLightMat);
    rightTail.position.set(0.8, 0.65, -1.9);
    group.add(rightTail);
    
    // Cute face - eyes as headlights, smile
    const smileGeo = new THREE.TorusGeometry(0.25, 0.04, 8, 16, Math.PI);
    const smileMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const smile = new THREE.Mesh(smileGeo, smileMat);
    smile.position.set(0, 0.38, 1.91);
    smile.rotation.x = Math.PI;
    group.add(smile);
    
    return { group, wheels, bodyMesh };
}
