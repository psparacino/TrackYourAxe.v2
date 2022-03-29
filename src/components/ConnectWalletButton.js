import { useState , React, useEffect } from 'react';


import { ethers } from 'ethers';
import { useUserContext } from '../context/UserContext';

// styles
import { Button, Image, Dropdown } from 'react-bootstrap';
import styles from './ConnectWalletButton.module.css';
import { truncateAddress } from '../hooks/utils';

const ConnectWalletButton = () => {

  const { mainAccount, setMainAccount, connectionErrorMessage, setConnectionErrorMessage, chainId, disconnect, connectWallet } = useUserContext();

    useEffect(()=> {
      if (mainAccount) setConnectionErrorMessage('');
    },[mainAccount])
    

    return (
        <div>
          {mainAccount ? 
            <Dropdown>
              <Dropdown.Toggle variant="primary" className={styles.SuccessButton} id="dropdown-basic" >
              {`Account: ${truncateAddress(mainAccount)}`}
              <Image 
              className={styles.checkmarkImage}
              src={'images/green_checkmark.png'} 
              alt="checkmark"/>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item >{`Chain Id: ${chainId}`}</Dropdown.Item>
                <Dropdown.Item onClick={disconnect} style={{color: 'red'}}>Disconnect Account</Dropdown.Item>

              </Dropdown.Menu>
            </Dropdown>
            :
            <Button className={styles.button} id="connectButton" onClick={connectWallet}>     
              <p className={styles.buttonText}>Connect Wallet</p>
            </Button>
              }
          {connectionErrorMessage ? <p style={{color: 'red', marginLeft: '200px'}}>{connectionErrorMessage}</p> : null}    
 
            
        </div>
    )
}

export default ConnectWalletButton;

/*

<div>
<Button className={styles.button} id="connectButton" onClick={connectWallet} disabled={mainAccount} >

{mainAccount ? `Account: ${truncateAddress(mainAccount)}` : "Connect Wallet"}

{mainAccount ? 
<Image 
className={styles.checkmarkImage}
src={'images/green_checkmark.png'} 
alt="checkmark"/> : 
<Image 
className={styles.checkmarkImage}
src={'images/Red_x.svg'} 
alt="checkmark"/>}

<hr />
{`Chain Id: ${chainId}`}

</Button>

*/
