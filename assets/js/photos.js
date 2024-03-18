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

                // Set the image format based on browser support
                const imageFormat = supportsWebP() ? 'webp' : 'jpg';

                let elementDescription = photo.description ? photo.description : photo.name;
                let lightboxElement = photo.video ? photo.video : data.directory + photo.file + '.' + imageFormat;
                let lightboxClass = photo.video ? 'mfp-iframe image-popup' : 'image-popup'

                albumElement.innerHTML = `
                        <a href="${lightboxElement}" class="${lightboxClass}" title="${elementDescription}">
                            <picture>
                                <source type="image/webp" srcset="${data.directory}${photo.file}.webp" />
                                <source type="image/jpeg" srcset="${data.directory}${photo.file}.jpg" />
                                <img src="${data.directory}${photo.file}.${imageFormat}" alt="${photo.name}"
                                    title="${photo.name}" />
                            </picture>
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
        })
        .catch(error => console.error('Error fetching photos:', error));
}

function supportsWebP() {
    if (!self.createImageBitmap) return false;

    const webpData =
        'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADs=';

    const img = new Image();
    img.src = webpData;
    return img.decode !== undefined;
}
