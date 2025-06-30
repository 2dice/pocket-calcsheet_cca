import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  containerId: string
}

export function Portal({ children, containerId }: Props) {
  const [container, setContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setContainer(document.getElementById(containerId))
  }, [containerId])

  return container ? createPortal(children, container) : null
}
