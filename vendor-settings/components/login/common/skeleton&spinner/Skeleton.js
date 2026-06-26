/**
 * @format
 */
import React from "react"

function Skeleton({classSTYLE}) {
    const defaultSTYLES = {
        classSTYLE:''
    }
    return <div className={['skeleton-wrapper h-full w-full',`${classSTYLE || defaultSTYLES?.classSTYLE}`].join(' ')}></div>
}

export default Skeleton
