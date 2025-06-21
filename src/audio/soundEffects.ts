import type { SoundEffect } from '../game/types';
import {
  getAudioContext,
  createOscillator,
  createGainNode,
  createFilter,
  connectNodes,
  startOscillator,
  stopOscillator,
  setGainValue,
  scheduleGainChange,
} from './audioContext';

/**
 * Creates a sound effect
 * @param options - Sound effect options
 * @returns Sound effect
 */
export function createSoundEffect(options: {
  name: string;
  frequency: number;
  duration: number;
  type?: OscillatorType;
  envelope?: Partial<SoundEffect['envelope']>;
  filter?: SoundEffect['filter'];
}): SoundEffect {
  const soundEffect: SoundEffect = {
    name: options.name,
    frequency: options.frequency,
    duration: options.duration,
    type: options.type || 'sine',
    envelope: {
      attack: options.envelope?.attack ?? 0.01,
      decay: options.envelope?.decay ?? 0.1,
      sustain: options.envelope?.sustain ?? 0.3,
      release: options.envelope?.release ?? 0.2,
    },
  };

  if (options.filter) {
    soundEffect.filter = options.filter;
  }

  return soundEffect;
}

/**
 * Plays a sound effect
 * @param soundEffect - Sound effect to play
 * @param volume - Volume (0-1)
 */
export function playSoundEffect(soundEffect: SoundEffect, volume: number = 1): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Create nodes
  const oscillator = createOscillator(soundEffect.type, soundEffect.frequency);
  const gainNode = createGainNode(0);

  // Create filter if specified
  let lastNode: AudioNode = oscillator;
  if (soundEffect.filter) {
    const filter = createFilter(
      soundEffect.filter.type,
      soundEffect.filter.frequency,
      soundEffect.filter.q
    );
    connectNodes(oscillator, filter);
    lastNode = filter;
  }

  // Connect nodes
  connectNodes(lastNode, gainNode);
  connectNodes(gainNode, ctx.destination);

  // Apply envelope
  const { attack, decay, sustain, release } = soundEffect.envelope;
  const duration = soundEffect.duration / 1000; // Convert to seconds

  // Attack
  setGainValue(gainNode, 0, now);
  scheduleGainChange(gainNode, volume, now + attack, 'exponential');

  // Decay
  scheduleGainChange(gainNode, volume * sustain, now + attack + decay, 'exponential');

  // Release
  const releaseTime = now + duration - release;
  scheduleGainChange(gainNode, volume * sustain, releaseTime, 'linear');
  scheduleGainChange(gainNode, 0.00001, now + duration, 'exponential');

  // Start and stop oscillator
  startOscillator(oscillator, now);
  stopOscillator(oscillator, now + duration);
}

/**
 * Sound effect manager
 */
export class SoundEffectManager {
  private soundEffects = new Map<string, SoundEffect>();
  private enabled = false;
  private volume = 0.5;

  /**
   * Enables sound effects
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * Disables sound effects
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * Checks if sound effects are enabled
   * @returns True if enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Sets the volume
   * @param volume - Volume (0-1)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Gets the current volume
   * @returns Volume (0-1)
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Registers a sound effect
   * @param key - Sound effect key
   * @param soundEffect - Sound effect
   */
  register(key: string, soundEffect: SoundEffect): void {
    this.soundEffects.set(key, soundEffect);
  }

  /**
   * Plays a sound effect
   * @param key - Sound effect key
   */
  play(key: string): void {
    if (!this.enabled) {
      return;
    }

    const soundEffect = this.soundEffects.get(key);
    if (soundEffect) {
      playSoundEffect(soundEffect, this.volume);
    }
  }

  /**
   * Preloads default sound effects
   */
  preloadDefaults(): void {
    this.register('pieceMove', createPieceMoveSFX());
    this.register('pieceRotate', createPieceRotateSFX());
    this.register('piecePlace', createPiecePlaceSFX());
    this.register('lineClear', createLineClearSFX());
    this.register('levelUp', createLevelUpSFX());
    this.register('gameOver', createGameOverSFX());
    this.register('menuSelect', createMenuSelectSFX());
    this.register('menuBack', createMenuBackSFX());
  }
}

// Predefined sound effects

/**
 * Creates piece move sound effect
 * @returns Sound effect
 */
export function createPieceMoveSFX(): SoundEffect {
  return createSoundEffect({
    name: 'pieceMove',
    frequency: 200,
    duration: 50,
    type: 'square',
    envelope: {
      attack: 0.01,
      decay: 0.02,
      sustain: 0.1,
      release: 0.02,
    },
  });
}

/**
 * Creates piece rotate sound effect
 * @returns Sound effect
 */
export function createPieceRotateSFX(): SoundEffect {
  return createSoundEffect({
    name: 'pieceRotate',
    frequency: 300,
    duration: 60,
    type: 'triangle',
    envelope: {
      attack: 0.01,
      decay: 0.03,
      sustain: 0.2,
      release: 0.02,
    },
  });
}

/**
 * Creates piece place sound effect
 * @returns Sound effect
 */
export function createPiecePlaceSFX(): SoundEffect {
  return createSoundEffect({
    name: 'piecePlace',
    frequency: 150,
    duration: 100,
    type: 'sine',
    envelope: {
      attack: 0.01,
      decay: 0.05,
      sustain: 0.3,
      release: 0.04,
    },
  });
}

/**
 * Creates line clear sound effect
 * @returns Sound effect
 */
export function createLineClearSFX(): SoundEffect {
  return createSoundEffect({
    name: 'lineClear',
    frequency: 800,
    duration: 300,
    type: 'square',
    envelope: {
      attack: 0.02,
      decay: 0.1,
      sustain: 0.7,
      release: 0.15,
    },
    filter: {
      type: 'highpass',
      frequency: 400,
      q: 2,
    },
  });
}

/**
 * Creates level up sound effect
 * @returns Sound effect
 */
export function createLevelUpSFX(): SoundEffect {
  return createSoundEffect({
    name: 'levelUp',
    frequency: 440,
    duration: 500,
    type: 'sine',
    envelope: {
      attack: 0.1,
      decay: 0.1,
      sustain: 0.8,
      release: 0.2,
    },
  });
}

/**
 * Creates game over sound effect
 * @returns Sound effect
 */
export function createGameOverSFX(): SoundEffect {
  return createSoundEffect({
    name: 'gameOver',
    frequency: 220,
    duration: 1000,
    type: 'sawtooth',
    envelope: {
      attack: 0.05,
      decay: 0.2,
      sustain: 0.5,
      release: 0.5,
    },
    filter: {
      type: 'lowpass',
      frequency: 1000,
      q: 1,
    },
  });
}

/**
 * Creates menu select sound effect
 * @returns Sound effect
 */
export function createMenuSelectSFX(): SoundEffect {
  return createSoundEffect({
    name: 'menuSelect',
    frequency: 600,
    duration: 80,
    type: 'sine',
    envelope: {
      attack: 0.01,
      decay: 0.02,
      sustain: 0.5,
      release: 0.05,
    },
  });
}

/**
 * Creates menu back sound effect
 * @returns Sound effect
 */
export function createMenuBackSFX(): SoundEffect {
  return createSoundEffect({
    name: 'menuBack',
    frequency: 400,
    duration: 80,
    type: 'sine',
    envelope: {
      attack: 0.01,
      decay: 0.02,
      sustain: 0.5,
      release: 0.05,
    },
  });
}