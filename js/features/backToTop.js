import { qs } from "../utils/dom.js";

/**
 * DOCU: Binds the floating Back to Top button. An invisible sentinel sits
 * 50vh below the top of the page; with a -40% bottom rootMargin the button
 * only appears once the user scrolls past that point, which requires the
 * page to be taller than 1.5 viewports — so short, non-scrollable pages
 * never show it. Clicking scrolls smoothly back to the top.
 * Last Updated Date: September 24, 2026
 * @function initBackToTop
 * @returns {void} Does not return a value
 * @author Cesar
 */
export function initBackToTop() {
    const button = qs("#backToTop");
    const sentinel = qs("#backToTopSentinel");
    if (!button || !sentinel) return;

    const setVisibility = (visible) => {
        if (visible) {
            button.classList.add("is-visible");
            button.removeAttribute("aria-hidden");
            return;
        }

        if (document.activeElement === button) button.blur();
        button.setAttribute("aria-hidden", "true");
        button.classList.remove("is-visible");
    };

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            ([entry]) => setVisibility(!entry.isIntersecting),
            { rootMargin: "0px 0px -40% 0px" },
        );
        observer.observe(sentinel);
    } else {
        const sync = () =>
            setVisibility(
                window.scrollY > window.innerHeight * 0.5 &&
                    document.documentElement.scrollHeight >
                        window.innerHeight * 1.5,
            );
        window.addEventListener("scroll", sync, { passive: true });
        window.addEventListener("resize", sync, { passive: true });
        sync();
    }

    button.addEventListener("click", () => {
        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
}