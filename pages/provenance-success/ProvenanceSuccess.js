import { ethers } from 'ethers';
import { useState } from 'react';

//import './pagesStyling/ProvenanceSuccess.css';

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

    const account = mainAccount;
    //console.log(newProvenanceAddress, "newAddress in Success")
    return(
        <div>
            <nav className="mt-4 mb-4">
                <Link href={"/"}>Back to Home</Link>
            </nav> 
            <div className="border border-4 mx-4 rounded" style={{height: '80vw'}}>
                
            
                <h1 className='mt-4'> Provenance Successully Created!</h1>
                <Image src={greenCheckmark} style={{width:'70px'}} alt="checkmark"/>

                <h2>{newProvenanceAddress ? <p>Your New Provenance is created at: {newProvenanceAddress}</p> : "newAddress not here"}</h2>
                <p>View this transaction on Etherscan: (link will be here)</p>
                <p style={{fontSize: '10px'}}>not that provenance contracts need to automatically verified on deployment so they are human readable</p>
                
                <Image src={yes} style={{width: '30%'}} alt={"loading..."} />
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

