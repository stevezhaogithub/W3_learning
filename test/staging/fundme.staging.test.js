const { ethers } = require("hardhat")
const { assert, expect } = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers")


describe("test fundme contract", async function () {
    // 准备写单元测试

    // 定义两个变量，随后在 beforeEach() 中赋值
    // 在其他的 it() 函数中可以直接使用这两个变量
    let fundMe
    let firstAccount
    let secondAccount
    let fundMeSecondAccount
    let mockV3Aggregator

    // 在每个 it() 执行之前都会执行 beforeEach()
    beforeEach(async function () {
        // 在该测试脚本中，调用部署脚本。部署了所有 tag 为 all 的合约
        await deployments.fixture("all")
        firstAccount = (await getNamedAccounts()).firstAccount
        secondAccount = (await getNamedAccounts()).secondAccount
        const fundMeDeployment = await deployments.get("FundMe")
        mockV3Aggregator = await deployments.get("MockV3Aggregator")
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address)
        fundMeSecondAccount = await ethers.getContract("FundMe", secondAccount)
    })
})