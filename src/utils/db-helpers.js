/**
 * Database helpers functions.
 * @module utils/db-helpers
 */

/**
 * Generic way to skip NULL/undefined values for strings
 */
export function column_with_skip(col) {
    return {
        name: col,
        skip: function () {
            let val = this[col];
            return val === null || val === undefined;
        }
    };
}