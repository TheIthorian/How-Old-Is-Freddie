const IMAGE_PATH = 'img/';
const IMAGE_EXTENSION = '.jpg';
const IMAGE_DIRECTORY_PATH = 'img/';

/** @type {string[]} */
let images = [];

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
        imagesToSelectFrom = [...images];
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
 * @param {string} firstImage
 * @param {string} secondImage
 */
function compareImageNames(firstImage, secondImage) {
    return Number.parseInt(firstImage, 10) - Number.parseInt(secondImage, 10);
}

/** @param {string[]} discoveredImages */
function sanitiseImages(discoveredImages) {
    return [...new Set(discoveredImages)]
        .filter((image) => image.toLowerCase().endsWith(IMAGE_EXTENSION))
        .sort(compareImageNames);
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
    for (const image of images) {
        void preloadImage(image).catch(() => { });
    }
}

/** @param {string} image */
async function doesImageExist(image) {
    const imagePath = getImagePath(image);

    try {
        let response = await fetch(imagePath, { method: 'HEAD' });

        if (response.status === 405) {
            response = await fetch(imagePath);
        }

        return response.ok;
    } catch {
        return false;
    }
}

/** @returns {Promise<string[]>} */
async function discoverImagesFromDirectoryListing() {
    try {
        const response = await fetch(IMAGE_DIRECTORY_PATH);

        if (!response.ok) {
            return [];
        }

        const directoryHtml = await response.text();
        const directoryDocument = new DOMParser().parseFromString(directoryHtml, 'text/html');
        const discoveredImages = [...directoryDocument.querySelectorAll('a[href]')]
            .map((linkElement) => decodeURIComponent(linkElement.getAttribute('href')))
            .map((imagePath) => imagePath.split('/').pop())
            .filter(Boolean);

        return sanitiseImages(discoveredImages);
    } catch {
        return [];
    }
}

/** @returns {Promise<string[]>} */
async function discoverImagesByProbe() {
    const discoveredImages = [];
    let index = 0;

    while (true) {
        const image = getImageName(index);

        if (!await doesImageExist(image)) {
            break;
        }

        discoveredImages.push(image);
        index += 1;
    }

    return discoveredImages;
}

/** @returns {Promise<string[]>} */
async function discoverImages() {
    const directoryImages = await discoverImagesFromDirectoryListing();

    if (directoryImages.length > 0) {
        return directoryImages;
    }

    return discoverImagesByProbe();
}

/**
 * @param {HTMLImageElement} imageElement
 * @returns {Promise<boolean>}
 */
async function initialiseImages(imageElement) {
    images = await discoverImages();

    if (images.length === 0) {
        return false;
    }

    currentImage = getRandomImage();
    showImage(imageElement, currentImage);
    preloadImage(currentImage).catch(() => { });
    prepareNextImage();
    warmImageCache();
    return true;
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

window.addEventListener('load', async () => {
    /** @type {HTMLDivElement} */
    const imageContainerElement = document.querySelector('#image-container');

    /** @type {HTMLImageElement} */
    const imageCloseElement = document.querySelector('#image-close');

    /** @type {HTMLImageElement} */
    const imageElement = document.querySelector('#image');

    /** @type {HTMLButtonElement} */
    const seeFreddieElement = document.querySelector('#see-freddie');

    const hasImages = await initialiseImages(imageElement);

    if (!hasImages) {
        seeFreddieElement.setAttribute('disabled', 'disabled');
        return;
    }

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
