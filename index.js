const MILISECONDS_IN_DAY = 1000 * 60 * 60 * 24;
const DAYS_IN_YEAR = 365;
const MILISECONDS_IN_YEAR = MILISECONDS_IN_DAY * DAYS_IN_YEAR;

const randomNumber = range => Math.floor(Math.random() * range);

const pluralise = (string, count) => {
    const plural = count != 1 && count != -1;
    return `${string}${plural ? 's' : ''}`;
};
const format = (string, count) => {
    return `${count} ${pluralise(string, count)}`;
};

const LIGHT_COLORS = ['#d0fdb1', '#90fca4', '#a9ffed', '#b5ffd4'];
const DARK_COLORS = ['#cc8bc6', '#cf9279', '#de9fa7', '#81c8de', '#a791e1'];
const DARK_FONT_COLOR = '#565f59';
const LIGHT_FONT_COLOR = '#fffef9';
const getRandomColors = () => {
    const isLight = randomNumber(2) === 1;
    // const isLight = false;
    const fontColor = isLight ? DARK_FONT_COLOR : LIGHT_FONT_COLOR;
    const backgroundColor = isLight
        ? LIGHT_COLORS[randomNumber(LIGHT_COLORS.length)]
        : DARK_COLORS[randomNumber(DARK_COLORS.length)];
    console.log(backgroundColor);
    return { fontColor, backgroundColor };
};

const IMAGE_COUNT = 10;
const IMAGES = Array(IMAGE_COUNT)
    .fill(0)
    .map((_, index) => '' + index + '.jpg');

let imagesToSelectFrom = [];
const getRandomImage = () => {
    if (imagesToSelectFrom.length === 0) {
        imagesToSelectFrom = [...IMAGES];
    }

    const index = randomNumber(imagesToSelectFrom.length);
    const image = imagesToSelectFrom[index];
    imagesToSelectFrom.splice(index, 1);
    return image;
};
const randomiseImage = () => {
    const imageElement = document.querySelector('#image');
    imageElement.setAttribute('src', 'img/' + getRandomImage());
};

const birthDate = new Date(2022, 4, 17);
const today = new Date();

const ageInYears = today.getFullYear() - birthDate.getFullYear();

const daysIntoTheMonth = today.getDate() - birthDate.getDate();
const monthsIntoTheYear = today.getMonth() - birthDate.getMonth();
const daysInAMonth = (year, month) => new Date(year, month, 0).getDate();
const ageInMonths = {
    months: monthsIntoTheYear + (daysIntoTheMonth < 0 ? -1 : 0),
    days:
        daysIntoTheMonth < 0
            ? daysInAMonth(today.getFullYear(), today.getMonth()) + daysIntoTheMonth
            : daysIntoTheMonth,
};

const ageInDays = ((today.getTime() - birthDate.getTime()) / MILISECONDS_IN_DAY).toFixed(0);

const updateAgeInSeconds = () => {
    let ageInSeconds = ((new Date().getTime() - birthDate.getTime()) / 1000).toFixed(0);
    ageInSeconds = Number(ageInSeconds).toLocaleString();
    const ageInSecondsElement = document.querySelector('#age-in-seconds');
    ageInSecondsElement.innerText = `or ${format('second', ageInSeconds)}`;
};

window.addEventListener('load', () => {
    const ageInMonthsElement = document.querySelector('#age-in-months');
    const ageInDaysElement = document.querySelector('#age-in-days');
    const ageInSecondsElement = document.querySelector('#age-in-seconds');
    const imageContainerElement = document.querySelector('#image-container');
    const imageCloseElement = document.querySelector('#image-close');
    const imageElement = document.querySelector('#image');
    const seeFreddieElement = document.querySelector('#see-freddie');

    let ageInMonthsText = 'Freddie is ';
    ageInMonthsText += ageInYears ? format('year', ageInYears) + ',' : '';
    ageInMonthsText += ` ${format('month', ageInMonths.months)} and `;
    ageInMonthsText += ` ${format('day', ageInMonths.days)} old`;
    ageInMonthsElement.innerText += ageInMonthsText;

    ageInDaysElement.innerText = `which is ${format('day', ageInDays)}`;

    updateAgeInSeconds();

    randomiseImage();

    seeFreddieElement.addEventListener('click', () => {
        randomiseImage();
        imageElement.classList.remove('hidden');
        imageContainerElement.classList.remove('hidden');
    });

    imageCloseElement.addEventListener('click', () => {
        imageElement.classList.add('hidden');
        imageContainerElement.classList.add('hidden');
    });

    imageElement.addEventListener('click', () => {
        randomiseImage();
    });

    const colors = getRandomColors();
    document.documentElement.style.setProperty('--background-color', colors.backgroundColor);
    document.documentElement.style.setProperty('--font-color', colors.fontColor);

    setInterval(updateAgeInSeconds, 1000);
});
