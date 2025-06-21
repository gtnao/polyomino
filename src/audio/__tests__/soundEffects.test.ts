import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createSoundEffect,
  playSoundEffect,
  SoundEffectManager,
  createPieceMoveSFX,
  createPieceRotateSFX,
  createPiecePlaceSFX,
  createLineClearSFX,
  createLevelUpSFX,
  createGameOverSFX,
  createMenuSelectSFX,
  createMenuBackSFX,
} from '../soundEffects';
import * as audioContext from '../audioContext';
import type { SoundEffect } from '../../game/types';

// Mock audioContext module
vi.mock('../audioContext', () => ({
  getAudioContext: vi.fn(() => mockAudioContext),
  createOscillator: vi.fn(() => mockOscillator),
  createGainNode: vi.fn(() => mockGainNode),
  createFilter: vi.fn(() => mockFilter),
  connectNodes: vi.fn(),
  startOscillator: vi.fn(),
  stopOscillator: vi.fn(),
  setGainValue: vi.fn(),
  scheduleGainChange: vi.fn(),
}));

// Mock audio nodes
const mockOscillator = {
  type: 'sine',
  frequency: { value: 440 },
  connect: vi.fn(),
  disconnect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
};

const mockGainNode = {
  gain: { value: 1 },
  connect: vi.fn(),
  disconnect: vi.fn(),
};

const mockFilter = {
  type: 'lowpass',
  frequency: { value: 1000 },
  Q: { value: 1 },
  connect: vi.fn(),
  disconnect: vi.fn(),
};

const mockAudioContext = {
  currentTime: 0,
  destination: {},
};

beforeEach(() => {
  vi.clearAllMocks();
  mockAudioContext.currentTime = 0;
});

describe('createSoundEffect', () => {
  it('should create a sound effect with default values', () => {
    const sfx = createSoundEffect({
      name: 'test',
      frequency: 220,
      duration: 100,
    });

    expect(sfx.name).toBe('test');
    expect(sfx.frequency).toBe(220);
    expect(sfx.duration).toBe(100);
    expect(sfx.type).toBe('sine');
    expect(sfx.envelope).toEqual({
      attack: 0.01,
      decay: 0.1,
      sustain: 0.3,
      release: 0.2,
    });
  });

  it('should create a sound effect with custom values', () => {
    const sfx = createSoundEffect({
      name: 'custom',
      frequency: 880,
      duration: 200,
      type: 'square',
      envelope: {
        attack: 0.05,
        decay: 0.15,
        sustain: 0.5,
        release: 0.3,
      },
    });

    expect(sfx.frequency).toBe(880);
    expect(sfx.type).toBe('square');
    expect(sfx.envelope.attack).toBe(0.05);
  });
});

describe('playSoundEffect', () => {
  it('should play a sound effect with volume', () => {
    const sfx: SoundEffect = {
      name: 'test',
      frequency: 440,
      duration: 100,
      type: 'sine',
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.3,
        release: 0.2,
      },
    };

    playSoundEffect(sfx, 0.5);

    expect(audioContext.createOscillator).toHaveBeenCalledWith('sine', 440);
    expect(audioContext.createGainNode).toHaveBeenCalledWith(0);
    expect(audioContext.connectNodes).toHaveBeenCalledTimes(2); // oscillator->gain, gain->destination
    expect(audioContext.startOscillator).toHaveBeenCalled();
    expect(audioContext.stopOscillator).toHaveBeenCalled();
  });

  it('should apply envelope correctly', () => {
    const sfx: SoundEffect = {
      name: 'envelope-test',
      frequency: 440,
      duration: 200,
      type: 'sine',
      envelope: {
        attack: 0.05,
        decay: 0.1,
        sustain: 0.5,
        release: 0.15,
      },
    };

    playSoundEffect(sfx, 1);

    // Check envelope scheduling
    expect(audioContext.setGainValue).toHaveBeenCalledWith(mockGainNode, 0, 0);
    expect(audioContext.scheduleGainChange).toHaveBeenCalledTimes(4); // attack, decay, sustain, release
  });

  it('should apply filter when specified', () => {
    const sfx: SoundEffect = {
      name: 'filter-test',
      frequency: 440,
      duration: 100,
      type: 'sawtooth',
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.3,
        release: 0.2,
      },
      filter: {
        type: 'highpass',
        frequency: 2000,
        q: 2,
      },
    };

    playSoundEffect(sfx, 0.8);

    expect(audioContext.createFilter).toHaveBeenCalledWith('highpass', 2000, 2);
    expect(audioContext.connectNodes).toHaveBeenCalledTimes(3); // osc->filter, filter->gain, gain->destination
  });
});

