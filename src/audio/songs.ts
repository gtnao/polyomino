import type { MusicNote } from './musicPlayer';

// Note frequency constants (A4 = 440Hz)
const C2 = 65.41;
const D2 = 73.42;
const E2 = 82.41;
// const F2 = 87.31;
const G2 = 98.00;
const A2 = 110.00;
// const B2 = 123.47;

const C3 = 130.81;
// const Cs3 = 138.59;
const D3 = 146.83;
const Ds3 = 155.56;
const E3 = 164.81;
const F3 = 174.61;
// const Fs3 = 185.00;
const G3 = 196.00;
const Gs3 = 207.65;
const A3 = 220.00;
const As3 = 233.08;
const B3 = 246.94;

const C4 = 261.63;
// const Cs4 = 277.18;
const D4 = 293.66;
const Ds4 = 311.13;
const E4 = 329.63;
const F4 = 349.23;
const Fs4 = 369.99;
const G4 = 392.00;
const Gs4 = 415.30;
const A4 = 440.00;
const As4 = 466.16;
const B4 = 493.88;

const C5 = 523.25;
const Cs5 = 554.37;
const D5 = 587.33;
const Ds5 = 622.25;
const E5 = 659.25;
const F5 = 698.46;
const Fs5 = 739.99;
const G5 = 783.99;
// const Gs5 = 830.61;
const A5 = 880.00;
// const As5 = 932.33;
// const B5 = 987.77;

// const C6 = 1046.50;

// Helper function to create a note
function note(frequency: number, time: number, duration: number = 1, volume: number = 0.075): MusicNote {
  return { frequency, time, duration, volume };
}

// Rest (silence)
function rest(time: number, duration: number = 1): MusicNote {
  return { frequency: 0, time, duration, volume: 0 };
}

/**
 * In the Hall of the Mountain King - Edvard Grieg (Public domain)
 * Main melody with simple bass line
 */
export const mountainKing: MusicNote[] = [
  // Main theme - starts slow and mysterious
  // Melody line (first 16 bars)
  note(D4, 0, 0.5), note(E4, 0.5, 0.5), note(F4, 1, 0.5), note(G4, 1.5, 0.5),
  note(A4, 2, 0.5), note(F4, 2.5, 0.5), note(A4, 3, 1),
  note(Gs4, 4, 0.5), note(E4, 4.5, 0.5), note(Gs4, 5, 1),
  note(G4, 6, 0.5), note(Ds4, 6.5, 0.5), note(G4, 7, 1),
  
  note(D4, 8, 0.5), note(E4, 8.5, 0.5), note(F4, 9, 0.5), note(G4, 9.5, 0.5),
  note(A4, 10, 0.5), note(F4, 10.5, 0.5), note(A4, 11, 0.5), note(D5, 11.5, 0.5),
  note(C5, 12, 0.5), note(A4, 12.5, 0.5), note(F4, 13, 0.5), note(A4, 13.5, 0.5),
  note(C5, 14, 2),
  
  // Bass line (simple octaves)
  note(D3, 0, 2, 0.05), note(D3, 2, 2, 0.05),
  note(E3, 4, 2, 0.05), note(Ds3, 6, 2, 0.05),
  note(D3, 8, 2, 0.05), note(D3, 10, 2, 0.05),
  note(F3, 12, 2, 0.05), note(F3, 14, 2, 0.05),
  
  // Repeat with slight variation (bars 17-32)
  note(D4, 16, 0.5), note(E4, 16.5, 0.5), note(F4, 17, 0.5), note(G4, 17.5, 0.5),
  note(A4, 18, 0.5), note(F4, 18.5, 0.5), note(A4, 19, 1),
  note(Gs4, 20, 0.5), note(E4, 20.5, 0.5), note(Gs4, 21, 1),
  note(G4, 22, 0.5), note(Ds4, 22.5, 0.5), note(G4, 23, 1),
  
  note(D4, 24, 0.5), note(E4, 24.5, 0.5), note(F4, 25, 0.5), note(G4, 25.5, 0.5),
  note(A4, 26, 0.5), note(F4, 26.5, 0.5), note(A4, 27, 0.5), note(D5, 27.5, 0.5),
  note(C5, 28, 0.5), note(A4, 28.5, 0.5), note(F4, 29, 0.5), note(A4, 29.5, 0.5),
  note(D5, 30, 2),
  
  // Bass
  note(D3, 16, 2, 0.05), note(D3, 18, 2, 0.05),
  note(E3, 20, 2, 0.05), note(Ds3, 22, 2, 0.05),
  note(D3, 24, 2, 0.05), note(D3, 26, 2, 0.05),
  note(F3, 28, 2, 0.05), note(D3, 30, 2, 0.05),
];

/**
 * Flight of the Bumblebee - Rimsky-Korsakov (Public domain)
 * Simplified version focusing on the main chromatic runs
 */
