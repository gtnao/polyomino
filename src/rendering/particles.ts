import type { Particle, Coordinate, RenderContext } from '../game/types';
import { lerp } from './animator';

/**
 * Creates a new particle
 * @param position - Initial position
 * @param velocity - Initial velocity
 * @param lifetime - Lifetime in milliseconds
 * @param color - Particle color
 * @param size - Particle size
 * @returns New particle
 */
export function createParticle(
  position: Coordinate,
  velocity: Coordinate,
  lifetime: number,
  color: string,
  size: number
): Particle {
  return {
    position: [...position],
    velocity: [...velocity],
    lifetime,
    color,
    size,
  };
}

/**
 * Updates a particle's position and lifetime
 * @param particle - Particle to update
 * @param deltaTime - Time elapsed in milliseconds
 * @returns Updated particle or null if dead
 */
export function updateParticle(particle: Particle, deltaTime: number): Particle | null {
  if (particle.lifetime <= 0) {
    return null;
  }

  const updatedLifetime = particle.lifetime - deltaTime;
  if (updatedLifetime <= 0) {
    return null;
  }

  // Update position based on velocity
  const [x, y] = particle.position;
  const [vx, vy] = particle.velocity;
  
  // Apply gravity to y velocity
  const gravity = 0.0005 * deltaTime;
  const newVy = vy + gravity;

  return {
    ...particle,
    position: [x + vx * deltaTime, y + vy * deltaTime],
    velocity: [vx, newVy],
    lifetime: updatedLifetime,
  };
}

/**
 * Renders a particle
 * @param context - Render context
 * @param particle - Particle to render
 * @param maxLifetime - Original lifetime for fade calculations
 */
export function renderParticle(
  context: RenderContext,
  particle: Particle,
  maxLifetime: number
): void {
  const { ctx } = context;
  const [x, y] = particle.position;
  
  // Calculate fade based on lifetime
  const lifeRatio = particle.lifetime / maxLifetime;
  const opacity = Math.max(0, Math.min(1, lifeRatio));

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = particle.color;
  
  // Draw particle as a circle
  ctx.beginPath();
  ctx.arc(x, y, particle.size, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

/**
 * Particle system for managing multiple particles
 */
export class ParticleSystem {
  private particles: Array<{ particle: Particle; maxLifetime: number }> = [];
  private lastUpdate = performance.now();

  /**
   * Adds a particle to the system
   * @param particle - Particle to add
   */
  add(particle: Particle): void {
    this.particles.push({ particle, maxLifetime: particle.lifetime });
  }

  /**
   * Adds multiple particles
   * @param particles - Particles to add
   */
  addMany(particles: Particle[]): void {
    for (const particle of particles) {
      this.add(particle);
    }
  }

  /**
   * Updates all particles
   */
  update(): void {
    const now = performance.now();
    const deltaTime = now - this.lastUpdate;
    this.lastUpdate = now;

    this.particles = this.particles
      .map(({ particle, maxLifetime }) => {
        const updated = updateParticle(particle, deltaTime);
        return updated ? { particle: updated, maxLifetime } : null;
      })
      .filter((p): p is { particle: Particle; maxLifetime: number } => p !== null);
  }

  /**
   * Renders all particles
   * @param context - Render context
   */
  render(context: RenderContext): void {
    for (const { particle, maxLifetime } of this.particles) {
      renderParticle(context, particle, maxLifetime);
    }
  }

  /**
   * Clears all particles
   */
  clear(): void {
    this.particles = [];
  }

  /**
   * Gets the number of active particles
   * @returns Particle count
   */
  getParticleCount(): number {
    return this.particles.length;
  }
}

/**
 * Creates a burst of particles
 * @param position - Center position
 * @param count - Number of particles
 * @param color - Particle color
 * @param options - Burst options
 * @returns Array of particles
 */
export function createParticleBurst(
  position: Coordinate,
  count: number,
  color: string,
  options: {
    minSpeed?: number;
    maxSpeed?: number;
    minSize?: number;
    maxSize?: number;
    minLifetime?: number;
    maxLifetime?: number;
    spread?: number;
  } = {}
): Particle[] {
  const {
    minSpeed = 0.1,
    maxSpeed = 0.3,
    minSize = 2,
    maxSize = 4,
    minLifetime = 500,
    maxLifetime = 1000,
    spread = Math.PI * 2,
  } = options;

  const particles: Particle[] = [];
  const [x, y] = position;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * spread - spread / 2;
    const speed = lerp(minSpeed, maxSpeed, Math.random());
    const size = lerp(minSize, maxSize, Math.random());
    const lifetime = lerp(minLifetime, maxLifetime, Math.random());

    const velocity: Coordinate = [
      Math.cos(angle) * speed,
      Math.sin(angle) * speed - 0.2, // Initial upward bias
    ];

    particles.push(createParticle([x, y], velocity, lifetime, color, size));
  }

  return particles;
}

/**
 * Creates particles for a line clear effect
 * @param lineY - Y position of the line in pixels
 * @param width - Width of the line in pixels
 * @param color - Particle color
 * @returns Array of particles
 */
export function createLineClearParticles(
  lineY: number,
  width: number,
  color: string
): Particle[] {
  const particles: Particle[] = [];
  const particleCount = Math.floor(width / 10);

  for (let i = 0; i < particleCount; i++) {
    const x = (i / particleCount) * width;
    const y = lineY + Math.random() * 20 - 10;
    
    const velocity: Coordinate = [
      (Math.random() - 0.5) * 0.2,
      -Math.random() * 0.3 - 0.1,
    ];

    const size = Math.random() * 3 + 2;
    const lifetime = Math.random() * 500 + 500;

    particles.push(createParticle([x, y], velocity, lifetime, color, size));
  }

  return particles;
}

/**
 * Creates particles for a piece placement effect
 * @param cellPositions - Array of cell positions in pixels
 * @param color - Particle color
 * @returns Array of particles
 */
export function createPiecePlaceParticles(
  cellPositions: Coordinate[],
  color: string
): Particle[] {
  const particles: Particle[] = [];

  for (const [cellX, cellY] of cellPositions) {
    // Create a small burst from each cell
    const burstParticles = createParticleBurst(
      [cellX, cellY],
      4,
      color,
      {
        minSpeed: 0.05,
        maxSpeed: 0.1,
        minSize: 1,
        maxSize: 2,
        minLifetime: 300,
        maxLifetime: 500,
        spread: Math.PI * 2,
      }
    );
    particles.push(...burstParticles);
  }

  return particles;
}

/**
 * Creates particles for a level up effect
 * @param width - Width of the effect area
 * @param height - Height of the effect area
 * @param colors - Array of colors to use
 * @returns Array of particles
 */
export function createLevelUpParticles(
  width: number,
  height: number,
  colors: string[]
): Particle[] {
  const particles: Particle[] = [];
  const particleCount = 50;

  for (let i = 0; i < particleCount; i++) {
    const x = Math.random() * width;
    const y = height + 20; // Start below the visible area
    
    const velocity: Coordinate = [
      (Math.random() - 0.5) * 0.1,
      -Math.random() * 0.5 - 0.2, // Upward motion
    ];

    const colorIndex = Math.floor(Math.random() * colors.length);
    const color = colors[colorIndex]!;
    const size = Math.random() * 4 + 2;
    const lifetime = Math.random() * 1500 + 1000;

    particles.push(createParticle([x, y], velocity, lifetime, color, size));
  }

  return particles;
}