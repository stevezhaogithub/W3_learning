// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// 1. 创建一个收款函数
// 2. 记录投资人并且查看
// 3. 在锁定期内，达到目标值：生产商可以提款；
// 4. 在锁定期内，未达目标值：投资人可以退款

contract FundMe {
  // 记录投资人信息（地址、金额）
  mapping(address => uint256) public fundersToAmount;

  // 设置最小额度(此处使用的单位是Wei，1Eth = 10^18 Wei）
  uint256 constant MINIMUM_VALUE = 100 * 10**18;

  // 如何将 MINIMUM_VALUE 设置成 USD 同步的价格
  AggregatorV3Interface internal dataFeed;

  // 设定目标值。 constant 修饰 target 为常量。
  uint256 constant TARGET = 1000 * 10**18;

  // 设定合约的拥有者
  address public owner;

  // 在构造函数中初始化这两个变量
  // 时间戳: 从什么时间开始锁定，合约部署的时间点
  uint256 deploymentTimestamp;
  // 该合约要锁定多长时间：锁定时长（单位：秒）
  uint256 lockTime;

  // 声明一个变量，用来存储 将来ERC20合约的地址
  address erc20Addr;

  // 标记已经成功调用 getFund() 函数了
  bool public getFundSuccess = false;

  // Solidity 中没有 Date、DateTime类型

  // 构造函数：在合约部署的时候执行一次，以后再也不会执行
  constructor(uint256 _lockTime) {
    // 获取合约部署人的地址 msg.sender
    owner = msg.sender;
    // 0x694AA1769357215DE4FAC081bf1f309aDC325306
    // Sepolia Testnet
    dataFeed = AggregatorV3Interface(
      0x694AA1769357215DE4FAC081bf1f309aDC325306
    );
    // 此处的 block 表示部署该合约这个交易所在的区块。
    deploymentTimestamp = block.timestamp;
    // 通过构造函数设置锁定时长
    lockTime = _lockTime;
  }

  // 1. 收款函数
  // payable: 合约要想接受原生通证，就必须使用 payable 关键字
  function fund() external payable {
    // condition 如果是 false,交易会被 revert
    // require(condition, "");
    // msg.value 表示数量
    require(convertEthToUsd(msg.value) >= MINIMUM_VALUE, "send more ETH");

    // 这里的 block 表示是进行 fund() 交易的时候所在的区块
    require(
      block.timestamp < deploymentTimestamp + lockTime,
      "window is closed."
    );

    // 记录投资人的投资金额
    fundersToAmount[msg.sender] = msg.value;
  }

  /**
     * Returns the latest answer.
     */
  function getChainlinkDataFeedLatestAnswer() public view returns (int256) {
    // prettier-ignore
    (
      /* uint80 roundId */,
      int256 answer,
      /*uint256 startedAt*/,
      /*uint256 updatedAt*/,
      /*uint80 answeredInRound*/
    ) = dataFeed.latestRoundData();
    // answer 表示 ETH 对 USD 的价格
    return answer;
  }

  function convertEthToUsd(uint256 ethAmount)
  internal
  view
  returns (uint256)
  {
    uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
    return (ethAmount * ethPrice) / (10**8);

    // 此处的 ethAmount 是以 Wei 为单位的
    // ethPrice :
    // ETH / USD precision 为 10**8
  }

  // 获取资产:3. 在锁定期内，达到目标值：生产商可以提款；
  function getFund() external onlyOwner windowsClosed {
    // this 表示当前合约。
    // address(this)，表示获取当前合约地址
    // address(this).balance, 表示获取当前合约余额
    // address(this).balance 获取的余额单位是：Wei
    require(
      convertEthToUsd(address(this).balance) >= TARGET,
      "revert: target is not reached."
        );

        // 1. transfer 转账: 合约里面的钱转到了 owner 账户
        payable(msg.sender).transfer(address(this).balance);

        // 2. send 转账: transfer eth and return false if failed.
        bool success = payable(msg.sender).send(address(this).balance);

        require(success, "tx failed.");

        // 3. call 转账: transfer eth with data return value of function and bool.
        // call 函数基本用法：
        // (bool, result) = addr.call{value: value}("");
        bool succ;
        (succ, ) = payable(msg.sender).call{value: address(this).balance}("");

        require(succ, "transfer tx failed.");

        // 转账成功后 清零
        fundersToAmount[msg.sender] = 0;

        getFundSuccess = true;
    }

    // 转移所有权
    function transferOwnership(address newOwner) public onlyOwner {
        owner = newOwner;
    }

    // 退款操作
    function refund() external windowsClosed {
        // 如果余额大于等于 Target， 则不能 refund 了。
        require(
            convertEthToUsd(address(this).balance) < TARGET,
            "Target is reached, you can not refund."
        );

        // 判断是否在锁定期
        require(
            block.timestamp >= deploymentTimestamp + lockTime,
            "window is not closed. only can fund, can not refund."
        );

        // 检测退款人当时fund了多少钱，则退多少钱
        uint256 amount = fundersToAmount[msg.sender];
        require(amount != 0, "there is no fund for you.");

        // 执行退款操作
        bool succ;
        (succ, ) = payable(msg.sender).call{value: fundersToAmount[msg.sender]}(
            ""
        );

        // refund 后要清零。
        fundersToAmount[msg.sender] = 0;
        require(succ, "transfer tx failed.");
    }

    // 更新 fundersToAmount
    function setFunderToAmount(address _funder, uint256 _amountToUpdate)
        external
    {
        require(
            msg.sender == erc20Addr,
            "You do not have permission to call this function."
        );
        fundersToAmount[_funder] = _amountToUpdate;
    }

    // getter方法
    function getFundersToAmount(address _funder)
        external
        view
        returns (uint256)
    {
        return fundersToAmount[_funder];
    }

    // 设置变量 erc20Addr 的地址，相当于 setter 方法
    function setErc20Addr(address _erc20Addr) public onlyOwner {
        erc20Addr = _erc20Addr;
    }

    modifier windowsClosed() {
        // 判断是否在锁定期
        require(
            block.timestamp >= deploymentTimestamp + lockTime,
            "window is not closed. only can fund, can not refund."
        );

        // 其他操作。在使用 windowClosed 的函数 X() 中，执行完上面的 require() 后，再执行 X() 后面的代码
        _;
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "this function can only be called by owner."
        );
        _;
    }
}

// wei: 最小单位
// GWei = 10^9 Wei
// PWei = Finney = 10^6 GWei
// Ether = 10^3 Finney