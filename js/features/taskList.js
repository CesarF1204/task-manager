import { TASK_ANIMATION_MS, TOAST_MESSAGES } from "../config/constants.js";
import { showToast } from "../components/toast.js";
import { ICONS } from "../components/icons.js";
import {
    deleteTask,
    getVisibleTasks,
    toggleTaskCompletion,
} from "../services/taskService.js";
import { createEl, qs, setHidden } from "../utils/dom.js";
import { formatListCounts } from "../utils/format.js";
import { renderDailyProgress } from "./dailyProgress.js";
import { getActiveFilter } from "./taskForm.js";
import {
    openDeleteConfirmation,
    openEditModal,
    openLevelUpModal,
} from "./taskModals.js";

const TASK_PAGE_SIZE = 5;
const LOAD_MORE_THRESHOLD_PX = 320;
const LOAD_MORE_DELAY_MS = 2500;

let visibleTaskCount = TASK_PAGE_SIZE;
let isLoadingMore = false;
let loadRequestId = 0;
let scrollFrame = 0;

/**
 * DOCU: Renders the task list for the active filter, keeps row counts in sync,
 * and restores keyboard focus to the equivalent row action after re-renders.
 * Last Updated Date: September 24, 2026
 * @function renderTaskList
 * @param {{reset?: boolean}} [options] - Render options
 * @returns {void} Does not return a value
 * @author Cesar
 */
export function renderTaskList({ reset = false } = {}) {
    const list = qs("#taskList");
    const empty = qs("#emptyState");
    const loading = qs("#loadingState");
    const loadMoreState = qs("#loadMoreState");
    const counts = qs("#listCounts");
    if (!list) return;

    if (reset) {
        visibleTaskCount = TASK_PAGE_SIZE;
        isLoadingMore = false;
        loadRequestId += 1;
        loadMoreState?.classList.remove("is-loading");
    }
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
    visibleTaskCount = Math.min(visibleTaskCount, tasks.length);
    list.replaceChildren();

    const pending = tasks.filter((task) => !task.completed).length;
    if (counts) counts.textContent = formatListCounts(pending, tasks.length - pending);

    if (!tasks.length) {
        setHidden(list, true);
        setHidden(empty, false);
        setHidden(loadMoreState, true);
        loadMoreState?.classList.remove("is-loading");
        if (activeInList) qs("#taskInput")?.focus();
        return;
    }

    setHidden(list, false);
    setHidden(empty, true);
    const visibleTasks = tasks.slice(0, visibleTaskCount);
    const renderedIds = new Set();
    visibleTasks.forEach((task) => {
        if (renderedIds.has(task.id)) return;
        renderedIds.add(task.id);
        list.append(createTaskItem(task));
    });
    setHidden(loadMoreState, tasks.length <= visibleTasks.length);

    if (!activeInList) return;

    const keySelector = focusKey
        ? `[data-action="${focusKey.action}"][data-id="${focusKey.id}"]`
        : "";
    const revived = keySelector ? list.querySelector(keySelector) : null;
    if (revived instanceof HTMLElement) {
        revived.focus({ preventScroll: true });
        return;
    }

    const rows = [...list.children];
    const fallback = rows[Math.max(0, Math.min(activeIndex, rows.length - 1))];
    const target = fallback?.querySelector("[data-action]") ?? qs("#taskInput");
    target?.focus({ preventScroll: true });
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
            ? `Mark "${task.title}" incomplete`
            : `Mark "${task.title}" complete`,
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
            "aria-haspopup": "dialog",
            "aria-label": `Edit task "${task.title}"`,
            innerHTML: ICONS.edit,
        }),
        createEl("button", {
            type: "button",
            className: "task-item__action task-item__action--danger",
            dataset: { action: "delete", id: task.id },
            "aria-haspopup": "dialog",
            "aria-label": `Delete task "${task.title}"`,
            innerHTML: ICONS.trash,
        }),
    ]);

    item.append(toggle, title, actions);
    return item;
}

/**
 * DOCU: Binds row actions (toggle, edit, delete) and list filters. Pointer-driven
 * completion clicks are blurred before re-render to avoid persistent mobile focus.
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
        if (action === "toggle") {
            if (event.detail > 0) target.blur();
            handleToggle(id);
        }
        if (action === "edit") openEditModal(id);
        if (action === "delete") {
            openDeleteConfirmation(id, () =>
                handleDelete(id, target.closest(".task-item")),
            );
        }
    });

    filters?.addEventListener("change", () => {
        renderTaskList({ reset: true });
        renderDailyProgress();
    });

    window.addEventListener("scroll", scheduleLoadMore, { passive: true });
    window.addEventListener("resize", scheduleLoadMore, { passive: true });
    scheduleLoadMore();
}

/**
 * DOCU: Requests the next task batch when the page approaches the list bottom.
 * @returns {void} Does not return a value
 */
function scheduleLoadMore() {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = 0;
        loadMoreIfNeeded();
    });
}

/**
 * DOCU: Loads one incremental page without allowing concurrent requests.
 * @returns {void} Does not return a value
 */
function loadMoreIfNeeded() {
    const list = qs("#taskList");
    if (!list || list.hidden || isLoadingMore) return;

    const tasks = getVisibleTasks(getActiveFilter());
    if (visibleTaskCount >= tasks.length) return;

    const distanceFromBottom =
        document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
    if (distanceFromBottom > LOAD_MORE_THRESHOLD_PX) return;

    isLoadingMore = true;
    const requestId = ++loadRequestId;
    const loadMoreState = qs("#loadMoreState");
    loadMoreState?.classList.add("is-loading");
    setHidden(loadMoreState, false);

    window.setTimeout(() => {
        if (requestId !== loadRequestId) return;
        isLoadingMore = false;
        loadMoreState?.classList.remove("is-loading");
        setHidden(loadMoreState, true);
        visibleTaskCount = Math.min(visibleTaskCount + TASK_PAGE_SIZE, tasks.length);
        renderTaskList();
        scheduleLoadMore();
    }, LOAD_MORE_DELAY_MS);
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
                ? TOAST_MESSAGES.COMPLETE(result.xpDelta)
                : TOAST_MESSAGES.UNDO_COMPLETE(Math.abs(result.xpDelta)),
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
 * DOCU: Removes a task after a short confirmation-gated animation and disables
 * its controls while the exit animation runs.
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
            showToast(TOAST_MESSAGES.DELETE);
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
