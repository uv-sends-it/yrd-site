/* Progressive enhancement only. All page content works without JavaScript. */
(function () {
  "use strict";
  var toggle = document.querySelector(".nav__toggle");
  var links = document.getElementById("nav-links");
  if (toggle && links) {
    function close(returnFocus) {
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      if (returnFocus) toggle.focus();
    }
    toggle.addEventListener("click", function () {
      var expanded = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    });
    links.addEventListener("click", function (event) {
      if (event.target.closest("a")) close(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && links.classList.contains("is-open")) close(true);
    });
  }

  var mobile = document.querySelector("[data-mobile-join-cta]");
  var hero = document.querySelector(".hero");
  if (mobile && hero && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      mobile.classList.toggle("is-visible", !entries[0].isIntersecting);
    }, { threshold: 0 });
    observer.observe(hero);
  }

  var instaButton = document.querySelector("[data-instagram-load]");
  if (instaButton) {
    instaButton.addEventListener("click", function () {
      if (document.querySelector('script[data-instagram-script]')) return;
      instaButton.disabled = true;
      instaButton.textContent = "Loading Instagram…";
      var embed = document.querySelector("[data-instagram-embed]");
      if (embed) embed.hidden = false;
      var script = document.createElement("script");
      script.async = true;
      script.src = "https://www.instagram.com/embed.js";
      script.dataset.instagramScript = "true";
      script.onload = function () {
        instaButton.hidden = true;
        if (window.instgrm && window.instgrm.Embeds) window.instgrm.Embeds.process();
      };
      script.onerror = function () {
        instaButton.disabled = false;
        instaButton.textContent = "Couldn't load Instagram. Open it directly instead.";
      };
      document.body.appendChild(script);
    });
  }
})();
