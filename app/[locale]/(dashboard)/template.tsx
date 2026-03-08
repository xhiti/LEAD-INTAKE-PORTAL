'use client'

import { motion } from 'framer-motion'

export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.4,
                delay: 0.15, // Slightly more delay to ensure layout structure is solid
                ease: [0.23, 1, 0.32, 1]
            }}
            className="h-full w-full"
        >
            {children}
        </motion.div>
    )
}
