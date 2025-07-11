/**
 * Simple sound manager for game audio
 */

import { getAudioContext, resumeAudioContext } from './audioContext';
import type { SoundEffect } from '../game/types';
import { 
  playSoundEffect
} from './soundEffects';
import { MusicPlayer, createMusicTrack } from './musicPlayer';
import { menuSongs, gameOverSong } from './songs';
import { getTrackById, getRandomTrack } from './musicTracks';
import {
  createImprovedPieceMoveSFX,
  createImprovedPieceRotateSFX,
  createImprovedPiecePlaceSFX,
  playImprovedLineClearSFX,
  playImprovedLevelUpSFX,
  playImprovedGameOverSFX,
  createImprovedMenuSelectSFX,
  createImprovedMenuBackSFX,
  playHoldPieceSFX,
  playHardDropSFX
} from './improvedSoundEffects';

export class SoundManager {
  private enabled: boolean = true;
  private volume: number = 0.7;
  private initialized: boolean = false;
  private musicPlayer: MusicPlayer;
  private musicEnabled: boolean = true;
  private selectedTrackId: string = 'random';
  private musicVolume: number = 0.5;
  private soundEffects = new Map<string, SoundEffect>();
  
  constructor() {
    // Initialize on first user interaction
    this.musicPlayer = new MusicPlayer();
    this.musicPlayer.setVolume(this.musicVolume);
    // Enable music player by default if musicEnabled is true
    if (this.musicEnabled) {
      this.musicPlayer.enable();
    }
  }
  
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      try {
        // This will create the audio context if it doesn't exist
        getAudioContext();
        await resumeAudioContext();
        this.initialized = true;
        this.preloadImprovedSounds();
      } catch (error) {
        console.warn('Failed to initialize audio:', error);
      }
    }
  }
  
  private preloadImprovedSounds(): void {
    // Preload improved sound effects
    this.soundEffects.set('pieceMove', createImprovedPieceMoveSFX());
    this.soundEffects.set('pieceRotate', createImprovedPieceRotateSFX());
    this.soundEffects.set('piecePlace', createImprovedPiecePlaceSFX());
    this.soundEffects.set('menuSelect', createImprovedMenuSelectSFX());
    this.soundEffects.set('menuBack', createImprovedMenuBackSFX());
  }
  
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.musicPlayer.pause();
    }
  }
  
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }
  
  async playSound(soundType: string): Promise<void> {
    if (!this.enabled) {
      return;
    }
    
    // Ensure audio is initialized on first sound play (requires user interaction)
    await this.ensureInitialized();
    
    try {
      switch (soundType) {
        case 'move': {
          const moveSound = this.soundEffects.get('pieceMove');
          if (moveSound) {
            playSoundEffect(moveSound, this.volume * 0.333); // 0.5 * 2/3
          }
          break;
        }
          
        case 'rotate': {
          const rotateSound = this.soundEffects.get('pieceRotate');
          if (rotateSound) {
            playSoundEffect(rotateSound, this.volume * 0.4); // 0.6 * 2/3
          }
          break;
        }
          
        case 'drop':
        case 'place': {
          const placeSound = this.soundEffects.get('piecePlace');
          if (placeSound) {
            playSoundEffect(placeSound, this.volume * 0.467); // 0.7 * 2/3
          }
          break;
        }
          
        case 'lineClear':
          playImprovedLineClearSFX(1, this.volume * 0.6); // 0.9 * 2/3
          break;
          
        case 'levelUp':
          playImprovedLevelUpSFX(this.volume * 0.667); // 1.0 * 2/3
          break;
          
        case 'gameOver':
          playImprovedGameOverSFX(this.volume * 0.4); // 0.6 * 2/3
          break;
          
        case 'hardDrop':
          playHardDropSFX(10, this.volume * 0.4); // 0.6 * 2/3
          break;
          
        case 'hold':
          playHoldPieceSFX(this.volume * 0.333); // 0.5 * 2/3
          break;
          
        case 'menuSelect': {
          const selectSound = this.soundEffects.get('menuSelect');
          if (selectSound) {
            playSoundEffect(selectSound, this.volume * 0.333); // 0.5 * 2/3
          }
          break;
        }
          
        case 'menuBack': {
          const backSound = this.soundEffects.get('menuBack');
          if (backSound) {
            playSoundEffect(backSound, this.volume * 0.333); // 0.5 * 2/3
          }
          break;
        }
      }
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }
  
  async resume(): Promise<void> {
    await resumeAudioContext();
    if (this.musicEnabled && this.musicPlayer.getCurrentTrack()) {
      this.musicPlayer.resume();
    }
  }
  
  pause(): void {
    this.musicPlayer.pause();
  }
  
  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    if (enabled) {
      this.musicPlayer.enable();
    } else {
      this.musicPlayer.disable();
    }
  }
  
  setMusicVolume(volume: number): void {
    this.musicVolume = volume;
    this.musicPlayer.setVolume(volume);
  }
  
  async playMenuMusic(): Promise<void> {
    if (!this.musicEnabled) {
      return;
    }
    
    await this.ensureInitialized();
    
    // Select a random menu song
    const songs = menuSongs;
    const selectedSong = songs[Math.floor(Math.random() * songs.length)]!;
    
    const menuMusic = createMusicTrack({
      name: 'Menu Music',
      tempo: 120,
      notes: selectedSong,
      loop: true
    });
    
    this.musicPlayer.play(menuMusic);
  }
  
  async playGameMusic(level: number = 1): Promise<void> {
    if (!this.musicEnabled) {
      return;
    }
    
    await this.ensureInitialized();
    
    // Ensure audio context is running
    try {
      await resumeAudioContext();
    } catch (error) {
      console.warn('Failed to resume audio context:', error);
      return;
    }
    
    // Get selected track or random
    let trackInfo;
    if (this.selectedTrackId === 'random') {
      trackInfo = getRandomTrack();
    } else {
      trackInfo = getTrackById(this.selectedTrackId);
      if (!trackInfo) {
        trackInfo = getRandomTrack();
      }
    }
    
    const gameMusic = createMusicTrack({
      name: trackInfo.name,
      tempo: trackInfo.tempo,
      notes: trackInfo.notes,
      loop: true
    });
    
    this.musicPlayer.play(gameMusic);
    void this.musicPlayer.adjustTempoForLevel(level);
  }
  
  async playGameOverMusic(): Promise<void> {
    if (!this.musicEnabled) {
      return;
    }
    
    await this.ensureInitialized();
    
    const gameOverMusic = createMusicTrack({
      name: 'Game Over',
      tempo: 100,
      notes: gameOverSong,
      loop: false
    });
    
    this.musicPlayer.play(gameOverMusic);
  }
  
  async stopMusic(): Promise<void> {
    await this.musicPlayer.fadeOut(500);
  }
  
  /**
   * Updates music tempo when level changes
   * @param level - Current game level
   */
  async updateMusicTempo(level: number): Promise<void> {
    if (!this.musicEnabled) {return;}
    await this.musicPlayer.adjustTempoForLevel(level);
  }
  
  /**
   * Sets the selected music track
   * @param trackId - The ID of the track to select
   */
  setSelectedTrack(trackId: string): void {
    this.selectedTrackId = trackId;
  }
  
  /**
   * Gets the currently selected track ID
   */
  getSelectedTrack(): string {
    return this.selectedTrackId;
  }
}