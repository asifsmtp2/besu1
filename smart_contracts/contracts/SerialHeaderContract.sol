// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SerialHeaderContract {

    struct SerialDetail {
        string serialId;
        string dateCode;
        string lotCode;
        string poItem;
        string poNumber;
        uint quantity;
        string uom;
        string receivingLocation;
        string receivingPlant;
    }

    struct SerialHeader {
        string headerTxt;
        string billOfLanding;
        string docDate;
        string postingDate;
        string refDocNo;
        uint[] serialDetailIds; // Store IDs of SerialDetails instead of array
    }

    mapping(uint => SerialDetail) public serialDetailsMap;
    mapping(string => SerialHeader) public serialHeadersMap;
    uint public serialDetailCounter = 0;

    // Create SerialDetail function
    function createSerialDetail(
        string memory _serialId,
        string memory _dateCode,
        string memory _lotCode,
        string memory _poItem,
        string memory _poNumber,
        uint _quantity,
        string memory _uom,
        string memory _receivingLocation,
        string memory _receivingPlant
    ) public {
        SerialDetail memory newSerialDetail = SerialDetail({
            serialId: _serialId,
            dateCode: _dateCode,
            lotCode: _lotCode,
            poItem: _poItem,
            poNumber: _poNumber,
            quantity: _quantity,
            uom: _uom,
            receivingLocation: _receivingLocation,
            receivingPlant: _receivingPlant
        });
        serialDetailsMap[serialDetailCounter] = newSerialDetail;
        serialDetailCounter++;
    }

    // Create SerialHeader function
    function createSerialHeader(
        string memory _serialHeaderId,
        string memory _headerTxt,
        string memory _billOfLanding,
        string memory _docDate,
        string memory _postingDate,
        string memory _refDocNo,
        uint[] memory _serialDetailIds
    ) public {
        SerialHeader memory newSerialHeader = SerialHeader({
            headerTxt: _headerTxt,
            billOfLanding: _billOfLanding,
            docDate: _docDate,
            postingDate: _postingDate,
            refDocNo: _refDocNo,
            serialDetailIds: _serialDetailIds
        });
        serialHeadersMap[_serialHeaderId] = newSerialHeader;
    }

    // Read operation - Get details of a serial header by serialHeaderId
    function getSerialHeader(string memory _serialHeaderId) public view returns (
        string memory headerTxt,
        string memory billOfLanding,
        string memory docDate,
        string memory postingDate,
        string memory refDocNo,
        uint[] memory serialDetailIds
    ) {
        SerialHeader storage header = serialHeadersMap[_serialHeaderId];
        return (
            header.headerTxt,
            header.billOfLanding,
            header.docDate,
            header.postingDate,
            header.refDocNo,
            header.serialDetailIds
        );
    }

    // Read operation - Get details of a serial detail by ID
    function getSerialDetail(uint id) public view returns (
        string memory serialId,
        string memory dateCode,
        string memory lotCode,
        string memory poItem,
        string memory poNumber,
        uint quantity,
        string memory uom,
        string memory receivingLocation,
        string memory receivingPlant
    ) {
        SerialDetail storage detail = serialDetailsMap[id];
        return (
            detail.serialId,
            detail.dateCode,
            detail.lotCode,
            detail.poItem,
            detail.poNumber,
            detail.quantity,
            detail.uom,
            detail.receivingLocation,
            detail.receivingPlant
        );
    }
}
