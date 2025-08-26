"use client"

import * as React from "react"
import { Search, Plus, Edit, Merge, MoreHorizontal, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { MOCKS, getSeverityColor } from "@/lib/mocks"
import { toast } from "@/hooks/use-toast"
import { EnumFormDialog } from "./enum-form-dialog"
import { MergeEnumDialog } from "./merge-enum-dialog"
import type { QAEnum } from "@/lib/types"

export function EnumCatalogManager() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedEnums, setSelectedEnums] = React.useState<string[]>([])
  const [showNewEnum, setShowNewEnum] = React.useState(false)
  const [editingEnum, setEditingEnum] = React.useState<QAEnum | null>(null)
  const [mergingEnum, setMergingEnum] = React.useState<QAEnum | null>(null)

  // Filter enums based on search query
  const filteredEnums = React.useMemo(() => {
    if (!searchQuery.trim()) return MOCKS.enums

    const query = searchQuery.toLowerCase()
    return MOCKS.enums.filter(
      (enum_) =>
        enum_.code.toLowerCase().includes(query) ||
        enum_.title.toLowerCase().includes(query) ||
        enum_.description.toLowerCase().includes(query),
    )
  }, [searchQuery])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEnums(filteredEnums.map((e) => e.id))
    } else {
      setSelectedEnums([])
    }
  }

  const handleSelectEnum = (enumId: string, checked: boolean) => {
    if (checked) {
      setSelectedEnums((prev) => [...prev, enumId])
    } else {
      setSelectedEnums((prev) => prev.filter((id) => id !== enumId))
    }
  }

  const handleToggleActive = (enumId: string, isActive: boolean) => {
    // In a real app, this would update the backend
    console.log(`Toggling enum ${enumId} to ${isActive ? "active" : "inactive"}`)
    toast({
      title: isActive ? "Enum activated" : "Enum deactivated",
      description: `Enum has been ${isActive ? "activated" : "deactivated"} successfully`,
    })
  }

  const handleBulkActivate = (activate: boolean) => {
    if (selectedEnums.length === 0) {
      toast({
        title: "No enums selected",
        description: "Please select enums to perform bulk actions",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would update the backend
    console.log(`Bulk ${activate ? "activating" : "deactivating"} enums:`, selectedEnums)
    toast({
      title: `Enums ${activate ? "activated" : "deactivated"}`,
      description: `${selectedEnums.length} enum(s) have been ${activate ? "activated" : "deactivated"}`,
    })
    setSelectedEnums([])
  }

  const handleEdit = (enum_: QAEnum) => {
    setEditingEnum(enum_)
  }

  const handleMerge = (enum_: QAEnum) => {
    setMergingEnum(enum_)
  }

  const isAllSelected = filteredEnums.length > 0 && selectedEnums.length === filteredEnums.length
  const isIndeterminate = selectedEnums.length > 0 && selectedEnums.length < filteredEnums.length

  return (
    <div className="w-full space-y-12">
      {/* Header - Match Issues Tab */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Issue Manager</h2>
          <p className="text-sm text-muted-foreground">
            Create, organize and manage quality assurance issue types and categories
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search issue types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/90 backdrop-blur-sm border-border/50 rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm hover:bg-white/95"
            />
          </div>
          <button 
            onClick={() => setShowNewEnum(true)}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md shrink-0"
          >
            <Plus className="h-4 w-4" />
            New Issue Type
          </button>
        </div>
      </div>



      {/* Enums Grid Section */}
      <div>

        {filteredEnums.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/10">
              <Settings className="h-10 w-10 text-primary/60" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              {searchQuery ? "No issue types found" : "No issue types available"}
            </h3>
            <p className="text-base text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
              {searchQuery 
                ? "We couldn't find any issue types matching your search criteria. Try adjusting your search terms or filters." 
                : "Get started by creating your first quality issue type to categorize and track call quality problems."}
            </p>
            {!searchQuery && (
              <button 
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md"
                onClick={() => setShowNewEnum(true)}
              >
                <Plus className="h-4 w-4" />
                Create First Issue Type
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredEnums.map((enum_) => (
              <div key={enum_.id} className="group relative bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col h-full">
                {/* Header Section */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-semibold text-foreground leading-tight line-clamp-2 min-h-[3rem] mb-0">
                      {enum_.title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-5 line-clamp-2 min-h-[2.5rem] mt-1">
                      {enum_.description}
                    </p>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="opacity-0 group-hover:opacity-100 transition-all duration-200 w-8 h-8 rounded-lg hover:bg-muted/80 flex items-center justify-center shrink-0">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">Open menu for {enum_.code}</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleEdit(enum_)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Enum
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleMerge(enum_)}>
                        <Merge className="h-4 w-4 mr-2" />
                        Merge with Another
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Spacer for footer positioning */}
                <div className="mb-4 flex-1"></div>

                {/* Footer Section - Always at bottom */}
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={enum_.isActive}
                      onCheckedChange={(checked) => handleToggleActive(enum_.id, checked)}
                      aria-label={`Toggle ${enum_.code} active status`}
                      className="scale-90"
                    />
                    <span className={`text-sm font-medium ${
                      enum_.isActive 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-muted-foreground'
                    }`}>
                      {enum_.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>Updated</span>
                    <span className="font-medium">
                      {format(new Date(enum_.updatedAt), "MMM d")}
                    </span>
                  </div>
                </div>


              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <EnumFormDialog open={showNewEnum} onOpenChange={setShowNewEnum} />

      {editingEnum && (
        <EnumFormDialog
          open={!!editingEnum}
          onOpenChange={(open) => !open && setEditingEnum(null)}
          enum_={editingEnum}
        />
      )}

      {mergingEnum && (
        <MergeEnumDialog
          open={!!mergingEnum}
          onOpenChange={(open) => !open && setMergingEnum(null)}
          sourceEnum={mergingEnum}
        />
      )}
    </div>
  )
}
