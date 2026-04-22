(function () {
  var y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());

  var toggle = document.querySelector(".nav-toggle");
  var mobile = document.getElementById("nav-mobile");
  if (toggle && mobile) {
    function setOpen(open) {
      mobile.hidden = !open;
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }

    toggle.addEventListener("click", function () {
      setOpen(mobile.hidden);
    });

    mobile.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setOpen(false);
      });
    });
  }

  var root = document.querySelector("[data-carousel]");
  if (!root) return;

  var viewport = root.querySelector("[data-carousel-viewport]");
  var track = root.querySelector("[data-carousel-track]");
  var slides = root.querySelectorAll("[data-carousel-slide]");
  var prevBtn = root.querySelector("[data-carousel-prev]");
  var nextBtn = root.querySelector("[data-carousel-next]");
  var statusEl = root.querySelector("[data-carousel-status]");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) root.classList.add("is-reduced-motion");

  var n = slides.length;
  var index = 0;
  var touchStartX = null;
  var autoplayId = null;

  function canAutoplay() {
    return !reduceMotion && !root.matches(":focus-within");
  }

  function updateAria() {
    slides.forEach(function (slide, j) {
      slide.setAttribute("aria-hidden", j === index ? "false" : "true");
    });
    if (statusEl) statusEl.textContent = "Foto " + (index + 1) + " de " + n;
  }

  function applyTransform() {
    if (!viewport || !track) return;
    var w = viewport.offsetWidth;
    track.style.transform = "translateX(" + -index * w + "px)";
    updateAria();
  }

  function go(delta) {
    index = (index + delta + n) % n;
    applyTransform();
  }

  function goTo(i) {
    index = Math.max(0, Math.min(n - 1, i));
    applyTransform();
  }

  if (prevBtn) prevBtn.addEventListener("click", function () { go(-1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { go(1); });

  root.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "Home") {
      e.preventDefault();
      goTo(0);
    } else if (e.key === "End") {
      e.preventDefault();
      goTo(n - 1);
    }
  });

  viewport.addEventListener(
    "touchstart",
    function (e) {
      if (e.changedTouches.length) touchStartX = e.changedTouches[0].clientX;
    },
    { passive: true }
  );

  viewport.addEventListener(
    "touchend",
    function (e) {
      if (touchStartX == null || !e.changedTouches.length) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      if (Math.abs(dx) < 48) return;
      if (dx > 0) go(-1);
      else go(1);
    },
    { passive: true }
  );

  function startAutoplay() {
    if (!canAutoplay()) return;
    stopAutoplay();
    autoplayId = window.setInterval(function () {
      go(1);
    }, 6500);
  }

  function stopAutoplay() {
    if (autoplayId != null) {
      window.clearInterval(autoplayId);
      autoplayId = null;
    }
  }

  root.addEventListener("focusin", stopAutoplay);

  root.addEventListener("focusout", function () {
    window.requestAnimationFrame(function () {
      if (canAutoplay()) startAutoplay();
    });
  });

  root.addEventListener("mouseenter", stopAutoplay);

  root.addEventListener("mouseleave", function () {
    window.requestAnimationFrame(function () {
      if (canAutoplay()) startAutoplay();
    });
  });

  window.addEventListener("resize", function () {
    applyTransform();
  });

  if (window.ResizeObserver && viewport) {
    var ro = new ResizeObserver(function () {
      applyTransform();
    });
    ro.observe(viewport);
  }

  applyTransform();
  startAutoplay();
})();
