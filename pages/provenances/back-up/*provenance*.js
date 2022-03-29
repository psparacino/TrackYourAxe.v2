import { Component, useEffect, useState } from 'react';
import { ethers } from 'ethers';

//next imports
import Link from 'next/link'
import { useRouter } from 'next/router';

//react-bootstrap imports
import { Container, Carousel, Table, Row, Col, Card, Image, Button, ListGroup, ListGroupItem} from 'react-bootstrap';

// context imports
import { useItemContext } from '../../../src/context/ItemContext';

//import { getProvenanceAddresses, getProvenanceProps } from '../../lib/getPathsAndProps';

//abi
import ProvenanceABI from '../../../artifacts/contracts/Provenance.sol/Provenance.json';


//import './pagesStyling/Provenance.css'

//image imports
import greencheckmark from '../../public/images/green_checkmark.png';
import waitingkitten from '../../public/images/waitingkitten.jpeg';


const Provenance = () => {

  const router = useRouter()
  const { pid } = router.query

  console.log(router.query.provenance, "pid")

  // fuck static props and all that bullshit.
  // get page via router.query. etc and will get item details and props that. no STATIC PATHS OR STATIC PROPS!!!  not working.


    
 
    return( 
      <>
        <p>placeholder</p>
      </>
      
    
     
    )
}


export default Provenance;


// work out data flow.  can call contracts directly here with function in lib. or load everything via ContractContext and then don't need static paths/props.
// tutorial. maybe don't have spearate directory. not needed. just [provenance].js inside provenances. 
/*
export async function getStaticPaths() {
    const paths = "I'm an ethereum address";
    return {
      paths,
      fallback: false
    };
  }
  

export async function getStaticProps() {
  return {
    props: {
      hi: 'hello',
    },
  };
}

*/






