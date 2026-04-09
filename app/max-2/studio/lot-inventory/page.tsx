import { max2Classes, max2Layout } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"

export default function LotInventoryPage() {
  return (
    <div className={cn(max2Layout.pageStack)}>
      <div>
        <h1 className={max2Classes.pageTitle}>Lot Inventory</h1>
        <p className={max2Classes.pageDescription}>
          View and manage your physical lot inventory.
        </p>
      </div>
    </div>
  )
}
