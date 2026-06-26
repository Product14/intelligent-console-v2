/**@format */
import React from "react"

const SpecificModal = props => {
    const {id, showSideNavbar, insetClass} = props
    return (
        <div className={` fixed top-[55px] z-[9] h-[calc(100%-55px)]  overflow-y-auto overflow-x-hidden outline-none ${showSideNavbar ? "left-64 w-[calc(100%-16rem)]" : " left-[72px] w-[calc(100%-72px)]"} transition-all duration-300 ease-in-out`} id={id} tabIndex="-1" aria-labelledby={id} aria-modal="true" role="dialog">
            <div className={`${showSideNavbar ? "left-64 w-[calc(100%-16rem)]" : " left-[72px] w-[calc(100%-72px)]"} fixed inset-0 top-[55px] h-[calc(100%-55px)] bg-black-60 bg-opacity-80 transition-opacity ${insetClass}`}></div>
            <div className="pointer-events-none relative flex min-h-[calc(100%-1rem)] w-auto translate-y-[-50px] transform-none items-center opacity-100 min-[576px]:mx-auto min-[576px]:mt-7 min-[576px]:min-h-[calc(100%-3.5rem)] min-[576px]:max-w-fit">
                <div className=" pointer-events-auto relative  w-full border-none bg-clip-padding text-current  outline-none">{props?.children}</div>
            </div>
        </div>
    )
}

export default SpecificModal
