/**@format */

import React from "react"

const SkeletonCard = ({className, type}) => {
    return (
        <>
            {type === "listcard" ? (
                <div className={`${className} relative w-full rounded-xl bg-gray-1 py-3 px-4 transition-all duration-300 ease-in-out`}>
                    <div className=" skeletonCard mb-4 flex h-[180px] w-full items-center justify-between rounded-xl 2xl:h-[250px]"></div>
                    <h4 className=" skeletonCard mb-4 h-6 text-base font-semibold text-black/80"></h4>
                    <div className=" skeletonCard mb-4 h-5 w-2/4"></div>
                    <h4 className=" skeletonCard mb-4 h-6 text-base font-semibold text-black/80"></h4>
                    <div className=" skeletonCard h-5 w-1/4"></div>
                </div>
            ) : type === "categoryCard" ? (
                <div className={`${className} flex w-full items-center justify-between gap-1 rounded-lg bg-black-4 py-4 px-6 transition-all duration-300 ease-in-out `}>
                    <div className="w-full">
                        <div className="skeletonCard mb-4 h-5 w-2/4 rounded-lg"></div>
                        <div className="skeletonCard h-5 w-2/4 rounded-lg"></div>
                    </div>
                    <div className="skeletonCard h-16 w-2/4 rounded-lg"></div>
                </div>
            ) : null}
        </>
    )
}

export default SkeletonCard
