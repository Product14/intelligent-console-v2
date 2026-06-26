import React from "react";

export default function BadgeTags({className, fill, stroke}){
return(
    <svg width="63" height="22" viewBox="0 0 63 22" fill="none" xmlns="http://www.w3.org/2000/svg"
    className={`${className} `}
    >
    <path d="M54.9141 1.34L61.3144 8.52799C62.2877 9.62107 62.3302 11.2569 61.4149 12.399L54.9219 20.5014C54.1627 21.4487 53.0145 22 51.8005 22H0V0H51.9267C53.0681 0 54.1551 0.48758 54.9141 1.34Z" fill={`${fill ?? "#EFF8FF"}`}/>
    <path d="M60.941 8.86049L54.5407 1.6725C53.8765 0.926633 52.9254 0.5 51.9267 0.5H0.5V21.5H51.8005C52.8627 21.5 53.8674 21.0176 54.5317 20.1887L61.0247 12.0864C61.7874 11.1346 61.752 9.77139 60.941 8.86049Z" stroke={`${stroke ?? "#175CD3"}`} strokeOpacity="0.06"/>
    </svg>

)
}
