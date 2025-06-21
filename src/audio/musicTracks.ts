import type { MusicNote } from './musicPlayer';
import { korobeiniki, mountainKing, bumblebee, revolutionary, summerVivaldi } from './songs';

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
    tempo: 144,
  },
  {
    id: 'mountain-king',
    name: 'In the Hall of the Mountain King',
    notes: mountainKing,
    tempo: 120,
  },
  {
    id: 'bumblebee',
    name: 'Flight of the Bumblebee',
    notes: bumblebee,
    tempo: 180,
  },
  {
    id: 'revolutionary',
    name: 'Revolutionary Étude',
    notes: revolutionary,
    tempo: 160,
  },
  {
    id: 'summer',
    name: 'Summer (The Four Seasons)',
    notes: summerVivaldi,
    tempo: 140,
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