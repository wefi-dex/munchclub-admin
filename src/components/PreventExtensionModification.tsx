'use client'

import { useEffect } from 'react'

export function PreventExtensionModification() {
  useEffect(() => {
    // Only remove browser extension classes, don't modify other styles
    const removeExtensionClasses = () => {
      // Remove only browser extension classes
      const elements = document.querySelectorAll('[class*="gb-"], [class*="grammarly"]')
      elements.forEach(element => {
        const classList = Array.from(element.classList)
        classList.forEach(className => {
          if (className.includes('gb-') || className.includes('grammarly')) {
            element.classList.remove(className)
          }
        })
      })
    }

    // Run immediately
    removeExtensionClasses()

    // Set up a MutationObserver to watch for new extension classes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target as Element
          if (target.classList) {
            const classList = Array.from(target.classList)
            classList.forEach(className => {
              if (className.includes('gb-') || className.includes('grammarly')) {
                target.classList.remove(className)
              }
            })
          }
        }
      })
    })

    // Start observing
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
      subtree: true
    })

    // Cleanup
    return () => {
      observer.disconnect()
    }
  }, [])

  return null
}
