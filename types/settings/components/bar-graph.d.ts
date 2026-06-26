interface CustomStyles {
  defaultBarBg?: string;
  onHoverBarBg?: string;
  defaultBarTextColor?: string;
}

interface BarGraphProps {
  data: Array<Record<string, any>>;
  xDataKey: string;
  yDataKey: string;
  customStyles?: CustomStyles;
  insideLabel?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  isLoading?: boolean;
  aspect?: number;
  margin?: {
    top: number;
    right: number;
    left: number;
    bottom: number;
  };
  width?: string;
  height?: string;
}

declare const BarGraph: React.FC<BarGraphProps>;

export default BarGraph;
