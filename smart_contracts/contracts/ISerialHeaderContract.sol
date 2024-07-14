// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ISerialDetailsContract.sol";
interface ISerialHeaderContract {
    

    struct SerialHeader {
        string bill_of_lading;
        uint256 doc_date; 
        string header_text;
        uint256 posting_date; 
        string ref_doc_no;
        uint256 serial_header_id;
        uint256[] serialIds;
    }

    event SerialHeaderAdded(uint256 serialHeaderId, SerialHeader serialHeader);
    event SerialHeaderUpdated(uint256 serialHeaderId, SerialHeader serialHeader);
    event SerialHeaderDeleted(uint256 serialHeaderId);

    function setSerialDetailsContract(ISerialDetailsContract _serialDetailsContract) external;
    
    function createSerialHeader(
        uint256 _serialHeaderId,
        uint256 _docDate,
        uint256 _postingDate,
        string memory _billOfLading,
        string memory _headerText,
        string memory _refDocNo,
        uint256[] memory _serialIds
    ) external;

    function updateSerialHeader(
        uint256 _serialHeaderId,
        string calldata _billOfLading,
        uint256 _docDate,
        string calldata _headerText,
        uint256 _postingDate,
        string calldata _refDocNo,
        uint256[] calldata _serialIds
    ) external;

    function getAllSerialHeaderIds() external view returns (uint256[] memory);

    function getSerialHeader(uint256 _serialHeaderId) external view returns (SerialHeader memory);

    function getSerialDetailStructs(uint256[] calldata _serialIds) external view returns (ISerialDetailsContract.SerialDetailStruct[] memory);
    // Function to check if a SerialHeader exists by ID
    function serialHeaderExists(uint256 _serialHeaderId) external view returns (bool);

}
