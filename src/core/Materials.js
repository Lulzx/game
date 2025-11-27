import * as THREE from 'three';

/**
 * Centralized material definitions for consistent look
 */
export const Materials = {
    grass: new THREE.MeshStandardMaterial({ 
        color: 0x7EC850, 
        roughness: 0.9,
        flatShading: false
    }),
    
    path: new THREE.MeshStandardMaterial({ 
        color: 0xD2B48C, 
        roughness: 0.8 
    }),
    
    wood: new THREE.MeshStandardMaterial({ 
        color: 0x8B4513, 
        roughness: 0.7 
    }),
    
    woodLight: new THREE.MeshStandardMaterial({ 
        color: 0xDEB887, 
        roughness: 0.6 
    }),
    
    roof: {
        red: new THREE.MeshStandardMaterial({ color: 0xCD5C5C, roughness: 0.6 }),
        blue: new THREE.MeshStandardMaterial({ color: 0x6495ED, roughness: 0.6 }),
        green: new THREE.MeshStandardMaterial({ color: 0x66CDAA, roughness: 0.6 }),
        purple: new THREE.MeshStandardMaterial({ color: 0xDDA0DD, roughness: 0.6 }),
        orange: new THREE.MeshStandardMaterial({ color: 0xFFA07A, roughness: 0.6 })
    },
    
    wall: {
        cream: new THREE.MeshStandardMaterial({ color: 0xFFFAF0, roughness: 0.5 }),
        pink: new THREE.MeshStandardMaterial({ color: 0xFFE4E1, roughness: 0.5 }),
        blue: new THREE.MeshStandardMaterial({ color: 0xE6F3FF, roughness: 0.5 }),
        yellow: new THREE.MeshStandardMaterial({ color: 0xFFFACD, roughness: 0.5 }),
        mint: new THREE.MeshStandardMaterial({ color: 0xE0FFF0, roughness: 0.5 })
    },
    
    window: new THREE.MeshStandardMaterial({ 
        color: 0xADD8E6, 
        roughness: 0.1, 
        metalness: 0.3, 
        transparent: true, 
        opacity: 0.7 
    }),
    
    door: new THREE.MeshStandardMaterial({ 
        color: 0x8B4513, 
        roughness: 0.5 
    }),
    
    car: {
        body: new THREE.MeshStandardMaterial({ color: 0xFF6B6B, roughness: 0.3, metalness: 0.4 }),
        wheel: new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 }),
        window: new THREE.MeshStandardMaterial({ color: 0x87CEEB, roughness: 0.1, metalness: 0.5 })
    },
    
    water: new THREE.MeshStandardMaterial({ 
        color: 0x4FC3F7, 
        roughness: 0.1, 
        metalness: 0.3, 
        transparent: true, 
        opacity: 0.8 
    }),
    
    flower: {
        red: new THREE.MeshStandardMaterial({ color: 0xFF6B6B }),
        pink: new THREE.MeshStandardMaterial({ color: 0xFFB6C1 }),
        yellow: new THREE.MeshStandardMaterial({ color: 0xFFD700 }),
        purple: new THREE.MeshStandardMaterial({ color: 0xDDA0DD }),
        white: new THREE.MeshStandardMaterial({ color: 0xFFFAFA })
    },
    
    stem: new THREE.MeshStandardMaterial({ color: 0x228B22 }),
    
    trunk: new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9 }),
    
    leaves: new THREE.MeshStandardMaterial({ color: 0x2E8B57, roughness: 0.8 })
};

export function hexToRgba(hex, alpha) {
    const r = (hex >> 16) & 255;
    const g = (hex >> 8) & 255;
    const b = hex & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
