"""
Implementation of Håstad's Broadcast Attack simulation.

This module provides the core functionality for simulating Håstad's attack
on RSA encryption when the same message is sent to multiple recipients using
a low public exponent.
"""
import sympy as sp
from sympy.ntheory.modular import crt
import logging
import random  # Add import for Python's random module
from typing import List, Optional

from app.models.simulation import (
    HastadAttackResponse, Recipient, SimulationStep
)

logger = logging.getLogger(__name__)


def run_simulation(
    exponent: int = 3,
    key_size: int = 512,
    message: Optional[int] = None
) -> HastadAttackResponse:
    """
    Run a simulation of Håstad's Broadcast Attack.
    
    Args:
        exponent: The RSA public exponent e (default: 3)
        key_size: The size of RSA keys in bits (default: 512)
        message: Optional specific message to encrypt (default: random)
        
    Returns:
        The results of the simulation
    """
    logger.info(
        f"Starting Hastad attack with e={exponent}, key_size={key_size}"
    )
    
    # Track simulation steps
    steps: List[SimulationStep] = []
    steps.append(SimulationStep(
        step="Generating RSA key pairs",
        description=f"Creating {exponent} RSA key pairs with e={exponent}"
    ))
    
    # Generate RSA parameters for the required number of recipients
    recipients_data = []
    moduli = []
    
    for i in range(exponent):
        # Generate prime factors p and q
        p = sp.randprime(2**(key_size//2-1), 2**(key_size//2))
        q = sp.randprime(2**(key_size//2-1), 2**(key_size//2))
        n = p * q
        phi = (p - 1) * (q - 1)
        
        # Ensure e is coprime to φ(n)
        while sp.gcd(exponent, phi) != 1:
            p = sp.randprime(2**(key_size//2-1), 2**(key_size//2))
            q = sp.randprime(2**(key_size//2-1), 2**(key_size//2))
            n = p * q
            phi = (p - 1) * (q - 1)
        
        # Calculate private key d
        d = pow(exponent, -1, phi)
        
        # Store recipient data
        recipient = {
            'p': str(p),
            'q': str(q),
            'n': str(n),
            'd': str(d),
            'index': i + 1
        }
        recipients_data.append(recipient)
        moduli.append(n)
        
        steps.append(SimulationStep(
            step=f"Key pair {i+1} generated",
            description=f"Recipient {i+1} modulus (n{i+1}): {n}"
        ))
    
    # Create message (or use provided message)
    min_modulus = min(moduli)
    if message is None:
        # Create a random message that's smaller than all moduli
        message = random.randint(2**(key_size//2), min_modulus - 1)
    else:
        # Ensure message is within valid range
        if message >= min_modulus:
            message = message % min_modulus
    
    original_message = message
    
    steps.append(SimulationStep(
        step="Message preparation",
        description=f"Original message: {original_message}"
    ))
    
    # Encrypt message for each recipient
    ciphertexts = []
    for i, recipient in enumerate(recipients_data):
        n = int(recipient['n'])
        c = pow(message, exponent, n)
        ciphertexts.append(str(c))
        
        steps.append(SimulationStep(
            step=f"Encryption for recipient {i+1}",
            description=f"C{i+1} = M^{exponent} mod N{i+1} = {c}"
        ))
    
    # Apply Chinese Remainder Theorem to recover M^e
    steps.append(SimulationStep(
        step="Applying Chinese Remainder Theorem",
        description="Using CRT to find M^e mod (N₁×N₂×...×N_e)"
    ))
    
    try:
        # Convert strings back to integers for CRT
        moduli_int = [int(recipient['n']) for recipient in recipients_data]
        ciphertexts_int = [int(c) for c in ciphertexts]
        
        # Apply CRT to find M^e
        result = crt(moduli_int, ciphertexts_int)
        M_e_mod_product = result[0]  # This is M^e mod (N₁×N₂×...×N_e)
        
        steps.append(SimulationStep(
            step="CRT Result",
            description=(
                f"M^{exponent} mod (N₁×N₂×...×N_{exponent}) = "
                f"{M_e_mod_product}"
            )
        ))
        
        # Since M^e < N₁×N₂×...×N_e, M_e_mod_product is actually equal to M^e
        # Take the e-th root to recover M
        steps.append(SimulationStep(
            step="Computing e-th root",
            description=f"Taking the {exponent}-th root of {M_e_mod_product}"
        ))
        
        recovered_message = round(M_e_mod_product ** (1/exponent))
        success = recovered_message == original_message
        
        steps.append(SimulationStep(
            step="Attack result",
            description=(
                f"Recovered message: {recovered_message}\n"
                f"Original message: {original_message}\n"
                f"Attack successful: {success}"
            )
        ))
        
        # Create recipients list from recipient data
        recipients = [Recipient(**r) for r in recipients_data]
        
        return HastadAttackResponse(
            original_message=str(original_message),
            recovered_message=str(recovered_message),
            success=success,
            recipients=recipients,
            ciphertexts=ciphertexts,
            simulation_steps=steps
        )
        
    except Exception as e:
        logger.error(f"Error during Hastad attack simulation: {str(e)}")
        steps.append(SimulationStep(
            step="Error",
            description=f"Simulation failed: {str(e)}"
        ))
        
        # Create recipients list from recipient data
        recipients = [Recipient(**r) for r in recipients_data]
        
        return HastadAttackResponse(
            original_message=str(original_message),
            recovered_message="Failed to recover message",
            success=False,
            recipients=recipients,
            ciphertexts=ciphertexts,
            simulation_steps=steps
        )
