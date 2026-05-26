const pdfUrl = "./assets/3-day-skinny-fat-starter-plan.pdf";
import * as pdfjsLib from "./vendor/pdfjs/pdf.mjs";

const chapters = [
  { title: "Cover", kicker: "Starter Plan" },
  { title: "Quick Start", kicker: "Orientation" },
  { title: "Safety Note", kicker: "Read First" },
  { title: "Starter Loop", kicker: "Framework" },
  { title: "Grocery List", kicker: "Shopping" },
  { title: "Prep Block", kicker: "Setup" },
  { title: "Day 1", kicker: "Execution" },
  { title: "Day 2", kicker: "Repetition" },
  { title: "Day 3", kicker: "Reflection" },
  { title: "Easy Swaps", kicker: "Flexibility" },
  { title: "Next Step", kicker: "14-Day System", type: "cta" },
];

const state = {
  pdf: null,
  page: 1,
  pageCount: chapters.length,
  rendering: false,
  queuedPage: null,
};

const canvas = document.querySelector("#slideCanvas");
const ctx = canvas.getContext("2d", { alpha: false });
const frame = document.querySelector("#canvasFrame");
let ctaSlide = document.querySelector("#ctaSlide");
const loadingCard = document.querySelector("#loadingCard");
const chapterList = document.querySelector("#chapterList");
const mobileChapterList = document.querySelector("#mobileChapterList");
const pageStatus = document.querySelector("#pageStatus");
const mobilePageStatus = document.querySelector("#mobilePageStatus");
const progressFill = document.querySelector("#progressFill");
const mobileProgressFill = document.querySelector("#mobileProgressFill");
const currentKicker = document.querySelector("#currentKicker");
const currentTitle = document.querySelector("#currentTitle");
const prevButton = document.querySelector("#prevButton");
const nextButton = document.querySelector("#nextButton");
const prevEdge = document.querySelector("#prevEdge");
const nextEdge = document.querySelector("#nextEdge");
const drawer = document.querySelector("#mobileDrawer");
const menuButton = document.querySelector("#menuButton");
const drawerClose = document.querySelector("#drawerClose");
const drawerBackdrop = document.querySelector("#drawerBackdrop");

function ensureCtaSlide() {
  if (ctaSlide) return ctaSlide;

  ctaSlide = document.createElement("section");
  ctaSlide.className = "cta-slide";
  ctaSlide.id = "ctaSlide";
  ctaSlide.setAttribute("aria-label", "Next step");
  ctaSlide.innerHTML = `
    <div class="cta-inner">
      <p class="cta-kicker">Asset Vault Co.</p>
      <h1>The Next Step</h1>
      <p class="cta-lead">
        If this 3-day starter plan helped you feel organized, the next move is the
        <strong>14-Day Skinny-Fat Cut Meal Prep System.</strong>
      </p>
      <p class="cta-support">
        The 14-Day system gives you a longer structure, more planning support, and a clearer path
        for staying consistent beyond the first few days.
      </p>
      <a
        class="cta-button"
        id="ctaButton"
        href="https://whop.com/asset-vault-co/14-day-skinny-fat-cut-meal-prep-system/?ref=related_products&funnelId=product_7c046451-aaf5-494e-9b90-8d4e13ff7bb6"
        target="_top"
      >
        Unlock the 14-Day System
      </a>
    </div>
  `;
  frame.append(ctaSlide);
  return ctaSlide;
}

function makeChapterButton(chapter, index) {
  const button = document.createElement("button");
  button.className = "chapter-button";
  button.type = "button";
  button.dataset.page = String(index + 1);
  button.innerHTML = `
    <span class="chapter-number">${index + 1}</span>
    <span class="chapter-copy">
      <strong>${chapter.title}</strong>
      <span>${chapter.kicker}</span>
    </span>
  `;
  button.addEventListener("click", () => {
    goTo(index + 1);
    closeDrawer();
  });
  return button;
}

function buildNavigation() {
  chapters.forEach((chapter, index) => {
    chapterList.append(makeChapterButton(chapter, index));
    mobileChapterList.append(makeChapterButton(chapter, index));
  });
}

