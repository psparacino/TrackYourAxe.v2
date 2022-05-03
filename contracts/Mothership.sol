// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";
import "./Provenance.sol";
import "./InstrumentDeedToken.sol";




contract Mothership is Ownable {
    //current owners only. Provenance History is on on Provenance. Not sure array is best here.  Can back full date up on trad. database if needed
    mapping(address => Provenance[]) public ownersToAxes;

    mapping(address => bool) public provenanceVerify;

    mapping(address => address[]) public pendingTransfers;

    //to loop and get all provenances on frontend
    address[] public ownerArray;

    Provenance[] public allProvenanceArray;

    InstrumentDeedToken public instrumentDeedTokenContract;


    //add modifier that confirms tokenOwner is caller
    //constructor can also be removed and tokenAddress hardcoded

    constructor (address _tokenAddress) {
        instrumentDeedTokenContract = InstrumentDeedToken(_tokenAddress);
    }


    event ProvenanceCreated(
        Provenance.Types _enumType,
        address childAddress,         
        bytes32 serial, 
        bytes32 brand, 
        bytes32 model, 
        uint16 year, 
        uint16 instrumentDeedToken,
        bytes32 date,
        string verificationPhotoHash,
        string[] instrumentPhotoHashes);
    
    event ProvenanceSale(
        address seller,
        address buyer,
        address provenanaceAddress,
        bytes32 date
    );

    // SETTERS 

    //this function needs to check that an existing provenance doesn't already exist for this instrument
    function createNewProvenance(
        Provenance.Types _enumType,
        bytes32 _serial, 
        bytes32  _brand, 
        bytes32 _model, 
        uint16 _year, 
        uint16 _instrumentDeedToken,
        bytes32 _date,
        string memory _verificationPhotoHash,
        string[] memory _instrumentPhotoHashes
    ) external returns(address) {
        //might need to check for dupes on frontend
        require(msg.sender == instrumentDeedTokenContract.ownerOf(_instrumentDeedToken), "You are not the owner of the Deed Token for this instrument");
        Provenance provenance = new Provenance(
            _enumType, 
            _serial, 
            _brand, 
            _model, 
            _year, 
            _instrumentDeedToken, 
            _date,
            _verificationPhotoHash, 
            _instrumentPhotoHashes,
            address(this),
            address(instrumentDeedTokenContract));

        //ownerUpdates
        ownersToAxes[msg.sender].push(provenance);
        ownerArray.push(msg.sender);
        provenanceVerify[address(provenance)] = true;

        emit ProvenanceCreated(
            _enumType,
            address(provenance),
            _serial, 
            _brand, 
            _model, 
            _year, 
            _instrumentDeedToken, 
            _date,
            _verificationPhotoHash, 
            _instrumentPhotoHashes);

        return(address(provenance));
            
        
    }

     // FUNCTIONS FOR TESTING ONLY!!!!!!!!!!!!!
    function createPracticeProvenance(
        Provenance.Types _enumType,
        bytes32 _serial, 
        bytes32 _brand, 
        bytes32 _model, 
        uint16 _year, 
        uint16 _instrumentDeedToken,
        bytes32 _date,
        string memory _verificationPhotoHash,
        string[] memory _instrumentPhotoHashes
    ) public returns(address) {
        //might need to check for dupes on frontend
        Provenance provenance = new Provenance(
            _enumType, 
            _serial, 
            _brand, 
            _model, 
            _year, 
            _instrumentDeedToken, 
            _date,
            _verificationPhotoHash, 
            _instrumentPhotoHashes,
            address(this),
            address(instrumentDeedTokenContract));


        //ownerUpdates
        if ((ownersToAxes[msg.sender]).length == 0) ownerArray.push(msg.sender);
        ownersToAxes[msg.sender].push(provenance);
        allProvenanceArray.push(provenance);
        // ownerArray.push(msg.sender);
        provenanceVerify[address(provenance)] = true;

        emit ProvenanceCreated(
            _enumType,
            address(provenance),
            _serial, 
            _brand, 
            _model, 
            _year, 
            _instrumentDeedToken, 
            _date,
            _verificationPhotoHash, 
            _instrumentPhotoHashes);

        return(address(provenance));
            
        
    }


    function createBatchProvenances(
        Provenance.Types _enumType,
        bytes32 _serial, 
        bytes32 _brand, 
        bytes32 _model, 
        uint16 _year, 
        uint16 _instrumentDeedToken,
        bytes32 _date,
        string memory _verificationPhotoHash,
        string[] memory _instrumentPhotoHashes
    ) public {
        for(uint i = 0; i<= 10; i++){
            createPracticeProvenance(_enumType, _serial, _brand, _model, _year, _instrumentDeedToken, _date, _verificationPhotoHash, _instrumentPhotoHashes);
        }
    }
    // ***************************

    function setPendingTransfer(address buyer, address provenanceAddress) external {
        pendingTransfers[buyer].push(provenanceAddress);
    }

    // these functions should be combined with the other ones below. the differing arrays can go in the arguments


    function _findArrayIndex(address[] memory array, address provenance) pure internal returns(uint) {
        uint index;
        for (uint i = 0; i < array.length; i++) {
            if (array[i] == provenance) {
                index = i;
            }
        }
        return index;
    }



    function _burnTransferIndex(address buyer, uint index) internal {
        require(index < pendingTransfers[buyer].length, "burn failed in require");
        pendingTransfers[buyer][index] = pendingTransfers[buyer][pendingTransfers[buyer].length-1];
        pendingTransfers[buyer].pop();
    }

    function removePendingTransfer(address buyer, address provenance)  external {
        uint index = _findArrayIndex(pendingTransfers[buyer], provenance);

       _burnTransferIndex(buyer, index);

    }

    
    // INTERNAL FUNCTIONS FOR updateOnProvenanceSale 

    function _findProvenanceIndex(address seller, Provenance provenanceForIndex) view internal returns(uint) {
        uint index;
        for (uint i = 0; i < ownersToAxes[seller].length; i++) {
            if (ownersToAxes[seller][i] == provenanceForIndex) {
                index = i;
            }
        }

        return index;
    }

    function _burnSoldProvenance(address seller, uint index) internal {
        require(index < ownersToAxes[seller].length, "burn failed in require");
        ownersToAxes[seller][index] = ownersToAxes[seller][ownersToAxes[seller].length-1];
        ownersToAxes[seller].pop();
    }


    //called from Provenance to update mothership state. needs tokenOwner modifier for security
    function updateOnProvenanceSale(address seller, address buyer, Provenance provenanceSold, bytes32 date) external {
        //update ownership
        ownersToAxes[buyer].push(provenanceSold);

        uint index = _findProvenanceIndex(seller, provenanceSold);

        _burnSoldProvenance(seller, index);

        emit ProvenanceSale(msg.sender, buyer, address(provenanceSold), date);
         
    }

    // **********
    // GETTERS
    // **********

    function getPendingTransfersOfBuyer(address buyer) external view returns(address[] memory){
        return pendingTransfers[buyer];
    }


    function getOwners() external view returns(address[] memory){
       return ownerArray;
     }  

    //works
    function getOwnersInstruments() public view returns(Provenance[] memory) {
        return ownersToAxes[msg.sender];
    }

    function getAllProvenances() external view returns(Provenance[] memory) {
        return allProvenanceArray;
    }



    /*
     function disable(Provenance provenance) external {
        children[child.index()].disable();
        disabledCount++;
     }
     */

    //FOR OWNER ONLY functions

    function setExistingProvenance() public onlyOwner {

    }

    function removeDuplicateProvenance() public onlyOwner {

    }

}