export const bumblebee: MusicNote[] = [
  // Fast chromatic runs (simplified)
  // First phrase
  note(A4, 0, 0.25), note(Gs4, 0.25, 0.25), note(A4, 0.5, 0.25), note(B4, 0.75, 0.25),
  note(C5, 1, 0.25), note(B4, 1.25, 0.25), note(As4, 1.5, 0.25), note(A4, 1.75, 0.25),
  note(Gs4, 2, 0.25), note(A4, 2.25, 0.25), note(As4, 2.5, 0.25), note(B4, 2.75, 0.25),
  note(C5, 3, 0.25), note(Cs5, 3.25, 0.25), note(D5, 3.5, 0.25), note(Ds5, 3.75, 0.25),
  
  note(E5, 4, 0.25), note(Ds5, 4.25, 0.25), note(D5, 4.5, 0.25), note(Cs5, 4.75, 0.25),
  note(C5, 5, 0.25), note(B4, 5.25, 0.25), note(As4, 5.5, 0.25), note(A4, 5.75, 0.25),
  note(Gs4, 6, 0.25), note(G4, 6.25, 0.25), note(Fs4, 6.5, 0.25), note(F4, 6.75, 0.25),
  note(E4, 7, 0.5), note(A4, 7.5, 0.5),
  
  // Second phrase with bass
  note(C5, 8, 0.25), note(B4, 8.25, 0.25), note(C5, 8.5, 0.25), note(D5, 8.75, 0.25),
  note(E5, 9, 0.25), note(D5, 9.25, 0.25), note(C5, 9.5, 0.25), note(B4, 9.75, 0.25),
  note(A4, 10, 0.25), note(B4, 10.25, 0.25), note(C5, 10.5, 0.25), note(D5, 10.75, 0.25),
  note(E5, 11, 0.25), note(F5, 11.25, 0.25), note(Fs5, 11.5, 0.25), note(G5, 11.75, 0.25),
  
  // Simple bass line
  note(A3, 0, 4, 0.05), note(E3, 4, 4, 0.05),
  note(A3, 8, 4, 0.05), note(C3, 12, 4, 0.05),
  
  // Repeat pattern
  note(A5, 12, 0.25), note(G5, 12.25, 0.25), note(Fs5, 12.5, 0.25), note(F5, 12.75, 0.25),
  note(E5, 13, 0.25), note(Ds5, 13.25, 0.25), note(D5, 13.5, 0.25), note(Cs5, 13.75, 0.25),
  note(C5, 14, 0.25), note(B4, 14.25, 0.25), note(As4, 14.5, 0.25), note(A4, 14.75, 0.25),
  note(Gs4, 15, 0.25), note(G4, 15.25, 0.25), note(Fs4, 15.5, 0.25), note(F4, 15.75, 0.25),
  
  note(E4, 16, 0.5), note(A4, 16.5, 0.5),
  note(E4, 17, 0.5), note(C5, 17.5, 0.5),
  note(A4, 18, 1),
];

/**
 * Revolutionary Étude (Op. 10, No. 12) - Chopin (Public domain)
 * Simplified main melody with bass accompaniment
 */
