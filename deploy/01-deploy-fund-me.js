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
    console.log(`first account is ${firstAccount}`)
    console.log("it is a deploy function.")
}


