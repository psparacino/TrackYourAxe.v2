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



import yes from '../../public/images/ndyes.gif';
import greenCheckmark from '../../public/images/green_checkmark.png';


const ProvenanceSuccess = () => {

    const { newProvenanceAddress } = useItemContext();
    const { mainAccount } = useUserContext();


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
                <p>View this transaction on Etherscan: (link will be here)</p>
                <p style={{fontSize: '10px'}}>not that provenance contracts need to automatically verified on deployment so they are human readable</p>

                <div className={styles.imageWrapper}>
                    <Image src={yes} 
                    layout='fill'
                    objectFit='contain'
                    alt={"loading..."} />
                </div>
                

                <div className="mt-4">
                    <nav>
                        <Link href="/register-item">Register Another Item</Link>
                    </nav> 
                    <nav>
                        {/*<Link href={`/${mainAccount}`}>{mainAccount} Provenances</Link>*/}
                        <Link href='/provenances'>
                            <a>{`/${mainAccount}`} Provenances</a>
                        </Link>
                    </nav>  
                </div>
            </div>
        </div>

    )
}

export default ProvenanceSuccess;

