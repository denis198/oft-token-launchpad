import { expect } from "chai";
import { ethers } from "hardhat";
import { OFTFactory, LaunchpadOFT } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("OFTFactory", function () {
  let factory: OFTFactory;
  let endpointMock: any;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy mock endpoint
    const EndpointMock = await ethers.getContractFactory("EndpointV2Mock");
    endpointMock = await EndpointMock.deploy(40161); // Sepolia EID

    // Deploy factory
    const Factory = await ethers.getContractFactory("OFTFactory");
    factory = await Factory.deploy(await endpointMock.getAddress());
  });

  describe("Deployment", function () {
    it("should set the correct LZ endpoint", async function () {
      expect(await factory.lzEndpoint()).to.equal(await endpointMock.getAddress());
    });

    it("should revert with zero address endpoint", async function () {
      const Factory = await ethers.getContractFactory("OFTFactory");
      await expect(Factory.deploy(ethers.ZeroAddress)).to.be.revertedWith("Invalid endpoint");
    });

    it("should start with zero deployed tokens", async function () {
      expect(await factory.getDeployedTokensCount()).to.equal(0);
    });
  });

  describe("createToken", function () {
    it("should create a token and emit event", async function () {
      const tx = await factory.connect(user1).createToken(
        "Test Token",
        "TT",
        ethers.parseEther("1000000")
      );

      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log: any) => {
          try {
            return factory.interface.parseLog({ topics: log.topics as string[], data: log.data })?.name === "TokenCreated";
          } catch { return false; }
        }
      );
      expect(event).to.not.be.undefined;
    });

    it("should track the created token", async function () {
      await factory.connect(user1).createToken("Test Token", "TT", ethers.parseEther("1000000"));
      expect(await factory.getDeployedTokensCount()).to.equal(1);
    });

    it("should assign tokens to creator", async function () {
      await factory.connect(user1).createToken("Token A", "TA", ethers.parseEther("100"));
      await factory.connect(user1).createToken("Token B", "TB", ethers.parseEther("200"));

      const tokens = await factory.getTokensByCreator(user1.address);
      expect(tokens.length).to.equal(2);
    });

    it("should mark token as factory token", async function () {
      const tx = await factory.connect(user1).createToken("Test", "T", ethers.parseEther("100"));
      const receipt = await tx.wait();

      const log = receipt?.logs.find((log: any) => {
        try {
          return factory.interface.parseLog({ topics: log.topics as string[], data: log.data })?.name === "TokenCreated";
        } catch { return false; }
      });

      const parsed = factory.interface.parseLog({ topics: log!.topics as string[], data: log!.data });
      const tokenAddress = parsed!.args.tokenAddress;

      expect(await factory.isFactoryToken(tokenAddress)).to.be.true;
    });

    it("should mint initial supply to creator", async function () {
      const supply = ethers.parseEther("1000000");
      const tx = await factory.connect(user1).createToken("Test", "T", supply);
      const receipt = await tx.wait();

      const log = receipt?.logs.find((log: any) => {
        try {
          return factory.interface.parseLog({ topics: log.topics as string[], data: log.data })?.name === "TokenCreated";
        } catch { return false; }
      });
      const parsed = factory.interface.parseLog({ topics: log!.topics as string[], data: log!.data });
      const tokenAddress = parsed!.args.tokenAddress;

      const token = await ethers.getContractAt("LaunchpadOFT", tokenAddress) as LaunchpadOFT;
      expect(await token.balanceOf(user1.address)).to.equal(supply);
    });

    it("should create token with zero initial supply", async function () {
      const tx = await factory.connect(user1).createToken("Test", "T", 0);
      const receipt = await tx.wait();

      const log = receipt?.logs.find((log: any) => {
        try {
          return factory.interface.parseLog({ topics: log.topics as string[], data: log.data })?.name === "TokenCreated";
        } catch { return false; }
      });
      const parsed = factory.interface.parseLog({ topics: log!.topics as string[], data: log!.data });
      const tokenAddress = parsed!.args.tokenAddress;

      const token = await ethers.getContractAt("LaunchpadOFT", tokenAddress) as LaunchpadOFT;
      expect(await token.totalSupply()).to.equal(0);
    });

    it("should separate tokens by different creators", async function () {
      await factory.connect(user1).createToken("Token 1", "T1", ethers.parseEther("100"));
      await factory.connect(user2).createToken("Token 2", "T2", ethers.parseEther("200"));

      const user1Tokens = await factory.getTokensByCreator(user1.address);
      const user2Tokens = await factory.getTokensByCreator(user2.address);

      expect(user1Tokens.length).to.equal(1);
      expect(user2Tokens.length).to.equal(1);
      expect(user1Tokens[0]).to.not.equal(user2Tokens[0]);
    });
  });

  describe("createTokenWithDelegate", function () {
    it("should create token with custom delegate", async function () {
      const tx = await factory.connect(user1).createTokenWithDelegate(
        "Delegated Token",
        "DT",
        ethers.parseEther("500"),
        user2.address
      );
      const receipt = await tx.wait();

      const log = receipt?.logs.find((log: any) => {
        try {
          return factory.interface.parseLog({ topics: log.topics as string[], data: log.data })?.name === "TokenCreated";
        } catch { return false; }
      });
      const parsed = factory.interface.parseLog({ topics: log!.topics as string[], data: log!.data });
      const tokenAddress = parsed!.args.tokenAddress;

      const token = await ethers.getContractAt("LaunchpadOFT", tokenAddress) as LaunchpadOFT;
      // Creator gets the supply
      expect(await token.balanceOf(user1.address)).to.equal(ethers.parseEther("500"));
      // Delegate is the owner
      expect(await token.owner()).to.equal(user2.address);
    });

    it("should revert with zero address delegate", async function () {
      await expect(
        factory.connect(user1).createTokenWithDelegate("Test", "T", 100, ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid delegate");
    });
  });

  describe("getDeployedTokens (pagination)", function () {
    beforeEach(async function () {
      for (let i = 0; i < 5; i++) {
        await factory.connect(user1).createToken(`Token ${i}`, `T${i}`, ethers.parseEther("100"));
      }
    });

    it("should return correct page size", async function () {
      const tokens = await factory.getDeployedTokens(0, 3);
      expect(tokens.length).to.equal(3);
    });

    it("should return remaining tokens for last page", async function () {
      const tokens = await factory.getDeployedTokens(3, 10);
      expect(tokens.length).to.equal(2);
    });

    it("should return empty array for offset beyond range", async function () {
      const tokens = await factory.getDeployedTokens(10, 5);
      expect(tokens.length).to.equal(0);
    });

    it("should return all tokens when limit exceeds total", async function () {
      const tokens = await factory.getDeployedTokens(0, 100);
      expect(tokens.length).to.equal(5);
    });

    it("should return correct token info", async function () {
      const tokens = await factory.getDeployedTokens(0, 1);
      expect(tokens[0].name).to.equal("Token 0");
      expect(tokens[0].symbol).to.equal("T0");
      expect(tokens[0].creator).to.equal(user1.address);
    });
  });

  describe("getTokenInfo", function () {
    it("should return correct info by index", async function () {
      await factory.connect(user1).createToken("My Token", "MTK", ethers.parseEther("999"));

      const info = await factory.getTokenInfo(0);
      expect(info.name).to.equal("My Token");
      expect(info.symbol).to.equal("MTK");
      expect(info.initialSupply).to.equal(ethers.parseEther("999"));
      expect(info.creator).to.equal(user1.address);
    });

    it("should revert for out of bounds index", async function () {
      await expect(factory.getTokenInfo(0)).to.be.revertedWith("Index out of bounds");
    });
  });
});

