import * as React from 'react';

export interface SpinnerProps {
  type?: 'dark' | 'light';
  size?: 'small' | 'medium' | 'large';
}

declare const Spinner: React.FC<SpinnerProps>;

export default Spinner;
