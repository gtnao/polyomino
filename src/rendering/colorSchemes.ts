import type { ColorScheme, ColorSchemeName } from '../game/types';

/**
 * Gruvbox color scheme
 * Based on the popular Gruvbox theme
 */
const gruvbox: ColorScheme = {
  name: 'gruvbox',
  colors: {
    background: '#282828',
    board: '#3c3836',
    grid: '#504945',
    text: '#ebdbb2',
    textSecondary: '#a89984',
    ghost: 'rgba(168, 153, 132, 0.3)',
    pieces: [
      '#fb4934', // red
      '#b8bb26', // green
      '#fabd2f', // yellow
      '#83a598', // blue
      '#d3869b', // purple
      '#8ec07c', // aqua
      '#fe8019', // orange
      '#ebdbb2', // light
      '#928374', // gray
    ],
    ui: {
      panel: '#3c3836',
      button: '#504945',
      buttonHover: '#665c54',
      border: '#7c6f64',
    },
    effects: {
      lineClear: ['#fabd2f', '#fe8019', '#fb4934'],
      levelUp: ['#b8bb26', '#8ec07c', '#83a598'],
      gameOver: '#fb4934',
    },
  },
};

/**
 * Monokai color scheme
 * Based on the classic Monokai theme
 */
const monokai: ColorScheme = {
  name: 'monokai',
  colors: {
    background: '#272822',
    board: '#3e3d32',
    grid: '#524f3d',
    text: '#f8f8f2',
    textSecondary: '#75715e',
    ghost: 'rgba(117, 113, 94, 0.3)',
    pieces: [
      '#f92672', // pink
      '#a6e22e', // green
      '#f4bf75', // yellow
      '#66d9ef', // cyan
      '#ae81ff', // purple
      '#fd971f', // orange
      '#e69f66', // light orange
      '#f8f8f2', // white
      '#75715e', // gray
    ],
    ui: {
      panel: '#3e3d32',
      button: '#524f3d',
      buttonHover: '#6e6a55',
      border: '#75715e',
    },
    effects: {
      lineClear: ['#f4bf75', '#fd971f', '#f92672'],
      levelUp: ['#a6e22e', '#66d9ef', '#ae81ff'],
      gameOver: '#f92672',
    },
  },
};

/**
 * Dracula color scheme
 * Based on the Dracula theme
 */
const dracula: ColorScheme = {
  name: 'dracula',
  colors: {
    background: '#282a36',
    board: '#44475a',
    grid: '#6272a4',
    text: '#f8f8f2',
    textSecondary: '#6272a4',
    ghost: 'rgba(98, 114, 164, 0.3)',
    pieces: [
      '#ff5555', // red
      '#50fa7b', // green
      '#f1fa8c', // yellow
      '#8be9fd', // cyan
      '#bd93f9', // purple
      '#ff79c6', // pink
      '#ffb86c', // orange
      '#f8f8f2', // white
      '#6272a4', // comment
    ],
    ui: {
      panel: '#44475a',
      button: '#6272a4',
      buttonHover: '#bd93f9',
      border: '#6272a4',
    },
    effects: {
      lineClear: ['#f1fa8c', '#ffb86c', '#ff79c6'],
      levelUp: ['#50fa7b', '#8be9fd', '#bd93f9'],
      gameOver: '#ff5555',
    },
  },
};

/**
 * Nord color scheme
 * Based on the Nord theme
 */
const nord: ColorScheme = {
  name: 'nord',
  colors: {
    background: '#2e3440',
    board: '#3b4252',
    grid: '#434c5e',
    text: '#eceff4',
    textSecondary: '#d8dee9',
    ghost: 'rgba(216, 222, 233, 0.3)',
    pieces: [
      '#bf616a', // red
      '#a3be8c', // green
      '#ebcb8b', // yellow
      '#88c0d0', // cyan
      '#b48ead', // purple
      '#d08770', // orange
      '#8fbcbb', // teal
      '#eceff4', // white
      '#4c566a', // gray
    ],
    ui: {
      panel: '#3b4252',
      button: '#434c5e',
      buttonHover: '#4c566a',
      border: '#4c566a',
    },
    effects: {
      lineClear: ['#ebcb8b', '#d08770', '#bf616a'],
      levelUp: ['#a3be8c', '#88c0d0', '#8fbcbb'],
      gameOver: '#bf616a',
    },
  },
};

/**
 * Solarized Dark color scheme
 * Based on the Solarized theme
 */
const solarized: ColorScheme = {
  name: 'solarized',
  colors: {
    background: '#002b36',
    board: '#073642',
    grid: '#586e75',
    text: '#fdf6e3',
    textSecondary: '#93a1a1',
    ghost: 'rgba(147, 161, 161, 0.3)',
    pieces: [
      '#dc322f', // red
      '#859900', // green
      '#b58900', // yellow
      '#268bd2', // blue
      '#6c71c4', // violet
      '#2aa198', // cyan
      '#cb4b16', // orange
      '#fdf6e3', // light
      '#657b83', // gray
    ],
    ui: {
      panel: '#073642',
      button: '#586e75',
      buttonHover: '#657b83',
      border: '#586e75',
    },
    effects: {
      lineClear: ['#b58900', '#cb4b16', '#dc322f'],
      levelUp: ['#859900', '#2aa198', '#268bd2'],
      gameOver: '#dc322f',
    },
  },
};

/**
 * Tokyo Night color scheme
 * Based on the Tokyo Night theme
 */
const tokyoNight: ColorScheme = {
  name: 'tokyo-night',
  colors: {
    background: '#1a1b26',
    board: '#24283b',
    grid: '#414868',
    text: '#c0caf5',
    textSecondary: '#9aa5ce',
    ghost: 'rgba(154, 165, 206, 0.3)',
    pieces: [
      '#f7768e', // red
      '#9ece6a', // green
      '#e0af68', // yellow
      '#7aa2f7', // blue
      '#bb9af7', // purple
      '#7dcfff', // cyan
      '#ff9e64', // orange
      '#c0caf5', // light
      '#565f89', // gray
    ],
    ui: {
      panel: '#24283b',
      button: '#414868',
      buttonHover: '#565f89',
      border: '#565f89',
    },
    effects: {
      lineClear: ['#e0af68', '#ff9e64', '#f7768e'],
      levelUp: ['#9ece6a', '#7dcfff', '#7aa2f7'],
      gameOver: '#f7768e',
    },
  },
};

/**
 * Map of all available color schemes
 */
const colorSchemes: Record<ColorSchemeName, ColorScheme> = {
  gruvbox,
  monokai,
  dracula,
  nord,
  solarized,
  'tokyo-night': tokyoNight,
};

/**
 * Gets a color scheme by name
 * @param name - The name of the color scheme
 * @returns The color scheme or gruvbox as default
 */
export function getColorScheme(name: ColorSchemeName): ColorScheme {
  return colorSchemes[name] || gruvbox;
}

/**
 * Gets all available color scheme names
 * @returns Array of color scheme names
 */
export function getColorSchemeNames(): ColorSchemeName[] {
  return Object.keys(colorSchemes) as ColorSchemeName[];
}

/**
 * Gets a piece color from the scheme
 * @param scheme - The color scheme
 * @param index - The piece index
 * @returns The color for the piece
 */
export function getPieceColor(scheme: ColorScheme, index: number): string {
  const colors = scheme.colors.pieces;
  return colors[index % colors.length] || colors[0]!;
}

/**
 * Export individual schemes for direct access
 */
export { gruvbox, monokai, dracula, nord, solarized, tokyoNight };

/**
 * Export default schemes map
 */
export default colorSchemes;