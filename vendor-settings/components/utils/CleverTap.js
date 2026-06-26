/**
 * @format
 */

import {useCallback, useEffect, useState} from "react"
import ClevertapReact from "clevertap-react"

// export function useCleverTap(customCallBack) {
//     const [callBack, setCallBack] = useState(null)
//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//         import('clevertap-web-sdk')
//         .then(({ default: CleverTap }) => {
//             // console.log('Clever Tap Running successfully')
//             CleverTap.init('W4W-55R-786Z');
//             setCallBack(customCallBack)
//             // console.log({customCallBack})
//         })
//         .catch((error) => {
//           console.error('Failed to load CleverTap SDK:', error);
//         });
//     }
//   }, [customCallBack]);

//   return useCallback(()=>{
//     console.log('sdasd', callBack)
//     if(typeof callBack==='function'){
        
//         callBack();
//     }
//   },[callBack]);

// }


export function useCleverTap() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      ClevertapReact.initialize(`${process.env.clevertapKey}`);
    }
  }, []);

}
