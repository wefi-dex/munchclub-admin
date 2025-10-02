'use client'

import { useEffect } from 'react'

export function SuppressHydrationWarning() {
  useEffect(() => {
    // Suppress ALL hydration warnings
    const originalError = console.error
    console.error = (...args) => {
      const message = args[0]
      if (
        typeof message === 'string' &&
        (message.includes('hydration') || 
         message.includes('server rendered HTML') ||
         message.includes('client properties') ||
         message.includes('gb-body') ||
         message.includes('gb-blur') ||
         message.includes('gb-') ||
         message.includes('Extra attributes from the server') ||
         message.includes('A tree hydrated but some attributes') ||
         message.includes('className') ||
         message.includes('lucide') ||
         message.includes('Warning:') ||
         message.includes('mismatch'))
      ) {
        return
      }
      originalError.apply(console, args)
    }

    // Suppress ALL console.warn messages related to hydration
    const originalWarn = console.warn
    console.warn = (...args) => {
      const message = args[0]
      if (
        typeof message === 'string' &&
        (message.includes('hydration') || 
         message.includes('gb-') ||
         message.includes('server rendered HTML') ||
         message.includes('className') ||
         message.includes('lucide') ||
         message.includes('Warning:') ||
         message.includes('mismatch'))
      ) {
        return
      }
      originalWarn.apply(console, args)
    }

    // Suppress React development warnings
    const originalWarnDev = console.warn
    console.warn = (...args) => {
      const message = args[0]
      if (
        typeof message === 'string' &&
        (message.includes('Warning: A tree hydrated but some attributes') ||
         message.includes('Warning: Extra attributes from the server') ||
         message.includes('Warning: className') ||
         message.includes('Warning: lucide') ||
         message.includes('Warning: hydration'))
      ) {
        return
      }
      originalWarnDev.apply(console, args)
    }

    // Also suppress console.log hydration messages
    const originalLog = console.log
    console.log = (...args) => {
      const message = args[0]
      if (
        typeof message === 'string' &&
        (message.includes('hydration') || 
         message.includes('gb-') ||
         message.includes('lucide') ||
         message.includes('className mismatch'))
      ) {
        return
      }
      originalLog.apply(console, args)
    }

    // Restore original console methods on cleanup
    return () => {
      console.error = originalError
      console.warn = originalWarn
      console.log = originalLog
    }
  }, [])

  return null
}
