import * as THREE from 'three';

/**
 * Centralized material definitions for consistent look
 */
export const Materials = {
    grass: new THREE.MeshStandardMaterial({ 
        color: 0x3f4b39, 
        roughness: 1,
        metalness: 0.05,
        flatShading: false
    }),
    
    path: new THREE.MeshStandardMaterial({ 
        color: 0x55514a, 
        roughness: 0.95,
        metalness: 0.05
    }),
    
    wood: new THREE.MeshStandardMaterial({ 
        color: 0x5a4333, 
        roughness: 0.82 
    }),
    
    woodLight: new THREE.MeshStandardMaterial({ 
        color: 0x6e543f, 
        roughness: 0.78 
    }),
    
    roof: {
        red: new THREE.MeshStandardMaterial({ color: 0x5a2f2b, roughness: 0.55, metalness: 0.1 }),
        blue: new THREE.MeshStandardMaterial({ color: 0x2f3c4f, roughness: 0.55, metalness: 0.1 }),
        green: new THREE.MeshStandardMaterial({ color: 0x324235, roughness: 0.55, metalness: 0.1 }),
        purple: new THREE.MeshStandardMaterial({ color: 0x3f3446, roughness: 0.55, metalness: 0.1 }),
        orange: new THREE.MeshStandardMaterial({ color: 0x6b3a23, roughness: 0.55, metalness: 0.1 })
    },
    
    wall: {
        cream: new THREE.MeshStandardMaterial({ color: 0xb7b5ad, roughness: 0.62, metalness: 0.05 }),
        pink: new THREE.MeshStandardMaterial({ color: 0xa8a3a0, roughness: 0.6, metalness: 0.05 }),
        blue: new THREE.MeshStandardMaterial({ color: 0x9aa7b7, roughness: 0.58, metalness: 0.05 }),
        yellow: new THREE.MeshStandardMaterial({ color: 0xb0a583, roughness: 0.62, metalness: 0.05 }),
        mint: new THREE.MeshStandardMaterial({ color: 0x96a59b, roughness: 0.6, metalness: 0.05 })
    },
    
    window: new THREE.MeshPhysicalMaterial({ 
        color: 0x7ea7c7, 
        roughness: 0.05, 
        metalness: 0.6, 
        transmission: 0.72,
        thickness: 0.35,
        transparent: true, 
        opacity: 0.9 
    }),
    
    door: new THREE.MeshStandardMaterial({ 
        color: 0x4c3a2c, 
        roughness: 0.65 
    }),
    
    car: {
        body: new THREE.MeshPhysicalMaterial({ 
            color: 0x4e5c68, 
            metalness: 1, 
            roughness: 0.18,
            clearcoat: 0.65,
            clearcoatRoughness: 0.08
        }),
        wheel: new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.82, metalness: 0.2 }),
        window: new THREE.MeshPhysicalMaterial({ 
            color: 0x6c8a9f, 
            roughness: 0.08, 
            metalness: 0.8,
            transmission: 0.65,
            thickness: 0.3,
            transparent: true,
            opacity: 0.9 
        })
    },
    
    water: new THREE.MeshPhysicalMaterial({ 
        color: 0x1f6f8f, 
        roughness: 0.08, 
        metalness: 0.35, 
        transmission: 0.78,
        thickness: 0.6,
        transparent: true, 
        opacity: 0.92, 
        reflectivity: 0.8
    }),
    
    flower: {
        red: new THREE.MeshStandardMaterial({ color: 0xFF6B6B }),
        pink: new THREE.MeshStandardMaterial({ color: 0xFFB6C1 }),
        yellow: new THREE.MeshStandardMaterial({ color: 0xFFD700 }),
        purple: new THREE.MeshStandardMaterial({ color: 0xDDA0DD }),
        white: new THREE.MeshStandardMaterial({ color: 0xFFFAFA })
    },
    
    stem: new THREE.MeshStandardMaterial({ color: 0x228B22 }),
    
    trunk: new THREE.MeshStandardMaterial({ color: 0x5b4637, roughness: 0.92 }),
    
    leaves: new THREE.MeshStandardMaterial({ color: 0x2f4b36, roughness: 0.86 })
};

export function hexToRgba(hex, alpha) {
    const r = (hex >> 16) & 255;
    const g = (hex >> 8) & 255;
    const b = hex & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
