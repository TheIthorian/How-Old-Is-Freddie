const IMAGE_COUNT = 14;
const IMAGES = Array(IMAGE_COUNT)
    .fill(0)
    .map((_, index) => '' + index + '.jpg');

let imagesToSelectFrom = [];

function getRandomImage() {
    if (imagesToSelectFrom.length === 0) {
        imagesToSelectFrom = [...IMAGES];
    }

    const index = randomNumber(imagesToSelectFrom.length);
    const image = imagesToSelectFrom[index];
    imagesToSelectFrom.splice(index, 1);
    return image;
}

function randomiseImage() {
    const imageElement = document.querySelector('#image');
    imageElement.setAttribute('src', 'img/' + getRandomImage());
}

window.addEventListener('load', () => {
    const imageContainerElement = document.querySelector('#image-container');
    const imageCloseElement = document.querySelector('#image-close');
    const imageElement = document.querySelector('#image');
    const seeFreddieElement = document.querySelector('#see-freddie');

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
});
