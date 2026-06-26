/**@format */

import React from "react"

const Pencil = ({className}) => {
    return (
        <svg width="19" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className ? className : "fill-blue-light stroke-blue-light"}`}>
            <path d="M12 4.08579L15 7.08579M10 18.0858H18M2 14.0858L1 18.0858L5 17.0858L16.586 5.49979C16.9609 5.12473 17.1716 4.61612 17.1716 4.08579C17.1716 3.55546 16.9609 3.04684 16.586 2.67179L16.414 2.49979C16.0389 2.12485 15.5303 1.91422 15 1.91422C14.4697 1.91422 13.9611 2.12485 13.586 2.49979L2 14.0858Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

export default Pencil
