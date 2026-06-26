import { useSelector } from "@spyne-console/store"

function HideSpyneContent (props) {
    const authReducer = useSelector(state => state.authReducer)

    if(authReducer?.resellerData?.is_reseller){
        if(props?.isWhiteLabelComponent){
            return <>{props.children}</>
        }
        return null
    }else {
        if(props?.isWhiteLabelComponent){
            return null
        }
        return <>{props.children}</>
    }    
}

export default HideSpyneContent