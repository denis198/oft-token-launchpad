// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { OFT } from "@layerzerolabs/oft-evm/contracts/OFT.sol";

/**
 * @title LaunchpadOFT
 * @notice OFT token deployed via the Launchpad
 * @dev Inherits from LayerZero OFT for cross-chain functionality
 */
contract LaunchpadOFT is OFT {
    /// @notice Initial supply minted to the deployer
    uint256 public immutable initialSupply;
    
    /// @notice Timestamp when the token was created
    uint256 public immutable createdAt;
    
    /// @notice Address that deployed this token through the factory
    address public immutable creator;

    /**
     * @notice Constructs the LaunchpadOFT token
     * @param _name Token name
     * @param _symbol Token symbol
     * @param _lzEndpoint LayerZero Endpoint address
     * @param _delegate Address that can configure LayerZero settings
     * @param _initialSupply Initial token supply (in wei)
     * @param _creator Address that will receive initial supply
     */
    constructor(
        string memory _name,
        string memory _symbol,
        address _lzEndpoint,
        address _delegate,
        uint256 _initialSupply,
        address _creator
    ) OFT(_name, _symbol, _lzEndpoint, _delegate) Ownable(_delegate) {
        initialSupply = _initialSupply;
        createdAt = block.timestamp;
        creator = _creator;
        
        // Mint initial supply to the creator
        if (_initialSupply > 0) {
            _mint(_creator, _initialSupply);
        }
    }

    /**
     * @notice Returns token decimals (18 by default for ERC20)
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}
