import { getTodayProgress } from "../services/taskService.js";
import { qs } from "../utils/dom.js";

/**
 * DOCU: Updates the daily completion summary for today's tasks.
 * Last Updated Date: September 24, 2026
 * @function renderDailyProgress
 * @returns {void} Does not return a value
 * @author Cesar
 */
export function renderDailyProgress() {
    const label = qs("#dailyProgressLabel");
    const bar = qs("#dailyProgressBar");
    if (!label || !bar) return;

    const { completed, total } = getTodayProgress();
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    label.textContent =
        total === 0 ? "No tasks yet" : `${completed} / ${total} done`;
    bar.style.setProperty("--progress", `${percent}%`);
    bar.setAttribute("aria-valuenow", String(percent));
    bar.setAttribute(
        "aria-valuetext",
        total === 0 ? "No tasks for today" : `${completed} of ${total} tasks completed`,
    );
}
