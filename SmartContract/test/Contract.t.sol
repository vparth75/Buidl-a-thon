// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../src/Contract.sol";

contract WillTest is Test {
    Will will;
    address owner = address(this);
    address recipient = address(0xBEEF);
    address attacker = address(0xBAD);

    function setUp() public {
        will = new Will();
    }

    function testInitialOwnerIsMsgSender() public {
        assertEq(will.owner(), owner);
    }

    function testSetRecipient() public {
        will.setRecipient(recipient);
        assertEq(will.recipient(), recipient);
    }

    function testChangeRecipient() public {
        will.setRecipient(recipient);
        will.changeRecipient(attacker);
        assertEq(will.recipient(), attacker);
    }

    function testOnlyOwnerCanSetRecipient() public {
        vm.prank(attacker);
        vm.expectRevert("Unauthorized: Not owner");
        will.setRecipient(attacker);
    }

    function testDepositAndPing() public {
        will.setRecipient(recipient);
        will.deposit{value: 1 ether}();
        assertEq(address(will).balance, 1 ether);
    }

    function testClaimFailsIfOwnerActive() public {
        will.setRecipient(recipient);
        will.deposit{value: 1 ether}();

        vm.prank(recipient);
        vm.expectRevert("Owner is still active");
        will.claim();
    }

    function testClaimSucceedsAfterInactivity() public {
        will.setRecipient(recipient);
        will.deposit{value: 1 ether}();

        vm.warp(block.timestamp + 20); // Simulate 20 seconds later

        vm.prank(recipient);
        will.claim();

        assertEq(address(will).balance, 0);
    }

    function testOnlyRecipientCanClaim() public {
        will.setRecipient(recipient);
        will.deposit{value: 1 ether}();
        vm.warp(block.timestamp + 20);

        vm.prank(attacker);
        vm.expectRevert("Unauthorized: Not recipient");
        will.claim();
    }
}
