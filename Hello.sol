// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Hello {
    uint256[] internal a;
    uint256[3] internal b = [uint256(1), 2, 3];

    function ftest() public view returns(uint256) {
        uint256 len = a.length + b.length;
        return len;
    }

    function set() public {
        a.push(100);
    }
}
