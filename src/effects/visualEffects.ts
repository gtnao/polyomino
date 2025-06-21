/**
 * Visual effects system for game animations
 */

import type { ColorScheme } from '../game/types';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  shape: 'square' | 'circle' | 'star';
  rotation: number;
  rotationSpeed: number;
  glowIntensity: number;
}

export interface LineFlashEffect {
  lines: number[];
  progress: number;
  duration: number;
}

interface LineFlashData {
  lines: number[];
  colorScheme: ColorScheme;
  boardWidth: number;
  cellSize: number;
}

interface ScreenShakeData {
  intensity: number;
}

interface LevelUpData {
  level: number;
  colorScheme: ColorScheme;
  boardWidth: number;
  boardHeight: number;
  cellSize: number;
}

type EffectData = LineFlashData | ScreenShakeData | LevelUpData | Record<string, unknown>;

export interface VisualEffect {
  type: 'particles' | 'lineFlash' | 'screenShake' | 'levelUp';
  startTime: number;
  duration: number;
  data: EffectData;
}

export class VisualEffectsManager {
  private effects: VisualEffect[] = [];
  private particles: Particle[] = [];
  private enabled: boolean = true;
  
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
  
  /**
   * Adds a line clear effect
   */
  addLineClearEffect(lines: number[], colorScheme: ColorScheme, boardWidth: number = 10, cellSize: number = 30): void {
    if (!this.enabled) {
      return;
    }
    
    // Add line flash effect
    this.effects.push({
      type: 'lineFlash',
      startTime: Date.now(),
      duration: 500,
      data: { lines, colorScheme, boardWidth, cellSize }
    });
    
    // Add particle effects for each cleared line
    lines.forEach(lineY => {
      this.createLineParticles(lineY, colorScheme, boardWidth, cellSize);
    });
    
    // Add screen shake for multiple lines
    if (lines.length > 1) {
      this.effects.push({
        type: 'screenShake',
        startTime: Date.now(),
        duration: 200,
        data: { intensity: lines.length * 2 }
      });
    }
  }
  
  /**
   * Creates particles for a cleared line
   */
  private createLineParticles(lineY: number, colorScheme: ColorScheme, boardWidth: number = 10, cellSize: number = 30): void {
    const particleCount = 30; // More particles for better effect
    const colors = colorScheme.colors.pieces;
    const shapes: Array<'square' | 'circle' | 'star'> = ['square', 'circle', 'star'];
    
    for (let i = 0; i < particleCount; i++) {
      // Create particles that explode from the entire line
      const x = (i / particleCount) * boardWidth * cellSize;
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      const speed = Math.random() * 8 + 4;
      
      this.particles.push({
        x: x + (Math.random() - 0.5) * cellSize,
        y: lineY * cellSize + cellSize / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        life: 1.5, // Longer life for better visibility
        maxLife: 1.5,
        color: colors[Math.floor(Math.random() * colors.length)]!,
        size: Math.random() * 6 + 3,
        shape: shapes[Math.floor(Math.random() * shapes.length)]!,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        glowIntensity: Math.random() * 0.5 + 0.5
      });
    }
  }
  
