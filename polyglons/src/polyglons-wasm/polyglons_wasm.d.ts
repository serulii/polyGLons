/* tslint:disable */
/* eslint-disable */
/**
 * Gets a raw mesh representing water in a scene.
 *
 * Has interleaved position (floatx3), and color (floatx3) attributes.
 */
export function water_buf(): Float32Array;
export function water_buf_stride_floats(): number;
export function water_buf_position_size(): number;
export function water_buf_position_offset(): number;
export function water_buf_color_size(): number;
export function water_buf_color_offset(): number;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly water_buf: () => [number, number];
  readonly water_buf_stride_floats: () => number;
  readonly water_buf_position_offset: () => number;
  readonly water_buf_color_size: () => number;
  readonly water_buf_color_offset: () => number;
  readonly water_buf_position_size: () => number;
  readonly __wbindgen_export_0: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
