export function setupEvents(game) {
    const onResize = () => handleResize(game);
    window.addEventListener('resize', onResize);
}

function handleResize(game) {
    game.camera.aspect = window.innerWidth / window.innerHeight;
    game.camera.updateProjectionMatrix();
    game.renderer.setSize(window.innerWidth, window.innerHeight);
}
