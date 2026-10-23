gsap.registerPlugin(ScrollTrigger);

const EMAIL = "kone11tima@gmail.com";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const mobileRoute = window.matchMedia("(max-width: 700px)").matches;

let smoothScroll = null;

const menuButton = document.querySelector(".menu");
const nav = document.querySelector(".nav");
const copyButton = document.querySelector(".copy-button");
const topbar = document.querySelector(".topbar");

function setMenu(open) {
  const wasOpen = nav.classList.contains("nav--open");
  nav.classList.toggle("nav--open", open);
  menuButton.classList.toggle("menu--open", open);
  menuButton.setAttribute("aria-expanded", String(open));

  if (open && !wasOpen && !reduceMotion) {
    gsap.fromTo(
      nav.querySelectorAll("a"),
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.045, duration: 0.5, ease: "power3.out", overwrite: "auto" },
    );
  }
}

menuButton.addEventListener("click", () => {
  setMenu(!nav.classList.contains("nav--open"));
});

let copyTimer = 0;
copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(EMAIL);
    copyButton.textContent = "Address copied";
    window.clearTimeout(copyTimer);
    copyTimer = window.setTimeout(() => {
      copyButton.textContent = "Copy email address";
    }, 1800);
  } catch {
    copyButton.textContent = "Copy email address";
  }
});

function splitLines(element) {
  if (!element || element.dataset.split === "true") {
    return element ? element.querySelectorAll(".line > span") : [];
  }

  const parts = element.innerHTML
    .split(/<br\s*\/?>/i)
    .map((part) => part.trim())
    .filter(Boolean);

  element.innerHTML = parts
    .map((part) => `<span class="line"><span>${part}</span></span>`)
    .join("");
  element.dataset.split = "true";
  return element.querySelectorAll(".line > span");
}

function splitChars(element) {
  const text = element.textContent.trim();
  element.innerHTML = [...text]
    .map((char) => `<span class="char"><span>${char}</span></span>`)
    .join("");
}

if (reduceMotion) {
  gsap.set(".loader", { autoAlpha: 0, display: "none" });
} else {
  document.documentElement.style.scrollBehavior = "auto";
  play();
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
}

