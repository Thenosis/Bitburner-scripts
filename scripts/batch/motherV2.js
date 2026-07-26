/**Info*********************************
 * Title--------------------------------
 * motherv2.js -v1.0
 * Bitburner -v3.0.1
 * 
 * Description--------------------------
 * The second iteration of my mother script.
 * Heavy use of AI as I didn't understand concepts the way I do now.
 * Will be replaced with mother.js v3.0 once I have written it myself.
 *
 * EDITS--------------------------------
 * 07/26/2025
 * Added more info to description.
 * 
 * Writers------------------------------
 * Google Gemini
 * Thenosis - 07/25/2026
 */
/** @param {NS} ns */
export async function main(ns) {
 
  /**----------------------------------------------------------------------------------------- */
  //disable logs for various functions. Comment this out to enable logging.
  ns.disableLog("ALL");
  /**----------------------------------------------------------------------------------------- */
  let networkPool = serverCrawler(ns, true);
  let deployPIDs = [];
  for(let server of networkPool){
    let pid = ns.exec("nuke.js","home",1,server);
    if(pid > 0){
      deployPIDs.push(pid);
    }
  }
  let checkDeploy = true;
  while(checkDeploy){
    let stillRunning = false;
    for(let pid of deployPIDs){
      if(ns.isRunning(pid) === true){
        stillRunning = true;
        break;
      }
    }
    if(stillRunning === true){
      await ns.sleep(1000);
    }else{
      checkDeploy = false;
    }
  }
  let activeWorkers = serverCrawler(ns, false);
  /**----------------------------------------------------------------------------------------- */

  //opens the log to view the running script.
  ns.ui.openTail();
 
  //sets the target variable to the server in the arguments of run
  let target = ns.args[0];

  ns.print("***********************");

  /**----------------------------------------------------------------------------------------- */  
 
  //gets the minimum and current security level of the server and prints it to the log.
  let minSecurity = ns.getServerMinSecurityLevel(target) + 2;
 

  ns.print("Minimum Security + 1: "+minSecurity+".");
  //ns.print("Current Security: "+ Math.floor(currSecurity) +".");

  /**----------------------------------------------------------------------------------------- */
 
  //gets the server's maximum and current money and prints it to the log.
  let maxMoney = ns.getServerMaxMoney(target);
 

  ns.print("Max Money: "+"$"+ns.format.number(maxMoney));
  //ns.print("Current Money: "+"$"+ns.format.number(currMoney));

  /**----------------------------------------------------------------------------------------- */

  let mother = true;
  let totalGained = 0;

  while(mother){
    let currSecurity = ns.getServerSecurityLevel(target);
    let currMoney = ns.getServerMoneyAvailable(target);
   
    let okayWeaken = false;
    while (!okayWeaken){
      if (currSecurity >= minSecurity){
        ns.print("***********************");
        ns.print("Weakening...");
        let weakenPIDs = [];
        for(let currentWorker of activeWorkers){
          let currRAM = ns.getServerMaxRam(currentWorker);
          let scriptRAM = ns.getScriptRam("weaken.js");
          let usedRAM = ns.getServerUsedRam(currentWorker);
          let availRAM = currRAM - usedRAM;
          if (currentWorker === "home"){
            availRAM = availRAM - 35;
          }
          let threadCount = Math.floor(availRAM / scriptRAM);
            if (threadCount > 0){
              let pid = ns.exec("weaken.js", currentWorker , Math.floor(threadCount), target);
              if(pid > 0){
                weakenPIDs.push(pid);
              }
            }
        }
        let checkWeaken = true;
        while(checkWeaken){
          let stillRunning = false;
          for(let pid of weakenPIDs){
            if(ns.isRunning(pid) === true){
              stillRunning = true;
              break;
            }
          }
          if(stillRunning === true){
            await ns.sleep(1000);
          }else{
            checkWeaken = false;
          }
        }
      }else if (currSecurity <= minSecurity){
        okayWeaken = true;
        ns.print("Ready to Grow!");
      }
      currSecurity = ns.getServerSecurityLevel(target);
      ns.print("Current Security:" + Math.floor(currSecurity));
    }
 
    let okayGrow = false;
    while (!okayGrow) {
    if (currMoney < maxMoney) {
        ns.print("***********************");
        ns.print("Growing & Counter-Weakening...");

        // 1. Determine total available global threads for grow and weaken
        let totalGrowThreadsAvail = 0;
        let workerCapabilities = [];
        let growRAM = ns.getScriptRam("grow.js");

        for (let currentWorker of activeWorkers) {
        let currRAM = ns.getServerMaxRam(currentWorker);
        let usedRAM = ns.getServerUsedRam(currentWorker);
        let availRAM = currRAM - usedRAM;

        if (currentWorker === "home") {
            availRAM = availRAM - 35;
        }

        let possibleGrowThreads = Math.floor(availRAM / growRAM);
        if (possibleGrowThreads < 0) possibleGrowThreads = 0;

        totalGrowThreadsAvail += possibleGrowThreads;
        workerCapabilities.push({ name: currentWorker, maxGrowThreads: possibleGrowThreads });
        }

        // 2. Calculate ideal grow threads needed to reach maxMoney
        // Prevent Division-by-Zero errors if the server was completely drained to 0
        let lowerBoundMoney = currMoney <= 0 ? 1 : currMoney; 
        let growMultiplier = maxMoney / lowerBoundMoney;
        
        // ns.growthAnalyze returns the exact threads needed to multiply the money
        let idealGrowThreads = Math.ceil(ns.growthAnalyze(target, growMultiplier));
        let targetGrowThreads = Math.min(idealGrowThreads, totalGrowThreadsAvail);

        // 3. Calculate exact weaken threads required to clear this growth's security
        // grow.js adds 0.004 security per thread
        let securityAddedByGrow = targetGrowThreads * 0.004; 
        // weaken.js removes 0.05 security per thread
        let idealWeakenThreads = Math.ceil(securityAddedByGrow / 0.05); 

        // 4. Distribute and fire grow.js scripts
        let activePIDs = [];
        let growThreadsLeft = targetGrowThreads;

        for (let worker of workerCapabilities) {
        if (growThreadsLeft <= 0) break;
        let threadsToAssign = Math.min(worker.maxGrowThreads, growThreadsLeft);

        if (threadsToAssign > 0) {
            let pid = ns.exec("grow.js", worker.name, threadsToAssign, target);
            if (pid > 0) {
            activePIDs.push(pid);
            growThreadsLeft -= threadsToAssign;
            // Dynamically reduce this worker's tracked capacity so weaken scripts don't overlap RAM
            worker.maxGrowThreads -= threadsToAssign; 
            }
        }
        }

        // 5. Instantly distribute and fire matching weaken.js scripts in the remaining space
        let weakenThreadsLeft = idealWeakenThreads;
        let weakenRAM = ns.getScriptRam("weaken.js");
        // Convert remaining grow slots to weaken slots based on RAM ratios
        let ramRatio = growRAM / weakenRAM; 

        for (let worker of workerCapabilities) {
        if (weakenThreadsLeft <= 0) break;
        
        let leftoverWorkerWeakenThreads = Math.floor(worker.maxGrowThreads * ramRatio);
        let threadsToAssign = Math.min(leftoverWorkerWeakenThreads, weakenThreadsLeft);

        if (threadsToAssign > 0) {
            let pid = ns.exec("weaken.js", worker.name, threadsToAssign, target);
            if (pid > 0) {
            activePIDs.push(pid);
            weakenThreadsLeft -= threadsToAssign;
            }
        }
        }

        // 6. Wait for ALL grow and weaken scripts to finish execution
        let checkScripts = true;
        while (checkScripts) {
        let stillRunning = false;
        for (let pid of activePIDs) {
            if (ns.isRunning(pid)) {
            stillRunning = true;
            break;
            }
        }

        if (stillRunning) {
            await ns.sleep(1000);
        } else {
            checkScripts = false;
        }
        }

    } else if (currMoney >= maxMoney) {
        okayGrow = true;
    } else {
        okayGrow = true;
    }

    currSecurity = ns.getServerSecurityLevel(target);
    currMoney = ns.getServerMoneyAvailable(target);
    ns.print("Current Security:" + Math.floor(currSecurity));
    ns.print("Current Money: " + "$" + ns.format.number(currMoney));
    }

    let okayHack = false;
    while (!okayHack) {
    if (currMoney >= maxMoney && currSecurity <= minSecurity) {
        ns.print("***********************");
        ns.print("Hacking...");
        let moneyBefore = ns.getServerMoneyAvailable(target);

        // 1. Calculate the total global threads available across all servers
        let globalMaxThreads = 0;
        let workerCapabilities = []; // Stores RAM limits per worker for later
        let scriptRAM = ns.getScriptRam("hack.js");

        for (let currentWorker of activeWorkers) {
        let currRAM = ns.getServerMaxRam(currentWorker);
        let usedRAM = ns.getServerUsedRam(currentWorker);
        let availRAM = currRAM - usedRAM;

        if (currentWorker === "home") {
            availRAM = availRAM - 35; 
        }

        let possibleThreads = Math.floor(availRAM / scriptRAM);
        if (possibleThreads < 0) possibleThreads = 0;

        globalMaxThreads += possibleThreads;
        workerCapabilities.push({ name: currentWorker, maxThreads: possibleThreads });
        }

        // 2. Calculate ideal threads needed to steal exactly 25% of MAX money
        let percentPerThread = ns.hackAnalyze(target);
        let idealThreads = 0.75 / percentPerThread;
        let targetHackThreads = Math.floor(idealThreads);

        // Cap the target threads by what our global RAM pool can actually support
        if (targetHackThreads > globalMaxThreads) {
        targetHackThreads = globalMaxThreads;
        }

        // 3. Distribute the calculated thread budget across workers
        let hackPIDs = [];
        let threadsLeftToAssign = targetHackThreads;

        for (let worker of workerCapabilities) {
        if (threadsLeftToAssign <= 0) break;

        // Assign either what the worker can hold, or all remaining required threads
        let threadsToAssign = Math.min(worker.maxThreads, threadsLeftToAssign);

        if (threadsToAssign > 0) {
            let pid = ns.exec("hack.js", worker.name, threadsToAssign, target);
            if (pid > 0) {
            hackPIDs.push(pid);
            threadsLeftToAssign -= threadsToAssign;
            }
        }
        }

        // 4. Wait for all scripts to finish
        let checkHack = true;
        while (checkHack) {
        let stillRunning = false;
        for (let pid of hackPIDs) {
            if (ns.isRunning(pid) === true) {
            stillRunning = true;
            break;
            }
        }

        if (stillRunning === true) {
            await ns.sleep(1000);
        } else {
            checkHack = false;
        }
        }

        let moneyAfter = ns.getServerMoneyAvailable(target);
        let cycleGain = moneyBefore - moneyAfter;

        if (cycleGain > 0) {
        totalGained += cycleGain;
        ns.print("***********************");
        ns.print("Cycle Yield: $" + ns.format.number(cycleGain));
        ns.print("Total Earned: $" + ns.format.number(totalGained));
        ns.print("***********************");
        }
    } else {
        okayHack = true;
    }

    currSecurity = ns.getServerSecurityLevel(target);
    currMoney = ns.getServerMoneyAvailable(target);

    ns.print("Current Security:" + Math.floor(currSecurity));
    ns.print("Current Money: " + "$" + ns.format.number(currMoney));
    }
  }
}

export function serverCrawler(ns, getFullMap) {

  let toVisit = ["home"];
  let visitedServers = [];
  let workerServers = [];

  while(toVisit.length){

    let currHost = toVisit.shift();
    visitedServers.push(currHost);

    let scannedServers = ns.scan(currHost);
    for(let singleServer of scannedServers){
      if(!toVisit.includes(singleServer) && !visitedServers.includes(singleServer)){
        toVisit.push(singleServer);
      }
    }
    if(ns.hasRootAccess(currHost) && ns.getServerMaxRam(currHost) > 0){
      workerServers.push(currHost);
    }
  }

  if (getFullMap === true){
    return visitedServers;
  }else{
    return workerServers;
  }
}
