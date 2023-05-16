import { Util } from "./Util";

export  class Time {
    static getCurrentDate() {
        let date_time = new Date();
        let day = parseInt(("0" + date_time.getDate()).slice(-2));
        let month = parseInt(("0" + (date_time.getMonth() + 1)).slice(-2));
        let year = date_time.getFullYear();
        let hoursMilitary = date_time.getHours();
        let hours = date_time.getHours();
        let minutes = date_time.getMinutes();
        let seconds = date_time.getSeconds();

        let daysOfWeek = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ]

        let dayName = daysOfWeek[date_time.getDay()]

        let ampm = "am"
        if (hours > 12) {
            ampm = "pm"
            hours -= 12
        }
        if (hours == 0) hours = 12 // NOT TESTED: This is here because a test showed "0:00am" at 12am, this is supposed to fix it

        let monthString = `${month}`
        if (month.toString().length == 1) monthString = `0${month}`

        let dayString = `${day}`
        if (dayString.length == 1) dayString = `0${day}`

        let YMDString = `${year}/${monthString}/${dayString}`
        let MDYString = `${monthString}/${dayString}/${year}`

        let hoursString = `${hours}`

        let minutesString = `${minutes}`
        if (minutesString.length == 1) minutesString = `0${minutes}`

        let timeString = `${hoursString}:${minutesString}${ampm}`

        return {
            day,
            month,
            year,
            hours,
            hoursMilitary,
            minutes,
            seconds,
            dayName,
            YMDString,
            MDYString,
            timeString
        }
    }

    /**
    * @param milliseconds Time in milliseconds
    */
    static parse(milliseconds: number): TimeParsedObject {

        let w = 0;
        let d = 0;
        let h = 0;
        let m = 0;
        let s = 0;
        let ms = 0;
        let sms = 0;

        let turnBack = false;
        if (milliseconds < 0) {
            milliseconds *= -1
            turnBack = true
        }
        
        sms = milliseconds / 1000
        s = Math.floor(milliseconds / 1000)
        m = Math.floor(milliseconds / 60000)
        h = Math.floor(milliseconds / 3600000)
        d = Math.floor(milliseconds / 86400000)
        w = Math.floor(milliseconds / 604800000)

        sms -= m * 60
        s -= m * 60
        m -= h * 60
        h -= d * 24
        d -= w * 7

        if (turnBack) {
            sms *= -1
            s *= -1
            m *= -1
            h *= -1
            d *= -1
            w *= -1
        }

        return {
            weeks: w,
            days: d,
            hours: h,
            minutes: m,
            seconds: s,
            sms: sms
        }
    }

    /**
     * 
     * @param date `MM-DD-YYYY-HH:MM:am/pm`. Example: `2022-17-06-11:59:pm`
     * @param defaultTime `HH:MM:am/pm`. This time will be used in case one isn't presented in the date.
     */
    /*static isValidDate(date: string, defaultTime:string) {

        let monthlyCalendar = [
            { month: "January", days: 31 },
            { month: "February", days: 28 },
            { month: "March", days: 31 },
            { month: "April", days: 30 },
            { month: "May", days: 31 },
            { month: "June", days: 30 },
            { month: "July", days: 31 },
            { month: "August", days: 31 },
            { month: "September", days: 30 },
            { month: "October", days: 31 },
            { month: "November", days: 30 },
            { month: "December", days: 31 }
        ]

        let resData = date.trim().split(/-+/g)

        let month = UtilRandom.isNumberType(resData[0], { isAbove: 0, isBelow: 13, whole: true })
        if (!month.passed) return { error: "Invalid month" }
        month = month.number

        let maxDay = monthlyCalendar[month - 1].days
        let day = UtilRandom.isNumberType(resData[1], { isAbove: 0, isBelow: maxDay + 1, whole: true })
        if (!day.passed) return { error: "Invalid day" }
        day = day.number

        let maxYear = Time.getCurrentDate().year
        if (Time.getCurrentDate().month == 12) maxYear++

        let year = UtilRandom.isNumberType(resData[2], { isAbove: Time.getCurrentDate().year - 1, isBelow: maxYear + 1, whole: true })
        if (!year.passed) return { error: "Invalid year" }
        year = year.number

        let time = defaultTime
        if (resData[3]) time = resData[3]

        let timeData = time.trim().split(/:+/g)
        if (!timeData[2]) return { error: "Invalid time" }

        let hours = UtilRandom.isNumberType(timeData[0], { isAbove: 0, isBelow: 13, whole: true })
        if (!hours.passed) return { error: "Invalid time" }
        hours = hours.number

        let minutes = UtilRandom.isNumberType(timeData[1], { isAbove: -1, isBelow: 60, whole: true })
        if (!minutes.passed) return { error: "Invalid time" }
        minutes = minutes.number

        if (timeData[2].toLowerCase() != "am" && timeData[2].toLowerCase() != "pm") return { error: "Invalid time" }

        let monthString = `${month}`
        if (month.toString().length == 1) monthString = `0${month}`

        let dayString = `${day}`
        if (dayString.length == 1) dayString = `0${day}`

        let YMDString = `${year}-${monthString}-${dayString}`
        let MDYString = `${monthString}-${dayString}-${year}`

        let hoursString = `${hours}`
        if (hoursString.length == 1) hoursString = `0${hours}`

        let minutesString = `${minutes}`
        if (minutesString.length == 1) minutesString = `0${minutes}`

        let timeString = `${hoursString}:${minutesString}${timeData[2]}`

        return {
            day,
            month,
            monthString: monthlyCalendar[month - 1].month,
            year,
            hours,
            minutes,
            ampm: timeData[2],
            YMDString,
            MDYString,
            timeString,
            error: null
        }
    }*/
}

export type TimeParsedObject = {
    weeks: number,
    days: number,
    hours: number,
    minutes: number,
    seconds: number,
    sms: number
}