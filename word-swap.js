(() => {
  "use strict";

  // Prevent the script from initializing more than once.
  if (window.__wordSwapLoaded) return;
  window.__wordSwapLoaded = true;

  const STYLE_ID = "word-swap-styles";
  const SELECTOR = ".word-swap";
  const ACTIVE_CLASS = "is-in-top-half";

  // Add the CSS automatically.
  function addStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;

    style.textContent = `
      .word-swap {
        display: grid;
      }

      .word-swap > span {
        grid-area: 1 / 1;
        transition:
          opacity 0.7s ease,
          color 0.7s ease;
      }

      .word-swap .before {
        opacity: 1;
        color: inherit;
      }

      .word-swap .after {
        opacity: 0;
        color: #9c6eb5;
        pointer-events: none;
      }

      .word-swap.is-in-top-half .before {
        opacity: 0;
        pointer-events: none;
      }

      .word-swap.is-in-top-half .after {
        opacity: 1;
        pointer-events: auto;
      }
    `;

    document.head.appendChild(style);
  }

  // Watch the top half of the browser window.
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle(
          ACTIVE_CLASS,
          entry.isIntersecting
        );
      });
    },
    {
      root: null,

      // Ignore the bottom half of the viewport.
      rootMargin: "0px 0px -50% 0px",

      threshold: 0.01
    }
  );

  const observed = new WeakSet();

  function observe(element) {
    if (observed.has(element)) return;

    observed.add(element);
    observer.observe(element);
  }

  function findWordSwaps(root) {
    if (
      root instanceof Element &&
      root.matches(SELECTOR)
    ) {
      observe(root);
    }

    if (root.querySelectorAll) {
      root
        .querySelectorAll(SELECTOR)
        .forEach(observe);
    }
  }

  function initialize() {
    addStyles();

    // Find any swaps already on the page.
    findWordSwaps(document);

    // Also watch for swaps added afterward.
    const mutationObserver = new MutationObserver(
      (mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof Element) {
              findWordSwaps(node);
            }
          });
        });
      }
    );

    mutationObserver.observe(
      document.documentElement,
      {
        childList: true,
        subtree: true
      }
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initialize,
      { once: true }
    );
  } else {
    initialize();
  }
})();
