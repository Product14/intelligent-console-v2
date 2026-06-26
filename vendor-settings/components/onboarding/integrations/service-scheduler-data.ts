export const SERVICE_SCHEDULER_PLATFORM = {
  NOT_LISTED: 'not-listed',
  XTIME: 'xtime',
  TEKION: 'tekion',
  PBS: 'pbs',
  CDK: 'cdk',
  DEALERFX: 'dealerfx',
  EVENFLOW: 'evenflow',
  MYKAARMA: 'mykaarma',
  OTHER: 'other',
} as const;

export type ServiceSchedulerPlatformType =
  (typeof SERVICE_SCHEDULER_PLATFORM)[keyof typeof SERVICE_SCHEDULER_PLATFORM];

export type OemMakeOption = {
  text: string;
  value: string;
};

export const SUPPORTED_OEM_MAKES: OemMakeOption[] = [
  { text: 'Mercedes', value: 'mercedes' },
  { text: 'Audi', value: 'audi' },
  { text: 'Volkswagen', value: 'volkswagen' },
  { text: 'Porsche', value: 'porsche' },
  { text: 'Toyota', value: 'toyota' },
  { text: 'Lexus', value: 'lexus' },
  { text: 'Mazda', value: 'mazda' },
  { text: 'Subaru', value: 'subaru' },
  { text: 'Chevrolet', value: 'chevrolet' },
  { text: 'Buick', value: 'buick' },
  { text: 'GMC', value: 'gmc' },
  { text: 'Cadillac', value: 'cadillac' },
  { text: 'Hyundai', value: 'hyundai' },
  { text: 'Genesis', value: 'genesis' },
  { text: 'Kia', value: 'kia' },
  { text: 'Honda', value: 'honda' },
  { text: 'Acura', value: 'acura' },
  { text: 'Nissan', value: 'nissan' },
  { text: 'Mitsubishi', value: 'mitsubishi' },
  { text: 'Infiniti', value: 'infiniti' },
  { text: 'Jaguar', value: 'jaguar' },
  { text: 'Land Rover', value: 'land-rover' },
  { text: 'Ford', value: 'ford' },
  { text: 'Lincoln', value: 'lincoln' },
  { text: 'Jeep', value: 'jeep' },
  { text: 'Chrysler', value: 'chrysler' },
  { text: 'Dodge', value: 'dodge' },
  { text: 'Ram', value: 'ram' },
  { text: 'BMW', value: 'bmw' },
  { text: 'MINI', value: 'mini' },
  { text: 'Volvo', value: 'volvo' },
];

export const SERVICE_SCHEDULER_REDIRECT_URLS: Partial<
  Record<ServiceSchedulerPlatformType, string>
> = {
  [SERVICE_SCHEDULER_PLATFORM.TEKION]:
    'https://docs.google.com/document/d/172adgXnpRPqaEUogTVYMt_i9VT_RFmtH-IIX2SDbcgs/edit?usp=sharing',
  [SERVICE_SCHEDULER_PLATFORM.PBS]:
    'https://docs.google.com/document/d/13aADZUS3hVZUtLDHwOpduggpoTRHnYBT21VfAf9Zrh8/edit?tab=t.0#heading=h.em84aqtnp8ve',
  [SERVICE_SCHEDULER_PLATFORM.CDK]:
    'https://cdkglobal.wistia.com/medias/05rn36sghz',
  [SERVICE_SCHEDULER_PLATFORM.XTIME]:
    'https://docs.google.com/document/d/1AVkaquXLmpLithqC0LV29b5y-L-zONFu2IqtbfXa5Oc/edit?usp=sharing',
  [SERVICE_SCHEDULER_PLATFORM.EVENFLOW]:
    'https://docs.google.com/document/d/1n4exHXtVqpA5vJ5fE5_wFBRnHoh-_x8W/edit?usp=sharing&ouid=113003428353427520055&rtpof=true&sd=true',
  [SERVICE_SCHEDULER_PLATFORM.MYKAARMA]:
    'https://docs.google.com/document/d/1OnR7AKVBQqCTTIO9xQeyGHrs7O_D09JW/edit?usp=sharing&ouid=113003428353427520055&rtpof=true&sd=true',
};

export function isDEALERFXProvider(providerName?: string): boolean {
  return (
    providerName?.toLowerCase().includes(SERVICE_SCHEDULER_PLATFORM.DEALERFX) ??
    false
  );
}
export function isCdkProvider(providerName?: string): boolean {
  return (
    providerName?.toLowerCase().includes(SERVICE_SCHEDULER_PLATFORM.CDK) ??
    false
  );
}
