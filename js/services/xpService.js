import {
    XP_COMPLETION_MAX,
    XP_COMPLETION_MIN,
    XP_FIRST_LEVEL_REQUIREMENT,
} from "../config/constants.js";

/**
 * Returns the cumulative EXP threshold required to advance from a level.
 * Level 1 uses its explicit 100 EXP first-step requirement. Every later
 * level follows the same formula: level * 100 + (level - 1) * 10.
 * @param {number} level - Current level (one-based)
 * @returns {number} Cumulative EXP required to reach the next level
 */
export function getXpRequiredForLevel(level) {
    const safeLevel = Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1;
    return safeLevel === 1
        ? XP_FIRST_LEVEL_REQUIREMENT
        : safeLevel * 100 + (safeLevel - 1) * 10;
}

/**
 * Generates a new inclusive 1–10 EXP completion reward.
 * @param {Function} random - Random source, injectable for deterministic tests
 * @returns {number} Random reward from 1 through 10
 */
export function getRandomCompletionXp(random = Math.random) {
    const range = XP_COMPLETION_MAX - XP_COMPLETION_MIN + 1;
    return XP_COMPLETION_MIN + Math.floor(random() * range);
}

/**
 * Derives level progress from accumulated EXP.
 * @param {number} xp - Accumulated experience points
 * @returns {{level: number, xp: number, xpIntoLevel: number, xpForNextLevel: number, xpNeededForNextLevel: number, percent: number}} Level progress details
 */
export function getLevelProgress(xp) {
    const safeXp = Number.isFinite(xp) ? Math.max(0, Math.floor(xp)) : 0;
    let levelStartXp = 0;
    let level = 1;

    while (safeXp >= getXpRequiredForLevel(level)) {
        levelStartXp = getXpRequiredForLevel(level);
        level += 1;
    }

    const xpForNextLevel = getXpRequiredForLevel(level);
    const xpIntoLevel = safeXp - levelStartXp;
    const xpNeededForNextLevel = xpForNextLevel - levelStartXp;
    const percent = Math.min(
        100,
        Math.max(0, (xpIntoLevel / xpNeededForNextLevel) * 100),
    );

    return {
        level,
        xp: safeXp,
        xpIntoLevel,
        xpForNextLevel,
        xpNeededForNextLevel,
        percent,
    };
}

/**
 * Returns the level for a given EXP total.
 * @param {number} xp - Accumulated experience points
 * @returns {number} Derived level
 */
export function getLevelFromXp(xp) {
    return getLevelProgress(xp).level;
}

/**
 * Applies an EXP delta without dropping below zero.
 * @param {number} xp - Current EXP total
 * @param {number} delta - Amount to add or subtract
 * @returns {number} Updated EXP total
 */
export function applyXpDelta(xp, delta) {
    return Math.max(
        0,
        Math.floor(
            (Number.isFinite(xp) ? xp : 0) +
                (Number.isFinite(delta) ? delta : 0),
        ),
    );
}
