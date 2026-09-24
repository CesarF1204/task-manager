/**
 * DOCU: Returns the first matching element within an optional root.
 * Last Updated Date: September 24, 2026
 * @function qs
 * @param {string} selector - CSS selector to match
 * @param {ParentNode} [root=document] - Root node to search
 * @returns {Element|null} The matched element, if found
 * @author Cesar
 */
export function qs(selector, root = document) {
    return root.querySelector(selector);
}

/**
 * DOCU: Creates a DOM element with optional properties and children.
 * Last Updated Date: September 24, 2026
 * @function createEl
 * @param {string} tag - HTML tag name
 * @param {Record<string, *>} [props={}] - Properties, attributes, and dataset values
 * @param {(Node|string)[]} [children=[]] - Child nodes or text
 * @returns {HTMLElement} The created element
 * @author Cesar
 */
export function createEl(tag, props = {}, children = []) {
    const element = document.createElement(tag);
    const { dataset, className, classList, textContent, ...rest } = props;

    if (className) element.className = className;
    if (classList) element.classList.add(...classList);
    if (textContent != null) element.textContent = textContent;

    Object.entries(rest).forEach(([key, value]) => {
        if (key.startsWith("on") && typeof value === "function") {
            element.addEventListener(key.slice(2).toLowerCase(), value);
            return;
        }

        if (value === false || value == null) return;

        if (key in element && key !== "list") {
            element[key] = value;
            return;
        }

        element.setAttribute(key, value === true ? "" : String(value));
    });

    if (dataset) {
        Object.entries(dataset).forEach(([key, value]) => {
            element.dataset[key] = String(value);
        });
    }

    children.forEach((child) => {
        if (child == null || child === false) return;
        element.append(child);
    });

    return element;
}

/**
 * DOCU: Toggles an element's hidden state using the hidden attribute.
 * Last Updated Date: September 24, 2026
 * @function setHidden
 * @param {HTMLElement|null} element - Element to show or hide
 * @param {boolean} hidden - Whether the element should be hidden
 * @returns {void} Does not return a value
 * @author Cesar
 */
export function setHidden(element, hidden) {
    if (!element) return;
    element.hidden = hidden;
}
