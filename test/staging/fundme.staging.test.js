const { ethers } = require("hardhat")
const { assert, expect } = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers")


describe("test fundme contract", async function () {
    // 准备写集成测试

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

    // todo:
    // test fund and getFund successfully
    // test fund and refund successfully


    // 1. test fund and getFund successfully
    it("fund and getFund successfully", async function () {
        // make sure target reached
        await fundMe.fund({ value: ethers.parseEthers("0.5") })

        // make sure window closed。等待 181 秒
        await new Promise(resolve => setTimeout(resolve, 181 * 1000)) // 毫秒变秒


        // make sure we ca get receipt
        const getFundTx = await fundMe.getFund().wait()  // 交易发送成功了, 不能保证交易一定被写到链上了
        const getFundReceipt = await getFundTx.wait()

        // 因为已经获取到了 getFundReceipt （回执），所以不需要在 except 前加 await 了
        except(getFundReceipt).to.be.emit(fundMe, "FundWithDrawByOwner").withArgs(ethers.parseEther("0.5"))
    })

    // 2. test fund and refund successfully
    it("fund and refund successfully", async function () {
        // make sure target reached
        await fundMe.fund({ value: ethers.parseEther("0.1") }) // 0.1ETH * 2,578.06USD = 257.806 USD

        // make sure window closed。等待 181 秒
        await new Promise(resolve => setTimeout(resolve, 181 * 1000)) // 毫秒变秒


        // make sure we ca get receipt
        const refundTx = await fundMe.refund().wait()  // 交易发送成功了, 不能保证交易一定被写到链上了
        const refundReceipt = await refundTx.wait()

        // 因为已经获取到了 getFundReceipt （回执），所以不需要在 except 前加 await 了
        except(refundReceipt).to.be.emit(fundMe, "RefundByFunder").withArgs(ethers.parseEther("0.1"))
    })



})