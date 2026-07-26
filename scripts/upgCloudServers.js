/**Info*********************************
 * Title--------------------------------
 * upgCloudServers.js -v1.0
 * Bitburner -v3.0.1
 * 
 * Description--------------------------
 * Only run this script after running purCloudServers.js.
 * This script gives you the total of upgrading all 25 servers to the next tier.
 * Unless 1% of the total money on home is greater than your upgrade total it will not purchase the next upgrade.
 * Just hit the play button on the log to rerun this anytime your 1% is greater than your upgrade cost.
 * 
 * If you'd like to add anything to this to increase readability please submit a request and I will get
 * with you in the order they are received.
 *
 * EDITS--------------------------------
 * 07/26/2025
 * Added more info to Title and description. Moved name to bottom of info. Added Bitburner and Script Version.
 * 
 * Writer-------------------------------
 * Thenosis - 07/25/2026
 */
/** @param {NS} ns */
export async function main(ns) {
  //open the log
  ns.ui.openTail();

  //disable all logs from methods
  ns.disableLog("ALL");

  //get an array of currently owned cloud servers.
  let ownedServers = ns.cloud.getServerNames();

  //get the max RAM limit for cloud servers
  let maxCloudRAM = ns.cloud.getRamLimit();
  
  //get 1% of the current money available
  let homeMoney = ns.getServerMoneyAvailable("home") *  0.01;

  //get cost of upgrading all 25 servers
  let upCost = 0;
  for(let hostName of ownedServers){
    let upgTier = ns.getServerMaxRam(hostName) * 2;
    let upgCost = ns.cloud.getServerUpgradeCost(hostName,upgTier);
    upCost = upCost + upgCost; 
  }

  //Check to see if upCost is less than homeMoney. If so upgrade all servers. If not then say it is too expensive.
  let upgraded = true;
  let tier = 0;
  if(upCost>homeMoney){
    ns.print("Too expensive to upgrade!");
    ns.print("Upgrades would cost: $"+ns.format.number(upCost));
    ns.print("You only have: $"+ns.format.number(homeMoney));
    upgraded = false;
  }else{
    for(let hostName of ownedServers){
      let upgTier = ns.getServerMaxRam(hostName) * 2;
      ns.cloud.upgradeServer(hostName,upgTier);
      tier = ns.getServerMaxRam(hostName);
    }
  }

  if(upgraded){
    ns.print("Upgraded to Tier "+tier+". This cost $"+ns.format.number(upCost)+".");
    ns.print("Remember, the max RAM limit is "+ns.format.number(maxCloudRAM)+"GBs.");
  }

  ns.print("Script ended.");
}
