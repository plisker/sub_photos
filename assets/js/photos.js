document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('photo-grid');
    if (!grid || !grid.dataset.json) return;
    const offset = parseInt(grid.dataset.offset, 10);
    populatePhotoGrid(grid.dataset.json, Number.isFinite(offset) ? offset : 0);
});

function populatePhotoGrid(jsonFilePath, offset = 0) {
    fetch(jsonFilePath)
        .then(response => response.json())
        .then(data => {
            const photoGrid = document.getElementById('photo-grid');
            const column1 = document.createElement('div');
            column1.className = 'fh5co-col-1';
            const column2 = document.createElement('div');
            column2.className = 'fh5co-col-2';
            let currentColumn = column1;

            data.photos.forEach((photo, index) => {
                if (index === Math.ceil((data.photos.length - offset) / 2)) {
                    currentColumn = column2;
                }
                currentColumn.appendChild(buildAlbumPhoto(photo, data.directory));
            });

            currentColumn.appendChild(getFooter());

            photoGrid.appendChild(column1);
            photoGrid.appendChild(column2);

            lightbox();
            openPhotoFromHash();
        })
        .catch(error => console.error('Error fetching photos:', error));
}

// Format selection: trust JSON flags. <picture>'s <source> elements handle
// the actual browser-format negotiation for the rendered image; this picks
// the single URL we hand to the lightbox.
function pickLightboxFormat(photo) {
    if (photo.hasAvif) return 'avif';
    if (photo.hasWebp) return 'webp';
    return 'jpg';
}

// Allow only safe URL schemes for the video field. Anything else (e.g.
// javascript:) is dropped so a malformed JSON entry can't inject a script.
function sanitizeVideoUrl(url) {
    try {
        const parsed = new URL(url, window.location.origin);
        return ['https:', 'http:'].includes(parsed.protocol) ? parsed.href : null;
    } catch (_) {
        return null;
    }
}

function buildAlbumPhoto(photo, directory) {
    const album = document.createElement('div');
    album.className = 'album-photo';

    const safeVideo = photo.video ? sanitizeVideoUrl(photo.video) : null;
    const lightboxHref = safeVideo
        ? safeVideo
        : directory + photo.file + '.' + pickLightboxFormat(photo);

    const anchor = document.createElement('a');
    anchor.href = lightboxHref;
    anchor.className = safeVideo ? 'mfp-iframe image-popup' : 'image-popup';
    anchor.title = photo.name;
    if (photo.description) anchor.dataset.description = photo.description;
    if (photo.location) anchor.dataset.location = photo.location;

    anchor.appendChild(buildPicture(photo, directory));

    const textWrap = document.createElement('div');
    textWrap.className = 'album-photo-text-wrap';
    const text = document.createElement('div');
    text.className = 'album-photo-text';
    const h2 = document.createElement('h2');
    h2.textContent = photo.name;
    text.appendChild(h2);
    textWrap.appendChild(text);
    anchor.appendChild(textWrap);

    album.appendChild(anchor);
    return album;
}

function buildPicture(photo, directory) {
    const picture = document.createElement('picture');
    const base = directory + photo.file;

    if (photo.hasAvif) picture.appendChild(buildSource('image/avif', base + '.avif'));
    if (photo.hasWebp) picture.appendChild(buildSource('image/webp', base + '.webp'));
    picture.appendChild(buildSource('image/jpeg', base + '.jpg'));

    const img = document.createElement('img');
    img.src = base + '.' + pickLightboxFormat(photo);
    img.alt = photo.name;
    img.loading = 'lazy';
    img.decoding = 'async';
    picture.appendChild(img);

    return picture;
}

function buildSource(type, srcset) {
    const source = document.createElement('source');
    source.type = type;
    source.srcset = srcset;
    return source;
}

function openPhotoFromHash() {
    const hash = window.location.hash;
    if (!hash.startsWith('#photo=')) return;
    const photoId = decodeURIComponent(hash.split('=')[1]);
    if (!photoId) return;
    const photoElement = document.querySelector('a[href*="' + CSS.escape(photoId) + '"]');
    if (photoElement) photoElement.click();
}
