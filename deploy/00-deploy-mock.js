
const { DECIMAL, INITIAL_ANSWER } = require("../helper-hardhat-config")
module.exports = async ({ getNamedAccounts, deployment }) => {
    const firstAccount = (await getNamedAccounts()).firstAccount
    const { deploy } = deployments


    // 判断是否是 hardhat
    // if(network.name == "hardhat")

    // 如果是本地环境则部署 Mock
    if (developmentChains.includes(network.name)) {
        const { firstAccount } = await getNamedAccounts()
        const { deploy } = deployments

        await deploy("MockV3Aggregator", {
            from: firstAccount,
            args: [DECIMAL, INITIAL_ANSWER],
            log: true
        })
    } else {
        console.log("environment is not local, mock contract deployment is skipped.")
    }


}

// npx hardhat deploy --tags all
// npx hardhat deploy --tags funme
module.exports.tags = ["all", "mock"]



/*

MockV3Aggregator 合约的构造函数
constructor(uint8 _decimals, int256 _initialAnswer) {
    decimals = _decimals;
    updateAnswer(_initialAnswer);
}

*/