(function () {
  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-site-nav]");
  const menuLabel = menuToggle?.querySelector(".sr-only");

  const setHeaderState = () => {
    header?.classList.toggle("scrolled", window.scrollY > 8);
  };

  setHeaderState();
  let headerFrame = 0;
  window.addEventListener(
    "scroll",
    () => {
      if (headerFrame) return;
      headerFrame = window.requestAnimationFrame(() => {
        setHeaderState();
        headerFrame = 0;
      });
    },
    { passive: true }
  );

  const closeMenu = () => {
    nav?.classList.remove("open");
    document.body.classList.remove("menu-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    if (menuLabel) menuLabel.textContent = "Apri menu";
  };

  menuToggle?.addEventListener("click", () => {
    const isOpen = nav?.classList.toggle("open");
    document.body.classList.toggle("menu-open", Boolean(isOpen));
    menuToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
    if (menuLabel) menuLabel.textContent = isOpen ? "Chiudi menu" : "Apri menu";
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav?.classList.contains("open")) {
      closeMenu();
      menuToggle?.focus();
    }
  });

  const desktopMenuQuery = window.matchMedia("(min-width: 981px)");
  const handleDesktopMenu = (event) => {
    if (event.matches) closeMenu();
  };
  if (typeof desktopMenuQuery.addEventListener === "function") {
    desktopMenuQuery.addEventListener("change", handleDesktopMenu);
  } else {
    desktopMenuQuery.addListener(handleDesktopMenu);
  }

  const staggerGroups = document.querySelectorAll(".professionals-grid, .steps, .event-grid, .promotion-grid");
  staggerGroups.forEach((group) => {
    [...group.children].forEach((item, index) => {
      if (item.classList.contains("reveal")) {
        item.style.setProperty("--reveal-delay", `${Math.min(index, 4) * 70}ms`);
      }
    });
  });

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
    );
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("in-view"));
  }

  const navLinks = [...(nav?.querySelectorAll('a[href^="#"]') || [])];
  const navSections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && navSections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (!visible) return;
        navLinks.forEach((link) => {
          const isActive = link.getAttribute("href") === `#${visible.target.id}`;
          link.classList.toggle("active", isActive);
          if (isActive) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      },
      { rootMargin: "-28% 0px -62% 0px", threshold: 0 }
    );
    navSections.forEach((section) => sectionObserver.observe(section));
  }

  const filterButtons = document.querySelectorAll("[data-filter]");
  const professionalCards = document.querySelectorAll(".professional-card[data-area]");
  const professionalTrack = document.querySelector("[data-professional-track]");
  const professionalPrev = document.querySelector("[data-professional-prev]");
  const professionalNext = document.querySelector("[data-professional-next]");
  const professionalStatus = document.querySelector("[data-professional-status]");
  const professionalDesktopQuery = window.matchMedia("(min-width: 981px)");
  let professionalLoopClones = [];
  let professionalLoopResetTimer = 0;

  professionalCards.forEach((card) => {
    card.setAttribute("draggable", "false");
    card.querySelectorAll("img, a").forEach((element) => element.setAttribute("draggable", "false"));
  });

  const visibleProfessionalCards = () => [...professionalCards].filter((card) => !card.hidden);
  const professionalsPerView = () => (professionalDesktopQuery.matches ? 2 : 1);

  const refreshProfessionalLoopClones = () => {
    professionalLoopClones.forEach((clone) => clone.remove());
    professionalLoopClones = [];
    if (!professionalTrack) return;

    const cards = visibleProfessionalCards();
    if (cards.length <= 1) return;

    cards.slice(0, professionalsPerView()).forEach((sourceCard) => {
      const clone = sourceCard.cloneNode(true);
      clone.classList.remove("reveal", "in-view", "delay-1", "delay-2");
      clone.classList.add("professional-loop-clone");
      clone.removeAttribute("data-area");
      clone.setAttribute("data-professional-clone", "true");

      const sourceRequests = [...sourceCard.querySelectorAll("[data-contact-request]")];
      clone.querySelectorAll("[data-contact-request]").forEach((request, index) => {
        request.addEventListener("click", (event) => {
          event.preventDefault();
          sourceRequests[index]?.click();
        });
      });

      professionalTrack.append(clone);
      professionalLoopClones.push(clone);
    });
  };

  const professionalStep = () => {
    const firstCard = visibleProfessionalCards()[0];
    if (!firstCard || !professionalTrack) return 0;
    const gap = Number.parseFloat(window.getComputedStyle(professionalTrack).gap) || 0;
    return firstCard.getBoundingClientRect().width + gap;
  };

  const updateProfessionalCarousel = () => {
    if (!professionalTrack || !professionalStatus || !professionalPrev || !professionalNext) return;
    const cards = visibleProfessionalCards();
    const perView = professionalsPerView();
    const step = professionalStep();
    const currentIndex = step ? Math.round(professionalTrack.scrollLeft / step) : 0;

    const firstVisible = cards.length ? (currentIndex % cards.length) + 1 : 0;
    const lastVisible = cards.length ? ((currentIndex + perView - 1) % cards.length) + 1 : 0;
    const visibleLabel = lastVisible === firstVisible
      ? `${firstVisible}`
      : lastVisible === firstVisible + perView - 1
        ? `${firstVisible}–${lastVisible}`
        : `${firstVisible} e ${lastVisible}`;

    professionalStatus.textContent = cards.length
      ? `${visibleLabel} di ${cards.length} professionisti`
      : "Nessun professionista in quest’area";
    professionalPrev.disabled = cards.length <= 1;
    professionalNext.disabled = cards.length <= 1;
  };

  const moveProfessionalCarousel = (direction) => {
    if (!professionalTrack) return;
    const cards = visibleProfessionalCards();
    const step = professionalStep();
    if (cards.length <= 1 || !step) return;
    const currentIndex = Math.round(professionalTrack.scrollLeft / step);

    if (direction < 0 && currentIndex <= 0) {
      professionalTrack.scrollTo({ left: (cards.length - 1) * step, behavior: "auto" });
      window.requestAnimationFrame(updateProfessionalCarousel);
      return;
    }

    if (direction > 0 && currentIndex >= cards.length) {
      professionalTrack.scrollTo({ left: 0, behavior: "auto" });
      window.requestAnimationFrame(() => {
        professionalTrack.scrollBy({ left: step, behavior: "smooth" });
      });
      return;
    }

    professionalTrack.scrollBy({
      left: direction * step,
      behavior: "smooth"
    });
  };

  professionalPrev?.addEventListener("click", () => moveProfessionalCarousel(-1));
  professionalNext?.addEventListener("click", () => moveProfessionalCarousel(1));

  professionalTrack?.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    moveProfessionalCarousel(event.key === "ArrowLeft" ? -1 : 1);
  });

  professionalTrack?.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });

  let professionalScrollFrame = 0;
  professionalTrack?.addEventListener(
    "scroll",
    () => {
      if (professionalScrollFrame) return;
      professionalScrollFrame = window.requestAnimationFrame(() => {
        updateProfessionalCarousel();
        professionalScrollFrame = 0;
      });

      window.clearTimeout(professionalLoopResetTimer);
      professionalLoopResetTimer = window.setTimeout(() => {
        const cards = visibleProfessionalCards();
        const step = professionalStep();
        if (!cards.length || !step) return;
        const currentIndex = Math.round(professionalTrack.scrollLeft / step);
        if (currentIndex >= cards.length) {
          professionalTrack.scrollTo({ left: 0, behavior: "auto" });
          window.requestAnimationFrame(updateProfessionalCarousel);
        }
      }, 140);
    },
    { passive: true }
  );

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((item) => {
        item.classList.toggle("active", item === button);
        item.setAttribute("aria-selected", String(item === button));
      });
      professionalCards.forEach((card) => {
        const show = filter === "tutti" || card.dataset.area === filter;
        card.hidden = !show;
      });
      window.clearTimeout(professionalLoopResetTimer);
      professionalTrack?.scrollTo({ left: 0, behavior: "auto" });
      refreshProfessionalLoopClones();
      window.requestAnimationFrame(updateProfessionalCarousel);
    });
  });

  const handleProfessionalBreakpoint = () => {
    window.clearTimeout(professionalLoopResetTimer);
    professionalTrack?.scrollTo({ left: 0, behavior: "auto" });
    refreshProfessionalLoopClones();
    window.requestAnimationFrame(updateProfessionalCarousel);
  };
  if (typeof professionalDesktopQuery.addEventListener === "function") {
    professionalDesktopQuery.addEventListener("change", handleProfessionalBreakpoint);
  } else {
    professionalDesktopQuery.addListener(handleProfessionalBreakpoint);
  }
  window.addEventListener("resize", () => window.requestAnimationFrame(updateProfessionalCarousel), { passive: true });
  refreshProfessionalLoopClones();
  updateProfessionalCarousel();

  const serviceCards = document.querySelectorAll("[data-service-card]");

  const closeServiceCard = (card) => {
    const toggle = card.querySelector("[data-service-toggle]");
    const panel = card.querySelector("[data-service-panel]");
    if (!toggle || !panel || toggle.getAttribute("aria-expanded") !== "true") return;

    panel.style.height = `${panel.getBoundingClientRect().height}px`;
    panel.getBoundingClientRect();
    window.requestAnimationFrame(() => {
      panel.style.height = "0px";
    });
    toggle.setAttribute("aria-expanded", "false");
    panel.setAttribute("aria-hidden", "true");
    card.classList.remove("is-open");
  };

  const openServiceCard = (card) => {
    const toggle = card.querySelector("[data-service-toggle]");
    const panel = card.querySelector("[data-service-panel]");
    if (!toggle || !panel) return;

    serviceCards.forEach((item) => {
      if (item !== card) closeServiceCard(item);
    });

    toggle.setAttribute("aria-expanded", "true");
    panel.setAttribute("aria-hidden", "false");
    card.classList.add("is-open");
    panel.style.height = "0px";
    window.requestAnimationFrame(() => {
      panel.style.height = `${panel.scrollHeight}px`;
    });

    panel.addEventListener(
      "transitionend",
      (event) => {
        if (event.target === panel && card.classList.contains("is-open")) {
          panel.style.height = "auto";
        }
      },
      { once: true }
    );
  };

  serviceCards.forEach((card) => {
    const toggle = card.querySelector("[data-service-toggle]");
    toggle?.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeServiceCard(card);
      } else {
        openServiceCard(card);
      }
    });
  });

  const contactForm = document.querySelector("[data-contact-form]");
  const formStatus = document.querySelector("[data-form-status]");
  const areaField = document.querySelector("#area");
  const messageField = document.querySelector("#messaggio");
  const nameField = document.querySelector("#nome");
  let prefillTimer = 0;

  document.querySelectorAll("[data-contact-request]").forEach((request) => {
    request.addEventListener("click", (event) => {
      if (!contactForm || !messageField) return;
      event.preventDefault();

      const requestedArea = request.dataset.area || "";
      const requestedMessage = request.dataset.message || "Vorrei ricevere maggiori informazioni.";
      if (areaField && [...areaField.options].some((option) => option.value === requestedArea)) {
        areaField.value = requestedArea;
      }
      messageField.value = requestedMessage;
      if (formStatus) {
        formStatus.textContent = "Richiesta precompilata: completa i tuoi dati e premi Invia richiesta.";
        formStatus.classList.remove("error");
      }

      window.clearTimeout(prefillTimer);
      contactForm.classList.add("prefilled");
      contactForm.scrollIntoView({ behavior: "smooth", block: "start" });
      prefillTimer = window.setTimeout(() => contactForm.classList.remove("prefilled"), 2600);

      if (window.matchMedia("(min-width: 681px) and (pointer: fine)").matches) {
        window.setTimeout(() => nameField?.focus({ preventScroll: true }), 650);
      }
    });
  });

  contactForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!formStatus) return;

    formStatus.textContent = "Invio in corso...";
    formStatus.classList.remove("error");

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" },
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Non è stato possibile inviare il messaggio.");
      }
      formStatus.textContent = result.message;
      contactForm.reset();
    } catch (error) {
      formStatus.textContent = error.message || "Si è verificato un errore. Riprova o contatta lo studio telefonicamente.";
      formStatus.classList.add("error");
    }
  });

  const promo = document.querySelector("[data-promo-widget]");
  const promoIcon = document.querySelector("[data-promo-icon]");
  const promoPanel = document.querySelector("[data-promo-panel]");
  const promoClose = document.querySelector("[data-promo-close]");
  const promoCta = document.querySelector("[data-promo-cta]");
  const cornerKey = "psicoeducandoPromoCorner";
  const seenKey = "psicoeducandoPromoSeen";
  const memoryStore = {};
  const storage = {
    get(key) {
      try {
        return window.localStorage?.getItem(key) || memoryStore[key] || "";
      } catch {
        return memoryStore[key] || "";
      }
    },
    set(key, value) {
      memoryStore[key] = value;
      try {
        window.localStorage?.setItem(key, value);
      } catch {
        // Some privacy-focused browsers disable localStorage.
      }
    },
  };

  const corners = ["corner-br", "corner-bl", "corner-tr", "corner-tl"];
  const openPromo = () => {
    promoPanel?.classList.add("open");
    promoPanel?.setAttribute("aria-hidden", "false");
  };
  const closePromo = () => {
    promoPanel?.classList.remove("open");
    promoPanel?.setAttribute("aria-hidden", "true");
    storage.set(seenKey, "1");
  };
  const setCorner = (corner) => {
    if (!promo || !corners.includes(corner)) return;
    promo.classList.remove(...corners);
    promo.classList.add(corner);
    promo.style.removeProperty("left");
    promo.style.removeProperty("right");
    promo.style.removeProperty("top");
    promo.style.removeProperty("bottom");
    storage.set(cornerKey, corner);
  };

  const mobilePromoQuery = window.matchMedia("(max-width: 680px)");
  const isMobilePromo = () => mobilePromoQuery.matches;
  setCorner(isMobilePromo() ? "corner-br" : storage.get(cornerKey) || "corner-br");

  let startX = 0;
  let startY = 0;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let moved = false;
  let dragging = false;
  let activePointerId = null;
  let originCorner = "corner-br";
  let snapTimer = 0;

  const dragBounds = () => {
    const gap = 12;
    const width = promo?.offsetWidth || 66;
    const height = promo?.offsetHeight || 66;
    return {
      minX: gap,
      maxX: Math.max(gap, window.innerWidth - width - gap),
      minY: gap,
      maxY: Math.max(gap, window.innerHeight - height - gap),
    };
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const startDrag = (event) => {
    if (!promo || !promoIcon || isMobilePromo() || (event.button !== undefined && event.button !== 0)) return;
    window.clearTimeout(snapTimer);
    const rect = promo.getBoundingClientRect();
    originCorner = corners.find((corner) => promo.classList.contains(corner)) || "corner-br";
    dragging = true;
    moved = false;
    activePointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    dragOffsetX = event.clientX - rect.left;
    dragOffsetY = event.clientY - rect.top;

    promo.classList.remove(...corners);
    promo.classList.add("is-dragging");
    promo.style.left = `${rect.left}px`;
    promo.style.top = `${rect.top}px`;
    promo.style.right = "auto";
    promo.style.bottom = "auto";
    promoPanel?.classList.remove("open");
    promoPanel?.setAttribute("aria-hidden", "true");
    promoIcon.setAttribute("aria-grabbed", "true");
    document.body.classList.add("promo-dragging");
    promoIcon.setPointerCapture?.(event.pointerId);
    bindDragEvents();
    event.preventDefault();
  };

  const trackDrag = (event) => {
    if (!dragging || (activePointerId !== null && event.pointerId !== activePointerId) || !promo) return;
    const distance = Math.hypot(event.clientX - startX, event.clientY - startY);
    if (distance > 7) {
      moved = true;
    }

    const bounds = dragBounds();
    const nextX = clamp(event.clientX - dragOffsetX, bounds.minX, bounds.maxX);
    const nextY = clamp(event.clientY - dragOffsetY, bounds.minY, bounds.maxY);
    promo.style.left = `${nextX}px`;
    promo.style.top = `${nextY}px`;
    event.preventDefault();
  };

  const finishDrag = (event) => {
    if (!dragging || (activePointerId !== null && event.pointerId !== activePointerId) || !promo || !promoIcon) return;
    unbindDragEvents();
    dragging = false;
    activePointerId = null;
    promo.classList.remove("is-dragging");
    promoIcon.setAttribute("aria-grabbed", "false");
    document.body.classList.remove("promo-dragging");

    if (!moved) {
      setCorner(originCorner);
      openPromo();
      return;
    }

    const rect = promo.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const horizontal = centerX < window.innerWidth / 2 ? "l" : "r";
    const vertical = centerY < window.innerHeight / 2 ? "t" : "b";
    const targetCorner = `corner-${vertical}${horizontal}`;
    const edge = 18;
    const topEdge = getComputedStyle(document.documentElement).getPropertyValue("--header-h");
    const headerHeight = Number.parseFloat(topEdge) || 0;
    const targetX = horizontal === "l" ? edge : window.innerWidth - rect.width - edge;
    const targetY = vertical === "t" ? headerHeight + edge : window.innerHeight - rect.height - edge;

    promo.style.left = `${targetX}px`;
    promo.style.top = `${targetY}px`;
    snapTimer = window.setTimeout(() => setCorner(targetCorner), 500);
  };

  const bindDragEvents = () => {
    window.addEventListener("pointermove", trackDrag, { passive: false });
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);
  };

  const unbindDragEvents = () => {
    window.removeEventListener("pointermove", trackDrag);
    window.removeEventListener("pointerup", finishDrag);
    window.removeEventListener("pointercancel", finishDrag);
  };

  promoIcon?.addEventListener("pointerdown", startDrag);
  promoIcon?.addEventListener("click", () => {
    if (!isMobilePromo() || moved) return;
    if (promoPanel?.classList.contains("open")) {
      closePromo();
    } else {
      openPromo();
    }
  });
  promoClose?.addEventListener("click", closePromo);
  promoCta?.addEventListener("click", () => {
    closePromo();
    if (messageField && !messageField.value.includes("PSICO10")) {
      messageField.value = "Vorrei informazioni sul bonus di benvenuto PSICO10.";
    }
  });

  window.setTimeout(() => {
    if (!isMobilePromo() && !storage.get(seenKey)) {
      openPromo();
    }
  }, 8500);

  const eventLightbox = document.querySelector("[data-event-lightbox]");
  const eventLightboxImage = eventLightbox?.querySelector("[data-event-lightbox-image]");
  const eventLightboxCaption = eventLightbox?.querySelector("[data-event-lightbox-caption]");
  let eventLightboxTrigger = null;

  const closeEventLightbox = () => {
    if (!eventLightbox?.open) return;
    if (typeof eventLightbox.close === "function") {
      eventLightbox.close();
    } else {
      eventLightbox.removeAttribute("open");
      eventLightbox.dispatchEvent(new Event("close"));
    }
  };

  document.querySelectorAll("[data-event-image]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      if (!eventLightbox || !eventLightboxImage || !eventLightboxCaption) return;
      const thumbnail = link.querySelector("img");
      const title = link.closest(".event-card")?.querySelector("h3")?.textContent?.trim() || "Locandina evento";
      eventLightboxTrigger = link;
      eventLightboxImage.src = link.getAttribute("href") || thumbnail?.currentSrc || thumbnail?.src || "";
      eventLightboxImage.alt = thumbnail?.alt || title;
      eventLightboxCaption.textContent = title;
      if (typeof eventLightbox.showModal === "function") {
        eventLightbox.showModal();
      } else {
        eventLightbox.setAttribute("open", "");
      }
      document.body.classList.add("modal-open");
      eventLightbox.querySelector("[data-event-lightbox-close]")?.focus();
    });
  });

  eventLightbox?.querySelector("[data-event-lightbox-close]")?.addEventListener("click", closeEventLightbox);
  eventLightbox?.addEventListener("click", (event) => {
    if (event.target === eventLightbox) closeEventLightbox();
  });
  eventLightbox?.addEventListener("close", () => {
    if (!document.querySelector("dialog[open]")) document.body.classList.remove("modal-open");
    eventLightboxTrigger?.focus();
    eventLightboxTrigger = null;
  });

  const legalDialogs = document.querySelectorAll("[data-legal-dialog]");
  let legalTrigger = null;

  const closeLegalDialog = (dialog) => {
    if (!dialog?.open) return;
    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
      dialog.dispatchEvent(new Event("close"));
    }
  };

  document.querySelectorAll("[data-legal-open]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const dialog = document.querySelector(`[data-legal-dialog="${button.dataset.legalOpen}"]`);
      if (!dialog) return;
      legalTrigger = button;
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }
      document.body.classList.add("modal-open");
    });
  });

  legalDialogs.forEach((dialog) => {
    dialog.querySelector("[data-legal-close]")?.addEventListener("click", () => closeLegalDialog(dialog));
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeLegalDialog(dialog);
    });
    dialog.addEventListener("close", () => {
      if (![...legalDialogs].some((item) => item.open)) {
        document.body.classList.remove("modal-open");
      }
      legalTrigger?.focus();
      legalTrigger = null;
    });
  });
})();
