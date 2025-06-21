/**
 * Simple sound manager for game audio
 */

import { getAudioContext, resumeAudioContext } from './audioContext';
import type { SoundEffect } from '../game/types';
import { 
  playSoundEffect
} from './soundEffects';
import { MusicPlayer, createMusicTrack } from './musicPlayer';
import { menuSongs, gameSongs, gameOverSong } from './songs';
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
  private musicVolume: number = 0.5;
  private soundEffects = new Map<string, SoundEffect>();
  
  constructor() {
    // Initialize on first user interaction
    this.musicPlayer = new MusicPlayer();
    this.musicPlayer.setVolume(this.musicVolume);
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
            playSoundEffect(moveSound, this.volume * 0.3);
          }
          break;
        }
          
        case 'rotate': {
          const rotateSound = this.soundEffects.get('pieceRotate');
          if (rotateSound) {
            playSoundEffect(rotateSound, this.volume * 0.4);
          }
          break;
        }
          
        case 'drop':
        case 'place': {
          const placeSound = this.soundEffects.get('piecePlace');
          if (placeSound) {
            playSoundEffect(placeSound, this.volume * 0.5);
          }
          break;
        }
          
        case 'lineClear':
          playImprovedLineClearSFX(1, this.volume * 0.7);
          break;
          
        case 'levelUp':
          playImprovedLevelUpSFX(this.volume * 0.8);
          break;
          
        case 'gameOver':
          playImprovedGameOverSFX(this.volume * 0.6);
          break;
          
        case 'hardDrop':
          playHardDropSFX(10, this.volume * 0.6);
          break;
          
        case 'hold':
          playHoldPieceSFX(this.volume * 0.5);
          break;
          
        case 'menuSelect': {
          const selectSound = this.soundEffects.get('menuSelect');
          if (selectSound) {
            playSoundEffect(selectSound, this.volume * 0.5);
          }
          break;
        }
          
        case 'menuBack': {
          const backSound = this.soundEffects.get('menuBack');
          if (backSound) {
            playSoundEffect(backSound, this.volume * 0.5);
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
    
    // Select appropriate music based on level
    const songs = gameSongs;
    const selectedSong = songs[Math.floor(Math.random() * songs.length)]!;
    
    // Increase tempo at higher levels
    const baseTempo = 140;
    const tempo = baseTempo + (level - 1) * 5;
    
    const gameMusic = createMusicTrack({
      name: 'Game Music',
      tempo: Math.min(tempo, 200), // Cap at 200 BPM
      notes: selectedSong,
      loop: true
    });
    
    this.musicPlayer.play(gameMusic);
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
}