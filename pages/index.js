//next imports
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link';

import Sample from './about/index.js'

import { useState, useEffect, useRef} from 'react';
import { ethers } from 'ethers';

// image imports
import fox from '../public/images/MetaMask_Fox.svg'
import mintNFT from '../public/images/mintNFT-graphic.png'
import tablet from '../public/images/tablet.jpeg'

import arrow from '../public/images/iconmonstr-arrow-right-thin.svg'

//style imports
import { Container, Row, Col, Navbar, Nav, Button } from 'react-bootstrap/'
import coverphoto from '../public/images/history-caveman-neanderthal-stone-carved_in_stone-everlasting-cza1482_low.jpeg'
import styles from './Home.module.css'

// components imports
// import { Earth } from '../src/components/Earth.js';


//context imports
import { useUserContext } from '../src/context/UserContext.js';
import { useContractContext} from '../src/context/ContractContext.js'





function App() {
 
  const {sharedState, mainAccount, setMainAccount, signer, provider, chainId} = useUserContext();

  const { MothershipContract, TokenContract } = useContractContext();




  const Home = () => {
    return (
      <Container className={styles.homeContainer}>     
          <h3 style={{paddingTop: '20px'}}>a blockchain-powered provenance and verification solution for <br/>instruments and musical items</h3>
          {chainId && chainId != 1337 ? <h4 style={{color: 'red'}}>PLEASE CONNECT TO LOCALHOST IN YOUR WALLET TO CONTINUE</h4> : null}

        <Button 
          size='lg'
          className={styles.introButton}
          href='guides/how-it-works'
        >
          How Does It Work?
        </Button>
        <br />
        <Button 
          size='lg'
          className={styles.introButton}
          href='register-item'
          variant="warning"
        >
          Register Item
        </Button>


      </Container>
    );
  }

  const TwoStepGraphic = () => {

    return(
      <Container className={styles.stepsContainer}>
        <h2>Simple Two-Step Process to Creating a Provenance</h2>
        <p>Prerequisite: Create a <Link href="/guides/wallet">Wallet</Link> (if you don't have one already)</p>
        

        <Row>
          <Col>
            <h4>1. Mint an NFT with a verification photo</h4>
          </Col>
          <Col>
            <h1>&#8594;</h1>
          </Col>
          <Col>
            <Image 
            src={mintNFT}
            fluid="true"
             />        
          </Col>
        </Row>

        <Row>
          <Col>
            <h4>2. Add item information and additional photos to create the Provenance.</h4>
          </Col>
          <Col>
            <h1>&#8594;</h1>
          </Col>
          <Col>
            <Image 
            src={tablet}
            fluid="true"

             />        
          </Col>
        </Row>
        <h1>Done!</h1>
        <p>for a step-by-step guide to creating a Provenance click <Link href="/guides/step-by-step">here</Link></p>
        <p>for a more technical description of what is happening behind the scenes <Link href="/guides/technical-step-by-step">here</Link></p>

      </Container>

     

    )
  }

  return (
 
        <div className="App" id="bootstrap-overrides">
         
          <Home />  
          <TwoStepGraphic />  
          {/* <Image 
          src={coverphoto}
          alt="cover image"
          />  */}
         
        </div>
   

  

  
  );
}

export default App;