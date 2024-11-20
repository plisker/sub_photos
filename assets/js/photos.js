function populatePhotoGrid(jsonFilePath, offset = 0) {
    fetch(jsonFilePath)
        .then(response => response.json())
        .then(data => {
            const photoGrid = document.getElementById('photo-grid');
            let column1 = document.createElement('div');
            column1.className = 'fh5co-col-1';
            let column2 = document.createElement('div');
            column2.className = 'fh5co-col-2';
            let currentColumn = column1;

            data.photos.forEach((photo, index) => {
                if (index === Math.ceil((data.photos.length - offset) / 2)) {
                    // Switch to the second column
                    currentColumn = column2;
                }

                let albumElement = document.createElement('div');
                albumElement.className = 'album-photo';

                // Set the image format based on browser support and photo availability
                const imageFormat = supportsAvif() && photo.hasAvif ? 'avif' :
                                    (supportsWebP() && photo.hasWebp ? 'webp' : 'jpg');

                console.debug('Will load ' + photo.file + '.' + imageFormat);
                let elementDescription = photo.description ? photo.description : photo.name;
                let lightboxElement = photo.video ? photo.video : data.directory + photo.file + '.' + imageFormat;
                let lightboxClass = photo.video ? 'mfp-iframe image-popup' : 'image-popup'

                // Dynamically build the <picture> element based on available formats
                let pictureElement = `
                    <picture>
                        ${photo.hasAvif ? `<source type="image/avif" srcset="${data.directory}${photo.file}.avif" />` : ''}
                        ${photo.hasWebp ? `<source type="image/webp" srcset="${data.directory}${photo.file}.webp" />` : ''}
                        <source type="image/jpeg" srcset="${data.directory}${photo.file}.jpg" />
                        <img src="${data.directory}${photo.file}.${imageFormat}" alt="${photo.name}" title="${photo.name}" />
                    </picture>
                `;

                albumElement.innerHTML = `
                        <a href="${lightboxElement}" class="${lightboxClass}" title="${elementDescription}">
                            ${pictureElement}
                            <div class="album-photo-text-wrap">
                                <div class="album-photo-text">
                                    <h2>${photo.name}</h2>
                                </div>
                            </div>
                        </a>
                    `;

                currentColumn.appendChild(albumElement);

            });

            // Append footer to the photo-grid
            currentColumn.appendChild(getFooter());

            // Append columns to the photo-grid
            photoGrid.appendChild(column1);
            photoGrid.appendChild(column2);

            lightbox();

            // Open photo if URL hash is present
            openPhotoFromHash();
        })
        .catch(error => console.error('Error fetching photos:', error));
}

// Function to open a photo based on the hash in the URL
function openPhotoFromHash() {
    const hash = window.location.hash;
    if (hash.startsWith("#photo=")) {
        const photoId = decodeURIComponent(hash.split("=")[1]);
        if (!photoId) return;

        // Look for a matching photo in the DOM
        const photoElement = document.querySelector(`a[href*="${photoId}"]`);
        if (photoElement) {
            photoElement.click(); // Open the lightbox
        }
    }
}

function supportsWebP() {
    if (!self.createImageBitmap) return false;

    const webpData =
        'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADs=';

    const img = new Image();
    img.src = webpData;
    return img.decode !== undefined;
}

function supportsAvif() {
    if (!self.createImageBitmap) return false;

    const avifData = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAG1pZjFhdmlmAAACAGF2aWZtYWl...';

    const img = new Image();
    img.src = avifData;
    return img.decode !== undefined;
}
