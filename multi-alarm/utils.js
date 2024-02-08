const parseTimeStringToDate = (timeString) => {
    const [timePart, meridiem] = timeString.split(/\s+/);
    const [hour, minute, second] = timePart.split(":").map(Number);

    let adjustedHour = hour;
    if (meridiem === "PM" && hour !== 12) {
        adjustedHour += 12;
    } else if (meridiem === "AM" && hour === 12) {
        adjustedHour = 0;
    }

    const date = new Date();
    date.setHours(adjustedHour);
    date.setMinutes(minute);
    date.setSeconds(second || 0);

    return date;
};

export const getAlarmTimeStamps = (alarm) => {
    const startTime = parseTimeStringToDate(alarm.start);
    const endTime = parseTimeStringToDate(alarm.end);
    const interval = parseInt(alarm.interval);

    if (startTime > endTime) {
        endTime.setDate(endTime.getDate() + 1);
    }

    const timestamps = [];
    let currentTime = new Date(startTime);

    while (currentTime <= endTime) {
        timestamps.push(currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));

        currentTime.setMinutes(currentTime.getMinutes() + interval);
    }

    return timestamps;
};

export const formatTime = (timeString) => {
    const [timePart, meridiem] = timeString.split(/\s+/);
    const [hour, minute] = timePart.split(":");

    return `${hour}:${minute} ${meridiem}`;
};
