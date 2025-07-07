const DECIMAL = 8
const INITIAL_ANSWER = 300000000000
const developmentChains = ["hardhat", "local"]
const LOCK_TIME = 180

const networkConfig = {
    111551111: {
        ethUsdDataFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    },
    97: {   // BNB Smart Chain Testnet
        ethUsdDataFeed: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526"
    }
}

module.exports = {
    DECIMAL,
    INITIAL_ANSWER,
    developmentChains,
    LOCK_TIME,
    networkConfig
}