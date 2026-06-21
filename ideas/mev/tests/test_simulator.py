"""
Tests for the Simulation Module

Run with: pytest tests/test_simulator.py
"""

import pytest
from unittest.mock import Mock, patch

# TODO: Uncomment when module is implemented
# from src.simulator import FirepitSimulator, SimulationReport, Risk, RiskLevel


class TestRisk:
    """Tests for Risk dataclass."""
    
    def test_risk_levels(self):
        """Test risk level enum values."""
        # TODO: Implement
        pass


class TestSimulationReport:
    """Tests for SimulationReport dataclass."""
    
    def test_to_dict_serialization(self):
        """Test JSON serialization."""
        # TODO: Implement
        pass


class TestFirepitSimulator:
    """Tests for FirepitSimulator class."""
    
    @pytest.fixture
    def mock_rpc(self):
        return "http://localhost:8545"
    
    def test_get_current_nonce(self, mock_rpc):
        """Test nonce retrieval from contract."""
        # TODO: Implement
        pass
    
    def test_simulate_release_success(self, mock_rpc):
        """Test successful simulation."""
        # TODO: Implement with mock eth_call
        pass
    
    def test_simulate_release_failure(self, mock_rpc):
        """Test simulation detects revert."""
        # TODO: Implement
        pass
    
    def test_identify_risks_insufficient_uni(self, mock_rpc):
        """Test risk detection for low UNI balance."""
        # TODO: Implement
        pass
    
    def test_identify_risks_no_allowance(self, mock_rpc):
        """Test risk detection for missing approval."""
        # TODO: Implement
        pass
    
    def test_gas_estimation(self, mock_rpc):
        """Test gas estimation accuracy."""
        # TODO: Implement
        pass
