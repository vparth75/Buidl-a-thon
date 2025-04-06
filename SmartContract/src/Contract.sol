// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract Will {
    address public owner;
    address public recipient;
    uint public startTime;
    uint public tenYears;
    uint public pingedLast;
    uint public tenSeconds;

    event remindUser(address indexed user);

    modifier onlyOwner() {
        require(msg.sender == owner, "Unauthorized: Not owner");
        _;
    }

    modifier onlyRecipient() {
        require(msg.sender == recipient, "Unauthorized: Not recipient");
        _;
    }

    constructor() {
        owner = msg.sender;
        startTime = block.timestamp;
        pingedLast = startTime;
        tenYears = 365 days * 10;
        tenSeconds = 10;
    }

    function setRecipient(address _recipient) external onlyOwner {
        recipient = _recipient;
    }

    function changeRecipient(address newRecipient) external onlyOwner {
        recipient = newRecipient;
    }

    function ping() external onlyOwner {
        pingedLast = block.timestamp;
    }

    function deposit() external payable onlyOwner {
        pingedLast = block.timestamp;
    }

    function claim() external onlyRecipient {
        require(_isInactive(), "Owner is still active");
        uint balance = address(this).balance;
        require(balance > 0, "No ETH available");
        payable(recipient).transfer(balance);
    }

    function triggerReminder() external {
        if (block.timestamp > pingedLast + 180 days) {
            emit remindUser(owner);
        }
    }

    function _isInactive() internal view returns (bool) {
        return block.timestamp > pingedLast + tenSeconds;
    }

    receive() external payable {
        require(msg.sender == owner, "Only owner can send ETH");
        pingedLast = block.timestamp;
    }

    fallback() external payable {
        revert("Function does not exist");
    }
}
