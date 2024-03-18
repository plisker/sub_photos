function populatePhotoGrid(jsonFilePath) {
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
                if (index === Math.ceil(data.photos.length / 2)) {
                    // Switch to the second column
                    currentColumn = column2;
                }

                const albumPhoto = document.createElement('div');
                albumPhoto.className = 'album-photo';
                albumPhoto.innerHTML = `
            <a href="${data.directory}${photo.file}.jpg" class="image-popup" title="${photo.name}">
              <picture>
                <source type="image/webp" srcset="${data.directory}${photo.file}.webp">
                <source type="image/jpeg" srcset="${data.directory}${photo.file}.jpg">
                <img src="${photo.image}" alt="${photo.name}" title="${photo.name}">
              </picture>
              <div class="album-photo-text-wrap">
                <div class="album-photo-text">
                  <h2>${photo.name}</h2>
                </div>
              </div>
            </a>
          `;
                currentColumn.appendChild(albumPhoto);
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
