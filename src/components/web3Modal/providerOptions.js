import WalletConnect from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import Portis from "@portis/web3";
// import Torus from "@toruslabs/torus-embed";

export const providerOptions = {
  walletlink: {
    package: CoinbaseWalletSDK, // Required
    options: {
      appName: "Web 3 Modal Demo", // Required
      infuraId: process.env.NEXT_PUBLIC_RINKEBY_ENDPOINT, // Required unless you provide a JSON RPC url; see `rpc` below
    },
  },
  walletconnect: {
    package: WalletConnect, // required
    options: {
      infuraId: process.env.NEXT_PUBLIC_RINKEBY_ENDPOINT, // required
    },
  },
  //   https://github.com/Web3Modal/web3modal/blob/master/docs/providers/portis.md
  portis: {
    package: Portis, // required
    options: {
      id: "PORTIS_ID_PLACEHOLDER_NEED REAL ONE", // required
    },
  },
  /*
  
  torus: {
    package: Torus, // required
    options: {
      networkParams: {
        host: "https://localhost:8545", // optional
        chainId: 1337, // optional
        networkId: 1337 // optional
      },
      config: {
        buildEnv: "development" // optional
      }
    }
  }
  */
};
