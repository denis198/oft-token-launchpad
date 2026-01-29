// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { MessagingParams, MessagingReceipt, MessagingFee, Origin } from "@layerzerolabs/lz-evm-protocol-v2/contracts/interfaces/ILayerZeroEndpointV2.sol";
import { ILayerZeroEndpointV2 } from "@layerzerolabs/lz-evm-protocol-v2/contracts/interfaces/ILayerZeroEndpointV2.sol";
import { SetConfigParam } from "@layerzerolabs/lz-evm-protocol-v2/contracts/interfaces/IMessageLibManager.sol";

/**
 * @title EndpointV2Mock
 * @notice Minimal mock of LayerZero Endpoint V2 for testing
 */
contract EndpointV2Mock {
    uint32 public eid;
    mapping(address => address) public delegates;

    constructor(uint32 _eid) {
        eid = _eid;
    }

    function quote(MessagingParams calldata, address) external pure returns (MessagingFee memory) {
        return MessagingFee({ nativeFee: 0, lzTokenFee: 0 });
    }

    function send(
        MessagingParams calldata,
        address
    ) external payable returns (MessagingReceipt memory) {
        return MessagingReceipt({
            guid: bytes32(0),
            nonce: 0,
            fee: MessagingFee({ nativeFee: 0, lzTokenFee: 0 })
        });
    }

    function setDelegate(address _delegate) external {
        delegates[msg.sender] = _delegate;
    }

    function lzToken() external pure returns (address) {
        return address(0);
    }

    function nativeToken() external pure returns (address) {
        return address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);
    }

    // Stubs for the full interface
    function isSendingMessage() external pure returns (bool) { return false; }
    function getSendContext() external pure returns (uint32, address) { return (0, address(0)); }
    function verify(Origin calldata, address, bytes32) external {}
    function verifiable(Origin calldata, address) external pure returns (bool) { return true; }
    function initializable(Origin calldata, address) external pure returns (bool) { return true; }
    function lzReceive(Origin calldata, address, bytes32, bytes calldata, bytes calldata) external payable {}
    function clear(address, Origin calldata, bytes32, bytes calldata) external {}
    function setLzToken(address) external {}
    function skip(address, uint32, bytes32, uint64) external {}
    function nilify(address, uint32, bytes32, uint64, bytes32) external {}
    function burn(address, uint32, bytes32, uint64, bytes32) external {}
    function nextGuid(address, uint32, bytes32) external pure returns (bytes32) { return bytes32(0); }
    function inboundNonce(address, uint32, bytes32) external pure returns (uint64) { return 0; }
    function outboundNonce(address, uint32, bytes32) external pure returns (uint64) { return 0; }
    function inboundPayloadHash(address, uint32, bytes32, uint64) external pure returns (bytes32) { return bytes32(0); }
    function lazyInboundNonce(address, uint32, bytes32) external pure returns (uint64) { return 0; }
    function composeQueue(address, address, bytes32, uint16) external pure returns (bytes32) { return bytes32(0); }
    function sendCompose(address, bytes32, uint16, bytes calldata) external {}
    function lzCompose(address, address, bytes32, uint16, bytes calldata, bytes calldata) external payable {}
    function registerLibrary(address) external {}
    function isRegisteredLibrary(address) external pure returns (bool) { return true; }
    function getRegisteredLibraries() external pure returns (address[] memory) { return new address[](0); }
    function setDefaultSendLibrary(uint32, address) external {}
    function defaultSendLibrary(uint32) external pure returns (address) { return address(0); }
    function setDefaultReceiveLibrary(uint32, address, uint256) external {}
    function defaultReceiveLibrary(uint32) external pure returns (address) { return address(0); }
    function setDefaultReceiveLibraryTimeout(uint32, address, uint256) external {}
    function defaultReceiveLibraryTimeout(uint32) external pure returns (address, uint256) { return (address(0), 0); }
    function isSupportedEid(uint32) external pure returns (bool) { return true; }
    function isValidReceiveLibrary(address, uint32, address) external pure returns (bool) { return true; }
    function setSendLibrary(address, uint32, address) external {}
    function getSendLibrary(address, uint32) external pure returns (address) { return address(0); }
    function isDefaultSendLibrary(address, uint32) external pure returns (bool) { return true; }
    function setReceiveLibrary(address, uint32, address, uint256) external {}
    function getReceiveLibrary(address, uint32) external pure returns (address, bool) { return (address(0), true); }
    function setReceiveLibraryTimeout(address, uint32, address, uint256) external {}
    function receiveLibraryTimeout(address, uint32) external pure returns (address, uint256) { return (address(0), 0); }
    function setConfig(address, address, SetConfigParam[] calldata) external {}
    function getConfig(address, address, uint32, uint32) external pure returns (bytes memory) { return ""; }
}
