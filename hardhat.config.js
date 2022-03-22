require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("hardhat-gas-reporter");
require('dotenv').config()

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  gasReporter: {
    enabled: false,
    currency: 'USD'
  },
  paths: {
    sources: './contracts'
  },
  networks: {
    hardhat: {
      chainId: 1337  
    },
    /*  
    kovan: {
      url: `${process.env.REACT_APP_KOVAN_INFURA_URL}`,
      accounts:[`${process.env.REACT_APP_PRIVATE_KEY}`],
    },
    rinkeby: {
      url: `${process.env.REACT_APP_RINKEBY_INFURA_URL}`,
      accounts:[`${process.env.REACT_APP_PRIVATE_KEY}`],
    }
    */
    
    
  }, 
  solidity: {
    version: '0.8.10'
    /*
    re-introduce optimizer once code has been tightened up
    ,
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      }
    }
    */
  }
};
  