// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ISerialHeaderContract.sol";
import "./ISerialDetailsContract.sol";


contract SerialHeaderContract is ISerialHeaderContract{



    mapping(uint256 => SerialHeader) public serialHeaders;
    uint256[] private allSerialHeaderIds;
    
    ISerialDetailsContract public serialDetailsContract; // Instance variable for SerialDetailsContract
    
   
    // Function to set the address of SerialDetailsContract
    function setSerialDetailsContract(ISerialDetailsContract _serialDetailsContract) external {
        serialDetailsContract = _serialDetailsContract;
    }
    
    // Function to create a new SerialHeader
    function createSerialHeader(
        uint256 _serialHeaderId,
        uint256 _docDate,
        uint256 _postingDate,
        string memory _billOfLading,
        string memory _headerText,
        string memory _refDocNo,
        uint256[] memory _serialIds
    ) external {
        require(serialHeaders[_serialHeaderId].serial_header_id == 0, "Serial header already exists");

        SerialHeader memory newSerialHeader = SerialHeader({
            serial_header_id: _serialHeaderId,
            bill_of_lading: _billOfLading,
            doc_date: _docDate,
            header_text: _headerText,
            posting_date: _postingDate,
            ref_doc_no: _refDocNo,
            serialIds: _serialIds
        });

        serialHeaders[_serialHeaderId] = newSerialHeader;
        allSerialHeaderIds.push(_serialHeaderId);

        emit SerialHeaderAdded(_serialHeaderId, newSerialHeader);
    }
    
    // Function to update an existing SerialHeader
    function updateSerialHeader(
        uint256 _serialHeaderId,
        string memory _billOfLading,
        uint256 _docDate,
        string memory _headerText,
        uint256 _postingDate,
        string memory _refDocNo,
        uint256[] memory _serialIds
    ) external {
        require(serialHeaders[_serialHeaderId].serial_header_id != 0, "Serial header does not exist");

        SerialHeader storage updatedSerialHeader = serialHeaders[_serialHeaderId];
        updatedSerialHeader.bill_of_lading = _billOfLading;
        updatedSerialHeader.doc_date = _docDate;
        updatedSerialHeader.header_text = _headerText;
        updatedSerialHeader.posting_date = _postingDate;
        updatedSerialHeader.ref_doc_no = _refDocNo;
        updatedSerialHeader.serialIds = _serialIds;

        emit SerialHeaderUpdated(_serialHeaderId, updatedSerialHeader);
    }

    // Function to retrieve all SerialHeader IDs
    function getAllSerialHeaderIds() external view returns (uint256[] memory) {
        return allSerialHeaderIds;
    }

    // Function to get details of a SerialHeader by ID
    function getSerialHeader(uint256 _serialHeaderId) external view returns (SerialHeader memory) {
        return serialHeaders[_serialHeaderId];
    }

        // Function to get SerialDetailStructs from SerialDetailsContract
    function getSerialDetailStructs(uint256[] memory _serialIds) external view returns (ISerialDetailsContract.SerialDetailStruct[] memory) {
        
        ISerialDetailsContract.SerialDetailStruct[] memory serialDetailStructArray =  serialDetailsContract.getSerialDetailStructs(_serialIds);
        return serialDetailStructArray;
    }

        // Function to check if a SerialHeader exists by ID
    function serialHeaderExists(uint256 _serialHeaderId) external view returns (bool) {
        return serialHeaders[_serialHeaderId].serial_header_id != 0;
    }
}
