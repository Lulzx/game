import * as THREE from 'three';

/**
 * Procedural terrain generation with hills and valleys
 */
export class Terrain {
    constructor(scene) {
        this.scene = scene;
        this.size = 800;
        this.segments = 128;
        this.mesh = null;
    }
    
    /**
     * Base trigonometric noise seed (deterministic, no texture fetch)
     */
    baseNoise(x, z, frequency = 0.0025) {
        const nx = x * frequency;
        const nz = z * frequency;
        const s = Math.sin(nx + Math.cos(nz * 0.75));
        const c = Math.cos(nz + Math.sin(nx * 0.65));
        return s * c;
    }
    
    /**
     * Fractal Brownian Motion with rotated octaves to break grid patterns
     */
    fbm(x, z, octaves = 5, lacunarity = 2.1, gain = 0.5, frequency = 0.0025) {
        let value = 0;
        let amplitude = 1;
        let maxValue = 0.0001;
        
        for (let i = 0; i < octaves; i++) {
            const angle = i * 0.65;
            const rx = x * Math.cos(angle) - z * Math.sin(angle);
            const rz = x * Math.sin(angle) + z * Math.cos(angle);
            const n = this.baseNoise(rx, rz, frequency);
            value += (n * 0.5 + 0.5) * amplitude;
            maxValue += amplitude;
            amplitude *= gain;
            frequency *= lacunarity;
        }
        
        return value / maxValue;
    }
    
    /**
     * Ridged noise for mountain crests
     */
    ridgedFbm(x, z, octaves = 4, lacunarity = 2.2, gain = 0.52, frequency = 0.0028) {
        let value = 0;
        let amplitude = 1;
        let maxValue = 0.0001;
        
        for (let i = 0; i < octaves; i++) {
            const angle = (i + 1) * 0.5;
            const rx = x * Math.cos(angle) - z * Math.sin(angle);
            const rz = x * Math.sin(angle) + z * Math.cos(angle);
            const n = 1 - Math.abs(this.baseNoise(rx, rz, frequency));
            value += n * n * amplitude;
            maxValue += amplitude;
            amplitude *= gain;
            frequency *= lacunarity;
        }
        
        return value / maxValue;
    }
    
    sampleHeight(x, z) {
        const distFromCenter = Math.sqrt(x * x + z * z);
        const transitionStart = 120;
        const transitionWidth = 70;
        const flattenFactor = distFromCenter < transitionStart 
            ? 0 
            : Math.pow(Math.min(1, (distFromCenter - transitionStart) / transitionWidth), 2);
        
        // Rolling foothills and plateaus
        const rolling = this.fbm(x, z, 4, 2.05, 0.55, 0.0023) * 28;
        const layered = this.fbm(x + 240, z - 180, 3, 2.2, 0.6, 0.0041) * 12;
        
        let height = (rolling + layered) * flattenFactor;
        
        // Mountain ring far from center
        if (distFromCenter > 190) {
            const ridgeFactor = Math.min(1, (distFromCenter - 190) / 130);
            const ridges = this.ridgedFbm(x - 180, z + 140, 4, 2.25, 0.52, 0.0028);
            height += ridges * 70 * ridgeFactor;
        }
        
        // River valley carve
        const riverX = Math.sin(z * 0.01) * 50 + 100;
        const riverDist = Math.abs(x - riverX);
        if (riverDist < 34 && distFromCenter > 120) {
            const profile = Math.cos((riverDist / 34) * Math.PI) * 0.5 + 0.5;
            const carve = -6 + profile * 8;
            height = Math.min(height, carve * flattenFactor);
        }
        
        return height;
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
        const color = new THREE.Color();
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const z = positions[i + 1]; // PlaneGeometry uses Y for what we call Z

            const height = this.sampleHeight(x, z);
            const gradX = this.sampleHeight(x + 2, z) - this.sampleHeight(x - 2, z);
            const gradZ = this.sampleHeight(x, z + 2) - this.sampleHeight(x, z - 2);
            const slope = Math.sqrt(gradX * gradX + gradZ * gradZ);

            positions[i + 2] = height;
            
            const colorIndex = i;
            const slopeFactor = Math.min(1, slope * 0.12);
            const heightNorm = Math.min(1, Math.max(0, height / 80));
            
            if (height < -1) {
                // Water/river bed - deeper blue-green
                color.setRGB(0.16, 0.32, 0.46);
            } else if (height < 4) {
                // Lush grass near lowlands
                color.setRGB(0.25, 0.34, 0.24);
                color.lerp(new THREE.Color(0.22, 0.27, 0.24), slopeFactor * 0.6);
            } else if (height < 22) {
                // Scrub / dirt transition
                color.setRGB(0.32, 0.29, 0.24);
                color.lerp(new THREE.Color(0.26, 0.25, 0.24), slopeFactor);
            } else {
                // Rock to snow
                const snow = Math.min(1, (height - 22) / 40);
                color.setRGB(0.36, 0.37, 0.4);
                color.lerp(new THREE.Color(0.82, 0.84, 0.86), snow);
                color.lerp(new THREE.Color(0.25, 0.26, 0.28), slopeFactor * 0.6);
            }

            // Fake ambient occlusion using slope for more depth
            const ao = 1 - Math.min(0.25, Math.pow(slopeFactor, 1.1) * 0.2);
            color.multiplyScalar(ao * (0.85 + heightNorm * 0.15));
            
            colors[colorIndex] = color.r;
            colors[colorIndex + 1] = color.g;
            colors[colorIndex + 2] = color.b;
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
        const height = this.sampleHeight(x, z);
        return Math.max(0, height);
    }
}
