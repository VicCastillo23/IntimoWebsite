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

  var dialog = document.getElementById("gallery-dialog");
  var shell = dialog && dialog.querySelector(".gallery-dialog__shell");
  var dialogImg = dialog && dialog.querySelector(".gallery-dialog__img");
  var closeBtn = dialog && dialog.querySelector(".gallery-dialog__close");
  if (!dialog || !shell || !dialogImg || !closeBtn) return;

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
})();
