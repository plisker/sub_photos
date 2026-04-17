function lightbox() {
  "use strict";

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
      open: syncHashToCurrent,
      change: syncHashToCurrent,
      close: function () {
        history.pushState(null, null, window.location.pathname);
      },
    },
  });

  function syncHashToCurrent() {
    var photoId = extractPhotoId(this.currItem.el.attr("href"));
    history.pushState(
      null,
      null,
      window.location.pathname + "#photo=" + encodeURIComponent(photoId)
    );
  }

  function extractPhotoId(photoPath) {
    var match = photoPath.match(/\/([^\/]+)\.\w+$/);
    return match ? match[1] : photoPath;
  }
}

function getSocials() {
  let socials = document.createElement("ul");
  socials.className = "fh5co-social";

  socials.innerHTML = `
            <li>
                <a href="https://www.instagram.com/paullisker/" rel="noopener noreferrer" target="_blank"
                    aria-label="See: Instagram"><i class="fa-brands fa-instagram"></i></a>
            </li>
            <li>
                <a href="https://www.linkedin.com/in/paullisker/" rel="noopener noreferrer" target="_blank"
                    aria-label="See: LinkedIn"><i class="fa-brands fa-linkedin"></i></a>
            </li>
            <li>
                <a href="https://twitter.com/PaulLisker/" rel="noopener noreferrer" target="_blank"
                    aria-label="See: X (Twitter)"><i class="fa-brands fa-x-twitter"></i></a>
            </li>
            <li>
                <a href="https://ebird.org/profile/MTgxMjE3NQ/" rel="noopener noreferrer" target="_blank"
                    aria-label="See: eBird"><i class="fa-solid fa-binoculars"></i></a>
            </li>
            <li>
                <a href="mailto:photos@lisker.me"
                    aria-label="Email me: photos@lisker.me"><i class="fa-regular fa-envelope"></i></a>
            </li>
    `;

  return socials;
}

function getFooter() {
  let footer = document.createElement("div");
  footer.className = "padding-left";
  footer.id = "fh5co-footer";

  const currentYear = new Date().getFullYear();

  footer.innerHTML = `
        <p>
            <small>&copy; ${currentYear} Paul Lisker. All Rights Reserved.<br />
                <a href="https://lisker.me/privacy_policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                &#183;
                <a href="https://lisker.me/cookie_policy" target="_blank" rel="noopener noreferrer">Cookie Policy</a><br />
                Modified from a design by
                <a href="http://freehtml5.co/" target="_blank" rel="noopener noreferrer">FreeHTML5.co</a></small>
        </p>
    `;

  footer.appendChild(getSocials());

  return footer;
}

// Reveal the Font Awesome logo icon once the kit has swapped <i> for <svg>.
// A MutationObserver wakes up exactly when the DOM changes — no polling.
function revealLogoWhenFontAwesomeReady() {
  var logo = document.getElementById("fh5co-logo");
  if (!logo) return;
  if (logo.querySelector("svg.svg-inline--fa")) {
    logo.classList.add("fa-loaded");
    return;
  }
  var observer = new MutationObserver(function () {
    if (logo.querySelector("svg.svg-inline--fa")) {
      logo.classList.add("fa-loaded");
      observer.disconnect();
    }
  });
  observer.observe(logo, { childList: true, subtree: true });
  // Failsafe: reveal anyway after 500ms so the icon never stays invisible.
  setTimeout(function () {
    logo.classList.add("fa-loaded");
    observer.disconnect();
  }, 500);
}

$(document).ready(function () {
  revealLogoWhenFontAwesomeReady();

  const socials = document.getElementById("socials");
  if (socials) {
    socials.insertAdjacentElement("beforeend", getSocials());
  }

  const footer = document.getElementById("footer");
  if (footer) {
    footer.insertAdjacentElement("beforeend", getFooter());
  }

  // Pages that render their own grid (photos.js) call lightbox() themselves
  // once the grid is in the DOM. On pages without a grid, initialize now.
  if (!document.getElementById("photo-grid")) {
    lightbox();
  }
});
