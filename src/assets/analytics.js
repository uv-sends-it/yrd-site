(function () {
  var firedDepths = new Set();
  var engaged = false;

  function track(name, data) {
    if (window.umami && typeof window.umami.track === "function") {
      window.umami.track(name, data || {});
    }
  }

  function sourceFor(element) {
    if (element.closest("[data-chatbot]")) return "chat";
    if (element.closest(".hero")) return "hero";
    if (element.closest(".mobile-join-cta")) return "mobile_sticky";
    if (element.closest(".footer")) return "footer";
    if (element.closest(".gallery-panel")) return "gallery";
    return location.pathname;
  }

  setTimeout(function () {
    engaged = true;
    track("page_engaged", { seconds: 15, path: location.pathname });
  }, 15000);

  function checkDepth() {
    var scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    var depth = Math.round((window.scrollY / scrollable) * 100);
    [25, 50, 75, 90].forEach(function (threshold) {
      if (depth >= threshold && !firedDepths.has(threshold)) {
        firedDepths.add(threshold);
        track("scroll_depth_reached", { depth: threshold, path: location.pathname });
      }
    });
  }

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      checkDepth();
      ticking = false;
    });
  }, { passive: true });

  document.addEventListener("click", function (event) {
    var link = event.target.closest("a[href]");
    if (!link) return;

    var href = link.href || "";
    var source = sourceFor(link);

    if (href.includes("revolutionise.com.au/yarrariver/registration")) {
      track("dragon_pass_clicked", { source: source });
      return;
    }

    if (link.pathname === "/join/" || link.pathname.endsWith("/join/")) {
      track("join_info_clicked", { source: source });
      return;
    }

    if (href.includes("events_subscriptions/help")) {
      track("calendar_subscribed", { source: source });
      return;
    }

    if (href.includes("instagram.com/")) {
      track("instagram_clicked", { source: source });
      return;
    }

    if (href.includes("teamapp.com/")) {
      track("teamapp_clicked", { source: source });
      return;
    }

    if (href.startsWith("mailto:")) {
      track("contact_clicked", { source: source });
    }
  });

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden" && engaged) {
      var maxDepth = firedDepths.size ? Math.max.apply(null, Array.from(firedDepths)) : 0;
      track("page_left", { path: location.pathname, max_scroll: maxDepth });
    }
  });
})();
