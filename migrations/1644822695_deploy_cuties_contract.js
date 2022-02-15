const CutiesToken = artifacts.require("CutiesToken");

module.exports = async (deployer, network, accounts) => {

	await deployer.deploy(
		CutiesToken,
		'Cutties',
		'CTS',
		'1000000000000000000000',
		'10000000000000000000000000',
	);
	const cutiesToken = await CutiesToken.deployed();
	console.log("Cuties Token contract address ====> " + cutiesToken.address);
};