describe("LaunchpadOFT", function () {
  let token: LaunchpadOFT;
  let endpointMock: any;
  let owner: SignerWithAddress;
  let creator: SignerWithAddress;

  beforeEach(async function () {
    [owner, creator] = await ethers.getSigners();

    const EndpointMock = await ethers.getContractFactory("EndpointV2Mock");
    endpointMock = await EndpointMock.deploy(40161);

    const Token = await ethers.getContractFactory("LaunchpadOFT");
    token = await Token.deploy(
      "Test OFT",
      "TOFT",
      await endpointMock.getAddress(),
      owner.address,
      ethers.parseEther("1000000"),
      creator.address
    );
  });

  it("should set correct name and symbol", async function () {
    expect(await token.name()).to.equal("Test OFT");
    expect(await token.symbol()).to.equal("TOFT");
  });

  it("should return 18 decimals", async function () {
    expect(await token.decimals()).to.equal(18);
  });

  it("should set immutable metadata", async function () {
    expect(await token.initialSupply()).to.equal(ethers.parseEther("1000000"));
    expect(await token.creator()).to.equal(creator.address);
    expect(await token.createdAt()).to.be.greaterThan(0);
  });

  it("should mint initial supply to creator", async function () {
    expect(await token.balanceOf(creator.address)).to.equal(ethers.parseEther("1000000"));
    expect(await token.totalSupply()).to.equal(ethers.parseEther("1000000"));
  });

  it("should set delegate as owner", async function () {
    expect(await token.owner()).to.equal(owner.address);
  });

  it("should support ERC20 transfers", async function () {
    await token.connect(creator).transfer(owner.address, ethers.parseEther("100"));
    expect(await token.balanceOf(owner.address)).to.equal(ethers.parseEther("100"));
    expect(await token.balanceOf(creator.address)).to.equal(ethers.parseEther("999900"));
  });

  it("should handle zero initial supply", async function () {
    const Token = await ethers.getContractFactory("LaunchpadOFT");
    const zeroToken = await Token.deploy(
      "Zero Token",
      "ZERO",
      await endpointMock.getAddress(),
      owner.address,
      0,
      creator.address
    );
    expect(await zeroToken.totalSupply()).to.equal(0);
    expect(await zeroToken.balanceOf(creator.address)).to.equal(0);
  });
});
