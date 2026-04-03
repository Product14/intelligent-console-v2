"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import {
  Search, FileSpreadsheet, Globe, ArrowRight,
  CheckCircle2, Loader2, FolderOpen, X, Check,
} from "lucide-react"

type IntakeMethod = "vin" | "folder" | "csv" | "website"

const intakeMethods: {
  id: IntakeMethod
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  borderColor: string
}[] = [
  {
    id: "vin",
    name: "VIN / Stock Number",
    description: "Add a single vehicle by identifier.",
    icon: Search,
    color: "text-spyne-primary",
    bgColor: "bg-spyne-primary-soft",
    borderColor: "border-spyne-border",
  },
  {
    id: "folder",
    name: "Folder Upload",
    description: "Upload a folder of vehicle images.",
    icon: FolderOpen,
    color: "text-spyne-success",
    bgColor: spyneComponentClasses.rowPositive,
    borderColor: "border-spyne-border",
  },
  {
    id: "csv",
    name: "CSV Import",
    description: "Bulk import via spreadsheet.",
    icon: FileSpreadsheet,
    color: "text-spyne-text",
    bgColor: "bg-muted",
    borderColor: "border-spyne-border",
  },
  {
    id: "website",
    name: "Import from Website",
    description: "Scan and import from your site.",
    icon: Globe,
    color: "text-spyne-text",
    bgColor: spyneComponentClasses.rowWarn,
    borderColor: "border-spyne-border",
  },
]

function formatVIN(value: string): string {
  return value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "").slice(0, 17)
}

function VINEntryFlow() {
  const [identifier, setIdentifier] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isDone, setIsDone] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => { inputRef.current?.focus() }, [])

  const isValid = identifier.length >= 5

  const handleSubmit = () => {
    if (!isValid) return
    setIsSubmitting(true)
    setTimeout(() => { setIsSubmitting(false); setIsDone(true) }, 1500)
  }

  if (isDone) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className={cn("mx-auto w-12 h-12 rounded-full flex items-center justify-center", spyneComponentClasses.rowPositive)}>
          <CheckCircle2 className="h-6 w-6 text-spyne-success" />
        </div>
        <div>
          <h3 className="text-base font-semibold">Vehicle Added</h3>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-mono text-foreground text-xs">{identifier}</span> is now in your inventory.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setIdentifier(""); setIsDone(false) }}>
          Add Another
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium mb-1.5 block">VIN, Stock Number, or Registration Number</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="e.g. 1HGCG5655WA042761 or STK-1234"
            value={identifier}
            onChange={(e) => setIdentifier(formatVIN(e.target.value))}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="pl-9 h-10 font-mono tracking-wider text-sm"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {identifier.length}/17 characters
        </p>
      </div>
      <Button size="sm" disabled={!isValid || isSubmitting} onClick={handleSubmit}>
        {isSubmitting ? (
          <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Looking up…</>
        ) : (
          <>Add Vehicle<ArrowRight className="h-3.5 w-3.5 ml-1.5" /></>
        )}
      </Button>
    </div>
  )
}

function FolderUploadFlow() {
  const [files, setFiles] = React.useState<string[]>([])
  const [isDragOver, setIsDragOver] = React.useState(false)

  const handleMockDrop = () => {
    setFiles(["2021_Ford_F150_XLT/", "2022_Honda_CRV_EXL/", "2020_Toyota_Camry_SE/", "2023_BMW_X3_sDrive30i/"])
  }

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
          isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-muted-foreground/35"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleMockDrop() }}
        onClick={handleMockDrop}
      >
        <FolderOpen className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm font-medium">Drop a folder here or click to browse</p>
        <p className="text-xs text-muted-foreground mt-0.5">Each subfolder = one vehicle</p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">{files.length} vehicle folders detected</p>
          <div className="divide-y rounded-lg border text-sm">
            {files.map((f) => (
              <div key={f} className="flex items-center justify-between px-3 py-2">
                <span className="font-mono text-xs">{f}</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-spyne-success" />
              </div>
            ))}
          </div>
          <Button size="sm">Import {files.length} Vehicles<ArrowRight className="h-3.5 w-3.5 ml-1.5" /></Button>
        </div>
      )}
    </div>
  )
}

