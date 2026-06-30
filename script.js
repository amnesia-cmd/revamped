(() => {
  "use strict";

  const COVERAGE_AMOUNTS = {
    1: 100000,
    2: 250000,
    3: 500000,
    4: 750000,
    5: 1000000,
    6: 1500000,
    7: 2000000,
    8: 2500000,
    9: 3000000,
    10: 5000000,
  };

  const TYPE_MULTIPLIERS = {
    life: 1,
    health: 1.35,
    auto: 0.65,
    home: 0.85,
  };

  const TYPE_LABELS = {
    life: "Life",
    health: "Health",
    auto: "Auto",
    home: "Home",
  };

  const TYPE_FEATURES = {
    life: [
      "Instant digital policy delivery",
      "No medical exam for most applicants",
      "Cancel anytime, no hidden fees",
    ],
    health: [
      "Nationwide provider network",
      "Telehealth included at no extra cost",
      "Prescription savings program",
    ],
    auto: [
      "Roadside assistance 24/7",
      "Accident forgiveness available",
      "Multi-vehicle discounts",
    ],
    home: [
      "Replacement cost coverage",
      "Natural disaster protection",
      "Smart home device discounts",
    ],
  };

  let currentType = "life";
  let familyRiders = false;

  const nav = document.getElementById("nav");
  const ageSlider = document.getElementById("ageSlider");
  const coverageSlider = document.getElementById("coverageSlider");
  const ageValue = document.getElementById("ageValue");
  const coverageValue = document.getElementById("coverageValue");
  const premiumAmount = document.getElementById("premiumAmount");
  const premiumNote = document.getElementById("premiumNote");
  const quoteFeatures = document.getElementById("quoteFeatures");
  const familyToggle = document.getElementById("familyToggle");
  const tabs = document.querySelectorAll(".quote__tab");
  const menuToggle = document.getElementById("menuToggle");
  const mobileDrawer = document.getElementById("mobileDrawer");
  function formatCurrency(num) {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1)}M`;
    return `$${num.toLocaleString()}`;
  }

  function calculatePremium() {
    const age = parseInt(ageSlider.value, 10);
    const coverageKey = parseInt(coverageSlider.value, 10);
    const coverage = COVERAGE_AMOUNTS[coverageKey];

    const baseRate = (coverage / 100000) * 2.8;
    const ageFactor = age < 30 ? 0.85 : age < 45 ? 1 : age < 60 ? 1.35 : 1.75;
    const typeFactor = TYPE_MULTIPLIERS[currentType];
    const familyFactor = familyRiders ? 1.22 : 1;

    let premium = Math.round(baseRate * ageFactor * typeFactor * familyFactor);
    premium = Math.max(18, Math.min(premium, 499));

    return { premium, age, coverage };
  }

  function updateQuote(animate = true) {
    const { premium, age, coverage } = calculatePremium();

    ageValue.textContent = age;
    coverageValue.textContent = formatCurrency(coverage);

    if (animate) {
      premiumAmount.classList.add("bump");
      setTimeout(() => premiumAmount.classList.remove("bump"), 300);
    }

    premiumAmount.textContent = premium;

    const familyText = familyRiders ? " · family riders" : "";
    premiumNote.textContent = `Based on ${TYPE_LABELS[currentType]} · ${formatCurrency(coverage)} coverage · age ${age}${familyText}`;

    quoteFeatures.innerHTML = TYPE_FEATURES[currentType]
      .map((f) => `<li>${f}</li>`)
      .join("");
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentType = tab.dataset.type;
      updateQuote();
    });
  });

  ageSlider.addEventListener("input", () => updateQuote());
  coverageSlider.addEventListener("input", () => updateQuote());

  familyToggle.addEventListener("click", () => {
    familyRiders = !familyRiders;
    familyToggle.setAttribute("aria-pressed", String(familyRiders));
    updateQuote();
  });

  document.querySelectorAll("[data-scroll]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(el.dataset.scroll);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        mobileDrawer.classList.remove("open");
      }
    });
  });

  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  });

  menuToggle.addEventListener("click", () => {
    mobileDrawer.classList.toggle("open");
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  const statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target.querySelector(".stat__num");
        if (!el || el.dataset.animated) return;
        el.dataset.animated = "true";
        animateCounter(el);
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll(".stat").forEach((stat) => statObserver.observe(stat));

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  const testimonials = document.querySelectorAll(".testimonial");
  const dotsContainer = document.getElementById("sliderDots");
  let currentSlide = 0;
  let autoplayTimer;

  testimonials.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = `slider-dot${i === 0 ? " active" : ""}`;
    dot.setAttribute("aria-label", `Go to testimonial ${i + 1}`);
    dot.addEventListener("click", () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll(".slider-dot");

  function goToSlide(index) {
    testimonials[currentSlide].classList.remove("active");
    dots[currentSlide].classList.remove("active");
    currentSlide = (index + testimonials.length) % testimonials.length;
    testimonials[currentSlide].classList.add("active");
    dots[currentSlide].classList.add("active");
    resetAutoplay();
  }

  document.getElementById("prevTestimonial").addEventListener("click", () => {
    goToSlide(currentSlide - 1);
  });

  document.getElementById("nextTestimonial").addEventListener("click", () => {
    goToSlide(currentSlide + 1);
  });

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(() => goToSlide(currentSlide + 1), 6000);
  }

  resetAutoplay();
  updateQuote(false);
})();
