const { ethers } = require("hardhat")
const { assert } = require("chai")
describe("test fundme contract", async function () {
    // 准备写单元测试

    // 定义两个变量，随后在 beforeEach() 中赋值
    // 在其他的 it() 函数中可以直接使用这两个变量
    let fundMe
    let firstAccount

    // 在每个 it() 执行之前都会执行 beforeEach()
    beforeEach(async function () {
        // 在该测试脚本中，调用部署脚本。部署了所有 tag 为 all 的合约
        await deployments.fixture("all")
        firstAccount = (await getNamedAccounts()).firstAccount
        const fundMeDeployment = await deployments.get("FundMe")
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address)
    })


    // 测试 FundMe.sol 中的构造函数中的 owner 是否为 msg.sender
    it("test if the owner is msg.sender", async function () {
        // 部署合约
        // const [firstAccount] = await ethers.getSigners()
        // const fundMeFactory = await ethers.getContractFactory("FundMe")
        // const fundMe = await fundMeFactory.deploy(180)
        await fundMe.waitForDeployment()

        // 执行测试
        assert.equal((await fundMe.owner()), firstAccount)  // firstAccount 本身就是地址了
    })


    // 测试 FundMe.sol 中的构造函数中的 dataFeed
    it("test if the dataFeed is assign correctly", async function () {
        // 部署合约
        // const [firstAccount] = await ethers.getSigners()
        // const fundMeFactory = await ethers.getContractFactory("FundMe")
        // const fundMe = await fundMeFactory.deploy(180)
        await fundMe.waitForDeployment()

        // 执行测试
        assert.equal((await fundMe.dataFeed()), "0x694AA1769357215DE4FAC081bf1f309aDC325306")
    })
})