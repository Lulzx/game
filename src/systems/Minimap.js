/**
 * GTA V style radar/minimap with rotating player-centered view
 */
export class Minimap {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 160;
        this.canvas.height = 160;
        this.scale = 4; // Larger scale for bigger world
        this.center = { x: 80, y: 80 };
    }
    
    update(playerPos, playerRotation, buildings, car, isInCar) {
        const ctx = this.ctx;
        const cx = this.center.x;
        const cy = this.center.y;
        const scale = this.scale;
        const px = playerPos.x;
        const pz = playerPos.z;
        
        // Clear with semi-transparent black for radar look
        ctx.fillStyle = 'rgba(20, 25, 30, 0.9)';
        ctx.fillRect(0, 0, 160, 160);
        
        // Draw terrain colors based on zones
        this.drawZones(ctx, px, pz, scale);
        
        // Roads grid
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.6)';
        ctx.lineWidth = 1;
        for (let i = -200; i <= 200; i += 25) {
            // Convert world coords to minimap coords (centered on player)
            const roadX = cx + (i - px) / scale;
            const roadZ1 = cy + (-200 - pz) / scale;
            const roadZ2 = cy + (200 - pz) / scale;
            
            if (roadX > 0 && roadX < 160) {
                ctx.beginPath();
                ctx.moveTo(roadX, Math.max(0, roadZ1));
                ctx.lineTo(roadX, Math.min(160, roadZ2));
                ctx.stroke();
            }
            
            const roadZ = cy + (i - pz) / scale;
            const roadX1 = cx + (-200 - px) / scale;
            const roadX2 = cx + (200 - px) / scale;
            
            if (roadZ > 0 && roadZ < 160) {
                ctx.beginPath();
                ctx.moveTo(Math.max(0, roadX1), roadZ);
                ctx.lineTo(Math.min(160, roadX2), roadZ);
                ctx.stroke();
            }
        }
        
        // River (simplified)
        ctx.strokeStyle = 'rgba(60, 140, 180, 0.7)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let z = -300; z <= 250; z += 20) {
            const riverWorldX = Math.sin(z * 0.01) * 50 + 100;
            const mapX = cx + (riverWorldX - px) / scale;
            const mapZ = cy + (z - pz) / scale;
            if (z === -300) {
                ctx.moveTo(mapX, mapZ);
            } else {
                ctx.lineTo(mapX, mapZ);
            }
        }
        ctx.stroke();
        
        // Airport marker
        const airportX = cx + (-200 - px) / scale;
        const airportZ = cy + (-200 - pz) / scale;
        if (airportX > -20 && airportX < 180 && airportZ > -20 && airportZ < 180) {
            ctx.fillStyle = '#666';
            ctx.fillRect(airportX - 8, airportZ - 8, 16, 16);
            ctx.fillStyle = '#FFF';
            ctx.font = '10px Arial';
            ctx.fillText('✈', airportX - 5, airportZ + 4);
        }
        
        // Car marker (if not driving)
        if (!isInCar && car) {
            const carMapX = cx + (car.position.x - px) / scale;
            const carMapZ = cy + (car.position.z - pz) / scale;
            if (carMapX > 0 && carMapX < 160 && carMapZ > 0 && carMapZ < 160) {
                ctx.fillStyle = '#FF4444';
                ctx.beginPath();
                ctx.arc(carMapX, carMapZ, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Player arrow (always centered, rotated)
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-playerRotation);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(-5, 6);
        ctx.lineTo(0, 3);
        ctx.lineTo(5, 6);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
        
        // Circular mask/border
        ctx.globalCompositeOperation = 'destination-in';
        ctx.beginPath();
        ctx.arc(80, 80, 78, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        
        // Border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(80, 80, 78, 0, Math.PI * 2);
        ctx.stroke();
        
        // N indicator
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 10px Arial';
        ctx.fillText('N', 76, 15);
    }
    
    drawZones(ctx, px, pz, scale) {
        const cx = this.center.x;
        const cy = this.center.y;
        
        // Ocean (blue at far south)
        const oceanZ = cy + (250 - pz) / scale;
        if (oceanZ < 160) {
            ctx.fillStyle = 'rgba(30, 80, 120, 0.5)';
            ctx.fillRect(0, oceanZ, 160, 160 - oceanZ);
        }
        
        // Beach
        const beachZ = cy + (220 - pz) / scale;
        if (beachZ < 160 && beachZ > 0) {
            ctx.fillStyle = 'rgba(180, 160, 100, 0.4)';
            ctx.fillRect(0, beachZ, 160, Math.min(30, oceanZ - beachZ));
        }
        
        // City area (gray)
        const cityDist = Math.sqrt(px * px + pz * pz);
        if (cityDist < 120) {
            ctx.fillStyle = 'rgba(60, 60, 70, 0.3)';
            ctx.beginPath();
            ctx.arc(cx - px / scale, cy - pz / scale, 120 / scale, 0, Math.PI * 2);
            ctx.fill();
        }

        // Hills ring
        if (cityDist > 110) {
            ctx.fillStyle = 'rgba(100, 85, 60, 0.18)';
            ctx.beginPath();
            ctx.arc(cx - px / scale, cy - pz / scale, 170 / scale, 0, Math.PI * 2);
            ctx.fill();
        }

        // Mountain cap
        if (cityDist > 200) {
            ctx.fillStyle = 'rgba(180, 180, 190, 0.15)';
            ctx.beginPath();
            ctx.arc(cx - px / scale, cy - pz / scale, 240 / scale, 0, Math.PI * 2);
            ctx.fill();
        }

        // Lake
        const lakeX = cx + (-180 - px) / scale;
        const lakeZ = cy + (-150 - pz) / scale;
        ctx.fillStyle = 'rgba(50, 120, 160, 0.4)';
        ctx.beginPath();
        ctx.arc(lakeX, lakeZ, 32 / scale, 0, Math.PI * 2);
        ctx.fill();

        // Airport zone
        const airportX = cx + (-200 - px) / scale;
        const airportZ = cy + (-200 - pz) / scale;
        ctx.fillStyle = 'rgba(80, 80, 90, 0.35)';
        ctx.fillRect(airportX - 16, airportZ - 24, 32, 48);
    }
}
