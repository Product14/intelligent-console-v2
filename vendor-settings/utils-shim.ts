// Lightweight stand-in for the @spyne-console/utils barrel.
// The onboarding kit only needs `cn` from the barrel; the real barrel pulls in
// analytics/amplitude and other app-only deps we don't want in this prototype.
export { cn } from './utils/cn';
