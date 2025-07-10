// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// contract test {
//     constructor() payable  {}

//     function getBalance() public view returns (uint256) {
//         return address(this).balance;
//     }
// }

contract test {
    constructor() {}

    function getBalance() public view returns (uint256) {
        string memory str1 = "hello";
        string memory str2 = "world";

        if (
            keccak256(abi.encodePacked(str1)) ==
            keccak256(abi.encodePacked(str2))
        ) {
            return address(this).balance;
        } else {
            return address(this).balance + 1;
        }
    }
}
