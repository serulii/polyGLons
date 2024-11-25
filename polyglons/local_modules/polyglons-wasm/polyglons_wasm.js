import * as wasm from "./polyglons_wasm_bg.wasm";
export * from "./polyglons_wasm_bg.js";
import { __wbg_set_wasm } from "./polyglons_wasm_bg.js";
__wbg_set_wasm(wasm);