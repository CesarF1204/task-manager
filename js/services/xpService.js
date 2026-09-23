import { XP_PER_LEVEL } from "../config/constants.js";

/**
 * DOCU: Derives level progress from accumulated XP.
 * Last Updated Date: September 24, 2026
 * @function getLevelProgress
 * @param {number} xp - Accumulated experience points
 * @returns {{level: number, xp: number, xpIntoLevel: number, xpForNextLevel: number, percent: number}} Level progress details
 * @author Cesar
 */
export function getLevelProgress(xp) {
    const safeXp = Number.isFinite(xp) ? Math.max(0, Math.floor(xp)) : 0;
    const level = Math.floor(safeXp / XP_PER_LEVEL) + 1;
    const xpIntoLevel = safeXp % XP_PER_LEVEL;

    return {
        level,
        xp: safeXp,
        xpIntoLevel,
        xpForNextLevel: XP_PER_LEVEL,
        percent: (xpIntoLevel / XP_PER_LEVEL) * 100,
    };
}

/**
 * DOCU: Returns the level for a given XP total.
 * Last Updated Date: September 24, 2026
 * @function getLevelFromXp
 * @param {number} xp - Accumulated experience points
 * @returns {number} Derived level
 * @author Cesar
 */
export function getLevelFromXp(xp) {
    return getLevelProgress(xp).level;
}

/**
 * DOCU: Applies an XP delta without dropping below zero.
 * Last Updated Date: September 24, 2026
 * @function applyXpDelta
 * @param {number} xp - Current XP total
 * @param {number} delta - Amount to add or subtract
 * @returns {number} Updated XP total
 * @author Cesar
 */
export function applyXpDelta(xp, delta) {
    return Math.max(0, (Number.isFinite(xp) ? xp : 0) + delta);
}
