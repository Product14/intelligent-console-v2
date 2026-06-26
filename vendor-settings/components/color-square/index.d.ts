import React from 'react';

export interface ColorSquareProps {
  onAddColor: (hex: string) => void;
  hexCode: string;
  setColorInput: (hex: string) => void;
}

declare const ColorSquare: React.FC<ColorSquareProps>;

export { ColorSquare };
export default ColorSquare;
