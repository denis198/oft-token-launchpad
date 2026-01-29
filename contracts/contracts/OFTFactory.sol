// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { LaunchpadOFT } from "./LaunchpadOFT.sol";

/**
 * @title OFTFactory
 * @notice Factory contract for deploying OFT tokens via the Launchpad
 * @dev Deploys LaunchpadOFT instances and tracks all deployments
 */
contract OFTFactory {
    /// @notice LayerZero Endpoint address for this chain
    address public immutable lzEndpoint;

    /// @notice Structure to store token deployment info
    struct TokenInfo {
        address tokenAddress;
        string name;
        string symbol;
        uint256 initialSupply;
        address creator;
        uint256 createdAt;
    }

    /// @notice Array of all deployed tokens
    TokenInfo[] public deployedTokens;

    /// @notice Mapping from creator address to their deployed tokens
    mapping(address => address[]) public tokensByCreator;

    /// @notice Mapping to check if an address is a token deployed by this factory
    mapping(address => bool) public isFactoryToken;

    /// @notice Event emitted when a new OFT token is created
    event TokenCreated(
        address indexed tokenAddress,
        string name,
        string symbol,
        uint256 initialSupply,
        address indexed creator,
        uint256 timestamp
    );

    /**
     * @notice Constructs the OFTFactory
     * @param _lzEndpoint LayerZero Endpoint address for this chain
     */
    constructor(address _lzEndpoint) {
        require(_lzEndpoint != address(0), "Invalid endpoint");
        lzEndpoint = _lzEndpoint;
    }

    /**
     * @notice Creates a new OFT token
     * @param _name Token name
     * @param _symbol Token symbol
     * @param _initialSupply Initial supply to mint (in wei, 18 decimals)
     * @return tokenAddress The address of the newly deployed token
     */
    function createToken(
        string calldata _name,
        string calldata _symbol,
        uint256 _initialSupply
    ) external returns (address tokenAddress) {
        // Deploy new OFT token
        LaunchpadOFT token = new LaunchpadOFT(
            _name,
            _symbol,
            lzEndpoint,
            msg.sender, // delegate (can configure LZ settings)
            _initialSupply,
            msg.sender  // creator (receives initial supply)
        );

        tokenAddress = address(token);

        // Store token info
        TokenInfo memory info = TokenInfo({
            tokenAddress: tokenAddress,
            name: _name,
            symbol: _symbol,
            initialSupply: _initialSupply,
            creator: msg.sender,
            createdAt: block.timestamp
        });

        deployedTokens.push(info);
        tokensByCreator[msg.sender].push(tokenAddress);
        isFactoryToken[tokenAddress] = true;

        emit TokenCreated(
            tokenAddress,
            _name,
            _symbol,
            _initialSupply,
            msg.sender,
            block.timestamp
        );

        return tokenAddress;
    }

    /**
     * @notice Creates a new OFT token with custom delegate
     * @param _name Token name
     * @param _symbol Token symbol
     * @param _initialSupply Initial supply to mint (in wei, 18 decimals)
     * @param _delegate Address that can configure LayerZero settings
     * @return tokenAddress The address of the newly deployed token
     */
    function createTokenWithDelegate(
        string calldata _name,
        string calldata _symbol,
        uint256 _initialSupply,
        address _delegate
    ) external returns (address tokenAddress) {
        require(_delegate != address(0), "Invalid delegate");

        // Deploy new OFT token
        LaunchpadOFT token = new LaunchpadOFT(
            _name,
            _symbol,
            lzEndpoint,
            _delegate,
            _initialSupply,
            msg.sender // creator still receives initial supply
        );

        tokenAddress = address(token);

        // Store token info
        TokenInfo memory info = TokenInfo({
            tokenAddress: tokenAddress,
            name: _name,
            symbol: _symbol,
            initialSupply: _initialSupply,
            creator: msg.sender,
            createdAt: block.timestamp
        });

        deployedTokens.push(info);
        tokensByCreator[msg.sender].push(tokenAddress);
        isFactoryToken[tokenAddress] = true;

        emit TokenCreated(
            tokenAddress,
            _name,
            _symbol,
            _initialSupply,
            msg.sender,
            block.timestamp
        );

        return tokenAddress;
    }

    /**
     * @notice Returns the total number of deployed tokens
     */
    function getDeployedTokensCount() external view returns (uint256) {
        return deployedTokens.length;
    }

    /**
     * @notice Returns all tokens deployed by a specific creator
     * @param _creator Address of the creator
     */
    function getTokensByCreator(address _creator) external view returns (address[] memory) {
        return tokensByCreator[_creator];
    }

    /**
     * @notice Returns token info by index
     * @param _index Index in the deployedTokens array
     */
    function getTokenInfo(uint256 _index) external view returns (TokenInfo memory) {
        require(_index < deployedTokens.length, "Index out of bounds");
        return deployedTokens[_index];
    }

    /**
     * @notice Returns all deployed tokens (paginated)
     * @param _offset Starting index
     * @param _limit Maximum number of tokens to return
     */
    function getDeployedTokens(
        uint256 _offset,
        uint256 _limit
    ) external view returns (TokenInfo[] memory) {
        uint256 total = deployedTokens.length;
        
        if (_offset >= total) {
            return new TokenInfo[](0);
        }

        uint256 end = _offset + _limit;
        if (end > total) {
            end = total;
        }

        uint256 resultLength = end - _offset;
        TokenInfo[] memory result = new TokenInfo[](resultLength);

        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = deployedTokens[_offset + i];
        }

        return result;
    }
}
