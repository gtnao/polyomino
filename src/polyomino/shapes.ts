import type { PieceDefinition, PieceType } from '@/game/types';
import { generatePolyominoes, getBoundingBox, getAllRotations } from './generator';

// Cache for generated piece definitions
const pieceDefinitionsCache = new Map<number, PieceDefinition[]>();

// Color palettes for different polyomino sizes
const colorPalettes: Record<number, string[]> = {
  1: ['#ff6b6b'],
  2: ['#4ecdc4'],
  3: ['#45b7d1', '#f9ca24'],
  4: ['#00d9ff', '#ffd93d', '#ff6bcb', '#ff9142'], // Tetris-inspired colors
  5: [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b',
    '#eb4d4b', '#6ab04c', '#c7ecee', '#dfe6e9', '#4834d4',
    '#686de0', '#ff9ff3'
  ],
  6: [
    '#ff6b6b', '#ee5a6f', '#f368e0', '#ff9ff3', '#48dbfb',
    '#0abde3', '#00d2d3', '#1dd1a1', '#54a0ff', '#5f27cd',
    '#a29bfe', '#fd79a8', '#feca57', '#ff9142', '#ff6348',
    '#ff4757', '#2ed573', '#1e90ff', '#fa8231', '#f53b57',
    '#3c40c6', '#05c46b', '#ffa502', '#ff3838', '#ff5252',
    '#40407a', '#706fd3', '#f7f1e3', '#34ace0', '#33d9b2',
    '#ffb142', '#ff5252', '#ff793f', '#d1ccc0', '#ffb142'
  ],
  7: [], // Will use default colors
  8: [], // Will use default colors
  9: []  // Will use default colors
};

// Default color generation for larger polyominoes
function generateDefaultColors(count: number): string[] {
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const hue = (i * 360) / count;
    const saturation = 60 + (i % 3) * 15; // Vary saturation
    const lightness = 45 + (i % 5) * 10; // Vary lightness
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }
  return colors;
}

/**
 * Gets all piece definitions for a given polyomino size
 * @param size - The size of polyominoes to generate
 * @returns Array of piece definitions with IDs, shapes, rotations, and colors
 */
export function getPieceDefinitions(size: number): PieceDefinition[] {
  // Check cache first
  if (pieceDefinitionsCache.has(size)) {
    return pieceDefinitionsCache.get(size)!;
  }
  
  // Generate polyominoes
  const polyominoes = generatePolyominoes(size);
  
  // Get colors for this size
  let colors = colorPalettes[size] || [];
  if (colors.length < polyominoes.length) {
    colors = generateDefaultColors(polyominoes.length);
  }
  
  // Create piece definitions
  const definitions: PieceDefinition[] = polyominoes.map((shape, index) => {
    const id = generatePieceId(size, index);
    const rotations = getAllRotations(shape);
    const boundingBox = getBoundingBox(shape);
    const color = colors[index % colors.length]!;
    
    return {
      id,
      shape,
      rotations,
      color,
      boundingBox
    };
  });
  
  // Cache the results
  pieceDefinitionsCache.set(size, definitions);
  
  return definitions;
}

/**
 * Generates a unique ID for a piece
 * @param size - The size of the polyomino
 * @param index - The index within that size category
 * @returns A unique piece ID
 */
function generatePieceId(size: number, index: number): PieceType {
  // For common sizes, use meaningful names
  if (size === 4) {
    const tetrisNames = ['I', 'O', 'T', 'S', 'L'];
    return tetrisNames[index] || `T${index}`;
  }
  
  if (size === 5) {
    const pentominoNames = ['F', 'I', 'L', 'N', 'P', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    return pentominoNames[index] || `P${index}`;
  }
  
  // For other sizes, use generic naming
  return `${size}M${index}`;
}

/**
 * Gets a specific piece definition by ID
 * @param id - The piece ID
 * @param size - The size of the polyomino (optional, will search all sizes if not provided)
 * @returns The piece definition or null if not found
 */
export function getPieceDefinitionById(id: PieceType, size?: number): PieceDefinition | null {
  if (size !== undefined) {
    const definitions = getPieceDefinitions(size);
    return definitions.find(def => def.id === id) || null;
  }
  
  // Search through all cached sizes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const [_cachedSize, definitions] of pieceDefinitionsCache.entries()) {
    const found = definitions.find(def => def.id === id);
    if (found) {return found;}
  }
  
  // Try common sizes if not in cache
  for (let trySize = 1; trySize <= 9; trySize++) {
    const definitions = getPieceDefinitions(trySize);
    const found = definitions.find(def => def.id === id);
    if (found) {return found;}
  }
  
  return null;
}

/**
 * Clears the piece definitions cache
 */
export function clearPieceDefinitionsCache(): void {
  pieceDefinitionsCache.clear();
}

/**
 * Gets all piece types for a given size
 * @param size - The size of polyominoes
 * @returns Array of piece type IDs
 */
export function getPieceTypes(size: number): PieceType[] {
  const definitions = getPieceDefinitions(size);
  return definitions.map(def => def.id);
}