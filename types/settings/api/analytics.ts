export interface AnalyticsResponseDto {
  totalCalls: number;

  sentimentBreakdown: {
    happyPercentage: number; // (happy calls / calls with sentiment) * 100
  };

  rageQuitPercentage: number; // (rage quit == yes / total) * 100

  averageCallDurationInSeconds: number;

  departmentBreakdown: {
    salesPercentage: number; // % of calls handled by sales agents
    servicePercentage: number; // % of calls handled by service agents
    otherPercentage: number; // 100 - sales - service
  };

  responseQualityScore: number; // average of `ai response quality.score` field across calls

  hoursWorked: number; // total time in hours calculated from call durations

  moneySaved: number; // assumed precomputed or from external model

  customerDelighted: number; // number of calls with sentiment == happy AND responseQualityScore >= 8

  queryResolutionRate: number; // (query resolved == yes / total calls) * 100

  topComplaints: Array<string>;

  rangeWiseTotalCalls: Array<{
    label: string; // e.g., "00:00-02:00", "02:00-04:00"
    totalCallsPercentage: number;
  }>;
}