function play() {
  const lenis = setupSmoothScroll();
  const heroLines = splitLines(document.querySelector(".hero h1"));

  document.querySelectorAll("h2, .quote").forEach((title) => {
    if (title.closest(".hero")) return;
    const lines = splitLines(title);
    gsap.from(lines, {
      xPercent: -105,
      duration: 1.15,
      stagger: 0.09,
      ease: "power4.out",
      scrollTrigger: {
        trigger: title,
        start: "top 88%",
        once: true,
      },
    });
  });

  splitChars(document.querySelector(".loader__mark"));
  gsap.set(".topbar", { autoAlpha: 0 });
  gsap.set(heroLines, { xPercent: -105 });
  gsap.set(".hero-visual", { clipPath: "inset(10% 10% 10% 10%)" });

  const counter = { value: 0 };
  const countEl = document.querySelector(".loader__count");

  const intro = gsap.timeline({
    defaults: { ease: "power3.out" },
    onComplete: () => {
      gsap.set(".loader", { display: "none" });
      if (lenis) gsap.delayedCall(1.2, () => startVisit(lenis));
    },
  });

  intro
    .from(".loader__kicker", { autoAlpha: 0, y: 12, duration: 0.55 }, 0.05)
    .from(".char > span", { yPercent: 120, stagger: 0.05, duration: 0.95, ease: "power4.out" }, 0.12)
    .to(".loader__line", { scaleX: 1, duration: 1.25, ease: "power2.inOut" }, 0.28)
    .to(
      counter,
      {
        value: 100,
        duration: 1.25,
        ease: "power2.inOut",
        onUpdate: () => {
          countEl.textContent = String(Math.round(counter.value)).padStart(2, "0");
        },
      },
      0.28,
    )
    .to(".loader", { yPercent: -100, duration: 1.05, ease: "power4.inOut" }, "+=0.08")
    .from(".hero-visual img", { scale: 1.22, duration: 1.85, ease: "power3.out" }, "-=0.85")
    .to(
      ".hero-visual",
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.45,
        ease: "power3.inOut",
        onComplete: () => gsap.set(".hero-visual", { clearProps: "clipPath" }),
      },
      "-=1.35",
    )
    .to(heroLines, { xPercent: 0, duration: 1.2, stagger: 0.1, ease: "power4.out" }, "-=1.15")
    .from(".hero .eyebrow", { x: -28, opacity: 0, duration: 0.8 }, "-=0.95")
    .from(".hero__lead", { x: -32, opacity: 0, duration: 0.9 }, "-=0.72")
    .from(".hero__actions", { x: -24, opacity: 0, duration: 0.85 }, "-=0.64")
    .from(".hero-record", { x: -36, opacity: 0, duration: 1.1, ease: "power4.out" }, "-=0.95")
    .from(".hero-record dl div", { x: -16, opacity: 0, stagger: 0.05, duration: 0.55 }, "-=0.7")
    .from(".hero__foot", { opacity: 0, duration: 0.6 }, "-=0.4")
    .to(".topbar", { autoAlpha: 1, duration: 0.7, ease: "power2.out" }, "-=0.85");

  gsap.fromTo(
    ".hero-visual__pan",
    { yPercent: 0, xPercent: -2 },
    {
      yPercent: 8,
      xPercent: 3,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    },
  );

  gsap.to(".hero__content", {
    y: -48,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  gsap.to(".scroll-progress", {
    scaleX: 1,
    ease: "none",
    scrollTrigger: {
      start: 0,
      end: "max",
      scrub: 0.35,
    },
  });

  rise(".eyebrow", { ignore: ".hero .eyebrow", from: "top" });
  rise(".section-head--split > p", { from: "right" });
  rise(".sectors__intro > p, .origin, .route__key, .bio, .contact-facts > div", { from: "bottom" });

  const route = gsap.timeline({
    scrollTrigger: {
      trigger: ".route",
      start: "top 78%",
      end: "bottom 58%",
      scrub: 0.65,
    },
  });

  gsap.set(".route-step", { opacity: 0, x: -22 });
  route.fromTo(
    ".route__progress",
    { scaleX: mobileRoute ? 1 : 0, scaleY: mobileRoute ? 0 : 1 },
    { scaleX: 1, scaleY: 1, ease: "none", duration: 1 },
    0,
  );

  gsap.utils.toArray(".route-step").forEach((step, index) => {
    route.to(step, { opacity: 1, x: 0, duration: 0.28, ease: "power2.out" }, index * 0.14);
    route.from(
      step.querySelector("i"),
      { scale: 0.2, transformOrigin: "center", duration: 0.22, ease: "power3.out" },
      index * 0.14,
    );
  });

  revealPanels(".service-card", ".service-card__meta, h3, p, a");
  revealPanels(".temperature-grid article", "strong, h3, p");
  revealGroup(".sector-list article");
  revealGroup(".process-list article");
  revealGroup(".rule-list article");
  stageGroupShowcase();

  gsap.set(".cold-image", { clipPath: "inset(0% 100% 0% 0%)" });
  gsap.to(".cold-image", {
    clipPath: "inset(0% 0% 0% 0%)",
    duration: 1.3,
    ease: "power3.inOut",
    scrollTrigger: {
      trigger: ".cold-chain",
      start: "top 78%",
      once: true,
    },
    onComplete: () => gsap.set(".cold-image", { clearProps: "clipPath" }),
  });

  gsap.fromTo(
    ".cold-image img",
    { scale: 1.12, yPercent: -4, xPercent: -4 },
    {
      scale: 1,
      yPercent: 6,
      xPercent: 2,
      ease: "none",
      scrollTrigger: {
        trigger: ".cold-chain",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    },
  );

  gsap.from(".globe-scene", {
    opacity: 0,
    x: -28,
    duration: 1.15,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".globe-scene",
      start: "top 86%",
      once: true,
    },
  });

  gsap.from(".founder-mark", {
    x: -32,
    opacity: 0,
    duration: 1.15,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".founder-mark",
      start: "top 86%",
      once: true,
    },
  });

  gsap.to(".contact-bg", {
    scale: 1.08,
    duration: 7,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  gsap.to(".globe", {
    rotateY: 360,
    duration: 36,
    repeat: -1,
    ease: "none",
  });

  if (finePointer) {
    tilt("[data-tilt]");
    magnet(".button--gold, .nav__contact");
    followGlobe();
  }

  window.addEventListener("load", () => ScrollTrigger.refresh());
  if (lenis) lenis.on("scroll", ScrollTrigger.update);
}

function setupSmoothScroll() {
  if (typeof Lenis === "undefined") return null;

  smoothScroll = new Lenis({
    duration: 1.08,
    easing: (t) => 1 - Math.pow(1 - t, 4),
    smoothWheel: true,
    wheelMultiplier: 0.92,
  });

  smoothScroll.on("scroll", ScrollTrigger.update);
  smoothScroll.on("scroll", ({ scroll, direction }) => {
    topbar.classList.toggle("topbar--solid", scroll > 20);
    const hide = direction === 1 && scroll > 160 && !nav.classList.contains("nav--open");
    topbar.classList.toggle("topbar--hidden", hide);
  });

  gsap.ticker.add((time) => smoothScroll.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      if (link.hasAttribute("data-open-contact")) return;
      const id = link.getAttribute("href");
      const target = id && id.length > 1 ? document.querySelector(id) : null;
      if (!target) return;
      event.preventDefault();
      setMenu(false);
      history.pushState(null, "", id);
      smoothScroll.scrollTo(target, { offset: -84, duration: 1.2 });
    });
  });

  return smoothScroll;
}

