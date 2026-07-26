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
    while(!okayGrow){
      if (currMoney < maxMoney){
        ns.print("***********************");
        ns.print("Growing...");
        let growPIDs = [];
        for(let currentWorker of activeWorkers){
          let currRAM = ns.getServerMaxRam(currentWorker);
          let scriptRAM = ns.getScriptRam("grow.js");
          let usedRAM = ns.getServerUsedRam(currentWorker);
          let availRAM = currRAM - usedRAM;
          if (currentWorker === "home"){
            availRAM = availRAM - 35;
          }
          let threadCount = Math.floor(availRAM / scriptRAM);
         
            if(threadCount > 0){
              let pid = ns.exec("grow.js", currentWorker , Math.floor(threadCount), target);
              if(pid > 0){
                growPIDs.push(pid);
              }
            }
        }
        let checkGrow = true;
        while(checkGrow){
          let stillRunning = false;
          for(let pid of growPIDs){
            if(ns.isRunning(pid) === true){
              stillRunning = true;
              break;
            }
          }
          if(stillRunning === true){
            await ns.sleep(1000);
          }else{
            checkGrow = false;
          }
        }
      }else if(currMoney>=maxMoney){
        okayGrow = true;
        //ns.print("Primed!!!");
      }else{
        okayGrow = true;
        //ns.print("Weaken more.");
      }
      currSecurity = ns.getServerSecurityLevel(target);
      currMoney = ns.getServerMoneyAvailable(target);
      ns.print("Current Security:" + Math.floor(currSecurity));
      ns.print("Current Money: " + "$"+ns.format.number(currMoney));
    }

    let okayHack = false;
    while(!okayHack){
      if(currMoney >= maxMoney && currSecurity <= minSecurity){
        ns.print("***********************");
        ns.print("Hacking...");
        let moneyBefore = ns.getServerMoneyAvailable(target);
        let hackPIDs =[];
        for(let currentWorker of activeWorkers){
          let currRAM = ns.getServerMaxRam(currentWorker);
          let scriptRAM = ns.getScriptRam("hack.js");
          let usedRAM = ns.getServerUsedRam(currentWorker);
          let availRAM = currRAM - usedRAM;

          if (currentWorker === "home"){
            availRAM = availRAM - 35;
          }

          let percentPerThread = ns.hackAnalyze(target);
          let idealThreads = 0.25 / percentPerThread;
          let hackThreads = Math.floor(idealThreads);
          let threadCount = Math.floor(availRAM / scriptRAM);

          if (hackThreads > threadCount){
            hackThreads = Math.floor(threadCount);
          }

          if (threadCount > 0){
            let pid = ns.exec("hack.js", currentWorker, hackThreads , target);
            if(pid > 0){
              hackPIDs.push(pid);
            }
          }
        }

        let checkHack = true;
        while(checkHack){
          let stillRunning = false;
          for(let pid of hackPIDs){
            if(ns.isRunning(pid) === true){
              stillRunning = true;
              break;
            }
          }

          if(stillRunning === true){
            await ns.sleep(1000);
          }else{
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
      }else{
        okayHack = true;
      }

      currSecurity = ns.getServerSecurityLevel(target);
      currMoney = ns.getServerMoneyAvailable(target);

      ns.print("Current Security:" + Math.floor(currSecurity));
      ns.print("Current Money: " + "$"+ns.format.number(currMoney));
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
