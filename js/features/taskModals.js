import { closeDialog, openDialog, bindDialogDismiss } from "../components/modals.js";
import { showToast } from "../components/toast.js";
import { TOAST_MESSAGES } from "../config/constants.js";
import {
    findTaskById,
    updateTaskTitle,
    validateTaskTitle,
} from "../services/taskService.js";
import { qs } from "../utils/dom.js";

let editId = null;
let deleteId = null;
let onDeleteConfirm = null;

/**
 * DOCU: Binds the edit, delete confirmation, and level-up dialogs.
 * Last Updated Date: September 24, 2026
 * @function initTaskModals
 * @returns {void} Does not return a value
 * @author Cesar
 */
export function initTaskModals() {
    const editDialog = qs("#editDialog");
    const levelDialog = qs("#levelUpDialog");
    const editForm = qs("#editForm");
    const editInput = qs("#editInput");
    const editError = qs("#editError");
    const deleteDialog = qs("#deleteDialog");
    const deleteButton = qs("#confirmDelete");

    bindDialogDismiss(editDialog);
    bindDialogDismiss(levelDialog);
    bindDialogDismiss(deleteDialog);

    editDialog?.addEventListener("close", () => {
        const previousId = editId;
        qs(".task-item.is-editing")?.classList.remove("is-editing");
        editId = null;
        qs(`.task-item[data-id="${previousId}"] [data-action="edit"]`)?.focus();
    });

    deleteDialog?.addEventListener("close", () => {
        const previousId = deleteId;
        deleteId = null;
        onDeleteConfirm = null;
        qs(`.task-item[data-id="${previousId}"] [data-action="delete"]`)?.focus();
    });

    deleteButton?.addEventListener("click", () => {
        if (!deleteId || !onDeleteConfirm) return;
        const selectedId = deleteId;
        const confirmDelete = onDeleteConfirm;
        closeDialog(deleteDialog);
        qs(`.task-item[data-id="${selectedId}"]`)?.querySelectorAll("button")
            .forEach((control) => {
                control.disabled = true;
            });
        confirmDelete();
    });

    editForm?.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!editId || !editInput) return;

        const error = validateTaskTitle(editInput.value, editId);
        if (error) {
            if (editError) editError.textContent = error;
            editInput.setAttribute("aria-invalid", "true");
            editInput.focus();
            return;
        }

        try {
            updateTaskTitle(editId, editInput.value);
            if (editError) editError.textContent = "";
            editInput.removeAttribute("aria-invalid");
            closeDialog(editDialog);
            showToast(TOAST_MESSAGES.EDIT);
        } catch (caughtError) {
            showToast(caughtError.message || TOAST_MESSAGES.ERROR, {
                type: "error",
            });
        }
    });
}

/**
 * DOCU: Opens the edit dialog for the selected task.
 * Last Updated Date: September 24, 2026
 * @function openEditModal
 * @param {string} id - Task identifier
 * @returns {void} Does not return a value
 * @author Cesar
 */
export function openEditModal(id) {
    const task = findTaskById(id);
    const dialog = qs("#editDialog");
    const input = qs("#editInput");
    const error = qs("#editError");
    if (!task || !dialog || !input) return;

    editId = task.id;
    input.value = task.title;
    if (error) error.textContent = "";
    input.removeAttribute("aria-invalid");
    qs(".task-item.is-editing")?.classList.remove("is-editing");
    qs(`.task-item[data-id="${task.id}"]`)?.classList.add("is-editing");
    openDialog(dialog, input);
}

/**
 * DOCU: Opens the destructive-action confirmation for a task. Cancel receives
 * initial focus and native dialog behavior keeps keyboard focus inside the modal.
 * @function openDeleteConfirmation
 * @param {string} id - Task identifier
 * @param {Function} onConfirm - Callback invoked only after confirmation
 * @returns {void} Does not return a value
 * @author Cesar
 */
export function openDeleteConfirmation(id, onConfirm) {
    const task = findTaskById(id);
    const dialog = qs("#deleteDialog");
    const cancelButton = dialog?.querySelector("[data-dialog-close]");
    if (!task || !dialog || typeof onConfirm !== "function") return;

    deleteId = task.id;
    onDeleteConfirm = onConfirm;
    openDialog(dialog, cancelButton);
}

/**
 * DOCU: Shows the level-up dialog for a newly reached level.
 * Last Updated Date: September 24, 2026
 * @function openLevelUpModal
 * @param {number} level - Newly reached level
 * @returns {void} Does not return a value
 * @author Cesar
 */
export function openLevelUpModal(level) {
    const dialog = qs("#levelUpDialog");
    const levelValue = qs("#levelUpValue");
    if (!dialog) return;

    if (levelValue) levelValue.textContent = String(level);
    openDialog(dialog, qs("#levelUpContinue"));
}
