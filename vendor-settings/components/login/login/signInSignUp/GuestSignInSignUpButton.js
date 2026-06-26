import { captureEvent } from '@spyne-console/utils/config'
import React, { useState,useEffect } from 'react'
import { useDispatch } from '@spyne-console/store'
import { useSelector } from '@spyne-console/store'

const GuestSignInSignUpButton = (props) => {
    const dispatch = useDispatch()
    const authReducer = useSelector(state => state.authReducer)
    const [showflicker,setshowflicker]=useState(true)
    const [showButton, setShowButton] = useState(authReducer?.popupButtonSwitch || false)
    const { translate: t, handleGuestButton = ()=>{} } = props

    useEffect(() => {
        if (showflicker) {
          const flickerTimeout = setTimeout(() => {
            setshowflicker(false); 
          }, 3000);
          return () => clearTimeout(flickerTimeout);
        }
      }, [showflicker]);

    return (
        <div className=' m-1 p-1 rounded-full fixed bottom-6 right-8 z-[15]'>
            <div className={` bg-gradient-to-r from-blue-500 to-purple-600 text-white px-10 py-4 rounded-full shadow-lg hover:from-blue-600 hover:to-purple-700 flex items-center gap-2 z-50 ${showflicker ? 'glow-flicker' : ''}`} onClick={()=>{
                captureEvent("try_on_your_vehicle",{
                    "lock_status":"locked"
                },false)
                handleGuestButton()
            }}>
                <button
                    className="flex items-center justify-center "
                >
                    <img
                        src="https://spyne-static.s3.us-east-1.amazonaws.com/console/Lock_vector_guest_button.svg"
                        alt="Lock"
                        className="w-5 h-5 mr-2"
                    />
                    {t('Try on your Vehicle')}
                </button>
            </div>
        </div>
          
    )
}

export default GuestSignInSignUpButton
