/**
 * DOCU: Opens a native dialog and focuses the preferred element.
 * Last Updated Date: September 24, 2026
 * @function openDialog
 * @param {HTMLDialogElement} dialog - Dialog to open
 * @param {HTMLElement|null} [focusTarget=null] - Element to focus after opening
 * @returns {void} Does not return a value
 * @author Cesar
 */
export function openDialog(dialog, focusTarget = null) {
    if (!dialog) return;
    if (typeof dialog.showModal === "function") {
        dialog.showModal();
    } else {
        dialog.setAttribute("open", "");
    }

    window.requestAnimationFrame(() => {
        (focusTarget || dialog.querySelector("button, input, textarea"))?.focus();
    });
}

/**
 * DOCU: Closes an open dialog if it is currently shown.
 * Last Updated Date: September 24, 2026
 * @function closeDialog
 * @param {HTMLDialogElement} dialog - Dialog to close
 * @returns {void} Does not return a value
 * @author Cesar
 */
export function closeDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.close === "function") {
        dialog.close();
        return;
    }

    dialog.removeAttribute("open");
}

/**
 * DOCU: Binds dismiss handlers for cancel buttons and backdrop clicks.
 * Last Updated Date: September 24, 2026
 * @function bindDialogDismiss
 * @param {HTMLDialogElement} dialog - Dialog to bind
 * @returns {void} Does not return a value
 * @author Cesar
 */
export function bindDialogDismiss(dialog) {
    if (!dialog) return;

    dialog.addEventListener("click", (event) => {
        if (event.target === dialog) closeDialog(dialog);
    });

    dialog.querySelectorAll("[data-dialog-close]").forEach((button) => {
        button.addEventListener("click", () => closeDialog(dialog));
    });
}
