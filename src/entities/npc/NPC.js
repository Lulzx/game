import * as THREE from 'three';
import { buildNPCModel } from './NPCModel.js';
import { updateNPC } from './NPCBehavior.js';

/**
 * GTA V style NPC with reactive behaviors and smooth animations.
 */
export class NPC {
    constructor(x, z, friendData) {
        this.friendData = friendData;
        this.homePosition = new THREE.Vector3(x, 0, z);
        
        // AI State
        this.state = 'idle'; // 'idle', 'alert', 'greeting', 'watching'
        this.awareness = 0;  // 0-1, how aware of player
        this.targetRotation = 0;
        this.currentRotation = 0;
        
        // Animation state
        this.anim = {
            time: Math.random() * Math.PI * 2,
            bobPhase: Math.random() * Math.PI * 2,
            breathePhase: Math.random() * Math.PI * 2,
            waveTime: 0,
            isWaving: false,
            waveIntensity: 0,
            headLookX: 0,
            headLookY: 0,
            bodyLean: 0,
            surprise: 0,  // Jump back reaction
            surpriseOffset: new THREE.Vector3()
        };
        
        // Reaction tracking
        this.lastPlayerDist = Infinity;
        this.playerApproachSpeed = 0;
        
        const { group, body, head, armPivot } = buildNPCModel(friendData);
        this.group = group;
        this.body = body;
        this.head = head;
        this.armPivot = armPivot;
        
        this.group.position.set(x, 0, z);
        this.group.userData = { type: 'npc', friend: friendData };
    }
    
    update(deltaTime, playerPosition) {
        updateNPC(this, deltaTime, playerPosition);
    }
    
    /**
     * Check if position is near this NPC
     */
    isNearby(position, threshold = 4) {
        return this.group.position.distanceTo(position) < threshold;
    }
}
