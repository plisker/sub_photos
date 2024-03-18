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

                let albumElement;
                if (photo.video) {
                    // Handle video
                    albumElement = document.createElement('div');
                    albumElement.className = 'album-photo';

                    let elementDescription = photo.description ? photo.description : photo.name;

                    albumElement.innerHTML = `
                        <a href="${photo.video}" class="mfp-iframe image-popup" title="${elementDescription}">
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

                    let elementDescription = photo.description ? photo.description : photo.name;

                    albumElement.innerHTML = `
                        <a href="${data.directory}${photo.file}.jpg" class="image-popup" title="${elementDescription}">
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
            currentColumn.appendChild(getFooter());

            // Append columns to the photo-grid
            photoGrid.appendChild(column1);
            photoGrid.appendChild(column2);

            lightbox();
        })
        .catch(error => console.error('Error fetching photos:', error));
}

function getFooter() {
    let footer = document.createElement('div');
    footer.className = 'padding-left';
    footer.id = 'fh5co-footer';

    footer.innerHTML = `
        <p>
            <small>&copy; 2024 Paul Lisker. All Rights Reserved.<br />
                <a href="https://lisker.me/privacy_policy" target="_blank">Privacy Policy</a>
                &#183;
                <a href="https://lisker.me/cookie_policy" target="_blank">Cookie Policy</a><br />
                Modified from a design by
                <a href="http://freehtml5.co/" target="_blank">FreeHTML5.co</a></small>
        </p>
        <ul class="fh5co-social">
            <li>
                <a href="https://www.instagram.com/paullisker/" rel="noopener" target="_blank"
                    aria-label="See: Instagram"><i class="fa-brands fa-instagram"></i></a>
            </li>
            <li>
                <a href="https://www.linkedin.com/in/paullisker/" rel="noopener" target="_blank"
                    aria-label="See: LinkedIn"><i class="fa-brands fa-linkedin"></i></a>
            </li>
            <li>
                <a href="https://twitter.com/PaulLisker/" rel="noopener" target="_blank"
                    aria-label="See: Twitter"><i class="fa-brands fa-twitter"></i></a>
            </li>
            <li>
                <a href="https://ebird.org/profile/MTgxMjE3NQ/" rel="noopener" target="_blank"
                    aria-label="See: eBird"><i class="fa-solid fa-binoculars"></i></a>
            </li>
            <li>
                <a href="mailto:photos@lisker.me/" rel="noopener" target="_blank"
                    aria-label="Email me: photos@lisker.me"><i class="fa-regular fa-envelope"></i></a>
            </li>
        </ul>
    `;

    return footer;
}