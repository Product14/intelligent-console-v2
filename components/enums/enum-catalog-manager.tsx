"use client"
import * as React from "react"
import { Search, Plus, Edit, Merge, MoreHorizontal, Settings, SearchX, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { toast } from "@/hooks/use-toast"
import { EnumFormDialog } from "./enum-form-dialog"
import { MergeEnumDialog } from "./merge-enum-dialog"
import { 
  enumApiService, 
  getEnumCategoryLabel, 
  getSeverityColor,
  type IssueMaster, 
  type GetIssueMastersParams 
} from "@/lib/enum-api"

export function EnumCatalogManager() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedEnums, setSelectedEnums] = React.useState<string[]>([])
  const [showNewEnum, setShowNewEnum] = React.useState(false)
  const [editingEnum, setEditingEnum] = React.useState<IssueMaster | null>(null)
  const [mergingEnum, setMergingEnum] = React.useState<IssueMaster | null>(null)
  const [enums, setEnums] = React.useState<IssueMaster[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [isSearching, setIsSearching] = React.useState(false)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalCount, setTotalCount] = React.useState(0)
  const [isLoadingMore, setIsLoadingMore] = React.useState(false)
  const hasInitiallyLoaded = React.useRef(false)
  const loadMoreRef = React.useRef<HTMLDivElement>(null)

  // Load enums from API (single page)
  const loadEnums = async (params?: GetIssueMastersParams, append: boolean = false) => {
    try {
      if (append) {
        setIsLoadingMore(true)
      } else {
        setIsLoading(true)
      }
      setError(null)
      
      const response = await enumApiService.getIssueMasters(params)
      const data = response.data || []
      const pagination = response.pagination
      
      setTotalPages(pagination?.totalPages || 1)
      setTotalCount(pagination?.totalCount || data.length)
      
      if (append) {
        // Append to existing data for pagination
        setEnums(prev => [...prev, ...data])
      } else {
        // Replace data for initial load or search
        setEnums(data)
      }
    } catch (error) {
      console.error('Failed to load enums:', error)
      setError(error instanceof Error ? error.message : 'Failed to load issue types')
      if (!append) {
        setEnums([])
      }
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }
  
  // Load next page
  const loadNextPage = React.useCallback(async () => {
    if (isLoadingMore || currentPage >= totalPages) return
    
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)
    await loadEnums({ limit: 100, page: nextPage, search: searchQuery.trim() || undefined }, true)
  }, [currentPage, totalPages, isLoadingMore, searchQuery])

  // Initial load on mount only
  React.useEffect(() => {
    if (!hasInitiallyLoaded.current) {
      loadEnums({ limit: 100, page: 1 })
      hasInitiallyLoaded.current = true
    }
  }, []) // Empty dependency array - only run once on mount

  // Search with debounce
  React.useEffect(() => {
    // Skip if we haven't done the initial load yet
    if (!hasInitiallyLoaded.current) {
      return
    }

    if (!searchQuery.trim()) {
      // If search is cleared, reload first page
      setCurrentPage(1)
      loadEnums({ limit: 100, page: 1 })
      return
    }

    setIsSearching(true)
    const timer = setTimeout(async () => {
      try {
        setCurrentPage(1)
        await loadEnums({ limit: 100, page: 1, search: searchQuery.trim() })
      } finally {
        setIsSearching(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery]) // Only depend on searchQuery
  
  // Intersection Observer for infinite scroll
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && currentPage < totalPages) {
          loadNextPage()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current)
      }
    }
  }, [loadNextPage, isLoadingMore, currentPage, totalPages])

  // Filter enums based on search query (client-side fallback)
  const filteredEnums = React.useMemo(() => {
    if (!searchQuery.trim()) return enums

    const query = searchQuery.toLowerCase()
    return enums.filter(
      (enum_) =>
        enum_.code.toLowerCase().includes(query) ||
        enum_.title.toLowerCase().includes(query) ||
        enum_.description.toLowerCase().includes(query),
    )
  }, [enums, searchQuery])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEnums(filteredEnums.map((e) => e._id))
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

  const handleToggleActive = async (enumId: string, isActive: boolean) => {
    try {
      // Find the enum to get all its current data
      const enumToUpdate = enums.find(e => e._id === enumId)
      if (!enumToUpdate) {
        throw new Error('Issue type not found')
      }

      // Use the full update API with all required fields
      const updateData = {
        code: enumToUpdate.code,
        title: enumToUpdate.title,
        description: enumToUpdate.description,
        defaultSeverity: enumToUpdate.defaultSeverity,
        isActive
      }
      
      await enumApiService.updateIssueMaster(enumId, updateData)
      
      // Update local state
      setEnums(prev => prev.map(enum_ => 
        enum_._id === enumId ? { ...enum_, isActive } : enum_
      ))
      
      toast({
        title: isActive ? "Issue type activated" : "Issue type deactivated",
        description: `Issue type has been ${isActive ? "activated" : "deactivated"} successfully`,
      })
    } catch (error) {
      console.error('Failed to toggle enum status:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update issue type status",
        variant: "destructive",
      })
    }
  }

  const handleBulkActivate = (activate: boolean) => {
    if (selectedEnums.length === 0) {
      toast({
        title: "No issue types selected",
        description: "Please select issue types to perform bulk actions",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would update the backend

    toast({
      title: `Issue types ${activate ? "activated" : "deactivated"}`,
      description: `${selectedEnums.length} issue type(s) have been ${activate ? "activated" : "deactivated"}`,
    })
    setSelectedEnums([])
  }

  const handleEdit = (enum_: IssueMaster) => {
    setEditingEnum(enum_)
  }

  const handleMerge = (enum_: IssueMaster) => {
    setMergingEnum(enum_)
  }

  const handleSuccess = () => {
    setCurrentPage(1)
    loadEnums({ limit: 100, page: 1 })
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
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
            <input
              placeholder="Search issue types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-white/90 backdrop-blur-sm border-border/50 rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm hover:bg-white/95"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />
            )}
          </div>
          <button 
            onClick={() => setShowNewEnum(true)}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Issue Type
          </button>
        </div>
      </div>



      {/* Enums Grid Section */}
      <div>
        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-lg ml-2" />
                </div>
                <div className="flex-1 mb-4" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-10 rounded-full" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-card border border-border rounded-xl p-16 text-center">
            <div className="w-20 h-20 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-destructive/20">
              <AlertTriangle className="h-10 w-10 text-destructive/60" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Failed to load issue types
            </h3>
            <p className="text-base text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
              {error}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button 
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md cursor-pointer"
                onClick={() => {
                  setCurrentPage(1)
                  loadEnums({ limit: 100, page: 1 })
                }}
              >
                <Loader2 className="h-4 w-4" />
                Retry
              </button>
            </div>
          </div>
        ) : filteredEnums.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/10">
              {searchQuery ? (
                <SearchX className="h-10 w-10 text-primary/60" />
              ) : (
                <Settings className="h-10 w-10 text-primary/60" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              {searchQuery ? "No matching issue types found" : "No issue types available"}
            </h3>
            <p className="text-base text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
              {searchQuery 
                ? `We couldn't find any issue types matching "${searchQuery}". Try adjusting your search terms or browse all available issue types.` 
                : "Get started by creating your first quality issue type to categorize and track call quality problems."}
            </p>
            <div className="flex items-center justify-center gap-3">
              {searchQuery ? (
                <>
                  <button 
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md cursor-pointer"
                    onClick={() => setSearchQuery("")}
                  >
                    <SearchX className="h-4 w-4" />
                    Clear Search
                  </button>
                  <button 
                    className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-medium text-sm hover:bg-secondary/80 transition-colors border border-border cursor-pointer"
                    onClick={() => setShowNewEnum(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Create New Issue Type
                  </button>
                </>
              ) : (
                <button 
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md cursor-pointer"
                  onClick={() => setShowNewEnum(true)}
                >
                  <Plus className="h-4 w-4" />
                  Create First Issue Type
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredEnums.map((enum_) => (
              <div key={enum_._id} className="group relative bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col h-full">
                {/* Header Section */}
                <div className="flex items-start justify-between">
                  <div className="flex flex-col min-w-0 gap-2">
                    <h4 className="text-base font-semibold text-foreground leading-tight line-clamp-2">
                      {enum_.title || "Untitled"}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-5 line-clamp-2">
                      {enum_.description || "No description available"}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs cursor-default">
                        {getEnumCategoryLabel(enum_.code)}
                      </Badge>
                      <Badge variant={getSeverityColor(enum_.defaultSeverity) as "default" | "destructive" | "secondary" | "outline"} className="text-xs cursor-default">
                        {enum_.defaultSeverity.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="opacity-0 group-hover:opacity-100 transition-all duration-200 w-8 h-8 rounded-lg hover:bg-muted/80 flex items-center justify-center shrink-0 cursor-pointer">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">Open menu for {enum_.code}</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleEdit(enum_)} className="cursor-pointer">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Issue Type
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleMerge(enum_)} className="cursor-pointer">
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
                      onCheckedChange={(checked) => handleToggleActive(enum_._id, checked)}
                      aria-label={`Toggle ${enum_.code} active status`}
                      className="scale-90 cursor-pointer"
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
                      {enum_.updatedAt ? format(new Date(enum_.updatedAt), "MMM d") : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading more shimmer */}
            {isLoadingMore && (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div key={`skeleton-${i}`} className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col h-full">
                    {/* Header Section */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex flex-col gap-2 flex-1">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <div className="mt-2 flex items-center gap-2">
                          <Skeleton className="h-5 w-20" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-8 rounded-lg" />
                    </div>
                    
                    {/* Footer Section */}
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-5 w-10 rounded-full" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                ))}
              </>
            )}
            
            {/* Infinite scroll trigger */}
            <div ref={loadMoreRef} className="col-span-full h-4"></div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <EnumFormDialog 
        open={showNewEnum} 
        onOpenChange={setShowNewEnum} 
        onSuccess={handleSuccess}
      />

      {editingEnum && (
        <EnumFormDialog
          open={!!editingEnum}
          onOpenChange={(open) => !open && setEditingEnum(null)}
          enum_={editingEnum}
          onSuccess={handleSuccess}
        />
      )}

      {/* TODO: Update MergeEnumDialog to use IssueMaster type */}
      {false && mergingEnum && (
        <MergeEnumDialog
          open={!!mergingEnum}
          onOpenChange={(open) => !open && setMergingEnum(null)}
          sourceEnum={mergingEnum as any}
        />
      )}
    </div>
  )
}
