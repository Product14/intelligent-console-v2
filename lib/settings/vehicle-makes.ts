// Common US-market vehicle makes. Used by the Service > Allowed Makes
// multi-select. Add new entries as needed; the type definition lives in
// `types/service-policies.ts` (`VehicleMake`).

import type { VehicleMake } from '@/types/settings/service-policies';

export interface VehicleMakeOption {
  value: VehicleMake;
  label: string;
}

export const VEHICLE_MAKES: VehicleMakeOption[] = [
  { value: 'acura', label: 'Acura' },
  { value: 'audi', label: 'Audi' },
  { value: 'bmw', label: 'BMW' },
  { value: 'buick', label: 'Buick' },
  { value: 'cadillac', label: 'Cadillac' },
  { value: 'chevrolet', label: 'Chevrolet' },
  { value: 'chrysler', label: 'Chrysler' },
  { value: 'dodge', label: 'Dodge' },
  { value: 'fiat', label: 'FIAT' },
  { value: 'ford', label: 'Ford' },
  { value: 'genesis', label: 'Genesis' },
  { value: 'gmc', label: 'GMC' },
  { value: 'honda', label: 'Honda' },
  { value: 'hyundai', label: 'Hyundai' },
  { value: 'infiniti', label: 'Infiniti' },
  { value: 'jaguar', label: 'Jaguar' },
  { value: 'jeep', label: 'Jeep' },
  { value: 'kia', label: 'Kia' },
  { value: 'land_rover', label: 'Land Rover' },
  { value: 'lexus', label: 'Lexus' },
  { value: 'lincoln', label: 'Lincoln' },
  { value: 'mazda', label: 'Mazda' },
  { value: 'mercedes_benz', label: 'Mercedes-Benz' },
  { value: 'mini', label: 'MINI' },
  { value: 'mitsubishi', label: 'Mitsubishi' },
  { value: 'nissan', label: 'Nissan' },
  { value: 'porsche', label: 'Porsche' },
  { value: 'ram', label: 'RAM' },
  { value: 'subaru', label: 'Subaru' },
  { value: 'tesla', label: 'Tesla' },
  { value: 'toyota', label: 'Toyota' },
  { value: 'volkswagen', label: 'Volkswagen' },
  { value: 'volvo', label: 'Volvo' },
];
