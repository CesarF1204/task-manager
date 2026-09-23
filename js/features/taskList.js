import { TASK_ANIMATION_MS, TOAST_MESSAGES } from "../config/constants.js";
import { showToast } from "../components/toast.js";
import { ICONS } from "../components/icons.js";
import {
    deleteTask,
    getVisibleTasks,
    restoreTask,
    toggleTaskCompletion,
} from "../services/taskService.js";
import { createEl, qs, setHidden } from "../utils/dom.js";
import { formatListCounts } from "../utils/format.js";
import { getActiveFilter } from "./taskForm.js";
import { openEditModal, openLevelUpModal } from "./taskModals.js";

/**
 * DOCU: Renders the task list for the active filter, keeps row counts in sync,
 * and restores keyboard focus to the equivalent row action after re-renders.
 * Last Updated Date: September 24, 2026
 * @function renderTaskList
 * @returns {void} Does not return a value
 * @author Cesar
 */
export function renderTaskList() {
    const list = qs("#taskList");
    const empty = qs("#emptyState");
    const loading = qs("#loadingState");
    const counts = qs("#listCounts");
    if (!list) return;

    setHidden(loading, true);

    const active = document.activeElement;
    const activeInList =
        active instanceof HTMLElement && active.closest("#taskList") === list;
    const focusKey =
        activeInList && active.dataset.action && active.dataset.id
            ? { action: active.dataset.action, id: active.dataset.id }
            : null;
    const activeIndex = activeInList
        ? [...list.children].indexOf(active.closest(".task-item"))
        : -1;

    const tasks = getVisibleTasks(getActiveFilter());
    list.replaceChildren();

    const pending = tasks.filter((task) => !task.completed).length;
    if (counts) counts.textContent = formatListCounts(pending, tasks.length - pending);

    if (!tasks.length) {
        setHidden(list, true);
        setHidden(empty, false);
        if (activeInList) qs("#taskInput")?.focus();
        return;
    }

    setHidden(list, false);
    setHidden(empty, true);
    tasks.forEach((task) => list.append(createTaskItem(task)));

    if (!activeInList) return;

    const keySelector = focusKey
        ? `[data-action="${focusKey.action}"][data-id="${focusKey.id}"]`
        : "";
    const revived = keySelector ? list.querySelector(keySelector) : null;
    if (revived instanceof HTMLElement) {
        revived.focus();
        return;
    }

    const rows = [...list.children];
    const fallback = rows[Math.max(0, Math.min(activeIndex, rows.length - 1))];
    const target = fallback?.querySelector("[data-action]") ?? qs("#taskInput");
    target?.focus();
}

/**
 * DOCU: Creates a single task row with toggle, edit, and delete actions.
 * Last Updated Date: September 24, 2026
 * @function createTaskItem
 * @param {object} task - Task to render
 * @returns {HTMLLIElement} Task list item
 * @author Cesar
 */
function createTaskItem(task) {
    const item = createEl("li", {
        className: `task-item${task.completed ? " is-completed" : ""}`,
        dataset: { id: task.id },
    });

    const toggle = createEl("button", {
        type: "button",
        className: "task-item__toggle",
        dataset: { action: "toggle", id: task.id },
        "aria-label": task.completed
            ? `Mark “${task.title}” incomplete`
            : `Mark “${task.title}” complete`,
        title: task.completed ? "Undo complete" : "Mark complete",
        innerHTML: task.completed ? ICONS.checkCircle : ICONS.circle,
    });

    const title = createEl("span", {
        className: "task-item__title",
        textContent: task.title,
    });

    const actions = createEl("div", { className: "task-item__actions" }, [
        createEl("button", {
            type: "button",
            className: "task-item__action",
            dataset: { action: "edit", id: task.id },
            "aria-label": `Edit “${task.title}”`,
            title: "Edit task",
            innerHTML: ICONS.edit,
        }),
        createEl("button", {
            type: "button",
            className: "task-item__action task-item__action--danger",
            dataset: { action: "delete", id: task.id },
            "aria-label": `Delete “${task.title}”`,
            title: "Delete task",
            innerHTML: ICONS.trash,
        }),
    ]);

    item.append(toggle, title, actions);
    return item;
}

/**
 * DOCU: Binds row actions (toggle, edit, delete) and list filters.
 * Last Updated Date: September 24, 2026
 * @function initTaskList
 * @returns {void} Does not return a value
 * @author Cesar
 */
export function initTaskList() {
    const list = qs("#taskList");
    const filters = qs("#taskFilters");

    list?.addEventListener("click", (event) => {
        const target = event.target.closest("[data-action]");
        if (!target || !(target instanceof HTMLElement)) return;

        const { action, id } = target.dataset;
        if (action === "toggle") handleToggle(id);
        if (action === "edit") openEditModal(id);
        if (action === "delete") handleDelete(id, target.closest(".task-item"));
    });

    filters?.addEventListener("change", () => {
        renderTaskList();
    });
}

/**
 * DOCU: Completes or restores a task and reports the XP change.
 * Last Updated Date: September 24, 2026
 * @function handleToggle
 * @param {string} id - Task identifier
 * @returns {object|null} Toggle result
 * @author Cesar
 */
function handleToggle(id) {
    try {
        const result = toggleTaskCompletion(id);
        if (!result) return null;

        showToast(
            result.task.completed
                ? TOAST_MESSAGES.COMPLETE
                : TOAST_MESSAGES.UNDO_COMPLETE,
        );

        if (result.leveledUp) {
            openLevelUpModal(result.nextLevel);
        }

        return result;
    } catch {
        showToast(TOAST_MESSAGES.ERROR, { type: "error" });
        return null;
    }
}

/**
 * DOCU: Removes a task after a short animation, disables its controls while
 * the exit animation runs, and offers undo through the toast.
 * Last Updated Date: September 24, 2026
 * @function handleDelete
 * @param {string} id - Task identifier
 * @param {HTMLElement|null} item - Task row being removed
 * @returns {void} Does not return a value
 * @author Cesar
 */
function handleDelete(id, item) {
    const neighbourId =
        item?.nextElementSibling instanceof HTMLElement
            ? item.nextElementSibling.dataset.id
            : item?.previousElementSibling instanceof HTMLElement
              ? item.previousElementSibling.dataset.id
              : null;

    item?.querySelectorAll("button").forEach((control) => {
        control.disabled = true;
    });

    const focusAfterRemoval = () => {
        const target = neighbourId
            ? qs(`[data-action="toggle"][data-id="${neighbourId}"]`)
            : null;
        (target instanceof HTMLElement ? target : qs("#taskInput"))?.focus();
    };

    const removed = () => {
        try {
            const deleted = deleteTask(id);
            if (!deleted) return;

            focusAfterRemoval();
            showToast(TOAST_MESSAGES.DELETE, {
                type: "info",
                actionLabel: "Undo",
                onAction: () => {
                    restoreTask(deleted);
                    qs(`[data-action="toggle"][data-id="${deleted.id}"]`)?.focus();
                },
            });
        } catch {
            showToast(TOAST_MESSAGES.ERROR, { type: "error" });
        }
    };

    if (!item || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        removed();
        return;
    }

    item.classList.add("is-deleting");
    window.setTimeout(removed, TASK_ANIMATION_MS);
}
