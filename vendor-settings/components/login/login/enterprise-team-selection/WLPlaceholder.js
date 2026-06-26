import { useContext } from "react"
import Image from "next/image"

import { LOGIN_DATA } from "@spyne-console/common-config/login"
import SignInSignUpContext from "../context"
import { useSelector } from "@spyne-console/store"

function WLPlaceholder (){
    const {handleChangeLoginState} = useContext(SignInSignUpContext)
    const auth = useSelector(state => state.authReducer)
    return <div className="w-full tb:w-[500px] mx-auto">
                <div className="cursor-pointer w-fit mb-8 border border-black-10 rounded-md text-sm font-semibold text-black-60 py-1 pr-2 pl-1 tb:flex gap-1 hidden" onClick={handleChangeLoginState}>
                    <Image src={LOGIN_DATA?.backIcon} width={16} height={16} alt="Back Icon" />
                    {LOGIN_DATA?.backText}
                </div>
                <h1 className="font-bold text-black-80 text-2xl">Hey!</h1>
                <p className="text-base font-normal text-black-60">This is an invite only platform. Please contact <span className="text-blue-bright">{auth?.resellerData?.adminEmail || "Admin"}</span> to register.</p>
            </div>
}

export default WLPlaceholder