function startVisit(lenis) {
  const sections = gsap.utils.toArray("main > section").slice(1);
  const seen = new Set();
  let mode = "rest";
  let restLeft = 0.2;
  let glideElapsed = 0;
  let glideDuration = 1.3;
  let gestureStart = 0;
  let gestureDistance = 0;
  let holdUntil = 0;
  let stopped = false;
  let lastTime = 0;

  const hold = () => {
    holdUntil = performance.now() + 5000;
    mode = "rest";
    restLeft = 0.45;
  };

  window.addEventListener("wheel", hold, { passive: true });
  window.addEventListener("touchstart", hold, { passive: true });
  window.addEventListener("pointerdown", hold);
  window.addEventListener("keydown", (event) => {
    if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) hold();
  });

  const beginGesture = () => {
    const vh = window.innerHeight;
    gestureStart = lenis.scroll;
    gestureDistance = vh * gsap.utils.random(0.34, 0.46);
    glideDuration = gsap.utils.random(0.82, 1.05);
    glideElapsed = 0;
    mode = "glide";
  };

  const beginRest = (extra = 0) => {
    restLeft = gsap.utils.random(0.28, 0.48) + extra;
    mode = "rest";
  };

  gsap.ticker.add((time) => {
    if (stopped || document.hidden || nav.classList.contains("nav--open")) return;
    if (!lastTime) {
      lastTime = time;
      return;
    }

    const dt = Math.min(time - lastTime, 0.05);
    lastTime = time;
    if (performance.now() < holdUntil) return;
    if (lenis.limit > 0 && lenis.scroll >= lenis.limit - 2) {
      stopped = true;
      return;
    }

    const vh = window.innerHeight;
    for (const section of sections) {
      if (seen.has(section)) continue;
      const top = section.getBoundingClientRect().top;
      if (top < vh * 0.08) {
        seen.add(section);
        continue;
      }
      if (top < vh * 0.34) {
        seen.add(section);
        beginRest(gsap.utils.random(0.35, 0.6));
        return;
      }
    }

    if (mode === "rest") {
      restLeft -= dt;
      if (restLeft <= 0) beginGesture();
      return;
    }

    glideElapsed += dt;
    const progress = 1 - Math.pow(1 - Math.min(glideElapsed / glideDuration, 1), 3);
    const target = Math.min(lenis.limit, gestureStart + gestureDistance * progress);
    lenis.scrollTo(target, { immediate: true, force: true });
    ScrollTrigger.update();

    if (glideElapsed >= glideDuration) beginRest();
  });
}

function rise(selector, options = {}) {
  const travel = {
    left: { x: -26, y: 0 },
    right: { x: 28, y: 0 },
    top: { x: 0, y: -18 },
    bottom: { x: 0, y: 22 },
  }[options.from || "left"];

  gsap.utils.toArray(selector).forEach((element) => {
    if (options.ignore && element.matches(options.ignore)) return;
    if (element.closest(".hero")) return;

    gsap.from(element, {
      x: travel.x,
      y: travel.y,
      opacity: 0,
      duration: 0.95,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 90%",
        once: true,
      },
    });
  });
}

function splitCompanyTitle(element) {
  if (!element || element.dataset.split === "true") {
    return element ? element.querySelectorAll(".char > span") : [];
  }

  const encode = (char) =>
    char === "&" ? "&amp;" : char === "<" ? "&lt;" : char === ">" ? "&gt;" : char;

  element.innerHTML = element.textContent
    .trim()
    .split(/\s+/)
    .map((word) => {
      const chars = [...word]
        .map((char) => `<span class="char"><span>${encode(char)}</span></span>`)
        .join("");
      return `<span class="word">${chars}</span>`;
    })
    .join(" ");
  element.dataset.split = "true";
  return element.querySelectorAll(".char > span");
}

