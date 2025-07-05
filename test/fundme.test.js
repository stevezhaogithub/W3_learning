const { ethers } = require("hardhat")
const { assert } = require("chai")
describe("test fundme contract", async function () {
    // 准备写单元测试

    // 测试 FundMe.sol 中的构造函数中的 owner 是否为 msg.sender
    it("test if the owner is msg.sender", async function () {
        // 部署合约
        const [firstAccount] = await ethers.getSigners()
        const fundMeFactory = await ethers.getContractFactory("FundMe")
        const fundMe = await fundMeFactory.deploy(180)
        await fundMe.waitForDeployment()

        // 执行测试
        assert.equal((await fundMe.owner()), firstAccount.address)
    })


    // 测试 FundMe.sol 中的构造函数中的 dataFeed
    it("test if the dataFeed is assign correctly", async function () {
        // 部署合约
        const [firstAccount] = await ethers.getSigners()
        const fundMeFactory = await ethers.getContractFactory("FundMe")
        const fundMe = await fundMeFactory.deploy(180)
        await fundMe.waitForDeployment()

        // 执行测试
        assert.equal((await fundMe.dataFeed()), "0x694AA1769357215DE4FAC081bf1f309aDC325306")
    })
})