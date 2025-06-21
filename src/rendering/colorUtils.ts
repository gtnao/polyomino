/**
 * Color utility functions for rendering
 */

/**
 * Adjusts the brightness of a hex color
 * @param color - Hex color string
 * @param amount - Amount to adjust (-100 to 100)
 * @returns Adjusted hex color
 */
export function adjustBrightness(color: string, amount: number): string {
  // Remove # if present
  const hex = color.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Adjust brightness
  const newR = Math.max(0, Math.min(255, r + amount));
  const newG = Math.max(0, Math.min(255, g + amount));
  const newB = Math.max(0, Math.min(255, b + amount));
  
  // Convert back to hex
  const toHex = (n: number): string => n.toString(16).padStart(2, '0');
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

/**
 * Adjusts the saturation of a hex color
 * @param color - Hex color string
 * @param amount - Amount to adjust (-100 to 100)
 * @returns Adjusted hex color
 */
export function adjustSaturation(color: string, amount: number): string {
  // Remove # if present
  const hex = color.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  // Convert RGB to HSL
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  
  // Adjust saturation
  s = Math.max(0, Math.min(1, s + amount / 100));
  
  // Convert HSL back to RGB
  function hue2rgb(p: number, q: number, t: number): number {
    if (t < 0) {t += 1;}
    if (t > 1) {t -= 1;}
    if (t < 1/6) {return p + (q - p) * 6 * t;}
    if (t < 1/2) {return q;}
    if (t < 2/3) {return p + (q - p) * (2/3 - t) * 6;}
    return p;
  }
  
  let newR, newG, newB;
  
  if (s === 0) {
    newR = newG = newB = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    newR = hue2rgb(p, q, h + 1/3);
    newG = hue2rgb(p, q, h);
    newB = hue2rgb(p, q, h - 1/3);
  }
  
  // Convert back to hex
  const toHex = (n: number): string => Math.round(n * 255).toString(16).padStart(2, '0');
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

/**
 * Gets a color variation based on piece characteristics
 * @param baseColor - Base color
 * @param pieceId - Piece identifier
 * @param colorIndex - Color index
 * @returns Varied color
 */
export function getColorVariation(baseColor: string, pieceId: string, _colorIndex: number): string {
  // Use piece ID to generate consistent variations
  let hash = 0;
  for (let i = 0; i < pieceId.length; i++) {
    hash = ((hash << 5) - hash) + pieceId.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use hash to determine variation
  const variation = Math.abs(hash) % 5;
  
  switch (variation) {
    case 0:
      // Slightly brighter
      return adjustBrightness(baseColor, 15);
    case 1:
      // Slightly darker
      return adjustBrightness(baseColor, -15);
    case 2:
      // More saturated
      return adjustSaturation(baseColor, 20);
    case 3:
      // Less saturated
      return adjustSaturation(baseColor, -20);
    case 4:
      // Combination: slightly brighter and more saturated
      return adjustSaturation(adjustBrightness(baseColor, 10), 15);
    default:
      return baseColor;
  }
}