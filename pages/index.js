//next imports
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import Sample from "./about/index.js";

import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";

// image imports
import fox from "../public/images/MetaMask_Fox.svg";
import mintNFT from "../public/images/mintNFT-graphic.png";
import tablet from "../public/images/tablet.jpeg";
import rosettaStone from "../public/images/799px-Rosetta_Stone_BW.jpeg";

import arrow from "../public/images/iconmonstr-arrow-right-thin.svg";

//style imports
import { Container, Row, Col, Navbar, Nav, Button } from "react-bootstrap/";
import coverphoto from "../public/images/history-caveman-neanderthal-stone-carved_in_stone-everlasting-cza1482_low.jpeg";
import styles from "./index.module.css";

// components imports
// import { Earth } from '../src/components/Earth.js';

//context imports
import { useUserContext } from "../src/context/UserContext.js";
import { useContractContext } from "../src/context/ContractContext.js";

function App() {
  const {
    sharedState,
    mainAccount,
    setMainAccount,
    signer,
    provider,
    chainId,
  } = useUserContext();

  const { MothershipContract, TokenContract } = useContractContext();

  const Home = () => {
    return (
      <div className={styles.homeContainer} id="home">
        <div className={styles.internalHomeContainer}>
          <h3>
            a blockchain-backed provenance and verification solution for <br />
            instruments and musical items
          </h3>
          {chainId && chainId != 80001 ? (
            <h4 style={{ color: "red" }}>
              PLEASE CONNECT TO MUMBAI IN YOUR WALLET TO CONTINUE
            </h4>
          ) : null}
          <Row>
            <Col>
              <Link href="#seeItWork" passHref>
                <Button
                  size="lg"
                  variant="primary"
                  className={styles.introButton}
                >
                  See How It Works
                </Button>
              </Link>
            </Col>
            <Col>
              <Link href="#howDoesItWork" passHref>
                <Button
                  size="lg"
                  variant="primary"
                  className={styles.introButton}
                >
                  Read How It Works
                </Button>
              </Link>
            </Col>
          </Row>
          <br />
        </div>
        <h4>Know all this stuff and ready to get going?</h4>
        <Button
          size="lg"
          className={styles.registerButton}
          href="register-item"
          variant="success"
        >
          Register Item
        </Button>
      </div>
    );
  };

  const Visualization = () => {
    return (
      <div className={styles.pageContainer}>
        <Row>
          <h2>Simple Two-Step Process to Creating a Provenance</h2>
          <p>
            Prerequisite: Create a <Link href="/guides/wallet">Wallet</Link> (if
            you don&apos;t have one already)
          </p>
          {/* <Image
              id="seeItWork"
              src={fox}
              layout='fill'
              className={styles.walletImage}
          />  */}
        </Row>

        <Row>
          <Col className={styles.flexContainerCentered}>
            <h4>1. Mint an NFT with a verification photo</h4>
          </Col>
          <Col xs={2} className={styles.flexContainerCentered}>
            <h1>&#8594;</h1>
          </Col>
          <Col>
            <Image id="seeItWork" src={mintNFT} fluid="true" />
          </Col>
        </Row>

        <Row>
          <Col className={styles.flexContainerCentered}>
            <h4>
              2. Add item information and additional photos to create the
              Provenance.
            </h4>
          </Col>
          <Col xs={2} className={styles.flexContainerCentered}>
            <h1>&#8594;</h1>
          </Col>
          <Col className={styles.graphicContainer}>
            <Image
              src={rosettaStone}
              layout="fill"
              objectFit="contain"
              className={styles.imageSizing}
            />
          </Col>
        </Row>
        <h1>Done!</h1>
        <p>
          for a step-by-step guide to creating a Provenance click{" "}
          <Link href="/guides/step-by-step">here</Link>
        </p>
        <p>
          for a more technical description of what is happening behind the
          scenes <Link href="/guides/technical-step-by-step">here</Link>
        </p>
        <Link href="#top" passHref>
          <Button variant="outline-secondary" className={styles.topButton}>
            Top
          </Button>
        </Link>
      </div>
    );
  };

  const HowDoesItWork = () => {
    return (
      <div
        className={styles.pageContainer}
        style={{ backgroundColor: "lightgray" }}
        id="howDoesItWork"
      >
        <h2> HOW DOES IT WORK?</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Tempus
          egestas sed sed risus pretium quam. Maecenas volutpat blandit aliquam
          etiam. Quam elementum pulvinar etiam non quam lacus suspendisse.
          Rutrum quisque non tellus orci ac auctor augue mauris. Nunc faucibus a
          pellentesque sit. Amet massa vitae tortor condimentum lacinia quis
          vel. Mollis aliquam ut porttitor leo a. Ut eu sem integer vitae justo
          eget magna fermentum. Id diam vel quam elementum pulvinar etiam non
          quam lacus. Nunc consequat interdum varius sit amet mattis. Vitae
          aliquet nec ullamcorper sit amet. Urna neque viverra justo nec
          ultrices. Aenean pharetra magna ac placerat vestibulum lectus mauris.
          Tincidunt arcu non sodales neque sodales. Vulputate eu scelerisque
          felis imperdiet proin fermentum leo vel. Fermentum posuere urna nec
          tincidunt praesent. Odio ut sem nulla pharetra. Ipsum nunc aliquet
          bibendum enim facilisis gravida. Molestie a iaculis at erat
          pellentesque adipiscing commodo elit. Sed euismod nisi porta lorem.
          Neque vitae tempus quam pellentesque nec nam aliquam sem et. Tellus in
          metus vulputate eu scelerisque felis imperdiet. Vestibulum lorem sed
          risus ultricies tristique nulla. Orci ac auctor augue mauris. Non
          sodales neque sodales ut. Tincidunt tortor aliquam nulla facilisi cras
          fermentum odio eu. Vitae justo eget magna fermentum iaculis eu non
          diam. Mollis nunc sed id semper. Netus et malesuada fames ac turpis
          egestas maecenas pharetra. Lectus nulla at volutpat diam ut venenatis
          tellus in. Imperdiet sed euismod nisi porta lorem. Sed tempus urna et
          pharetra. Sit amet nisl purus in mollis nunc. Dui faucibus in ornare
          quam viverra orci sagittis. Etiam erat velit scelerisque in dictum non
          consectetur a. Ultrices mi tempus imperdiet nulla malesuada
          pellentesque elit eget. Vulputate odio ut enim blandit volutpat. Metus
          aliquam eleifend mi in. Feugiat in ante metus dictum at. Lorem ipsum
          dolor sit amet consectetur adipiscing elit pellentesque. Praesent
          tristique magna sit amet purus gravida quis blandit. Risus viverra
          adipiscing at in tellus. Fusce id velit ut tortor pretium viverra
          suspendisse potenti. Aliquet risus feugiat in ante metus dictum at.
          Nec ultrices dui sapien eget mi proin. Tortor vitae purus faucibus
          ornare suspendisse. Eros in cursus turpis massa tincidunt dui ut
          ornare. Consequat semper viverra nam libero justo laoreet sit. Egestas
          sed tempus urna et pharetra pharetra massa massa ultricies. Diam quam
          nulla porttitor massa id neque aliquam vestibulum morbi. Molestie ac
          feugiat sed lectus. Diam donec adipiscing tristique risus nec feugiat
          in fermentum posuere. Curabitur gravida arcu ac tortor dignissim
          convallis aenean et tortor. Et odio pellentesque diam volutpat commodo
          sed. Nunc aliquet bibendum enim facilisis gravida. Dictumst vestibulum
          rhoncus est pellentesque elit ullamcorper dignissim. Tellus orci ac
          auctor augue. Eget nulla facilisi etiam dignissim diam quis enim
          lobortis. Sollicitudin aliquam ultrices sagittis orci a scelerisque
          purus semper eget. Elementum integer enim neque volutpat. Habitant
          morbi tristique senectus et. Convallis convallis tellus id interdum.
          Sit amet massa vitae tortor condimentum lacinia quis vel. Sit amet
          mauris commodo quis imperdiet massa. Massa massa ultricies mi quis
          hendrerit.
        </p>
        <Link href="#top" passHref>
          <Button variant="outline-secondary" className={styles.topButton}>
            Top
          </Button>
        </Link>
      </div>
    );
  };

  return (
    <div className="App" id="bootstrap-overrides">
      <Home />
      <div>
        <Visualization />
      </div>

      <HowDoesItWork />
    </div>
  );
}

export default App;
