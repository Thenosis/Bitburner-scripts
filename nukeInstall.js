/** @param {NS} ns **/
export async function main(ns) {
	
	/** Declare variables **/
	var target = ns.args[0]
	var portReq = ns.getServerNumPortsRequired(target);
	var memory = ns.getServerMaxRam(target);

	/** Each if block checks the ports required to gain root access. Depending on the number of blocks it will deploy
	 * a specific measure dependant upon the number of required ports. Then basichack.js will be copied to the server
	 * so that it can be ran using the run command.
	**/
	if (portReq == 5) {
		await ns.brutessh(target);
		await ns.ftpcrack(target);
		await ns.relaysmtp(target);
		await ns.httpworm(target);
		await ns.sqlinject(target);
		await ns.nuke(target);
		if (fileExists('basichack.js', target) == false){
			ns.scp ('basichack.js', 'home', target);
		}else if (fileExists('basichack.js', target) == true){
			ns.tprint('File already exists');
		}

	} else if (portReq == 4) {
		await ns.brutessh(target);
		await ns.ftpcrack(target);
		await ns.relaysmtp(target);
		await ns.httpworm(target);
		await ns.nuke(target);
		if (fileExists('basichack.js', target) == false){
			ns.scp ('basichack.js', 'home', target);
		}else if (fileExists('basichack.js', target) == true){
			ns.tprint('File already exists');
		}

	} else if (portReq == 3) {
		await ns.brutessh(target);
		await ns.ftpcrack(target);
		await ns.relaysmtp(target);
		await ns.nuke(target);
		if (fileExists('basichack.js', target) == false){
			ns.scp ('basichack.js', 'home', target);
		}else if (fileExists('basichack.js', target) == true){
			ns.tprint('File already exists');
		}

	} else if (portReq == 2) {
		await ns.brutessh(target);
		await ns.ftpcrack(target);
		await ns.nuke(target);
		if (fileExists('basichack.js', target) == false){
			ns.scp ('basichack.js', 'home', target);
		}else if (fileExists('basichack.js', target) == true){
			ns.tprint('File already exists');
		}

	} else if (portReq == 1) {
		await ns.brutessh(target);
		await ns.nuke(target);
		if (fileExists('basichack.js', target) == false){
			ns.scp ('basichack.js', 'home', target);
		}else if (fileExists('basichack.js', target) == true){
			ns.tprint('File already exists');
		}

	} else if (portReq == 0) {
		await ns.nuke(target);
		if (fileExists('basichack.js', target) == false){
			ns.scp ('basichack.js', 'home', target);
		}else if (fileExists('basichack.js', target) == true){
			ns.tprint('File already exists');
		}

	}
}
