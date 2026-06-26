import React, { useEffect, useState } from 'react'
import { defaultEnterprise, generateUniqueDeviceId, guestEnterprise, localStorageKeys, sessionStorageKeys } from '../utils/config';
import CentralAPIHandler from '../components/centralAPIHandler/centralAPIHandler';


function AppWrapper(props) {
    // const [guestBearer, setGuestBearer] = useState("")

    const storeDeviceId = (uniqueDeviceId) => {
        try {
            localStorage.setItem(localStorageKeys?.DEVICEID, uniqueDeviceId)
        } catch (error) {
            console.log(error)
        }
    }
    const fetchGuestUserDetails = async () => {
        try {
          const URL = `${process.env.APP_BACKEND_BASEURL}/console/v1/user/fetch-guest-user-token`
          const resp =  await CentralAPIHandler.handleGetRequest(URL,  {
            userId: guestEnterprise?.guestUserId
          })
    
          let guestBearer = `Bearer ${resp?.data?.bearer_token}`
          localStorage.setItem(localStorageKeys?.DEFAULTBEARERTOKEN, guestBearer)
        } catch (error) {
          console.log(error)
        }
    }

    useEffect(() => {
        if (localStorage.getItem(localStorageKeys?.DEVICEID)) {
            return
        }
        // fetchGuestUserDetails()
        storeDeviceId(generateUniqueDeviceId())
        //TODO: get user data (first_time_user) from user_details
    }, [])

    useEffect(() => {
        let guestLogin = localStorage.getItem(localStorageKeys?.guestLogin) ? JSON.parse(localStorage.getItem(localStorageKeys?.guestLogin)) : false
        let firstTimer = localStorage.getItem(localStorageKeys?.firstTimeUser) ? JSON.parse(localStorage.getItem(localStorageKeys?.firstTimeUser)) : true
        let coachMarkCompletedSteps = localStorage.getItem(localStorageKeys?.coachMarkCompletedSteps) ? JSON.parse(localStorage.getItem(localStorageKeys?.coachMarkCompletedSteps)) : []

        if(localStorage.getItem(localStorageKeys?.DEFAULTBEARERTOKEN) 
            && localStorage.getItem(localStorageKeys?.AUTHKEY) 
            && localStorage.getItem(localStorageKeys?.DEVICEID)
            // && !guestLogin
        ) {
            return
        }
        let guestBearer = `${guestEnterprise?.guestBearerToken}`
        if(!localStorage.getItem(localStorageKeys?.DEFAULTBEARERTOKEN)) {
            localStorage.setItem(localStorageKeys?.DEFAULTBEARERTOKEN, guestBearer)
        }
            
        sessionStorage.setItem(sessionStorageKeys?.guestUserId, guestEnterprise?.guestUserId)
        localStorage.setItem(localStorageKeys?.guestLogin, true)
        localStorage.setItem(localStorageKeys?.processCount, 0) //image process
        localStorage.setItem(localStorageKeys?.src, 'guest')
        localStorage.setItem(localStorageKeys?.firstTimeUser, firstTimer)
        localStorage.setItem(localStorageKeys?.coachMarkCompletedSteps, JSON.stringify(coachMarkCompletedSteps))
    }, [])

    return (
        <>{props.children}</>
    )
}

export default AppWrapper