import type { MusicNote } from './musicPlayer';

// Note frequency constants (A4 = 440Hz)
const G3 = 196.00;
const A3 = 220.00;
const B3 = 246.94;

const C4 = 261.63;
const D4 = 293.66;
const E4 = 329.63;
const F4 = 349.23;
const G4 = 392.00;
const A4 = 440.00;
const B4 = 493.88;

const C5 = 523.25;
const D5 = 587.33;
const E5 = 659.25;
const F5 = 698.46;
const G5 = 783.99;
const A5 = 880.00;

// Helper function to create a note
function note(frequency: number, time: number, duration: number = 1, volume: number = 0.3): MusicNote {
  return { frequency, time, duration, volume };
}

// Rest (silence)
function rest(time: number, duration: number = 1): MusicNote {
  return { frequency: 0, time, duration, volume: 0 };
}

/**
 * Korobeiniki (Tetris Theme A) - Traditional Russian folk song
 * Public domain
 */
export const korobeiniki: MusicNote[] = [
  // Bar 1-2
  note(E5, 0, 1), note(B4, 1, 0.5), note(C5, 1.5, 0.5),
  note(D5, 2, 1), note(C5, 3, 0.5), note(B4, 3.5, 0.5),
  
  // Bar 3-4
  note(A4, 4, 1), note(A4, 5, 0.5), note(C5, 5.5, 0.5),
  note(E5, 6, 1), note(D5, 7, 0.5), note(C5, 7.5, 0.5),
  
  // Bar 5-6
  note(B4, 8, 1.5), note(C5, 9.5, 0.5),
  note(D5, 10, 1), note(E5, 11, 1),
  
  // Bar 7-8
  note(C5, 12, 1), note(A4, 13, 1),
  note(A4, 14, 2),
  
  // Bar 9-10
  rest(16, 0.5), note(D5, 16.5, 1), note(F5, 17.5, 0.5),
  note(A5, 18, 1), note(G5, 19, 0.5), note(F5, 19.5, 0.5),
  
  // Bar 11-12
  note(E5, 20, 1.5), note(C5, 21.5, 0.5),
  note(E5, 22, 1), note(D5, 23, 0.5), note(C5, 23.5, 0.5),
  
  // Bar 13-14
  note(B4, 24, 1), note(B4, 25, 0.5), note(C5, 25.5, 0.5),
  note(D5, 26, 1), note(E5, 27, 1),
  
  // Bar 15-16
  note(C5, 28, 1), note(A4, 29, 1),
  note(A4, 30, 2),
];

/**
 * Ode to Joy - Beethoven (Public domain)
 * Simplified version
 */
export const odeToJoy: MusicNote[] = [
  // First phrase
  note(E4, 0, 1), note(E4, 1, 1), note(F4, 2, 1), note(G4, 3, 1),
  note(G4, 4, 1), note(F4, 5, 1), note(E4, 6, 1), note(D4, 7, 1),
  note(C4, 8, 1), note(C4, 9, 1), note(D4, 10, 1), note(E4, 11, 1),
  note(E4, 12, 1.5), note(D4, 13.5, 0.5), note(D4, 14, 2),
  
  // Second phrase
  note(E4, 16, 1), note(E4, 17, 1), note(F4, 18, 1), note(G4, 19, 1),
  note(G4, 20, 1), note(F4, 21, 1), note(E4, 22, 1), note(D4, 23, 1),
  note(C4, 24, 1), note(C4, 25, 1), note(D4, 26, 1), note(E4, 27, 1),
  note(D4, 28, 1.5), note(C4, 29.5, 0.5), note(C4, 30, 2),
];

/**
 * Twinkle Twinkle Little Star - Traditional (Public domain)
 */
