// src/context/state.js
import { createContext, useContext, useEffect, useState } from 'react';
// import { networkParams } from "./networks";
import { toHex, truncateAddress } from '../hooks/utils';
import { ethers } from "ethers";


import Web3Modal from "web3modal";
import { providerOptions } from '../components/web3Modal/providerOptions';





//  import useHandleEthereum from '../hooks/useHandleEthereumOriginal';

const UserContext = createContext();

    export function UserContextProvider({ children }) {
 
        const [web3Modal, setWeb3Modal]= useState();
        const [modalProvider, setModalProvider] = useState();
        const [provider, setProvider] = useState();
        const [mainAccount, setMainAccount] = useState();
        const [signer, setSigner] = useState();
        const [connectionErrorMessage, setConnectionErrorMessage] = useState('')

        
        const [error, setError] = useState("");
        const [chainId, setChainId] = useState();
        const [network, setNetwork] = useState();


        //  potential unused
        const [message, setMessage] = useState("");
        const [signedMessage, setSignedMessage] = useState("");
        const [verified, setVerified] = useState();
        const [signature, setSignature] = useState("");

        

        //set web3Modal instance

        useEffect(async() => {
            loadModal()
            // console.log("load modal firing")

            async function loadModal() {
                const web3ModalObj = new Web3Modal({
                cacheProvider: true, // optional
                providerOptions // required
                });
                setWeb3Modal(web3ModalObj);
            } 

            }, []);

        

        //connect page on reload
        useEffect(async() => {
            if (web3Modal && web3Modal.cachedProvider) {
                console.log(web3Modal.cachedProvider)
                connectWallet();
                }

            }, [web3Modal])
            
            
  

        const connectWallet = async () => {
                try {
                    const modalProvider= await web3Modal.connect();
                    const provider = new ethers.providers.Web3Provider(modalProvider);
                    const mainAccount = await provider.listAccounts();
                    const network = await provider.getNetwork();    
                    setModalProvider(modalProvider);            
                    setProvider(provider);

                    const txnSigner = provider.getSigner()
                    setSigner(txnSigner)

                    if (mainAccount) setMainAccount(mainAccount[0]);
                    setChainId(network.chainId);

                    setConnectionErrorMessage('');

                } catch (error) {
                    setConnectionErrorMessage("User denied connection.  Please check your wallet provider and try again.")
                    console.error(error, "connect error");

                  }

          
        };


        const handleNetwork = (e) => {
        const id = e.target.value;
        setNetwork(Number(id));
        };

        const handleInput = (e) => {
        const msg = e.target.value;
        setMessage(msg);
        };


        const switchNetwork = async () => {
        try {
            await provider.modalProvider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: toHex(network) }]
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
            try {
                await provider.modalProvider.request({
                method: "wallet_addEthereumChain",
                params: [networkParams[toHex(network)]]
                });
            } catch (error) {
                setError(error);
            }
            }
        }
        };

        //maybe dont need these

        /*

        const signMessage = async () => {
        if (!provider) return;
        try {
            const signature = await provider.modalProvider.request({
            method: "personal_sign",
            params: [message, account]
            });
            setSignedMessage(message);
            setSignature(signature);
        } catch (error) {
            setError(error);
        }
        };

        const verifyMessage = async () => {
        if (!provider) return;
        try {
            const verify = await provider.modalProvider.request({
            method: "personal_ecRecover",
            params: [signedMessage, signature]
            });
            setVerified(verify === account.toLowerCase());
        } catch (error) {
            setError(error);
        }
        };

        */

        // connect/disconnect

        const refreshState = () => {
        setMainAccount();
        setSigner();
        setChainId();
        setNetwork("");
        setMessage("");
        setSignature("");
        setVerified(undefined);
        };



        const disconnect = async () => {
            await web3Modal.clearCachedProvider();
            refreshState();
            console.log("disconnect")
        };


        //event listeners, for chain switch etc

        useEffect(() => {
        if (modalProvider?.on) {

            const handleMainAccountChanged = (mainAccount) => {
            console.log("accountsChanged", mainAccount);
            if (mainAccount) setMainAccount(mainAccount[0]);
            };

            const handleChainChanged = (_hexChainId) => {
            setChainId(_hexChainId);
            console.log(`Chain changed to:${_hexChainId}`)
            };

            const handleDisconnect = () => {
            console.log("disconnect", error);
            disconnect();
            };

            modalProvider.on("accountsChanged", handleMainAccountChanged);
            modalProvider.on("chainChanged", handleChainChanged);
            modalProvider.on("disconnect", handleDisconnect);

            return () => {
            if (modalProvider.removeListener) {
                modalProvider.removeListener("accountsChanged", handleMainAccountChanged);
                modalProvider.removeListener("chainChanged", handleChainChanged);
                modalProvider.removeListener("disconnect", handleDisconnect);
            }
            };
        }
        }, [modalProvider]); 

        const ipfsGetterRootURL = "https://gateway.pinata.cloud/ipfs/";
        
        const date = new Date();  
        const dateString = date.toString();



        const state = { 
            mainAccount, 
            setMainAccount, 
            chainId, 
            modalProvider, 
            provider, 
            signer, 
            connectWallet, 
            connectionErrorMessage, 
            setConnectionErrorMessage,
            disconnect, 
            switchNetwork, 
            dateString, 
            ipfsGetterRootURL }

        // console.log(signer, "signer in UserContext", state, "state in UC")

        return (
            <UserContext.Provider value={state}>
                {children}
            </UserContext.Provider>
        );
    }

export function useUserContext() {
  return useContext(UserContext);
}