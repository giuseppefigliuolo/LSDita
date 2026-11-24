import { useEffect, useRef, useState } from 'react'

/** Live offsetHeight of an element (e.g. a fixed bar the page must leave room for) */
export function useElementHeight<T extends HTMLElement>(initial: number) {
  const ref = useRef<T>(null)
  const [height, setHeight] = useState(initial)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setHeight(el.offsetHeight)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, height] as const
}
