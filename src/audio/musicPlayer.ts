import {
  getAudioContext,
  createOscillator,
  createGainNode,
  connectNodes,
  startOscillator,
  stopOscillator,
  setGainValue,
  scheduleGainChange,
} from './audioContext';

/**
 * Music note
 */
export interface MusicNote {
  frequency: number;
  duration: number; // in beats
  time: number; // start time in beats
  volume: number; // 0-1
}

/**
 * Music track
 */
export interface MusicTrack {
  name: string;
  tempo: number; // BPM
  notes: MusicNote[];
  loop: boolean;
}

/**
 * Creates a music track
 * @param options - Track options
 * @returns Music track
 */
export function createMusicTrack(options: {
  name: string;
  tempo: number;
  notes: MusicNote[];
  loop?: boolean;
}): MusicTrack {
  return {
    name: options.name,
    tempo: options.tempo,
    notes: options.notes,
    loop: options.loop ?? true,
  };
}

/**
 * Music player for background music
 */
export class MusicPlayer {
  private enabled = true;
  private volume = 0.3;
  private currentTrack: MusicTrack | null = null;
  private playing = false;
  private startTime = 0;
  private originalTempo: number | null = null;
  private pauseTime = 0;
  private scheduledNotes: Array<{ oscillator: OscillatorNode; stopTime: number }> = [];
  private animationFrameId: number | null = null;
  private masterGain: GainNode | null = null;

  /**
   * Enables music
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * Disables music
   */
  disable(): void {
    this.enabled = false;
    this.stop();
  }

  /**
   * Checks if music is enabled
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
    if (this.masterGain) {
      // Apply 0.1x multiplier to music volume to prevent distortion
      setGainValue(this.masterGain, this.volume * 0.1);
    }
  }

  /**
   * Gets the current volume
   * @returns Volume (0-1)
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Plays a music track
   * @param track - Track to play
   */
  play(track: MusicTrack): void {
    if (!this.enabled) {
      return;
    }

    this.stop();
    
    this.currentTrack = track;
    this.playing = true;
    this.startTime = getAudioContext().currentTime;
    this.pauseTime = 0;
    
    // Reset original tempo when playing a new track
    this.originalTempo = track.tempo;

    // Create master gain with greatly reduced volume to prevent distortion
    // Apply 0.1x multiplier to music volume for clean sound
    this.masterGain = createGainNode(this.volume * 0.1);
    connectNodes(this.masterGain, getAudioContext().destination);

    this.scheduleNextNotes();
  }

  /**
   * Adjusts the tempo of the current track based on level with smooth transition
   * @param level - Game level (1-99)
   */
  async adjustTempoForLevel(level: number): Promise<void> {
    if (!this.currentTrack || !this.playing) {return;}
    
    // Store the original base tempo if not already stored
    if (!this.originalTempo) {
      this.originalTempo = this.currentTrack.tempo;
    }
    
    // Calculate new tempo based on original tempo
    const maxSpeedMultiplier = 1.5;
    const speedIncreasePerLevel = 0.02;
    const speedMultiplier = Math.min(1 + (level - 1) * speedIncreasePerLevel, maxSpeedMultiplier);
    const newTempo = Math.round(this.originalTempo * speedMultiplier);
    
    // If tempo hasn't changed significantly, don't restart
    if (Math.abs(this.currentTrack.tempo - newTempo) < 5) {
      return;
    }
    
    // Store current playback position
    const currentTime = getAudioContext().currentTime - this.startTime;
    const beatPosition = (currentTime * this.currentTrack.tempo) / 60;
    
    // Create new track with adjusted tempo
    const adjustedTrack = {
      ...this.currentTrack,
      tempo: newTempo
    };
    
    // Fade out current music quickly
    await this.fadeOut(200);
    
    // Play the track from approximately the same beat position
    this.play(adjustedTrack);
    
    // Adjust start time to maintain beat continuity
    const newTimePosition = (beatPosition * 60) / newTempo;
    this.startTime = getAudioContext().currentTime - newTimePosition;
  }

  /**
   * Stops the current track
   */
  stop(): void {
    this.playing = false;
    this.currentTrack = null;
    this.originalTempo = null;

    // Stop all scheduled notes
    const now = getAudioContext().currentTime;
    for (const { oscillator } of this.scheduledNotes) {
      try {
        stopOscillator(oscillator, now);
      } catch {
        // Ignore errors from already stopped oscillators
      }
    }
    this.scheduledNotes = [];

    // Cancel animation frame
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Disconnect master gain
    if (this.masterGain) {
      this.masterGain.disconnect();
      this.masterGain = null;
    }
  }

