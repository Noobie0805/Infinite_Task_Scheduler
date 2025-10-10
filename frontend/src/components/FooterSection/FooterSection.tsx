import React from 'react'
import { IoHomeOutline, IoCalendarOutline } from "react-icons/io5";



const FooterSection = () => {
    return (
        <div className='flex justify-around items-center w-full h-[60px] border-t-[2px] border-gray-300 px-4'>
            <div className='flex items-center justify-center text-black-600 text-[15px] hover:text-[#5A5AF1] cursor-pointer'>
                {React.createElement(IoHomeOutline as React.ComponentType<any>, { size: 25 })} 
                <span className='text-gray-600 text-[15px] ml-2'>Home</span>
            </div>
            <div className='flex items-center justify-center text-black-600 text-[15px] hover:text-[#5A5AF1] cursor-pointer'>
                {React.createElement(IoCalendarOutline as React.ComponentType<any>, { size: 28 })}
                <span className='text-gray-600 text-[15px] ml-2'>Schedule</span>
            </div>
        </div >
    )
}

export default FooterSection