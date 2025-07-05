// function deployFunction() {
//     console.log("it is a deploy function.")
// }
// module.exports.default = deployFunction



// module.exports = async (hre) => {
//     const getNamedAccounts = hre.getNamedAccounts
//     const deployments = hre.deployment
//     console.log("it is a deploy function.")
// }


module.exports = async ({ getNamedAccounts, deployment }) => {
    const firstAccount = (await getNamedAccounts()).firstAccount
    const { deploy } = deployments

    await deploy("FundMe", {
        from: firstAccount,
        args: [180],
        log: true
    })
}

// npx hardhat deploy --tags all
// npx hardhat deploy --tags funme
module.exports.tags = ["all", "fundme"]

