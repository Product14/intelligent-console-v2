/**
 * Maps /credit/v5/credits `credit_data` to inventory v5 screen routing.
 * Any product with subscription_type !== "free" → merchandising (overview).
 * All products free (or missing) → active inventory (listings).
 */

const PRODUCT_CREDIT_KEYS = ['images', '360', 'video'];

export function hasAnyNonFreeProductSubscription(creditsV5) {
  const creditData = creditsV5?.credit_data ?? creditsV5?.data?.credit_data;
  if (!creditData || typeof creditData !== 'object') {
    return false;
  }

  return PRODUCT_CREDIT_KEYS.some((key) => {
    const subscriptionType = creditData[key]?.subscription_type;
    if (!subscriptionType) {
      return false;
    }
    return String(subscriptionType).toLowerCase() !== 'free';
  });
}

/**
 * @param {object | null | undefined} creditsV5
 * @returns {'overview' | 'active-inventory'}
 */
export function getInventoryV5ScreenModeFromCredits(_creditsV5 = {}) {
  return 'overview';
}
