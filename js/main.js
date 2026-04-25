(function () {
  function applySiteConfig() {
    var cfg = window.INTIMO_CFG || {};
    var email = cfg.email || "hola@cafeintimo.mx";
    var ig = cfg.instagramUrl || "https://www.instagram.com/intimo.cafe/";
    var q = cfg.mapsSearchQuery || "Íntimo Coffee México";
    var mapsUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);

    var wa = document.querySelector("[data-intimo-wa]");
    if (wa) {
      var wd = String(cfg.whatsappDigits || "").replace(/\D/g, "");
      if (wd.length >= 11) wa.href = "https://wa.me/" + wd;
      else
        wa.href =
          "mailto:" +
          email +
          "?subject=" +
          encodeURIComponent("Contacto (WhatsApp) — web Íntimo");
    }

    document.querySelectorAll("[data-intimo-ig]").forEach(function (el) {
      el.href = ig;
    });

    var tel = document.querySelector("[data-intimo-tel]");
    var telHead = document.querySelector("[data-intimo-tel-heading]");
    var telVal = document.querySelector("[data-intimo-tel-label]");
    var pt = String(cfg.phoneTel || "").trim();
    if (tel) {
      if (pt) {
        tel.href = "tel:" + pt.replace(/^tel:/i, "").replace(/\s/g, "");
        if (telHead) telHead.textContent = "Teléfono";
        if (telVal) telVal.textContent = cfg.phoneLabel || pt;
      } else {
        tel.href = "mailto:" + email;
        if (telHead) telHead.textContent = "Correo";
        if (telVal) telVal.textContent = email;
      }
    }

    document.querySelectorAll("[data-intimo-email]").forEach(function (m) {
      m.href = "mailto:" + email;
    });
    document.querySelectorAll("[data-intimo-email-text]").forEach(function (el) {
      el.textContent = email;
    });

    var jobMail = document.querySelector("[data-intimo-mailto-job]");
    if (jobMail)
      jobMail.href =
        "mailto:" + email + "?subject=" + encodeURIComponent("CV / trabajo — Íntimo Coffee");

    var newsMail = document.querySelector("[data-intimo-mailto-newsletter]");
    if (newsMail)
      newsMail.href =
        "mailto:" + email + "?subject=" + encodeURIComponent("Boletín / novedades — Íntimo Coffee");

    var addr1 = document.querySelector("[data-intimo-address1]");
    var addr2 = document.querySelector("[data-intimo-address2]");
    if (addr1) addr1.textContent = cfg.addressLine1 || "";
    if (addr2) {
      if (cfg.addressLine2) {
        addr2.textContent = cfg.addressLine2;
        addr2.hidden = false;
      } else {
        addr2.textContent = "";
        addr2.hidden = true;
      }
    }

    var mapsBtn = document.querySelector("[data-intimo-maps]");
    if (mapsBtn) mapsBtn.href = mapsUrl;

    var fine = document.getElementById("footer-address");
    if (fine) {
      var parts = [cfg.addressLine1, cfg.addressLine2].filter(Boolean);
      fine.textContent = parts.length ? parts.join(" · ") + " · " + email : email;
    }

    var fbHref =
      cfg.facebookUrl && cfg.facebookUrl.length ? cfg.facebookUrl : "redes.html";
    document.querySelectorAll("[data-intimo-fb]").forEach(function (fb) {
      fb.href = fbHref;
    });
  }

  applySiteConfig();

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

  var dialog = document.getElementById("gallery-dialog");
  var shell = dialog && dialog.querySelector(".gallery-dialog__shell");
  var dialogImg = dialog && dialog.querySelector(".gallery-dialog__img");
  var closeBtn = dialog && dialog.querySelector(".gallery-dialog__close");
  if (dialog && shell && dialogImg && closeBtn) {
    function openGallery(img) {
      dialogImg.src = img.currentSrc || img.src;
      dialogImg.alt = img.alt || "";
      dialog.showModal();
    }

    function closeGallery() {
      dialog.close();
    }

    document.querySelectorAll("[data-gallery-open]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var img = btn.querySelector("img");
        if (img) openGallery(img);
      });
    });

    closeBtn.addEventListener("click", closeGallery);

    shell.addEventListener("click", function (e) {
      if (e.target === shell) closeGallery();
    });

    dialog.addEventListener("close", function () {
      dialogImg.removeAttribute("src");
      dialogImg.alt = "";
    });
  }
})();
