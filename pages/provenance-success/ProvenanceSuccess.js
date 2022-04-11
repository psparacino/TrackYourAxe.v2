import { ethers } from 'ethers';
import { useState } from 'react';


// style
import styles from './ProvenanceSuccess.module.css';

//next imports
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';

//context imports
import { useUserContext } from '../../src/context/UserContext';
import { useItemContext } from '../../src/context/ItemContext';

import { Button, Row, Col } from 'react-bootstrap';

import yes from '../../public/images/ndyes.gif';
import greenCheckmark from '../../public/images/green_checkmark.png';


const ProvenanceSuccess = () => {

    const { newProvenanceAddress } = useItemContext();
    const { mainAccount } = useUserContext();

    // create conditional on new ProvenanceAddress so that it tells them to go to item page if there is not new provenance address
    return(
        <div className={styles.container}>
            <div className="border border-4 mx-4 rounded" style={{height: '80vw'}}>
                
                
                <h1 className='mt-4'> Provenance Successfully Created!</h1>
                <Image src={greenCheckmark} 
                layout='fixed'
                height='100%'
                width='100%'
                alt="checkmark"/>


                <h2>{newProvenanceAddress ? <p>Your New Provenance is created at: {newProvenanceAddress}</p> : "newAddress not here"}</h2>
                <p>View this transaction on Etherscan: <a target='blank' href="https://etherscan.io/"> here </a></p>
                <p style={{fontSize: '10px'}}>not that provenance contracts need to automatically verified on deployment so they are human readable</p>

                <Row>
                    <Col>
                        <Link href="/register-item">
                            <Button className={styles.CTAButton}>Register Another Item</Button>
                        </Link>
                    </Col>
                    <Col>
                        <Link href='/provenances'>
                            <Button className={styles.CTAButton}>All Provenances</Button>
                        </Link>
                    </Col>
                        {/*<Link href={`/${mainAccount}`}>{mainAccount} Provenances</Link>*/}       
                </Row>

                <div className={styles.imageWrapper}>
                    <Image src={yes} 
                    layout='fill'
                    objectFit='contain'
                    alt={"loading..."} />
                </div>
                
            </div>
        </div>

    )
}

export default ProvenanceSuccess;

