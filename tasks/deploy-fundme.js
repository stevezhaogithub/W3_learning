const { task } = require("hardhat/config")

// deploy-fundme 是 task 的名字
task("deploy-fundme", "description info: deploy and verify fundme").setAction(async (taskArgs, hre) => {

    // 一、部署合约
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

    // 二、验证合约
    // 等 5 个区块, 验证 FundMe
    if (hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
        console.log("Waiting for 5 confirmations.");
        await fundMe.deploymentTransaction().wait(5);
        // 等待验证区块
        await verifyFundMe(fundMe.target, 300); // 300 秒
    }
})

async function verifyFundMe(fundMeAddr, args) {
    // hre 表示 hardhat 运行时环境
    // run() 在 js 中调用命令行
    await hre.run("verify:verify", {
        address: fundMeAddr, // 合约地址
        constructorArguments: [args], // 构造函数参数
    });
}

module.exports = {}