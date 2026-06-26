import { ComponentProps, useEffect, useState } from 'react';
import React from 'react';

interface SvgRendererProps extends ComponentProps<'svg'> {
  fileName: string;
}

export const SvgRenderer = ({ fileName, ...props }: SvgRendererProps) => {
  const [SvgComponent, setSvgComponent] = useState<React.ComponentType<
    ComponentProps<'svg'>
  > | null>(null);

  useEffect(() => {
    const importSvg = async () => {
      try {
        const ImportedSvg = (await import(`@/assets/${fileName}.svg`)).default;
        setSvgComponent(() => ImportedSvg);
      } catch (error) {
        setSvgComponent(null);
      }
    };

    importSvg();
  }, [fileName]);

  if (!SvgComponent) {
    return null;
  }

  return <SvgComponent {...props} />;
};