function stageGroupShowcase() {
  const showcase = document.querySelector(".group-showcase");
  const figure = showcase?.querySelector("figure");
  const frame = showcase?.querySelector(".group-showcase__frame");
  const image = showcase?.querySelector("img");
  const caption = showcase?.querySelector("figcaption");
  const articles = gsap.utils.toArray(".company-list article");
  if (!showcase || !figure || !frame || !image || !articles.length) return;

  const titles = articles.map((article) => splitCompanyTitle(article.querySelector("h3")));

  gsap.set(figure, { autoAlpha: 0 });
  gsap.set(image, { scale: 1.28, xPercent: 10, filter: "saturate(0.12)", transformOrigin: "62% 48%" });
  gsap.set(caption, { autoAlpha: 0, y: 18 });
  gsap.set(articles, { autoAlpha: 0 });

  articles.forEach((article, index) => {
    gsap.set(article.querySelector(".company-rule"), { scaleX: 0, transformOrigin: "right center" });
    gsap.set(article.querySelector(":scope > span"), { autoAlpha: 0, y: 16 });
    gsap.set(titles[index], { yPercent: 120 });
    gsap.set(article.querySelector(".role"), { clipPath: "inset(0% 0% 0% 100%)" });
    gsap.set(article.querySelector("p:not(.role)"), { autoAlpha: 0, y: 20 });
  });

  ScrollTrigger.create({
    trigger: showcase,
    start: "top 74%",
    once: true,
    onEnter: () => {
      const distance = window.innerWidth - figure.getBoundingClientRect().left + 48;
      gsap.set(figure, { x: distance, scale: 0.94, autoAlpha: 1 });
      gsap.set(frame, { boxShadow: "0 30px 70px rgba(7, 20, 29, 0.28)" });

      const tl = gsap.timeline();
      const travel = window.innerWidth < 800 ? 1.05 : 1.42;

      tl.to(figure, {
        x: 0,
        scale: 1,
        duration: travel,
        ease: "power4.out",
        onComplete: () => gsap.set(figure, { clearProps: "transform" }),
      })
        .to(
          image,
          {
            scale: 1,
            xPercent: 0,
            filter: "saturate(0.65)",
            duration: travel + 0.28,
            ease: "power3.out",
            onComplete: () => {
              gsap.set(image, { clearProps: "transform,filter" });
              figure.classList.add("is-ready");
            },
          },
          0,
        )
        .to(frame, { boxShadow: "0 0px 0px rgba(7, 20, 29, 0)", duration: travel, ease: "power2.out" }, 0)
        .to(caption, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }, travel * 0.72);

      articles.forEach((article, index) => {
        const at = travel * 0.58 + index * 0.46;
        const number = article.querySelector(":scope > span");
        const role = article.querySelector(".role");
        const copy = article.querySelector("p:not(.role)");
        const rule = article.querySelector(".company-rule");

        tl.to(article, { autoAlpha: 1, duration: 0.35, ease: "power2.out" }, at)
          .to(rule, { scaleX: 1, duration: 0.7, ease: "power3.inOut" }, at)
          .to(number, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" }, at)
          .to(
            titles[index],
            { yPercent: 0, stagger: 0.022, duration: 0.78, ease: "power4.out" },
            at + 0.04,
          )
          .to(role, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.55, ease: "power3.inOut" }, at + 0.18)
          .to(copy, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }, at + 0.3);
      });
    },
  });
}

function revealPanels(selector, partSelector) {
  const cards = gsap.utils.toArray(selector);
  if (!cards.length) return;

  cards.forEach((card) => {
    gsap.set(card, { clipPath: "inset(0% 100% 0% 0%)" });
    gsap.set(card.querySelectorAll(partSelector), { autoAlpha: 0, y: 16 });
  });

  ScrollTrigger.batch(selector, {
    start: "top 86%",
    once: true,
    onEnter: (batch) => {
      batch.forEach((card, index) => {
        const bits = card.querySelectorAll(partSelector);
        const delay = index * 0.12;
        gsap.to(card, {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 0.95,
          delay,
          ease: "power3.inOut",
          overwrite: "auto",
          onComplete: () => gsap.set(card, { clearProps: "clipPath" }),
        });
        gsap.to(bits, {
          autoAlpha: 1,
          y: 0,
          stagger: 0.07,
          duration: 0.62,
          delay: delay + 0.2,
          ease: "power3.out",
          overwrite: "auto",
          onComplete: () => gsap.set(bits, { clearProps: "transform,opacity,visibility" }),
        });
      });
    },
  });
}

