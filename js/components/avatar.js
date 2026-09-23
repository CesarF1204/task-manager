import { USER_INITIALS, USER_LABEL } from "../config/constants.js";
import { qs } from "../utils/dom.js";

/**
 * DOCU: Renders the compact header avatar.
 * Last Updated Date: September 24, 2026
 * @function initAvatar
 * @returns {void} Does not return a value
 * @author Cesar
 */
export function initAvatar() {
    const avatar = qs("#userAvatar");
    if (!avatar) return;

    avatar.textContent = USER_INITIALS;
    avatar.setAttribute("aria-label", USER_LABEL);
    avatar.title = USER_LABEL;
}
