"use client"

import Link from "next/link"
import { Megaphone } from "lucide-react"
import { max2Classes, spyneComponentClasses } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"
import type { MerchandisingVehicle } from "@/services/max-2/max-2.types"
import { StudioInventoryVehicleThumb } from "@/components/max-2/studio/studio-inventory-vehicle-thumb"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export type MerchandisingActionTabKey =
  | "no-photos"
  | "cgi"
  | "less8"
  | "hero"
  | "no360"
  | "incomplete"
  | "no-interior"
  | "no-exterior"
  | "smart-match"
  | "quality"
  | "non-compliant"

/** Demo rule: newer or in-stock new units qualify for instant media generation. */
export function merchandisingInstantMediaEligible(v: MerchandisingVehicle): boolean {
  return v.mediaStatus === "no-photos" && (v.isNew === true || v.year >= 2023)
}

function PitchBanner({
  body,
  ctaLabel,
  ctaHref,
  variant = "default",
}: {
  body: React.ReactNode
  ctaLabel: string
  ctaHref: string
  /** `instant`: blue / purple / green gradient slab for the instant-media CTA. */
  variant?: "default" | "instant"
}) {
  const shell =
    variant === "instant" ? max2Classes.merchandisingInstantPitchBanner : max2Classes.overviewSuggestBanner
  const iconTone =
    variant === "instant" ? "text-spyne-primary" : "text-spyne-warning-ink"

  return (
    <div className={shell}>
      <div className={max2Classes.overviewSuggestBannerContent}>
        <Megaphone className={cn("mt-0.5 h-5 w-5 shrink-0", iconTone)} aria-hidden />
        <div className="min-w-0 flex-1 text-sm text-spyne-text">{body}</div>
      </div>
      <Link
        href={ctaHref}
        className={cn(spyneComponentClasses.btnPrimaryMd, "inline-flex shrink-0 justify-center no-underline")}
      >
        {ctaLabel}
      </Link>
    </div>
  )
}

const textCtaClass =
  "inline p-0 align-baseline text-sm font-medium text-spyne-primary underline-offset-2 hover:underline bg-transparent border-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-spyne-primary/30 focus-visible:ring-offset-2 rounded"

