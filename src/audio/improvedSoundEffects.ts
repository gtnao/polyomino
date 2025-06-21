import type { SoundEffect } from '../game/types';
import { createSoundEffect } from './soundEffects';
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
 * Plays a multi-tone sound effect (chord or arpeggio)
 */
export function playMultiTone(
  frequencies: number[],
  duration: number,
  volume: number = 0.5,
  delay: number = 0,
  type: OscillatorType = 'sine'
): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  frequencies.forEach((freq, index) => {
    const oscillator = createOscillator(type, freq);
    const gainNode = createGainNode(0);
    
    connectNodes(oscillator, gainNode);
    connectNodes(gainNode, ctx.destination);
    
    const startTime = now + index * delay;
    const attack = 0.01;
    const release = Math.min(0.1, duration / 1000 * 0.3);
    
    setGainValue(gainNode, 0, startTime);
    scheduleGainChange(gainNode, volume / frequencies.length, startTime + attack, 'exponential');
    scheduleGainChange(gainNode, volume / frequencies.length, startTime + duration / 1000 - release, 'linear');
    scheduleGainChange(gainNode, 0.00001, startTime + duration / 1000, 'exponential');
    
    startOscillator(oscillator, startTime);
    stopOscillator(oscillator, startTime + duration / 1000);
  });
}

/**
 * Creates improved piece move sound effect
 * Softer click sound
 */
export function createImprovedPieceMoveSFX(): SoundEffect {
  return createSoundEffect({
    name: 'pieceMove',
    frequency: 800,
    duration: 30,
    type: 'sine',
    envelope: {
      attack: 0.001,
      decay: 0.01,
      sustain: 0.1,
      release: 0.019,
    },
    filter: {
      type: 'lowpass',
      frequency: 1200,
      q: 1,
    },
  });
}

/**
 * Creates improved piece rotate sound effect
 * Pleasant whoosh sound
 */
export function createImprovedPieceRotateSFX(): SoundEffect {
  return createSoundEffect({
    name: 'pieceRotate',
    frequency: 600,
    duration: 80,
    type: 'sine',
    envelope: {
      attack: 0.02,
      decay: 0.03,
      sustain: 0.2,
      release: 0.03,
    },
    filter: {
      type: 'bandpass',
      frequency: 800,
      q: 2,
    },
  });
}

/**
 * Creates improved piece place sound effect
 * Satisfying thud
 */
export function createImprovedPiecePlaceSFX(): SoundEffect {
  return createSoundEffect({
    name: 'piecePlace',
    frequency: 120,
    duration: 120,
    type: 'triangle',
    envelope: {
      attack: 0.001,
      decay: 0.05,
      sustain: 0.2,
      release: 0.069,
    },
    filter: {
      type: 'lowpass',
      frequency: 300,
      q: 1,
    },
  });
}

/**
 * Plays improved line clear sound effect
 * Ascending chord for satisfaction
 */
export function playImprovedLineClearSFX(linesCleared: number = 1, volume: number = 0.5): void {
  const baseFreq = 523.25; // C5
  const frequencies: number[] = [];
  
  // Create chord based on lines cleared
  switch (linesCleared) {
    case 1:
      frequencies.push(baseFreq, baseFreq * 1.25, baseFreq * 1.5); // Major triad
      break;
    case 2:
      frequencies.push(baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2); // Major 7th
      break;
    case 3:
      frequencies.push(baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 1.875, baseFreq * 2); // Major 9th
      break;
    case 4: // Tetris!
      frequencies.push(baseFreq, baseFreq * 1.5, baseFreq * 2, baseFreq * 2.5, baseFreq * 3); // Power chord
      break;
    default:
      frequencies.push(...Array(linesCleared).fill(0).map((_, i) => baseFreq * (1 + i * 0.25)));
  }
  
  playMultiTone(frequencies, 300, volume, 0.05);
}

/**
 * Plays improved level up sound effect
 * Triumphant fanfare
 */
