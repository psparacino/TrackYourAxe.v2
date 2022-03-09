import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Routes, Route, Link } from "react-router-dom";
import './App.css';

//web3-react imports
//import { useWeb3React } from "@web3-react/core"
//import { injectedProvider } from "./components/wallet/connectors";

//gas reporter https://medium.com/@thelasthash/%EF%B8%8F-gas-optimization-with-hardhat-1e553eaea311

//abi

import Provenance from './artifacts/contracts/Provenance.sol/Provenance.json';

//hooks imports

import useHandleEthereum from "./hooks/useHandleEthereum.js";
import useContractObjectRepo from './hooks/useContractRepo.js';

//style imports
import { Container, Row, Col, Navbar, Nav } from 'react-bootstrap/'
import coverphoto from './images/history-caveman-neanderthal-stone-carved_in_stone-everlasting-cza1482_low.jpeg'


//components imports

import MetaMaskButton from './components/MetaMaskButton';

//pages/Links imports
import About from './pages/About.jsx';
import UserMain from './pages/UserMain.jsx';
import RegisterItem from './pages/RegisterItem.jsx';
import OwnedItem from './pages/OwnedItem';
import ProvenanceSuccess from './pages/ProvenanceSuccess';
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
  const {mainAccount, setMainAccount, signer, provider} = useHandleEthereum();
  const { MothershipContract, TokenContract } = useContractObjectRepo();

  const [newProvenanceAddress, setNewProvenanceAddress] = useState('');
  const [tokens, setTokens] = useState([]);
  const [items, setItems] = useState([]);
  //const [tokens, setTokens] = useState([]);
  const [provenanceObjects, setProvenanceObjects] = useState([]);

  const ipfsGetterRootURL = "https://gateway.pinata.cloud/ipfs/";

  //retrieve user Token IDs

  useEffect(() => {  
    getTokens()
    .then(tokenIDs => {
      let tokenArray = [];
      if (tokenIDs) {
      for (let i = 0; i < tokenIDs.length; i++) {
        const tokenIndex = tokenIDs[i].toNumber();
        tokenArray.push(tokenIndex)
      }}
      setTokens(tokenArray)
    })
    console.log(provenanceObjects, "rpovenance Objects")

    async function getTokens() {  
        
      if (TokenContract && mainAccount) { 
      let tokenIDs = await TokenContract.tokensOfOwner(mainAccount);
      //tokenArray.push(tokenIDs)
      return tokenIDs
    }
        
      };



  }, [mainAccount])
   
  
    //loads Mothership Contract to retrieve all user items
    useEffect(() => {
  
      (async function getItems() {
        if (MothershipContract) {
        let contractItems = await MothershipContract.getOwnersInstruments();
        setItems(contractItems);
          }
        })();
  
  
  
    },[MothershipContract, newProvenanceAddress])
  
    //Loads all users provenance objects
  
    useEffect(() => {
  
      if (items || newProvenanceAddress) {
        populateProvenances()
        .then((result) => console.log(result, 'populate result'))
        .catch(error => console.log(error, 'populate error'));
      }
      async function populateProvenances() {
        let provenanceArray = [];
        
            for (let address of items) {
                //TokenContract (need to put this in here Mothership and Provenance)
                
                const ProvenanceAddress = address;
                const ProvenanceContract = new ethers.Contract(ProvenanceAddress, Provenance.abi, signer);
                const ProvenanceProps = await ProvenanceContract.instrument()
                const index = ProvenanceContract.ownerCount();
                const ProvenanceOwnerInfo = await ProvenanceContract.ownerProvenance(index);

                provenanceArray.push({'ProvenanceContract': ProvenanceContract, 'ProvenanceProps': ProvenanceProps, 'ProvenanceOwnerInfo': ProvenanceOwnerInfo})
              }
         setProvenanceObjects(provenanceArray);          
      }   
        
    },[items, newProvenanceAddress])

    //console.log(provenanceObjects)

  const Home = () => {
    return (
      <>
        <h1 style={{fontFamily: 'Times'}}>TRACK YOUR AXES</h1>
        <main>
          <h2>The Last Gear Registration Solution You'll Ever Need</h2>
        </main>

        <img src={coverphoto}/>
      </>
    );
  }

  return (
     
        <div className="App" id="bootstrap-overrides">
          <Container>
            <Row>
              <Col>
                <MetaMaskButton mainAccount={mainAccount} setMainAccount={setMainAccount} />
              </Col>
              {/*mainAccount ? <span> Connected with <b>{mainAccount}</b></span> : <span> Not Connected </span>*/}
            </Row>
              
            <Navbar expand="lg" variant="light" bg="light">    
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                  <Nav className="m-auto">
                  <Navbar.Brand href="/">Track Your Axe</Navbar.Brand>
                    <Nav.Link href="/about">About</Nav.Link>
                    <Nav.Link href={`/${mainAccount}`}>{mainAccount} Items</Nav.Link>
                    <Nav.Link href="/registeritem">Register Item</Nav.Link>
                  </Nav>
                  </Navbar.Collapse>
            </Navbar>
       
          </Container>

          <Routes>
            {/* <Route path={`/${mainAccount}`} element={<Home />} /> want ot change to this */}
            <Route path="/" element={<Home />} />
            <Route path="about" element={<About />}/>
            <Route path={`${mainAccount}`} 
              element={
              <UserMain 
              MothershipContract={MothershipContract} 
              TokenContract={TokenContract}
              items={items}
              setItems={setItems}
              tokens={tokens}
              provenanceObjects={provenanceObjects}
              setProvenanceObjects={setProvenanceObjects}
              ipfsGetterRootURL={ipfsGetterRootURL}
              setTokens={setTokens}
              mainAccount={mainAccount} 
              signer={signer} />} />
         
            
            <Route path={`${mainAccount}/owneditem/`}>
              <Route path=":serialID" element={<OwnedItem mainAccount={mainAccount} provider={provider} signer={signer} TokenContract={TokenContract}/>} />  
            </Route>
            
          
           
            <Route path="registeritem/" 
              element={<RegisterItem 
              MothershipContract={MothershipContract} 
              TokenContract={TokenContract} 
              setNewProvenanceAddress={setNewProvenanceAddress}
              provenanceObjects={provenanceObjects}
              mainAccount={mainAccount} 
              tokens={tokens}
              setTokens={setTokens}
              signer={signer} 
              provider={provider}/>} />
            {/*<Route path="owneditem" element={<OwnedItem />} />*/}
            <Route path="provenancesuccess" element={<ProvenanceSuccess signer={signer} provide={provider} mainAccount={mainAccount} newProvenanceAddress={newProvenanceAddress}/>} />  
          
     
          </Routes>
          
          <div>   
          
          </div>


          
         
        </div>
   

  

  
  );
}

export default App;
