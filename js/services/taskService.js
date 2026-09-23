import {
    FILTERS,
    MAX_TASK_TITLE_LENGTH,
    MIN_TASK_TITLE_LENGTH,
    VALIDATION_MESSAGES,
    XP_PER_COMPLETION,
} from "../config/constants.js";
import { getState, setState } from "../store/taskStore.js";
import { applyXpDelta, getLevelFromXp } from "./xpService.js";
import { getTodayKey, isToday, normalizeTitle } from "../utils/format.js";

/**
 * DOCU: Validates a task title and returns an error message when invalid.
 * Last Updated Date: September 24, 2026
 * @function validateTaskTitle
 * @param {string} title - Title to validate
 * @returns {string} Error message, or an empty string when valid
 * @author Cesar
 */
export function validateTaskTitle(title) {
    const cleaned = normalizeTitle(title);

    if (!cleaned) return VALIDATION_MESSAGES.REQUIRED;
    if (cleaned.length < MIN_TASK_TITLE_LENGTH) {
        return VALIDATION_MESSAGES.TOO_SHORT;
    }
    if (cleaned.length > MAX_TASK_TITLE_LENGTH) {
        return VALIDATION_MESSAGES.TOO_LONG;
    }

    return "";
}

/**
 * DOCU: Finds a task by id in the current store.
 * Last Updated Date: September 24, 2026
 * @function findTaskById
 * @param {string} id - Task identifier
 * @returns {object|undefined} Matching task, if found
 * @author Cesar
 */
export function findTaskById(id) {
    return getState().tasks.find((task) => task.id === String(id));
}

/**
 * DOCU: Creates a unique identifier for a new task.
 * Last Updated Date: September 24, 2026
 * @function createTaskId
 * @returns {string} Unique task id
 * @author Cesar
 */
function createTaskId() {
    if (globalThis.crypto?.randomUUID) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * DOCU: Adds a new incomplete task without changing XP.
 * Last Updated Date: September 24, 2026
 * @function addTask
 * @param {string} title - Task title
 * @returns {object} Created task
 * @author Cesar
 */
export function addTask(title) {
    const task = {
        id: createTaskId(),
        title: normalizeTitle(title),
        completed: false,
        createdAt: getTodayKey(),
    };

    const { tasks, xp } = getState();
    setState({ tasks: [task, ...tasks], xp });
    return task;
}

/**
 * DOCU: Updates a task title without changing completion or XP.
 * Last Updated Date: September 24, 2026
 * @function updateTaskTitle
 * @param {string} id - Task identifier
 * @param {string} title - New task title
 * @returns {object|null} Updated task, or null when missing
 * @author Cesar
 */
export function updateTaskTitle(id, title) {
    const { tasks, xp } = getState();
    let updated = null;

    const nextTasks = tasks.map((task) => {
        if (task.id !== String(id)) return task;
        updated = { ...task, title: normalizeTitle(title) };
        return updated;
    });

    if (!updated) return null;
    setState({ tasks: nextTasks, xp });
    return updated;
}

/**
 * DOCU: Deletes a task without modifying XP.
 * Last Updated Date: September 24, 2026
 * @function deleteTask
 * @param {string} id - Task identifier
 * @returns {object|null} Deleted task, or null when missing
 * @author Cesar
 */
export function deleteTask(id) {
    const { tasks, xp } = getState();
    const deleted = tasks.find((task) => task.id === String(id));
    if (!deleted) return null;

    setState({
        tasks: tasks.filter((task) => task.id !== deleted.id),
        xp,
    });

    return deleted;
}

/**
 * DOCU: Restores a previously deleted task without modifying XP.
 * Last Updated Date: September 24, 2026
 * @function restoreTask
 * @param {object} task - Task record to restore
 * @returns {object|null} Restored task, or null when invalid
 * @author Cesar
 */
export function restoreTask(task) {
    if (!task?.id) return null;

    const { tasks, xp } = getState();
    if (tasks.some((item) => item.id === task.id)) return task;

    setState({ tasks: [task, ...tasks], xp });
    return task;
}

/**
 * DOCU: Toggles completion and applies XP only when the state actually changes.
 * Last Updated Date: September 24, 2026
 * @function toggleTaskCompletion
 * @param {string} id - Task identifier
 * @returns {{task: object, xpDelta: number, previousLevel: number, nextLevel: number, leveledUp: boolean}|null} Toggle result
 * @author Cesar
 */
export function toggleTaskCompletion(id) {
    const { tasks, xp } = getState();
    const current = tasks.find((task) => task.id === String(id));
    if (!current) return null;

    const completed = !current.completed;
    const xpDelta = completed ? XP_PER_COMPLETION : -XP_PER_COMPLETION;
    const previousLevel = getLevelFromXp(xp);
    const nextXp = applyXpDelta(xp, xpDelta);
    const nextLevel = getLevelFromXp(nextXp);
    const nextTask = { ...current, completed };

    setState({
        tasks: tasks.map((task) => (task.id === nextTask.id ? nextTask : task)),
        xp: nextXp,
    });

    return {
        task: nextTask,
        xpDelta,
        previousLevel,
        nextLevel,
        leveledUp: completed && nextLevel > previousLevel,
    };
}

/**
 * DOCU: Returns tasks for the active list filter.
 * Last Updated Date: September 24, 2026
 * @function getVisibleTasks
 * @param {string} filter - Active list filter
 * @returns {object[]} Visible tasks with incomplete items first
 * @author Cesar
 */
export function getVisibleTasks(filter) {
    const { tasks } = getState();
    const filtered =
        filter === FILTERS.TODAY
            ? tasks.filter((task) => isToday(task.createdAt))
            : tasks;

    return [...filtered].sort((a, b) => Number(a.completed) - Number(b.completed));
}

/**
 * DOCU: Returns today’s completed and total task counts.
 * Last Updated Date: September 24, 2026
 * @function getTodayProgress
 * @returns {{completed: number, total: number}} Daily completion counts
 * @author Cesar
 */
export function getTodayProgress() {
    const todaysTasks = getState().tasks.filter((task) => isToday(task.createdAt));

    return {
        completed: todaysTasks.filter((task) => task.completed).length,
        total: todaysTasks.length,
    };
}
