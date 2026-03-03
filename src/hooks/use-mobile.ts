/**
 * Mobile Detection Hook
 * 
 * Custom React hook to detect if the user is on a mobile device.
 * Uses window.matchMedia API for responsive breakpoint detection.
 * 
 * Features:
 * - Detects screen width below 768px (mobile breakpoint)
 * - Listens for window resize events
 * - Updates state when screen size changes
 * - SSR-safe (returns undefined initially)
 * - Cleans up event listeners on unmount
 * 
 * Breakpoint:
 * - MOBILE_BREAKPOINT = 768px (Tailwind's md breakpoint)
 * - Mobile: < 768px
 * - Desktop: >= 768px
 * 
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const isMobile = useIsMobile();
 *   
 *   return (
 *     <div>
 *       {isMobile ? <MobileView /> : <DesktopView />}
 *     </div>
 *   );
 * }
 * ```
 * 
 * SSR Considerations:
 * - Initial value is undefined (window not available on server)
 * - Value updates to boolean after client-side hydration
 * - Use !!isMobile to convert to boolean (false on server)
 * 
 * Performance:
 * - Uses matchMedia API (more efficient than resize events)
 * - Only updates when crossing the breakpoint
 * - Properly cleans up listeners
 * 
 * @returns boolean | undefined - true if mobile, false if desktop, undefined during SSR
 */

import * as React from "react"

// Mobile breakpoint in pixels (matches Tailwind's md breakpoint)
const MOBILE_BREAKPOINT = 768

/**
 * Hook to detect if viewport is mobile-sized
 * 
 * @returns boolean - true if screen width < 768px, false otherwise
 */
export function useIsMobile() {
  // State starts as undefined for SSR compatibility
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Create media query for mobile breakpoint
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Handler to update state when media query changes
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Listen for changes (e.g., window resize, device rotation)
    mql.addEventListener("change", onChange)
    
    // Set initial value
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Cleanup listener on unmount
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Convert undefined to false for easier usage
  return !!isMobile
}
