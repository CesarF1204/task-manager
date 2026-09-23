/**
 * Inline SVG icons used by the task list row actions.
 * Icons inherit color through `currentColor` so CSS controls their state styling.
 */

const svg = (paths) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`;

export const ICONS = {
    /** Incomplete state circle for the complete/undo toggle. */
    circle: svg('<circle cx="12" cy="12" r="9" />'),
    /** Completed state: filled circle with a white check. */
    checkCircle:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10" fill="currentColor" /><path d="m8 12.4 2.6 2.6 5.4-5.6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>',
    /** Edit (pencil in a square). */
    edit: svg(
        '<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />',
    ),
    /** Delete (trash can). */
    trash: svg(
        '<path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M10 11v6" /><path d="M14 11v6" />',
    ),
};