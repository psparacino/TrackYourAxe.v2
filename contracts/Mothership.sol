// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";
import "./Provenance.sol";
import "./InstrumentDeedToken.sol";




contract Mothership is Ownable {

    //cuurent owners only. Provenance History is on on Provenance. Not sure array is best here.  Can back full date up on trad. database if needed
    mapping(address => Provenance[]) public ownersToAxes;

    mapping(address => bool) public provenanceVerify;

    //to loop and get all provenances on frontend
    address[] public ownerArray;


    InstrumentDeedToken public instrumentDeedTokenContract;

    

    //add modifier that confirms tokenOwner is caller
    //constructor can also be removed and tokenAddress hardcoded

    constructor (address _tokenAddress) {
        instrumentDeedTokenContract = InstrumentDeedToken(_tokenAddress);
    }


    event ProvenanceCreated(
        Provenance.Types _enumType,
        address childAddress,         
        string serial, 
        string brand, 
        string model, 
        uint16 year, 
        uint instrumentDeedToken,
        string verificationPhotoHash,
        string firstOwner, 
        string[] instrumentPhotoHashes);
    
    event ProvenanceSale(
        address seller,
        address buyer,
        address provenanaceAddress
    );

    
    //this function needs to check that an existing provenance doesn't already exist for this instrument
    function createNewProvenance(
        Provenance.Types _enumType,
        string memory _serial, 
        string memory _brand, 
        string memory _model, 
        uint16 _year, 
        uint _instrumentDeedToken,
        string memory _verificationPhotoHash,
        string memory _firstOwner, 
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
            _verificationPhotoHash, 
            _firstOwner, 
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
            _verificationPhotoHash, 
            _firstOwner, 
            _instrumentPhotoHashes);

        return(address(provenance));
            
        
    }

    //GETTERS

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


    //called from Provenance to update mothership state. this needs to have tokenOwner modifier on it
    function updateOnProvenanceSale(address seller, address buyer, Provenance provenanceSold) external {
        //update ownership
        ownersToAxes[buyer].push(provenanceSold);

        uint index = _findProvenanceIndex(msg.sender, provenanceSold);

        _burnSoldProvenance(seller, index);

        emit ProvenanceSale(msg.sender, buyer, address(provenanceSold));
         
    }

    

    function getOwners() external view returns(address[] memory){
       return ownerArray;
     }  

    //works
    function getOwnersInstruments() public view returns(Provenance[] memory) {
        return ownersToAxes[msg.sender];
    }

    /*
    //returning contracts inside array inside owner Map
    function getAllProvenances() external view returns(address[] memory){     
     return provenanceArray;
    }  
    */ 

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