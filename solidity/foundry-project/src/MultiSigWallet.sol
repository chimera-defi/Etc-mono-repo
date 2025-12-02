// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MultiSigWallet
 * @notice A multi-signature wallet requiring N-of-M signatures to execute transactions
 * @dev Demonstrates: mapping of mappings, arrays, loops, low-level calls
 */
contract MultiSigWallet {
    // ============ Errors ============
    error MultiSig__InvalidOwnerCount();
    error MultiSig__InvalidThreshold();
    error MultiSig__NotOwner();
    error MultiSig__TxDoesNotExist();
    error MultiSig__TxAlreadyExecuted();
    error MultiSig__TxAlreadyConfirmed();
    error MultiSig__TxNotConfirmed();
    error MultiSig__InsufficientConfirmations();
    error MultiSig__TxFailed();
    error MultiSig__ZeroAddress();
    error MultiSig__DuplicateOwner();

    // ============ Events ============
    event Deposit(address indexed sender, uint256 amount, uint256 balance);
    event SubmitTransaction(
        address indexed owner,
        uint256 indexed txIndex,
        address indexed to,
        uint256 value,
        bytes data
    );
    event ConfirmTransaction(address indexed owner, uint256 indexed txIndex);
    event RevokeConfirmation(address indexed owner, uint256 indexed txIndex);
    event ExecuteTransaction(address indexed owner, uint256 indexed txIndex);

    // ============ Structs ============
    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 numConfirmations;
    }

    // ============ State Variables ============
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public threshold;

    Transaction[] public transactions;
    // mapping from tx index => owner => confirmed
    mapping(uint256 => mapping(address => bool)) public isConfirmed;

    // ============ Modifiers ============
    modifier onlyOwner() {
        if (!isOwner[msg.sender]) revert MultiSig__NotOwner();
        _;
    }

    modifier txExists(uint256 _txIndex) {
        if (_txIndex >= transactions.length) revert MultiSig__TxDoesNotExist();
        _;
    }

    modifier notExecuted(uint256 _txIndex) {
        if (transactions[_txIndex].executed) revert MultiSig__TxAlreadyExecuted();
        _;
    }

    modifier notConfirmed(uint256 _txIndex) {
        if (isConfirmed[_txIndex][msg.sender]) revert MultiSig__TxAlreadyConfirmed();
        _;
    }

    // ============ Constructor ============
    constructor(address[] memory _owners, uint256 _threshold) {
        if (_owners.length == 0) revert MultiSig__InvalidOwnerCount();
        if (_threshold == 0 || _threshold > _owners.length) {
            revert MultiSig__InvalidThreshold();
        }

        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            if (owner == address(0)) revert MultiSig__ZeroAddress();
            if (isOwner[owner]) revert MultiSig__DuplicateOwner();

            isOwner[owner] = true;
            owners.push(owner);
        }

        threshold = _threshold;
    }

    // ============ External Functions ============
    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    function submitTransaction(
        address _to,
        uint256 _value,
        bytes calldata _data
    ) external onlyOwner returns (uint256 txIndex) {
        txIndex = transactions.length;

        transactions.push(
            Transaction({
                to: _to,
                value: _value,
                data: _data,
                executed: false,
                numConfirmations: 0
            })
        );

        emit SubmitTransaction(msg.sender, txIndex, _to, _value, _data);
    }

    function confirmTransaction(uint256 _txIndex)
        external
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
        notConfirmed(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];
        transaction.numConfirmations += 1;
        isConfirmed[_txIndex][msg.sender] = true;

        emit ConfirmTransaction(msg.sender, _txIndex);
    }

    function executeTransaction(uint256 _txIndex)
        external
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];

        if (transaction.numConfirmations < threshold) {
            revert MultiSig__InsufficientConfirmations();
        }

        transaction.executed = true;

        (bool success, ) = transaction.to.call{value: transaction.value}(
            transaction.data
        );
        if (!success) revert MultiSig__TxFailed();

        emit ExecuteTransaction(msg.sender, _txIndex);
    }

    function revokeConfirmation(uint256 _txIndex)
        external
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
    {
        if (!isConfirmed[_txIndex][msg.sender]) revert MultiSig__TxNotConfirmed();

        Transaction storage transaction = transactions[_txIndex];
        transaction.numConfirmations -= 1;
        isConfirmed[_txIndex][msg.sender] = false;

        emit RevokeConfirmation(msg.sender, _txIndex);
    }

    // ============ View Functions ============
    function getOwners() external view returns (address[] memory) {
        return owners;
    }

    function getTransactionCount() external view returns (uint256) {
        return transactions.length;
    }

    function getTransaction(uint256 _txIndex)
        external
        view
        returns (
            address to,
            uint256 value,
            bytes memory data,
            bool executed,
            uint256 numConfirmations
        )
    {
        Transaction storage transaction = transactions[_txIndex];

        return (
            transaction.to,
            transaction.value,
            transaction.data,
            transaction.executed,
            transaction.numConfirmations
        );
    }
}
