/**
 * Shared constants for the Task Manager application.
 */

export const STORAGE_KEY = "task-manager-state";
export const LEGACY_TASKS_KEY = "tasks";

export const XP_COMPLETION_MIN = 1;
export const XP_COMPLETION_MAX = 10;
export const XP_UNDO_COMPLETION = 10;
export const XP_FIRST_LEVEL_REQUIREMENT = 100;

export const MIN_TASK_TITLE_LENGTH = 3;
export const MAX_TASK_TITLE_LENGTH = 120;

export const TOAST_DURATION_MS = 4200;
export const TASK_ANIMATION_MS = 220;

export const FILTERS = {
    TODAY: "today",
    ALL: "all",
};
export const TOAST_MESSAGES = {
    ADD: "Task added successfully.",
    EDIT: "Task updated successfully.",
    COMPLETE: (xpDelta) => `Task completed · +${xpDelta} EXP`,
    UNDO_COMPLETE: (xpDelta) => `Task marked incomplete · -${xpDelta} EXP`,
    DELETE: "Task deleted.",
    ERROR: "Something went wrong. Please try again.",
};

export const VALIDATION_MESSAGES = {
    REQUIRED: "Task title is required.",
    TOO_SHORT: "Task title must contain at least 3 characters.",
    TOO_LONG: "Task title must be 120 characters or fewer.",
    DUPLICATE: "Task title is already taken.",
};
