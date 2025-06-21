/**
 * Web Audio API context management and utilities
 */

// Singleton audio context instance
let audioContext: AudioContext | null = null;

// Export for testing purposes
export const _resetAudioContext = (): void => {
  audioContext = null;
};

/**
 * Gets or creates the AudioContext instance
 * @returns The AudioContext instance
 */
export function getAudioContext(): AudioContext {
  if (!audioContext) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioContext = new AudioContextClass();
  }
  return audioContext;
}

/**
 * Creates a gain node
 * @param initialValue - Initial gain value (default: 1)
 * @returns GainNode instance
 */
export function createGainNode(initialValue: number = 1): GainNode {
  const ctx = getAudioContext();
  const gainNode = ctx.createGain();
  gainNode.gain.value = initialValue;
  return gainNode;
}

/**
 * Creates an oscillator node
 * @param type - Oscillator type (default: 'sine')
 * @param frequency - Frequency in Hz (default: 440)
 * @returns OscillatorNode instance
 */
export function createOscillator(
  type: OscillatorType = 'sine',
  frequency: number = 440
): OscillatorNode {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  return oscillator;
}

/**
 * Connects audio nodes
 * @param source - Source node
 * @param destination - Destination node
 */
export function connectNodes(
  source: AudioNode,
  destination: AudioNode | AudioDestinationNode
): void {
  source.connect(destination);
}

/**
 * Starts an oscillator
 * @param oscillator - Oscillator to start
 * @param when - When to start (default: immediately)
 */
export function startOscillator(oscillator: OscillatorNode, when: number = 0): void {
  oscillator.start(when);
}

/**
 * Stops an oscillator
 * @param oscillator - Oscillator to stop
 * @param when - When to stop (default: immediately)
 */
export function stopOscillator(oscillator: OscillatorNode, when: number = 0): void {
  oscillator.stop(when);
}

/**
 * Sets gain value
 * @param gainNode - Gain node
 * @param value - Gain value (0-1)
 * @param when - When to set the value (default: now)
 */
export function setGainValue(gainNode: GainNode, value: number, when?: number): void {
  const time = when ?? getAudioContext().currentTime;
  gainNode.gain.setValueAtTime(value, time);
}

/**
 * Schedules a gain change
 * @param gainNode - Gain node
 * @param value - Target gain value
 * @param endTime - When to reach the target value
 * @param rampType - Type of ramp ('linear' or 'exponential')
 */
export function scheduleGainChange(
  gainNode: GainNode,
  value: number,
  endTime: number,
  rampType: 'linear' | 'exponential' = 'linear'
): void {
  if (rampType === 'exponential') {
    // Exponential ramp can't handle 0, use a very small value instead
    const safeValue = value === 0 ? 0.00001 : value;
    gainNode.gain.exponentialRampToValueAtTime(safeValue, endTime);
  } else {
    gainNode.gain.linearRampToValueAtTime(value, endTime);
  }
}

/**
 * Compressor settings
 */
interface CompressorSettings {
  threshold?: number;
  knee?: number;
  ratio?: number;
  attack?: number;
  release?: number;
}

/**
 * Creates a dynamics compressor
 * @param settings - Compressor settings
 * @returns DynamicsCompressorNode instance
 */
export function createCompressor(settings: CompressorSettings = {}): DynamicsCompressorNode {
  const ctx = getAudioContext();
  const compressor = ctx.createDynamicsCompressor();
  
  if (settings.threshold !== undefined) {
    compressor.threshold.value = settings.threshold;
  }
  if (settings.knee !== undefined) {
    compressor.knee.value = settings.knee;
  }
  if (settings.ratio !== undefined) {
    compressor.ratio.value = settings.ratio;
  }
  if (settings.attack !== undefined) {
    compressor.attack.value = settings.attack;
  }
  if (settings.release !== undefined) {
    compressor.release.value = settings.release;
  }
  
  return compressor;
}

/**
 * Creates a biquad filter
 * @param type - Filter type (default: 'lowpass')
 * @param frequency - Cutoff frequency (default: 350)
 * @param q - Q factor (default: 1)
 * @returns BiquadFilterNode instance
 */
export function createFilter(
  type: BiquadFilterType = 'lowpass',
  frequency: number = 350,
  q: number = 1
): BiquadFilterNode {
  const ctx = getAudioContext();
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = frequency;
  filter.Q.value = q;
  return filter;
}

/**
 * Resumes the audio context
 * @returns Promise that resolves when resumed
 */
export async function resumeAudioContext(): Promise<void> {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
}

/**
 * Suspends the audio context
 * @returns Promise that resolves when suspended
 */
export async function suspendAudioContext(): Promise<void> {
  const ctx = getAudioContext();
  if (ctx.state === 'running') {
    await ctx.suspend();
  }
}

/**
 * Gets the current audio context state
 * @returns Audio context state
 */
export function getAudioState(): AudioContextState {
  return getAudioContext().state;
}