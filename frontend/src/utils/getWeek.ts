
const getWeek = (date: Date) => {
    const week: { day: string; date: Date }[] = [];
    const dayIndex = date.getDay(); // number week day ka
    const sunday = new Date(date);
    sunday.setDate(date.getDate() - dayIndex); // wapis sunday pe

    for (let i = 0; i < 7; i++) {
        const d = new Date(sunday);
        d.setDate(sunday.getDate() + i);
        week.push({
            day: d.toLocaleDateString("en-US", { weekday: "short" }),
            date: d,
        });
    }

    return week;
};

export { getWeek };


// //weekData : {day , date}[]
// const getWeek = (startDate: Date) => {
//     const week: { day: string; date: Date }[] = [];
//     for (let i = 0; i < 7; i++) {
//         const d = new Date(startDate);
//         d.setDate(startDate.getDate() + i);
//         week.push({ day: d.toLocaleDateString("en-US", { weekday: "short" }), date: d, });
//     }
//     return week;
// };

// export { getWeek };