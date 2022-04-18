const { expect } = require("chai");
const { ethers } = require("hardhat");
const ProvenanceABI = require('../artifacts/contracts/Provenance.sol/Provenance.json');


//const provider = new ethers.providers.Web3Provider(window.ethereum);
//const signer = provider.getSigner(0);

describe("Seller Initiated Transfer Tests", function () {
    
    let TokenContract;
    let MothershipContract;
    let ProvenanceContractTest;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        const IDTC = await ethers.getContractFactory('InstrumentDeedToken');
        [owner, addr1, addr2] = await ethers.getSigners();
        TokenContract = await IDTC.deploy();

        MSC = await ethers.getContractFactory('Mothership');
        MothershipContract = await MSC.deploy(TokenContract.address);

        await TokenContract.safeMint(addr1.address, "www.google.com");
        const result = await MothershipContract.connect(addr1).createNewProvenance(1, 'serial#', 'Selmer', 'SBA', 1957, 0, "12/31/1999", 'ipfs', ["ipfs"])
        let receipt = await result.wait()
        let event = await receipt.events?.filter((x) => {return x.event == "ProvenanceCreated"});
        let ProvenanceAddress = event[0].args.childAddress;
        // prepare transfer
        ProvenanceContractTest = new ethers.Contract(ProvenanceAddress, ProvenanceABI.abi, addr1);
        await TokenContract.connect(addr1).approve(ProvenanceContractTest.address, 0)



      
    });

    it("Provenance Pending Owner is added before transfer and removed after", async function() {

        // console.log(await TokenContract.getApproved(0), "approved for token zero")
        await ProvenanceContractTest.connect(addr1).setPendingOwner(addr2.address);

        expect(await ProvenanceContractTest.pendingOwner()).to.equal(addr2.address); 
        // original owner of provenance
        let provenanceOwner = (await ProvenanceContractTest.ownerProvenance(1)).ownerAddress;
        //need to break this into other tests and also make sure that old provenance is removed from the old owner
        const ProvenanceContractTestSecondSigner = await ProvenanceContractTest.connect(addr2);  
        await ProvenanceContractTestSecondSigner.connect(addr2).claimOwnership(provenanceOwner, 'verificationPhoto2', '12/31/1999');      
 
        expect(await ProvenanceContractTest.pendingOwner()).to.equal(ethers.constants.AddressZero); 

    });


   

  });
