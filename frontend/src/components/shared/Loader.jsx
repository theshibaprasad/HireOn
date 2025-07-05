// src/components/Loader.jsx
import React from 'react'
import { motion } from 'framer-motion'

const Loader = () => {
  return (
    <motion.div
      className="fixed inset-0 bg-black flex items-center justify-center z-[9999]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
    >
      <motion.h1
        className="text-white text-5xl font-bold"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 1 }}
      >
        Empowering Careers with <span className="text-[#6A38C2]">HireOn</span>
      </motion.h1>
    </motion.div>
  )
} 

export default Loader
