/**@format */
import React, {useState, useEffect} from "react"
import Signup from "../signup/Signup"
import NewLogin from "./NewLogin"
import {v4 as uuid} from "uuid"
import MD5 from "crypto-js/md5"
import {localStorageKeys} from "@spyne-console/utils/config"
import SignInSignUp from "./signInSignUp/SignInSignUp"
import SelectEnterprise from "./enterprise-team-selection/SelectEnterprise"

function ToggleLoginSignup(props) {
    return (
    <>
    <SelectEnterprise/>
    </>
      )
}

export default ToggleLoginSignup
