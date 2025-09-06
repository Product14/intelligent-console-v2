"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Enterprise, Team, enterpriseApiService } from './enterprise-api'
import { useToast } from '@/hooks/use-toast'

interface EnterpriseContextType {
  // Data
  enterprises: Enterprise[]
  teams: Team[]
  selectedEnterprise: Enterprise | null
  selectedTeam: Team | null
  
  // Loading states
  isLoadingEnterprises: boolean
  isLoadingTeams: boolean
  isInitialLoading: boolean
  
  // Error states
  enterprisesError: string | null
  teamsError: string | null
  
  // Pagination for enterprises
      enterprisePage: number
    hasMoreEnterprises: boolean
    
    // Search
    enterpriseSearchTerm: string
    
    // Actions
  setSelectedEnterprise: (enterprise: Enterprise | null) => void
  setSelectedTeam: (team: Team | null) => void
  loadMoreEnterprises: () => Promise<void>
      refreshEnterprises: () => Promise<void>
    refreshTeams: () => Promise<void>
    searchEnterprises: (searchTerm: string) => Promise<void>
    clearSearchAndReload: () => Promise<void>
    clearSavedSelections: () => void
  }

const EnterpriseContext = createContext<EnterpriseContextType | undefined>(undefined)

interface EnterpriseProviderProps {
  children: ReactNode
}