function revealGroup(selector) {
  const items = gsap.utils.toArray(selector);
  if (!items.length) return;

  gsap.set(items, { clipPath: "inset(0% 100% 0% 0%)" });

  ScrollTrigger.batch(selector, {
    start: "top 88%",
    once: true,
    onEnter: (batch) => {
      gsap.to(batch, {
        clipPath: "inset(0% 0% 0% 0%)",
        stagger: 0.12,
        duration: 1.05,
        ease: "power3.inOut",
        overwrite: "auto",
        onComplete() {
          gsap.set(batch, { clearProps: "clipPath" });
        },
      });
    },
  });
}

function tilt(selector) {
  gsap.utils.toArray(selector).forEach((card) => {
    const rotateX = gsap.quickTo(card, "rotateX", { duration: 0.7, ease: "power3.out" });
    const rotateY = gsap.quickTo(card, "rotateY", { duration: 0.7, ease: "power3.out" });

    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      rotateX(y * -5);
      rotateY(x * 6);
    });

    card.addEventListener("mouseleave", () => {
      rotateX(0);
      rotateY(0);
    });
  });
}

function magnet(selector) {
  gsap.utils.toArray(selector).forEach((button) => {
    const xTo = gsap.quickTo(button, "x", { duration: 0.45, ease: "power3.out" });
    const yTo = gsap.quickTo(button, "y", { duration: 0.45, ease: "power3.out" });

    button.addEventListener("mousemove", (event) => {
      const rect = button.getBoundingClientRect();
      xTo((event.clientX - rect.left - rect.width / 2) * 0.22);
      yTo((event.clientY - rect.top - rect.height / 2) * 0.35);
    });

    button.addEventListener("mouseleave", () => {
      xTo(0);
      yTo(0);
    });
  });
}

function followGlobe() {
  const scene = document.querySelector(".globe-scene");
  const tiltTarget = document.querySelector(".globe-tilt");
  if (!scene || !tiltTarget) return;

  const rotateX = gsap.quickTo(tiltTarget, "rotateX", { duration: 0.9, ease: "power3.out" });
  const rotateY = gsap.quickTo(tiltTarget, "rotateY", { duration: 0.9, ease: "power3.out" });

  scene.addEventListener("mousemove", (event) => {
    const rect = scene.getBoundingClientRect();
    rotateY(((event.clientX - rect.left) / rect.width - 0.5) * 28);
    rotateX(((event.clientY - rect.top) / rect.height - 0.5) * -18);
  });

  scene.addEventListener("mouseleave", () => {
    rotateX(0);
    rotateY(0);
  });
}

const enquiry = document.querySelector(".enquiry");
const enquiryForm = document.querySelector(".enquiry__form");
const enquiryStatus = document.querySelector(".enquiry__status");
let enquiryTrigger = null;

function openEnquiry(trigger) {
  if (!enquiry) return;
  enquiryTrigger = trigger;
  enquiry.hidden = false;
  document.body.classList.add("is-enquiry-open");
  setMenu(false);
  smoothScroll?.stop();
  window.setTimeout(() => enquiry.querySelector("input")?.focus(), 40);
}

function closeEnquiry() {
  if (!enquiry || enquiry.hidden) return;
  enquiry.hidden = true;
  document.body.classList.remove("is-enquiry-open");
  smoothScroll?.start();
  enquiryTrigger?.focus();
}

document.addEventListener(
  "click",
  (event) => {
    const opener = event.target.closest("[data-open-contact]");
    if (opener) {
      event.preventDefault();
      event.stopPropagation();
      openEnquiry(opener);
      return;
    }
    if (event.target.closest("[data-close-contact]")) {
      event.preventDefault();
      closeEnquiry();
    }
  },
  true,
);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeEnquiry();
});

enquiryForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(enquiryForm);
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const company = String(data.get("company") || "").trim();
  const phone = String(data.get("phone") || "").trim();
  const message = String(data.get("message") || "").trim();
  const body = [
    `Name: ${name}`,
    `Email: ${email}`,
    company ? `Company: ${company}` : "",
    phone ? `Phone: ${phone}` : "",
    "",
    message,
  ]
    .filter((line) => line !== "")
    .join("\n");

  enquiryStatus.textContent = "Opening your email…";
  window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(
    `Project enquiry — ${name}`,
  )}&body=${encodeURIComponent(body)}`;
});
