import Image from "next/image"
import { errorData } from "./config"

function ApiTimeoutError (props){
    return <div className={props?.className ? props?.className :"h-screen w-screen flex items-center justify-center"}>
                <div className=" flex flex-col items-center justify-center">
                   <Image src={errorData?.imageUrl} height={96} width={96} /> 
                   <h1 className="text-black-80 text-2xl font-semibold mt-4">{props?.heading ? props.heading : errorData?.heading}</h1>
                   <p className="text-black-60 text-base font-normal mt-3">{props?.videoError ? errorData?.videoErrorDescription : errorData?.description}</p>
                </div>
            </div>
}

export default ApiTimeoutError