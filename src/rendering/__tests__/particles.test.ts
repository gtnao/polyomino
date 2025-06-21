import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createParticle,
  updateParticle,
  renderParticle,
  ParticleSystem,
  createParticleBurst,
  createLineClearParticles,
  createPiecePlaceParticles,
  createLevelUpParticles,
} from '../particles';
import type { Particle, RenderContext, Coordinate } from '../../game/types';

// Mock performance.now
const mockNow = vi.fn(() => 1000);
global.performance = {
  now: mockNow,
} as any;

// Mock render context
const createMockContext = (): RenderContext => {
  const mockCtx = {
    save: vi.fn(),
    restore: vi.fn(),
    globalAlpha: 1,
    fillStyle: '',
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
  };

  return {
    canvas: { width: 800, height: 600 } as HTMLCanvasElement,
    ctx: mockCtx as unknown as CanvasRenderingContext2D,
    config: {} as any,
    theme: {} as any,
  };
};

beforeEach(() => {
  mockNow.mockReturnValue(1000);
});

describe('createParticle', () => {
  it('should create a particle with given properties', () => {
    const position: Coordinate = [100, 200];
    const velocity: Coordinate = [0.5, -0.3];
    const particle = createParticle(position, velocity, 1000, '#ff0000', 5);

    expect(particle.position).toEqual([100, 200]);
    expect(particle.velocity).toEqual([0.5, -0.3]);
    expect(particle.lifetime).toBe(1000);
    expect(particle.color).toBe('#ff0000');
    expect(particle.size).toBe(5);
  });

  it('should create independent position and velocity arrays', () => {
    const position: Coordinate = [50, 50];
    const velocity: Coordinate = [1, 1];
    const particle = createParticle(position, velocity, 500, '#00ff00', 3);

    // Create new arrays to test independence
    const newPosition: Coordinate = [999, 999];
    const newVelocity: Coordinate = [999, 999];

    // Particle should be unaffected by new arrays
    expect(particle.position).toEqual([50, 50]);
    expect(particle.velocity).toEqual([1, 1]);
    expect(newPosition).toEqual([999, 999]);
    expect(newVelocity).toEqual([999, 999]);
  });
});

describe('updateParticle', () => {
  it('should update particle position based on velocity', () => {
    const particle: Particle = {
      position: [100, 200],
      velocity: [0.1, -0.2],
      lifetime: 1000,
      color: '#ff0000',
      size: 5,
    };

    const updated = updateParticle(particle, 100);

    expect(updated).toBeTruthy();
    expect(updated!.position[0]).toBeCloseTo(110); // 100 + 0.1 * 100
    expect(updated!.position[1]).toBeCloseTo(180); // 200 + (-0.2) * 100
  });

  it('should apply gravity to y velocity', () => {
    const particle: Particle = {
      position: [100, 200],
      velocity: [0, 0],
      lifetime: 1000,
      color: '#ff0000',
      size: 5,
    };

    const updated = updateParticle(particle, 100);

    expect(updated).toBeTruthy();
    expect(updated!.velocity[0]).toBe(0);
    expect(updated!.velocity[1]).toBeGreaterThan(0); // Gravity applied
  });

  it('should decrease lifetime', () => {
    const particle: Particle = {
      position: [100, 200],
      velocity: [0, 0],
      lifetime: 1000,
      color: '#ff0000',
      size: 5,
    };

    const updated = updateParticle(particle, 300);

    expect(updated).toBeTruthy();
    expect(updated!.lifetime).toBe(700);
  });

  it('should return null if particle is dead', () => {
    const particle: Particle = {
      position: [100, 200],
      velocity: [0, 0],
      lifetime: 100,
      color: '#ff0000',
      size: 5,
    };

    const updated = updateParticle(particle, 200);

    expect(updated).toBeNull();
  });

  it('should return null if lifetime is already 0', () => {
    const particle: Particle = {
      position: [100, 200],
      velocity: [0, 0],
      lifetime: 0,
      color: '#ff0000',
      size: 5,
    };

    const updated = updateParticle(particle, 10);

    expect(updated).toBeNull();
  });
});

describe('renderParticle', () => {
  it('should render particle with correct properties', () => {
    const context = createMockContext();
    const particle: Particle = {
      position: [100, 200],
      velocity: [0, 0],
      lifetime: 500,
      color: '#ff0000',
      size: 5,
    };

    renderParticle(context, particle, 1000);

    expect(context.ctx.save).toHaveBeenCalled();
    expect(context.ctx.globalAlpha).toBe(0.5); // 500/1000
    expect(context.ctx.fillStyle).toBe('#ff0000');
    expect(context.ctx.beginPath).toHaveBeenCalled();
    expect(context.ctx.arc).toHaveBeenCalledWith(100, 200, 5, 0, Math.PI * 2);
    expect(context.ctx.fill).toHaveBeenCalled();
    expect(context.ctx.restore).toHaveBeenCalled();
  });

  it('should fade particle based on lifetime', () => {
    const context = createMockContext();
    const particle: Particle = {
      position: [50, 50],
      velocity: [0, 0],
      lifetime: 100,
      color: '#00ff00',
      size: 3,
    };

    renderParticle(context, particle, 1000);

    expect(context.ctx.globalAlpha).toBe(0.1); // 100/1000
  });
});

