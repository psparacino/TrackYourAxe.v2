import * as React from "react";
import Link  from "next/link";

function About() {

    return (
      <>
        <main>
          <h2>Who are we?</h2>
          <p>
            Track Your Axe is an innovative blockchain-based solution verifying ownership of musical instruments and items and creating a verifiable history (provenance) of items.
          </p>
        </main>
        <nav>
          <Link href="/">Home</Link>
        </nav>
      </>
    );
  
}

export default About;