  /**
   * Pauses the current track
   */
  pause(): void {
    if (!this.playing || !this.currentTrack) {
      return;
    }

    this.playing = false;
    this.pauseTime = getAudioContext().currentTime - this.startTime;

    // Stop scheduled notes
    const now = getAudioContext().currentTime;
    for (const { oscillator } of this.scheduledNotes) {
      try {
        stopOscillator(oscillator, now);
      } catch {
        // Ignore errors
      }
    }
    this.scheduledNotes = [];

    // Cancel animation frame
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Don't disconnect master gain to allow resume
  }

  /**
   * Resumes the current track
   */
  resume(): void {
    if (this.playing || !this.currentTrack) {
      return;
    }

    if (!this.enabled) {
      return;
    }

    this.playing = true;
    this.startTime = getAudioContext().currentTime - this.pauseTime;
    
    // Recreate master gain if needed
    if (!this.masterGain) {
      // Apply 0.1x multiplier to music volume to prevent distortion
      this.masterGain = createGainNode(this.volume * 0.1);
      connectNodes(this.masterGain, getAudioContext().destination);
    }
    
    this.scheduleNextNotes();
  }

  /**
   * Fades out and stops
   * @param duration - Fade duration in milliseconds
   * @returns Promise that resolves when fade is complete
   */
  async fadeOut(duration: number): Promise<void> {
    if (!this.masterGain || !this.playing) {
      return;
    }

    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const endTime = now + duration / 1000;

    scheduleGainChange(this.masterGain, 0, endTime, 'exponential');

    return new Promise((resolve) => {
      setTimeout(() => {
        this.stop();
        resolve();
      }, duration);
    });
  }

  /**
   * Checks if music is playing
   * @returns True if playing
   */
  isPlaying(): boolean {
    return this.playing;
  }

  /**
   * Gets the current track
   * @returns Current track or null
   */
  getCurrentTrack(): MusicTrack | null {
    return this.currentTrack;
  }

  /**
   * Schedules the next notes to play
   */
  private scheduleNextNotes(): void {
    if (!this.playing || !this.currentTrack || !this.masterGain) {
      return;
    }

    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const elapsed = now - this.startTime;
    const beatDuration = 60 / this.currentTrack.tempo;
    const trackDuration = this.getTrackDuration();

    // Calculate current loop position
    const loopPosition = this.currentTrack.loop
      ? elapsed % trackDuration
      : elapsed;

    // Schedule notes in the next second
    const scheduleAhead = 1.0;
    const scheduleUntil = loopPosition + scheduleAhead;

    for (const note of this.currentTrack.notes) {
      const noteTime = note.time * beatDuration;
      const noteDuration = note.duration * beatDuration;

      // Check if note should be scheduled
      const scheduleTime = noteTime;
      
      if (this.currentTrack.loop) {
        // Handle looping - calculate which loop iteration we're in
        const currentLoop = Math.floor(elapsed / trackDuration);
        const nextLoop = currentLoop + 1;
        
        // Schedule notes for current loop
        const currentLoopTime = noteTime + currentLoop * trackDuration;
        if (currentLoopTime >= elapsed && currentLoopTime < elapsed + scheduleAhead) {
          this.scheduleNote(note, this.startTime + currentLoopTime, noteDuration);
        }
        
        // Schedule notes for next loop if needed
        const nextLoopTime = noteTime + nextLoop * trackDuration;
        if (nextLoopTime < elapsed + scheduleAhead) {
          this.scheduleNote(note, this.startTime + nextLoopTime, noteDuration);
        }
      } else {
        // Non-looping
        if (scheduleTime >= loopPosition && 
            scheduleTime < scheduleUntil &&
            !this.isNoteScheduled(scheduleTime)) {
          this.scheduleNote(note, this.startTime + scheduleTime, noteDuration);
        }
      }
    }

    // Clean up old notes
    this.cleanupOldNotes();

    // Check if track is complete (non-looping)
    if (!this.currentTrack.loop && elapsed >= trackDuration) {
      this.stop();
      return;
    }

    // Schedule next check
    this.animationFrameId = requestAnimationFrame(() => {
      this.scheduleNextNotes();
    });
  }

