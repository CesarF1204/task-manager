import { getState } from "../store/taskStore.js";
import { getLevelProgress } from "../services/xpService.js";
import { qs } from "../utils/dom.js";

/**
 * DOCU: Updates the compact XP and level indicator, including the
 * next-level tooltip message derived from the current level progression.
 * Last Updated Date: September 24, 2026
 * @function renderXpProgress
 * @returns {void} Does not return a value
 * @author Cesar
 */
export function renderXpProgress() {
    const levelBadge = qs("#levelBadge");
    const xpBadge = qs("#xpBadge");
    const info = qs("#xpInfo");
    if (!levelBadge || !xpBadge || !info) {
        return;
    }

    const progress = getLevelProgress(getState().xp);
    const targetLevel = progress.level + 1;
    const message = `You need ${progress.xpForNextLevel} EXP to reach Level ${targetLevel}. Keep going!`;

    levelBadge.textContent = `Level ${progress.level}`;
    xpBadge.textContent = `EXP ${progress.xp}/${progress.xpForNextLevel}`;
    info.dataset.tooltip = message;
    info.setAttribute("aria-label", message);
}
