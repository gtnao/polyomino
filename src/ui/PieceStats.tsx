import React from 'react';
import type { ColorScheme, Polyomino, PieceType } from '../game/types';

interface PieceStatsProps {
  pieces: Polyomino[];
  pieceCounts: Record<PieceType, number>;
  currentPieceType?: PieceType | null;
  colorScheme: ColorScheme;
  showTitle?: boolean;
}

export const PieceStats: React.FC<PieceStatsProps> = ({
  pieces,
  pieceCounts,
  currentPieceType,
  colorScheme,
  showTitle = true,
}) => {
  const { colors } = colorScheme;
  
  const containerStyle: React.CSSProperties = {
    backgroundColor: colors.ui.panel,
    border: `2px solid ${colors.ui.border}`,
    borderRadius: '8px',
    padding: '15px',
  };
  
  const titleStyle: React.CSSProperties = {
    color: colors.text,
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
    textAlign: 'center',
  };
  
  const piecesGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
    gap: '10px',
    maxHeight: '200px',
    overflowY: 'auto',
  };
  
  const pieceContainerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
  };
  
  const pieceBoxStyle = (isActive: boolean): React.CSSProperties => ({
    position: 'relative',
    width: '50px',
    height: '50px',
    backgroundColor: isActive ? colors.ui.buttonHover : colors.board,
    border: `2px solid ${isActive ? colors.pieces[0] : colors.ui.border}`,
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  });
  
  const badgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    backgroundColor: colors.pieces[1],
    color: colors.background,
    borderRadius: '10px',
    padding: '2px 6px',
    fontSize: '12px',
    fontWeight: 'bold',
    minWidth: '20px',
    textAlign: 'center',
  };
  
  const renderPieceShape = (piece: Polyomino, colorIndex: number) => {
    if (!piece.shape) return null;
    
    // Find bounds of the shape
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    for (const [x, y] of piece.shape) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    
    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    const cellSize = Math.min(40 / Math.max(width, height), 10);
    
    return (
      <svg
        width={width * cellSize}
        height={height * cellSize}
        style={{ display: 'block' }}
      >
        {piece.shape.map(([x, y], idx) => (
          <rect
            key={idx}
            x={(x - minX) * cellSize}
            y={(y - minY) * cellSize}
            width={cellSize - 1}
            height={cellSize - 1}
            fill={piece.color || colors.pieces[colorIndex % colors.pieces.length]}
            stroke={colors.grid}
            strokeWidth={0.5}
          />
        ))}
      </svg>
    );
  };
  
  return (
    <div style={containerStyle} data-testid="piece-stats">
      {showTitle && <div style={titleStyle}>Pieces</div>}
      
      <div style={piecesGridStyle}>
        {pieces.map((piece, index) => {
          const count = pieceCounts[piece.id] || 0;
          const isActive = currentPieceType === piece.id;
          
          return (
            <div key={piece.id} style={pieceContainerStyle}>
              <div style={pieceBoxStyle(isActive)}>
                {renderPieceShape(piece, piece.colorIndex || index)}
                {count > 0 && (
                  <div style={badgeStyle}>
                    {count}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};