function CSVUploadFlow() {
  const [fileName, setFileName] = React.useState<string | null>(null)
  const [rowCount, setRowCount] = React.useState(0)
  const [isDragOver, setIsDragOver] = React.useState(false)

  const handleMockUpload = () => { setFileName("inventory_march_2026.csv"); setRowCount(47) }

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
          isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-muted-foreground/35"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleMockUpload() }}
        onClick={handleMockUpload}
      >
        <FileSpreadsheet className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm font-medium">Drop a CSV file here or click to browse</p>
        <p className="text-xs text-muted-foreground mt-0.5">Supports .csv and .xlsx</p>
      </div>

      {fileName && (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <div className="flex items-center gap-2 text-sm">
              <FileSpreadsheet className="h-4 w-4 text-spyne-primary" />
              <span className="font-medium">{fileName}</span>
              <span className="text-xs text-muted-foreground">{rowCount} rows</span>
            </div>
            <button onClick={() => { setFileName(null); setRowCount(0) }} className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="rounded-lg border p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Column Mapping</p>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {[["A", "VIN"], ["B", "Stock #"], ["C", "Year"], ["D", "Make"], ["E", "Model"], ["F", "Trim"], ["G", "Price"], ["H", "Mileage"]].map(
                ([col, mapped]) => (
                  <div key={col} className="flex items-center justify-between rounded bg-muted/50 px-2.5 py-1">
                    <span className="text-muted-foreground">Col {col}</span>
                    <span className="font-medium">{mapped}</span>
                  </div>
                )
              )}
            </div>
          </div>

          <Button size="sm">Import {rowCount} Vehicles<ArrowRight className="h-3.5 w-3.5 ml-1.5" /></Button>
        </div>
      )}
    </div>
  )
}

function WebsiteImportFlow() {
  const [url, setUrl] = React.useState("")
  const [isScanning, setIsScanning] = React.useState(false)
  const [foundVins, setFoundVins] = React.useState<{ vin: string; vehicle: string; selected: boolean }[]>([])

  const handleScan = () => {
    if (!url) return
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
      setFoundVins([
        { vin: "1FTEW1EP5MFA00001", vehicle: "2021 Ford F-150 XLT", selected: true },
        { vin: "4T1B11HK5KU100012", vehicle: "2020 Toyota RAV4 XLE", selected: true },
        { vin: "WA1LFAFP1EA100011", vehicle: "2022 Audi Q5 Premium", selected: true },
        { vin: "JM1NDAL75N0100008", vehicle: "2021 Mazda CX-5 Touring", selected: false },
        { vin: "2T1BURHE5JC100003", vehicle: "2020 Toyota Corolla LE", selected: false },
      ])
    }, 2000)
  }

  const toggleVin = (vin: string) => {
    setFoundVins((prev) => prev.map((v) => (v.vin === vin ? { ...v, selected: !v.selected } : v)))
  }

  const selectedCount = foundVins.filter((v) => v.selected).length

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium mb-1.5 block">Dealer Website URL</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="https://www.yourdealership.com/inventory"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
              className="pl-9 h-10 text-sm"
            />
          </div>
          <Button size="sm" className="h-10" disabled={!url || isScanning} onClick={handleScan}>
            {isScanning ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Scanning…</> : "Scan"}
          </Button>
        </div>
      </div>

      {foundVins.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">{foundVins.length} vehicles found</p>
          <div className="divide-y rounded-lg border text-sm">
            {foundVins.map((v) => (
              <label key={v.vin} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/30 transition-colors">
                <input
                  type="checkbox"
                  checked={v.selected}
                  onChange={() => toggleVin(v.vin)}
                  className="rounded border-spyne-border"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{v.vehicle}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">{v.vin}</p>
                </div>
              </label>
            ))}
          </div>
          <Button size="sm" disabled={selectedCount === 0}>
            Import {selectedCount} Vehicle{selectedCount !== 1 ? "s" : ""}
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </div>
      )}
    </div>
  )
}

export function AddVehiclePage() {
  const [selected, setSelected] = React.useState<IntakeMethod | null>(null)

  return (
    <div className="space-y-5">
      {/* Method selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {intakeMethods.map((method) => {
          const Icon = method.icon
          const isActive = selected === method.id
          return (
            <button
              key={method.id}
              onClick={() => setSelected(isActive ? null : method.id)}
              className={cn(
                "relative text-left p-4 rounded-lg border-2 transition-all",
                isActive
                  ? `${method.bgColor} ${method.borderColor} shadow-sm`
                  : "bg-spyne-surface border-spyne-border hover:border-spyne-text-secondary"
              )}
            >
              {isActive && (
                <div className="absolute top-2.5 right-2.5 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
              <div className={cn("p-1.5 rounded-md inline-flex mb-2", isActive ? method.bgColor : "bg-muted")}>
                <Icon className={cn("h-4 w-4", isActive ? method.color : "text-muted-foreground")} />
              </div>
              <p className={cn("text-sm font-semibold", isActive ? method.color : "text-foreground")}>
                {method.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{method.description}</p>
            </button>
          )
        })}
      </div>

      {/* Expanded method */}
      {selected && (
        <div className="rounded-lg border bg-white p-5">
          {selected === "vin" && <VINEntryFlow />}
          {selected === "folder" && <FolderUploadFlow />}
          {selected === "csv" && <CSVUploadFlow />}
          {selected === "website" && <WebsiteImportFlow />}
        </div>
      )}
    </div>
  )
}
