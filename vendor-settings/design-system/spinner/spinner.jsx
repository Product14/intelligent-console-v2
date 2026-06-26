import React from 'react';

import { cn } from '@spyne-console/utils/cn';

import styles from './spinner.module.css';

export default function Spinner({ type = 'dark', size = 'medium' }) {
  return (
    <div
      className={cn(
        styles.loader,
        styles[`${type}-loader`],
        styles[`loader-${size}`]
      )}
    ></div>
  );
}
