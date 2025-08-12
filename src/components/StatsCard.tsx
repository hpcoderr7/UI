import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  color?: 'blue' | 'green' | 'red' | 'orange' | 'purple'
  trend?: 'up' | 'down' | 'neutral'
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  color = 'blue',
  trend = 'neutral'
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    red: 'from-red-500 to-pink-500',
    orange: 'from-orange-500 to-yellow-500',
    purple: 'from-purple-500 to-indigo-500'
  }

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-slate-600'
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 bg-gradient-to-r ${colorClasses[color]} rounded-xl`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend !== 'neutral' && (
          <div className={`text-sm font-medium ${trendColors[trend]}`}>
            {trend === 'up' ? '↗' : '↘'}
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-slate-800 mb-1">
          {value}
        </h3>
        <p className="text-slate-600 font-medium mb-1">
          {title}
        </p>
        {description && (
          <p className="text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>
    </motion.div>
  )
}

export default StatsCard