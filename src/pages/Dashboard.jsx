import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import Navigation from '../components/Navigation'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import '../styles/Dashboard.css'

function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [recommendations, setRecommendations] = useState([])

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  useEffect(() => {
    // Load recommendations
    const loadRecommendations = async () => {
      try {
        const { loadDataset, getDatasetUsers } = await import('../utils/datasetLoader')
        const { getRecommendations } = await import('../utils/recommendationEngine')
        
        await loadDataset()
        const allUsers = [
          ...getDatasetUsers(),
          ...JSON.parse(localStorage.getItem('stupad_users') || '[]')
        ]
        
        const recs = getRecommendations(user, allUsers, 3)
        setRecommendations(recs)
      } catch (error) {
        console.error('Error loading recommendations:', error)
      }
    }
    
    if (user) {
      loadRecommendations()
    }
  }, [user])

  if (!user) return null

  const stats = user.studyStats || {
    totalHours: 0,
    weeklyHours: [0, 0, 0, 0, 0, 0, 0],
    sessionsCompleted: 0,
    studyProgress: 0
  }

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const weeklyData = weekDays.map((day, index) => ({
    name: day,
    hours: stats.weeklyHours[index] || 0
  }))

  const progressData = [
    { name: 'Completed', value: stats.studyProgress },
    { name: 'Remaining', value: 100 - stats.studyProgress }
  ]

  const COLORS = ['#FF6B35', '#FFD93D', '#4ECDC4', '#FF8C61', '#6EDDD6']

  const statCards = [
    {
      title: 'Total Study Hours',
      value: stats.totalHours,
      icon: '⏱️',
      color: '#FF6B35',
      bgColor: '#FFE5DD'
    },
    {
      title: 'Sessions Completed',
      value: stats.sessionsCompleted,
      icon: '✅',
      color: '#10B981',
      bgColor: '#D1FAE5'
    },
    {
      title: 'Study Progress',
      value: `${stats.studyProgress}%`,
      icon: '📊',
      color: '#4ECDC4',
      bgColor: '#D1F5F3'
    },
    {
      title: 'This Week',
      value: stats.weeklyHours.reduce((a, b) => a + b, 0),
      icon: '📅',
      color: '#FFD93D',
      bgColor: '#FFF9E6'
    }
  ]

  return (
    <div className="dashboard-container">
      <Navigation />
      <div className="dashboard-content">
        <motion.div
          className="dashboard-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1>Welcome back, {user.firstName}! 👋</h1>
            <p>Here's your study overview</p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="stats-grid">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              style={{ 
                '--card-color': card.color,
                '--card-bg': card.bgColor
              }}
            >
              <div className="stat-icon">{card.icon}</div>
              <div className="stat-content">
                <h3>{card.title}</h3>
                <p className="stat-value">{card.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          <motion.div
            className="chart-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2>Weekly Study Hours</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="hours" fill="#FF6B35" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            className="chart-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2>Study Progress</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={progressData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {progressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Top Recommendations Preview */}
        {recommendations.length > 0 && (
          <motion.div
            className="recommendations-preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="section-header">
              <h2>Recommended Study Partners</h2>
              <button 
                className="view-more-btn"
                onClick={() => navigate('/recommendations')}
              >
                View More →
              </button>
            </div>
            <div className="recommendations-grid">
              {recommendations.slice(0, 3).map((rec, index) => (
                <motion.div
                  key={rec.id}
                  className="recommendation-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  onClick={() => navigate(`/profile/${rec.id}`)}
                >
                  <div className="rec-avatar">
                    {rec.firstName?.[0]}{rec.lastName?.[0]}
                  </div>
                  <h3>{rec.firstName} {rec.lastName}</h3>
                  <p className="rec-university">{rec.university || 'Student'}</p>
                  <div className="rec-match-score">
                    <span className="match-label">Match Score</span>
                    <span className="match-value">{rec.matchScore}%</span>
                  </div>
                  {rec.csInterests && (
                    <div className="rec-interests">
                      {rec.csInterests.split(',').slice(0, 2).map((interest, i) => (
                        <span key={i} className="interest-tag">
                          {interest.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

