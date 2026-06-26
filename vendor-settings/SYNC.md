# Vendored code — sync log

Files under `vendor/` (and cherry-picked components/services) are copied from the
production monorepo and **must not be hand-edited**. Re-sync from source when the
design system or services change.

- **Source repo:** `spyne-console-microfrontends`
- **Synced at commit:** `caf4b69a2`

## Vendored

| Dest | Source | Notes |
|------|--------|-------|
| `vendor/design-system/tailwind.cjs` | `packages/design-system/src/tailwind.cjs` | Tailwind theme preset (colors/spacing). Consumed by `tailwind.config.js` (theme only). |
| `vendor/design-system/design-system.css` | `packages/design-system/src/design-system.css` | Tailwind entry + scrollbar util (reference). |
| `app/globals.css` `:root` block | `packages/design-system/src/styles/globals.css` | CSS design tokens (`--primary`, `--typography*`, shadows). |

## Deliberate forks (do not lose on re-sync)

- `vendor/components/onboarding/onboarding-stepper.js` — `isStepClickable` patched to return `true` for all steps (free/skippable navigation; the upstream gates not-started steps behind completing the previous one).
- `vendor/components/onboarding/rooftop-profile/onboarding-rooftop-details.js` — removed the `<AutofillWithAi>` hero block from the render (scraping demoted; quality comes from integrations, not scraping).
- `vendor/components/onboarding/onboarding-step-header.js` — compacted (avatar 96→44px, title 28→20px) for operator density / Pam-clean feel.
- `vendor/components/onboarding/rooftop-profile/onboarding-rooftop-details.js` — removed the `<OnboardingRooftopSubscription>` panel from the render. The rooftop profile is now identity-only in the new Settings IA; subscription/agents summary belongs in Billing & Usage (separate Console area).

## Cherry-pick targets (pulled on demand)

- `apps/converse-ai/services/*.service.ts` → `services/*` (refactor imports to `@/lib/api`)
- `apps/converse-ai/app/models/Onboarding.tsx` → `lib/onboarding-model.ts`
- `packages/utils/src/config.js` token logic + `centralAPIHandler/*` → `lib/api/*` (token built from bridge context, not localStorage)
- `packages/design-system/src/<component>` → `components/ds/<component>` (fix imports locally)
