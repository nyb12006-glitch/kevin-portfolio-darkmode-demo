(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(hover: none)").matches;

  /* ---------- Nav: fondo al hacer scroll + link activo ---------- */
  var nav = document.getElementById("nav");
  var sections = document.querySelectorAll("main section[id]");
  var navLinks = document.querySelectorAll(".nav a.link");

  function onScroll() {
    if (window.scrollY > 40) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");

    var pos = window.scrollY + window.innerHeight * 0.35;
    sections.forEach(function (sec) {
      var top = sec.offsetTop, bottom = top + sec.offsetHeight;
      var id = sec.getAttribute("id");
      var link = document.querySelector('.nav a.link[href="#' + id + '"]');
      if (!link) return;
      if (pos >= top && pos < bottom) link.classList.add("active");
      else link.classList.remove("active");
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Menú móvil ---------- */
  var navToggle = document.getElementById("navToggle");
  var navList = document.getElementById("navList");
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      navList.classList.toggle("open");
      document.body.classList.toggle("no-scroll");
    });
    navLinks.forEach(function (a) {
      a.addEventListener("click", function () {
        navList.classList.remove("open");
        document.body.classList.remove("no-scroll");
      });
    });
  }

  /* ---------- Reveal on scroll (con stagger por contenedor) ---------- */
  var revealEls = document.querySelectorAll(".reveal, .reveal-scale");
  if (prefersReduced) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var counters = new WeakMap();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var parent = el.parentElement;
        var i = counters.get(parent) || 0;
        counters.set(parent, i + 1);
        setTimeout(function () { el.classList.add("in"); }, Math.min(i, 8) * 70);
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Intro del Hero: animación de entrada garantizada al cargar ---------- */
  var introEls = document.querySelectorAll(".intro-el");
  if (prefersReduced) {
    introEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    // Doble rAF: aseguramos que el navegador pinte el estado oculto (opacity:0)
    // al menos un frame antes de animar, si no la transición no se aprecia.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        introEls.forEach(function (el, i) {
          setTimeout(function () { el.classList.add("in"); }, i * 130);
        });
      });
    });
  }

  /* ---------- Parallax: Hero (contenido + palabras flotantes) y títulos de sección ---------- */
  var heroSection = document.getElementById("inicio");
  var heroInner = document.getElementById("heroInner");
  var heroGlow = document.getElementById("heroGlow");
  var floatWords = document.querySelectorAll("#floatWords span");
  var parallaxHeadings = document.querySelectorAll("[data-parallax]");

  if (!prefersReduced) {
    var mx = 0, my = 0, cx = 0, cy = 0;
    if (!isTouch) {
      window.addEventListener("mousemove", function (e) {
        mx = (e.clientX / window.innerWidth - 0.5) * 2;
        my = (e.clientY / window.innerHeight - 0.5) * 2;
        if (heroGlow) {
          heroGlow.style.setProperty("--gx", e.clientX + "px");
          heroGlow.style.setProperty("--gy", e.clientY + "px");
        }
      }, { passive: true });
    }

    function renderParallax() {
      cx += (mx - cx) * 0.06;
      cy += (my - cy) * 0.06;

      // Palabras flotantes: parallax de ratón + deriva vertical al hacer scroll (profundidad)
      var heroRect = heroSection ? heroSection.getBoundingClientRect() : null;
      var heroProgress = heroRect ? Math.min(Math.max(-heroRect.top / (heroSection.offsetHeight || 1), 0), 1) : 0;

      floatWords.forEach(function (el, i) {
        var depth = ((i % 3) + 1) * 10;
        var scrollDrift = heroProgress * depth * 3.2;
        el.style.transform = "translate(" + (cx * depth) + "px," + (cy * depth - scrollDrift) + "px)";
      });

      // Contenido del Hero: sube y se desvanece según se hace scroll
      if (heroInner) {
        heroInner.style.transform = "translateY(" + (heroProgress * 90) + "px)";
        heroInner.style.opacity = String(Math.max(1 - heroProgress * 1.3, 0));
      }

      // Títulos de sección: leve deriva vertical según su posición en el viewport
      var vh = window.innerHeight;
      parallaxHeadings.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        var fromCenter = (rect.top + rect.height / 2 - vh / 2) / vh;
        var amplitude = parseFloat(el.getAttribute("data-parallax")) || 40;
        el.style.transform = "translateY(" + (fromCenter * amplitude) + "px)";
      });

      requestAnimationFrame(renderParallax);
    }
    requestAnimationFrame(renderParallax);
  }

  /* ---------- Marquee: pausa al pasar el ratón ---------- */
  var marquee = document.querySelector(".marquee-track");
  if (marquee) {
    marquee.addEventListener("mouseenter", function () { marquee.style.animationPlayState = "paused"; });
    marquee.addEventListener("mouseleave", function () { marquee.style.animationPlayState = "running"; });
  }

  /* ---------- Cursor personalizado: punto que sigue al ratón y crece sobre enlaces ---------- */
  var cursorDot = document.getElementById("cursorDot");
  if (!isTouch && cursorDot && !prefersReduced) {
    document.querySelectorAll("a, button").forEach(function (el) {
      el.addEventListener("mouseenter", function () { cursorDot.classList.add("grow"); });
      el.addEventListener("mouseleave", function () { cursorDot.classList.remove("grow"); });
    });
    window.addEventListener("mousemove", function (e) {
      cursorDot.classList.add("show");
      cursorDot.style.left = e.clientX + "px";
      cursorDot.style.top = e.clientY + "px";
    }, { passive: true });
  }

  /* ---------- Trabajos: miniatura que sigue el cursor + chip ---------- */
  var thumb = document.getElementById("workThumb");
  var thumbImg = document.getElementById("workThumbImg");
  var cursorChip = document.getElementById("cursorChip");
  if (!isTouch) {
    document.querySelectorAll(".work-item").forEach(function (item) {
      item.addEventListener("mouseenter", function () {
        var src = item.getAttribute("data-img");
        if (thumb && src) { thumbImg.src = src; thumb.classList.add("show"); }
        if (cursorDot) cursorDot.classList.add("show-hidden");
      });
      item.addEventListener("mouseleave", function () {
        if (thumb) thumb.classList.remove("show");
        if (cursorDot) cursorDot.classList.remove("show-hidden");
      });
    });
    document.querySelectorAll("a[target='_blank']").forEach(function (a) {
      a.addEventListener("mouseenter", function () { cursorChip.classList.add("show"); });
      a.addEventListener("mouseleave", function () { cursorChip.classList.remove("show"); });
    });
    window.addEventListener("mousemove", function (e) {
      if (thumb) { thumb.style.left = e.clientX + "px"; thumb.style.top = e.clientY + "px"; }
      if (cursorChip) { cursorChip.style.left = e.clientX + "px"; cursorChip.style.top = e.clientY + "px"; }
    }, { passive: true });
  }

  /* ---------- Videoclips desde projects.js (miniatura real + play al clic) ---------- */
  var videoGrid = document.getElementById("videoGrid");
  if (videoGrid && typeof projects !== "undefined") {
    projects.forEach(function (p) {
      var card = document.createElement("div");
      card.className = "video-card reveal";

      var thumbBtn = document.createElement("button");
      thumbBtn.type = "button";
      thumbBtn.className = "video-thumb";
      thumbBtn.setAttribute("aria-label", "Reproducir " + p.title);
      thumbBtn.style.backgroundImage = "url(https://img.youtube.com/vi/" + p.youtubeId + "/hqdefault.jpg)";
      thumbBtn.innerHTML = '<span class="play-icon">▶</span>';
      thumbBtn.addEventListener("click", function () {
        var iframe = document.createElement("iframe");
        iframe.src = "https://www.youtube.com/embed/" + p.youtubeId + "?autoplay=1";
        iframe.title = p.title;
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;
        card.innerHTML = "";
        card.appendChild(iframe);
      });
      card.appendChild(thumbBtn);
      videoGrid.appendChild(card);
      if (!prefersReduced) {
        var obs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) { card.classList.add("in"); obs.unobserve(card); }
          });
        }, { threshold: 0.15 });
        obs.observe(card);
      } else {
        card.classList.add("in");
      }
    });
  }

  /* ---------- Reels: reproducir en hover (desktop) ---------- */
  if (!isTouch) {
    document.querySelectorAll(".reel-card video").forEach(function (v) {
      v.parentElement.addEventListener("mouseenter", function () { v.play().catch(function () {}); });
      v.parentElement.addEventListener("mouseleave", function () { v.pause(); v.currentTime = 0; });
    });
  }
})();
