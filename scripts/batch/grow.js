/**Info*********************************
 * Title--------------------------------
 * grow.js -v1.0
 * Bitburner -v3.0.1
 * 
 * Description--------------------------
 * A small dummy script that runs only the grow command.
 * Called by motherV2.js
 *
 * EDITS--------------------------------
 * 07/26/2025
 * Added info
 * 
 * Writer-------------------------------
 * Thenosis - 07/26/2026
 */
/** @param {NS} ns */
export async function main(ns) {
  let target = ns.args[0];
  await ns.grow(target);
}
