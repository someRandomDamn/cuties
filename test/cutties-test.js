const BN = require('bn.js');
const CutiesToken = artifacts.require("CutiesToken");

contract("CutiesToken test", async accounts => {

	let contract;
	before(async () => {
		contract = await CutiesToken.deployed();
	});

	it("should put 10000 CutiesToken in the deployer (first) account", async () => {
		const balance = await contract.balanceOf.call(accounts[0]);
		assert.equal(balance.valueOf(), '1000000000000000000000');
	});

	it("should not allow for NOT admin to grant operator role", async () => {
		try {
			await contract.addToOperatorList.sendTransaction(accounts[2], { from: accounts[1] });

			// should not allow to grant role for user without oeprator role
			assert.equal(false, true);
		} catch (e) {
			assert.equal(e.message.includes('Only owner has permissions'), true);
		}
	});

	it("should allow admin to grant operator role", async () => {
		try {
			await contract.addToOperatorList.sendTransaction(accounts[1], { from: accounts[0] });
			// should not allow to grant role for user without oeprator role
			assert.equal(true, true);
		} catch (e) {
			assert.equal(false, true);
		}
	});

	it("should not allow add/remove from blacklist for user without operator role", async () => {
		try {
			await contract.addToBlackList.sendTransaction(accounts[3], { from: accounts[2] });
			// should not allow to grant role for user without oeprator role
			assert.equal(false, true);
		} catch (e) {
			assert.equal(e.message.includes('Not enough permissions'), true);
		}

		try {
			await contract.removeFromBlackList.sendTransaction(accounts[3], { from: accounts[2] });
			// should not allow to grant role for user without oeprator role
			assert.equal(false, true);
		} catch (e) {
			assert.equal(e.message.includes('Not enough permissions'), true);
		}
	});

	it("should allow add/remove from blacklist for user with operator role", async () => {

		const inBlackListBefore = await contract.blackList.call(accounts[3]);
		await contract.addToOperatorList.sendTransaction(accounts[1], { from: accounts[0] });
		await contract.addToBlackList.sendTransaction(accounts[3], { from: accounts[1] });
		const inBlackListAfterAdd = await contract.blackList.call(accounts[3]);

		await contract.removeFromBlackList.sendTransaction(accounts[3], { from: accounts[1] });
		const inBlackListAfterRemove = await contract.blackList.call(accounts[3]);

		assert.equal(inBlackListBefore, false);
		assert.equal(inBlackListAfterAdd, true);
		assert.equal(inBlackListAfterRemove, false);
	});

	it("should not allow to send/receive tokens for blacklisted address", async () => {

		const sendWei = 1000000000000;
		const balance = await contract.balanceOf.call(accounts[0]);
		await contract.approve.sendTransaction(accounts[0], balance.toString(), { from: accounts[0]});
		await contract.transferFrom.sendTransaction(accounts[0], accounts[3], sendWei, { from: accounts[0]});

		await contract.addToBlackList.sendTransaction(accounts[3], { from: accounts[0] });
		const inBlackList = await contract.blackList.call(accounts[3]);

		assert.equal(inBlackList, true);

		try {
			await contract.approve.sendTransaction(accounts[0], sendWei, { from: accounts[3]});
			await contract.transferFrom.sendTransaction(accounts[3], accounts[2], sendWei);
			// should not allow to grant role for user without operator role
			assert.equal(false, true);
		} catch (e) {
			assert.equal(e.message.includes('Sender is in the blacklist'), true);
		}

		try {
			await contract.approve.sendTransaction(accounts[0], sendWei, { from: accounts[3]});
			await contract.transferFrom.sendTransaction(accounts[0], accounts[3], sendWei);
			// should not allow to grant role for user without operator role
			assert.equal(false, true);
		} catch (e) {
			assert.equal(e.message.includes('Recipient is in the blacklist'), true);
		}
	});

	it("should burn", async () => {
		const initialTotalSupply = await contract.totalSupply.call();

		const burnAmount = 1000000000000;
		await contract.burn.sendTransaction(burnAmount, { from: accounts[0]});

		try {
			await contract.burn.sendTransaction(burnAmount, { from: accounts[3]});
			// should not allow to burn for user without admin role
			assert.equal(false, true);
		} catch (e) {
			assert.equal(e.message.includes('Only owner has permissions'), true);
		}

		const updatedSupply = await contract.totalSupply.call();

		assert.equal(initialTotalSupply.toString(), new BN('1000000000000000000000'));
		assert.equal(updatedSupply.toString(), new BN('999999999000000000000'));
	});

	it("should allow mint only for owner", async () => {
		const initialTotalSupply = await contract.totalSupply.call();

		const mintAmount = 1000000000000;
		await contract.mint.sendTransaction(contract.address, mintAmount, { from: accounts[0]});

		try {
			// check role of minting
			await contract.mint.sendTransaction(contract.address, mintAmount, { from: accounts[1]});
			// should not allow to grant role for user without operator role
			assert.equal(false, true);
		} catch (e) {
			assert.equal(e.message.includes('Only owner has permissions'), true);
		}
		const updatedSupply = await contract.totalSupply.call();

		assert.equal(initialTotalSupply.toString(), new BN('999999999000000000000'));
		assert.equal(updatedSupply.toString(), new BN('1000000000000000000000'));
	});

	it("should not exceed max cap check", async () => {
		const mintAmount = new BN('1000000000000000000000000000000000000000000000000');
		try {
			// check role of minting
			await contract.mint.sendTransaction(contract.address, mintAmount, { from: accounts[0]});
			// should not allow to grant role for user without operator role
			assert.equal(false, true);
		} catch (e) {
			assert.equal(e.message.includes('max supply exceeded'), true);
		}
	});
});
