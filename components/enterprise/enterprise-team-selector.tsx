"use client"

import React, { useRef, useEffect, useState } from 'react'
import { ChevronDown, Building2, Users, Search, X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { useEnterprise } from '@/lib/enterprise-context'
import { Enterprise, Team } from '@/lib/enterprise-api'

interface EnterpriseTeamSelectorProps {
  className?: string
}

export function EnterpriseTeamSelector({ className = "" }: EnterpriseTeamSelectorProps) {
  const {
    enterprises,
    teams,
    selectedEnterprise,
    selectedTeam,
    isLoadingEnterprises,
    isLoadingTeams,
    isInitialLoading,
    enterprisesError,
    teamsError,
    hasMoreEnterprises,
    enterpriseSearchTerm,
    setSelectedEnterprise,
    setSelectedTeam,
    loadMoreEnterprises,
    loadAllEnterprises,
    searchEnterprises,
    clearSearchAndReload,
  } = useEnterprise()

  const [isEnterpriseDropdownOpen, setIsEnterpriseDropdownOpen] = useState(false)
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false)
  const [localEnterpriseSearchTerm, setLocalEnterpriseSearchTerm] = useState("")
  const [teamSearchTerm, setTeamSearchTerm] = useState("")
  const [isSearchingEnterprises, setIsSearchingEnterprises] = useState(false)
  const enterpriseScrollRef = useRef<HTMLDivElement>(null)

  // Use debounced search for enterprises (backend search)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  // Filter teams based on search term (client-side for teams)
  const filteredTeams = teams.filter(team => 
    team.team_name.toLowerCase().includes(teamSearchTerm.toLowerCase())
  )

  // Debounced search function for enterprises
  const handleEnterpriseSearch = (value: string) => {
    setLocalEnterpriseSearchTerm(value)
    
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    // Set searching state immediately when user types
    if (value.trim()) {
      setIsSearchingEnterprises(true)
    } else {
      setIsSearchingEnterprises(false)
    }

    const timeout = setTimeout(async () => {
      try {
        await searchEnterprises(value)
      } finally {
        setIsSearchingEnterprises(false)
      }
    }, 300) // 300ms debounce

    setSearchTimeout(timeout)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])

  // Handle infinite scroll for enterprises
  useEffect(() => {
    const scrollContainer = enterpriseScrollRef.current
    if (!scrollContainer || !isEnterpriseDropdownOpen) return

    let scrollTimeout: NodeJS.Timeout

    const handleScroll = () => {
      // Debounce scroll events
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer
        const isNearBottom = scrollTop + clientHeight >= scrollHeight - 20 // Reduced threshold
        

        
        if (isNearBottom && hasMoreEnterprises && !isLoadingEnterprises) {

          loadMoreEnterprises()
        }
      }, 100) // 100ms debounce
    }

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [isEnterpriseDropdownOpen, hasMoreEnterprises, isLoadingEnterprises, loadMoreEnterprises])

  // Show shimmer during initial loading
  if (isInitialLoading) {
    return (
      <div className={`flex items-center gap-4 flex-wrap ${className}`}>
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground whitespace-nowrap">Enterprise:</span>
          <Skeleton className="w-48 h-9" />
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground whitespace-nowrap">Team:</span>
          <Skeleton className="w-48 h-9" />
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-4 flex-wrap ${className}`}>
      {/* Enterprise Selector */}
      <div className="flex items-center gap-2 min-w-0">
        <Building2 className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground whitespace-nowrap">Enterprise:</span>
        <Popover 
          open={isEnterpriseDropdownOpen} 
          onOpenChange={(open) => {
            setIsEnterpriseDropdownOpen(open)
            if (open) {
              // Always clear search when dropdown opens to show full list
              setLocalEnterpriseSearchTerm("")
              setIsSearchingEnterprises(false)
              // Always reload all enterprises when opening to ensure all are visible
              clearSearchAndReload()
            } else {
              // Clear local search when dropdown closes
              setLocalEnterpriseSearchTerm("")
              setIsSearchingEnterprises(false)
            }
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isEnterpriseDropdownOpen}
              className="w-48 justify-between"
              disabled={isLoadingEnterprises}
            >
              {selectedEnterprise ? (
                <span className="truncate">{selectedEnterprise.name}</span>
              ) : (
                <span className="text-muted-foreground">
                  {isLoadingEnterprises ? "Loading..." : "Select enterprise"}
                </span>
              )}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-0">
            <Command key={isEnterpriseDropdownOpen ? 'open' : 'closed'} shouldFilter={false}>
              <CommandInput 
                placeholder="Search enterprises..." 
                value={localEnterpriseSearchTerm}
                onValueChange={handleEnterpriseSearch}
              />
              <CommandList>
                <CommandEmpty>
                  {isLoadingEnterprises || isSearchingEnterprises ? "Loading enterprises..." : "No enterprises found."}
                </CommandEmpty>
                <CommandGroup>
                  <div 
                    ref={enterpriseScrollRef}
                    className="max-h-60 overflow-y-auto"
                  >
                    {enterprises.map((enterprise) => (
                      <CommandItem
                        key={enterprise.id || enterprise.enterpriseId}
                        value={enterprise.name}
                        onSelect={() => {
                          setSelectedEnterprise(enterprise)
                          setIsEnterpriseDropdownOpen(false)
                          setLocalEnterpriseSearchTerm("")
                          setIsSearchingEnterprises(false)
                          // Clear the backend search term as well
                          searchEnterprises("")
                        }}
                      >
                        <div className="flex items-center gap-2 w-full min-w-0">
                          <Building2 className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate flex-1 text-left">{enterprise.name}</span>
                        </div>
                      </CommandItem>
                    ))}
                    
                    {/* Loading indicator for infinite scroll */}
                    {isLoadingEnterprises && (
                      <div className="px-2 py-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="w-4 h-4" />
                          <Skeleton className="w-32 h-4" />
                        </div>
                      </div>
                    )}
                    
                    {/* Error state */}
                    {enterprisesError && (
                      <div className="px-2 py-2 text-sm text-destructive">
                        {enterprisesError}
                      </div>
                    )}
                    
                    {/* Show total count when all loaded */}
                    {!hasMoreEnterprises && enterprises.length > 0 && !isLoadingEnterprises && (
                      <div className="px-2 py-1 text-xs text-muted-foreground text-center border-t">
                        {enterprises.length} enterprises
                      </div>
                    )}
                  </div>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Team Selector */}
      <div className="flex items-center gap-2 min-w-0">
        <Users className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground whitespace-nowrap">Team:</span>
        <Popover open={isTeamDropdownOpen} onOpenChange={setIsTeamDropdownOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isTeamDropdownOpen}
              className="w-48 justify-between"
              disabled={!selectedEnterprise || isLoadingTeams}
            >
              {selectedTeam ? (
                <div className="flex items-center gap-2 w-full min-w-0">
                  <span className="truncate">{selectedTeam.team_name}</span>
                  {selectedTeam.is_default && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded">Default</span>
                  )}
                </div>
              ) : (
                <span className="text-muted-foreground">
                  {!selectedEnterprise 
                    ? "Select enterprise first"
                    : isLoadingTeams 
                    ? "Loading teams..." 
                    : "Select team"}
                </span>
              )}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-0">
            <Command>
              <CommandInput 
                placeholder="Search teams..." 
                value={teamSearchTerm}
                onValueChange={setTeamSearchTerm}
                disabled={!selectedEnterprise}
              />
              <CommandList>
                <CommandEmpty>
                  {!selectedEnterprise ? "Select an enterprise first" : "No teams found."}
                </CommandEmpty>
                <CommandGroup>
                  <div className="max-h-60 overflow-y-auto">
                    {isLoadingTeams ? (
                      <div className="px-2 py-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="w-4 h-4" />
                          <Skeleton className="w-32 h-4" />
                        </div>
                      </div>
                    ) : teamsError ? (
                      <div className="px-2 py-2 text-sm text-destructive">
                        {teamsError}
                      </div>
                    ) : filteredTeams.length === 0 ? (
                      <div className="px-2 py-2 text-sm text-muted-foreground">
                        {teams.length === 0 ? "No teams available" : "No teams match your search"}
                      </div>
                    ) : (
                      filteredTeams.map((team) => (
                        <CommandItem
                          key={team.team_id}
                          value={team.team_name}
                          onSelect={() => {
                            setSelectedTeam(team)
                            setIsTeamDropdownOpen(false)
                            setTeamSearchTerm("")
                          }}
                        >
                          <div className="flex items-center justify-between w-full min-w-0">
                            <div className="flex items-center gap-2 min-w-0">
                              <Users className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{team.team_name}</span>
                            </div>
                            {team.is_default && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded ml-2">
                                Default
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      ))
                    )}
                  </div>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
