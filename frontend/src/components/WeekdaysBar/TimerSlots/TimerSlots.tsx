import React, { useState, useEffect } from "react";
import { LuCirclePlus } from "react-icons/lu";
import { LuTrash2 } from "react-icons/lu";

type Slot = { start: string; end: string };

interface TimerSlotsProps {
    slots: Slot[];
    onChange: (slots: Slot[]) => void;
}

const TimerSlots: React.FC<TimerSlotsProps> = ({ slots, onChange }) => {
    const [slot1, setSlot1] = useState<Slot>({ start: "00:00", end: "00:00" });
    const [slot2, setSlot2] = useState<Slot>({ start: "00:00", end: "00:00" });
    const [showSlot2, setShowSlot2] = useState(false);

    // Sync local state from props
    useEffect(() => {
        const s1 = slots[0] ?? { start: "00:00", end: "00:00" };
        const s2 = slots[1] ?? { start: "00:00", end: "00:00" };
        setSlot1(s1);
        setSlot2(s2);
        setShowSlot2(!!slots[1]);
    }, [slots]);

    const emitChange = (s1: Slot, s2?: Slot, show2?: boolean) => {
        const list: Slot[] = [s1];
        if (show2) {
            list.push(s2 ?? { start: "00:00", end: "00:00" });
        }
        onChange(list);
    };

    const deleteSlots = () => {
        if (showSlot2) {
            setSlot1(slot2);
            setSlot2({ start: "00:00", end: "00:00" });
            setShowSlot2(false);
            emitChange(slot2, undefined, false);
        } else {
            setSlot1({ start: "00:00", end: "00:00" });
            emitChange({ start: "00:00", end: "00:00" }, undefined, false);
        }
    };

    const addSlots = () => {
        if (!showSlot2) {
            setShowSlot2(true);
            emitChange(slot1, slot2, true);
        }
    };

    const deleteSlot2 = () => {
        setShowSlot2(false);
        setSlot2({ start: "00:00", end: "00:00" });
        emitChange(slot1, undefined, false);
    };

    return (
        <div>
            <div className="flex items-center p-4 pl-6">
                <div className="flex p-0 items-center border-2 border-gray-300 rounded-lg overflow-hidden w-fit">
                    <input
                        type="time"
                        value={slot1.start}
                        onChange={(e) => {
                            const next = { ...slot1, start: e.target.value };
                            setSlot1(next);
                            emitChange(next, slot2, showSlot2);
                        }}
                        className="p-1 outline-none border-r border-gray-300 text-[15.5px] text-black"
                    />
                    <input
                        type="time"
                        value={slot1.end}
                        onChange={(e) => {
                            const next = { ...slot1, end: e.target.value };
                            setSlot1(next);
                            emitChange(next, slot2, showSlot2);
                        }}
                        className="p-1 outline-none text-[16px] text-black"
                    />
                </div>

                <div className="flex flex-row items-center ml-3 pl-2">
                    {!showSlot2 && React.createElement(LuCirclePlus as React.ElementType<any>, {
                        className: "cursor-pointer px-1 text-gray-500 hover:text-[#5A5AF1] transition-colors",
                        size: 26,
                        onClick: () => addSlots()
                    })}
                    {React.createElement(LuTrash2 as React.ElementType<any>, {
                        className: "cursor-pointer px-1 text-gray-400 hover:text-red-500 transition-colors",
                        size: 26,
                        onClick: () => deleteSlots()
                    })}
                </div>
            </div>
            {showSlot2 && (
                <div className="flex items-center p-4 pl-6">
                    <div className="flex p-0 items-center border-2 border-gray-300 rounded-lg overflow-hidden w-fit">
                        <input
                            type="time"
                            value={slot2.start}
                            onChange={(e) => {
                                const next = { ...slot2, start: e.target.value };
                                setSlot2(next);
                                emitChange(slot1, next, showSlot2);
                            }}
                            className="p-1 outline-none border-r border-gray-300 text-[15.5px]"
                        />
                        <input
                            type="time"
                            value={slot2.end}
                            onChange={(e) => {
                                const next = { ...slot2, end: e.target.value };
                                setSlot2(next);
                                emitChange(slot1, next, showSlot2);
                            }}
                            className="p-1 outline-none text-[16px]"
                        />
                    </div>

                    <div className="flex flex-row items-center ml-3 pl-2">
                        {React.createElement(LuTrash2 as React.ElementType<any>, {
                            className: "cursor-pointer px-1 text-gray-400 hover:text-red-500 transition-colors",
                            size: 26,
                            onClick: () => deleteSlot2()
                        })}
                    </div>
                </div>
            )}

        </div>
    );
};

export { TimerSlots };
