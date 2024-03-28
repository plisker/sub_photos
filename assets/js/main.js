function lightbox() {
    "use strict";

    // iPad and iPod detection
    var isiPad = function () {
        return navigator.platform.indexOf("iPad") != -1;
    };

    var isiPhone = function () {
        return (
            navigator.platform.indexOf("<i></i>Phone") != -1 ||
            navigator.platform.indexOf("iPod") != -1
        );
    };

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
            },
            zoom: {
                enabled: true, // By default it's false, so don't forget to enable it

                duration: 300, // duration of the effect, in milliseconds
                easing: "ease-in-out", // CSS transition easing function

                // The "opener" function should return the element from which popup will be zoomed in
                // and to which popup will be scaled down
                // By defailt it looks for an image tag:
                opener: function (openerElement) {
                    // openerElement is the element on which popup was initialized, in this case its <a> tag
                    // you don't need to add "opener" option if this code matches your needs, it's default one.
                    return openerElement.is("img")
                        ? openerElement
                        : openerElement.find("img");
                },
            },
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
    if (!!socials) {
        socials.insertAdjacentElement('beforeend', getSocials());
    }

    const footer = document.getElementById('footer');
    if (!!footer) {
        footer.insertAdjacentElement('beforeend', getFooter());
    }

    $("body").css("display", "none");

    $("body").fadeIn(2000);
    $("body").stop().animate({
        opacity: 1,
    });

    //   $("a.transition").click(function (event) {
    //     event.preventDefault();
    //     linkLocation = this.href;
    //     $("body").fadeOut(1000, redirectPage);
    //   });

    //   function redirectPage() {
    //     window.location = linkLocation;
    //   }
});
