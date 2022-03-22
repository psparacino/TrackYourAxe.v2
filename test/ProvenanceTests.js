const { expect } = require("chai");
const { ethers } = require("hardhat");
const ProvenanceABI = require('../artifacts/contracts/Provenance.sol/Provenance.json');


//const provider = new ethers.providers.Web3Provider(window.ethereum);
//const signer = provider.getSigner(0);

describe("Provenance Tests", function () {
    
    let TokenContract;
    let MothershipContract;
    //let ProvenanceContract;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        const IDTC = await ethers.getContractFactory('InstrumentDeedToken');
        [owner, addr1, addr2] = await ethers.getSigners();
        TokenContract = await IDTC.deploy();

        MSC = await ethers.getContractFactory('Mothership');
        MothershipContract = await MSC.deploy(TokenContract.address);

        await TokenContract.safeMint(addr1.address, "www.google.com")
      
    });

    it("contract Addresses", async function() {
        
    });

    it("verify token minted to address1", async function() {
        expect(await TokenContract.ownerOf(0)).to.equal(addr1.address);    
        expect(await TokenContract.balanceOf(addr1.address)).to.equal(1);
        expect(await TokenContract.tokenURI(0)).to.equal("www.google.com");
    });

    it("Mothership connected Token Address", async function() {

        expect(await MothershipContract.instrumentDeedTokenContract()).to.equal(TokenContract.address);
    });

    it("deploy Provenance from Mothership", async function() { 
        //console.log(addr1.address,"addr1.address")
        //console.log(MothershipContract.address, "MothershipContract address")


        const result = await MothershipContract.connect(addr1).createNewProvenance(1, 'serial#', 'Selmer', 'SBA', 1957, 0, 'ipfs', 'John', ["ipfs"])
        let receipt = await result.wait()
        let event = await receipt.events?.filter((x) => {return x.event == "ProvenanceCreated"});
        let ProvenanceAddress = event[0].args.childAddress;
        ProvenanceContract = new ethers.Contract(ProvenanceAddress, ProvenanceABI.abi, addr1);

        //Sample Provenance Trait
        expect((await ProvenanceContract.instrument()).serial).to.equal('serial#');
        //Mothership remains Provenance 'owner'
        expect(await ProvenanceContract.owner()).to.equal(MothershipContract.address);
        //Provenance listed owner is owner of item
        expect((await ProvenanceContract.ownerProvenance(1)).ownerAddress).to.equal(addr1.address)
        //expect((await ProvenanceContract.instrumentOwner()).ownerAddress).to.equal(addr1.address);
        
    });

    it("sale of from one owner to another", async function() { 
        //console.log(addr1.address,"addr1.address")
        //console.log(MothershipContract.address, "MothershipContract address")
        let ProvenanceContractTest;
        

        const result = await MothershipContract.connect(addr1).createNewProvenance(1, 'serial#', 'Selmer', 'SBA', 1957, 0, 'ipfs', 'John', ["ipfs"])
        let receipt = await result.wait()
        let event = await receipt.events?.filter((x) => {return x.event == "ProvenanceCreated"});
        let ProvenanceAddress = event[0].args.childAddress;

        

        // prepare transfer
        ProvenanceContractTest = new ethers.Contract(ProvenanceAddress, ProvenanceABI.abi, addr1);

        await TokenContract.connect(addr1).approve(ProvenanceContractTest.address, 0)
        // console.log(await TokenContract.getApproved(0), "approved for token zero")
        await ProvenanceContractTest.connect(addr1).setPendingOwner(addr2.address)


        // original owner of provenance
        let provenanceOwner = (await ProvenanceContractTest.ownerProvenance(1)).ownerAddress;


        //need to break this into other tests and also make sure that old provenance is removed from the old owner
        const ProvenanceContractTestSecondSigner = await ProvenanceContractTest.connect(addr2);  


        await ProvenanceContractTestSecondSigner.connect(addr2).claimOwnership(provenanceOwner, 'verificationPhoto2');    


        const updatedAddr1Provs = await MothershipContract.connect(addr1).getOwnersInstruments();
        const updatedAddr2Provs = await MothershipContract.connect(addr2).getOwnersInstruments();
  
        

        expect(updatedAddr1Provs).to.deep.equal([])
        expect(updatedAddr2Provs[0]).to.equal(ProvenanceContractTest.address)

        expect((await ProvenanceContractTestSecondSigner.ownerProvenance(2)).ownerAddress).to.equal(addr2.address);
        expect((await ProvenanceContractTestSecondSigner.ownerProvenance(1)).ownerAddress).to.equal(addr1.address);
        
        //expect((await MothershipContract.ownersToAxes(addr2.address)).to.equal(addr2.address)

        
    });

  });

  /*
    
        expect(await ProvenanceContract.owner()).to.equal(owner);*/