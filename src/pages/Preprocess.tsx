import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Settings, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle, 
  Copy, 
  Trash2,
  RefreshCw,
  Download,
  BarChart3,
  Info,
  X
} from 'lucide-react'
import { useData } from '../context/DataContext'

interface MissingInfo {
  [column: string]: number
}

interface PreprocessResults {
  missing_info: MissingInfo
  duplicates: number[]
}

const Preprocess = () => {
  const navigate = useNavigate()
  const { uploadedFile, preprocessResults, setPreprocessResults, isLoading, setIsLoading } = useData()
  const [processingStep, setProcessingStep] = useState<'analyzing' | 'complete' | 'error'>('analyzing')
  const [selectedAction, setSelectedAction] = useState<'remove' | 'fill' | null>(null)

  useEffect(() => {
    if (!uploadedFile) {
      navigate('/upload')
      return
    }

    runPreprocessing()
  }, [uploadedFile, navigate])

  const runPreprocessing = async () => {
    setIsLoading(true)
    setProcessingStep('analyzing')
    
    try {
      const response = await fetch('/api/preprocess')
      if (!response.ok) throw new Error('Preprocessing failed')
      
      const results = await response.json()
      setPreprocessResults(results)
      setProcessingStep('complete')
    } catch (error) {
      console.error('Preprocessing error:', error)
      setProcessingStep('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCleanData = async (action: 'remove' | 'fill') => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      
      if (!response.ok) throw new Error('Data cleaning failed')
      
      // Refresh preprocessing results
      await runPreprocessing()
    } catch (error) {
      console.error('Cleaning error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const hasMissingValues = preprocessResults?.missing_info && Object.keys(preprocessResults.missing_info).length > 0
  const hasDuplicates = preprocessResults?.duplicates && preprocessResults.duplicates.length > 0
  const isDataClean = !hasMissingValues && !hasDuplicates

  if (processingStep === 'analyzing') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative mb-8">
            <div className="w-24 h-24 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
            <Settings className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Analyzing Your Data</h2>
          <p className="text-slate-600">Checking for missing values and duplicates...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 gradient-text">
                Data Preprocessing
              </h1>
              <p className="text-slate-600">
                Clean and prepare your data for analysis
              </p>
            </div>
            <Link to="/preview" className="btn-secondary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Preview
            </Link>
          </div>
        </motion.div>

        {/* Status Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          <div className={`card ${isDataClean ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">Data Quality</h3>
                <p className={`text-sm ${isDataClean ? 'text-green-600' : 'text-orange-600'}`}>
                  {isDataClean ? 'Clean' : 'Needs Attention'}
                </p>
              </div>
              {isDataClean ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              )}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">Missing Values</h3>
                <p className="text-sm text-slate-600">
                  {hasMissingValues ? Object.keys(preprocessResults.missing_info).length : 0} columns affected
                </p>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                hasMissingValues ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
              }`}>
                {hasMissingValues ? Object.values(preprocessResults.missing_info).reduce((a, b) => a + b, 0) : 0}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">Duplicate Rows</h3>
                <p className="text-sm text-slate-600">
                  {hasDuplicates ? preprocessResults.duplicates.length : 0} duplicates found
                </p>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                hasDuplicates ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
              }`}>
                {hasDuplicates ? preprocessResults.duplicates.length : 0}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Clean Data Success */}
        {isDataClean && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="card bg-gradient-to-r from-green-500 to-emerald-500 text-white mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-12 w-12 mr-4" />
                <div>
                  <h3 className="text-xl font-bold mb-1">Data is Clean! 🎉</h3>
                  <p className="opacity-90">
                    Your dataset has no missing values or duplicate entries. Ready for analysis!
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors">
                  <Download className="mr-2 h-4 w-4 inline" />
                  Export Clean Data
                </button>
                <button className="px-6 py-3 bg-white text-green-600 hover:bg-gray-50 rounded-xl font-medium transition-colors">
                  <BarChart3 className="mr-2 h-4 w-4 inline" />
                  Start Analysis
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Missing Values Section */}
        {hasMissingValues && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="card mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 text-orange-500 mr-3" />
                <h3 className="text-xl font-semibold text-slate-800">Missing Values Detected</h3>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleCleanData('fill')}
                  disabled={isLoading}
                  className="btn-secondary"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Fill Missing
                </button>
                <button
                  onClick={() => handleCleanData('remove')}
                  disabled={isLoading}
                  className="btn-primary"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Rows
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              {Object.entries(preprocessResults.missing_info).map(([column, count]) => (
                <div key={column} className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-400 rounded-full mr-3"></div>
                    <div>
                      <span className="font-medium text-slate-800">{column}</span>
                      <p className="text-sm text-slate-600">Column with missing data</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-orange-600">{count}</span>
                    <p className="text-sm text-slate-600">missing values</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Duplicates Section */}
        {hasDuplicates && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="card mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Copy className="h-6 w-6 text-red-500 mr-3" />
                <h3 className="text-xl font-semibold text-slate-800">Duplicate Rows Found</h3>
              </div>
              <button
                onClick={() => handleCleanData('remove')}
                disabled={isLoading}
                className="btn-primary"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove Duplicates
              </button>
            </div>

            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800 mb-1">
                    {preprocessResults.duplicates.length} duplicate rows detected
                  </p>
                  <p className="text-sm text-slate-600">
                    Row indices: {preprocessResults.duplicates.slice(0, 10).join(', ')}
                    {preprocessResults.duplicates.length > 10 && '...'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-red-600">
                    {preprocessResults.duplicates.length}
                  </span>
                  <p className="text-sm text-slate-600">duplicates</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex justify-center space-x-4"
        >
          <button
            onClick={runPreprocessing}
            disabled={isLoading}
            className="btn-secondary"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Re-analyze Data
          </button>
          
          {isDataClean && (
            <button className="btn-primary">
              <BarChart3 className="mr-2 h-4 w-4" />
              Continue to Analysis
            </button>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Preprocess