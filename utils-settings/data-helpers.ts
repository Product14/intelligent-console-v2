import { Sales, Service } from '@/app/models/CallSummaryReport';

// Helper function to check if sales data has any non-empty values
export const hasSalesData = (salesData?: Sales) => {
  if (!salesData) return false;

  // Check vehicleRequested array
  if (salesData.vehicleRequested && salesData.vehicleRequested.length > 0) {
    // Check if any vehicle has meaningful data
    const hasValidVehicle = salesData.vehicleRequested.some(
      (vehicle) =>
        vehicle.vehicleName &&
        vehicle.vehicleName.trim() !== '' &&
        vehicle.vehicleName.toLowerCase() !== 'n/a'
    );
    if (hasValidVehicle) return true;
  }

  // Check other string fields - exclude "N/A" and empty strings
  const stringFields = [
    salesData.leadQualificationScore,
    salesData.vehicleType,
    salesData.budgetRange,
    salesData.budgetSensitivity,
    salesData.competitionName,
    salesData.financingRequest,
    salesData.potentialUpsell,
  ];

  if (
    stringFields.some(
      (field) => field && field.trim() !== '' && field.toLowerCase() !== 'n/a'
    )
  ) {
    return true;
  }

  // Check tradeInMention object
  if (
    salesData.tradeInMention?.value &&
    salesData.tradeInMention.value.trim() !== '' &&
    salesData.tradeInMention.value.toLowerCase() !== 'n/a'
  ) {
    return true;
  }

  return false;
};

// Helper function to check if service data has any non-empty values
export const hasServiceData = (serviceData?: Service) => {
  if (!serviceData) return false;

  // Check serviceRequested object
  if (
    serviceData.serviceRequested?.value &&
    serviceData.serviceRequested.value.trim() !== '' &&
    serviceData.serviceRequested.value.toLowerCase() !== 'n/a'
  ) {
    return true;
  }

  // Check other string fields - exclude "N/A" and empty strings
  const stringFields = [
    serviceData.serviceIntent,
    serviceData.urgency,
    serviceData.partsAvailable,
    serviceData.pickupAndDropService,
    serviceData.customerEscalations,
  ];

  if (
    stringFields.some(
      (field) => field && field.trim() !== '' && field.toLowerCase() !== 'n/a'
    )
  ) {
    return true;
  }

  return false;
};

// Helper function to convert lead score to numeric value
export const convertLeadScoreToNumeric = (score = '') => {
  switch (score.toLowerCase()) {
    case 'high':
      return '9';
    case 'average':
    case 'medium':
      return '7';
    case 'low':
      return '3';
    default:
      return '0';
  }
};

// Helper function to convert budget sensitivity to numeric value
export const convertBudgetSensitivityToNumeric = (sensitivity = '') => {
  switch (sensitivity.toLowerCase()) {
    case 'high':
      return '3';
    case 'medium':
    case 'moderate':
      return '7';
    case 'low':
      return '9';
    default:
      return '0';
  }
};

// Helper function to get lead score color
export const getLeadScoreColor = (score = '') => {
  switch (score.toLowerCase()) {
    case 'high':
      return 'text-green-700';
    case 'average':
    case 'medium':
      return 'text-yellow-700';
    case 'low':
      return 'text-red-700';
    default:
      return 'text-gray-700';
  }
};

// Helper function to get sentiment emoji
export const getSentimentEmoji = (sentiment: string) => {
  switch (sentiment.toLowerCase()) {
    case 'happy':
      return '😊';
    case 'sad':
      return '😡';
    case 'neutral':
      return '😐';
    default:
      return '😐';
  }
};

// Helper function to get AI response quality text
export const getAIResponseQualityText = (score: string) => {
  const numScore = parseFloat(score);
  if (numScore >= 0 && numScore < 5) {
    return 'Poor';
  } else if (numScore >= 5 && numScore < 8.5) {
    return 'Needs Improvement';
  } else if (numScore >= 8.5 && numScore <= 10) {
    return 'Good';
  }
  return 'Needs Improvement';
};

// Helper function to get AI response quality color
export const getAIResponseQualityColor = (score: string) => {
  const numScore = parseFloat(score);
  if (numScore >= 0 && numScore < 5) {
    return 'text-red-700';
  } else if (numScore >= 5 && numScore < 8.5) {
    return 'text-yellow-700';
  } else if (numScore >= 8.5 && numScore <= 10) {
    return 'text-green-700';
  }
  return 'text-yellow-700';
};

// Helper function to format metric name
export const formatMetricName = (key: string) => {
  const name = key.replace(/([A-Z])/g, ' $1');
  return name.charAt(0).toUpperCase() + name.slice(1);
};

// Helper function to get network signal icon colors based on score
export const getNetworkSignalColors = (score: string) => {
  const numScore = parseFloat(score);

  // Determine bar colors based on score
  if (numScore >= 0 && numScore < 5) {
    return ['bg-red-500', 'bg-gray-300', 'bg-gray-300'];
  } else if (numScore >= 5 && numScore < 8.5) {
    return ['bg-yellow-500', 'bg-yellow-500', 'bg-gray-300'];
  } else if (numScore >= 8.5 && numScore <= 10) {
    return ['bg-green-500', 'bg-green-500', 'bg-green-500'];
  } else {
    // default fallback
    return ['bg-yellow-500', 'bg-yellow-500', 'bg-gray-300'];
  }
};

// Helper function to get gradient background based on AI response quality score
export const getGradientByScore = (score: number) => {
  if (score >= 8) {
    return {
      background: 'linear-gradient(to bottom, #A1FFB499 0%, #E3FFEA4D 45%)',
    }; // Green for high scores
  } else if (score >= 5) {
    return {
      background: 'linear-gradient(to bottom, #FFECA199 0%, #FFFCE34D 45%)',
    }; // Yellow for medium scores
  } else {
    return {
      background: 'linear-gradient(to bottom, #FFA1A199 0%, #FFE3E34D 45%)',
    }; // Red for low scores
  }
};
