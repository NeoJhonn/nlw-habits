import dayjs from "dayjs";

export function generateDatesFromYearBeginning() {
    const startDate = dayjs().startOf('year')
    const today = new Date()

    const dates = []
    let compareDate = startDate

    while(compareDate.isBefore(today)) {//equando o primeiro dia for antes do dia de hoje
        dates.push(compareDate.toDate())
        compareDate = compareDate.add(1, 'day')

    }

    return dates
}