// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {Token} from "../src/Token.sol";
import {NFT} from "../src/NFT.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(1));
        
        vm.startBroadcast(deployerPrivateKey);

        Token token = new Token(
            "MyToken",
            "MTK",
            1_000_000 ether
        );
        console.log("Token deployed at:", address(token));

        NFT nft = new NFT(
            "MyNFT",
            "MNFT",
            "https://api.example.com/"
        );
        console.log("NFT deployed at:", address(nft));

        vm.stopBroadcast();
    }
}
