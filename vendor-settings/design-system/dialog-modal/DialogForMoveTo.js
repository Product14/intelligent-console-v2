import React, { useContext,useState } from 'react'
import styles from '../../../styles/common/dialog.module.css'
import Image from 'next/image'
import Button from '../button/Button'
import { BUTTON_TYPES } from '../../../utils/config'
import { toast } from 'react-toastify'
import ProjectContext from '../../project/ProjectContext'
import Spinner from '../skeleton&spinner/Spinner'



function DialogForMoveTo(props) {
 const {setOpenConfirmationModal,valuesToUpdate} = props
  
  
  const clickHandler = () => {
    // handleMove()
    // console.log("clickHandler")
    // handleConfirmMoveTo(valuesToUpdate.new_project_id,valuesToUpdate.skuId)
    props.handleConfirmMove()
    // setOpenConfirmationModal(false) 
    
  }

  function closeDialog() {
    // console.log("closeDialog")
   setOpenConfirmationModal(false);
    
  }

  return (
    <>
      <div className="relative z-30" aria-labelledby="modal-title" role="dialog" aria-modal="true"  >
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        <div className="fixed inset-0 z-20 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className={` flex flex-col gap-8 w-[400px] h-full max-w-[575px] bg-white shadow-5xl relative rounded-xl items-center p-6 `}>
              <div className={[styles['modal-content']].join(' ')}>
                <Image src={props.image} alt='Move to icon' height={48} width={48} />
                <h1>{props.heading}</h1>
                <p>{props.para}</p>
              </div>
              <div className={[styles['modal-button'], 'w-full inline-flex gap-4 download-modal'].join(' ')}>
                <Button type={BUTTON_TYPES.SECONDARY} buttonPlaceHolder={props?.btn1text} onClickHandler={()=>closeDialog()}></Button>
                {props.showDialogLoader ? <div className="flex items-center ml-[55px]"><Spinner/></div> : <Button type={BUTTON_TYPES.PRIMARY} buttonPlaceHolder={props?.btn2text} onClickHandler={()=>clickHandler()}></Button>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default DialogForMoveTo




