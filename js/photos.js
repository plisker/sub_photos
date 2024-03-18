function populatePhotoGrid(jsonFilePath, offset=0) {
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

                let albumElement;
                if (photo.video) {
                    // Handle video
                    albumElement = document.createElement('div');
                    albumElement.className = 'album-photo';
                    albumElement.innerHTML = `
                        <a href="${photo.video}" class="mfp-iframe image-popup" title="${photo.name}">
                            <picture>
                                <source type="image/webp" srcset="${data.directory}${photo.file}.webp" />
                                <source type="image/jpeg" srcset="${data.directory}${photo.file}.jpg" />
                                <img src="${data.directory}${photo.file}.jpg" alt="${photo.name}"
                                    title="${photo.name}" />
                            </picture>
                            <div class="album-photo-text-wrap">
                                <div class="album-photo-text">
                                    <h2>${photo.name}</h2>
                                </div>
                            </div>
                        </a>
                    `;
                } else {
                    // Handle photo
                    albumElement = document.createElement('div');
                    albumElement.className = 'album-photo';
                    albumElement.innerHTML = `
                        <a href="${data.directory}${photo.file}.jpg" class="image-popup" title="${photo.name}">
                            <picture>
                                <source type="image/webp" srcset="${data.directory}${photo.file}.webp" />
                                <source type="image/jpeg" srcset="${data.directory}${photo.file}.jpg" />
                                <img src="${data.directory}${photo.file}.jpg" alt="${photo.name}"
                                    title="${photo.name}" />
                            </picture>
                            <div class="album-photo-text-wrap">
                                <div class="album-photo-text">
                                    <h2>${photo.name}</h2>
                                </div>
                            </div>
                        </a>
                    `;
                }

                currentColumn.appendChild(albumElement);
            });

            // Append footer to the photo-grid
            const footer = document.getElementById('fh5co-footer');
            currentColumn.appendChild(footer);

            // Append columns to the photo-grid
            photoGrid.appendChild(column1);
            photoGrid.appendChild(column2);

            lightbox();
        })
        .catch(error => console.error('Error fetching photos:', error));
}
