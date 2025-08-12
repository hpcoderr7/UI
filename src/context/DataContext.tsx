import React, { createContext, useContext, useState, ReactNode } from 'react'

interface DataContextType {
  uploadedFile: File | null
  setUploadedFile: (file: File | null) => void
  previewData: any
  setPreviewData: (data: any) => void
  preprocessResults: any
  setPreprocessResults: (results: any) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const useData = () => {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

interface DataProviderProps {
  children: ReactNode
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<any>(null)
  const [preprocessResults, setPreprocessResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <DataContext.Provider
      value={{
        uploadedFile,
        setUploadedFile,
        previewData,
        setPreviewData,
        preprocessResults,
        setPreprocessResults,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}