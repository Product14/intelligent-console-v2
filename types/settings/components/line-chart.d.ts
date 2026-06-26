declare module '@spyne-console/design-system/charts/line-chart' {
  interface LineConfig {
    dataKey: string;
    name: string;
    color?: string;
  }

  interface LineChartProps {
    data: Array<Record<string, any>>;
    xDataKey: string;
    lines: LineConfig[];
    customStyles?: {
      defaultLineColor?: string;
      onHoverLineColor?: string;
      lineStrokeWidth?: number;
      dotRadius?: number;
      dotStrokeWidth?: number;
      type?: 'linear' | 'monotone';
    };
    xAxisLabel?: string;
    yAxisLabel?: string;
    isLoading?: boolean;
    showLegend?: boolean;
    nonNumericAxis?: boolean;
    aspectRatio?: number;
  }

  export default function LineChart(props: LineChartProps): React.ReactElement;
}
