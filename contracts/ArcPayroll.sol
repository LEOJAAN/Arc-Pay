// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title ArcPayroll
 * @dev Batch payroll processing contract for Arc Payout using USDC.
 */
contract ArcPayroll is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    IERC20 private immutable _usdcToken;

    event SalaryPaid(address indexed employee, uint256 amount);
    event BatchPayrollExecuted(address indexed executor, uint256 totalAmount, uint256 employeeCount);

    constructor(address usdcTokenAddress) Ownable(msg.sender) {
        require(usdcTokenAddress != address(0), "ArcPayroll: USDC token address cannot be zero");
        _usdcToken = IERC20(usdcTokenAddress);
    }

    /**
     * @dev Executes batch payroll payments.
     * @param recipients Array of employee addresses to receive payroll.
     * @param amounts Array of corresponding USDC amounts for each employee.
     */
    function batchPayEmployees(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external nonReentrant whenNotPaused {
        require(recipients.length > 0, "ArcPayroll: Recipients list cannot be empty");
        require(recipients.length == amounts.length, "ArcPayroll: Recipients and amounts arrays length mismatch");

        uint256 totalAmount = 0;
        uint256 length = recipients.length;

        for (uint256 i = 0; i < length; i++) {
            address employee = recipients[i];
            uint256 amount = amounts[i];

            require(employee != address(0), "ArcPayroll: Employee address cannot be the zero address");
            require(amount > 0, "ArcPayroll: Pay amount must be greater than zero");

            totalAmount += amount;

            // Transfer tokens from the owner (msg.sender) to the employee
            _usdcToken.safeTransferFrom(msg.sender, employee, amount);

            emit SalaryPaid(employee, amount);
        }

        emit BatchPayrollExecuted(msg.sender, totalAmount, length);
    }

    /**
     * @dev Pause the contract payroll execution.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract payroll execution.
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Returns the USDC token address.
     */
    function getUsdcToken() external view returns (address) {
        return address(_usdcToken);
    }

    /**
     * @dev Calculates the total USDC amount required for a batch.
     */
    function getBatchTotal(uint256[] calldata amounts) external pure returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            total += amounts[i];
        }
        return total;
    }
}