export const revolutionary: MusicNote[] = [
  // Opening dramatic theme
  note(G4, 0, 0.5, 0.1), note(C5, 0.5, 0.5, 0.1), note(Ds5, 1, 0.5, 0.1), note(G5, 1.5, 0.5, 0.1),
  note(F5, 2, 0.5, 0.1), note(Ds5, 2.5, 0.5, 0.1), note(D5, 3, 0.5, 0.1), note(C5, 3.5, 0.5, 0.1),
  
  // Bass pattern (simplified)
  note(C3, 0, 0.5, 0.05), note(G3, 0.5, 0.5, 0.05), note(C3, 1, 0.5, 0.05), note(G3, 1.5, 0.5, 0.05),
  note(C3, 2, 0.5, 0.05), note(G3, 2.5, 0.5, 0.05), note(C3, 3, 0.5, 0.05), note(G3, 3.5, 0.5, 0.05),
  
  note(B4, 4, 0.5, 0.1), note(D5, 4.5, 0.5, 0.1), note(F5, 5, 0.5, 0.1), note(G5, 5.5, 0.5, 0.1),
  note(F5, 6, 0.5, 0.1), note(D5, 6.5, 0.5, 0.1), note(B4, 7, 0.5, 0.1), note(G4, 7.5, 0.5, 0.1),
  
  // Bass
  note(G2, 4, 0.5, 0.05), note(D3, 4.5, 0.5, 0.05), note(G2, 5, 0.5, 0.05), note(D3, 5.5, 0.5, 0.05),
  note(G2, 6, 0.5, 0.05), note(D3, 6.5, 0.5, 0.05), note(G2, 7, 0.5, 0.05), note(D3, 7.5, 0.5, 0.05),
  
  // Main theme development
  note(C5, 8, 1, 0.1), note(Ds5, 9, 0.5, 0.1), note(D5, 9.5, 0.5, 0.1),
  note(C5, 10, 0.5, 0.1), note(B4, 10.5, 0.5, 0.1), note(C5, 11, 1, 0.1),
  
  note(G4, 12, 0.5, 0.1), note(As4, 12.5, 0.5, 0.1), note(Ds5, 13, 0.5, 0.1), note(G5, 13.5, 0.5, 0.1),
  note(F5, 14, 1, 0.1), note(Ds5, 15, 0.5, 0.1), note(C5, 15.5, 0.5, 0.1),
  
  // Bass continuation
  note(C3, 8, 1, 0.05), note(G3, 9, 1, 0.05),
  note(C3, 10, 1, 0.05), note(G3, 11, 1, 0.05),
  note(Ds3, 12, 1, 0.05), note(As3, 13, 1, 0.05),
  note(F3, 14, 1, 0.05), note(C3, 15, 1, 0.05),
  
  // Extended section
  note(G5, 16, 0.5, 0.1), note(F5, 16.5, 0.5, 0.1), note(Ds5, 17, 0.5, 0.1), note(D5, 17.5, 0.5, 0.1),
  note(C5, 18, 0.5, 0.1), note(B4, 18.5, 0.5, 0.1), note(C5, 19, 0.5, 0.1), note(D5, 19.5, 0.5, 0.1),
  note(Ds5, 20, 1, 0.1), note(C5, 21, 1, 0.1),
  note(G4, 22, 2, 0.1),
  
  // Bass ending
  note(C3, 16, 2, 0.05), note(G3, 18, 2, 0.05),
  note(C3, 20, 2, 0.05), note(C2, 22, 2, 0.05),
];

/**
 * Summer from The Four Seasons - Vivaldi (Public domain)
 * Presto movement, simplified
 */
export const summerVivaldi: MusicNote[] = [
  // Opening theme - fast and energetic
  note(G4, 0, 0.25), note(G4, 0.25, 0.25), note(G4, 0.5, 0.25), note(G4, 0.75, 0.25),
  note(G4, 1, 0.5), note(F4, 1.5, 0.25), note(E4, 1.75, 0.25),
  note(D4, 2, 0.25), note(D4, 2.25, 0.25), note(D4, 2.5, 0.25), note(D4, 2.75, 0.25),
  note(D4, 3, 0.5), note(C4, 3.5, 0.25), note(B3, 3.75, 0.25),
  
  note(C4, 4, 0.25), note(D4, 4.25, 0.25), note(E4, 4.5, 0.25), note(F4, 4.75, 0.25),
  note(G4, 5, 0.25), note(A4, 5.25, 0.25), note(B4, 5.5, 0.25), note(C5, 5.75, 0.25),
  note(D5, 6, 0.5), note(B4, 6.5, 0.5),
  note(C5, 7, 1),
  
  // Bass line
  note(C3, 0, 1, 0.05), note(G3, 1, 1, 0.05),
  note(G2, 2, 1, 0.05), note(G3, 3, 1, 0.05),
  note(C3, 4, 1, 0.05), note(E3, 5, 1, 0.05),
  note(G3, 6, 1, 0.05), note(C3, 7, 1, 0.05),
  
  // Second section
  note(E5, 8, 0.25), note(D5, 8.25, 0.25), note(C5, 8.5, 0.25), note(B4, 8.75, 0.25),
  note(C5, 9, 0.25), note(B4, 9.25, 0.25), note(A4, 9.5, 0.25), note(G4, 9.75, 0.25),
  note(A4, 10, 0.25), note(B4, 10.25, 0.25), note(C5, 10.5, 0.25), note(D5, 10.75, 0.25),
  note(E5, 11, 0.5), note(C5, 11.5, 0.5),
  
  note(D5, 12, 0.25), note(C5, 12.25, 0.25), note(B4, 12.5, 0.25), note(A4, 12.75, 0.25),
  note(B4, 13, 0.25), note(A4, 13.25, 0.25), note(G4, 13.5, 0.25), note(F4, 13.75, 0.25),
  note(G4, 14, 0.5), note(E4, 14.5, 0.5),
  note(C4, 15, 1),
  
  // Bass
  note(C3, 8, 1, 0.05), note(E3, 9, 1, 0.05),
  note(F3, 10, 1, 0.05), note(C3, 11, 1, 0.05),
  note(G3, 12, 1, 0.05), note(D3, 13, 1, 0.05),
  note(E3, 14, 1, 0.05), note(C3, 15, 1, 0.05),
  
  // Repeat and variation
  note(G4, 16, 0.25), note(G4, 16.25, 0.25), note(G4, 16.5, 0.25), note(G4, 16.75, 0.25),
  note(G4, 17, 0.5), note(E5, 17.5, 0.5),
  note(D5, 18, 0.25), note(C5, 18.25, 0.25), note(B4, 18.5, 0.25), note(C5, 18.75, 0.25),
  note(D5, 19, 0.5), note(G4, 19.5, 0.5),
  
  note(C5, 20, 0.25), note(B4, 20.25, 0.25), note(A4, 20.5, 0.25), note(G4, 20.75, 0.25),
  note(F4, 21, 0.25), note(E4, 21.25, 0.25), note(D4, 21.5, 0.25), note(C4, 21.75, 0.25),
  note(G4, 22, 1), note(C5, 23, 1),
  
  // Final bass
  note(C3, 16, 2, 0.05), note(G3, 18, 2, 0.05),
  note(F3, 20, 2, 0.05), note(C3, 22, 2, 0.05),
];

