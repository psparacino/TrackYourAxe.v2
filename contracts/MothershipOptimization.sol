// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";
import "./ProvenanceOptimization.sol";
import "./InstrumentDeedToken.sol";




contract MothershipOptimization is Ownable {
    //current owners only. Provenance History is on on Provenance. Not sure array is best here.  Can back full date up on trad. database if needed
    mapping(address => ProvenanceOptimization[]) public ownersToAxes;

    mapping(address => bool) public provenanceVerify;

    mapping(address => address[]) public pendingTransfers;

    //to loop and get all provenances on frontend
    address[] public ownerArray;


    InstrumentDeedToken public instrumentDeedTokenContract;

    

    //add modifier that confirms tokenOwner is caller
    //constructor can also be removed and tokenAddress hardcoded

    constructor (address _tokenAddress) {
        instrumentDeedTokenContract = InstrumentDeedToken(_tokenAddress);
    }


    event ProvenanceCreated(
        ProvenanceOptimization.Types _enumType,
        address childAddress,         
        bytes32 serial, 
        bytes32 brand, 
        bytes32 model, 
        uint16 year, 
        uint instrumentDeedToken,
        bytes32 date,
        bytes32 verificationPhotoHash,
        bytes32[] instrumentPhotoHashes);
    
    event ProvenanceSale(
        address seller,
        address buyer,
        address provenanaceAddress,
        bytes32 date
    );

    // SETTERS 

    //this function needs to check that an existing provenance doesn't already exist for this instrument
    function createNewProvenance(
        ProvenanceOptimization.Types _enumType,
        bytes32 _serial, 
        bytes32  _brand, 
        bytes32 _model, 
        uint16 _year, 
        uint _instrumentDeedToken,
        bytes32 _date,
        bytes32 _verificationPhotoHash,
        bytes32[] memory _instrumentPhotoHashes
    ) external returns(address) {
        //might need to check for dupes on frontend
        require(msg.sender == instrumentDeedTokenContract.ownerOf(_instrumentDeedToken), "You are not the owner of the Deed Token for this instrument");
        ProvenanceOptimization provenance = new ProvenanceOptimization(
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

    // GETTERS

    function getPendingTransfersOfBuyer(address buyer) public view returns(address[] memory){
        return pendingTransfers[buyer];
    }

    // INTERNAL FUNCTIONS FOR updateOnProvenanceSale 

    function _findProvenanceIndex(address seller, ProvenanceOptimization provenanceForIndex) view internal returns(uint) {
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
    function updateOnProvenanceSale(address seller, address buyer, ProvenanceOptimization provenanceSold, bytes32 date) external {
        //update ownership
        ownersToAxes[buyer].push(provenanceSold);

        uint index = _findProvenanceIndex(seller, provenanceSold);

        _burnSoldProvenance(seller, index);

        emit ProvenanceSale(msg.sender, buyer, address(provenanceSold), date);
         
    }

    
    //owner info

    function getOwners() external view returns(address[] memory){
       return ownerArray;
     }  

    //works
    function getOwnersInstruments() public view returns(ProvenanceOptimization[] memory) {
        return ownersToAxes[msg.sender];
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


