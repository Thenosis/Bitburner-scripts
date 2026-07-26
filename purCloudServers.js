/**Info*********************************
 * Title--------------------------------
 * purCloudServers.js -v1.0
 * Bitburner -v3.0.1
 * 
 * Description--------------------------
 * Only run this script on a fresh start after augmentation or BitNode migration.
 * Script will tell you if you do not meet requirements to make purchase.
 *
 * EDITS--------------------------------
 * 07/26/2025
 * Added more info to Title and description.
 * 
 * Writer-------------------------------
 * Thenosis - 07/25/2026
 */
/** @param {NS} ns */
export async function main(ns) {
  //open the log for this script
  ns.ui.openTail();

  //disable all logs from methods
  ns.disableLog("ALL");

  //Get max server limit
  let maxServers = ns.cloud.getServerLimit();

  //Get the cost of purchasing all 25 servers
  let serverCost = ns.cloud.getServerCost(2) * maxServers;

  //get 1% of the current money available
  let homeMoney = ns.getServerMoneyAvailable("home") *  0.01;

  //checks if player can currently afford new servers
  if (serverCost > homeMoney){
    ns.print("Cannot afford new servers!");
    ns.print("They would cost: $"+ns.format.number(serverCost));
    ns.print("Your current 1% is $"+ns.format.number(homeMoney));
  }else{
    for(let i = 0;i < maxServers;i++){
      ns.cloud.purchaseServer("cloud-"+i,2);
    }
    ns.print("You purchased your max servers!");
  }  
}
