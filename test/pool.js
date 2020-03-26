const assert = require('assert').strict;
const truffleAssert = require('truffle-assertions');
const tETH = artifacts.require("tETH");
const tUSD = artifacts.require("tUSD");
const Prime = artifacts.require("Prime");
const Exchange = artifacts.require('Exchange');
const Pool = artifacts.require('Pool');

contract('Exchange', accounts => {

    // User Accounts
    const Alice = accounts[0]
    const Bob = accounts[1]
    const Mary = accounts[2]
    const Kiln = accounts[3]
    const Don = accounts[4]
    const Penny = accounts[5]
    const Cat = accounts[6]
    const Bjork = accounts[7]
    const Olga = accounts[8]
    const Treasury = accounts[9]

    // Accounts Array
    const acc_ray = [
        ['Alice', Alice],
        ['Bob', Bob],
        ['Mary', Mary],
        ['Kiln', Kiln],
        ['Don', Don],
        ['Penny', Penny],
        ['Cat', Cat],
        ['Bjork', Bjork],
        ['Olga', Olga],
        ['Treasury', Treasury]
    ]

    let _prime,
        _tETH,
        _tUSD,
        collateral,
        payment,
        xis,
        yak,
        zed,
        wax,
        pow,
        gem,
        mint,
        exercise,
        close,
        withdraw,
        _burnId,
        _collateralID,
        _exchange,
        primeAddress,
        expiration,
        collateralPoolAddress,
        strikeAddress,
        premium,
        value,
        activeTokenId
        ;

    async function getGas(func, name) {
        let spent = await func.receipt.gasUsed
        gas.push([name + ' gas: ', spent])
    }

    async function getBal(contract, address, name, units) {
        let bal = (await web3.utils.fromWei((await contract.balanceOf(address)).toString()));
        console.log(`${name} has in bank:`, await web3.utils.fromWei(await _prime.getBalance(Alice, contract.address)))
        console.log(`${name} has a balance of ${bal} ${units}.`);
    }

    async function getEthBal(address, name, units) {
        let bal = await web3.utils.fromWei((await web3.eth.getBalance(address)).toString());
        console.log(`${name} has a balance of ${bal} ${units}.`);
    }

    async function getPoolBalances(poolInstance) {
        let pool = await web3.utils.fromWei(await poolInstance._pool());
        let liability = await web3.utils.fromWei(await poolInstance._liability());
        let lpFunds = await web3.utils.fromWei(await poolInstance._collateral(Alice));
        let etherBal =  await web3.utils.fromWei((await web3.eth.getBalance(poolInstance.address)).toString());
        let revenue = await web3.utils.fromWei(await poolInstance._revenue());
        console.log({pool, liability, lpFunds, etherBal, revenue})
    }

    beforeEach(async () => {

        _prime = await Prime.deployed();
        _tUSD = await tUSD.deployed();
        _tETH = await tETH.deployed();
        _exchange = await Exchange.deployed();
        _pool = await Pool.deployed();
        collateral = await web3.utils.toWei('1');
        payment = await web3.utils.toWei('10');
        collateralPoolAddress = _pool.address;
        strikeAddress = _tUSD.address;
        primeAddress = await _exchange.getPrimeAddress();
        expiration = '1587607322';
        premium = (13*10**16).toString();
        
        
        
        await _tETH.approve(_prime.address, payment);
        await _tUSD.approve(_prime.address, payment);
        await _tETH.approve(_prime.address, payment, {from: Bob});
        await _tUSD.approve(_prime.address, payment, {from: Bob});
        
        await _tETH.mint(Alice, payment);
        await _tUSD.mint(Alice, payment);
        await _tETH.mint(Bob, payment);
        await _tUSD.mint(Bob, payment);

        /* await _prime.setPoolAddress(_pool.address); */
        let _LP = Alice;
        value = await web3.utils.toWei('1');
        let deposit = await _pool.deposit(value, {from: _LP, value: value});
        
        await getPoolBalances(_pool);


    });
    

    it('should be able to withdraw funds', async () => {
        let withdraw = await _pool.withdrawLpFunds(value);
        await getPoolBalances(_pool);
    });

    it('can Mint Prime from Pool', async () => {

        await _pool.mintPrimeFromPool(
            collateral,
            payment,
            strikeAddress,
            expiration,
            {from: Bob, value: premium}
        )
        await getPoolBalances(_pool);
    });

    it('can Exercise Pool Prime', async () => {
        await _prime.exercise(1, {from: Bob});
        await getPoolBalances(_pool);
    });

    it('can withdraw dividends', async () => {
        let withdrawAmt = await web3.utils.toWei('3');
        await _pool.withdrawLpFunds(withdrawAmt);
        await getPoolBalances(_pool);
    });

})