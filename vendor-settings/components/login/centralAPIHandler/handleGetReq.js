import axios from "axios";
import { generateBearerToken, Logout } from "../../utils/config";

export const handleGetRequest = (URL, callParams, headers = {}, cancelToken = axios.CancelToken.source(),timeout=0)=>{
    let bearerToken = ''    
    bearerToken = generateBearerToken({additionalPayload: headers})
    
    axios.interceptors.response.use((response) => {
        return response;
    }, async function (error) {
        if (error && (!window.location.href.includes('/verify')) && (error.response?.status === 401)) {
            await Logout({skipBackendLogout:true})
        }
        return Promise.reject(error);
    });

    let handleGetPromise = new Promise((resolve, reject)=>{
        axios({
            method: 'GET',
            url: URL,
            params : callParams ? {...callParams} : {},
            headers : { authorization: bearerToken},
            cancelToken: cancelToken.token,
            ...(timeout ? {'timeout': timeout} : {})
        }).then(res=>{
            if(res?.data?.error) {
                reject(res?.message || 'unknown error occurred')
            } else {
                resolve(res?.data)
            }
        }).catch(err=>{
            if(err?.response?.data?.problems) {
                return reject({message: 'Either not a valid permission or missing input params'})
            }
            reject(err?.response?.data || err);
        })
    });

    return handleGetPromise;

}