/**
 * Korobeiniki (Tetris Theme A) - Traditional Russian folk song
 * Extended version with bass line
 */
export const korobeiniki: MusicNote[] = [
  // Main theme - First section
  note(E5, 0, 1), note(B4, 1, 0.5), note(C5, 1.5, 0.5),
  note(D5, 2, 1), note(C5, 3, 0.5), note(B4, 3.5, 0.5),
  note(A4, 4, 1), note(A4, 5, 0.5), note(C5, 5.5, 0.5),
  note(E5, 6, 1), note(D5, 7, 0.5), note(C5, 7.5, 0.5),
  
  note(B4, 8, 1.5), note(C5, 9.5, 0.5),
  note(D5, 10, 1), note(E5, 11, 1),
  note(C5, 12, 1), note(A4, 13, 1),
  note(A4, 14, 2),
  
  // Bass line for first section
  note(A3, 0, 2, 0.05), note(E3, 2, 2, 0.05),
  note(A3, 4, 2, 0.05), note(E3, 6, 2, 0.05),
  note(G3, 8, 2, 0.05), note(C3, 10, 2, 0.05),
  note(A3, 12, 2, 0.05), note(A3, 14, 2, 0.05),
  
  // Second section
  rest(16, 0.5), note(D5, 16.5, 1), note(F5, 17.5, 0.5),
  note(A5, 18, 1), note(G5, 19, 0.5), note(F5, 19.5, 0.5),
  note(E5, 20, 1.5), note(C5, 21.5, 0.5),
  note(E5, 22, 1), note(D5, 23, 0.5), note(C5, 23.5, 0.5),
  
  note(B4, 24, 1), note(B4, 25, 0.5), note(C5, 25.5, 0.5),
  note(D5, 26, 1), note(E5, 27, 1),
  note(C5, 28, 1), note(A4, 29, 1),
  note(A4, 30, 2),
  
  // Bass for second section
  note(D3, 16, 2, 0.05), note(F3, 18, 2, 0.05),
  note(C3, 20, 2, 0.05), note(E3, 22, 2, 0.05),
  note(G3, 24, 2, 0.05), note(C3, 26, 2, 0.05),
  note(A3, 28, 2, 0.05), note(A3, 30, 2, 0.05),
  
  // Repeat with variation
  note(E4, 32, 2), note(C4, 34, 2),
  note(D4, 36, 2), note(B3, 38, 2),
  note(C4, 40, 2), note(A3, 42, 2),
  note(Gs3, 44, 2), note(B3, 46, 2),
  
  // Final section  
  note(E4, 48, 2), note(C4, 50, 2),
  note(D4, 52, 2), note(B3, 54, 2),
  note(C4, 56, 1), note(E4, 57, 1),
  note(A4, 58, 1), note(A4, 59, 1),
  
  // Bass ending
  note(A2, 48, 4, 0.05), note(D2, 52, 4, 0.05),
  note(E2, 56, 2, 0.05), note(A2, 58, 2, 0.05),
];

/**
 * Simple menu music for game over and menu screens
 */
export const menuSongs: MusicNote[][] = [
  // Simple C major progression
  [
    note(C4, 0, 2), note(E4, 0, 2), note(G4, 0, 2),
    note(A3, 2, 2), note(C4, 2, 2), note(E4, 2, 2),
    note(F3, 4, 2), note(A3, 4, 2), note(C4, 4, 2),
    note(G3, 6, 2), note(B3, 6, 2), note(D4, 6, 2),
  ],
];

/**
 * Game over music - slow and melancholic
 */
export const gameOverSong: MusicNote[] = [
  note(C4, 0, 2, 0.075), note(B3, 2, 2, 0.075),
  note(A3, 4, 2, 0.075), note(G3, 6, 4, 0.075),
  note(C3, 0, 8, 0.05), // Bass drone
];