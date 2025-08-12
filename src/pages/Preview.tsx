import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Eye, 
  ArrowLeft, 
  ArrowRight, 
  Settings, 
  Download,
  Info,
  Table,
  Hash,
  Type,
  Calendar
} from 'lucide-react'
import { useData } from '../context/DataContext'

interface ColumnInfo {
  name: string
  dtype: string
  sample_values?: any[]
  null_count?: number
}

interface PreviewData {
  data: any[]
  columns: ColumnInfo[]
  total_rows: number
  start: number
  end: number
}

const Preview = () => {
  const navigate = useNavigate()
  const { uploadedFile, previewData, setPreviewData, isLoading, setIsLoading } = useData()
  const [currentRange, setCurrentRange] = useState({ start: 0, end: 100 })
  const [customRange, setCustomRange] = useState({ start: '', end: '' })

  useEffect(() => {
    if (!uploadedFile) {
      navigate('/upload')
      return
    }

    loadPreview(0, 100)
  }, [uploadedFile, navigate])

  const loadPreview = async (start: number, end: number) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/upload?start=${start}&end=${end}`)
      if (!response.ok) throw new Error('Failed to load preview')
      
      const data = await response.json()
      setPreviewData(data)
      setCurrentRange({ start, end })
    } catch (error) {
      console.error('Preview error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRangeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const start = parseInt(customRange.start) || 0
    const end = parseInt(customRange.end) || start + 100
    loadPreview(start, end)
  }

  const getColumnIcon = (dtype: string) => {
    if (dtype.includes('int') || dtype.includes('float')) return Hash
    if (dtype.includes('datetime')) return Calendar
    return Type
  }

  const getColumnColor = (dtype: string) => {
    if (dtype.includes('int') || dtype.includes('float')) return 'text-blue-600 bg-blue-100'
    if (dtype.includes('datetime')) return 'text-green-600 bg-green-100'
    return 'text-purple-600 bg-purple-100'
  }

  if (!previewData && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-slate-700">Loading preview...</p>
        </div>
      </div>
    )
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
                Dataset Preview
              </h1>
              <p className="text-slate-600">
                Explore your data structure and content
              </p>
            </div>
            <Link to="/upload" className="btn-secondary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Upload
            </Link>
          </div>

          {/* File Info */}
          <div className="card mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary-100 rounded-xl">
                  <Eye className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">
                    {uploadedFile?.name}
                  </h3>
                  <p className="text-slate-600">
                    {previewData?.total_rows} rows • {previewData?.columns?.length} columns
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="btn-secondary">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </button>
                <Link to="/preprocess" className="btn-primary">
                  <Settings className="mr-2 h-4 w-4" />
                  Preprocess
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Range Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Data Range</h3>
            <div className="text-sm text-slate-600">
              Showing rows {currentRange.start + 1} - {Math.min(currentRange.end, previewData?.total_rows || 0)}
            </div>
          </div>
          
          <form onSubmit={handleRangeSubmit} className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-slate-700">Start:</label>
              <input
                type="number"
                value={customRange.start}
                onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                placeholder={currentRange.start.toString()}
                min="0"
                className="w-20 px-3 py-2 border border-slate-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-slate-700">End:</label>
              <input
                type="number"
                value={customRange.end}
                onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                placeholder={currentRange.end.toString()}
                min="1"
                className="w-20 px-3 py-2 border border-slate-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? 'Loading...' : 'Load Range'}
            </button>
          </form>
        </motion.div>

        {/* Column Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="card mb-6"
        >
          <div className="flex items-center mb-4">
            <Info className="h-5 w-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-slate-800">Column Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {previewData?.columns?.map((column, index) => {
              const Icon = getColumnIcon(column.dtype)
              const colorClass = getColumnColor(column.dtype)
              
              return (
                <div key={index} className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${colorClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="ml-2 font-medium text-slate-800">
                        {column.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600">
                    Type: <span className="font-medium">{column.dtype}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center mb-4">
            <Table className="h-5 w-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-slate-800">Data Preview</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  {previewData?.columns?.map((column, index) => (
                    <th key={index} className="text-left p-3 font-semibold text-slate-800 bg-slate-50">
                      {column.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData?.data?.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-slate-100 hover:bg-slate-50">
                    {Object.values(row).map((value: any, cellIndex) => (
                      <td key={cellIndex} className="p-3 text-slate-700">
                        {value !== null && value !== undefined ? value.toString() : (
                          <span className="text-slate-400 italic">null</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {previewData?.data?.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No data available in the selected range
            </div>
          )}
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex justify-center mt-8"
        >
          <Link to="/preprocess" className="btn-primary">
            Continue to Preprocessing
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default Preview