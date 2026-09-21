(() => {
  const header = document.querySelector("[data-header]");
  const menu = document.querySelector("[data-menu]");
  const storyLines = [...document.querySelectorAll("[data-story] .story-line")];
  const ring = document.querySelector(".ring-progress");

  const setMenu = (open) => {
    menu?.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };

  document.querySelector("[data-menu-open]")?.addEventListener("click", () => setMenu(true));
  document.querySelectorAll("[data-menu-close]").forEach((el) => {
    el.addEventListener("click", () => setMenu(false));
  });

  const onScroll = () => {
    const compact = window.scrollY > 80;
    header?.classList.toggle("is-scrolled", compact);
    if (window.innerWidth < 981) header?.classList.add("is-compact");
    else header?.classList.remove("is-compact");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  if (storyLines.length) {
    let storyIndex = 0;
    const rotateStory = () => {
      const current = storyLines[storyIndex];
      const nextIndex = (storyIndex + 1) % storyLines.length;
      const next = storyLines[nextIndex];
      current.classList.remove("is-active");
      current.classList.add("is-leaving");
      next.classList.add("is-active");
      ring?.classList.remove("is-running");
      void ring?.offsetWidth;
      ring?.classList.add("is-running");
      setTimeout(() => current.classList.remove("is-leaving"), 500);
      storyIndex = nextIndex;
    };
    setInterval(rotateStory, 4600);
  }

  document.querySelectorAll("video[autoplay]").forEach((v) => {
    v.muted = true;
    v.play().catch(() => {});
  });

  const lightSections = document.querySelectorAll('[data-theme="light"]');
  if (lightSections.length && header) {
    const lightState = new Map();
    const themeIo = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        lightState.set(entry.target, entry.isIntersecting && entry.intersectionRatio > 0.28);
      });
      header.classList.toggle("is-light", [...lightState.values()].some(Boolean));
    }, { threshold: [0.2, 0.35, 0.55] });
    lightSections.forEach((el) => themeIo.observe(el));
  }

  const kernSections = document.querySelectorAll("[data-kern]");
  const pager = document.querySelector("[data-kern-pager]");
  const kernLabel = document.querySelector("[data-kern-label]");
  if (kernSections.length && pager) {
    const kernIo = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) {
        pager.hidden = true;
        if (kernLabel) kernLabel.hidden = true;
        return;
      }
      pager.hidden = false;
      pager.textContent = `${visible.target.dataset.kern} / 04`;
      if (kernLabel) kernLabel.hidden = false;
    }, { threshold: 0.4 });
    kernSections.forEach((el) => kernIo.observe(el));
  }

  const dock = document.querySelector("[data-scan-dock]");
  const footer = document.querySelector("footer");
  if (dock && footer) {
    const footIo = new IntersectionObserver((entries) => {
      dock.classList.toggle("is-hidden", entries[0].isIntersecting);
    }, { threshold: 0.12 });
    footIo.observe(footer);
  }

  const slider = document.querySelector("[data-slider]");
  const track = document.querySelector("[data-slider-track]");
  const cursor = document.querySelector("[data-swipe-cursor]");
  if (slider && track) {
    let x = 0;
    let startX = 0;
    let startOffset = 0;
    let dragging = false;
    let paused = false;

    const maxOffset = () => Math.max(0, track.scrollWidth - slider.clientWidth + 48);
    const apply = (value, animate) => {
      x = Math.min(0, Math.max(-maxOffset(), value));
      track.style.transition = animate ? "transform .7s cubic-bezier(.625,.05,0,1)" : "none";
      track.style.transform = `translate3d(${x}px,0,0)`;
    };

    slider.addEventListener("pointerdown", (e) => {
      dragging = true;
      paused = true;
      startX = e.clientX;
      startOffset = x;
      slider.classList.add("is-dragging");
      slider.setPointerCapture(e.pointerId);
    });
    slider.addEventListener("pointermove", (e) => {
      if (cursor) {
        cursor.hidden = false;
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
      }
      if (!dragging) return;
      apply(startOffset + (e.clientX - startX), false);
    });
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      slider.classList.remove("is-dragging");
      apply(x, true);
      setTimeout(() => { paused = false; }, 900);
    };
    slider.addEventListener("pointerup", endDrag);
    slider.addEventListener("pointercancel", endDrag);
    slider.addEventListener("pointerleave", () => {
      if (cursor) cursor.hidden = true;
    });
    slider.addEventListener("wheel", (e) => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY) && Math.abs(e.deltaY) < 8) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        apply(x - e.deltaX, false);
      }
    }, { passive: false });

    setInterval(() => {
      if (paused || dragging) return;
      const step = (track.children[0]?.offsetWidth || 320) + 16;
      const next = x - step;
      apply(Math.abs(next) >= maxOffset() - 8 ? 0 : next, true);
    }, 3200);
  }

  const counters = document.querySelectorAll("[data-count]");
  const format = (value, el) => {
    const suffix = el.dataset.suffix || "";
    return value.toLocaleString("nl-NL") + suffix;
  };
  const animateCount = (el) => {
    const target = Number(el.dataset.count);
    const start = performance.now();
    const duration = 1400;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(Math.round(target * eased), el);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const countIo = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCount(entry.target);
      countIo.unobserve(entry.target);
    });
  }, { threshold: 0.4 });
  counters.forEach((el) => countIo.observe(el));

  const scan = document.querySelector("[data-scan]");
  const scanForm = document.querySelector("[data-scan-form]");
  const scanDone = document.querySelector("[data-scan-done]");
  const scanSteps = [...document.querySelectorAll("[data-scan-step]")];
  const scanProgress = document.querySelector("[data-scan-progress]");
  const scanBrandInput = document.querySelector("[data-scan-brand-input]");
  const scanScoreEl = document.querySelector("[data-scan-score]");
  const scanScoreCircle = document.querySelector("[data-scan-score-circle]");
  const scanVerdictEl = document.querySelector("[data-scan-verdict]");
  const scanMessageEl = document.querySelector("[data-scan-message]");
  const scanWhatsappEl = document.querySelector("[data-scan-whatsapp]");
  const TOTAL_STEPS = scanSteps.length;
  const SCORE_CIRCUMFERENCE = 2 * Math.PI * 44;

  let scanAnswers = { brand: "", websitePoints: 0, googlePoints: 0, focus: "" };

  const showScanStep = (n) => {
    scanSteps.forEach((el) => el.classList.toggle("is-active", Number(el.dataset.scanStep) === n));
    if (scanProgress) scanProgress.textContent = `Vraag ${n} van ${TOTAL_STEPS}`;
  };

  const resetScan = () => {
    scanAnswers = { brand: "", websitePoints: 0, googlePoints: 0, focus: "" };
    document.querySelectorAll(".scan-option").forEach((btn) => btn.classList.remove("is-selected"));
    if (scanBrandInput) scanBrandInput.value = "";
    if (scanForm) scanForm.hidden = false;
    if (scanDone) scanDone.hidden = true;
    showScanStep(1);
  };

  const openScan = () => {
    if (!scan) return;
    resetScan();
    scan.hidden = false;
    document.body.style.overflow = "hidden";
  };
  const closeScan = () => {
    if (!scan) return;
    scan.hidden = true;
    document.body.style.overflow = "";
  };

  document.querySelectorAll("[data-open-scan]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openScan();
    });
  });
  document.querySelector("[data-close-scan]")?.addEventListener("click", closeScan);
  scan?.addEventListener("click", (e) => {
    if (e.target === scan) closeScan();
  });

  const advanceFromBrandStep = () => {
    const brand = (scanBrandInput?.value || "").trim();
    if (!brand) {
      scanBrandInput?.focus();
      return;
    }
    scanAnswers.brand = brand;
    showScanStep(2);
  };

  scanForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    advanceFromBrandStep();
  });
  document.querySelector("[data-scan-next]")?.addEventListener("click", advanceFromBrandStep);

  const finishScan = () => {
    const raw = 100 - scanAnswers.websitePoints - scanAnswers.googlePoints;
    const score = Math.max(20, Math.min(90, raw));

    let verdict;
    let message;
    if (score >= 75) {
      verdict = "Sterke basis 💪";
      message = `Je doet al veel goed. Met een paar gerichte optimalisaties op het gebied van ${scanAnswers.focus.toLowerCase()} haal je nog meer uit ${scanAnswers.brand}.`;
    } else if (score >= 55) {
      verdict = "Ruimte voor groei";
      message = `Er liggen kansen die ${scanAnswers.brand} nu laat liggen. Met de juiste focus op ${scanAnswers.focus.toLowerCase()} kun je flink groeien.`;
    } else if (score >= 35) {
      verdict = "Hier valt veel te winnen";
      message = `${scanAnswers.brand} laat op dit moment veel potentie liggen, vooral op het gebied van ${scanAnswers.focus.toLowerCase()}. Laten we samen kijken wat er mogelijk is.`;
    } else {
      verdict = "Grote kansen liggen te wachten";
      message = `Er is genoeg ruimte om ${scanAnswers.brand} naar een hoger niveau te tillen, zeker op het gebied van ${scanAnswers.focus.toLowerCase()}. Ik denk graag met je mee.`;
    }

    if (scanVerdictEl) scanVerdictEl.textContent = verdict;
    if (scanMessageEl) scanMessageEl.textContent = message;
    if (scanScoreCircle) {
      scanScoreCircle.style.strokeDasharray = String(SCORE_CIRCUMFERENCE);
      scanScoreCircle.style.strokeDashoffset = String(SCORE_CIRCUMFERENCE);
    }
    if (scanWhatsappEl) {
      const phone = scanWhatsappEl.dataset.phone || "";
      const text = `Hoi! Ik deed de website scan voor ${scanAnswers.brand} en scoorde ${score}/100. Ik wil hier graag over praten.`;
      scanWhatsappEl.href = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    }

    if (scanForm) scanForm.hidden = true;
    if (scanDone) scanDone.hidden = false;

    if (scanScoreEl) {
      const start = performance.now();
      const duration = 900;
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const value = Math.round(score * eased);
        scanScoreEl.textContent = String(value);
        if (scanScoreCircle) {
          scanScoreCircle.style.strokeDashoffset = String(SCORE_CIRCUMFERENCE * (1 - value / 100));
        }
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  };

  document.querySelectorAll("[data-scan-options]").forEach((group) => {
    const kind = group.dataset.scanOptions;
    group.querySelectorAll(".scan-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        group.querySelectorAll(".scan-option").forEach((b) => b.classList.remove("is-selected"));
        btn.classList.add("is-selected");
        const points = Number(btn.dataset.points || 0);

        setTimeout(() => {
          if (kind === "website") {
            scanAnswers.websitePoints = points;
            showScanStep(3);
          } else if (kind === "google") {
            scanAnswers.googlePoints = points;
            showScanStep(4);
          } else if (kind === "focus") {
            scanAnswers.focus = btn.dataset.value || btn.textContent.trim();
            finishScan();
          }
        }, 220);
      });
    });
  });

  const contactForm = document.querySelector("[data-contact-form]");
  const contactDone = document.querySelector("[data-contact-done]");
  contactForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(contactForm);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();
    const nameEl = document.querySelector("[data-contact-name]");
    if (nameEl) nameEl.textContent = name ? `, ${name}` : "";

    const subject = `Contact via website${name ? ` — ${name}` : ""}`;
    const body = `Naam: ${name}\nE-mail: ${email}\n\n${message}`;
    const mailtoHref = `mailto:russchenbertjan@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoHref;

    contactForm.hidden = true;
    if (contactDone) contactDone.hidden = false;
  });
})();
