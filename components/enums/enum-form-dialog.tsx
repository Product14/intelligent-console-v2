"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Save, Plus, AlertTriangle, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { 
  enumApiService, 
  getAllEnumCategories, 
  getEnumCategoryLabel, 
  getSeverityColor,
  type IssueMaster, 
  type EnumCategoryCode, 
  type SeverityLevel,
  type CreateIssueMasterRequest,
  type UpdateIssueMasterRequest
} from "@/lib/enum-api"

interface EnumFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  enum_?: IssueMaster
  onSuccess?: () => void
}

export function EnumFormDialog({ open, onOpenChange, enum_, onSuccess }: EnumFormDialogProps) {
  const [code, setCode] = React.useState<EnumCategoryCode | "">(enum_?.code || "")
  const [title, setTitle] = React.useState(enum_?.title || "")
  const [description, setDescription] = React.useState(enum_?.description || "")
  const [defaultSeverity, setDefaultSeverity] = React.useState<SeverityLevel>(enum_?.defaultSeverity || "medium")
  const [isActive, setIsActive] = React.useState(enum_?.isActive ?? true)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const isEditing = !!enum_
  const enumCategories = getAllEnumCategories()

  // Reset form when dialog opens/closes or enum changes
  React.useEffect(() => {
    if (open) {
      setCode(enum_?.code || "")
      setTitle(enum_?.title || "")
      setDescription(enum_?.description || "")
      setDefaultSeverity(enum_?.defaultSeverity || "medium")
      setIsActive(enum_?.isActive ?? true)
      setErrors({})
      setIsSubmitting(false)
    }
  }, [open, enum_])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!code) {
      newErrors.code = "Category is required"
    }

    if (!title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!description.trim()) {
      newErrors.description = "Description is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm() || !code) return

    setIsSubmitting(true)

    try {
      if (isEditing && enum_?._id) {
        // Update existing enum
        const updateData: UpdateIssueMasterRequest = {
          code,
          title: title.trim(),
          description: description.trim(),
          defaultSeverity,
          isActive,
        }
        
        await enumApiService.updateIssueMaster(enum_._id, updateData)
        
        toast({
          title: "Issue type updated",
          description: `${title} has been updated successfully`,
        })
      } else {
        // Create new enum
        const createData: CreateIssueMasterRequest = {
          code,
          title: title.trim(),
          description: description.trim(),
          defaultSeverity,
          isActive,
        }
        
        await enumApiService.createIssueMaster(createData)
        
        toast({
          title: "Issue type created",
          description: `${title} has been created successfully`,
        })
      }

      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save enum:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save issue type",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCodeChange = (value: string) => {
    setCode(value as EnumCategoryCode)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? <Save className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {isEditing ? "Edit Enum" : "Create New Enum"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the enum details below." : "Create a new quality assurance enumeration code."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="code">
              Category *
            </Label>
            <Select value={code} onValueChange={handleCodeChange}>
              <SelectTrigger className={errors.code ? "border-red-500" : ""}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {enumCategories.map((category) => (
                  <SelectItem key={category.code} value={category.code}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.code && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertTriangle className="h-3 w-3" />
                {errors.code}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Missing Professional Greeting"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertTriangle className="h-3 w-3" />
                {errors.title}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              placeholder="Detailed description of this quality issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className={`flex min-h-[100px] max-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-y-auto break-all whitespace-normal ${errors.description ? "border-red-500" : ""}`}
            />
            {errors.description && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertTriangle className="h-3 w-3" />
                {errors.description}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Default Severity</Label>
            <Select value={defaultSeverity} onValueChange={(value: SeverityLevel) => setDefaultSeverity(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <Badge variant={getSeverityColor("low") as "default" | "destructive" | "secondary" | "outline"}>LOW</Badge>
                    <span>Low</span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <Badge variant={getSeverityColor("medium") as "default" | "destructive" | "secondary" | "outline"}>MEDIUM</Badge>
                    <span>Medium</span>
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <Badge variant={getSeverityColor("high") as "default" | "destructive" | "secondary" | "outline"}>HIGH</Badge>
                    <span>High</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
            <Label htmlFor="active">Active</Label>
            <span className="text-xs text-muted-foreground">
              {isActive ? "Available for use in annotations" : "Hidden from annotation selection"}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="cursor-pointer">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting} className="cursor-pointer">
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSubmitting ? "Saving..." : isEditing ? "Update" : "Create"} Enum
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
