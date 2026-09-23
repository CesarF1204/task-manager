import { LEGACY_TASKS_KEY, STORAGE_KEY } from "../config/constants.js";
import { getTodayKey } from "../utils/format.js";

const listeners = new Set();

let state = {
    tasks: [],
    xp: 0,
};

/**
 * DOCU: Normalizes a stored task into the current shape.
 * Last Updated Date: September 24, 2026
 * @function normalizeTask
 * @param {object} task - Raw task record
 * @returns {object} Normalized task
 * @author Cesar
 */
function normalizeTask(task) {
    return {
        id: String(task.id),
        title: String(task.title ?? "").trim(),
        completed: Boolean(task.completed),
        createdAt: task.createdAt || getTodayKey(),
    };
}

/**
 * DOCU: Reads persisted application state from localStorage.
 * Last Updated Date: September 24, 2026
 * @function readPersistedState
 * @returns {{tasks: object[], xp: number}} Hydrated state
 * @author Cesar
 */
function readPersistedState() {
    const fallback = { tasks: [], xp: 0 };

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            return {
                tasks: Array.isArray(parsed.tasks)
                    ? parsed.tasks.map(normalizeTask)
                    : [],
                xp: Number.isFinite(parsed.xp) ? Math.max(0, parsed.xp) : 0,
            };
        }

        const legacy = localStorage.getItem(LEGACY_TASKS_KEY);
        if (!legacy) return fallback;

        const parsedLegacy = JSON.parse(legacy);
        if (!Array.isArray(parsedLegacy)) return fallback;

        return {
            tasks: parsedLegacy.map(normalizeTask),
            xp: 0,
        };
    } catch {
        return fallback;
    }
}

/**
 * DOCU: Writes the current state to localStorage.
 * Last Updated Date: September 24, 2026
 * @function persistState
 * @returns {void} Does not return a value
 * @author Cesar
 */
function persistState() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
            tasks: state.tasks,
            xp: state.xp,
        }),
    );
}

/**
 * DOCU: Loads persisted tasks and XP into memory.
 * Last Updated Date: September 24, 2026
 * @function loadState
 * @returns {{tasks: object[], xp: number}} Current application state
 * @author Cesar
 */
export function loadState() {
    state = readPersistedState();
    persistState();
    return getState();
}

/**
 * DOCU: Returns a shallow copy of the current state.
 * Last Updated Date: September 24, 2026
 * @function getState
 * @returns {{tasks: object[], xp: number}} Current application state
 * @author Cesar
 */
export function getState() {
    return {
        tasks: [...state.tasks],
        xp: state.xp,
    };
}

/**
 * DOCU: Replaces state, persists it, and notifies subscribers.
 * Last Updated Date: September 24, 2026
 * @function setState
 * @param {{tasks?: object[], xp?: number}} next - Partial state update
 * @returns {{tasks: object[], xp: number}} Updated application state
 * @author Cesar
 */
export function setState(next) {
    state = {
        tasks: next.tasks ? next.tasks.map(normalizeTask) : state.tasks,
        xp: next.xp != null ? Math.max(0, next.xp) : state.xp,
    };

    persistState();
    listeners.forEach((listener) => listener(getState()));
    return getState();
}

/**
 * DOCU: Subscribes to state changes and returns an unsubscribe function.
 * Last Updated Date: September 24, 2026
 * @function subscribe
 * @param {Function} listener - Callback invoked with the latest state
 * @returns {Function} Unsubscribe function
 * @author Cesar
 */
export function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
