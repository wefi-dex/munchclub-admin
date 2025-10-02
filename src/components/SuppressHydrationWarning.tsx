'use client'

import { useEffect } from 'react'

export function SuppressHydrationWarning() {
  useEffect(() => {
    // Suppress hydration warnings caused by browser extensions
    const originalError = console.error
    console.error = (...args) => {
      const message = args[0]
      if (
        typeof message === 'string' &&
        (message.includes('hydration') || 
         message.includes('server rendered HTML') ||
         message.includes('gb-body') ||
         message.includes('gb-blur'))
      ) {
        // Suppress these specific hydration warnings
        return
      }
      originalError.apply(console, args)
    }

    // Restore original console.error on cleanup
    return () => {
      console.error = originalError
    }
  }, [])

  return null
}
