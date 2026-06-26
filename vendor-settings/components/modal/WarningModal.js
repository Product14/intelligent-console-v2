import React, { useEffect, useState } from 'react'


function WarningModal(props) {
    return (
        <>
            <div className="relative z-30" id={props?.BTN_id} tabindex="-1" aria-labelledby={props?.BTN_id} role="dialog" aria-modal="true">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                <div className="fixed inset-0 z-20 overflow-y-auto">
                    <div className="flex min-h-full  items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <div className=' w-full rounded-xl bg-white max-w-[450px] pl-7 pr-8 pt-5 pb-5' >
                            {props.children}
                        </div>
                    </div>
                </div>
            </div>
        </>

    )
}

export default WarningModal
