// src/context/state.js
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
// import { networkParams } from "./networks";
import { toHex, truncateAddress } from "./utils";
import { ethers } from "ethers";
import Web3Modal from "web3modal";


const providerOptions = {
  /* See Provider Options Section */
};




//  import useHandleEthereum from '../hooks/useHandleEthereumOriginal';

const UserContext = createContext();

    export function UserContextProvider({ children }) {
 

        const [modalProvider, setModalProvider] = useState();
        const [provider, setProvider] = useState();
        const [mainAccount, setMainAccount] = useState();
        const [ signer, setSigner ] = useState();

        const [signature, setSignature] = useState("");
        const [error, setError] = useState("");
        const [chainId, setChainId] = useState();
        const [network, setNetwork] = useState();
        const [message, setMessage] = useState("");
        const [signedMessage, setSignedMessage] = useState("");
        const [verified, setVerified] = useState();

        const [ web3Modal, setWeb3Modal ]= useState();

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
                connectWallet();
                }

            }, [web3Modal])
  

        const connectWallet = async () => {
            try {
                const modalProvider= await web3Modal.connect();

                const provider = new ethers.providers.Web3Provider(modalProvider);

                const txnSigner = provider.getSigner()
                setSigner(txnSigner)
                console.log(txnSigner, "txnSigner")

                const mainAccount = await provider.listAccounts();

                const network = await provider.getNetwork();
                setModalProvider(modalProvider);
                setProvider(provider);

                if (mainAccount) setMainAccount(mainAccount[0]);
                setChainId(network.chainId);
            } catch (error) {
                setError(error);
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

        // connect/disconnect

        const refreshState = () => {
        setAccount();
        setChainId();
        setNetwork("");
        setMessage("");
        setSignature("");
        setVerified(undefined);
        };



        const disconnect = async () => {
        await web3Modal.clearCachedProvider();
        refreshState();
        };


        //event listeners, for chain switch etc

        useEffect(() => {
        if (modalProvider?.on) {
            const handleMainAccountChanged = (mainAccount) => {
            console.log("mainAccountChanged", mainAccount);
            if (mainAccount) setAccount(mainAccount[0]);
            };

            const handleChainChanged = (_hexChainId) => {
            setChainId(_hexChainId);
            };

            const handleDisconnect = () => {
            console.log("disconnect", error);
            disconnect();
            };

            modalProvider.on("mainAccountChanged", handleMainAccountChanged);
            modalProvider.on("chainChanged", handleChainChanged);
            modalProvider.on("disconnect", handleDisconnect);

            return () => {
            if (modalProvider.removeListener) {
                modalProvider.removeListener("mainAccountChanged", handleMainAccountChanged);
                modalProvider.removeListener("chainChanged", handleChainChanged);
                modalProvider.removeListener("disconnect", handleDisconnect);
            }
            };
        }
        }, [modalProvider]); 

        const ipfsGetterRootURL = "https://gateway.pinata.cloud/ipfs/";
        
        const date = new Date();  
        const dateString = date.toString();



        const state = { mainAccount, setMainAccount, signer, dateString, ipfsGetterRootURL, modalProvider, provider, connectWallet, disconnect, switchNetwork}

        console.log(signer, "signer in UserContext", state, "state in UC")

        return (
            <UserContext.Provider value={state}>
                {children}
            </UserContext.Provider>
        );
    }

export function useUserContext() {
  return useContext(UserContext);
}