export const twinkleTwinkle: MusicNote[] = [
  // Twinkle, twinkle, little star
  note(C4, 0, 1), note(C4, 1, 1), note(G4, 2, 1), note(G4, 3, 1),
  note(A4, 4, 1), note(A4, 5, 1), note(G4, 6, 2),
  
  // How I wonder what you are
  note(F4, 8, 1), note(F4, 9, 1), note(E4, 10, 1), note(E4, 11, 1),
  note(D4, 12, 1), note(D4, 13, 1), note(C4, 14, 2),
  
  // Up above the world so high
  note(G4, 16, 1), note(G4, 17, 1), note(F4, 18, 1), note(F4, 19, 1),
  note(E4, 20, 1), note(E4, 21, 1), note(D4, 22, 2),
  
  // Like a diamond in the sky
  note(G4, 24, 1), note(G4, 25, 1), note(F4, 26, 1), note(F4, 27, 1),
  note(E4, 28, 1), note(E4, 29, 1), note(D4, 30, 2),
];

/**
 * Canon in D - Pachelbel (Public domain)
 * Simplified chord progression
 */
export const canonInD: MusicNote[] = [
  // D major
  note(D4, 0, 2, 0.25), note(F4, 0, 2, 0.25), note(A4, 0, 2, 0.25),
  
  // A major
  note(A3, 2, 2, 0.25), note(C4, 2, 2, 0.25), note(E4, 2, 2, 0.25),
  
  // B minor
  note(B3, 4, 2, 0.25), note(D4, 4, 2, 0.25), note(F4, 4, 2, 0.25),
  
  // F# minor
  note(F4, 6, 2, 0.25), note(A4, 6, 2, 0.25), note(C5, 6, 2, 0.25),
  
  // G major
  note(G3, 8, 2, 0.25), note(B3, 8, 2, 0.25), note(D4, 8, 2, 0.25),
  
  // D major
  note(D4, 10, 2, 0.25), note(F4, 10, 2, 0.25), note(A4, 10, 2, 0.25),
  
  // G major
  note(G3, 12, 2, 0.25), note(B3, 12, 2, 0.25), note(D4, 12, 2, 0.25),
  
  // A major
  note(A3, 14, 2, 0.25), note(C4, 14, 2, 0.25), note(E4, 14, 2, 0.25),
  
  // Repeat with melody
  note(F5, 16, 1), note(E5, 17, 1), note(D5, 18, 1), note(C5, 19, 1),
  note(B4, 20, 1), note(A4, 21, 1), note(B4, 22, 1), note(C5, 23, 1),
  note(D5, 24, 1), note(C5, 25, 1), note(B4, 26, 1), note(A4, 27, 1),
  note(G4, 28, 1), note(F4, 29, 1), note(G4, 30, 1), note(A4, 31, 1),
];

/**
 * Hall of the Mountain King - Grieg (Public domain)
 * Simplified version
 */
export const mountainKing: MusicNote[] = [
  // Main theme (slow start)
  note(D4, 0, 0.5), note(E4, 0.5, 0.5), note(F4, 1, 0.5), note(G4, 1.5, 0.5),
  note(A4, 2, 0.5), note(F4, 2.5, 0.5), note(A4, 3, 1),
  
  note(G4, 4, 0.5), note(E4, 4.5, 0.5), note(G4, 5, 1),
  note(F4, 6, 0.5), note(D4, 6.5, 0.5), note(F4, 7, 1),
  
  // Repeat faster
  note(D4, 8, 0.25), note(E4, 8.25, 0.25), note(F4, 8.5, 0.25), note(G4, 8.75, 0.25),
  note(A4, 9, 0.25), note(F4, 9.25, 0.25), note(A4, 9.5, 0.5),
  
  note(G4, 10, 0.25), note(E4, 10.25, 0.25), note(G4, 10.5, 0.5),
  note(F4, 11, 0.25), note(D4, 11.25, 0.25), note(F4, 11.5, 0.5),
  
  // Build up
  note(D4, 12, 0.25), note(E4, 12.25, 0.25), note(F4, 12.5, 0.25), note(G4, 12.75, 0.25),
  note(A4, 13, 0.25), note(B4, 13.25, 0.25), note(C5, 13.5, 0.25), note(D5, 13.75, 0.25),
  
  note(A4, 14, 0.5), note(D5, 14.5, 0.5), note(C5, 15, 0.5), note(A4, 15.5, 0.5),
];

// Export song collections for different game states
export const menuSongs = [twinkleTwinkle, canonInD, odeToJoy];
export const gameSongs = [korobeiniki, mountainKing];
export const gameOverSong = odeToJoy;