describe('ParticleSystem', () => {
  it('should create empty system', () => {
    const system = new ParticleSystem();

    expect(system.getParticleCount()).toBe(0);
  });

  it('should add particles', () => {
    const system = new ParticleSystem();
    const particle = createParticle([100, 100], [1, 1], 1000, '#ff0000', 5);

    system.add(particle);

    expect(system.getParticleCount()).toBe(1);
  });

  it('should add multiple particles', () => {
    const system = new ParticleSystem();
    const particles = [
      createParticle([100, 100], [1, 1], 1000, '#ff0000', 5),
      createParticle([200, 200], [2, 2], 2000, '#00ff00', 3),
    ];

    system.addMany(particles);

    expect(system.getParticleCount()).toBe(2);
  });

  it('should update particles and remove dead ones', () => {
    mockNow.mockReturnValue(1000);
    const system = new ParticleSystem();
    const particle1 = createParticle([100, 100], [0.1, 0], 500, '#ff0000', 5);
    const particle2 = createParticle([200, 200], [0, 0.1], 1500, '#00ff00', 3);

    system.add(particle1);
    system.add(particle2);

    // Advance time beyond first particle's lifetime
    mockNow.mockReturnValue(1600);
    system.update();

    expect(system.getParticleCount()).toBe(1); // Only second particle remains
  });

  it('should render all particles', () => {
    const context = createMockContext();
    const system = new ParticleSystem();
    
    system.addMany([
      createParticle([100, 100], [0, 0], 1000, '#ff0000', 5),
      createParticle([200, 200], [0, 0], 2000, '#00ff00', 3),
    ]);

    system.render(context);

    // Should render both particles
    expect(context.ctx.beginPath).toHaveBeenCalledTimes(2);
    expect(context.ctx.arc).toHaveBeenCalledTimes(2);
  });

  it('should clear all particles', () => {
    const system = new ParticleSystem();
    
    system.addMany([
      createParticle([100, 100], [0, 0], 1000, '#ff0000', 5),
      createParticle([200, 200], [0, 0], 2000, '#00ff00', 3),
    ]);

    system.clear();

    expect(system.getParticleCount()).toBe(0);
  });
});

describe('createParticleBurst', () => {
  it('should create specified number of particles', () => {
    const particles = createParticleBurst([400, 300], 10, '#ff0000');

    expect(particles).toHaveLength(10);
  });

  it('should create particles with random properties within range', () => {
    const particles = createParticleBurst([400, 300], 5, '#ff0000', {
      minSpeed: 0.1,
      maxSpeed: 0.5,
      minSize: 2,
      maxSize: 6,
      minLifetime: 100,
      maxLifetime: 200,
    });

    for (const particle of particles) {
      expect(particle.color).toBe('#ff0000');
      expect(particle.position).toEqual([400, 300]);
      
      const speed = Math.sqrt(particle.velocity[0]**2 + particle.velocity[1]**2);
      expect(speed).toBeGreaterThanOrEqual(0);
      expect(speed).toBeLessThanOrEqual(1); // Max possible with given constraints
      
      expect(particle.size).toBeGreaterThanOrEqual(2);
      expect(particle.size).toBeLessThanOrEqual(6);
      
      expect(particle.lifetime).toBeGreaterThanOrEqual(100);
      expect(particle.lifetime).toBeLessThanOrEqual(200);
    }
  });
});

describe('createLineClearParticles', () => {
  it('should create particles along the line width', () => {
    const particles = createLineClearParticles(200, 400, '#ffff00');

    expect(particles.length).toBeGreaterThan(0);
    expect(particles.length).toBeLessThanOrEqual(40); // width/10

    for (const particle of particles) {
      expect(particle.color).toBe('#ffff00');
      expect(particle.position[0]).toBeGreaterThanOrEqual(0);
      expect(particle.position[0]).toBeLessThanOrEqual(400);
      expect(particle.position[1]).toBeGreaterThanOrEqual(190);
      expect(particle.position[1]).toBeLessThanOrEqual(210);
    }
  });
});

describe('createPiecePlaceParticles', () => {
  it('should create particles for each cell position', () => {
    const cellPositions: Coordinate[] = [
      [100, 100],
      [120, 100],
      [100, 120],
      [120, 120],
    ];

    const particles = createPiecePlaceParticles(cellPositions, '#ff00ff');

    // Should create 4 particles per cell (based on burst count)
    expect(particles).toHaveLength(16);

    for (const particle of particles) {
      expect(particle.color).toBe('#ff00ff');
    }
  });
});

describe('createLevelUpParticles', () => {
  it('should create particles with upward motion', () => {
    const colors = ['#ff0000', '#00ff00', '#0000ff'];
    const particles = createLevelUpParticles(800, 600, colors);

    expect(particles).toHaveLength(50);

    for (const particle of particles) {
      expect(colors).toContain(particle.color);
      expect(particle.position[0]).toBeGreaterThanOrEqual(0);
      expect(particle.position[0]).toBeLessThanOrEqual(800);
      expect(particle.position[1]).toBe(620); // height + 20
      expect(particle.velocity[1]).toBeLessThan(0); // Upward motion
    }
  });
});