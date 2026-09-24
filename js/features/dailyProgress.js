import { FILTERS } from "../config/constants.js";
import { getTaskProgress } from "../services/taskService.js";
import { qs } from "../utils/dom.js";
import { getActiveFilter } from "./taskForm.js";

/**
 * DOCU: Updates the completion summary and accessible text for the active filter.
 * Last Updated Date: September 24, 2026
 * @function renderDailyProgress
 * @returns {void} Does not return a value
 * @author Cesar
 */
export function renderDailyProgress() {
    const section = qs("#taskProgress");
    const heading = qs("#progressHeading");
    const label = qs("#dailyProgressLabel");
    const bar = qs("#dailyProgressBar");
    if (!section || !heading || !label || !bar) return;

    const filter = getActiveFilter();
    const isAll = filter === FILTERS.ALL;
    const scope = isAll ? "all tasks" : "today's tasks";
    const scopeLabel = isAll ? "All Task" : "Today's Task";
    const { completed, total } = getTaskProgress(filter);
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    heading.textContent = scopeLabel;
    section.setAttribute("aria-label", `${scopeLabel} progress`);
    label.textContent =
        total === 0 ? "No tasks yet" : `${completed} / ${total} done`;
    bar.style.setProperty("--progress", `${percent}%`);
    bar.setAttribute("aria-valuenow", String(percent));
    bar.setAttribute("aria-label", `${scopeLabel} task completion`);
    bar.setAttribute(
        "aria-valuetext",
        total === 0 ? `No tasks in ${scope}` : `${completed} of ${total} ${scope} completed`,
    );
}
