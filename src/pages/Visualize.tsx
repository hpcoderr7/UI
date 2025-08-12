import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  ArrowLeft,
  Download,
  Settings,
  TrendingUp,
  Eye
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  LineChart as RechartsLineChart,
  Line
} from 'recharts'
import { useData } from '../context/DataContext'

const Visualize = () => {
  const navigate = useNavigate()
  const { uploadedFile, previewData } = useData()
  const [selectedChart, setSelectedChart] = useState<'bar' | 'pie' | 'line'>('bar')
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])

  useEffect(() => {
    if (!uploadedFile) {
      navigate('/upload')
    }
  }, [uploadedFile, navigate])

  const chartTypes = [
    { type: 'bar' as const, icon: BarChart3, label: 'Bar Chart', color: 'from-blue-500 to-cyan-500' },
    { type: 'pie' as const, icon: PieChart, label: 'Pie Chart', color: 'from-purple-500 to-pink-500' },
    { type: 'line' as const, icon: LineChart, label: 'Line Chart', color: 'from-green-500 to-emerald-500' }
  ]

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

  const renderChart = () => {
    if (!previewData?.data || selectedColumns.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-slate-500">
          Select columns to generate visualization
        </div>
      )
    }

    const data = previewData.data.slice(0, 20) // Limit for demo

    switch (selectedChart) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={selectedColumns[0]} />
              <YAxis />
              <Tooltip />
              <Legend />
              {selectedColumns.slice(1).map((column, index) => (
                <Bar key={column} dataKey={column} fill={COLORS[index % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )
      
      case 'pie':
        const pieData = data.slice(0, 6).map((item, index) => ({
          name: item[selectedColumns[0]],
          value: Number(item[selectedColumns[1]]) || 0,
          fill: COLORS[index % COLORS.length]
        }))
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsPieChart>
              <RechartsPieChart data={pieData} cx="50%" cy="50%" outerRadius={120}>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </RechartsPieChart>
              <Tooltip />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        )
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsLineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={selectedColumns[0]} />
              <YAxis />
              <Tooltip />
              <Legend />
              {selectedColumns.slice(1).map((column, index) => (
                <Line 
                  key={column} 
                  type="monotone" 
                  dataKey={column} 
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 gradient-text">
                Data Visualization
              </h1>
              <p className="text-slate-600">
                Create beautiful charts and graphs from your data
              </p>
            </div>
            <Link to="/preprocess" className="btn-secondary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Preprocessing
            </Link>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Controls Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="card mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Chart Type</h3>
              <div className="space-y-3">
                {chartTypes.map((chart) => {
                  const Icon = chart.icon
                  return (
                    <button
                      key={chart.type}
                      onClick={() => setSelectedChart(chart.type)}
                      className={`w-full flex items-center p-3 rounded-xl transition-all ${
                        selectedChart === chart.type
                          ? 'bg-primary-100 border-2 border-primary-300'
                          : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent'
                      }`}
                    >
                      <div className={`p-2 bg-gradient-to-r ${chart.color} rounded-lg mr-3`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium text-slate-800">{chart.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Select Columns</h3>
              <div className="space-y-2">
                {previewData?.columns?.map((column) => (
                  <label key={column.name} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(column.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedColumns([...selectedColumns, column.name])
                        } else {
                          setSelectedColumns(selectedColumns.filter(col => col !== column.name))
                        }
                      }}
                      className="mr-3 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-slate-700">{column.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Chart Area */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-3"
          >
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-800">
                  {chartTypes.find(c => c.type === selectedChart)?.label}
                </h3>
                <div className="flex space-x-2">
                  <button className="btn-secondary">
                    <Settings className="mr-2 h-4 w-4" />
                    Customize
                  </button>
                  <button className="btn-primary">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </button>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-6">
                {renderChart()}
              </div>
            </div>

            {/* Chart Insights */}
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div className="card">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <h4 className="font-semibold text-slate-800">Trend Analysis</h4>
                    <p className="text-sm text-slate-600">Positive growth detected</p>
                  </div>
                </div>
              </div>
              
              <div className="card">
                <div className="flex items-center">
                  <Eye className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <h4 className="font-semibold text-slate-800">Key Insights</h4>
                    <p className="text-sm text-slate-600">3 patterns identified</p>
                  </div>
                </div>
              </div>
              
              <div className="card">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-purple-500 mr-3" />
                  <div>
                    <h4 className="font-semibold text-slate-800">Data Quality</h4>
                    <p className="text-sm text-slate-600">95% complete</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Visualize