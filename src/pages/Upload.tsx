import React, { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { 
  Upload as UploadIcon, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  X
} from 'lucide-react'
import { useData } from '../context/DataContext'

const Upload = () => {
  const navigate = useNavigate()
  const { setUploadedFile, isLoading, setIsLoading } = useData()
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setIsLoading(true)
    setUploadStatus('idle')

    try {
      // Simulate file validation
      if (!file.name.toLowerCase().endsWith('.csv')) {
        throw new Error('Please upload a CSV file')
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('File size must be less than 10MB')
      }

      // Create FormData for upload
      const formData = new FormData()
      formData.append('file', file)

      // Upload to backend
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      setUploadedFile(file)
      setUploadStatus('success')
      
      // Navigate to preview after a short delay
      setTimeout(() => {
        navigate('/preview')
      }, 1500)

    } catch (error) {
      setUploadStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsLoading(false)
    }
  }, [setUploadedFile, setIsLoading, navigate])

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false,
    disabled: isLoading
  })

  const clearError = () => {
    setUploadStatus('idle')
    setErrorMessage('')
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 gradient-text">
            Upload Your Dataset
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Upload your CSV file to begin analyzing your data. We support files up to 10MB.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="card max-w-2xl mx-auto"
        >
          <div
            {...getRootProps()}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
              isDragActive
                ? 'border-primary-400 bg-primary-50'
                : uploadStatus === 'success'
                ? 'border-green-400 bg-green-50'
                : uploadStatus === 'error'
                ? 'border-red-400 bg-red-50'
                : 'border-slate-300 hover:border-primary-400 hover:bg-primary-50'
            } ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
          >
            <input {...getInputProps()} />
            
            {isLoading ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                <p className="text-lg font-medium text-slate-700">
                  Uploading<span className="loading-dots"></span>
                </p>
              </motion.div>
            ) : uploadStatus === 'success' ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center text-green-600"
              >
                <CheckCircle className="h-16 w-16 mb-4" />
                <p className="text-lg font-medium">Upload Successful!</p>
                <p className="text-sm text-slate-600 mt-2">Redirecting to preview...</p>
              </motion.div>
            ) : uploadStatus === 'error' ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center text-red-600"
              >
                <AlertCircle className="h-16 w-16 mb-4" />
                <p className="text-lg font-medium">Upload Failed</p>
                <p className="text-sm text-slate-600 mt-2">{errorMessage}</p>
                <button
                  onClick={clearError}
                  className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Try Again
                </button>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mb-6"
                >
                  <UploadIcon className="h-16 w-16 text-primary-500" />
                </motion.div>
                
                <h3 className="text-xl font-semibold mb-2 text-slate-800">
                  {isDragActive ? 'Drop your file here' : 'Drag & drop your CSV file'}
                </h3>
                
                <p className="text-slate-600 mb-6">
                  or <span className="text-primary-600 font-medium">browse</span> to choose a file
                </p>
                
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    CSV, XLS, XLSX
                  </div>
                  <div>Max 10MB</div>
                </div>
              </div>
            )}
          </div>

          {acceptedFiles.length > 0 && uploadStatus !== 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-slate-50 rounded-xl"
            >
              <h4 className="font-medium text-slate-800 mb-2">Selected File:</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-primary-500 mr-2" />
                  <span className="text-slate-700">{acceptedFiles[0].name}</span>
                  <span className="text-slate-500 ml-2">
                    ({(acceptedFiles[0].size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  onClick={() => acceptedFiles.splice(0, 1)}
                  className="p-1 hover:bg-slate-200 rounded"
                >
                  <X className="h-4 w-4 text-slate-500" />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Upload Tips */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 grid md:grid-cols-3 gap-6"
        >
          {[
            {
              title: 'Supported Formats',
              description: 'CSV, XLS, and XLSX files are supported for upload.',
              icon: FileText
            },
            {
              title: 'File Size Limit',
              description: 'Maximum file size is 10MB for optimal performance.',
              icon: AlertCircle
            },
            {
              title: 'Data Security',
              description: 'Your data is processed securely and never stored permanently.',
              icon: CheckCircle
            }
          ].map((tip, index) => {
            const Icon = tip.icon
            return (
              <div key={index} className="card text-center">
                <Icon className="h-8 w-8 text-primary-500 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-800 mb-2">{tip.title}</h3>
                <p className="text-sm text-slate-600">{tip.description}</p>
              </div>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}

export default Upload