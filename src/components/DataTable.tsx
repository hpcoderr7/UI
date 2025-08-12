import React from 'react'
import { motion } from 'framer-motion'

interface DataTableProps {
  data: any[]
  columns: string[]
  maxRows?: number
}

const DataTable: React.FC<DataTableProps> = ({ data, columns, maxRows = 10 }) => {
  const displayData = maxRows ? data.slice(0, maxRows) : data

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-slate-200">
            {columns.map((column, index) => (
              <motion.th
                key={column}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="text-left p-4 font-semibold text-slate-800 bg-slate-50 first:rounded-tl-lg last:rounded-tr-lg"
              >
                {column}
              </motion.th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayData.map((row, rowIndex) => (
            <motion.tr
              key={rowIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: rowIndex * 0.05 }}
              className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
            >
              {columns.map((column) => (
                <td key={column} className="p-4 text-slate-700">
                  {row[column] !== null && row[column] !== undefined ? (
                    row[column].toString()
                  ) : (
                    <span className="text-slate-400 italic">null</span>
                  )}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
      
      {data.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No data available
        </div>
      )}
    </div>
  )
}

export default DataTable