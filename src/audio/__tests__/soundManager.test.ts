import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SoundManager } from '../soundManager';
import * as audioContext from '../audioContext';
import * as soundEffects from '../soundEffects';
import * as improvedSoundEffects from '../improvedSoundEffects';
import * as musicTracks from '../musicTracks';
import { MusicPlayer } from '../musicPlayer';

// Mock all dependencies
vi.mock('../audioContext');
vi.mock('../soundEffects');
vi.mock('../improvedSoundEffects');
vi.mock('../musicTracks');
vi.mock('../musicPlayer', () => ({
  MusicPlayer: vi.fn(),
  createMusicTrack: vi.fn((options) => options)
}));
vi.mock('../songs', () => ({
  menuSongs: [
    [{ frequency: 440, duration: 1, time: 0, volume: 0.5 }]
  ],
  gameOverSong: [{ frequency: 220, duration: 2, time: 0, volume: 0.3 }],
  korobeiniki: [{ frequency: 440, duration: 1, time: 0, volume: 0.5 }],
  mountainKing: [{ frequency: 440, duration: 1, time: 0, volume: 0.5 }],
  bumblebee: [{ frequency: 440, duration: 1, time: 0, volume: 0.5 }],
  revolutionary: [{ frequency: 440, duration: 1, time: 0, volume: 0.5 }],
  summerVivaldi: [{ frequency: 440, duration: 1, time: 0, volume: 0.5 }]
}));

