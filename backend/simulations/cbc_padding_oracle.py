"""
Implementation of CBC Padding Oracle Attack simulation.

This module provides the core functionality for simulating a padding oracle attack
on CBC mode encryption, demonstrating how padding validation can be exploited
to decrypt ciphertext without knowing the encryption key.
"""
import os
import base64
import logging
from typing import List, Dict, Any, Optional, Tuple
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad

from app.models.simulation import (
    CBCPaddingOracleResponse, SimulationStep, CBCBlock
)

logger = logging.getLogger(__name__)

def generate_random_key(key_size: int) -> bytes:
    """Generate a random AES key of specified length in bytes."""
    return os.urandom(key_size // 8)

def generate_random_iv() -> bytes:
    """Generate a random initialization vector for AES CBC mode."""
    return os.urandom(AES.block_size)

def encrypt_message(message: str, key: bytes, iv: bytes) -> bytes:
    """Encrypt a message using AES-CBC mode with the given key and IV."""
    message_bytes = message.encode('utf-8')
    padded_message = pad(message_bytes, AES.block_size)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    ciphertext = cipher.encrypt(padded_message)
    return ciphertext

def decrypt_message(ciphertext: bytes, key: bytes, iv: bytes) -> str:
    """Decrypt a message using AES-CBC mode with the given key and IV."""
    cipher = AES.new(key, AES.MODE_CBC, iv)
    padded_plaintext = cipher.decrypt(ciphertext)
    plaintext = unpad(padded_plaintext, AES.block_size)
    return plaintext.decode('utf-8')

def check_padding(ciphertext: bytes, key: bytes, iv: bytes) -> bool:
    """Check if ciphertext decrypts to a message with valid padding."""
    try:
        cipher = AES.new(key, AES.MODE_CBC, iv)
        padded_plaintext = cipher.decrypt(ciphertext)
        # Attempt to unpad will raise an exception if padding is invalid
        unpad(padded_plaintext, AES.block_size)
        return True
    except (ValueError, KeyError):
        return False

def attack_block(prev_block: bytes, current_block: bytes, key: bytes, steps: List[SimulationStep]) -> bytes:
    """
    Perform a padding oracle attack on a single block.
    
    Args:
        prev_block: The previous ciphertext block (or IV for the first block)
        current_block: The ciphertext block to decrypt
        key: The encryption key (used by the oracle only)
        steps: List to add simulation steps to
        
    Returns:
        The decrypted plaintext bytes for the current block
    """
    decrypted = bytearray(AES.block_size)
    
    # Work through each byte position in reverse
    for byte_pos in range(AES.block_size - 1, -1, -1):
        # Current padding value
        padding_value = AES.block_size - byte_pos
        
        # Create a modified previous block for testing
        modified_prev_block = bytearray(prev_block)
        
        # Set the bytes we've already decrypted to produce the desired padding
        for i in range(byte_pos + 1, AES.block_size):
            # XOR with decrypted intermediate byte to cancel it out
            # Then XOR with the padding value we want
            modified_prev_block[i] = modified_prev_block[i] ^ decrypted[i] ^ padding_value
        
        # Now find the correct value for the current byte position
        found = False
        for guess in range(256):
            modified_prev_block[byte_pos] = prev_block[byte_pos] ^ guess
            
            # Use the oracle to check if the padding is valid
            if check_padding(current_block, key, modified_prev_block):
                # Determine the decrypted intermediate byte
                decrypted[byte_pos] = guess ^ padding_value
                
                steps.append(SimulationStep(
                    step=f"Found byte at position {byte_pos}",
                    description=f"Found correct value for byte {AES.block_size - 1 - byte_pos}: {guess}. "
                                f"Decrypted intermediate byte: {decrypted[byte_pos]}"
                ))
                
                # Double check that we didn't get a false positive due to a higher padding value
                if byte_pos > 0 and padding_value == 1:
                    # Modify the second-to-last byte and check again
                    check_byte = bytearray(modified_prev_block)
                    check_byte[byte_pos - 1] = check_byte[byte_pos - 1] ^ 1  # Flip a bit
                    
                    # If still valid, we have a false positive - try another value
                    if check_padding(current_block, key, check_byte):
                        continue
                
                found = True
                break
        
        if not found:
            # This should not happen with a proper oracle
            steps.append(SimulationStep(
                step=f"Error finding byte at position {byte_pos}",
                description="Could not find a valid padding byte. The oracle may not be functioning correctly."
            ))
            decrypted[byte_pos] = 0  # Use a placeholder value
    
    return bytes(decrypted)

def run_simulation(
    message: Optional[str] = None,
    key_size: int = 128,
    auto_decrypt: bool = True,
    specific_blocks: Optional[List[int]] = None
) -> CBCPaddingOracleResponse:
    """
    Run a simulation of a CBC Padding Oracle Attack.
    
    Args:
        message: Optional message to encrypt (default uses a predefined message)
        key_size: AES key size in bits (128, 192, or 256)
        auto_decrypt: Whether to automatically decrypt all blocks
        specific_blocks: Specific block indices to decrypt (if auto_decrypt is False)
        
    Returns:
        The results of the simulation
    """
    logger.info(f"Starting CBC Padding Oracle attack with key_size={key_size}")
    
    # Track simulation steps
    steps: List[SimulationStep] = []
    
    # Use default message if none provided
    if not message:
        message = "This is a secret message that will be decrypted by the padding oracle attack."
    
    steps.append(SimulationStep(
        step="Initial Setup",
        description=f"Message to encrypt: '{message}'\nKey size: {key_size} bits"
    ))
    
    # Generate encryption key and IV
    key = generate_random_key(key_size)
    iv = generate_random_iv()
    
    steps.append(SimulationStep(
        step="Key and IV Generation",
        description=(
            f"Generated AES key: {base64.b64encode(key).decode('ascii')}\n"
            f"Generated IV: {base64.b64encode(iv).decode('ascii')}"
        )
    ))
    
    # Encrypt the message
    ciphertext = encrypt_message(message, key, iv)
    
    steps.append(SimulationStep(
        step="Encryption",
        description=(
            f"Encrypted ciphertext: {base64.b64encode(ciphertext).decode('ascii')}\n"
            f"Ciphertext length: {len(ciphertext)} bytes"
        )
    ))
    
    # Split ciphertext into blocks for visualization
    blocks = []
    for i in range(0, len(ciphertext), AES.block_size):
        block = ciphertext[i:i+AES.block_size]
        blocks.append(CBCBlock(
            index=i // AES.block_size,
            data=base64.b64encode(block).decode('ascii'),
            decrypted=False
        ))
    
    # Prepare blocks list for the attack
    block_count = len(ciphertext) // AES.block_size
    steps.append(SimulationStep(
        step="Block Analysis",
        description=f"Ciphertext split into {block_count} blocks of {AES.block_size} bytes each"
    ))
    
    # Determine which blocks to decrypt
    blocks_to_decrypt = []
    if auto_decrypt:
        blocks_to_decrypt = list(range(block_count))
    elif specific_blocks:
        blocks_to_decrypt = [i for i in specific_blocks if 0 <= i < block_count]
    
    # If no blocks to decrypt, default to the first block
    if not blocks_to_decrypt and block_count > 0:
        blocks_to_decrypt = [0]
    
    # Perform the attack on each specified block
    decrypted_blocks = []
    for block_idx in blocks_to_decrypt:
        steps.append(SimulationStep(
            step=f"Attacking Block {block_idx}",
            description=f"Starting padding oracle attack on block {block_idx}"
        ))
        
        if block_idx == 0:
            # For the first block, use the IV as the previous block
            prev_block = iv
            current_block = ciphertext[:AES.block_size]
        else:
            # For subsequent blocks, use the previous ciphertext block
            prev_block = ciphertext[(block_idx-1)*AES.block_size:block_idx*AES.block_size]
            current_block = ciphertext[block_idx*AES.block_size:(block_idx+1)*AES.block_size]
        
        # Attack the block
        intermediate_bytes = attack_block(prev_block, current_block, key, steps)
        
        # XOR with the previous block to get the plaintext
        plaintext_bytes = bytearray(AES.block_size)
        for i in range(AES.block_size):
            plaintext_bytes[i] = intermediate_bytes[i] ^ prev_block[i]
        
        # Add the decrypted block to our results
        try:
            # Try to decode as UTF-8 (might fail for some blocks)
            decrypted_text = plaintext_bytes.decode('utf-8', errors='replace')
        except UnicodeDecodeError:
            # Fallback to hex representation
            decrypted_text = plaintext_bytes.hex()
        
        decrypted_blocks.append({
            "block_index": block_idx,
            "decrypted_hex": plaintext_bytes.hex(),
            "decrypted_text": decrypted_text
        })
        
        # Update the block in our blocks list
        blocks[block_idx].decrypted = True
        blocks[block_idx].decrypted_data = decrypted_text
        
        steps.append(SimulationStep(
            step=f"Block {block_idx} Decrypted",
            description=f"Successfully decrypted block {block_idx}:\nHex: {plaintext_bytes.hex()}\nText: {decrypted_text}"
        ))
    
    # Combine all decrypted blocks to form the complete message (if all blocks were decrypted)
    if len(decrypted_blocks) == block_count:
        try:
            # Decrypt using key to confirm the attack worked correctly
            actual_plaintext = decrypt_message(ciphertext, key, iv)
            recovered_plaintext = "".join([b["decrypted_text"] for b in decrypted_blocks])
            
            steps.append(SimulationStep(
                step="Attack Completed",
                description=(
                    f"Actual plaintext: {actual_plaintext}\n"
                    f"Recovered plaintext: {recovered_plaintext}\n"
                    f"Attack successful: {actual_plaintext == recovered_plaintext}"
                )
            ))
        except Exception as e:
            steps.append(SimulationStep(
                step="Error Verifying Results",
                description=f"Error when verifying attack results: {str(e)}"
            ))
    
    # Create the response
    return CBCPaddingOracleResponse(
        original_message=message,
        encrypted_message=base64.b64encode(ciphertext).decode('ascii'),
        iv=base64.b64encode(iv).decode('ascii'),
        blocks=blocks,
        decrypted_blocks=decrypted_blocks,
        simulation_steps=steps,
        success=len(decrypted_blocks) > 0
    )

def execute(**kwargs) -> Dict[str, Any]:
    """
    Execute the CBC Padding Oracle attack simulation with the given parameters.
    This is the entry point function called by the simulation runner.
    """
    return run_simulation(**kwargs).dict()