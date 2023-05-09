const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24;
const DAYS_IN_YEAR = 365;
const MILLISECONDS_IN_YEAR = MILLISECONDS_IN_DAY * DAYS_IN_YEAR;

const birthDate = new Date(2022, 4, 17);
const today = new Date();

function getAge() {
    if (birthDate > today)
        return {
            ageInYears: 0,
            ageInMonths: { months: 0, days: 0 },
            ageInDays: 0,
        };

    const daysIntoTheMonth = today.getDate() - birthDate.getDate();
    let monthsIntoTheYear = today.getMonth() - birthDate.getMonth();
    let ageInYears = today.getFullYear() - birthDate.getFullYear();

    // Carry months from year
    if (monthsIntoTheYear <= 0 && ageInYears > 0) {
        ageInYears--;
        monthsIntoTheYear += 12;
    }

    console.log({ ageInYears, daysIntoTheMonth, monthsIntoTheYear });
    const daysInAMonth = (year, month) => new Date(year, month, 0).getDate();
    const ageInMonths = {
        months: monthsIntoTheYear + (daysIntoTheMonth < 0 ? -1 : 0),
        days:
            daysIntoTheMonth < 0
                ? daysInAMonth(today.getFullYear(), today.getMonth()) + daysIntoTheMonth
                : daysIntoTheMonth,
    };

    const ageInDays = ((today.getTime() - birthDate.getTime()) / MILLISECONDS_IN_DAY).toFixed(0);

    return { ageInYears, ageInMonths, ageInDays };
}

function updateAgeInSeconds() {
    const msDifference = new Date().getTime() - birthDate.getTime();
    let ageInSeconds = msDifference < 0 ? 0 : (msDifference / 1000).toFixed(0);
    ageInSeconds = Number(ageInSeconds).toLocaleString();
    const ageInSecondsElement = document.querySelector('#age-in-seconds');
    ageInSecondsElement.innerText = `or ${format('second', ageInSeconds)}`;
}

function pluralise(string, count) {
    const plural = count != 1 && count != -1;
    return `${string}${plural ? 's' : ''}`;
}

function format(string, count) {
    return `${count} ${pluralise(string, count)}`;
}

window.addEventListener('load', () => {
    const { ageInYears, ageInMonths, ageInDays } = getAge();

    const ageInMonthsElement = document.querySelector('#age-in-months');
    const ageInDaysElement = document.querySelector('#age-in-days');

    let ageInMonthsText = 'Freddie is ';
    ageInMonthsText += ageInYears ? format('year', ageInYears) + ',' : '';
    ageInMonthsText += ` ${format('month', ageInMonths.months)} and `;
    ageInMonthsText += ` ${format('day', ageInMonths.days)} old`;
    ageInMonthsElement.innerText += ageInMonthsText;

    ageInDaysElement.innerText = `which is ${format('day', ageInDays)}`;

    updateAgeInSeconds();
    setInterval(updateAgeInSeconds, 1000);
});
