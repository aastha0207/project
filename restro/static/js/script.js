/* ==========================================================
   OLIVE & EMBER — SITE SCRIPT
   Vanilla JS only. Organized by feature for easy Django hookup.
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {

  /* ---------- PRELOADER ---------- */
  const preloader = document.getElementById("preloader");
  window.addEventListener("load", () => {
    setTimeout(() => preloader && preloader.classList.add("is-hidden"), 350);
  });
  // Fallback in case 'load' already fired or assets stall
  setTimeout(() => preloader && preloader.classList.add("is-hidden"), 2500);

  /* ---------- FOOTER YEAR ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- STICKY NAVBAR + SMOOTH SCROLL ---------- */
  const header = document.getElementById("site-header");
  const onScroll = () => {
    if (window.scrollY > 40) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = 84;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
      // close mobile menu after navigating
      navLinks.classList.remove("is-open");
      navToggle.classList.remove("is-active");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- MOBILE NAV TOGGLE ---------- */
  const navToggle = document.getElementById("navbar-toggle");
  const navLinks = document.getElementById("navbar-links");
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    navToggle.classList.toggle("is-active", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  /* ---------- TYPING EFFECT (hero headline) ---------- */
  const typingTarget = document.getElementById("typing-target");
  if (typingTarget) {
    const fullText = typingTarget.textContent.trim();
    typingTarget.textContent = "";
    let i = 0;
    const type = () => {
      if (i <= fullText.length) {
        typingTarget.textContent = fullText.slice(0, i);
        i++;
        setTimeout(type, 38);
      }
    };
    setTimeout(type, 500);
  }

  /* ---------- SCROLL REVEAL (IntersectionObserver) ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  /* ---------- ANIMATED COUNTERS ---------- */
  const counters = document.querySelectorAll(".counter__value");
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10) || 0;
    const suffix = el.dataset.suffix || "";
    const duration = 1600;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(eased * target);
      el.textContent = value.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString() + suffix;
    };
    requestAnimationFrame(step);
  };
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((c) => counterObserver.observe(c));

  /* ---------- MENU FILTERS ---------- */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const menuCards = document.querySelectorAll(".menu-card");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");

      const filter = btn.dataset.filter;
      menuCards.forEach((card) => {
        const show = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-filtered-out", !show);
      });
    });
  });

  /* ---------- GALLERY LIGHTBOX ---------- */
  const galleryItems = Array.from(document.querySelectorAll(".gallery__item"));
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxClose = document.getElementById("lightbox-close");
  const lightboxPrev = document.getElementById("lightbox-prev");
  const lightboxNext = document.getElementById("lightbox-next");
  let currentIndex = 0;

  const openLightbox = (index) => {
    currentIndex = index;
    const item = galleryItems[currentIndex];
    lightboxImage.src = item.src;
    lightboxImage.alt = item.alt;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };
  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };
  const showRelative = (delta) => {
    currentIndex = (currentIndex + delta + galleryItems.length) % galleryItems.length;
    const item = galleryItems[currentIndex];
    lightboxImage.src = item.src;
    lightboxImage.alt = item.alt;
  };

  galleryItems.forEach((item, index) => {
    item.addEventListener("click", () => openLightbox(index));
  });
  lightboxClose.addEventListener("click", closeLightbox);
  lightboxPrev.addEventListener("click", () => showRelative(-1));
  lightboxNext.addEventListener("click", () => showRelative(1));
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") showRelative(1);
    if (e.key === "ArrowLeft") showRelative(-1);
  });

  /* ---------- TESTIMONIAL CAROUSEL (auto-sliding) ---------- */
  const track = document.getElementById("testimonial-track");
  const slides = Array.from(document.querySelectorAll(".testimonial-slide"));
  const dotsWrap = document.getElementById("testimonial-dots");
  let activeSlide = 0;
  let carouselTimer;

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.setAttribute("aria-label", `Go to testimonial ${i + 1}`);
    if (i === 0) dot.classList.add("is-active");
    dot.addEventListener("click", () => goToSlide(i, true));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function goToSlide(index, isManual) {
    activeSlide = index;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
    if (isManual) restartCarousel();
  }
  function nextSlide() { goToSlide((activeSlide + 1) % slides.length); }
  function restartCarousel() {
    clearInterval(carouselTimer);
    carouselTimer = setInterval(nextSlide, 5500);
  }
  if (slides.length) restartCarousel();

  /* ---------- FORM VALIDATION (Reservation + Contact) ---------- */
  const setError = (form, fieldId, message) => {
    const field = form.querySelector(`#${fieldId}`);
    const errorEl = form.querySelector(`[data-error-for="${fieldId}"]`);
    if (!field || !errorEl) return;
    errorEl.textContent = message || "";
    field.closest(".form-field").classList.toggle("has-error", Boolean(message));
  };

  const validateReservation = (form) => {
    let valid = true;
    const name = form.querySelector("#res-name").value.trim();
    const email = form.querySelector("#res-email").value.trim();
    const phone = form.querySelector("#res-phone").value.trim();
    const date = form.querySelector("#res-date").value;
    const time = form.querySelector("#res-time").value;
    const guests = form.querySelector("#res-guests").value;

    if (!name) { setError(form, "res-name", "Please enter your name."); valid = false; }
    else setError(form, "res-name", "");

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) { setError(form, "res-email", "Enter a valid email address."); valid = false; }
    else setError(form, "res-email", "");

    if (phone.replace(/\D/g, "").length < 7) { setError(form, "res-phone", "Enter a valid phone number."); valid = false; }
    else setError(form, "res-phone", "");

    if (!guests) { setError(form, "res-guests", "Select a party size."); valid = false; }
    else setError(form, "res-guests", "");

    if (!date) { setError(form, "res-date", "Choose a date."); valid = false; }
    else setError(form, "res-date", "");

    if (!time) { setError(form, "res-time", "Choose a time."); valid = false; }
    else setError(form, "res-time", "");

    return valid;
  };

  const reservationForm = document.getElementById("reservation-form");
  reservationForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const successEl = document.getElementById("reservation-success");
    if (validateReservation(reservationForm)) {
      // NOTE: replace with a real fetch() POST to the Django reservation endpoint
      successEl.textContent = "Thank you — your table request has been sent. We'll confirm by email shortly.";
      reservationForm.reset();
    } else {
      successEl.textContent = "";
    }
  });

  const validateContact = (form) => {
    let valid = true;
    const name = form.querySelector("#contact-name").value.trim();
    const email = form.querySelector("#contact-email").value.trim();
    const message = form.querySelector("#contact-message").value.trim();

    if (!name) { setError(form, "contact-name", "Please enter your name."); valid = false; }
    else setError(form, "contact-name", "");

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) { setError(form, "contact-email", "Enter a valid email address."); valid = false; }
    else setError(form, "contact-email", "");

    if (!message) { setError(form, "contact-message", "Tell us a little about your request."); valid = false; }
    else setError(form, "contact-message", "");

    return valid;
  };

  const contactForm = document.getElementById("contact-form");
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const successEl = document.getElementById("contact-success");
    if (validateContact(contactForm)) {
      // NOTE: replace with a real fetch() POST to the Django contact endpoint
      successEl.textContent = "Message sent — we'll get back to you within one business day.";
      contactForm.reset();
    } else {
      successEl.textContent = "";
    }
  });

  const newsletterForm = document.getElementById("newsletter-form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector("input");
      if (input.value.trim()) {
        input.value = "";
        input.placeholder = "Subscribed! Welcome aboard.";
      }
    });
  }

  /* ---------- BUTTON RIPPLE EFFECT ---------- */
  document.querySelectorAll(".btn--ripple").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      ripple.classList.add("ripple");
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  /* ---------- BACK TO TOP ---------- */
  const backToTop = document.getElementById("back-to-top");
  window.addEventListener("scroll", () => {
    backToTop.classList.toggle("is-visible", window.scrollY > 600);
  }, { passive: true });
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

});
