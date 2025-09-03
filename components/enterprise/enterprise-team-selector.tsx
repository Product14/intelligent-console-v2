"use client"

import React, { useRef, useEffect, useState } from 'react'
import { ChevronDown, Building2, Users } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
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
    setSelectedEnterprise,
    setSelectedTeam,
    loadMoreEnterprises,
  } = useEnterprise()

  const [isEnterpriseDropdownOpen, setIsEnterpriseDropdownOpen] = useState(false)
  const enterpriseScrollRef = useRef<HTMLDivElement>(null)

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
      <div className={`flex flex-col gap-4 ${className}`}>
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground w-20">Enterprise:</span>
          <Skeleton className="w-48 h-9" />
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground w-20">Team:</span>
          <Skeleton className="w-48 h-9" />
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Enterprise Selector */}
      <div className="flex items-center gap-2">
        <Building2 className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground w-20">Enterprise:</span>
        <Select
          value={selectedEnterprise?.id || selectedEnterprise?.enterpriseId || ""}
          onValueChange={(value) => {
            const enterprise = enterprises.find(e => e.id === value || e.enterpriseId === value)
            setSelectedEnterprise(enterprise || null)
          }}
          onOpenChange={setIsEnterpriseDropdownOpen}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder={isLoadingEnterprises ? "Loading..." : "Select enterprise"}>
              <span className="truncate">{selectedEnterprise?.name}</span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="w-48">
            <div 
              ref={enterpriseScrollRef}
              className="max-h-60 overflow-y-auto"
            >
              {Array.isArray(enterprises) && enterprises.map((enterprise) => (
                <SelectItem key={enterprise.id || enterprise.enterpriseId} value={enterprise.id || enterprise.enterpriseId}>
                  <div className="flex items-center gap-2 w-full min-w-0">
                    <Building2 className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate flex-1 text-left">{enterprise.name}</span>
                  </div>
                </SelectItem>
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
              
              {/* No more data indicator */}
              {!hasMoreEnterprises && Array.isArray(enterprises) && enterprises.length > 0 && !isLoadingEnterprises && (
                <div className="px-2 py-1 text-xs text-muted-foreground text-center border-t">
                  No more enterprises
                </div>
              )}
            </div>
          </SelectContent>
        </Select>
      </div>

      {/* Team Selector */}
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground w-20">Team:</span>
        <Select
          value={selectedTeam?.team_id || ""}
          onValueChange={(value) => {
            const team = teams.find(t => t.team_id === value)
            setSelectedTeam(team || null)
          }}
          disabled={!selectedEnterprise || isLoadingTeams}
          key={`team-select-${selectedEnterprise?.id || selectedEnterprise?.enterpriseId}`}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder={
              !selectedEnterprise 
                ? "Select enterprise first"
                : isLoadingTeams 
                ? "Loading teams..." 
                : "Select team"
            }>
              <span className="truncate">{selectedTeam?.team_name}</span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="w-48">
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
              ) : !Array.isArray(teams) || teams.length === 0 ? (
                <div className="px-2 py-2 text-sm text-muted-foreground">
                  No teams available
                </div>
              ) : (
                teams.map((team) => (
                  <SelectItem key={team.team_id} value={team.team_id}>
                    <div className="flex items-center gap-2 w-full min-w-0">
                      <Users className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate flex-1 text-left">{team.team_name}</span>
                    </div>
                  </SelectItem>
                ))
              )}
            </div>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
