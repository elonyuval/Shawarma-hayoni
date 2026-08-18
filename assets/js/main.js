/* ============================================================================
   עיוני — לוגיקת האתר
   כל הטקסטים והקישורים מגיעים מ־assets/js/data.js. אין כאן מידע עסקי.
   ============================================================================ */
(function () {
  "use strict";

  var D = window.SITE || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- כלי עזר ---------- */
  function get(path) {
    return path.split(".").reduce(function (o, k) {
      return o == null ? undefined : o[k];
    }, D);
  }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function isEmpty(v) { return v == null || v === ""; }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---------- placeholder לתמונות ----------
     כל עוד אין קובץ תמונה — נשאר ה־placeholder המעוצב.
     ברגע שמעלים תמונה לנתיב, היא נטענת ומחליפה אותו אוטומטית. */
  function wireImage(img) {
    var box = img.closest(".ph");
    if (!box) return;
    if (img.complete && img.naturalWidth > 0) { box.classList.add("is-loaded"); return; }
    img.addEventListener("load", function () {
      if (img.naturalWidth > 0) box.classList.add("is-loaded");
    });
    img.addEventListener("error", function () { box.classList.remove("is-loaded"); });
  }
  function wireImages(root) {
    $$(".ph img", root || document).forEach(wireImage);

    // סלוטים לתמונות בודדות (לוגו וכו') — אותה התנהגות, בלי ה־placeholder המרוצף
    $$("[data-img-slot] img", root || document).forEach(function (img) {
      var box = img.parentElement;
      if (img.complete && img.naturalWidth > 0) { box.classList.add("is-loaded"); return; }
      img.addEventListener("load", function () {
        if (img.naturalWidth > 0) box.classList.add("is-loaded");
      });
      img.addEventListener("error", function () { box.classList.remove("is-loaded"); });
    });
  }

  function phMarkup(src, alt, cls, lazy) {
    return (
      '<figure class="ph ' + (cls || "") + '">' +
        '<img src="' + esc(src) + '" alt="' + esc(alt || "") + '"' +
        (lazy === false ? "" : ' loading="lazy"') + ' decoding="async">' +
        '<figcaption class="ph-label">' + esc(src) + "</figcaption>" +
      "</figure>"
    );
  }

  /* ---------- binding של טקסטים וקישורים ---------- */
  function applyBindings() {
    $$("[data-bind]").forEach(function (node) {
      var v = get(node.getAttribute("data-bind"));
      if (!isEmpty(v)) node.textContent = v;
    });

    $$("[data-bind-attr]").forEach(function (node) {
      node.getAttribute("data-bind-attr").split(";").forEach(function (pair) {
        var parts = pair.split(":");
        var attr = (parts.shift() || "").trim();
        var v = get(parts.join(":").trim());
        if (!attr) return;
        if (isEmpty(v)) {
          if (node.hasAttribute("data-hide-if-empty")) node.hidden = true;
          return;
        }
        node.setAttribute(attr, v);
        if (attr === "href" && /^https?:/i.test(v)) {
          node.setAttribute("target", "_blank");
          node.setAttribute("rel", "noopener");
          var label = (node.getAttribute("aria-label") || node.textContent || "").trim();
          if (label) node.setAttribute("aria-label", label + " (נפתח בכרטיסייה חדשה)");
        }
      });
    });
  }

  /* ---------- renderers ---------- */
  var render = {
    nav: function (host) { navList(host); },
    "nav-mobile": function (host) { navList(host); },
    "nav-footer": function (host) { navList(host); },

    marquee: function (host) {
      var words = D.marquee || [];
      if (!words.length) return;
      var one = words.map(function (w) {
        return '<span class="marquee-item">' + esc(w) +
               '<span class="marquee-sep" aria-hidden="true"></span></span>';
      }).join("");
      host.innerHTML = one + one; // כפילות = לולאה חלקה
    },

    dishes: function (host) {
      host.innerHTML = (D.dishes || []).map(function (d) {
        return (
          '<article class="food-card food-card--' + esc(d.size || "small") + ' reveal" id="dish-' + esc(d.id) + '">' +
            phMarkup(d.image, d.alt || d.name) +
            '<span class="food-card-scrim" aria-hidden="true"></span>' +
            '<div class="food-card-body">' +
              /* '<span class="food-num">' + esc(d.num) + "</span>" + */
              '<h3 class="food-name">' + esc(d.name) + "</h3>" +
              (d.note ? '<p class="food-note">' + esc(d.note) + "</p>" : "") +
            "</div>" +
            '<span class="food-card-line" aria-hidden="true"></span>' +
          "</article>"
        );
      }).join("");
    },

    serveStyles: function (host) {
      host.innerHTML = (D.serveStyles || []).map(function (s) {
        return '<li class="style-item">' + esc(s.name) + "</li>";
      }).join("");
    },

    extras: function (host) {
      host.innerHTML = (D.extras || []).map(function (x) {
        return "<li>" + esc(x) + "</li>";
      }).join("");
    },

    reviews: function (host) {
      host.innerHTML = (D.reviews || []).map(function (r) {
        var body = r.verbatim
          ? '<p class="review-quote">"' + esc(r.text) + '"</p>'
          : '<p class="review-quote">' + esc(r.text) + "</p>";
        return (
          '<blockquote class="review reveal">' + body +
            (r.source ? '<footer class="review-source">' + esc(r.source) + "</footer>" : "") +
          "</blockquote>"
        );
      }).join("");
    },

    "about-paragraphs": function (host) {
      host.innerHTML = ((D.about && D.about.paragraphs) || []).map(function (p) {
        return "<p>" + esc(p) + "</p>";
      }).join("");
    },

    gallery: function (host) {
      host.innerHTML = (D.gallery || []).map(function (g) {
        return '<div class="gallery-item span-' + esc(g.span || "normal") + ' reveal">' +
               phMarkup(g.image, g.alt) + "</div>";
      }).join("");
    },

    hours: function (host) {
      host.innerHTML = (D.hours || []).map(function (h) {
        return "<li><span class=\"day\">" + esc(h.days) + "</span>" +
               "<span class=\"time\">" + esc(h.time) + "</span></li>";
      }).join("");
    },

    "hours-short": function (host) {
      var h = (D.hours || [])[0];
      host.textContent = h ? h.days + " · " + h.time : "";
    },

    social: function (host) {
      var L = D.links || {};
      var items = [
        { label: "Instagram", href: L.instagram },
        { label: "Facebook", href: L.facebook },
        { label: "TikTok", href: L.tiktok },
        { label: L.orderLabel || "הזמנה אונליין", href: L.order },
        { label: "Waze", href: L.waze },
        { label: "Google Maps", href: L.googleMaps },
        { label: "תחבורה ציבורית", href: L.transit },
        { label: L.reviewsLabel || "ביקורות", href: L.reviews },
        { label: "ביקורות בגוגל", href: L.googleReviews }
      ].filter(function (i) { return !isEmpty(i.href); });

      if (!items.length) { host.innerHTML = ""; return; }
      host.innerHTML = items.map(function (i) {
        return '<li><a class="link-underline" href="' + esc(i.href) +
               '" target="_blank" rel="noopener" aria-label="' + esc(i.label) +
               ' (נפתח בכרטיסייה חדשה)">' + esc(i.label) + "</a></li>";
      }).join("");
    }
  };

  function navList(host) {
    host.innerHTML = (D.nav || []).map(function (n) {
      return '<li><a href="' + esc(n.href) + '">' + esc(n.label) + "</a></li>";
    }).join("");
  }

  function runRenderers() {
    $$("[data-render]").forEach(function (host) {
      var fn = render[host.getAttribute("data-render")];
      if (fn) fn(host);
    });
  }

  /* ---------- Header ---------- */
  function initHeader() {
    var header = $("#siteHeader");
    var burger = $("#burger");
    var menu = $("#mobileMenu");

    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    function closeMenu() {
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "פתיחת תפריט");
      menu.classList.remove("is-open");
      document.body.style.overflow = "";
      setTimeout(function () {
        if (burger.getAttribute("aria-expanded") === "false") menu.hidden = true;
      }, 300);
    }
    function openMenu() {
      menu.hidden = false;
      requestAnimationFrame(function () { menu.classList.add("is-open"); });
      burger.setAttribute("aria-expanded", "true");
      burger.setAttribute("aria-label", "סגירת תפריט");
      document.body.style.overflow = "hidden";
    }

    burger.addEventListener("click", function () {
      burger.getAttribute("aria-expanded") === "true" ? closeMenu() : openMenu();
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") {
        closeMenu();
        burger.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1024 && burger.getAttribute("aria-expanded") === "true") closeMenu();
    });
  }

  /* ---------- הדגשת הקישור הפעיל בניווט ---------- */
  function initActiveNav() {
    var links = $$(".nav-desktop a");
    if (!links.length || !("IntersectionObserver" in window)) return;

    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute("href");
      if (id && id.length > 1) map[id.slice(1)] = a;
    });
    var targets = Object.keys(map)
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.remove("is-active");
          a.removeAttribute("aria-current");
        });
        var a = map[e.target.id];
        if (a) { a.classList.add("is-active"); a.setAttribute("aria-current", "true"); }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    targets.forEach(function (t) { io.observe(t); });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    var items = $$(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (i) { i.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    items.forEach(function (item, i) {
      var siblings = item.parentElement ? item.parentElement.children.length : 1;
      if (siblings > 1) item.setAttribute("data-delay", String(i % 4));
      io.observe(item);
    });
  }

  /* ---------- תמונת הירו ייעודית לטלפון ----------
     בטלפון מסגרת ההירו היא 1:2 לאורך, בדסקטופ ~2.4:1 לרוחב — אותה תמונה
     לא יכולה לשרת את שתיהן. אם קיים images/hero-mobile.jpg הוא נטען במקום.
     אם הקובץ לא קיים — לא קורה כלום ונשארת hero.jpg. */
  function initMobileHero() {
    var img = $("#heroMedia .ph img");
    if (!img || !window.matchMedia || !matchMedia("(max-width: 700px)").matches) return;
    var src = (D.media && D.media.heroMobileImage) || "";
    if (!src) return;
    var probe = new Image();
    probe.onload = function () { if (probe.naturalWidth > 0) img.src = src; };
    probe.src = src;
  }

  /* ---------- לולאת הוידאו בהירו ----------
     רצה גם בטלפון (הקאדר שם מתמקד בשיפוד דרך object-position).
     לא נטענת כשביקשו פחות תנועה או כשהדפדפן במצב חיסכון בנתונים. */
  function initHeroVideo() {
    var v = $("#heroVideo");
    if (!v || reduceMotion) return;
    var conn = navigator.connection;
    if (conn && conn.saveData) return;

    v.addEventListener("playing", function () { v.classList.add("is-on"); }, { once: true });

    // WebM קודם (קטן יותר), MP4 בשביל ספארי
    [["data-src-webm", "video/webm"], ["data-src-mp4", "video/mp4"]].forEach(function (pair) {
      var src = v.getAttribute(pair[0]);
      if (!src) return;
      var s = document.createElement("source");
      s.src = src; s.type = pair[1];
      v.appendChild(s);
    });
    v.load();

    var p = v.play();
    if (p && p.catch) p.catch(function () { /* הדפדפן חסם ניגון — נשארת התמונה */ });
  }

  /* ---------- Hero parallax ---------- */
  function initParallax() {
    if (reduceMotion) return;
    var media = $("#heroMedia .ph");
    var content = $("#heroContent");
    var hero = $(".hero");
    if (!media || !hero) return;

    var ticking = false;
    function update() {
      ticking = false;
      var h = hero.offsetHeight || 1;
      var y = Math.min(window.scrollY, h);
      var p = y / h;
      media.style.transform = "translate3d(0," + (y * 0.18).toFixed(2) + "px) scale(" + (1.02 + p * 0.07).toFixed(4) + ")";
      if (content) {
        content.style.transform = "translate3d(0," + (y * -0.06).toFixed(2) + "px)";
        content.style.opacity = String(Math.max(0, 1 - p * 1.15));
      }
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- מפה ---------- */
  function initMap() {
    var slot = $("#mapSlot");
    if (!slot || isEmpty(D.mapEmbedSrc)) return;
    slot.innerHTML =
      '<iframe src="' + esc(D.mapEmbedSrc) + '" title="מפה — שווארמה עיוני נתניה" ' +
      'loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>';
  }

  /* ---------- Structured data (LocalBusiness / Restaurant) ---------- */
  function initSchema() {
    var C = D.contact || {};
    // הכתובת בפועל של הדף — עובד גם כשהאתר יושב בתת-נתיב
    var pageUrl = location.href.split("#")[0].split("?")[0].replace(/index\.html$/, "");
    var data = {
      "@context": "https://schema.org",
      "@type": "Restaurant",
      name: (D.brand && D.brand.fullName) || "שווארמה עיוני",
      alternateName: (D.brand && D.brand.name) || "עיוני",
      description: "שווארמה, פרגית, שניצל וחזה עוף — בפיתה, לאפה, בגט או צלחת. שווארמייה בנתניה.",
      servesCuisine: ["שווארמה", "אוכל רחוב ישראלי", "גריל"],
      url: pageUrl,
      image: pageUrl + "images/hero.jpg",
      address: {
        "@type": "PostalAddress",
        streetAddress: C.addressLine || "",
        addressLocality: C.addressCity || "נתניה",
        addressCountry: "IL"
      },
      areaServed: "נתניה",
      menu: pageUrl + "#food"
    };

    if (D.schemaHours && D.schemaHours.length) data.openingHours = D.schemaHours;
    if (C.phoneTel && C.phoneTel.indexOf("000000000") === -1) {
      data.telephone = C.phoneTel.replace("tel:", "");
    }
    if (D.geo && D.geo.lat && D.geo.lng) {
      data.geo = { "@type": "GeoCoordinates", latitude: D.geo.lat, longitude: D.geo.lng };
    }
    var sameAs = [(D.links || {}).instagram, (D.links || {}).facebook, (D.links || {}).tiktok]
      .filter(function (v) { return !isEmpty(v); });
    if (sameAs.length) data.sameAs = sameAs;

    var s = el("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  }

  /* ---------- init ---------- */
  function init() {
    applyBindings();
    runRenderers();
    applyBindings();   // גם על מה שנוצר דינמית
    wireImages();
    initMobileHero();
    initHeroVideo();
    initHeader();
    initActiveNav();
    initReveal();
    initParallax();
    initMap();
    initSchema();

    var score = D.rating && D.rating.score;
    var ratingBox = $("#ratingScore");
    if (ratingBox && !isEmpty(score)) ratingBox.hidden = false;

    var year = $("#year");
    if (year) year.textContent = new Date().getFullYear();

    document.documentElement.classList.add("js-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
