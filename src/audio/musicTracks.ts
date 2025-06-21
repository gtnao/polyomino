import type { MusicNote } from './musicPlayer';
import { korobeiniki, odeToJoy, twinkleTwinkle, canonInD, mountainKing } from './songs';

export interface MusicTrackInfo {
  id: string;
  name: string;
  notes: MusicNote[];
  tempo: number;
}

export const musicTracks: MusicTrackInfo[] = [
  {
    id: 'random',
    name: 'Random',
    notes: [],
    tempo: 120,
  },
  {
    id: 'korobeiniki',
    name: 'Korobeiniki (Tetris Theme)',
    notes: korobeiniki,
    tempo: 140,
  },
  {
    id: 'ode-to-joy',
    name: 'Ode to Joy',
    notes: odeToJoy,
    tempo: 120,
  },
  {
    id: 'twinkle-twinkle',
    name: 'Twinkle Twinkle Little Star',
    notes: twinkleTwinkle,
    tempo: 120,
  },
  {
    id: 'canon-in-d',
    name: 'Canon in D',
    notes: canonInD,
    tempo: 80,
  },
  {
    id: 'mountain-king',
    name: 'Hall of the Mountain King',
    notes: mountainKing,
    tempo: 150,
  },
];

export function getTrackById(id: string): MusicTrackInfo | undefined {
  return musicTracks.find(track => track.id === id);
}

export function getRandomTrack(): MusicTrackInfo {
  // Exclude the 'random' option from selection
  const selectableTracks = musicTracks.filter(track => track.id !== 'random');
  return selectableTracks[Math.floor(Math.random() * selectableTracks.length)]!;
}