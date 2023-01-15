require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("hardhat-gas-reporter");
require("dotenv").config();

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  gasReporter: {
    enabled: true,
    currency: "USD",
  },
  paths: {
    sources: "./contracts",
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    sepolia: {
      url: `${process.env.KOVAN_INFURA_URL}`,
      accounts:[`${process.env.PRIVATE_KEY}`],
    },
    mumbai: {
      url: `${process.env.MUMBAI_ENDPOINT}`,
      accounts:[`${process.env.PRIVATE_KEY}`],
    },
  },
  solidity: {
    version: "0.8.10",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
