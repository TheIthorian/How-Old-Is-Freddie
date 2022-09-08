const LIGHT_COLORS = ['#d0fdb1', '#90fca4', '#a9ffed', '#b5ffd4'];
const DARK_COLORS = ['#cc8bc6', '#cf9279', '#de9fa7', '#81c8de', '#a791e1'];
const DARK_FONT_COLOR = '#565f59';
const LIGHT_FONT_COLOR = '#fffef9';

function getRandomColors() {
    const isLight = randomNumber(2) === 1;
    const fontColor = isLight ? DARK_FONT_COLOR : LIGHT_FONT_COLOR;
    const backgroundColor = isLight
        ? LIGHT_COLORS[randomNumber(LIGHT_COLORS.length)]
        : DARK_COLORS[randomNumber(DARK_COLORS.length)];
    console.log(backgroundColor);
    return { fontColor, backgroundColor };
}

window.addEventListener('load', () => {
    const colors = getRandomColors();
    document.documentElement.style.setProperty('--background-color', colors.backgroundColor);
    document.documentElement.style.setProperty('--font-color', colors.fontColor);
});
