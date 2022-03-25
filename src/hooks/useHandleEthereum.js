import { useEffect, useState } from "react";
// import { networkParams } from "./networks";
import { toHex, truncateAddress } from "./utils";
import { ethers } from "ethers";
import Web3Modal, { CACHED_PROVIDER_KEY } from "web3modal";


const providerOptions = {
  /* See Provider Options Section */
};


const useHandleEthereum = () => {
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

  useEffect(() => {
    loadModal()

    async function loadModal() {
      const web3ModalObj = new Web3Modal({
        cacheProvider: true, // optional
        providerOptions // required
      });
      setWeb3Modal(web3ModalObj);
    } 

  }, [])

  useEffect(() => {
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

  /*
  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
  }, [web3Modal.cachedProvider]);
  
  */



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


  return { mainAccount, setMainAccount, signer, modalProvider, provider, connectWallet, disconnect, switchNetwork};

}

export default useHandleEthereum;




/*


  return (
    <>
      <VStack justifyContent="center" alignItems="center" h="100vh">
        <HStack marginBottom="10px">
          <Text
            margin="0"
            lineHeight="1.15"
            fontSize={["1.5em", "2em", "3em", "4em"]}
            fontWeight="600"
          >
            Let's connect with
          </Text>
          <Text
            margin="0"
            lineHeight="1.15"
            fontSize={["1.5em", "2em", "3em", "4em"]}
            fontWeight="600"
            sx={{
              background: "linear-gradient(90deg, #1652f0 0%, #b9cbfb 70.35%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            Web3Modal
          </Text>
        </HStack>
        <HStack>
          {!account ? (
            <Button onClick={connectWallet}>Connect Wallet</Button>
          ) : (
            <Button onClick={disconnect}>Disconnect</Button>
          )}
        </HStack>
        <VStack justifyContent="center" alignItems="center" padding="10px 0">
          <HStack>
            <Text>{`Connection Status: `}</Text>
            {account ? (
              <CheckCircleIcon color="green" />
            ) : (
              <WarningIcon color="#cd5700" />
            )}
          </HStack>

          <Tooltip label={account} placement="right">
            <Text>{`Account: ${truncateAddress(account)}`}</Text>
          </Tooltip>
          <Text>{`Network ID: ${chainId ? chainId : "No Network"}`}</Text>
        </VStack>
        {account && (
          <HStack justifyContent="flex-start" alignItems="flex-start">
            <Box
              maxW="sm"
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              padding="10px"
            >
              <VStack>
                <Button onClick={switchNetwork} isDisabled={!network}>
                  Switch Network
                </Button>
                <Select placeholder="Select network" onChange={handleNetwork}>
                  <option value="3">Ropsten</option>
                  <option value="4">Rinkeby</option>
                  <option value="42">Kovan</option>
                  <option value="1666600000">Harmony</option>
                  <option value="42220">Celo</option>
                </Select>
              </VStack>
            </Box>
            <Box
              maxW="sm"
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              padding="10px"
            >
              <VStack>
                <Button onClick={signMessage} isDisabled={!message}>
                  Sign Message
                </Button>
                <Input
                  placeholder="Set Message"
                  maxLength={20}
                  onChange={handleInput}
                  w="140px"
                />
                {signature ? (
                  <Tooltip label={signature} placement="bottom">
                    <Text>{`Signature: ${truncateAddress(signature)}`}</Text>
                  </Tooltip>
                ) : null}
              </VStack>
            </Box>
            <Box
              maxW="sm"
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              padding="10px"
            >
              <VStack>
                <Button onClick={verifyMessage} isDisabled={!signature}>
                  Verify Message
                </Button>
                {verified !== undefined ? (
                  verified === true ? (
                    <VStack>
                      <CheckCircleIcon color="green" />
                      <Text>Signature Verified!</Text>
                    </VStack>
                  ) : (
                    <VStack>
                      <WarningIcon color="red" />
                      <Text>Signature Denied!</Text>
                    </VStack>
                  )
                ) : null}
              </VStack>
            </Box>
          </HStack>
        )}
        <Text>{error ? error.message : null}</Text>
      </VStack>
    </>
  );
}
*/