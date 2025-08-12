import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Upload from './pages/Upload'
import Preview from './pages/Preview'
import Preprocess from './pages/Preprocess'
import Visualize from './pages/Visualize'
import { DataProvider } from './context/DataContext'

function App() {
  return (
    <DataProvider>
      <div className="min-h-screen">
        <Navbar />
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="pt-20"
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/preview" element={<Preview />} />
            <Route path="/preprocess" element={<Preprocess />} />
            <Route path="/visualize" element={<Visualize />} />
          </Routes>
        </motion.main>
      </div>
    </DataProvider>
  )
}

export default App