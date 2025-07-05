// 1. import ethers.js
// 2. create a main function: 通过 ethers.js 连接到区块链（获取包，进行部署）
// 初始化 2 个账户: init 2 accounts
// 调用 fund 函数: fund contract with first contract
// check balance of contract
// fund contract with second account
// check balance of contract
// check mapping fundersToAmount
// 3. execute the main function

// 引入第三方包
const { ethers } = require("hardhat");

// 定义为异步函数
async function main() {

    // ------ 部署验证合约 ------
    // create factory
    // 通过 ethers 获得合约工厂
    const fundMeFactory = await ethers.getContractFactory("FundMe");
    console.log("contract is deploying.");


    // deploy contract from factory
    // deploy() 函数只表示发送部署，但并不保证部署完毕
    // deploy() 的参数就是合约的构造函数入参
    const fundMe = await fundMeFactory.deploy(300); // 300秒
    // 等待部署完毕
    await fundMe.waitForDeployment();

    // console.log("contract has been deployed successfully, contract address is " + fundMe.target);
    console.log(`contract has been deployed successfully, contract address is ${fundMe.target}`);

    // 等 5 个区块, 验证 FundMe
    if (hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
        console.log("Waiting for 5 confirmations.");
        await fundMe.deploymentTransaction().wait(5);
        // 等待验证区块
        await verifyFundMe(fundMe.target, 300); // 300 秒
    }

    // ------ 与合约交互 ------
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

}

async function verifyFundMe(fundMeAddr, args) {
    // hre 表示 hardhat 运行时环境
    // run() 在 js 中调用命令行
    await hre.run("verify:verify", {
        address: fundMeAddr, // 合约地址
        constructorArguments: [args], // 构造函数参数
    });
}


// 执行函数
main().then().catch((err) => {
    console.error(err);
    process.exit(1);
});