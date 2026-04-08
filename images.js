const IMAGE_PATH = 'img/';
const IMAGE_EXTENSION = '.jpg';
const IMAGE_COUNT = 18;
const IMAGES = Array.from({ length: IMAGE_COUNT }, (_, index) => getImageName(index));

/** @type {string[]} */
let imagesToSelectFrom = [];

/** @type {Map<string, { element: HTMLImageElement, ready: Promise<HTMLImageElement> }>} */
const preloadedImages = new Map();

/** @type {string | null} */
let currentImage = null;

/** @type {string | null} */
let nextImage = null;

/** @type {Promise<HTMLImageElement | void> | null} */
let nextImageReady = null;

/**
 * @template T
 * @returns {{ promise: Promise<T>, resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: unknown) => void }}
 */
function defer() {
    /** @type {(value: T | PromiseLike<T>) => void} */
    let resolve;

    /** @type {(reason?: unknown) => void} */
    let reject;

    const promise = new Promise((promiseResolve, promiseReject) => {
        resolve = promiseResolve;
        reject = promiseReject;
    });

    return {
        promise,
        resolve,
        reject,
    };
}

function getRandomImage() {
    if (imagesToSelectFrom.length === 0) {
        imagesToSelectFrom = [...IMAGES];
    }

    const index = randomNumber(imagesToSelectFrom.length);
    const image = imagesToSelectFrom[index];
    imagesToSelectFrom.splice(index, 1);
    return image;
}

/** @param {number} index */
function getImageName(index) {
    return `${index}${IMAGE_EXTENSION}`;
}

/** @param {string} image */
function getImagePath(image) {
    return `${IMAGE_PATH}${image}`;
}

/**
 * @param {string} image
 * @returns {Promise<HTMLImageElement>}
 */
function preloadImage(image) {
    if (preloadedImages.has(image)) {
        return preloadedImages.get(image).ready;
    }

    const preloadElement = new Image();
    preloadElement.decoding = 'async';
    const deferredReady = defer();

    preloadElement.addEventListener('load', () => deferredReady.resolve(preloadElement), { once: true });

    preloadElement.addEventListener('error', () => {
        preloadedImages.delete(image);
        deferredReady.reject(new Error('Failed to load image: ' + image));
    }, { once: true });

    preloadedImages.set(image, { element: preloadElement, ready: deferredReady.promise });

    preloadElement.src = getImagePath(image);

    if (preloadElement.complete && preloadElement.naturalWidth > 0) {
        deferredReady.resolve(preloadElement);
    }

    return deferredReady.promise;
}

/**
 * @param {HTMLImageElement} imageElement
 * @param {string} image
 */
function showImage(imageElement, image) {
    imageElement.setAttribute('src', getImagePath(image));
}

/** @returns {Promise<HTMLImageElement | void> | null} */
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
    for (const image of IMAGES) {
        void preloadImage(image).catch(() => { });
    }
}

/**
 * @param {HTMLImageElement} imageElement
 * @returns {void}
 */
function initialiseImages(imageElement) {
    currentImage = getRandomImage();
    showImage(imageElement, currentImage);
    preloadImage(currentImage).catch(() => { });
    prepareNextImage();
    warmImageCache();
}

/**
 * @param {HTMLImageElement} imageElement
 * @returns {Promise<void>}
 */
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
    /** @type {HTMLDivElement} */
    const imageContainerElement = document.querySelector('#image-container');

    /** @type {HTMLImageElement} */
    const imageCloseElement = document.querySelector('#image-close');

    /** @type {HTMLImageElement} */
    const imageElement = document.querySelector('#image');

    /** @type {HTMLButtonElement} */
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
