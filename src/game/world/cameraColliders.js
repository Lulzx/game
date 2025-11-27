export function setupCameraColliders(game) {
    const colliders = [];
    if (game.terrain?.mesh) colliders.push(game.terrain.mesh);
    if (game.city?.buildings?.length) colliders.push(...game.city.buildings);
    if (game.airport?.getCollisionMeshes) {
        colliders.push(...game.airport.getCollisionMeshes());
    }
    
    // Add tall lights as lightweight blockers to reduce wall clipping
    const streetLights = game.scene.children.filter(obj => obj.geometry?.type === 'CylinderGeometry');
    colliders.push(...streetLights);
    
    game.cameraController.setCollisionObjects(colliders);
}