function updateChrome() {
  const chapter = chapters[state.page - 1] ?? chapters[0];
  const progress = `${(state.page / state.pageCount) * 100}%`;
  pageStatus.textContent = `Page ${state.page} of ${state.pageCount}`;
  mobilePageStatus.textContent = `${state.page} / ${state.pageCount}`;
  progressFill.style.width = progress;
  mobileProgressFill.style.width = progress;
  currentKicker.textContent = chapter.kicker;
  currentTitle.textContent = chapter.title;
  prevButton.disabled = state.page === 1;
  prevEdge.disabled = state.page === 1;
  nextButton.disabled = state.page === state.pageCount;
  nextEdge.disabled = state.page === state.pageCount;

  document.querySelectorAll(".chapter-button").forEach((button) => {
    const isCurrent = Number(button.dataset.page) === state.page;
    if (isCurrent) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });
}

async function renderPage(pageNumber) {
  if (!state.pdf) return;
  if (state.rendering) {
    state.queuedPage = pageNumber;
    return;
  }

  state.rendering = true;
  frame.classList.add("is-changing");
  const chapter = chapters[pageNumber - 1];

  if (chapter?.type === "cta" || pageNumber > state.pdf.numPages) {
    canvas.style.display = "none";
    ensureCtaSlide().classList.add("is-visible");
    loadingCard.classList.add("is-hidden");
    frame.classList.remove("is-changing");
    state.rendering = false;
    return;
  }

  canvas.style.display = "block";
  ensureCtaSlide().classList.remove("is-visible");

  const page = await state.pdf.getPage(pageNumber);
  const availableWidth = Math.max(320, frame.clientWidth);
  const availableHeight = Math.max(180, frame.clientHeight);
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = Math.min(availableWidth / baseViewport.width, availableHeight / baseViewport.height) * window.devicePixelRatio;
  const viewport = page.getViewport({ scale });

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  canvas.style.width = `${Math.floor(viewport.width / window.devicePixelRatio)}px`;
  canvas.style.height = `${Math.floor(viewport.height / window.devicePixelRatio)}px`;

  await page.render({ canvasContext: ctx, viewport }).promise;
  loadingCard.classList.add("is-hidden");
  frame.classList.remove("is-changing");
  state.rendering = false;

  if (state.queuedPage && state.queuedPage !== pageNumber) {
    const queued = state.queuedPage;
    state.queuedPage = null;
    renderPage(queued);
  }
}

function goTo(page) {
  const nextPage = Math.min(Math.max(page, 1), state.pageCount);
  if (nextPage === state.page && canvas.width) return;
  state.page = nextPage;
  updateChrome();
  renderPage(state.page);
}

function next() {
  goTo(state.page + 1);
}

function previous() {
  goTo(state.page - 1);
}

function openDrawer() {
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
}

function closeDrawer() {
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
}

function bindControls() {
  nextButton.addEventListener("click", next);
  nextEdge.addEventListener("click", next);
  prevButton.addEventListener("click", previous);
  prevEdge.addEventListener("click", previous);
  menuButton.addEventListener("click", openDrawer);
  drawerClose.addEventListener("click", closeDrawer);
  drawerBackdrop.addEventListener("click", closeDrawer);

  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
      event.preventDefault();
      next();
    }
    if (event.key === "ArrowLeft" || event.key === "PageUp") {
      event.preventDefault();
      previous();
    }
    if (event.key === "Escape") {
      closeDrawer();
    }
  });

  let startX = 0;
  let startY = 0;
  frame.addEventListener("touchstart", (event) => {
    const touch = event.changedTouches[0];
    startX = touch.clientX;
    startY = touch.clientY;
  }, { passive: true });

  frame.addEventListener("touchend", (event) => {
    const touch = event.changedTouches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    if (Math.abs(dx) > 54 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      if (dx < 0) next();
      if (dx > 0) previous();
    }
  }, { passive: true });

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => renderPage(state.page), 160);
  });
}

async function boot() {
  buildNavigation();
  bindControls();
  updateChrome();

  pdfjsLib.GlobalWorkerOptions.workerSrc = "./vendor/pdfjs/pdf.worker.mjs";
  state.pdf = await pdfjsLib.getDocument(pdfUrl).promise;
  state.pageCount = chapters.length;
  updateChrome();
  await renderPage(state.page);
}

boot().catch((error) => {
  loadingCard.innerHTML = `
    <strong>Could not load</strong>
    <span>${error.message}</span>
  `;
});
