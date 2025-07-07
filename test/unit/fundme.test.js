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
        assert.equal((await fundMe.dataFeed()), mockV3Aggregator.address)
    })


    // unit test for fund: 针对 该函数中的两个 require 和 fundersToAmount 能否正确设置进行单元测试
    it("window closed, value greater than minimum, fund failed", async function () {
        // 1. window closed
        // 模拟超时: make sure the window is closed.
        await helpers.time.increase(200)
        // 模拟挖矿
        await helpers.mine()


        // 2. value is greater minimum value(100)
        // await ??
        await expect(fundMe.fund({ value: ethers.parseEther("0.1") })).to.be.revertedWith("Window is closed.")
    })

    it("window open, value is less than minimum, fund failed", async function () {
        // 模拟 value 小于最小值
        await expect(fundMe.fund({ value: ethers.parseEther("0.01") })).to.be.revertedWith("value is less than minimum value, send more ETH")
    })

    it("window open, value is greater than minimum, fund success", async function () {
        await fundMe.fund({ value: ethers.parseEthers("0.1") })

        // 判断是否成功: 判断 mapping 中的值是否更新
        const balance = await fundMe.fundersToAmount(firstAccount)

        await expect(balance).to.equal(ethers.parseEthers("0.1"))

    })


    // unit test for getFund()
    // onlyOwner, window closed, target reached
    it("not owner, window closed, target reached, getFund failed", async function () {

        // 1. make sure the target is reached
        await fundMe.fund({ value: ethers.parseEther("1") })  // 1 ETH 显然 大于 1000 USD 了


        // 2. make sure window closed
        await helpers.time.increase(200)
        await helpers.mine()

        // 3. 
        await expect(fundMeSecondAccount.getFund()).to.be.revertedWith("this function can only called by owner")
    })


    it("window open, target reached, getFund failed", async function () {
        // make sure target is reached
        await fundMe.fund({ value: ethers.parseEther("1") })

        await expect(fundMe.getFund()).to.be.revertedWith("window is not closed.")
    })


    it("window closed, target not reached, getFund failed", async function () {

        await fundMe.fund({ value: ethers.parseEther("0.1") })

        // make sure window is closed
        await helpers.time.increase(200)
        await helpers.mine()

        await expect(fundMe.getFund()).to.be.revertedWith("target is not reached.")
    })


    it("window closed, target is reached, getFund success", async function () {
        await fundMe.fund({ value: ethers.parseEther("1") })
        // make sure window is closed
        await helpers.time.increase(200)
        await helpers.mine()

        await expect(fundMe.getFund()).to.emit(fundMe, "FundWithDrawByOwner").withArgs(ethers.parseEther("1"))
    })



    // 测试 refund() 函数
    // window closed, target not reached, funder has balance
    it("window open, target not reached, funder has balance", async function () {
        // make sure target  is not reached
        await fundMe.fund({ value: ethers.parseEther("0.1") })
        await expect(fundMe.refund()).to.be.revertedWith("window is not closed.")
    })


    it("window closed, target reached, funder has balance", async function () {

        await fundMe.fund({ value: ethers.parseEther("1") })

        // make sure window is closed
        await helpers.time.increase(200)
        await helpers.mine()

        await expect(fundMe.refund()).to.be.revertedWith("target is reached.")
    })

    it("window closed, target reached, funder has balance", async function () {

        await fundMe.fund({ value: ethers.parseEther("0.1") })

        // make sure window is closed
        await helpers.time.increase(200)
        await helpers.mine()

        await expect(fundMeSecondAccount.refund()).to.be.revertedWith("There is no fund for you.")
    })


    // 所有条件都满足, 可以 refund
    it("window closed, target not reached, funder has balance", async function () {
        await fundMe.fund({ value: ethers.parseEther("0.1") })

        // make sure window is closed
        await helpers.time.increase(200)
        await helpers.mine()

        await expect(fundMe.refund()).to.emit(fundMe, "RefundByFunder").withArgs(firstAccount, ethers.parseEther("0.1"))
    })
})