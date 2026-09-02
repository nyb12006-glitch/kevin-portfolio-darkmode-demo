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

  /* ---------- Contador de stats ---------- */
  var statEls = document.querySelectorAll(".stat-num[data-count]");
  var statIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      if (prefersReduced) { el.textContent = "+" + target; statIO.unobserve(el); return; }
      var start = null, duration = 1400;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = "+" + Math.round(eased * target);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      statIO.unobserve(el);
    });
  }, { threshold: 0.5 });
  statEls.forEach(function (el) { statIO.observe(el); });

  /* ---------- Acordeón "Sobre mí" ---------- */
  document.querySelectorAll(".about-item").forEach(function (item) {
    var head = item.querySelector(".about-item-head");
    head.addEventListener("click", function () {
      var wasOpen = item.classList.contains("open");
      document.querySelectorAll(".about-item.open").forEach(function (o) { o.classList.remove("open"); });
      if (!wasOpen) item.classList.add("open");
    });
  });

  /* ---------- Palabras flotantes del hero: parallax suave con el ratón ---------- */
  if (!prefersReduced && !isTouch) {
    var floatWords = document.querySelectorAll("#floatWords span");
    var mx = 0, my = 0, cx = 0, cy = 0;
    window.addEventListener("mousemove", function (e) {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
    function loopFloat() {
      cx += (mx - cx) * 0.06;
      cy += (my - cy) * 0.06;
      floatWords.forEach(function (el, i) {
        var depth = ((i % 3) + 1) * 10;
        el.style.transform = "translate(" + (cx * depth) + "px," + (cy * depth) + "px)";
      });
      requestAnimationFrame(loopFloat);
    }
    requestAnimationFrame(loopFloat);
  }

  /* ---------- Marquee: pausa al pasar el ratón ---------- */
  var marquee = document.querySelector(".marquee-track");
  if (marquee) {
    marquee.addEventListener("mouseenter", function () { marquee.style.animationPlayState = "paused"; });
    marquee.addEventListener("mouseleave", function () { marquee.style.animationPlayState = "running"; });
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
      });
      item.addEventListener("mouseleave", function () {
        if (thumb) thumb.classList.remove("show");
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

  /* ---------- Videoclips desde projects.js ---------- */
  var videoGrid = document.getElementById("videoGrid");
  if (videoGrid && typeof projects !== "undefined") {
    projects.forEach(function (p) {
      var card = document.createElement("div");
      card.className = "video-card reveal";
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube.com/embed/" + p.youtubeId;
      iframe.title = p.title;
      iframe.loading = "lazy";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      card.appendChild(iframe);
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
