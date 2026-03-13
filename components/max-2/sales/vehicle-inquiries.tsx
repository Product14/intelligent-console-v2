"use client"

import { mockVehicleInquiries } from "@/lib/max-2-mocks"
import type { VehicleInquiry } from "@/services/max-2/max-2.types"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ExternalLink } from "lucide-react"

const statusBadge: Record<VehicleInquiry["status"], { label: string; className: string }> = {
  hot: { label: "Hot", className: "bg-red-500/10 text-red-600 border-red-200" },
  warm: { label: "Warm", className: "bg-amber-500/10 text-amber-600 border-amber-200" },
  cold: { label: "Cold", className: "bg-blue-500/10 text-blue-600 border-blue-200" },
}

export function VehicleInquiries() {
  const sorted = [...mockVehicleInquiries].sort((a, b) => b.inquiryCount - a.inquiryCount)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Inquiries — What customers are asking for</CardTitle>
        <CardDescription>Sorted by demand. Amber rows = not in stock.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>In Stock?</TableHead>
              <TableHead className="text-right">Inquiries</TableHead>
              <TableHead>Last Inquiry</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((v) => {
              const badge = statusBadge[v.status]
              return (
                <TableRow
                  key={v.id}
                  className={cn(!v.inStock && "bg-amber-50/60")}
                >
                  <TableCell className="font-medium">{v.vehicleDescription}</TableCell>
                  <TableCell>
                    {v.inStock ? (
                      <span className="text-emerald-600 text-xs font-medium">Yes</span>
                    ) : (
                      <Link
                        href="/max-2/sourcing"
                        className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:underline"
                      >
                        No — Source
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold">{v.inquiryCount}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{v.lastInquiry}</TableCell>
                  <TableCell className="text-xs">{v.source}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={badge.className}>
                      {badge.label}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