describe('SoundEffectManager', () => {
  let manager: SoundEffectManager;

  beforeEach(() => {
    manager = new SoundEffectManager();
  });

  it('should initialize with disabled state', () => {
    expect(manager.isEnabled()).toBe(false);
    expect(manager.getVolume()).toBe(0.5);
  });

  it('should enable and disable sounds', () => {
    manager.enable();
    expect(manager.isEnabled()).toBe(true);

    manager.disable();
    expect(manager.isEnabled()).toBe(false);
  });

  it('should set volume', () => {
    manager.setVolume(0.8);
    expect(manager.getVolume()).toBe(0.8);

    // Test clamping
    manager.setVolume(1.5);
    expect(manager.getVolume()).toBe(1);

    manager.setVolume(-0.5);
    expect(manager.getVolume()).toBe(0);
  });

  it('should register sound effects', () => {
    const sfx: SoundEffect = {
      name: 'custom',
      frequency: 440,
      duration: 100,
      type: 'sine',
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.3,
        release: 0.2,
      },
    };

    manager.register('customSound', sfx);
    
    // Enable manager to allow playing
    manager.enable();
    manager.play('customSound');

    expect(audioContext.createOscillator).toHaveBeenCalled();
  });

  it('should not play when disabled', () => {
    manager.register('test', createPieceMoveSFX());
    manager.play('test');

    expect(audioContext.createOscillator).not.toHaveBeenCalled();
  });

  it('should play with adjusted volume', () => {
    manager.enable();
    manager.setVolume(0.3);
    manager.register('test', createPieceMoveSFX());
    
    manager.play('test');

    // Volume should be multiplied
    expect(audioContext.createGainNode).toHaveBeenCalledWith(0);
  });

  it('should handle playing non-existent sound', () => {
    manager.enable();
    
    // Should not throw
    expect(() => manager.play('nonexistent')).not.toThrow();
  });

  it('should preload default sounds', () => {
    manager.enable();
    manager.preloadDefaults();

    // Test that default sounds can be played
    manager.play('pieceMove');
    expect(audioContext.createOscillator).toHaveBeenCalled();

    vi.clearAllMocks();
    manager.play('lineClear');
    expect(audioContext.createOscillator).toHaveBeenCalled();
  });
});

describe('Predefined sound effects', () => {
  it('should create piece move sound', () => {
    const sfx = createPieceMoveSFX();
    expect(sfx.name).toBe('pieceMove');
    expect(sfx.frequency).toBe(200);
    expect(sfx.duration).toBe(50);
    expect(sfx.type).toBe('square');
  });

  it('should create piece rotate sound', () => {
    const sfx = createPieceRotateSFX();
    expect(sfx.name).toBe('pieceRotate');
    expect(sfx.frequency).toBe(300);
    expect(sfx.duration).toBe(60);
    expect(sfx.type).toBe('triangle');
  });

  it('should create piece place sound', () => {
    const sfx = createPiecePlaceSFX();
    expect(sfx.name).toBe('piecePlace');
    expect(sfx.frequency).toBe(150);
    expect(sfx.duration).toBe(100);
    expect(sfx.type).toBe('sine');
  });

  it('should create line clear sound', () => {
    const sfx = createLineClearSFX();
    expect(sfx.name).toBe('lineClear');
    expect(sfx.frequency).toBe(800);
    expect(sfx.duration).toBe(300);
    expect(sfx.type).toBe('square');
    expect(sfx.filter).toBeDefined();
  });

  it('should create level up sound', () => {
    const sfx = createLevelUpSFX();
    expect(sfx.name).toBe('levelUp');
    expect(sfx.frequency).toBe(440);
    expect(sfx.duration).toBe(500);
    expect(sfx.type).toBe('sine');
  });

  it('should create game over sound', () => {
    const sfx = createGameOverSFX();
    expect(sfx.name).toBe('gameOver');
    expect(sfx.frequency).toBe(220);
    expect(sfx.duration).toBe(1000);
    expect(sfx.type).toBe('sawtooth');
    expect(sfx.filter).toBeDefined();
  });

  it('should create menu select sound', () => {
    const sfx = createMenuSelectSFX();
    expect(sfx.name).toBe('menuSelect');
    expect(sfx.frequency).toBe(600);
    expect(sfx.duration).toBe(80);
    expect(sfx.type).toBe('sine');
  });

  it('should create menu back sound', () => {
    const sfx = createMenuBackSFX();
    expect(sfx.name).toBe('menuBack');
    expect(sfx.frequency).toBe(400);
    expect(sfx.duration).toBe(80);
    expect(sfx.type).toBe('sine');
  });
});