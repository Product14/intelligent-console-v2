import type { ReactNode } from "react"
import StudioSecondaryNav from "@/components/max-2/studio/console-v2/components/StudioSecondaryNav"

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-w-0">
      <StudioSecondaryNav />
      <div className="min-w-0 px-max2-page py-6">{children}</div>
    </div>
  )
}
