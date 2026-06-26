import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

interface EnterpriseProductsResponse {
  message: string;
  error: boolean;
  code: string;
  details: null;
  data: {
    enterpriseId: string;
    paidProducts: string[];
    freeProducts: string[];
    productPlanType: Record<string, string>;
  };
}

const ENTERPRISE_PRODUCTS_KEY = 'enterpriseProducts';
const CONVERSATIONAL_AI_PRODUCT = 'conversationalAi';

/**
 * Checks if conversational AI product is available in enterprise products
 */
export const hasConversationalAiProduct = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const storedProducts = localStorage.getItem(ENTERPRISE_PRODUCTS_KEY);
    if (!storedProducts) return false;

    const products = JSON.parse(storedProducts);
    return (
      Array.isArray(products) && products.includes(CONVERSATIONAL_AI_PRODUCT)
    );
  } catch (error) {
    console.error(
      'Error parsing enterprise products from localStorage:',
      error
    );
    return false;
  }
};

/**
 * Gets the current enterprise ID from localStorage if available
 */
export const getStoredEnterpriseId = (): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    const storedProducts = localStorage.getItem(ENTERPRISE_PRODUCTS_KEY);
    if (!storedProducts) return null;

    // We could store the enterpriseId along with products for validation
    // For now, we'll just check if the products exist
    return storedProducts ? 'exists' : null;
  } catch (error) {
    console.error('Error getting stored enterprise ID:', error);
    return null;
  }
};

/**
 * Fetches enterprise products and stores them in localStorage
 */
export const fetchAndStoreEnterpriseProducts = async (
  enterpriseId: string
): Promise<void> => {
  if (typeof window === 'undefined') return;

  try {
    console.log(
      `Fetching enterprise products for enterprise ID: ${enterpriseId}`
    );

    const response = (await CentralAPIHandler.handleGetRequest(
      `${process.env.APP_BACKEND_BASEURL}/credit/v2/get-enterprise-products?enterpriseId=${enterpriseId}`
    )) as EnterpriseProductsResponse;

    if (response?.data?.paidProducts) {
      localStorage.setItem(
        ENTERPRISE_PRODUCTS_KEY,
        JSON.stringify(response.data.paidProducts)
      );
    } else {
      console.warn('No paid products found in API response');
    }
  } catch (error) {
    console.error('Error fetching enterprise products:', error);
  }
};

/**
 * Main function to check and fetch enterprise products if needed
 */
export const ensureEnterpriseProducts = async (
  enterpriseId: string
): Promise<void> => {
  if (!enterpriseId) {
    return;
  }
  // Check if we already have the conversational AI product
  if (hasConversationalAiProduct()) {
    return; // Already have it, no need to fetch
  }
  // Fetch and store enterprise products
  await fetchAndStoreEnterpriseProducts(enterpriseId);
};

/**
 * Clears stored enterprise products (useful for testing or when switching enterprises)
 */
export const clearEnterpriseProducts = (): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(ENTERPRISE_PRODUCTS_KEY);
  } catch (error) {
    console.error('Error clearing enterprise products:', error);
  }
};
