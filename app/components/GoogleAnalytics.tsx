'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleRouteChange = () => {
      if (!(window as any).gtag) return

      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
      
      ;(window as any).gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        page_path: url,
      })
    }

    handleRouteChange()
  }, [pathname, searchParams])

  return null
}