export function playImprovedLevelUpSFX(volume: number = 0.5): void {
  const notes = [
    523.25, // C5
    659.25, // E5
    783.99, // G5
    1046.50, // C6
  ];
  
  playMultiTone(notes, 400, volume, 0.08);
}

/**
 * Plays improved game over sound effect
 * Descending sad chord
 */
export function playImprovedGameOverSFX(volume: number = 0.5): void {
  const notes = [
    440.00, // A4
    349.23, // F4
    293.66, // D4
    220.00, // A3
  ];
  
  playMultiTone(notes, 800, volume, 0.15, 'triangle');
}

/**
 * Creates improved menu select sound effect
 * Crisp UI click
 */
export function createImprovedMenuSelectSFX(): SoundEffect {
  return createSoundEffect({
    name: 'menuSelect',
    frequency: 1000,
    duration: 40,
    type: 'sine',
    envelope: {
      attack: 0.001,
      decay: 0.01,
      sustain: 0.3,
      release: 0.029,
    },
  });
}

/**
 * Creates improved menu back sound effect
 * Lower pitched UI sound
 */
export function createImprovedMenuBackSFX(): SoundEffect {
  return createSoundEffect({
    name: 'menuBack',
    frequency: 600,
    duration: 50,
    type: 'sine',
    envelope: {
      attack: 0.001,
      decay: 0.015,
      sustain: 0.2,
      release: 0.034,
    },
  });
}

/**
 * Plays a hold piece sound effect
 * Quick swoosh
 */
export function playHoldPieceSFX(volume: number = 0.5): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Create a sweep effect
  const oscillator = createOscillator('sine', 200);
  const gainNode = createGainNode(0);
  const filter = createFilter('bandpass', 600, 3);
  
  connectNodes(oscillator, filter);
  connectNodes(filter, gainNode);
  connectNodes(gainNode, ctx.destination);
  
  // Frequency sweep
  oscillator.frequency.setValueAtTime(200, now);
  oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.1);
  
  // Volume envelope
  setGainValue(gainNode, 0, now);
  scheduleGainChange(gainNode, volume, now + 0.01, 'exponential');
  scheduleGainChange(gainNode, 0.00001, now + 0.1, 'exponential');
  
  startOscillator(oscillator, now);
  stopOscillator(oscillator, now + 0.1);
}

/**
 * Plays a hard drop sound effect
 * Quick descending sweep + thud
 */
export function playHardDropSFX(distance: number, volume: number = 0.5): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Sweep sound
  const sweepOsc = createOscillator('sawtooth', 800);
  const sweepGain = createGainNode(0);
  const sweepFilter = createFilter('lowpass', 1000, 1);
  
  connectNodes(sweepOsc, sweepFilter);
  connectNodes(sweepFilter, sweepGain);
  connectNodes(sweepGain, ctx.destination);
  
  const sweepDuration = Math.min(0.15, distance * 0.01);
  
  sweepOsc.frequency.setValueAtTime(800, now);
  sweepOsc.frequency.exponentialRampToValueAtTime(100, now + sweepDuration);
  
  setGainValue(sweepGain, 0, now);
  scheduleGainChange(sweepGain, volume * 0.3, now + 0.001, 'exponential');
  scheduleGainChange(sweepGain, 0.00001, now + sweepDuration, 'exponential');
  
  startOscillator(sweepOsc, now);
  stopOscillator(sweepOsc, now + sweepDuration);
  
  // Thud sound (delayed)
  const thudOsc = createOscillator('triangle', 60);
  const thudGain = createGainNode(0);
  
  connectNodes(thudOsc, thudGain);
  connectNodes(thudGain, ctx.destination);
  
  const thudTime = now + sweepDuration;
  
  setGainValue(thudGain, 0, thudTime);
  scheduleGainChange(thudGain, volume * 0.7, thudTime + 0.001, 'exponential');
  scheduleGainChange(thudGain, 0.00001, thudTime + 0.1, 'exponential');
  
  startOscillator(thudOsc, thudTime);
  stopOscillator(thudOsc, thudTime + 0.1);
}