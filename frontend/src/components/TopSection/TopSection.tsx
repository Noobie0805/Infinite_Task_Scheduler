import React, { useEffect, useState } from 'react'
import { MdMenu } from "react-icons/md";

const saveSchedule = () => {
    const event = new CustomEvent('save-schedule');
    window.dispatchEvent(event);
}

const TopSection = () => {
    const [canSave, setCanSave] = useState(true);

    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail as { valid: boolean } | undefined;
            if (detail && typeof detail.valid === 'boolean') {
                setCanSave(detail.valid);
            }
        };
        window.addEventListener('schedule-validity', handler as EventListener);
        return () => window.removeEventListener('schedule-validity', handler as EventListener);
    }, []);
    return (
        <div className='flex justify-between items-center mx-[10px] my-[10px]  border-gray-300 pb-[10px]'>
            <div className='cursor-pointer text-[17px] text-gray-600 '>
                {React.createElement(MdMenu as React.ComponentType<any>, { size: 28 })}
            </div>
            <div>
                <p className='text-[17px] font-[600]'>Your Schedule</p>
            </div>
            <div>
                <button disabled={!canSave} className={`border-none rounded-[8px] ${canSave ? 'bg-gray-400 hover:bg-[#5A5AF1]' : 'bg-gray-300 cursor-not-allowed'} text-[17px] text-white font-[600] p-[6px]`} onClick={() => {
                    saveSchedule()
                }}>Save</button>
            </div>
        </div >
    )
}

export default TopSection