  /**
   * Schedules a single note
   * @param note - Note to schedule
   * @param startTime - Start time
   * @param duration - Duration
   */
  private scheduleNote(note: MusicNote, startTime: number, duration: number): void {
    if (!this.masterGain) {
      return;
    }

    const oscillator = createOscillator('sine', note.frequency);
    const gainNode = createGainNode(0);

    connectNodes(oscillator, gainNode);
    connectNodes(gainNode, this.masterGain);

    // Apply note envelope
    const attackTime = 0.01;
    const releaseTime = 0.05;
    
    setGainValue(gainNode, 0, startTime);
    scheduleGainChange(gainNode, note.volume, startTime + attackTime, 'exponential');
    scheduleGainChange(gainNode, note.volume, startTime + duration - releaseTime, 'linear');
    scheduleGainChange(gainNode, 0.00001, startTime + duration, 'exponential');

    startOscillator(oscillator, startTime);
    stopOscillator(oscillator, startTime + duration);

    this.scheduledNotes.push({
      oscillator,
      stopTime: startTime + duration,
    });
  }

  /**
   * Checks if a note is already scheduled
   * @param time - Time to check
   * @returns True if scheduled
   */
  private isNoteScheduled(time: number): boolean {
    const tolerance = 0.01;
    return this.scheduledNotes.some(note => 
      Math.abs(note.stopTime - (this.startTime + time)) < tolerance
    );
  }

  /**
   * Cleans up old notes
   */
  private cleanupOldNotes(): void {
    const now = getAudioContext().currentTime;
    this.scheduledNotes = this.scheduledNotes.filter(note => note.stopTime > now);
  }

  /**
   * Gets the track duration in seconds
   * @returns Duration
   */
  private getTrackDuration(): number {
    if (!this.currentTrack) {
      return 0;
    }

    const beatDuration = 60 / this.currentTrack.tempo;
    let maxTime = 0;

    for (const note of this.currentTrack.notes) {
      const endTime = (note.time + note.duration) * beatDuration;
      maxTime = Math.max(maxTime, endTime);
    }

    return maxTime;
  }
}

// Music generation functions

/**
 * Generates menu music
 * @returns Music track
 */
export function generateMenuMusic(): MusicTrack {
  const notes: MusicNote[] = [];
  const scale = [130.81, 146.83, 164.81, 174.61, 196.00, 220.00, 246.94]; // C major scale

  // Simple ambient pattern
  for (let i = 0; i < 16; i++) {
    const noteIndex = Math.floor(Math.random() * scale.length);
    notes.push({
      frequency: scale[noteIndex]!,
      duration: 2,
      time: i * 2,
      volume: 0.3,
    });

    // Add harmony
    if (i % 2 === 0) {
      notes.push({
        frequency: scale[(noteIndex + 2) % scale.length]!,
        duration: 2,
        time: i * 2,
        volume: 0.2,
      });
    }
  }

  return createMusicTrack({
    name: 'menu',
    tempo: 80,
    notes,
    loop: true,
  });
}

/**
 * Generates game music
 * @returns Music track
 */
export function generateGameMusic(): MusicTrack {
  const notes: MusicNote[] = [];
  const bassScale = [65.41, 73.42, 82.41, 87.31, 98.00]; // Bass notes
  const melodyScale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88]; // C major

  // Bass line
  for (let i = 0; i < 32; i++) {
    const bassIndex = i % bassScale.length;
    notes.push({
      frequency: bassScale[bassIndex]!,
      duration: 0.5,
      time: i * 0.5,
      volume: 0.4,
    });
  }

  // Melody
  for (let i = 0; i < 16; i++) {
    const melodyIndex = Math.floor(Math.random() * melodyScale.length);
    notes.push({
      frequency: melodyScale[melodyIndex]!,
      duration: 0.25,
      time: i + 0.25,
      volume: 0.5,
    });
  }

  return createMusicTrack({
    name: 'game',
    tempo: 120,
    notes,
    loop: true,
  });
}

/**
 * Generates intense music for high-speed gameplay
 * @returns Music track
 */
export function generateIntenseMusic(): MusicTrack {
  const notes: MusicNote[] = [];
  const scale = [220.00, 246.94, 261.63, 293.66, 329.63]; // A minor pentatonic

  // Fast arpeggios
  for (let i = 0; i < 64; i++) {
    const noteIndex = i % scale.length;
    notes.push({
      frequency: scale[noteIndex]!,
      duration: 0.125,
      time: i * 0.125,
      volume: 0.6,
    });

    // Add octave
    if (i % 8 === 0) {
      notes.push({
        frequency: scale[noteIndex]! * 2,
        duration: 0.25,
        time: i * 0.125,
        volume: 0.4,
      });
    }
  }

  return createMusicTrack({
    name: 'intense',
    tempo: 150,
    notes,
    loop: true,
  });
}