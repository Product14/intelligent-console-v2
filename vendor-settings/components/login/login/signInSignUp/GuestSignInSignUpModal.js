import { updateAuthProp } from '@spyne-console/store'
import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'

import { useSelector, useDispatch } from '@spyne-console/store'
import Image from 'next/image'
import { useWindowSize } from '@spyne-console/hooks'

const GuestSignInSignUpModal = (props) => {

    const [isVisible, setIsVisible] = useState(false)
    const screenSize= useWindowSize()
    const dispatch = useDispatch()
    const authReducer = useSelector(state => state.authReducer)

    const { setMouseMv = ()=> {}, setMouseLv = ()=>{}, setTriggerLoginModalAfterProcessing = ()=>{}, handleCreateAccount = ()=>{}, translate} = props

    useEffect(() => {
        setIsVisible(true)
        
        return () => setIsVisible(false) // Cleanup on unmount
    }, [])

    const onClose = () => {
        dispatch(updateAuthProp([
            { key: "loginModalTrigger", value: false },
            { key: "triggerLoginModalAfterProcessing", value: false }
        ]))
        setTriggerLoginModalAfterProcessing(false)
        setMouseMv(false)
        setMouseLv(false)
        setIsVisible(false)
    }

    return ReactDOM.createPortal(

        (!["TABLET","MINI","MOBILE"].includes(screenSize)?<div className={`fixed bottom-10 right-4 w-96 bg-white shadow-lg rounded-lg p-4 z-50 transition-transform duration-700 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
            <button className="absolute z-50 top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>
                <img
                    src='https://spyne-static.s3.amazonaws.com/console/project/close_icon.svg' 
                    height={20}
                    width={20}
                    alt="Close"
                />
            </button>
            <div className="w-full h-36 relative mb-4">
                <Image
                    src="https://spyne-static.s3.amazonaws.com/console/Guest_SignIn_SignUp_Modal_Graphic_Pic_4312.svg"
                    alt="Sign-up graphic"
                    layout="fill"
                    objectFit="contain"
                />
            </div>
            <div className="w-full mb-4">
                <h3 className="text-xl font-semibold text-black ">{translate('Try on your vehicle')}</h3>
                <p className="text-sm">{translate('Create account & transform')} <span className="font-bold text-blue-light">9 {translate('vehicles for free')}</span></p>
            </div>
            <button
                onClick={handleCreateAccount}
                className="w-full bg-blue-light text-white font-bold  py-2 rounded-md mb-2 hover:bg-purple-700"
            >
                {translate('Create Account')}
            </button>
            <p className="text-center text-sm w-full">
                {translate('Already have an account?')}{" "}
                <button onClick={handleCreateAccount} className="text-blue-light font-semibold hover:underline">
                    {translate('Login')}
                </button>
            </p>
        </div>:<div className={`fixed bottom-0 z-[200] h-[47vh] w-[100vw] bg-white shadow-lg rounded-lg p-4  transition-transform duration-700 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
            <button className="absolute z-50 top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>
                <img
                    src='https://spyne-static.s3.amazonaws.com/console/project/close_icon.svg' 
                    height={20}
                    width={20}
                    alt="Close"
                />
            </button>
            <div className="w-full h-36 relative mb-4">
                <Image
                    src="https://spyne-static.s3.amazonaws.com/console/Guest_SignIn_SignUp_Modal_Graphic_Pic_4312.svg"
                    alt="Sign-up graphic"
                    layout="fill"
                    objectFit="contain"
                />
            </div>
            <div className="w-full mb-4">
                <h3 className="text-xl font-semibold text-black ">{translate('Try on your vehicle')}</h3>
                <p className="text-sm">{translate('Create account & transform')} <span className="font-bold text-blue-light">9 {translate('vehicles for free')}</span></p>
            </div>
            <button
                onClick={handleCreateAccount}
                className="w-full bg-blue-light text-white font-bold  py-2 rounded-md mb-2 hover:bg-purple-700"
            >
                {translate('Create Account')}
            </button>
            <p className="text-center text-sm w-full">
                {translate('Already have an account?')}{" "}
                <button onClick={handleCreateAccount} className="text-blue-light font-semibold hover:underline">
                    {translate('Login')}
                </button>
            </p>
        </div>),
        document.body
    )
}

export default GuestSignInSignUpModal
