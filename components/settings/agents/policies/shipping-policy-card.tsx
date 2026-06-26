'use client';

import { useMemo } from 'react';
import { PolicyCard } from './policy-card';
import {
  FeatureSwitch,
  FormRow,
  NumberInput,
  SegmentedControl,
  SubSection,
} from './policy-form-bits';
import { MultiSelectWithSearch } from '@/components/settings/ui/multi-select-with-search';
import { validateShipping } from '@/lib/settings/sales-policies-validation';
import { US_STATES } from '@/lib/settings/us-states';
import type {
  HomeDeliveryFee,
  OutOfStateHandledBy,
  ShippingCostArrangement,
  ShippingPolicy,
} from '@/types/settings/sales-policies';

const HOME_DELIVERY_FEE_OPTIONS: { value: HomeDeliveryFee; label: string }[] = [
  { value: 'free', label: 'Free' },
  { value: 'flat', label: 'Flat fee' },
  { value: 'distance_based', label: 'Distance-based' },
];

const OUT_OF_STATE_HANDLER_OPTIONS: { value: OutOfStateHandledBy; label: string }[] = [
  { value: 'dealer_arranges', label: 'Dealer arranges' },
  { value: 'customer_arranges', label: 'Customer arranges' },
];

const OUT_OF_STATE_FEE_OPTIONS: { value: ShippingCostArrangement; label: string }[] = [
  { value: 'included', label: 'Bundled' },
  { value: 'separate', label: 'Separate' },
  { value: 'customer_arranged', label: 'Customer-arranged' },
];

interface Props {
  value: ShippingPolicy;
  onChange(next: ShippingPolicy): void;
}

export function ShippingPolicyCard({ value, onChange }: Props) {
  const errors = useMemo(() => validateShipping(value), [value]);

  const update = (patch: Partial<ShippingPolicy>) => onChange({ ...value, ...patch });

  const featuresOn =
    value.homeDelivery.offered ||
    value.outOfStateShipping.offered ||
    value.airportPickup.offered ||
    value.outOfStateRegistration.available;

  return (
    <PolicyCard
      title="Shipping & Delivery"
      description="Delivery, out-of-state shipping, airport pickup, and registration support."
      status={featuresOn ? 'enabled' : 'all_off'}
    >
      <div className="space-y-4">
        <SubSection title="Home delivery" enabled={value.homeDelivery.offered}>
          <FormRow
            label="Offered"
            control={
              <FeatureSwitch
                enabled={value.homeDelivery.offered}
                onChange={(offered) =>
                  update({ homeDelivery: { ...value.homeDelivery, offered } })
                }
              />
            }
          />
          {value.homeDelivery.offered && (
            <>
              <FormRow
                label="Maximum radius"
                required
                error={errors?.['homeDelivery.maxRadiusMiles']}
                control={
                  <NumberInput
                    value={value.homeDelivery.maxRadiusMiles ?? undefined}
                    onChange={(maxRadiusMiles) =>
                      update({ homeDelivery: { ...value.homeDelivery, maxRadiusMiles } })
                    }
                    min={1}
                    max={500}
                    suffix="miles"
                  />
                }
              />
              <FormRow
                label="Delivery fee"
                info="The agent confirms whether a fee applies. It never quotes the dollar amount — exact numbers route to a salesperson."
                required
                error={errors?.['homeDelivery.deliveryFee']}
                control={
                  <SegmentedControl
                    value={value.homeDelivery.deliveryFee ?? 'flat'}
                    options={HOME_DELIVERY_FEE_OPTIONS}
                    onChange={(deliveryFee) =>
                      update({ homeDelivery: { ...value.homeDelivery, deliveryFee } })
                    }
                  />
                }
              />
            </>
          )}
        </SubSection>

        <SubSection title="Out-of-state shipping" enabled={value.outOfStateShipping.offered}>
          <FormRow
            label="Offered"
            control={
              <FeatureSwitch
                enabled={value.outOfStateShipping.offered}
                onChange={(offered) =>
                  update({ outOfStateShipping: { ...value.outOfStateShipping, offered } })
                }
              />
            }
          />
          {value.outOfStateShipping.offered && (
            <>
              <FormRow
                label="Handled by"
                required
                error={errors?.['outOfStateShipping.handledBy']}
                control={
                  <SegmentedControl
                    value={value.outOfStateShipping.handledBy ?? 'dealer_arranges'}
                    options={OUT_OF_STATE_HANDLER_OPTIONS}
                    onChange={(handledBy) =>
                      update({ outOfStateShipping: { ...value.outOfStateShipping, handledBy } })
                    }
                  />
                }
              />
              <FormRow
                label="Shipping cost arrangement"
                info="Who pays and how. The agent confirms the arrangement; specific dollar amounts route to a salesperson."
                required
                error={errors?.['outOfStateShipping.shippingCostArrangement']}
                control={
                  <SegmentedControl
                    value={value.outOfStateShipping.shippingCostArrangement ?? 'separate'}
                    options={OUT_OF_STATE_FEE_OPTIONS}
                    onChange={(shippingCostArrangement) =>
                      update({
                        outOfStateShipping: {
                          ...value.outOfStateShipping,
                          shippingCostArrangement,
                        },
                      })
                    }
                  />
                }
              />
            </>
          )}
        </SubSection>

        <SubSection title="Airport pickup">
          <FormRow
            label="Offered"
            subtitle="Pick up fly-in buyers at the nearest airport."
            control={
              <FeatureSwitch
                enabled={value.airportPickup.offered}
                onChange={(offered) =>
                  update({ airportPickup: { ...value.airportPickup, offered } })
                }
              />
            }
          />
        </SubSection>

        <SubSection title="Out-of-state registration" enabled={value.outOfStateRegistration.available}>
          <FormRow
            label="Available"
            info="When on, the agent can confirm to out-of-state buyers that the dealer handles title, tags, and registration in the selected states."
            control={
              <FeatureSwitch
                enabled={value.outOfStateRegistration.available}
                onChange={(available) =>
                  update({
                    outOfStateRegistration: { ...value.outOfStateRegistration, available },
                  })
                }
              />
            }
          />
          {value.outOfStateRegistration.available && (
            <FormRow
              label="States supported"
              required
              fullWidthControl
              info="Use the Select-all / Clear buttons above the picker for bulk changes."
              error={errors?.['outOfStateRegistration.statesSupported']}
              control={
                <MultiSelectWithSearch
                  columns={8}
                  values={value.outOfStateRegistration.statesSupported}
                  options={US_STATES.map((s) => ({
                    value: s.value,
                    label: s.label,
                    searchText: s.name,
                  }))}
                  onChange={(statesSupported) =>
                    update({
                      outOfStateRegistration: {
                        ...value.outOfStateRegistration,
                        statesSupported,
                      },
                    })
                  }
                  ariaLabel="States supported for out-of-state registration"
                  searchPlaceholder="Search by state name or code"
                  countNoun="state"
                />
              }
            />
          )}
        </SubSection>
      </div>
    </PolicyCard>
  );
}
