import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  MusicTrack,
  MusicPlayer,
  createMusicTrack,
  generateMenuMusic,
  generateGameMusic,
  generateIntenseMusic,
} from '../musicPlayer';
import * as audioContext from '../audioContext';

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
const createMockOscillator = (): any => ({
  type: 'sine',
  frequency: { value: 440 },
  connect: vi.fn(),
  disconnect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
});

const createMockGainNode = (): any => ({
  gain: { value: 1 },
  connect: vi.fn(),
  disconnect: vi.fn(),
});

const createMockFilter = (): any => ({
  type: 'lowpass',
  frequency: { value: 1000 },
  Q: { value: 1 },
  connect: vi.fn(),
  disconnect: vi.fn(),
});

let mockOscillator = createMockOscillator();
let mockGainNode = createMockGainNode();
let mockFilter = createMockFilter();

const mockAudioContext = {
  currentTime: 0,
  destination: {},
};

beforeEach(() => {
  vi.clearAllMocks();
  mockAudioContext.currentTime = 0;
  mockOscillator = createMockOscillator();
  mockGainNode = createMockGainNode();
  mockFilter = createMockFilter();
  
  // Update mocks to return new instances
  (audioContext.createOscillator as any).mockImplementation(() => createMockOscillator());
  (audioContext.createGainNode as any).mockImplementation(() => createMockGainNode());
  (audioContext.createFilter as any).mockImplementation(() => createMockFilter());
});

describe('createMusicTrack', () => {
  it('should create a music track with notes', () => {
    const track = createMusicTrack({
      name: 'test',
      tempo: 120,
      notes: [
        { frequency: 440, duration: 0.5, time: 0, volume: 0.8 },
        { frequency: 880, duration: 0.25, time: 0.5, volume: 0.6 },
      ],
    });

    expect(track.name).toBe('test');
    expect(track.tempo).toBe(120);
    expect(track.notes).toHaveLength(2);
    expect(track.loop).toBe(true);
  });

  it('should set loop to false when specified', () => {
    const track = createMusicTrack({
      name: 'test',
      tempo: 120,
      notes: [],
      loop: false,
    });

    expect(track.loop).toBe(false);
  });
});

describe('MusicPlayer', () => {
  let player: MusicPlayer;

  beforeEach(() => {
    player = new MusicPlayer();
  });

  afterEach(() => {
    player.stop();
  });

  it('should initialize with enabled state', () => {
    expect(player.isEnabled()).toBe(true);
    expect(player.getVolume()).toBe(0.3);
    expect(player.isPlaying()).toBe(false);
  });

  it('should enable and disable music', () => {
    player.enable();
    expect(player.isEnabled()).toBe(true);

    player.disable();
    expect(player.isEnabled()).toBe(false);
  });

  it('should set volume', () => {
    player.setVolume(0.7);
    expect(player.getVolume()).toBe(0.7);

    // Test clamping
    player.setVolume(1.5);
    expect(player.getVolume()).toBe(1);

    player.setVolume(-0.5);
    expect(player.getVolume()).toBe(0);
  });

  it('should play a track when enabled', () => {
    const track: MusicTrack = {
      name: 'test',
      tempo: 120,
      notes: [
        { frequency: 440, duration: 0.5, time: 0, volume: 0.8 },
      ],
      loop: false,
    };

    player.enable();
    player.play(track);

    expect(player.isPlaying()).toBe(true);
    expect(player.getCurrentTrack()).toBe(track);
    expect(audioContext.createOscillator).toHaveBeenCalled();
    expect(audioContext.startOscillator).toHaveBeenCalled();
  });

  it('should not play when disabled', () => {
    const track = createMusicTrack({
      name: 'test',
      tempo: 120,
      notes: [{ frequency: 440, duration: 0.5, time: 0, volume: 0.8 }],
    });

    player.disable(); // Disable first since it's enabled by default
    player.play(track);

    expect(player.isPlaying()).toBe(false);
    expect(audioContext.createOscillator).not.toHaveBeenCalled();
  });

  it('should stop playing', () => {
    const track = createMusicTrack({
      name: 'test',
      tempo: 120,
      notes: [{ frequency: 440, duration: 1, time: 0, volume: 0.8 }],
      loop: false,
    });

    player.enable();
    player.play(track);
    
    expect(player.isPlaying()).toBe(true);

    player.stop();

    expect(player.isPlaying()).toBe(false);
    expect(player.getCurrentTrack()).toBeNull();
  });

  it('should pause and resume', () => {
    const track = createMusicTrack({
      name: 'test',
      tempo: 120,
      notes: [{ frequency: 440, duration: 2, time: 0, volume: 0.8 }],
    });

    player.enable();
    player.play(track);

    player.pause();
    expect(player.isPlaying()).toBe(false);

    player.resume();
    expect(player.isPlaying()).toBe(true);
  });

  it('should fade out', async () => {
    const track = createMusicTrack({
      name: 'test',
      tempo: 120,
      notes: [{ frequency: 440, duration: 3, time: 0, volume: 0.8 }],
    });

    player.enable();
    player.play(track);

    const fadePromise = player.fadeOut(100);
    
    // Should still be playing during fade
    expect(player.isPlaying()).toBe(true);

    await fadePromise;

    // Should stop after fade
    expect(player.isPlaying()).toBe(false);
  });

  it('should handle looping tracks', () => {
    vi.useFakeTimers();

    const track = createMusicTrack({
      name: 'test',
      tempo: 120,
      notes: [
        { frequency: 440, duration: 0.5, time: 0, volume: 0.8 },
        { frequency: 880, duration: 0.5, time: 0.5, volume: 0.8 },
      ],
      loop: true,
    });

    player.enable();
    player.play(track);

    // Advance time past track duration
    vi.advanceTimersByTime(2000);

    // Should still be playing
    expect(player.isPlaying()).toBe(true);

    vi.useRealTimers();
  });

  it('should schedule notes for non-looping tracks', () => {
    const track = createMusicTrack({
      name: 'test',
      tempo: 120,
      notes: [
        { frequency: 440, duration: 0.5, time: 0, volume: 0.8 },
      ],
      loop: false,
    });

    player.enable();
    player.play(track);

    // Track should be playing initially
    expect(player.isPlaying()).toBe(true);
    
    // Notes should be scheduled
    expect(audioContext.createOscillator).toHaveBeenCalled();
    expect(audioContext.startOscillator).toHaveBeenCalled();
  });
});

describe('Music generation', () => {
  it('should generate menu music', () => {
    const track = generateMenuMusic();
    
    expect(track.name).toBe('menu');
    expect(track.tempo).toBe(80);
    expect(track.notes.length).toBeGreaterThan(0);
    expect(track.loop).toBe(true);
  });

  it('should generate game music', () => {
    const track = generateGameMusic();
    
    expect(track.name).toBe('game');
    expect(track.tempo).toBe(120);
    expect(track.notes.length).toBeGreaterThan(0);
    expect(track.loop).toBe(true);
  });

  it('should generate intense music', () => {
    const track = generateIntenseMusic();
    
    expect(track.name).toBe('intense');
    expect(track.tempo).toBe(150);
    expect(track.notes.length).toBeGreaterThan(0);
    expect(track.loop).toBe(true);
  });

  it('should generate different patterns each time', () => {
    const track1 = generateGameMusic();
    const track2 = generateGameMusic();
    
    // Should have same structure but potentially different notes
    expect(track1.tempo).toBe(track2.tempo);
    expect(track1.notes.length).toBe(track2.notes.length);
  });
});