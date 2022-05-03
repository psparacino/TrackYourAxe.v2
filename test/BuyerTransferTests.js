const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const ProvenanceABI = require('../artifacts/contracts/Provenance.sol/Provenance.json');


//const provider = new ethers.providers.Web3Provider(window.ethereum);
//const signer = provider.getSigner(0);

describe("Buyer Initiated Transfer Tests", function () {
    
    let TokenContract;
    let MothershipContract;
    let ProvenanceContractTest;
    let owner;
    let addr1;
    let addr2;
    let addr3;
    const stringToBytes32 = (string) => ethers.utils.formatBytes32String(string);
    const bytes32ToString = (bytes) => ethers.utils.parseBytes32String(bytes);

    beforeEach(async function () {
        const IDTC = await ethers.getContractFactory('InstrumentDeedToken');
        [owner, addr1, addr2, addr3] = await ethers.getSigners();
        TokenContract = await IDTC.deploy();

        MSC = await ethers.getContractFactory('Mothership');
        MothershipContract = await MSC.deploy(TokenContract.address);

        await TokenContract.safeMint(addr1.address, "www.google.com");
        const result = await MothershipContract.connect(addr1).createNewProvenance(
            1, 
            stringToBytes32('serial#'), 
            stringToBytes32('Selmer'), 
            stringToBytes32('SBA'), 
            1957, 
            0, 
            stringToBytes32("12/31/1999"), 
            'ipfs', 
            ["ipfs"])
        let receipt = await result.wait()
        let event = await receipt.events?.filter((x) => {return x.event == "ProvenanceCreated"});
        let ProvenanceAddress = event[0].args.childAddress;
        // prepare transfer
        ProvenanceContractTest = new ethers.Contract(ProvenanceAddress, ProvenanceABI.abi, addr1);
        await TokenContract.connect(addr1).approve(ProvenanceContractTest.address, 0)

      
    });

    it("owner cannot make offer on own Provenance", async function() {
        await expect(ProvenanceContractTest.connect(addr1).makeOffer({value: 1000000 })).to.be.revertedWith( "VM Exception while processing transaction: reverted with reason string 'You cannot purchase your own Provenance'");
    });

    it("buyer makes offer on Provenance", async function() {

        await ProvenanceContractTest.connect(addr2).makeOffer({value: 1000000 });

        let currentOffer = await ProvenanceContractTest.currentOffer();

        expect (currentOffer.buyer).to.equal(addr2.address);
        expect (currentOffer.offer).to.equal(1000000);
        
    });

    it("buyer cannot make offer lower than existing offer", async function() {
        await ProvenanceContractTest.connect(addr2).makeOffer({value: 1000000 });
        await expect(ProvenanceContractTest.connect(addr3).makeOffer({value: 100 })).to.be.revertedWith( "VM Exception while processing transaction: reverted with reason string 'Offer must greater than current standing offer'");     
    });

    it("owner or buyer can cancel existing offer", async function() {
        const provider = waffle.provider;

        await ProvenanceContractTest.connect(addr2).makeOffer({value: 100000000000 });
        const balanceInWeiBeforeCancel = await provider.getBalance(ProvenanceContractTest.address);
        expect (balanceInWeiBeforeCancel).to.equal(100000000000)
        await ProvenanceContractTest.cancelOffer()
        const balanceInWeiAfterCancel = await provider.getBalance(ProvenanceContractTest.address);
        expect (balanceInWeiAfterCancel).to.equal(0)
    });

    it("owner accepts offer", async function() {
        await ProvenanceContractTest.connect(addr2).makeOffer({value: 100000000000 });
        expect ((await ProvenanceContractTest.currentOffer()).buyer).to.equal(addr2.address);
        await ProvenanceContractTest.connect(addr1).acceptOffer(); 
        expect ((await ProvenanceContractTest.currentOffer()).buyer).to.equal(ethers.constants.AddressZero);




        expect((await ProvenanceContractTest.currentOffer()).buyer).to.equal(ethers.constants.AddressZero);
        expect((await ProvenanceContractTest.currentOffer()).offer).to.equal(0);

        let ownerNumber = await ProvenanceContractTest.ownerCount();


        expect((await ProvenanceContractTest.ownerProvenance(ownerNumber)).ownerAddress).to.equal(addr2.address)
        expect((await ProvenanceContractTest.ownerProvenance(ownerNumber - 1)).ownerAddress).to.equal(addr1.address)


    });

   

  });
