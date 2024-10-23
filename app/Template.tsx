'use client'

import { AnimatePresence, motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{   duration: 0.3,   ease: 'easeInOut' }} >
            {children}
        </motion.div>
    </AnimatePresence>
    
  );
}