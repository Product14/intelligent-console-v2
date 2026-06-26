import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { connect } from '@spyne-console/store'
import { dropDownOptions, Logout } from '../../../utils/config'
import { profileDropdownContent } from './config'

function ProfileDropdown(props) {
    const router = useRouter();

    const handleDropdownClick = async (e, clickedBtn) => {
        e.stopPropagation();
        e.preventDefault();
        try {
            if (clickedBtn === dropDownOptions.LOGOUT) {
                // console.log('logout clcik')
                await Logout();
                props.updateAuthUserDetails({
                    loggedIn: false,
                    authKey: '',
                    user: {
                        userId: '',
                        userName: '',
                        contact: '',
                        defaultEnterprise: {},
                        permissionObject: {},
                        deviceId: ''
                    }
                })
            } else if (clickedBtn === dropDownOptions.SWITCH_ENTERPRISE) {
                // console.log('switch enterprise')
                router.push('/enterprises')
            }
        } catch (error) {
            // console.log(error)
        }
    }
    return (
        <div className='absolute bg-white top-16 right-7 rounded-lg pt-4 pb-2 px-3.5 w-72 shadow-md z-30'>
            <div className='flex border-b pb-3'>
                <Image alt='profile pic' height={38} width={38} src={props.profilePic} />
                <div className='flex flex-col px-3 justify-center items-center font-semibold'>
                    <p>{props.auth.user.userName.toUpperCase()}</p>
                </div>
            </div>
            <div className='py-2.5'>
                <ul>
                    {profileDropdownContent.map((item, idx) => {
                        return item.notAllowedPath !== window.location.pathname && 
                        (<li key={idx} className='flex cursor-pointer items-center' onClick={(e) => { handleDropdownClick(e, item?.label) }}>
                            <Image src={item.icon} width={18} height={18} alt='item-icons' />
                            <p className='px-2.5 py-2'>{item.text}</p>
                        </li>)
                    })}
                </ul>

            </div>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        auth: state.authReducer.auth,
    }
}

export default connect(mapStateToProps, null)(ProfileDropdown)