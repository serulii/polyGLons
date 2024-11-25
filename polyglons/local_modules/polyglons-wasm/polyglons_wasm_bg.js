let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}

/**
 * This gets a nice number.
 * @returns {number}
 */
export function get_number() {
    const ret = wasm.get_number();
    return ret;
}

