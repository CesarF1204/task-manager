# Task Manager

A lightweight productivity app for adding, completing, and organizing today’s tasks. The experience stays simple and practical, with a small XP and level system in the background.

There is **no streak functionality**. Daily progress only counts how many of today’s tasks are done.

## Features

- Quick task creation from a single input
- View today’s tasks or the full list
- Complete, undo, edit, and delete tasks
- Three clear row actions: complete/undo (icon reflects state), edit, and delete
- Delete is protected by an undo toast instead of an instant, irreversible remove
- Daily completion summary (`7 / 9 done`)
- Compact XP and level badges
- Level-up dialog only when a new level is actually reached
- Toast feedback for add, edit, complete, undo, delete, and errors
- Delete undo from the toast
- Keyboard-accessible dialogs, toasts, and task controls
- Floating Back to Top button that appears only when the page needs scrolling
- Responsive layout for desktop, tablet, and mobile

## XP and levels

XP changes only when a task’s completion state changes:

| Action | EXP |
| --- | --- |
| Incomplete → Completed | **Randomly +1–10 EXP** |
| Completed → Incomplete | **Always −10 EXP** |
| Delete a task | **Unchanged** |
| Edit a task | **Unchanged** |

The first level requires 100 EXP. Every level after that uses a cumulative threshold of `level × 100 + (level − 1) × 10`: Level 2 starts at 210 EXP, Level 3 at 320 EXP, Level 4 at 430 EXP, and so on without a maximum level. The badges, dedicated level progress bar, accessible progress value, and next-level tooltip are all derived from this formula and refresh immediately after completion or undo. The cumulative EXP badge shows the user's total EXP against the next level’s threshold, for example `EXP 0/100` at Level 1.

Refreshing, re-rendering, sorting, and filtering never award XP.

## Run the application

This is a static front-end app. No build step or extra dependencies are required.

1. Open `index.html` in a current browser, or serve the project folder with any local static server.
2. Example:

```bash
npx serve .
```

Then visit the printed local URL.

Data is stored in `localStorage` under `task-manager-state`.

## Project structure

```
├── README.md
├── index.html
├── css/
│   └── style.css
└── js/
    ├── app.js
    ├── components/
    │   ├── icons.js
    │   ├── modals.js
    │   └── toast.js
    ├── config/
    │   └── constants.js
    ├── features/
    │   ├── backToTop.js
    │   ├── dailyProgress.js
    │   ├── taskForm.js
    │   ├── taskList.js
    │   ├── taskModals.js
    │   └── xpProgress.js
    ├── services/
    │   ├── taskService.js
    │   └── xpService.js
    ├── store/
    │   └── taskStore.js
    └── utils/
        ├── dom.js
        └── format.js
```

The folder layout follows the bootcamp module pattern, adapted for Task Manager instead of student records.

## Development notes

- Entry point: `index.html` loads `./js/app.js` as an ES module.
- Shared values live in `js/config/constants.js`.
- Task CRUD and XP rules live in `js/services/taskService.js`.
- Level math lives in `js/services/xpService.js` and is derived from stored XP.
- Dialogs use the native `<dialog>` element.
- Animations are CSS-only and respect `prefers-reduced-motion`.