export function EnterpriseProvider({ children }: EnterpriseProviderProps) {
  const { toast } = useToast()
  
  // Data state
  const [enterprises, setEnterprises] = useState<Enterprise[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedEnterprise, setSelectedEnterpriseState] = useState<Enterprise | null>(null)
  const [selectedTeam, setSelectedTeamState] = useState<Team | null>(null)
  
  // Loading states
  const [isLoadingEnterprises, setIsLoadingEnterprises] = useState(false)
  const [isLoadingTeams, setIsLoadingTeams] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  
  // Error states
  const [enterprisesError, setEnterprisesError] = useState<string | null>(null)
  const [teamsError, setTeamsError] = useState<string | null>(null)
  
  // Pagination and search
  const [enterprisePage, setEnterprisePage] = useState(1)
  const [hasMoreEnterprises, setHasMoreEnterprises] = useState(true)
  const [enterpriseSearchTerm, setEnterpriseSearchTerm] = useState("")

  // Persistence functions
  const saveSelectedEnterprise = (enterprise: Enterprise | null) => {
    if (typeof window !== 'undefined') {
      if (enterprise) {
        localStorage.setItem('qa_dashboard_selected_enterprise', JSON.stringify(enterprise))
      } else {
        localStorage.removeItem('qa_dashboard_selected_enterprise')
      }
    }
  }

  const saveSelectedTeam = (team: Team | null) => {
    if (typeof window !== 'undefined') {
      if (team) {
        localStorage.setItem('qa_dashboard_selected_team', JSON.stringify(team))
      } else {
        localStorage.removeItem('qa_dashboard_selected_team')
      }
    }
  }

  const loadSelectedEnterprise = (): Enterprise | null => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('qa_dashboard_selected_enterprise')
        return saved ? JSON.parse(saved) : null
      } catch (error) {
        console.error('Error loading saved enterprise:', error)
        return null
      }
    }
    return null
  }

  const loadSelectedTeam = (): Team | null => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('qa_dashboard_selected_team')
        return saved ? JSON.parse(saved) : null
      } catch (error) {
        console.error('Error loading saved team:', error)
        return null
      }
    }
    return null
  }

  const clearSavedSelections = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('qa_dashboard_selected_enterprise')
      localStorage.removeItem('qa_dashboard_selected_team')
    }
  }

    // Load initial enterprises
  const loadEnterprises = async (page: number = 1, append: boolean = false, searchTerm?: string) => {
    try {
      if (page === 1) {
        setIsLoadingEnterprises(true)
      }
      setEnterprisesError(null)
      
      const response = await enterpriseApiService.getEnterprises({
        limit: 20,
        page: page,
        search: searchTerm !== undefined ? searchTerm : enterpriseSearchTerm || undefined,
      })
      
      // Extract enterprises from the nested response structure
      const rawEnterprises = response.data?.enterprises || []
      
      // Transform enterprises to add id field for compatibility
      const enterpriseData: Enterprise[] = rawEnterprises.map(enterprise => ({
        ...enterprise,
        id: enterprise.enterpriseId // Add id as alias for enterpriseId
      }))
        
        // Set the enterprises data
        if (append) {
          setEnterprises(prev => [...prev, ...enterpriseData])
        } else {
          setEnterprises(enterpriseData)
        }
        
        setEnterprisePage(page)
        
        // Calculate if there are more pages based on API pagination info
        // The pagination info is nested under data.pagination
        const paginationInfo = response.data?.pagination
        const totalCount = paginationInfo?.totalCount ?? 0
        const currentTotal = append ? enterprises.length + enterpriseData.length : enterpriseData.length
        
        // If we don't have pagination info from API, use fallback logic
        let calculatedHasMore = false
        if (paginationInfo && paginationInfo.totalCount) {
          // Use API pagination info
          calculatedHasMore = currentTotal < totalCount

        } else {
          // Fallback logic:
          // - If this is page 1 and we got exactly 20 items, assume there might be more
          // - If this is page > 1 and we got fewer than 20 items, no more pages
          // - If we got exactly 20 items on any page, assume there might be more
          if (page === 1) {
            calculatedHasMore = enterpriseData.length >= 20
          } else {
            calculatedHasMore = enterpriseData.length >= 20
          }

        }
        
        setHasMoreEnterprises(calculatedHasMore)
        

        
        // Auto-select first enterprise if none selected and we have data
        // Only do this if we don't have a saved selection (to avoid overriding restored state)
        if (page === 1 && enterpriseData.length > 0 && !selectedEnterprise && !loadSelectedEnterprise()) {
          const firstEnterprise = enterpriseData[0]
          setSelectedEnterpriseState(firstEnterprise)
          saveSelectedEnterprise(firstEnterprise)
          // Load teams for first enterprise
          await loadTeamsForEnterprise(firstEnterprise.id || firstEnterprise.enterpriseId)
        }
      
    } catch (error) {
      console.error('Error loading enterprises:', error)
      setEnterprisesError('Failed to load enterprises')
      toast({
        title: "Error Loading Enterprises",
        description: "Failed to load enterprise data. Please try again.",
        variant: "destructive",
      })
    } finally {
      if (page === 1) {
        setIsLoadingEnterprises(false)
      }
    }
  }

  // Load teams for selected enterprise
  const loadTeamsForEnterprise = async (enterpriseId: string) => {
    try {
      setIsLoadingTeams(true)
      setTeamsError(null)
      
      const { teams: teamsData, enterpriseDetails } = await enterpriseApiService.getTeamsByEnterpriseId(enterpriseId)
      

      
      // Ensure teamsData is an array
      const safeTeamsData = Array.isArray(teamsData) ? teamsData : []
      setTeams(safeTeamsData)
      
      // Auto-select default team (is_default: true) if available
      if (safeTeamsData.length > 0) {
        const defaultTeam = safeTeamsData.find(team => team.is_default === true)
        if (defaultTeam) {
          setSelectedTeamState(defaultTeam)
          saveSelectedTeam(defaultTeam)
        } else {
          // Fallback to first team if no default team found
          setSelectedTeamState(safeTeamsData[0])
          saveSelectedTeam(safeTeamsData[0])
        }
      }
      
    } catch (error) {
      console.error('Error loading teams:', error)
      setTeamsError('Failed to load teams')
      toast({
        title: "Error Loading Teams",
        description: "Failed to load team data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingTeams(false)
    }
  }

  // Load more enterprises (infinite scroll)
  const loadMoreEnterprises = async () => {
    if (!hasMoreEnterprises || isLoadingEnterprises) {
      return
    }
    
    const nextPage = enterprisePage + 1
    
    try {
      await loadEnterprises(nextPage, true)
    } catch (error) {
      console.error('Error loading more enterprises:', error)
      // If loading fails and we get less than 20 items, assume no more pages
      setHasMoreEnterprises(false)
    }
  }

  // Refresh functions
  const refreshEnterprises = async () => {
    setEnterprisePage(1)
    await loadEnterprises(1, false)
  }

  const refreshTeams = async () => {
    if (selectedEnterprise) {
      await loadTeamsForEnterprise(selectedEnterprise.id || selectedEnterprise.enterpriseId)
    }
  }

  // Search enterprises
  const searchEnterprises = async (searchTerm: string) => {
    setEnterpriseSearchTerm(searchTerm)
    setEnterprisePage(1)
    setHasMoreEnterprises(true)
    await loadEnterprises(1, false, searchTerm)
  }

  // Clear search and reload full list
  const clearSearchAndReload = async () => {
    console.log('[Enterprise Context] Clearing search and reloading full list')
    // Clear the search term first
    setEnterpriseSearchTerm("")
    setEnterprisePage(1)
    setHasMoreEnterprises(true)
    // Clear existing enterprises to show loading state
    setEnterprises([])
    // Load full list without any search term
    await loadEnterprises(1, false, "")
  }

  // Handle enterprise selection change
  const setSelectedEnterprise = async (enterprise: Enterprise | null) => {
    setSelectedEnterpriseState(enterprise)
    saveSelectedEnterprise(enterprise)
    setSelectedTeamState(null) // Reset team selection
    saveSelectedTeam(null) // Clear saved team
    setTeams([]) // Clear teams
    
    if (enterprise) {
      await loadTeamsForEnterprise(enterprise.id || enterprise.enterpriseId)
    }
  }

  // Handle team selection change
  const setSelectedTeam = (team: Team | null) => {
    setSelectedTeamState(team)
    saveSelectedTeam(team)
  }

  // Extract and store auth token from URL parameters on initial load
  useEffect(() => {
    const extractAuthToken = () => {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search)
        const tokenFromUrl = urlParams.get('auth_key') || urlParams.get('bearerToken') || urlParams.get('token')
        
        if (tokenFromUrl) {
          // Clean the token - remove any existing "Bearer " prefix to prevent duplication
          const cleanToken = tokenFromUrl.startsWith('Bearer ') 
            ? tokenFromUrl.substring(7) 
            : tokenFromUrl
          
          // Store in localStorage for future use
          localStorage.setItem('qa_dashboard_token', cleanToken)
          console.log('Auth token extracted from URL and stored:', cleanToken.substring(0, 20) + '...')
        }
      }
    }
    
    extractAuthToken()
  }, [])

  // Initial data load
  useEffect(() => {
    const initializeData = async () => {
      setIsInitialLoading(true)
      
      try {
        // Load enterprises first
        await loadEnterprises(1, false)
        
        // Try to restore saved selections
        const savedEnterprise = loadSelectedEnterprise()
        const savedTeam = loadSelectedTeam()
        
        if (savedEnterprise) {
          console.log('[Enterprise Context] Restoring saved enterprise:', savedEnterprise.name)
          setSelectedEnterpriseState(savedEnterprise)
          
          // Load teams for the saved enterprise
          await loadTeamsForEnterprise(savedEnterprise.id || savedEnterprise.enterpriseId)
          
          // Restore saved team if it exists and belongs to the saved enterprise
          if (savedTeam) {
            console.log('[Enterprise Context] Restoring saved team:', savedTeam.team_name)
            setSelectedTeamState(savedTeam)
          }
        }
      } catch (error) {
        console.error('Failed to initialize enterprise data:', error)
      } finally {
        setIsInitialLoading(false)
      }
    }
    
    initializeData()
  }, [])

  const value: EnterpriseContextType = {
    // Data
    enterprises,
    teams,
    selectedEnterprise,
    selectedTeam,
    
    // Loading states
    isLoadingEnterprises,
    isLoadingTeams,
    isInitialLoading,
    
    // Error states
    enterprisesError,
    teamsError,
    
    // Pagination
    enterprisePage,
    hasMoreEnterprises,
    
    // Search
    enterpriseSearchTerm,
    
    // Actions
    setSelectedEnterprise,
    setSelectedTeam,
    loadMoreEnterprises,
    refreshEnterprises,
    refreshTeams,
    searchEnterprises,
    clearSearchAndReload,
    clearSavedSelections,
  }

  return (
    <EnterpriseContext.Provider value={value}>
      {children}
    </EnterpriseContext.Provider>
  )
}

export function useEnterprise() {
  const context = useContext(EnterpriseContext)
  if (context === undefined) {
    throw new Error('useEnterprise must be used within an EnterpriseProvider')
  }
  return context
}
