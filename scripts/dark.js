/**Info*********************************
 * Title--------------------------------
 * dark.js -v1.0
 * Bitburner -v3.0.1
 * 
 * Description--------------------------
 * This script runs a very small heartbleed on the main darkweb server to build charisma.
 * Will replace this with another script that will actually crawl the darkweb and interact with servers.
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
    while(true){
        await ns.dnet.heartbleed("darkweb");
    }
}
