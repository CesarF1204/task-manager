/**
 * DOCU: Returns today’s date as a YYYY-MM-DD key.
 * Last Updated Date: September 24, 2026
 * @function getTodayKey
 * @returns {string} Local calendar date key
 * @author Cesar
 */
export function getTodayKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/**
 * DOCU: Checks whether a date key matches today.
 * Last Updated Date: September 24, 2026
 * @function isToday
 * @param {string} dateKey - YYYY-MM-DD value to compare
 * @returns {boolean} True when the date is today
 * @author Cesar
 */
export function isToday(dateKey) {
    return dateKey === getTodayKey();
}

/**
 * DOCU: Builds a compact pending/completed summary for the visible list.
 * Last Updated Date: September 24, 2026
 * @function formatListCounts
 * @param {number} pending - Number of incomplete tasks
 * @param {number} done - Number of completed tasks
 * @returns {string} Human-readable counts, for example `2 pending, 7 done`
 * @author Cesar
 */
export function formatListCounts(pending, done) {
    return `${pending} pending, ${done} done`;
}

/**
 * DOCU: Trims extra whitespace from a task title.
 * Last Updated Date: September 24, 2026
 * @function normalizeTitle
 * @param {string} title - Raw title input
 * @returns {string} Normalized title
 * @author Cesar
 */
export function normalizeTitle(title) {
    return String(title ?? "").trim().replace(/\s+/g, " ");
}
