function lightbox() {
    "use strict";

    // Loading page
    //   var loaderPage = function () {
    //     $(".fh5co-loader").fadeOut("slow");
    //   };

    // Magnific Popup
    var magnifPopup = function () {
        $(".image-popup").magnificPopup({
            type: "image",
            removalDelay: 300,
            mainClass: "mfp-with-zoom",
            titleSrc: "title",
            gallery: {
                enabled: true,
                navigateByImgClick: true,
                preload: [0, 1],
            },
            zoom: {
                enabled: true,
                duration: 300,
                easing: "ease-in-out",
                opener: function (openerElement) {
                    return openerElement.is("img")
                        ? openerElement
                        : openerElement.find("img");
                },
            },
            callbacks: {
                open: function () {
                    // Update the URL when the lightbox opens with the current photo
                    var currentPhoto = this.currItem.el.attr('href');
                    var photoId = extractPhotoId(currentPhoto);

                    var newUrl = window.location.pathname + '#photo=' + encodeURIComponent(photoId);
                    history.pushState(null, null, newUrl);
                },
                change: function () {
                    // Update the URL when navigating to a new photo
                    var currentPhoto = this.currItem.el.attr('href');
                    var photoId = extractPhotoId(currentPhoto);

                    var newUrl = window.location.pathname + '#photo=' + encodeURIComponent(photoId);
                    history.pushState(null, null, newUrl);
                },
                close: function () {
                    // Restore the original URL when the popup is closed
                    var cleanUrl = window.location.pathname;
                    history.pushState(null, null, cleanUrl);
                }
            }
        });
    };
    

    var contentWayPoint = function () {
        var i = 0;
        $(".animate-box").waypoint(
            function (direction) {
                if (direction === "down" && !$(this.element).hasClass("animated")) {
                    i++;

                    $(this.element).addClass("item-animate");
                    setTimeout(function () {
                        $("body .animate-box.item-animate").each(function (k) {
                            var el = $(this);
                            setTimeout(
                                function () {
                                    el.addClass("fadeIn animated");
                                    el.removeClass("item-animate");
                                },
                                k * 200,
                                "easeInOutExpo"
                            );
                        });
                    }, 100);
                }
            },
            { offset: "50%" }
        );
    };

    // Helper function to extract unique photo ID from a full photo path
    function extractPhotoId(photoPath) {
        // Use regex to extract the file name without the extension
        var match = photoPath.match(/\/([^\/]+)\.\w+$/);
        return match ? match[1] : photoPath; // Return the file name if matched, or the original path if not
    }

    // Document on load.
    $(function () {
        // loaderPage();
        magnifPopup();

        // Animations
        // contentWayPoint();
    });
};

function getSocials() {
    let socials = document.createElement('ul');
    socials.className = 'fh5co-social';

    socials.innerHTML = `
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
                    aria-label="See: X (Twitter)"><i class="fa-brands fa-x-twitter"></i></a>
            </li>
            <li>
                <a href="https://ebird.org/profile/MTgxMjE3NQ/" rel="noopener" target="_blank"
                    aria-label="See: eBird"><i class="fa-solid fa-binoculars"></i></a>
            </li>
            <li>
                <a href="mailto:photos@lisker.me/" rel="noopener" target="_blank"
                    aria-label="Email me: photos@lisker.me"><i class="fa-regular fa-envelope"></i></a>
            </li>
    `;

    return socials;
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
        `;

    footer.appendChild(getSocials());

    return footer;
}

$(document).ready(function () {
    const socials = document.getElementById('socials');
    if (socials) {
        socials.insertAdjacentElement('beforeend', getSocials());
    }

    const footer = document.getElementById('footer');
    if (footer) {
        footer.insertAdjacentElement('beforeend', getFooter());
    }

    $("body").css("display", "none");

    $("body").fadeIn(2000).stop().animate({ opacity: 1 });

    // Check for a photo hash in the URL
    var hash = window.location.hash;
    if (hash && hash.includes('#photo=')) {
        var photoUrl = decodeURIComponent(hash.split('#photo=')[1]);
        
        // Automatically open the lightbox for the specific photo
        $.magnificPopup.open({
            items: {
                src: photoUrl
            },
            type: 'image'
        });
    }
    });
