/* Flunklug — small progressive-enhancement layer. No dependencies. */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --------------------------------------------------------- sticky header */

  var header = document.getElementById("header");

  if (header) {
    var setStuck = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    setStuck();
    window.addEventListener("scroll", setStuck, { passive: true });
  }

  /* ------------------------------------------------------------ mobile nav */

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav");

  if (toggle && nav) {
    var setNav = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      if (header) header.classList.toggle("is-open", open);
    };

    toggle.addEventListener("click", function () {
      setNav(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setNav(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setNav(false);
    });

    // Reset when the layout goes back to desktop.
    window.matchMedia("(min-width: 821px)").addEventListener("change", function (e) {
      if (e.matches) setNav(false);
    });
  }

  /* --------------------------------------------------------- scroll reveal */

  // Classes are added here rather than in the markup, so that with JS off
  // (or IntersectionObserver missing) everything simply stays visible.
  if (!reduced && "IntersectionObserver" in window) {
    var targets = document.querySelectorAll(
      ".section-head, .split__media, .split__body, .step, .monster, .shot, .flunk, .asset, .facts, .faq, .note, .cta .wrap"
    );

    if (targets.length) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );

      Array.prototype.forEach.call(targets, function (el, i) {
        el.classList.add("reveal");
        // Stagger items inside the same row a little, capped so nothing lags.
        el.style.transitionDelay = (i % 4) * 60 + "ms";
        observer.observe(el);
      });
    }
  }

  /* -------------------------------------------------------------- lightbox */

  var lightbox = document.getElementById("lightbox");
  var shots = document.querySelectorAll(".shot");

  if (lightbox && shots.length) {
    var lbImage = lightbox.querySelector("img");
    var lbClose = lightbox.querySelector(".lightbox__close");
    var lastFocused = null;

    var openLightbox = function (btn) {
      lbImage.src = btn.getAttribute("data-full");
      lbImage.alt = btn.getAttribute("data-caption") || "";
      lastFocused = btn;
      lightbox.hidden = false;
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
      lbClose.focus();
    };

    var closeLightbox = function () {
      lightbox.classList.remove("is-open");
      lightbox.hidden = true;
      lbImage.src = "";
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    };

    Array.prototype.forEach.call(shots, function (btn) {
      btn.addEventListener("click", function () {
        openLightbox(btn);
      });
    });

    lbClose.addEventListener("click", closeLightbox);

    // Click the backdrop (but not the image itself) to dismiss.
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", function (e) {
      if (lightbox.hidden) return;
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "Tab") {
        // Close is the only focusable control, so keep focus on it.
        e.preventDefault();
        lbClose.focus();
      }
    });
  }
})();
