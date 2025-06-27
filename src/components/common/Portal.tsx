import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  containerId: string
}

export function Portal({ children, containerId }: Props) {
  const containerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    containerRef.current = document.getElementById(containerId)
  }, [containerId])

  if (!containerRef.current) return null

  return createPortal(children, containerRef.current)
}