  /**
   * Updates all effects
   */
  update(deltaTime: number): void {
    if (!this.enabled) {
      return;
    }
    
    const now = Date.now();
    
    // Update effects
    this.effects = this.effects.filter(effect => {
      const elapsed = now - effect.startTime;
      return elapsed < effect.duration;
    });
    
    // Update particles
    this.particles = this.particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.2; // Lighter gravity
      particle.vx *= 0.98; // Air resistance
      particle.rotation += particle.rotationSpeed;
      particle.life -= deltaTime / 1000;
      
      return particle.life > 0;
    });
  }
  
  /**
   * Renders line flash effect
   */
  renderLineFlash(ctx: CanvasRenderingContext2D, effect: VisualEffect): void {
    const elapsed = Date.now() - effect.startTime;
    const progress = elapsed / effect.duration;
    const { lines, boardWidth, cellSize, colorScheme } = effect.data as LineFlashData;
    
    ctx.save();
    
    lines.forEach((lineY: number) => {
      // Create a colorful gradient flash
      const gradient = ctx.createLinearGradient(0, lineY * cellSize, boardWidth * cellSize, lineY * cellSize);
      const colors = colorScheme.colors.effects.lineClear;
      
      // Animate gradient position
      const offset = progress;
      const stop1 = Math.max(0, Math.min(1, offset - 0.3));
      const stop2 = Math.max(0, Math.min(1, offset - 0.1));
      const stop3 = Math.max(0, Math.min(1, offset + 0.1));
      const stop4 = Math.max(0, Math.min(1, offset + 0.3));
      
      // Ensure stops are in increasing order
      if (stop1 < stop2 && stop2 < stop3 && stop3 < stop4) {
        gradient.addColorStop(stop1, 'transparent');
        gradient.addColorStop(stop2, colors[0]!);
        gradient.addColorStop(stop3, colors[1]!);
        gradient.addColorStop(stop4, 'transparent');
      } else {
        // Fallback to simple gradient
        gradient.addColorStop(0, colors[0]!);
        gradient.addColorStop(0.5, colors[1]!);
        gradient.addColorStop(1, colors[0]!);
      }
      
      // Apply flash with pulsing alpha
      const alpha = Math.sin(progress * Math.PI) * 0.9;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = gradient;
      ctx.fillRect(0, lineY * cellSize - 2, boardWidth * cellSize, cellSize + 4);
      
      // Add a glow effect
      ctx.shadowBlur = 20;
      ctx.shadowColor = colors[0]!;
      ctx.fillRect(0, lineY * cellSize, boardWidth * cellSize, cellSize);
      ctx.shadowBlur = 0;
    });
    
    ctx.restore();
  }
  
  /**
   * Renders particles
   */
  renderParticles(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    
    this.particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      const fadeAlpha = alpha * particle.glowIntensity;
      
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      ctx.globalAlpha = fadeAlpha;
      
      // Add glow effect
      ctx.shadowBlur = particle.size * 2;
      ctx.shadowColor = particle.color;
      
      // Draw based on shape
      ctx.fillStyle = particle.color;
      
      switch (particle.shape) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'star':
          this.drawStar(ctx, 0, 0, particle.size / 2, particle.size / 4, 5);
          break;
          
        case 'square':
        default:
          ctx.fillRect(
            -particle.size / 2,
            -particle.size / 2,
            particle.size,
            particle.size
          );
          break;
      }
      
      ctx.restore();
    });
    
    ctx.restore();
  }
  
  /**
   * Draws a star shape
   */
  private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, outerRadius: number, innerRadius: number, points: number): void {
    ctx.beginPath();
    let angle = -Math.PI / 2;
    const step = Math.PI / points;
    
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      angle += step;
    }
    
    ctx.closePath();
    ctx.fill();
  }
  
  /**
   * Gets screen shake offset
   */
  getScreenShakeOffset(): { x: number; y: number } {
    const shakeEffect = this.effects.find(e => e.type === 'screenShake');
    if (!shakeEffect) {
      return { x: 0, y: 0 };
    }
    
    const elapsed = Date.now() - shakeEffect.startTime;
    const progress = elapsed / shakeEffect.duration;
    const intensity = (shakeEffect.data as ScreenShakeData).intensity * (1 - progress);
    
    return {
      x: (Math.random() - 0.5) * intensity,
      y: (Math.random() - 0.5) * intensity
    };
  }
  
  /**
   * Renders all visual effects
   */
  render(ctx: CanvasRenderingContext2D): void {
    if (!this.enabled) {
      return;
    }
    
    // Render line flashes
    this.effects
      .filter(e => e.type === 'lineFlash')
      .forEach(effect => this.renderLineFlash(ctx, effect));
    
    // Render level up effects
    this.effects
      .filter(e => e.type === 'levelUp')
      .forEach(effect => this.renderLevelUp(ctx, effect));
    
    // Render particles
    this.renderParticles(ctx);
  }
  
  /**
   * Adds a level up animation
   */
  addLevelUpEffect(level: number, colorScheme: ColorScheme, boardWidth: number = 10, boardHeight: number = 20, cellSize: number = 30): void {
    if (!this.enabled) {
      return;
    }
    
    // Add level up flash effect
    this.effects.push({
      type: 'levelUp',
      startTime: Date.now(),
      duration: 1500,
      data: { level, colorScheme, boardWidth, boardHeight, cellSize }
    });
    
    // Create sparkle particles around the board
    const particleCount = 50;
    const colors = colorScheme.colors.effects.levelUp;
    const shapes: Array<'square' | 'circle' | 'star'> = ['star', 'star', 'circle']; // More stars for sparkle effect
    
    for (let i = 0; i < particleCount; i++) {
      const side = Math.floor(Math.random() * 4); // Which side of the board
      let x: number, y: number, vx: number, vy: number;
      
      switch (side) {
        case 0: // Top
          x = Math.random() * boardWidth * cellSize;
          y = 0;
          vx = (Math.random() - 0.5) * 2;
          vy = Math.random() * 3 + 1;
          break;
        case 1: // Right
          x = boardWidth * cellSize;
          y = Math.random() * boardHeight * cellSize;
          vx = -(Math.random() * 3 + 1);
          vy = (Math.random() - 0.5) * 2;
          break;
        case 2: // Bottom
          x = Math.random() * boardWidth * cellSize;
          y = boardHeight * cellSize;
          vx = (Math.random() - 0.5) * 2;
          vy = -(Math.random() * 3 + 1);
          break;
        case 3: // Left
        default:
          x = 0;
          y = Math.random() * boardHeight * cellSize;
          vx = Math.random() * 3 + 1;
          vy = (Math.random() - 0.5) * 2;
          break;
      }
      
      this.particles.push({
        x,
        y,
        vx,
        vy,
        life: 2, // Longer life for level up
        maxLife: 2,
        color: colors[Math.floor(Math.random() * colors.length)]!,
        size: Math.random() * 8 + 4,
        shape: shapes[Math.floor(Math.random() * shapes.length)]!,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        glowIntensity: 1
      });
    }
  }
  
  /**
   * Renders level up effect
   */
  renderLevelUp(ctx: CanvasRenderingContext2D, effect: VisualEffect): void {
    const elapsed = Date.now() - effect.startTime;
    const progress = elapsed / effect.duration;
    const { level, colorScheme, boardWidth, boardHeight, cellSize } = effect.data as LevelUpData;
    
    ctx.save();
    
    // Wave effect that sweeps across the board
    const waveProgress = progress * 1.5;
    if (waveProgress < 1) {
      const gradient = ctx.createLinearGradient(
        0, 
        boardHeight * cellSize * (1 - waveProgress),
        0,
        boardHeight * cellSize
      );
      
      const colors = colorScheme.colors.effects.levelUp;
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(0.5, colors[0]!);
      gradient.addColorStop(1, 'transparent');
      
      ctx.globalAlpha = 0.6 * (1 - waveProgress);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, boardWidth * cellSize, boardHeight * cellSize);
    }
    
    // Level number display
    if (progress < 0.8) {
      const textAlpha = progress < 0.4 ? progress / 0.4 : (0.8 - progress) / 0.4;
      ctx.globalAlpha = textAlpha;
      
      ctx.font = 'bold 48px monospace';
      ctx.fillStyle = colorScheme.colors.text;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Add text shadow for better visibility
      ctx.shadowBlur = 20;
      ctx.shadowColor = colorScheme.colors.effects.levelUp[0]!;
      
      ctx.fillText(
        `LEVEL ${level}!`,
        (boardWidth * cellSize) / 2,
        (boardHeight * cellSize) / 2
      );
    }
    
    ctx.restore();
  }
  
  /**
   * Clears all effects
   */
  clear(): void {
    this.effects = [];
    this.particles = [];
  }
}