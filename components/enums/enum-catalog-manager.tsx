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
    <div className="space-y-6">
      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search enums..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {selectedEnums.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{selectedEnums.length} selected</span>
                  <Button variant="outline" size="sm" onClick={() => handleBulkActivate(true)}>
                    Activate
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkActivate(false)}>
                    Deactivate
                  </Button>
                </div>
              )}
            </div>

            <Button onClick={() => setShowNewEnum(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Enum
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enums Table */}
      <Card>
        <CardHeader>
          <CardTitle>Enums ({filteredEnums.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEnums.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{searchQuery ? "No enums found" : "No enums available"}</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try adjusting your search criteria." : "Create your first enum to get started."}
              </p>
              {!searchQuery && (
                <Button className="mt-4" onClick={() => setShowNewEnum(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Enum
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all enums"
                        {...(isIndeterminate && { "data-state": "indeterminate" })}
                      />
                    </TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Default Severity</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnums.map((enum_) => (
                    <TableRow key={enum_.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedEnums.includes(enum_.id)}
                          onCheckedChange={(checked) => handleSelectEnum(enum_.id, checked as boolean)}
                          aria-label={`Select ${enum_.code}`}
                        />
                      </TableCell>
                      <TableCell className="font-mono font-medium">{enum_.code}</TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="font-medium truncate" title={enum_.title}>
                            {enum_.title}
                          </div>
                          <div className="text-xs text-muted-foreground truncate" title={enum_.description}>
                            {enum_.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(enum_.severity)}>{enum_.severity}</Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={enum_.isActive}
                          onCheckedChange={(checked) => handleToggleActive(enum_.id, checked)}
                          aria-label={`Toggle ${enum_.code} active status`}
                        />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(enum_.updatedAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu for {enum_.code}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(enum_)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleMerge(enum_)}>
                              <Merge className="h-4 w-4 mr-2" />
                              Merge
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

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
