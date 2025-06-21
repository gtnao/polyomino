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
}

export interface LineFlashEffect {
  lines: number[];
  progress: number;
  duration: number;
}

export interface VisualEffect {
  type: 'particles' | 'lineFlash' | 'screenShake';
  startTime: number;
  duration: number;
  data: any;
}

export class VisualEffectsManager {
  private effects: VisualEffect[] = [];
  private particles: Particle[] = [];
  private enabled: boolean = true;
  
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
  
  /**
   * Adds a line clear effect
   */
  addLineClearEffect(lines: number[], colorScheme: ColorScheme, boardWidth: number = 10, cellSize: number = 30) {
    if (!this.enabled) return;
    
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
  private createLineParticles(lineY: number, colorScheme: ColorScheme, boardWidth: number = 10, cellSize: number = 30) {
    const particleCount = 20;
    const colors = colorScheme.colors.pieces;
    
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * boardWidth * cellSize,
        y: lineY * cellSize,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 6 - 2,
        life: 1,
        maxLife: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 4 + 2
      });
    }
  }
  
  /**
   * Updates all effects
   */
  update(deltaTime: number) {
    if (!this.enabled) return;
    
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
      particle.vy += 0.3; // Gravity
      particle.life -= deltaTime / 1000;
      
      return particle.life > 0;
    });
  }
  
  /**
   * Renders line flash effect
   */
  renderLineFlash(ctx: CanvasRenderingContext2D, effect: VisualEffect) {
    const elapsed = Date.now() - effect.startTime;
    const progress = elapsed / effect.duration;
    const { lines, colorScheme, boardWidth, cellSize } = effect.data;
    
    ctx.save();
    
    // Flash effect
    const alpha = Math.sin(progress * Math.PI) * 0.8;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    
    lines.forEach(lineY => {
      ctx.fillRect(0, lineY * cellSize, boardWidth * cellSize, cellSize);
    });
    
    ctx.restore();
  }
  
  /**
   * Renders particles
   */
  renderParticles(ctx: CanvasRenderingContext2D) {
    ctx.save();
    
    this.particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.fillRect(
        particle.x - particle.size / 2,
        particle.y - particle.size / 2,
        particle.size,
        particle.size
      );
    });
    
    ctx.restore();
  }
  
  /**
   * Gets screen shake offset
   */
  getScreenShakeOffset(): { x: number; y: number } {
    const shakeEffect = this.effects.find(e => e.type === 'screenShake');
    if (!shakeEffect) return { x: 0, y: 0 };
    
    const elapsed = Date.now() - shakeEffect.startTime;
    const progress = elapsed / shakeEffect.duration;
    const intensity = shakeEffect.data.intensity * (1 - progress);
    
    return {
      x: (Math.random() - 0.5) * intensity,
      y: (Math.random() - 0.5) * intensity
    };
  }
  
  /**
   * Renders all visual effects
   */
  render(ctx: CanvasRenderingContext2D) {
    if (!this.enabled) return;
    
    // Render line flashes
    this.effects
      .filter(e => e.type === 'lineFlash')
      .forEach(effect => this.renderLineFlash(ctx, effect));
    
    // Render particles
    this.renderParticles(ctx);
  }
  
  /**
   * Clears all effects
   */
  clear() {
    this.effects = [];
    this.particles = [];
  }
}