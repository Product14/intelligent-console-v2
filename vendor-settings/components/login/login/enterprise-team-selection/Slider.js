import React from 'react';

const Slider = (props) => {

    const steps = [100,200,300,400,500]
    return (
        <div className='space-y-4'>
            <div className='text-black-60 font-medium text-sm'>
                {props?.label}
            </div>
            <div className="flex flex-col align-middle justify-center gap-1">
                <input
                    type="range"
                    min={props?.min}
                    max={props?.max}
                    name={props?.name}
                    value={props?.value}
                    step={props?.step}
                    onChange={props?.onChange}
                    className="w-[95%] h-1 bg-violet-200 rounded-xl my-1 accent-blue-80"
                    // style={sliderStyle}
                />
                <div className='flex justify-between w-[95%]'>
                 {steps.map((val,index)=>{
                    return (
                    <span className={`${val===Number(props?.value) ? "font-semibold" : ""} `}>{val}</span>
                 )})
                 }
                </div>
            </div>
        </div>
    );
};

export default Slider;