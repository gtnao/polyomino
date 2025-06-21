/**
 * Simple sound manager for game audio
 */

import { getAudioContext, resumeAudioContext } from './audioContext';
import { 
  playSoundEffect,
  createPieceMoveSFX,
  createPieceRotateSFX,
  createPiecePlaceSFX,
  createLineClearSFX,
  createLevelUpSFX,
  createGameOverSFX
} from './soundEffects';

export class SoundManager {
  private enabled: boolean = true;
  private volume: number = 0.7;
  private initialized: boolean = false;
  
  constructor() {
    // Initialize on first user interaction
  }
  
  private async ensureInitialized() {
    if (!this.initialized) {
      try {
        // This will create the audio context if it doesn't exist
        getAudioContext();
        await resumeAudioContext();
        this.initialized = true;
      } catch (error) {
        console.warn('Failed to initialize audio:', error);
      }
    }
  }
  
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
  
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }
  
  async playSound(soundType: string) {
    if (!this.enabled) return;
    
    // Ensure audio is initialized on first sound play (requires user interaction)
    await this.ensureInitialized();
    
    try {
      switch (soundType) {
        case 'move':
          playSoundEffect(createPieceMoveSFX(), this.volume * 0.3);
          break;
          
        case 'rotate':
          playSoundEffect(createPieceRotateSFX(), this.volume * 0.4);
          break;
          
        case 'drop':
          playSoundEffect(createPiecePlaceSFX(), this.volume * 0.5);
          break;
          
        case 'lineClear':
          playSoundEffect(createLineClearSFX(), this.volume * 0.7);
          break;
          
        case 'levelUp':
          playSoundEffect(createLevelUpSFX(), this.volume * 0.8);
          break;
          
        case 'gameOver':
          playSoundEffect(createGameOverSFX(), this.volume * 0.6);
          break;
      }
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }
  
  async resume() {
    await resumeAudioContext();
  }
}