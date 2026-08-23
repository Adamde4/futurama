(() => {
  "use strict";

  /* ============================================================
     CONFIG — edit these values to connect real data/services.
     ============================================================ */
  const CONFIG = {
    // Leave empty to fall back to a mailto: submission for every form
    // on the page (main contact form, both mini lead-forms, and the
    // sticky quick-order widget). Point this at a form backend
    // (e.g. https://formspree.io/f/xxxxxxx) that accepts a POST with
    // JSON to receive submissions directly.
    formEndpoint: "",
    contactEmail: "hello@futurama.example",
  };

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============================================================
     Footer year
     ============================================================ */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ============================================================
     Mobile menu
     ============================================================ */
  const burger = document.getElementById("burgerBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  function closeMobileMenu() {
    if (!burger || !mobileMenu) return;
    burger.setAttribute("aria-expanded", "false");
    mobileMenu.hidden = true;
    document.body.style.overflow = "";
  }

  function toggleMobileMenu() {
    if (!burger || !mobileMenu) return;
    const isOpen = burger.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeMobileMenu();
    } else {
      burger.setAttribute("aria-expanded", "true");
      mobileMenu.hidden = false;
      document.body.style.overflow = "hidden";
    }
  }

  if (burger) burger.addEventListener("click", toggleMobileMenu);
  if (mobileMenu) {
    mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMobileMenu));
  }
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMobileMenu();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 920) closeMobileMenu();
  });

  /* ============================================================
     Reveal-on-scroll
     ============================================================ */
  const revealTargets = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }

  /* ============================================================
     Model catalog filter
     ============================================================ */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const modelCards = document.querySelectorAll(".model-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter");
      filterBtns.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      modelCards.forEach((card) => {
        const size = card.getAttribute("data-size");
        const show = filter === "all" || size === filter;
        card.style.display = show ? "" : "none";
      });
    });
  });

  /* ============================================================
     Prefill "Модель / тип будинку" in the main contact form when a
     catalog card's "Обговорити" link is clicked.
     ============================================================ */
  const houseTypeSelect = document.getElementById("fType");
  document.querySelectorAll(".model-card__link[data-model]").forEach((link) => {
    link.addEventListener("click", () => {
      const model = link.getAttribute("data-model");
      if (houseTypeSelect) {
        const match = Array.from(houseTypeSelect.options).find((opt) => opt.value === model);
        if (match) houseTypeSelect.value = model;
      }
    });
  });

  /* ============================================================
     FAQ accordion
     ============================================================ */
  document.querySelectorAll(".faq__question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      const answer = btn.nextElementSibling;
      btn.setAttribute("aria-expanded", String(!expanded));
      if (answer) {
        answer.style.maxHeight = expanded ? "0px" : `${answer.scrollHeight}px`;
      }
    });
  });

  /* ============================================================
     Wall cross-section interactive
     ============================================================ */
  const wallDiagram = document.getElementById("wallDiagram");
  const wallPanel = document.getElementById("wallPanel");
  const wallHint = document.getElementById("wallHint");

  if (wallDiagram && wallPanel) {
    const layerIds = ["render", "insulation", "sheathing", "frame", "vapor", "interior"];
    const infoBlocks = wallPanel.querySelectorAll(".wall-layer-info");
    let svgRoot = null;

    function getSvgRoot() {
      try {
        const doc = wallDiagram.contentDocument;
        return doc ? doc.documentElement : null;
      } catch (err) {
        return null;
      }
    }

    function activateLayer(layerId) {
      if (!svgRoot) svgRoot = getSvgRoot();
      const wrapper = wallDiagram.closest(".wall-interactive__diagram");
      if (wrapper) wrapper.classList.add("has-active");

      if (svgRoot) {
        svgRoot.classList.add("has-active");
        layerIds.forEach((id) => {
          const g = svgRoot.querySelector(`#layer-${id}`);
          if (g) g.classList.toggle("is-active", id === layerId);
        });
      }

      if (wallHint) wallHint.hidden = true;
      infoBlocks.forEach((block) => {
        block.hidden = block.getAttribute("data-layer") !== layerId;
      });
    }

    wallDiagram.addEventListener("load", () => {
      svgRoot = getSvgRoot();
      if (!svgRoot) return;
      layerIds.forEach((id) => {
        const g = svgRoot.querySelector(`#layer-${id}`);
        if (g) {
          g.addEventListener("click", () => {
            const btn = wallDiagram.closest(".wall-interactive").querySelector(`[data-layer-btn="${id}"]`);
            if (btn) btn.click();
          });
        }
      });
    });

    const layerLabels = {
      render: "Штукатурка",
      insulation: "Утеплення",
      sheathing: "Обшивка",
      frame: "Каркас + вата",
      vapor: "Пароізоляція",
      interior: "Оздоблення",
    };

    const diagramWrapper = wallDiagram.closest(".wall-interactive__diagram");
    if (diagramWrapper) {
      const btnRow = document.createElement("div");
      btnRow.className = "wall-layer-buttons";
      btnRow.setAttribute("role", "tablist");
      btnRow.setAttribute("aria-label", "Шари стіни");

      layerIds.forEach((id) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = layerLabels[id];
        b.setAttribute("role", "tab");
        b.setAttribute("data-layer-btn", id);
        b.setAttribute("aria-selected", "false");
        b.addEventListener("click", () => {
          btnRow.querySelectorAll("button").forEach((x) => x.setAttribute("aria-selected", "false"));
          b.setAttribute("aria-selected", "true");
          activateLayer(id);
        });
        btnRow.appendChild(b);
      });

      diagramWrapper.appendChild(btnRow);
    }
  }

  /* ============================================================
     Shared lead-submission logic (used by the main contact form,
     both mini lead-forms, and the sticky quick-order widget).
     ============================================================ */
  async function submitLead(data, statusEl, submitBtn) {
    if (submitBtn) submitBtn.setAttribute("disabled", "true");
    if (statusEl) {
      statusEl.textContent = "Надсилаємо...";
      statusEl.dataset.state = "";
    }

    try {
      if (CONFIG.formEndpoint) {
        const res = await fetch(CONFIG.formEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);

        if (statusEl) {
          statusEl.textContent = "Дякуємо! Ми зв'яжемось з вами протягом одного робочого дня.";
          statusEl.dataset.state = "success";
        }
        return true;
      }

      // No backend configured: open the visitor's email client with the
      // data pre-filled so it is genuinely sent, rather than faking a
      // success message while discarding the input.
      const subject = encodeURIComponent(`Заявка з сайту Futurama — ${data.name}`);
      const bodyLines = Object.entries(data)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}: ${v}`);
      const body = encodeURIComponent(bodyLines.join("\n"));
      window.location.href = `mailto:${CONFIG.contactEmail}?subject=${subject}&body=${body}`;

      if (statusEl) {
        statusEl.textContent =
          "Форма ще не підключена до бекенду — відкриваємо ваш поштовий клієнт із заповненим листом.";
        statusEl.dataset.state = "success";
      }
      return true;
    } catch (err) {
      if (statusEl) {
        statusEl.textContent = "Не вдалося надіслати. Спробуйте ще раз або зателефонуйте нам напряму.";
        statusEl.dataset.state = "error";
      }
      return false;
    } finally {
      if (submitBtn) submitBtn.removeAttribute("disabled");
    }
  }

  /* ============================================================
     Mini lead-forms (lead blocks + quick-order widget)
     ============================================================ */
  document.querySelectorAll("[data-mini-lead]").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nameField = form.querySelector('[name="name"]');
      const phoneField = form.querySelector('[name="phone"]');
      const statusEl = form.querySelector(".mini-form__status");
      const submitBtn = form.querySelector('button[type="submit"]');

      let valid = true;
      [nameField, phoneField].forEach((field) => {
        if (field && !field.checkValidity()) {
          field.reportValidity();
          valid = false;
        }
      });
      if (!valid) return;

      const data = Object.fromEntries(new FormData(form).entries());
      const ok = await submitLead(data, statusEl, submitBtn);
      if (ok) form.reset();
    });
  });

  /* ============================================================
     Main contact form
     ============================================================ */
  const form = document.getElementById("contactForm");
  const statusEl = document.getElementById("formStatus");

  function setError(id, message) {
    const el = document.getElementById(`err-${id}`);
    if (el) el.textContent = message || "";
  }

  function validateField(field) {
    field.setAttribute("data-touched", "true");
    const key = field.id.replace("f", "").toLowerCase();
    if (field.validity.valid) {
      setError(key, "");
      return true;
    }
    let message = "Перевірте це поле.";
    if (field.validity.valueMissing) message = "Обов'язкове поле.";
    else if (field.validity.patternMismatch && field.name === "phone") message = "Введіть коректний номер телефону.";
    else if (field.validity.tooShort) message = "Занадто коротко.";
    setError(key, message);
    return false;
  }

  if (form) {
    const fields = form.querySelectorAll("input[required], select[required]");
    fields.forEach((field) => field.addEventListener("blur", () => validateField(field)));

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      let isValid = true;
      fields.forEach((field) => {
        if (!validateField(field)) isValid = false;
      });

      if (!isValid) {
        if (statusEl) {
          statusEl.textContent = "Будь ласка, виправте позначені поля.";
          statusEl.dataset.state = "error";
        }
        return;
      }

      const submitBtn = document.getElementById("formSubmit");
      const data = Object.fromEntries(new FormData(form).entries());
      const ok = await submitLead(data, statusEl, submitBtn);
      if (ok) form.reset();
    });
  }

  /* ============================================================
     Sticky quick-order widget
     ============================================================ */
  const quickOrder = document.getElementById("quickOrder");
  const quickOrderClose = document.getElementById("quickOrderClose");
  let quickOrderDismissed = false;

  if (quickOrder) {
    window.addEventListener(
      "scroll",
      () => {
        if (quickOrderDismissed) return;
        const contactSection = document.getElementById("contact");
        const pastHero = window.scrollY > window.innerHeight * 0.8;
        const nearContact = contactSection
          ? window.scrollY + window.innerHeight > contactSection.offsetTop
          : false;
        quickOrder.classList.toggle("is-visible", pastHero && !nearContact);
      },
      { passive: true }
    );
  }
  if (quickOrderClose) {
    quickOrderClose.addEventListener("click", () => {
      quickOrderDismissed = true;
      quickOrder.classList.remove("is-visible");
    });
  }
})();
