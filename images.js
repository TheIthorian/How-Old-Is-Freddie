const IMAGE_COUNT = 16;
const IMAGE_PATH = 'img/';
const IMAGES = Array(IMAGE_COUNT)
    .fill(0)
    .map((_, index) => '' + index + '.jpg');

let imagesToSelectFrom = [];
const preloadedImages = new Map();
let currentImage = null;
let nextImage = null;
let nextImageReady = null;

function getRandomImage() {
    if (imagesToSelectFrom.length === 0) {
        imagesToSelectFrom = [...IMAGES];
    }

    const index = randomNumber(imagesToSelectFrom.length);
    const image = imagesToSelectFrom[index];
    imagesToSelectFrom.splice(index, 1);
    return image;
}

function getImagePath(image) {
    return IMAGE_PATH + image;
}

function preloadImage(image) {
    if (preloadedImages.has(image)) {
        return preloadedImages.get(image).ready;
    }

    const preloadElement = new Image();
    preloadElement.decoding = 'async';

    let resolveReady;
    let rejectReady;
    const ready = new Promise((resolve, reject) => {
        resolveReady = resolve;
        rejectReady = reject;
    });

    preloadElement.addEventListener('load', () => {
        resolveReady(preloadElement);
    }, { once: true });

    preloadElement.addEventListener('error', () => {
        preloadedImages.delete(image);
        rejectReady(new Error('Failed to load image: ' + image));
    }, { once: true });

    preloadedImages.set(image, {
        element: preloadElement,
        ready,
    });

    preloadElement.src = getImagePath(image);

    if (preloadElement.complete && preloadElement.naturalWidth > 0) {
        resolveReady(preloadElement);
    }

    return ready;
}

function showImage(imageElement, image) {
    imageElement.setAttribute('src', getImagePath(image));
}

function prepareNextImage() {
    if (nextImage !== null) {
        return nextImageReady;
    }

    nextImage = getRandomImage();
    nextImageReady = preloadImage(nextImage).catch(() => {
        nextImage = null;
        nextImageReady = null;
    });
    return nextImageReady;
}

function warmImageCache() {
    IMAGES.forEach((image) => {
        preloadImage(image).catch(() => {});
    });
}

function initialiseImages(imageElement) {
    currentImage = getRandomImage();
    showImage(imageElement, currentImage);
    preloadImage(currentImage).catch(() => {});
    prepareNextImage();
    warmImageCache();
}

async function showNextImage(imageElement) {
    if (nextImage === null) {
        await prepareNextImage();
    } else if (nextImageReady !== null) {
        await nextImageReady;
    }

    if (nextImage === null) {
        return;
    }

    currentImage = nextImage;
    showImage(imageElement, currentImage);
    nextImage = null;
    nextImageReady = null;
    prepareNextImage();
}

window.addEventListener('load', () => {
    const imageContainerElement = document.querySelector('#image-container');
    const imageCloseElement = document.querySelector('#image-close');
    const imageElement = document.querySelector('#image');
    const seeFreddieElement = document.querySelector('#see-freddie');

    initialiseImages(imageElement);

    seeFreddieElement.addEventListener('click', () => {
        imageElement.classList.remove('hidden');
        imageContainerElement.classList.remove('hidden');
    });

    imageCloseElement.addEventListener('click', () => {
        imageElement.classList.add('hidden');
        imageContainerElement.classList.add('hidden');
    });

    imageElement.addEventListener('click', () => {
        showNextImage(imageElement);
    });
});
