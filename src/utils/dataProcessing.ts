export interface DataSummary {
  totalRows: number
  totalColumns: number
  missingValues: number
  duplicateRows: number
  columnTypes: Record<string, string>
}

export const analyzeData = (data: any[]): DataSummary => {
  if (!data || data.length === 0) {
    return {
      totalRows: 0,
      totalColumns: 0,
      missingValues: 0,
      duplicateRows: 0,
      columnTypes: {}
    }
  }

  const columns = Object.keys(data[0])
  const totalRows = data.length
  const totalColumns = columns.length

  // Count missing values
  let missingValues = 0
  const columnTypes: Record<string, string> = {}

  columns.forEach(column => {
    let nullCount = 0
    let numberCount = 0
    let dateCount = 0
    
    data.forEach(row => {
      const value = row[column]
      if (value === null || value === undefined || value === '') {
        nullCount++
        missingValues++
      } else if (!isNaN(Number(value))) {
        numberCount++
      } else if (isValidDate(value)) {
        dateCount++
      }
    })

    // Determine column type
    if (numberCount > totalRows * 0.8) {
      columnTypes[column] = 'number'
    } else if (dateCount > totalRows * 0.8) {
      columnTypes[column] = 'date'
    } else {
      columnTypes[column] = 'text'
    }
  })

  // Count duplicate rows (simplified)
  const uniqueRows = new Set(data.map(row => JSON.stringify(row)))
  const duplicateRows = totalRows - uniqueRows.size

  return {
    totalRows,
    totalColumns,
    missingValues,
    duplicateRows,
    columnTypes
  }
}

const isValidDate = (value: any): boolean => {
  const date = new Date(value)
  return date instanceof Date && !isNaN(date.getTime())
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const generateSampleData = (rows: number = 100): any[] => {
  const sampleData = []
  const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry']
  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance']
  
  for (let i = 0; i < rows; i++) {
    sampleData.push({
      id: i + 1,
      name: names[Math.floor(Math.random() * names.length)],
      department: departments[Math.floor(Math.random() * departments.length)],
      salary: Math.floor(Math.random() * 100000) + 30000,
      age: Math.floor(Math.random() * 40) + 22,
      joinDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toISOString().split('T')[0]
    })
  }
  
  return sampleData
}