describe('SoundManager', () => {
  let soundManager: SoundManager;
  let mockMusicPlayer: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mock audio context
    vi.mocked(audioContext.getAudioContext).mockReturnValue({} as any);
    vi.mocked(audioContext.resumeAudioContext).mockResolvedValue();
    
    // Setup mock music player
    mockMusicPlayer = {
      enable: vi.fn(),
      disable: vi.fn(),
      setVolume: vi.fn(),
      play: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      fadeOut: vi.fn().mockResolvedValue(undefined),
      adjustTempoForLevel: vi.fn().mockResolvedValue(undefined),
      getCurrentTrack: vi.fn().mockReturnValue(null),
    };
    
    vi.mocked(MusicPlayer).mockImplementation(() => mockMusicPlayer);
    
    // Setup mock sound effects
    vi.mocked(improvedSoundEffects.createImprovedPieceMoveSFX).mockReturnValue({ type: 'move' } as any);
    vi.mocked(improvedSoundEffects.createImprovedPieceRotateSFX).mockReturnValue({ type: 'rotate' } as any);
    vi.mocked(improvedSoundEffects.createImprovedPiecePlaceSFX).mockReturnValue({ type: 'place' } as any);
    vi.mocked(improvedSoundEffects.createImprovedMenuSelectSFX).mockReturnValue({ type: 'select' } as any);
    vi.mocked(improvedSoundEffects.createImprovedMenuBackSFX).mockReturnValue({ type: 'back' } as any);
    
    // Setup mock music tracks
    vi.mocked(musicTracks.getRandomTrack).mockReturnValue({
      id: 'track1',
      name: 'Test Track',
      tempo: 120,
      notes: []
    });
    vi.mocked(musicTracks.getTrackById).mockReturnValue({
      id: 'track1',
      name: 'Test Track',
      tempo: 120,
      notes: []
    });
    
    soundManager = new SoundManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      expect(mockMusicPlayer.setVolume).toHaveBeenCalledWith(0.5);
      expect(mockMusicPlayer.enable).toHaveBeenCalled();
    });

    it('should create sound effects on first initialization', async () => {
      await soundManager.playSound('move');
      
      expect(audioContext.getAudioContext).toHaveBeenCalled();
      expect(audioContext.resumeAudioContext).toHaveBeenCalled();
      expect(improvedSoundEffects.createImprovedPieceMoveSFX).toHaveBeenCalled();
    });

    it('should only initialize once', async () => {
      await soundManager.playSound('move');
      await soundManager.playSound('rotate');
      
      expect(audioContext.getAudioContext).toHaveBeenCalledTimes(1);
      expect(audioContext.resumeAudioContext).toHaveBeenCalledTimes(1);
    });
  });

  describe('sound effects', () => {
    it('should play move sound', async () => {
      await soundManager.playSound('move');
      
      expect(soundEffects.playSoundEffect).toHaveBeenCalledWith(
        { type: 'move' },
        0.7 * 0.333 // volume * multiplier
      );
    });

    it('should play rotate sound', async () => {
      await soundManager.playSound('rotate');
      
      expect(soundEffects.playSoundEffect).toHaveBeenCalledWith(
        { type: 'rotate' },
        0.7 * 0.4
      );
    });

    it('should play drop/place sound', async () => {
      await soundManager.playSound('drop');
      
      expect(soundEffects.playSoundEffect).toHaveBeenCalledWith(
        { type: 'place' },
        0.7 * 0.467
      );
    });

    it('should play line clear sound', async () => {
      await soundManager.playSound('lineClear');
      
      expect(improvedSoundEffects.playImprovedLineClearSFX).toHaveBeenCalledWith(1, 0.7 * 0.6);
    });

    it('should play level up sound', async () => {
      await soundManager.playSound('levelUp');
      
      expect(improvedSoundEffects.playImprovedLevelUpSFX).toHaveBeenCalledWith(0.7 * 0.667);
    });

    it('should play game over sound', async () => {
      await soundManager.playSound('gameOver');
      
      expect(improvedSoundEffects.playImprovedGameOverSFX).toHaveBeenCalledWith(0.7 * 0.4);
    });

    it('should not play sounds when disabled', async () => {
      soundManager.setEnabled(false);
      await soundManager.playSound('move');
      
      expect(soundEffects.playSoundEffect).not.toHaveBeenCalled();
    });

    it('should handle unknown sound types gracefully', async () => {
      await expect(soundManager.playSound('unknown')).resolves.not.toThrow();
    });
  });

  describe('volume control', () => {
    it('should set sound effect volume', async () => {
      soundManager.setVolume(0.5);
      await soundManager.playSound('move');
      
      expect(soundEffects.playSoundEffect).toHaveBeenCalledWith(
        { type: 'move' },
        0.5 * 0.333
      );
    });

    it('should clamp volume between 0 and 1', () => {
      soundManager.setVolume(2.0);
      expect(soundManager['volume']).toBe(1.0);
      
      soundManager.setVolume(-1.0);
      expect(soundManager['volume']).toBe(0.0);
    });

    it('should set music volume', () => {
      soundManager.setMusicVolume(0.8);
      expect(mockMusicPlayer.setVolume).toHaveBeenCalledWith(0.8);
    });
  });

  describe('music control', () => {
    it('should enable music', () => {
      soundManager.setMusicEnabled(true);
      
      expect(mockMusicPlayer.enable).toHaveBeenCalled();
    });

    it('should disable music', () => {
      soundManager.setMusicEnabled(false);
      
      expect(mockMusicPlayer.disable).toHaveBeenCalled();
    });

    it('should pause music', () => {
      soundManager.pause();
      
      expect(mockMusicPlayer.pause).toHaveBeenCalled();
    });

    it('should resume music when enabled', async () => {
      mockMusicPlayer.getCurrentTrack.mockReturnValue({ name: 'Test' });
      
      await soundManager.resume();
      
      expect(audioContext.resumeAudioContext).toHaveBeenCalled();
      expect(mockMusicPlayer.resume).toHaveBeenCalled();
    });

    it('should not resume music when disabled', async () => {
      soundManager.setMusicEnabled(false);
      
      await soundManager.resume();
      
      expect(mockMusicPlayer.resume).not.toHaveBeenCalled();
    });
  });

  describe('music playback', () => {
    beforeEach(() => {
      vi.mocked(audioContext.resumeAudioContext).mockResolvedValue();
    });

    it('should not play menu music when disabled', async () => {
      soundManager.setMusicEnabled(false);
      
      await soundManager.playMenuMusic();
      
      expect(mockMusicPlayer.play).not.toHaveBeenCalled();
    });

    it('should play game music with random track', async () => {
      await soundManager.playGameMusic(1);
      
      expect(musicTracks.getRandomTrack).toHaveBeenCalled();
      expect(mockMusicPlayer.play).toHaveBeenCalled();
      expect(mockMusicPlayer.adjustTempoForLevel).toHaveBeenCalledWith(1);
    });

    it('should play game music with selected track', async () => {
      soundManager.setSelectedTrack('track1');
      
      await soundManager.playGameMusic(1);
      
      expect(musicTracks.getTrackById).toHaveBeenCalledWith('track1');
      expect(mockMusicPlayer.play).toHaveBeenCalled();
    });

    it('should fallback to random track if selected track not found', async () => {
      vi.mocked(musicTracks.getTrackById).mockReturnValue(null as any);
      soundManager.setSelectedTrack('invalid');
      
      await soundManager.playGameMusic(1);
      
      expect(musicTracks.getRandomTrack).toHaveBeenCalled();
    });

    it('should not play game music when disabled', async () => {
      soundManager.setMusicEnabled(false);
      
      await soundManager.playGameMusic(1);
      
      expect(mockMusicPlayer.play).not.toHaveBeenCalled();
    });

    it('should play game over music', async () => {
      await soundManager.playGameOverMusic();
      
      expect(mockMusicPlayer.play).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Game Over',
          tempo: 100,
          loop: false
        })
      );
    });

    it('should stop music with fadeout', async () => {
      await soundManager.stopMusic();
      
      expect(mockMusicPlayer.fadeOut).toHaveBeenCalledWith(500);
    });

    it('should update music tempo for level', async () => {
      await soundManager.updateMusicTempo(5);
      
      expect(mockMusicPlayer.adjustTempoForLevel).toHaveBeenCalledWith(5);
    });

    it('should not update tempo when music disabled', async () => {
      soundManager.setMusicEnabled(false);
      
      await soundManager.updateMusicTempo(5);
      
      expect(mockMusicPlayer.adjustTempoForLevel).not.toHaveBeenCalled();
    });
  });

  describe('track selection', () => {
    it('should set and get selected track', () => {
      soundManager.setSelectedTrack('custom-track');
      
      expect(soundManager.getSelectedTrack()).toBe('custom-track');
    });

    it('should default to random track', () => {
      expect(soundManager.getSelectedTrack()).toBe('random');
    });
  });

  describe('error handling', () => {
    it('should handle audio context initialization errors', async () => {
      vi.mocked(audioContext.getAudioContext).mockImplementation(() => {
        throw new Error('Audio context error');
      });
      
      const newSoundManager = new SoundManager();
      await newSoundManager.playSound('move');
      
      // Should not throw
      expect(soundEffects.playSoundEffect).not.toHaveBeenCalled();
    });

    it('should handle sound playback errors', async () => {
      vi.mocked(soundEffects.playSoundEffect).mockImplementation(() => {
        throw new Error('Playback error');
      });
      
      // Should not throw
      await expect(soundManager.playSound('move')).resolves.not.toThrow();
    });

    it('should handle music playback errors gracefully', async () => {
      vi.mocked(audioContext.resumeAudioContext).mockRejectedValue(new Error('Resume error'));
      
      // Should not throw
      await expect(soundManager.playGameMusic(1)).resolves.not.toThrow();
    });
  });
});