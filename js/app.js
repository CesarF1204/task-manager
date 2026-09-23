import { TOAST_MESSAGES } from "./config/constants.js";
import { initToast, showToast } from "./components/toast.js";
import { renderDailyProgress } from "./features/dailyProgress.js";
import { initBackToTop } from "./features/backToTop.js";
import { initTaskForm } from "./features/taskForm.js";
import { initTaskList, renderTaskList } from "./features/taskList.js";
import { initTaskModals } from "./features/taskModals.js";
import { renderXpProgress } from "./features/xpProgress.js";
import { loadState, subscribe } from "./store/taskStore.js";
import { qs } from "./utils/dom.js";

/**
 * DOCU: Renders today's date and the current local time in the header.
 * Last Updated Date: September 24, 2026
 * @function initHeaderDate
 * @returns {void} Does not return a value
 * @author Cesar
 */
function initHeaderDate() {
    const date = qs("#headerDate");
    if (!date) return;

    const formatter = new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
    });

    const updateDateTime = () => {
        const now = new Date();
        date.textContent = formatter.format(now);
        date.dateTime = now.toISOString();
    };

    updateDateTime();
    window.setInterval(updateDateTime, 1000);
}

/**
 * DOCU: Renders the dynamic copyright year in the footer.
 * Last Updated Date: September 24, 2026
 * @function initFooterYear
 * @returns {void} Does not return a value
 * @author Cesar
 */
function initFooterYear() {
    const year = qs("#footerYear");
    if (!year) return;

    year.textContent = String(new Date().getFullYear());
}

/**
 * DOCU: Refreshes the task list and progress indicators from current state.
 * Last Updated Date: September 24, 2026
 * @function renderApp
 * @returns {void} Does not return a value
 * @author Cesar
 */
function renderApp() {
    renderTaskList();
    renderDailyProgress();
    renderXpProgress();
}

/**
 * DOCU: Starts the Task Manager application.
 * Last Updated Date: September 24, 2026
 * @function initApp
 * @returns {void} Does not return a value
 * @author Cesar
 */
function initApp() {
    try {
        initToast();
        initHeaderDate();
        initFooterYear();
        initTaskModals();
        initTaskForm();
        initTaskList();
        initBackToTop();
        loadState();
        subscribe(renderApp);
        renderApp();
    } catch {
        showToast(TOAST_MESSAGES.ERROR, { type: "error" });
    } finally {
        qs("#appShell")?.removeAttribute("data-loading");
    }
}

document.addEventListener("DOMContentLoaded", initApp);
