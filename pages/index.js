//next imports
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

import Sample from './about/index.js'

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
//import './App.css';

//web3-react imports
//import { useWeb3React } from "@web3-react/core"
//import { injectedProvider } from "./components/wallet/connectors";

//gas reporter https://medium.com/@thelasthash/%EF%B8%8F-gas-optimization-with-hardhat-1e553eaea311



//hooks imports
// import useContractObjectRepo from '../src/hooks/useContractRepo.js';

//style imports
import { Container, Row, Col, Navbar, Nav } from 'react-bootstrap/'
import coverphoto from '../public/images/history-caveman-neanderthal-stone-carved_in_stone-everlasting-cza1482_low.jpeg'


//components imports
import { useUserContext } from '../src/context/UserContext.js';
import { useContractContext} from '../src/context/ContractContext.js'

//pages/Links imports
//import About from './pages/About.jsx';
//import UserMain from './pages/UserMain.jsx';
//import RegisterItem from './pages/RegisterItem.jsx';
//import OwnedItem from './pages/OwnedItem';
//import ProvenanceSuccess from './pages/ProvenanceSuccess';
//import useHandleEthereum from './hooks/useHandleEthereum';

/*  example to set up provider.  how to set up provider for multiple wallets or always use Infura endpoint as the provider? doesn't seem very decentralized.
should be in separate hook and then imported here.

for provider. should check for metamask first and use that. if not available should use infura. if not available, should use ethers default provider.
how to bind to provider in web3-react machine?  

useEffect hook in separate hooks folder then import

const handleConnect = async (connector) => {
  // read-only
  let ethersProvider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_KOVAN_ENDPOINT);
  let { provider } = await connector.activate();
  // signer
  const signer = provider.getSigner();
  ethersProvider = new Web3Provider(signer);
  console.log(ethersProvider)
}
*/

function App() {
  /*
    const {
      account,
      activate,
      active,
      chainId,
      connector,
      deactivate,
      error,
      provider,
      setError,
  } = useWeb3React();
  //const {provider, signer} = useHandleEthereum();
  
  const handleConnect = () => {
    try {
      activate(injectedProvider, undefined, true);
    } catch (error) {
      console.error(error);
    }
  };

  async function disconnect() {
    try {
      deactivate()
    } catch (ex) {
      console.log(ex)
    }
  }

  */
  
  

  //don't really need, can just use last address of provenance
  

  //useContractContext

  

  

  const {sharedState, mainAccount, setMainAccount, signer, provider} = useUserContext();

  const { MothershipContract, TokenContract } = useContractContext();



 


  

  const Home = () => {
    return (
      <>
        <h1 style={{fontFamily: 'Times'}}>TRACK YOUR AXES</h1>
        <main>
          <h2>The Last Gear Registration Solution You'll Ever Need</h2>
        </main>
    
        <Image 
        src={coverphoto}
        alt="cover image"
        /> 
      </>
    );
  }

  return (
 
        <div className="App" id="bootstrap-overrides">
         
          <Home />           
         
        </div>
   

  

  
  );
}

export default App;