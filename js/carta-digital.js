(function () {
  var POLL_MS = 60_000;
  var cfg = window.INTIMO_CFG || {};
  var apiUrl =
    cfg.menuApiUrl || "https://contabilidad.cafeintimo.mx/api/public/menu";

  var contentEl = document.getElementById("carta-content");
  var navEl = document.getElementById("carta-nav");
  var navInner = document.getElementById("carta-nav-inner");
  var alertEl = document.getElementById("carta-alert");

  var lastServerVersion = null;
  var pollTimer = null;

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fmtPrice(value) {
    var n = Number(value);
    if (!Number.isFinite(n)) return "—";
    var rounded = Math.round(n * 100) / 100;
    if (Math.abs(rounded - Math.round(rounded)) < 0.001) {
      return "$" + Math.round(rounded);
    }
    return "$" + rounded.toFixed(2);
  }

  function fmtSyncTime(iso) {
    if (!iso) return "";
    try {
      return new Intl.DateTimeFormat("es-MX", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(iso));
    } catch (_e) {
      return "";
    }
  }

  function applyCoverConfig() {
    var hoursWeek = cfg.menuHoursWeek || "Lun. - Vier. : 9:00 a 21:30 hrs.";
    var hoursSat = cfg.menuHoursSat || "Sábado: 9:00 a 21:30 hrs.";
    var waLabel = cfg.menuWhatsappLabel || "241-108-7855";
    var phoneLabel = cfg.menuPhoneLabel || cfg.phoneLabel || "241-277-3450";
    var igHandle = cfg.instagramHandle || "@intimo.cafe";

    var elWeek = document.querySelector("[data-carta-hours-week]");
    var elSat = document.querySelector("[data-carta-hours-sat]");
    var elWa = document.querySelector("[data-carta-wa-label]");
    var elPhone = document.querySelector("[data-carta-phone-label]");
    var elIg = document.querySelector(".carta-cover__ig");

    if (elWeek) elWeek.textContent = hoursWeek;
    if (elSat) elSat.textContent = hoursSat;
    if (elWa) elWa.textContent = waLabel;
    if (elPhone) elPhone.textContent = phoneLabel;
    if (elIg) {
      elIg.href = cfg.instagramUrl || "https://www.instagram.com/intimo.cafe/";
      elIg.textContent = "";
    }

    var y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  function showAlert(msg) {
    if (!alertEl) return;
    if (!msg) {
      alertEl.hidden = true;
      alertEl.textContent = "";
      return;
    }
    alertEl.hidden = false;
    alertEl.textContent = msg;
  }

  function buildMenuTree(categories, products) {
    var byId = new Map();
    categories.forEach(function (c) {
      byId.set(c.id, Object.assign({}, c, { children: [], products: [] }));
    });

    var roots = [];
    byId.forEach(function (cat) {
      var pid = cat.parentCategoryId;
      if (pid && byId.has(pid)) {
        byId.get(pid).children.push(cat);
      } else if (!pid) {
        roots.push(cat);
      }
    });

    byId.forEach(function (cat) {
      var pid = cat.parentCategoryId;
      if (pid && !byId.has(pid) && roots.indexOf(cat) === -1) {
        roots.push(cat);
      }
    });

    roots.sort(function (a, b) {
      return (a.sortOrder || 0) - (b.sortOrder || 0) || String(a.name).localeCompare(String(b.name), "es");
    });

    products.forEach(function (p) {
      var cat = byId.get(p.categoryId);
      if (cat) cat.products.push(p);
    });

    function sortTree(node) {
      node.children.sort(function (a, b) {
        return (a.sortOrder || 0) - (b.sortOrder || 0) || String(a.name).localeCompare(String(b.name), "es");
      });
      node.products.sort(function (a, b) {
        return (a.sortOrder || 0) - (b.sortOrder || 0) || String(a.name).localeCompare(String(b.name), "es");
      });
      node.children.forEach(sortTree);
    }
    roots.forEach(sortTree);

    return roots;
  }

  function renderRow(product) {
    var desc = product.description ? String(product.description).trim() : "";
    return (
      "<li class=\"carta-row\">" +
      "<div class=\"carta-row__main\">" +
      "<div class=\"carta-row__name\">" +
      escapeHtml(product.name) +
      "</div>" +
      (desc ? "<p class=\"carta-row__desc\">" + escapeHtml(desc) + "</p>" : "") +
      "</div>" +
      "<span class=\"carta-row__price\">" +
      escapeHtml(fmtPrice(product.price)) +
      "</span>" +
      "</li>"
    );
  }

  function renderBlock(title, products) {
    if (!products.length) return "";
    return (
      "<div class=\"carta-block\">" +
      "<div class=\"carta-block__label\">" +
      escapeHtml(title) +
      "</div>" +
      "<ul class=\"carta-rows\">" +
      products.map(renderRow).join("") +
      "</ul>" +
      "</div>"
    );
  }

  function columnHtml(groups) {
    return groups
      .map(function (g) {
        return renderBlock(g.name, g.products);
      })
      .join("");
  }

  function splitGroups(section) {
    var groups = [];
    if (section.children.length) {
      section.children.forEach(function (child) {
        if (child.products.length) groups.push(child);
      });
    }
    if (section.products.length) {
      groups.push({
        name: section.children.length ? "Otros" : section.name,
        products: section.products,
      });
    }
    return groups;
  }

  function sectionHtml(section, index) {
    var groups = splitGroups(section);
    if (!groups.length) return "";

    var id = "carta-sec-" + escapeHtml(section.id);
    var mid = Math.ceil(groups.length / 2);
    var leftGroups = groups.slice(0, mid);
    var rightGroups = groups.slice(mid);

    return (
      "<section class=\"carta-section\" id=\"" +
      id +
      "\" aria-labelledby=\"" +
      id +
      "-title\">" +
      "<header class=\"carta-section__head\">" +
      "<img class=\"carta-section__emblem\" src=\"images/carta/emblem-small.png\" alt=\"\" width=\"56\" height=\"56\" decoding=\"async\" />" +
      "<h2 class=\"carta-section__title\" id=\"" +
      id +
      "-title\">" +
      escapeHtml(section.name) +
      "</h2>" +
      "</header>" +
      "<div class=\"carta-rule\" aria-hidden=\"true\"><span class=\"carta-gem\"></span></div>" +
      "<div class=\"carta-columns\">" +
      "<div class=\"carta-col\">" +
      columnHtml(leftGroups) +
      "</div>" +
      "<div class=\"carta-col\">" +
      columnHtml(rightGroups) +
      "</div>" +
      "</div>" +
      "</section>"
    );
  }

  function renderMenu(data) {
    var roots = buildMenuTree(data.categories || [], data.products || []);
    var sections = roots
      .map(function (s, i) {
        return sectionHtml(s, i);
      })
      .filter(Boolean);

    if (!sections.length) {
      contentEl.innerHTML =
        "<p class=\"carta-loading\">No hay productos activos en la carta por ahora.</p>";
      if (navEl) navEl.hidden = true;
      return;
    }

    contentEl.innerHTML = sections.join("");

    if (navEl && navInner) {
      var navRoots = roots.filter(function (s) {
        return splitGroups(s).length > 0;
      });
      navInner.innerHTML = navRoots
        .map(function (s) {
          var sid = "carta-sec-" + escapeHtml(s.id);
          return (
            "<button type=\"button\" class=\"carta-nav__btn\" data-carta-jump=\"" +
            sid +
            "\">" +
            escapeHtml(s.name) +
            "</button>"
          );
        })
        .join("");
      navEl.hidden = navInner.children.length === 0;

      navInner.querySelectorAll("[data-carta-jump]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var target = document.getElementById(btn.getAttribute("data-carta-jump"));
          if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
      });
    }
  }

  async function fetchMenu() {
    var res = await fetch(apiUrl, {
      method: "GET",
      credentials: "omit",
      headers: { Accept: "application/json" },
    });
    var body = await res.json().catch(function () {
      return null;
    });
    if (!res.ok || !body || !body.success) {
      var msg =
        (body && body.message) ||
        "No se pudo cargar el menú (" + res.status + ").";
      throw new Error(msg);
    }
    return body.data;
  }

  async function loadMenu(forceRender) {
    try {
      var data = await fetchMenu();
      var version = data.serverVersion || data.syncedAt || null;

      if (!forceRender && lastServerVersion && version === lastServerVersion) {
        return;
      }

      lastServerVersion = version;
      showAlert("");
      renderMenu(data);
    } catch (e) {
      var errMsg = e instanceof Error ? e.message : "Error al cargar la carta.";
      showAlert(errMsg);
      if (!contentEl.querySelector(".carta-section")) {
        contentEl.innerHTML =
          "<p class=\"carta-loading\">Intenta recargar la página en unos momentos.</p>";
      }
    }
  }

  function startPolling() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(function () {
      if (document.visibilityState === "visible") {
        loadMenu(false);
      }
    }, POLL_MS);
  }

  applyCoverConfig();
  loadMenu(true);
  startPolling();

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
      loadMenu(false);
    }
  });
})();
