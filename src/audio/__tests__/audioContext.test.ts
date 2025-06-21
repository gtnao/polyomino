import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import * as audioContextModule from '../audioContext';

// Mock AudioContext
class MockAudioContext {
  state: AudioContextState = 'suspended';
  currentTime = 0;
  destination = {};
  sampleRate = 44100;

  createGain = vi.fn(() => ({
    gain: {
      value: 1,
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    disconnect: vi.fn(),
  }));

  createOscillator = vi.fn(() => ({
    type: 'sine' as OscillatorType,
    frequency: {
      value: 440,
      setValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  }));

  createDynamicsCompressor = vi.fn(() => ({
    threshold: { value: -50 },
    knee: { value: 40 },
    ratio: { value: 12 },
    attack: { value: 0 },
    release: { value: 0.25 },
    connect: vi.fn(),
    disconnect: vi.fn(),
  }));

  createBiquadFilter = vi.fn(() => ({
    type: 'lowpass' as BiquadFilterType,
    frequency: { value: 350 },
    Q: { value: 1 },
    gain: { value: 0 },
    connect: vi.fn(),
    disconnect: vi.fn(),
  }));

  resume = vi.fn(() => {
    this.state = 'running';
    return Promise.resolve();
  });

  suspend = vi.fn(() => {
    this.state = 'suspended';
    return Promise.resolve();
  });

  close = vi.fn(() => {
    this.state = 'closed';
    return Promise.resolve();
  });
}

// Store original AudioContext
const originalAudioContext = global.AudioContext;
const originalWebkitAudioContext = (global as any).webkitAudioContext;

beforeEach(() => {
  vi.clearAllMocks();
  
  // Reset global AudioContext for each test
  global.AudioContext = undefined as any;
  (global as any).webkitAudioContext = undefined;
});

describe('audioContext', () => {
  describe('getAudioContext', () => {
    it('should create and return AudioContext instance', () => {
      const mockCtx = new MockAudioContext();
      global.AudioContext = vi.fn(() => mockCtx) as any;
      
      // Clear the module cache to ensure fresh import
      audioContextModule._resetAudioContext();
      
      const ctx = audioContextModule.getAudioContext();
      
      expect(ctx).toBe(mockCtx);
      expect(global.AudioContext).toHaveBeenCalledOnce();
    });

    it('should return same instance on subsequent calls', () => {
      const mockCtx = new MockAudioContext();
      global.AudioContext = vi.fn(() => mockCtx) as any;
      
      // Clear the module cache
      audioContextModule._resetAudioContext();
      
      const ctx1 = audioContextModule.getAudioContext();
      const ctx2 = audioContextModule.getAudioContext();
      
      expect(ctx1).toBe(ctx2);
      expect(global.AudioContext).toHaveBeenCalledOnce();
    });

    it('should use webkitAudioContext if AudioContext not available', () => {
      const mockCtx = new MockAudioContext();
      (global as any).webkitAudioContext = vi.fn(() => mockCtx);
      
      // Clear the module cache
      audioContextModule._resetAudioContext();
      
      const ctx = audioContextModule.getAudioContext();
      
      expect(ctx).toBe(mockCtx);
      expect((global as any).webkitAudioContext).toHaveBeenCalled();
    });
  });

  describe('audio node creation', () => {
    let mockCtx: MockAudioContext;

    beforeEach(() => {
      mockCtx = new MockAudioContext();
      global.AudioContext = vi.fn(() => mockCtx) as any;
      audioContextModule._resetAudioContext();
    });

    describe('createGainNode', () => {
      it('should create a gain node with default value', () => {
        const gainNode = audioContextModule.createGainNode();
        
        expect(mockCtx.createGain).toHaveBeenCalled();
        expect(gainNode.gain.value).toBe(1);
      });

      it('should create a gain node with custom value', () => {
        const gainNode = audioContextModule.createGainNode(0.5);
        
        expect(gainNode.gain.value).toBe(0.5);
      });
    });

    describe('createOscillator', () => {
      it('should create an oscillator with default settings', () => {
        const osc = audioContextModule.createOscillator();
        
        expect(mockCtx.createOscillator).toHaveBeenCalled();
        expect(osc.type).toBe('sine');
        expect(osc.frequency.value).toBe(440);
      });

      it('should create an oscillator with custom settings', () => {
        const osc = audioContextModule.createOscillator('square', 880);
        
        expect(osc.type).toBe('square');
        expect(osc.frequency.value).toBe(880);
      });
    });

    describe('createCompressor', () => {
      it('should create compressor with default settings', () => {
        const compressor = audioContextModule.createCompressor();
        
        expect(mockCtx.createDynamicsCompressor).toHaveBeenCalled();
        expect(compressor).toBeDefined();
      });

      it('should create compressor with custom settings', () => {
        const settings = {
          threshold: -24,
          knee: 30,
          ratio: 8,
          attack: 0.003,
          release: 0.1,
        };
        
        const compressor = audioContextModule.createCompressor(settings);
        
        expect(compressor.threshold.value).toBe(-24);
        expect(compressor.knee.value).toBe(30);
        expect(compressor.ratio.value).toBe(8);
        expect(compressor.attack.value).toBe(0.003);
        expect(compressor.release.value).toBe(0.1);
      });
    });

    describe('createFilter', () => {
      it('should create filter with default settings', () => {
        const filter = audioContextModule.createFilter();
        
        expect(mockCtx.createBiquadFilter).toHaveBeenCalled();
        expect(filter.type).toBe('lowpass');
        expect(filter.frequency.value).toBe(350);
        expect(filter.Q.value).toBe(1);
      });

      it('should create filter with custom settings', () => {
        const filter = audioContextModule.createFilter('highpass', 1000, 2);
        
        expect(filter.type).toBe('highpass');
        expect(filter.frequency.value).toBe(1000);
        expect(filter.Q.value).toBe(2);
      });
    });
  });

  describe('audio node operations', () => {
    let mockCtx: MockAudioContext;
    let gainNode: any;
    let oscillator: any;

    beforeEach(() => {
      mockCtx = new MockAudioContext();
      global.AudioContext = vi.fn(() => mockCtx) as any;
      audioContextModule._resetAudioContext();
      
      gainNode = audioContextModule.createGainNode();
      oscillator = audioContextModule.createOscillator();
    });

    describe('connectNodes', () => {
      it('should connect source to destination', () => {
        audioContextModule.connectNodes(oscillator, gainNode);
        
        expect(oscillator.connect).toHaveBeenCalledWith(gainNode);
      });
    });

    describe('startOscillator', () => {
      it('should start oscillator immediately', () => {
        audioContextModule.startOscillator(oscillator);
        
        expect(oscillator.start).toHaveBeenCalledWith(0);
      });

      it('should start oscillator at specified time', () => {
        audioContextModule.startOscillator(oscillator, 1.5);
        
        expect(oscillator.start).toHaveBeenCalledWith(1.5);
      });
    });

    describe('stopOscillator', () => {
      it('should stop oscillator immediately', () => {
        audioContextModule.stopOscillator(oscillator);
        
        expect(oscillator.stop).toHaveBeenCalledWith(0);
      });

      it('should stop oscillator at specified time', () => {
        audioContextModule.stopOscillator(oscillator, 2.0);
        
        expect(oscillator.stop).toHaveBeenCalledWith(2.0);
      });
    });

    describe('setGainValue', () => {
      it('should set gain value at current time', () => {
        audioContextModule.setGainValue(gainNode, 0.7);
        
        expect(gainNode.gain.setValueAtTime).toHaveBeenCalledWith(0.7, 0);
      });

      it('should set gain value at specified time', () => {
        audioContextModule.setGainValue(gainNode, 0.3, 2.5);
        
        expect(gainNode.gain.setValueAtTime).toHaveBeenCalledWith(0.3, 2.5);
      });
    });

    describe('scheduleGainChange', () => {
      it('should schedule linear ramp', () => {
        audioContextModule.scheduleGainChange(gainNode, 0.8, 1.0, 'linear');
        
        expect(gainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.8, 1.0);
      });

      it('should schedule exponential ramp', () => {
        audioContextModule.scheduleGainChange(gainNode, 0.5, 2.0, 'exponential');
        
        expect(gainNode.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.5, 2.0);
      });

      it('should handle zero value for exponential ramp', () => {
        audioContextModule.scheduleGainChange(gainNode, 0, 1.0, 'exponential');
        
        expect(gainNode.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.00001, 1.0);
      });
    });
  });

  describe('audio context state', () => {
    let mockCtx: MockAudioContext;

    beforeEach(() => {
      mockCtx = new MockAudioContext();
      global.AudioContext = vi.fn(() => mockCtx) as any;
      audioContextModule._resetAudioContext();
    });

    describe('resumeAudioContext', () => {
      it('should resume audio context', async () => {
        await audioContextModule.resumeAudioContext();
        
        expect(mockCtx.resume).toHaveBeenCalled();
        expect(mockCtx.state).toBe('running');
      });

      it('should not resume if already running', async () => {
        mockCtx.state = 'running';
        
        await audioContextModule.resumeAudioContext();
        
        expect(mockCtx.resume).not.toHaveBeenCalled();
      });
    });

    describe('suspendAudioContext', () => {
      it('should suspend audio context', async () => {
        mockCtx.state = 'running';
        
        await audioContextModule.suspendAudioContext();
        
        expect(mockCtx.suspend).toHaveBeenCalled();
        expect(mockCtx.state).toBe('suspended');
      });

      it('should not suspend if already suspended', async () => {
        await audioContextModule.suspendAudioContext();
        
        expect(mockCtx.suspend).not.toHaveBeenCalled();
      });
    });

    describe('getAudioState', () => {
      it('should return current audio context state', () => {
        expect(audioContextModule.getAudioState()).toBe('suspended');
        
        mockCtx.state = 'running';
        expect(audioContextModule.getAudioState()).toBe('running');
      });
    });
  });
});

// Restore original AudioContext after all tests
afterAll(() => {
  global.AudioContext = originalAudioContext;
  (global as any).webkitAudioContext = originalWebkitAudioContext;
});