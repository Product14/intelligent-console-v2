// Rooftop-wide Vini AI behavior config that isn't specific to one agent.
//
// Currently models a single feature:
//   - askForMobile: when the inbound call's caller-ID matches one of the
//     configured numbers, the agent asks the caller for their personal mobile
//     instead of trusting the caller-ID — for shared lines (fleet hotlines,
//     office switchboards, call-pool numbers). Persisted on the backend as
//     `entityConfig.ignoreAniNumbers: string[]` (flat E.164).

export interface TriggerPhoneNumber {
  /** Stable client-side id for list reconciliation. */
  id: string;
  /** Country dial code, e.g. "+1", "+44", "+91". */
  countryCode: string;
  /** Digits only, no formatting. */
  phone: string;
}

export interface AskForMobileConfig {
  /** The agent ignores the caller-ID and asks for a personal mobile whenever
   *  the inbound caller-ID matches one of these numbers. Empty list ⇒ feature
   *  is effectively off. */
  triggerNumbers: TriggerPhoneNumber[];
}

export interface ViniGeneralConfig {
  askForMobile: AskForMobileConfig;
}