export function MerchandisingActionPitchBanners({
  tabKey,
  vehicles,
  onOpenPerfectVinExample,
}: {
  tabKey: MerchandisingActionTabKey
  vehicles: MerchandisingVehicle[]
  onOpenPerfectVinExample?: () => void
}) {
  const noPhoto = vehicles.filter((v) => v.mediaStatus === "no-photos")
  const instantEligible = noPhoto.filter(merchandisingInstantMediaEligible)
  const nInstant = instantEligible.length
  const nNoPhoto = noPhoto.length

  if (tabKey === "no-photos") {
    const instantLabel =
      nInstant === 1
        ? `Use instant media in 1 VIN (1 VIN eligible for instant media)`
        : `Use instant media in ${nInstant} VINs (${nInstant} VINs eligible for instant media)`
    const addLabel =
      nNoPhoto === 1
        ? `Add photos on 1 VIN`
        : `Add photos in all ${nNoPhoto} VINs`

    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <PitchBanner
          variant="instant"
          body={<p>{instantLabel}</p>}
          ctaLabel="Use instant media"
          ctaHref="/max-2/studio/add"
        />
        <PitchBanner
          body={<p>{addLabel}</p>}
          ctaLabel="Add photos"
          ctaHref="/max-2/studio/inventory?media=no-photos"
        />
      </div>
    )
  }

  if (tabKey === "cgi") {
    return (
      <PitchBanner
        body={<p>Listings with real photos build more buyer trust. Replace these AI-generated placeholders to improve listing quality.</p>}
        ctaLabel="Replace with real photos"
        ctaHref="/max-2/studio/inventory?media=cgi"
      />
    )
  }

  if (tabKey === "incomplete") {
    return (
      <PitchBanner
        body={
          <p>
            A VIN with both exterior and interior images performs better.{" "}
            <button
              type="button"
              className={textCtaClass}
              onClick={() => onOpenPerfectVinExample?.()}
            >
              See a perfect VIN example
            </button>
          </p>
        }
        ctaLabel="Complete photo set"
        ctaHref="/max-2/studio/inventory?issue=incomplete"
      />
    )
  }

  const single: Record<
    Exclude<MerchandisingActionTabKey, "no-photos" | "incomplete" | "cgi">,
    { body: string; cta: string; href: string }
  > = {
    less8: {
      body: "Listings with at least 8 angles earn stronger engagement. Top off each photo set.",
      cta: "Add more photos",
      href: "/max-2/studio/inventory?photos=low",
    },
    hero: {
      body: "The hero angle is the first impression. A front-left 3/4 shot consistently earns more clicks and higher engagement.",
      cta: "Fix hero angle",
      href: "/max-2/studio/inventory?issue=hero",
    },
    no360: {
      body: "Generate a 360° spin directly from the existing photo set — no re-shoot needed for eligible vehicles.",
      cta: "Generate 360",
      href: "/max-2/studio/inventory?issue=no360",
    },
    "no-interior": {
      body: "Interior photos are the #1 buyer request. Vehicles missing interior angles see 30% fewer appointment sets.",
      cta: "Fix interior photos",
      href: "/max-2/studio/inventory?issue=no-interior",
    },
    "no-exterior": {
      body: "Missing exterior angles reduce buyer confidence. Add a full walk-around set to complete the listing.",
      cta: "Fix exterior photos",
      href: "/max-2/studio/inventory?issue=no-exterior",
    },
    "smart-match": {
      body: "Shoot once, use always. You have 11 pending Smart Match shoots affecting 26 other VINs with no photos — complete them now to add photos to all at once.",
      cta: "Run Smart Match",
      href: "/max-2/studio/inventory?issue=smart-match",
    },
    quality: {
      body: "Sun glare, blurry shots, or reflections make listings look unprofessional. Reprocess or reshoot these vehicles.",
      cta: "Fix image quality",
      href: "/max-2/studio/inventory?issue=quality",
    },
    "non-compliant": {
      body: "These VINs contain a mix of incorrect photos — wrong angles, off-brand backgrounds, or watermarked images mixed into the set. Replacing them restores listing quality and protects your score.",
      cta: "Review non-compliant",
      href: "/max-2/studio/inventory?issue=non-compliant",
    },
  }

  const row = single[tabKey]
  return <PitchBanner body={<p>{row.body}</p>} ctaLabel={row.cta} ctaHref={row.href} />
}

const PERFECT_EXAMPLE_VIN = "1FTEW1EP5MFA10001"

export function PerfectVinExampleModal({
  open,
  onClose,
  vehicles,
}: {
  open: boolean
  onClose: () => void
  vehicles: MerchandisingVehicle[]
}) {
  const v = vehicles.find((x) => x.vin === PERFECT_EXAMPLE_VIN) ?? vehicles[0]
  if (!v) return null

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-md sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Example of a strong VIN listing</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Use this as a checklist when you complete exterior and interior coverage.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-3 rounded-lg border border-spyne-border bg-muted/20 p-3">
            <StudioInventoryVehicleThumb
              v={v}
              roundedClassName="rounded-md"
              surfaceClassName="bg-muted"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-spyne-text">
                {v.year} {v.make} {v.model} {v.trim}
              </p>
              <p className="text-xs text-muted-foreground">
                VIN <span className="font-mono text-spyne-text">{v.vin}</span>
              </p>
            </div>
          </div>
          <ul className="list-disc space-y-1.5 pl-4 text-sm text-muted-foreground">
            <li>Exterior gallery with consistent angles and lighting</li>
            <li>Interior cabin and dash coverage, not just the driver seat</li>
            <li>{v.has360 ? "360° spin published on the listing" : "360° spin on file"}</li>
            <li>Hero image follows your front 3/4 standard</li>
          </ul>
          <Link
            href={`/max-2/studio/inventory/vehicle/${encodeURIComponent(v.vin)}`}
            className={cn(
              spyneComponentClasses.btnPrimaryMd,
              "inline-flex w-full justify-center no-underline",
            )}
            onClick={onClose}
          >
            Open this VIN in inventory
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}
