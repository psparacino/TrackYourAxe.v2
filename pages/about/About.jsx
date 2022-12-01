import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Container } from "react-bootstrap";

import ethPowerUsage from "../../public/images/eth_power_usage.jpg";
import styles from "./About.module.css";

function About() {
  return (
    <Container>
      <main className={styles.bodyText}>
        <h1>Track Your...What?</h1>
        <p>
          Track Your Axe is an innovative blockchain-based solution verifying
          ownership of musical instruments and items by creating a verifiable
          history (provenance) of ownership.
        </p>

        <h2>How Does it Work?</h2>
        <p>
          Track Your Axe uses a public, trustless database, i.e. a blockchain,
          to publicly store and record ownership of all items listed. This
          registry tracks ownership history, item details, item images over
          time, and location.
        </p>
        <hr />

        <h4>Is that Secure?</h4>
        <p>
          Indeed! To get technical about it, the &apos;deed&apos; to the
          Provenance is, technically, and NFT (non-fungible token). The code
          used to generate this NFT is industry-standard and audited by
          third-parties, so your ownership of the token is secure. This token is
          the used as the indicator of ownership of the provenance itself, which
          exists at it&apos;s own unique location on the blockchain.
        </p>
        <p>
          The provenance is human-readable on the blockchain (the link to each
          contract can be found on your item page) so you can visit it if you
          wish, but if you don&apos;t wish to go that far, all the information
          is displayed on this site.
        </p>

        <h4>Why bother? And isn&apos;t blockchain bad for the planet?!?</h4>
        <Image src={ethPowerUsage} alt="eth power usage" />
        <p>
          Some instruments are so famous they are a household name; Lucille
          comes to mind. However the number of instruments and artifacts that
          trade hands daily is legion, and these instruments hold significant
          cultural and monetary value. TYA allows for an indestrucible record
          and lineage of these items and instruments and their history.
        </p>
        <p>
          Additionally, there are a number of financial incentives to
          registering your instrument on TYA. (list insurance, value of horn,
          etc){" "}
        </p>
        <h4>
          But, really, what about the planet?! and isn&apos;t blockchain
          expensive?!
        </h4>
        <p>blah blah blah, yadda yadda</p>

        <h4>Ok, fine. So how do I register my instruments and items?</h4>
        <p>
          Excellent question! Visit the tutorial page:{" "}
          <Link href="/">here</Link>{" "}
        </p>
      </main>
    </Container>
  );
}

export default About;
