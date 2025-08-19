import React, { createContext, useContext, useState, ReactNode } from 'react'

interface NavigationContextType {
  isTabBarVisible: boolean
  setTabBarVisible: (visible: boolean) => void
  hideTabBar: () => void
  showTabBar: () => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

interface NavigationProviderProps {
  children: ReactNode
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [isTabBarVisible, setIsTabBarVisible] = useState(true)

  const setTabBarVisible = (visible: boolean) => {
    setIsTabBarVisible(visible)
  }

  const hideTabBar = () => {
    setIsTabBarVisible(false)
  }

  const showTabBar = () => {
    setIsTabBarVisible(true)
  }

  const value: NavigationContextType = {
    isTabBarVisible,
    setTabBarVisible,
    hideTabBar,
    showTabBar
  }

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}