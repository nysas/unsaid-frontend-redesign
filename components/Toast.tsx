"use client";
import { AnimatePresence, motion } from "framer-motion";

export default function Toast({
  message,
  show,
}: {
  message: string;
  show: boolean;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 border border-border-strong bg-surface px-5 py-3 text-sm text-ink shadow-sm"
          role="status"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
