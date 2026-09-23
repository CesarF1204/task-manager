import { FILTERS, TOAST_MESSAGES } from "../config/constants.js";
import { addTask, validateTaskTitle } from "../services/taskService.js";
import { showToast } from "../components/toast.js";
import { qs } from "../utils/dom.js";

/**
 * DOCU: Binds the quick-add form and reports validation inline.
 * Last Updated Date: September 24, 2026
 * @function initTaskForm
 * @returns {void} Does not return a value
 * @author Cesar
 */
export function initTaskForm() {
    const form = qs("#taskForm");
    const input = qs("#taskInput");
    const error = qs("#taskError");
    if (!form || !input) return;

    const submit = form.querySelector('button[type="submit"]');

    const syncSubmitState = () => {
        if (submit) submit.disabled = !input.value.trim();
    };

    input.addEventListener("input", () => {
        syncSubmitState();
        if (error?.textContent) error.textContent = "";
        input.removeAttribute("aria-invalid");
    });
    syncSubmitState();

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const title = input.value;
        const validationError = validateTaskTitle(title);

        if (validationError) {
            if (error) error.textContent = validationError;
            input.setAttribute("aria-invalid", "true");
            input.focus();
            return;
        }

        try {
            addTask(title);
            form.reset();
            syncSubmitState();
            if (error) error.textContent = "";
            input.removeAttribute("aria-invalid");
            showToast(TOAST_MESSAGES.ADD);
            input.focus();
        } catch {
            showToast(TOAST_MESSAGES.ERROR, { type: "error" });
        }
    });
}

/**
 * DOCU: Returns the currently selected task list filter.
 * Last Updated Date: September 24, 2026
 * @function getActiveFilter
 * @returns {string} Active filter value
 * @author Cesar
 */
export function getActiveFilter() {
    const selected = qs('input[name="taskFilter"]:checked');
    return selected?.value || FILTERS.TODAY;
}
