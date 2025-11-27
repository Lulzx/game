import * as THREE from 'three';

/**
 * Procedural terrain generation with hills and valleys
 */
export class Terrain {
    constructor(scene) {
        this.scene = scene;
        this.size = 800;
        this.segments = 128;
        this.heightData = [];
        this.mesh = null;
    }
    
    /**
     * Simple noise function for terrain
     */
    noise(x, z, scale = 1, octaves = 4) {
        let value = 0;
        let amplitude = 1;
        let frequency = scale;
        let maxValue = 0;
        
        for (let i = 0; i < octaves; i++) {
            // Simple pseudo-random based on position
            const nx = Math.sin(x * frequency * 0.01) * Math.cos(z * frequency * 0.013);
            const nz = Math.cos(x * frequency * 0.011) * Math.sin(z * frequency * 0.012);
            value += (Math.sin(nx * 10 + nz * 10) * 0.5 + 0.5) * amplitude;
            
            maxValue += amplitude;
            amplitude *= 0.5;
            frequency *= 2;
        }
        
        return value / maxValue;
    }
    
    /**
     * Generate the terrain mesh
     */
    generate() {
        const geometry = new THREE.PlaneGeometry(
            this.size, this.size,
            this.segments, this.segments
        );
        
        const positions = geometry.attributes.position.array;
        const colors = new Float32Array(positions.length);
        
        // Generate height and colors
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const z = positions[i + 1]; // PlaneGeometry uses Y for what we call Z
            
            // Distance from center (for city area)
            const distFromCenter = Math.sqrt(x * x + z * z);
            
            // Flatten center for city
            let flattenFactor = 1;
            if (distFromCenter < 150) {
                flattenFactor = Math.pow(distFromCenter / 150, 2);
            }
            
            // Generate height
            let height = 0;
            
            // Hills in the distance
            if (distFromCenter > 100) {
                const hillNoise = this.noise(x, z, 0.5, 4);
                height = hillNoise * 40 * flattenFactor;
                
                // Mountains at edges
                if (distFromCenter > 300) {
                    const mountainFactor = (distFromCenter - 300) / 100;
                    height += this.noise(x, z, 1, 3) * 60 * Math.min(1, mountainFactor);
                }
            }
            
            // River valley (carve through terrain)
            const riverX = Math.sin(z * 0.01) * 50 + 100;
            const riverDist = Math.abs(x - riverX);
            if (riverDist < 30 && distFromCenter > 120) {
                height = Math.min(height, -2 + riverDist * 0.1);
            }
            
            positions[i + 2] = height;
            this.heightData.push({ x, z, height });
            
            // Vertex colors based on height
            const colorIndex = i;
            if (height < -1) {
                // Water/river bed - blue
                colors[colorIndex] = 0.2;
                colors[colorIndex + 1] = 0.4;
                colors[colorIndex + 2] = 0.6;
            } else if (height < 5) {
                // Grass - green
                colors[colorIndex] = 0.3 + Math.random() * 0.1;
                colors[colorIndex + 1] = 0.5 + Math.random() * 0.1;
                colors[colorIndex + 2] = 0.2;
            } else if (height < 25) {
                // Dirt/rock - brown
                colors[colorIndex] = 0.4 + Math.random() * 0.1;
                colors[colorIndex + 1] = 0.35;
                colors[colorIndex + 2] = 0.25;
            } else {
                // Mountain/snow - gray/white
                const snow = Math.min(1, (height - 25) / 30);
                colors[colorIndex] = 0.5 + snow * 0.5;
                colors[colorIndex + 1] = 0.5 + snow * 0.5;
                colors[colorIndex + 2] = 0.5 + snow * 0.5;
            }
        }
        
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.computeVertexNormals();
        
        const material = new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.9,
            flatShading: false
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.receiveShadow = true;
        this.scene.add(this.mesh);
        
        return this.mesh;
    }
    
    /**
     * Get height at world position
     */
    getHeightAt(x, z) {
        // Simple bilinear interpolation
        const distFromCenter = Math.sqrt(x * x + z * z);
        
        if (distFromCenter < 150) {
            return 0; // Flat city area
        }
        
        // Sample noise at position
        let flattenFactor = Math.pow(Math.min(1, (distFromCenter - 100) / 50), 2);
        let height = this.noise(x, z, 0.5, 4) * 40 * flattenFactor;
        
        if (distFromCenter > 300) {
            const mountainFactor = (distFromCenter - 300) / 100;
            height += this.noise(x, z, 1, 3) * 60 * Math.min(1, mountainFactor);
        }
        
        // River
        const riverX = Math.sin(z * 0.01) * 50 + 100;
        const riverDist = Math.abs(x - riverX);
        if (riverDist < 30 && distFromCenter > 120) {
            height = Math.min(height, -2 + riverDist * 0.1);
        }
        
        return Math.max(0, height);
    }
}
