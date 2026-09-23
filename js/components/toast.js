import { TOAST_DURATION_MS } from "../config/constants.js";
import { createEl, qs } from "../utils/dom.js";

let region;
let hideTimer;

/**
 * DOCU: Initializes the toast live region used for action feedback.
 * Last Updated Date: September 24, 2026
 * @function initToast
 * @returns {HTMLElement} Toast region element
 * @author Cesar
 */
export function initToast() {
    region = qs("#toastRegion");
    return region;
}

/**
 * DOCU: Shows a transient toast message with an optional action.
 * Last Updated Date: September 24, 2026
 * @function showToast
 * @param {string} message - Message to announce
 * @param {{type?: string, actionLabel?: string, onAction?: Function}} [options={}] - Toast options
 * @returns {void} Does not return a value
 * @author Cesar
 */
export function showToast(message, options = {}) {
    if (!region) initToast();
    if (!region) return;

    const { type = "success", actionLabel, onAction } = options;
    clearTimeout(hideTimer);
    region.replaceChildren();

    const toast = createEl("div", {
        className: `toast toast--${type}`,
        role: "status",
    });

    toast.append(createEl("p", { className: "toast__message", textContent: message }));

    if (actionLabel && typeof onAction === "function") {
        toast.append(
            createEl("button", {
                type: "button",
                className: "toast__action",
                textContent: actionLabel,
                onclick: () => {
                    onAction();
                    hideToast();
                },
            }),
        );
    }

    region.append(toast);
    region.dataset.visible = "true";

    hideTimer = window.setTimeout(() => {
        hideToast();
    }, TOAST_DURATION_MS);
}

/**
 * DOCU: Hides the active toast.
 * Last Updated Date: September 24, 2026
 * @function hideToast
 * @returns {void} Does not return a value
 * @author Cesar
 */
export function hideToast() {
    if (!region) return;
    region.dataset.visible = "false";
    region.replaceChildren();
}
