/** @param {NS} ns **/
export async function main(ns) {
	var target = ns.args[0];
	var secLevel = ns.getServerMinSecurityLevel(target) + 1;
	var moneyThresh = ns.getServerMaxMoney(target) * 0.75;
	
	while(true){
		if (ns.getServerSecurityLevel(target) > secLevel){
			await ns.weaken(target);
		} else if(ns.getServerMoneyAvailable(target) < moneyThresh){
			await ns.grow(target);
		} else{
			await ns.hack(target);
		}

	}
}