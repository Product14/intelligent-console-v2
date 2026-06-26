import { useEffect, useState } from "react"
export default function useOnScreen(ref) {

    const [isIntersecting, setIntersecting] = useState(false)
  
    let observer = null
  
    useEffect(() => {
        observer = new IntersectionObserver(
            // destructuring the 1st index of InteractionObserver Array
            ([entry]) => setIntersecting(entry.isIntersecting) 
        )
        observer.observe(ref.current)
        // Remove the observer as soon as the component is unmounted and stop watching for entire list
        return () => { observer.disconnect() }
    }, [])
  
    return isIntersecting
  }