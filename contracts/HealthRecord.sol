// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract HealthRecord is Ownable, ReentrancyGuard {
    using ECDSA for bytes32;

    struct HealthRecordData {
        string patientId;
        string doctorId;
        string hospitalId;
        string recordHash;
        string ipfsHash;
        uint256 timestamp;
        bool isVerified;
        string digitalSignature;
    }

    struct ConsentData {
        string patientId;
        string grantedToId;
        string consentHash;
        string[] permissions;
        uint256 expiryDate;
        bool isActive;
        uint256 timestamp;
    }

    struct InsuranceClaimData {
        string claimId;
        string patientId;
        string insurerId;
        string claimHash;
        uint256 amount;
        uint256 timestamp;
        bool isApproved;
    }

    mapping(string => HealthRecordData) public healthRecords;
    mapping(string => ConsentData) public consents;
    mapping(string => InsuranceClaimData) public insuranceClaims;
    
    mapping(string => bool) public verifiedHospitals;
    mapping(string => bool) public verifiedDoctors;
    mapping(string => bool) public verifiedInsurers;
    
    mapping(string => string[]) public patientRecords;
    mapping(string => string[]) public patientConsents;
    mapping(string => string[]) public patientClaims;

    event HealthRecordStored(
        string indexed patientId,
        string indexed recordHash,
        string doctorId,
        string hospitalId,
        uint256 timestamp
    );

    event ConsentGranted(
        string indexed patientId,
        string indexed grantedToId,
        string consentHash,
        uint256 expiryDate
    );

    event InsuranceClaimStored(
        string indexed claimId,
        string indexed patientId,
        string insurerId,
        uint256 amount,
        uint256 timestamp
    );

    event HospitalVerified(string indexed hospitalId, bool isVerified);
    event DoctorVerified(string indexed doctorId, bool isVerified);
    event InsurerVerified(string indexed insurerId, bool isVerified);

    modifier onlyVerifiedHospital(string memory hospitalId) {
        require(verifiedHospitals[hospitalId], "Hospital not verified");
        _;
    }

    modifier onlyVerifiedDoctor(string memory doctorId) {
        require(verifiedDoctors[doctorId], "Doctor not verified");
        _;
    }

    modifier onlyVerifiedInsurer(string memory insurerId) {
        require(verifiedInsurers[insurerId], "Insurer not verified");
        _;
    }

    function storeHealthRecord(
        string memory _patientId,
        string memory _doctorId,
        string memory _hospitalId,
        string memory _recordHash,
        string memory _ipfsHash,
        string memory _digitalSignature
    ) external onlyVerifiedHospital(_hospitalId) onlyVerifiedDoctor(_doctorId) {
        require(bytes(_patientId).length > 0, "Patient ID cannot be empty");
        require(bytes(_recordHash).length > 0, "Record hash cannot be empty");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");

        HealthRecordData memory newRecord = HealthRecordData({
            patientId: _patientId,
            doctorId: _doctorId,
            hospitalId: _hospitalId,
            recordHash: _recordHash,
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp,
            isVerified: true,
            digitalSignature: _digitalSignature
        });

        healthRecords[_recordHash] = newRecord;
        patientRecords[_patientId].push(_recordHash);

        emit HealthRecordStored(_patientId, _recordHash, _doctorId, _hospitalId, block.timestamp);
    }

    function grantConsent(
        string memory _patientId,
        string memory _grantedToId,
        string memory _consentHash,
        string[] memory _permissions,
        uint256 _expiryDate
    ) external {
        require(bytes(_patientId).length > 0, "Patient ID cannot be empty");
        require(bytes(_grantedToId).length > 0, "Granted to ID cannot be empty");
        require(bytes(_consentHash).length > 0, "Consent hash cannot be empty");
        require(_expiryDate > block.timestamp, "Expiry date must be in the future");

        ConsentData memory newConsent = ConsentData({
            patientId: _patientId,
            grantedToId: _grantedToId,
            consentHash: _consentHash,
            permissions: _permissions,
            expiryDate: _expiryDate,
            isActive: true,
            timestamp: block.timestamp
        });

        consents[_consentHash] = newConsent;
        patientConsents[_patientId].push(_consentHash);

        emit ConsentGranted(_patientId, _grantedToId, _consentHash, _expiryDate);
    }

    function storeInsuranceClaim(
        string memory _claimId,
        string memory _patientId,
        string memory _insurerId,
        string memory _claimHash,
        uint256 _amount
    ) external onlyVerifiedInsurer(_insurerId) {
        require(bytes(_claimId).length > 0, "Claim ID cannot be empty");
        require(bytes(_patientId).length > 0, "Patient ID cannot be empty");
        require(bytes(_claimHash).length > 0, "Claim hash cannot be empty");
        require(_amount > 0, "Amount must be greater than 0");

        InsuranceClaimData memory newClaim = InsuranceClaimData({
            claimId: _claimId,
            patientId: _patientId,
            insurerId: _insurerId,
            claimHash: _claimHash,
            amount: _amount,
            timestamp: block.timestamp,
            isApproved: false
        });

        insuranceClaims[_claimHash] = newClaim;
        patientClaims[_patientId].push(_claimHash);

        emit InsuranceClaimStored(_claimId, _patientId, _insurerId, _amount, block.timestamp);
    }

    function verifyHealthRecord(string memory _recordHash) external view returns (bool) {
        return healthRecords[_recordHash].isVerified;
    }

    function getHealthRecord(string memory _recordHash) external view returns (HealthRecordData memory) {
        return healthRecords[_recordHash];
    }

    function getPatientRecords(string memory _patientId) external view returns (string[] memory) {
        return patientRecords[_patientId];
    }

    function getConsent(string memory _consentHash) external view returns (ConsentData memory) {
        return consents[_consentHash];
    }

    function getPatientConsents(string memory _patientId) external view returns (string[] memory) {
        return patientConsents[_patientId];
    }

    function getInsuranceClaim(string memory _claimHash) external view returns (InsuranceClaimData memory) {
        return insuranceClaims[_claimHash];
    }

    function getPatientClaims(string memory _patientId) external view returns (string[] memory) {
        return patientClaims[_patientId];
    }

    function verifyHospital(string memory _hospitalId, bool _isVerified) external onlyOwner {
        verifiedHospitals[_hospitalId] = _isVerified;
        emit HospitalVerified(_hospitalId, _isVerified);
    }

    function verifyDoctor(string memory _doctorId, bool _isVerified) external onlyOwner {
        verifiedDoctors[_doctorId] = _isVerified;
        emit DoctorVerified(_doctorId, _isVerified);
    }

    function verifyInsurer(string memory _insurerId, bool _isVerified) external onlyOwner {
        verifiedInsurers[_insurerId] = _isVerified;
        emit InsurerVerified(_insurerId, _isVerified);
    }

    function revokeConsent(string memory _consentHash) external {
        require(consents[_consentHash].isActive, "Consent not found or already revoked");
        consents[_consentHash].isActive = false;
    }

    function approveInsuranceClaim(string memory _claimHash) external onlyOwner {
        require(bytes(_claimHash).length > 0, "Claim hash cannot be empty");
        insuranceClaims[_claimHash].isApproved = true;
    }

    function isConsentValid(string memory _consentHash) external view returns (bool) {
        ConsentData memory consent = consents[_consentHash];
        return consent.isActive && consent.expiryDate > block.timestamp;
    }

    function getTotalRecords() external view returns (uint256) {
        return patientRecords[msg.sender].length;
    }

    function getTotalConsents() external view returns (uint256) {
        return patientConsents[msg.sender].length;
    }

    function getTotalClaims() external view returns (uint256) {
        return patientClaims[msg.sender].length;
    }
}
