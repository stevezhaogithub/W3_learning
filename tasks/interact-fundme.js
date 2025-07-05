const { task } = require("hardhat/config")
task("interact-fundme").addParam("addr", "fundMe contract address").setAction(async (taskArgs, hre) => {

    const fundMeFactory = await ethers.getContractFactory("FundMe");
    const fundMe = fundMeFactory.attach(taskArgs.addr);
    // 1. init 2 accounts
    // 获取配置文件中的两个账户
    const [firstAccount, secondAccount] = await ethers.getSigners();

    // 2. fund contract with first account
    // 表示调用 fundMe 合约中的 fund() 函数的这笔交易发送成功了，但不能保证这笔交易已经写入区块链了
    const fundTx = await fundMe.fund({ value: ethers.parseEther("0.5") });
    // 等待交易成功
    await fundTx.wait();


    // 3. check balance of contract: 查看合约balance
    const balanceOfContract = await ethers.provider.getBalance(fundMe.target);
    console.log(`Balance of the contract is ${balanceOfContract}`);


    // 4. fund contract with second account
    const fundTxWithSecondAccount = await fundMe.connect(secondAccount).fund({ value: ethers.parseEther("0.5") });
    await fundTxWithSecondAccount.wait();

    // 5. check balance of second contract
    const balanceOfContractAfterSecondFund = await ethers.provider.getBalance(fundMe.target);
    console.log(`Balance of the contract is ${balanceOfContractAfterSecondFund}`);

    // 6. check mapping fundersToAmount
    const balance1 = await fundMe.fundersToAmount(firstAccount.address);
    const balance2 = await fundMe.fundersToAmount(secondAccount.address);
    console.log(`balance 1 ${firstAccount.address}: ${balance1}`);
    console.log(`balance 2 ${secondAccount.address}: ${balance}`);
})

module.exports = {}