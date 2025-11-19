import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [showWelcome, setShowWelcome] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem('stupad_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const signup = (userData) => {
    // Generate a unique ID for the user
    const newUser = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      studyStats: {
        totalHours: 0,
        weeklyHours: [0, 0, 0, 0, 0, 0, 0], // 7 days
        sessionsCompleted: 0,
        studyProgress: 0
      }
    }
    
    // Get existing users
    const existingUsers = JSON.parse(localStorage.getItem('stupad_users') || '[]')
    existingUsers.push(newUser)
    localStorage.setItem('stupad_users', JSON.stringify(existingUsers))
    
    // Set current user
    localStorage.setItem('stupad_user', JSON.stringify(newUser))
    setUser(newUser)
    setShowWelcome(true)
    return newUser
  }

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('stupad_users') || '[]')
    const foundUser = users.find(u => u.email === email && u.password === password)
    
    if (foundUser) {
      localStorage.setItem('stupad_user', JSON.stringify(foundUser))
      setUser(foundUser)
      setShowWelcome(true)
      return foundUser
    }
    return null
  }

  const logout = () => {
    localStorage.removeItem('stupad_user')
    setUser(null)
    setShowWelcome(false)
  }

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData }
    localStorage.setItem('stupad_user', JSON.stringify(updatedUser))
    
    // Update in users list
    const users = JSON.parse(localStorage.getItem('stupad_users') || '[]')
    const userIndex = users.findIndex(u => u.id === user.id)
    if (userIndex !== -1) {
      users[userIndex] = updatedUser
      localStorage.setItem('stupad_users', JSON.stringify(users))
    }
    
    setUser(updatedUser)
  }

  const updateStudyStats = (stats) => {
    updateUser({
      studyStats: {
        ...user.studyStats,
        ...stats
      }
    })
  }

  const value = {
    user,
    signup,
    login,
    logout,
    updateUser,
    updateStudyStats,
    showWelcome,
    setShowWelcome,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

