import { useState , React } from 'react';


import { ethers } from 'ethers';
import { useUserContext } from '../context/UserContext';

import { truncateAddress } from '../hooks/utils';

const MetaMaskButton = () => {

  const { mainAccount, setMainAccount, connectWallet } = useUserContext();


    return (
        <div>
            <button className="button" id="connectButton" 
              onClick={connectWallet}>
              
              {mainAccount ? "METAMASK IS CONNECTED : " + truncateAddress(mainAccount ): "Please connect to MetaMask!"}
              
            </button>
        </div>
    )
}

export default MetaMaskButton;
