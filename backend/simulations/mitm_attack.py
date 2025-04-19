"""
Implementation of Man-in-the-Middle (MITM) attack simulation.

This module provides the core functionality for simulating how MITM attacks work
across different protocols, demonstrating both passive monitoring and active 
tampering approaches.
"""
import base64
import hashlib
import logging
import random
import secrets
import string
import time
from typing import Dict, List, Optional, Tuple, Any

from app.models.simulation import (
    MITMAttackResponse, MITMMessage, MITMParticipant, SimulationStep
)

logger = logging.getLogger(__name__)

# Sample messages for the simulation if none provided
DEFAULT_MESSAGES = [
    "Hi Bob, can you send me the login credentials?",
    "Sure Alice, the username is 'admin'",
    "Thanks, what's the password?",
    "The password is 'SuperSecretP@ss123!'",
    "Great, I'll log in now!",
    "Let me know if you have any issues accessing the system.",
    "Everything worked perfectly. I'm in!",
    "Excellent! Don't forget to log out when you're done.",
    "I'll transfer the funds as we discussed earlier."
]

# Protocol-specific details
PROTOCOLS = {
    "HTTP": {
        "port": 80,
        "uses_encryption": False,
        "uses_certificates": False,
        "vulnerable": True,
        "mitigation": "Use HTTPS instead of HTTP"
    },
    "HTTPS": {
        "port": 443,
        "uses_encryption": True,
        "uses_certificates": True,
        "vulnerable": False,
        "mitigation": "Ensure certificate validation is properly implemented"
    },
    "TLS": {
        "port": 443,
        "uses_encryption": True,
        "uses_certificates": True,
        "vulnerable": False,
        "mitigation": "Use certificate pinning and latest TLS version"
    },
    "SSH": {
        "port": 22,
        "uses_encryption": True,
        "uses_certificates": True,
        "vulnerable": False,
        "mitigation": "Verify host keys on first connection and use key-based authentication"
    },
    "Telnet": {
        "port": 23,
        "uses_encryption": False,
        "uses_certificates": False,
        "vulnerable": True,
        "mitigation": "Use SSH instead of Telnet"
    },
    "FTP": {
        "port": 21,
        "uses_encryption": False,
        "uses_certificates": False,
        "vulnerable": True,
        "mitigation": "Use SFTP or FTPS instead of plain FTP"
    }
}

def generate_key(length: int) -> str:
    """Generate a random cryptographic key of specified length in bits."""
    key_bytes = secrets.token_bytes(length // 8)
    return base64.b64encode(key_bytes).decode('ascii')

def generate_certificate(name: str, is_valid: bool = True) -> str:
    """Generate a simplified certificate for demonstration purposes."""
    timestamp = int(time.time())
    expiry = timestamp + 31536000  # Valid for 1 year
    signature = hashlib.sha256(f"{name}-{timestamp}-{'VALID' if is_valid else 'INVALID'}".encode()).hexdigest()
    
    cert = (
        f"-----BEGIN CERTIFICATE-----\n"
        f"Subject: {name}\n"
        f"Issuer: Cyber Security Sim CA\n"
        f"Valid from: {timestamp}\n"
        f"Valid until: {expiry}\n"
        f"Signature: {signature}\n"
        f"-----END CERTIFICATE-----"
    )
    return cert

def is_certificate_valid(cert: str) -> bool:
    """Check if a certificate is valid (simplified for demonstration)."""
    if not cert or "INVALID" in cert:
        return False
    return True

def encrypt_message(message: str, key: str, strength: int = 128) -> str:
    """Encrypt a message (simplified for demonstration)."""
    # This is a simplified simulation of encryption, not actual encryption
    key_hash = hashlib.sha256(key.encode()).hexdigest()[:strength//4]  # Each hex char is 4 bits
    
    # Simple XOR encryption with key hash (for demonstration only)
    encrypted_bytes = bytearray()
    for i, char in enumerate(message):
        key_char = key_hash[i % len(key_hash)]
        # XOR the character with a byte from the key hash
        encrypted_byte = ord(char) ^ ord(key_char)
        encrypted_bytes.append(encrypted_byte)
    
    return base64.b64encode(encrypted_bytes).decode('ascii')

def decrypt_message(encrypted: str, key: str, strength: int = 128) -> str:
    """Decrypt a message (simplified for demonstration)."""
    try:
        # This is a simplified simulation of decryption, matching our encryption
        key_hash = hashlib.sha256(key.encode()).hexdigest()[:strength//4]
        
        encrypted_bytes = base64.b64decode(encrypted.encode('ascii'))
        decrypted = []
        for i, byte in enumerate(encrypted_bytes):
            key_char = key_hash[i % len(key_hash)]
            # XOR the byte with a byte from the key hash (reverses the encryption)
            decrypted_char = chr(byte ^ ord(key_char))
            decrypted.append(decrypted_char)
        
        return ''.join(decrypted)
    except Exception as e:
        logger.error(f"Decryption failed: {str(e)}")
        return "<<Decryption Failed>>"

def run_simulation(
    protocol: str = "TLS",
    intercept_mode: str = "passive",
    encryption_strength: int = 128,
    message_count: int = 5,
    custom_messages: Optional[List[str]] = None,
    enable_certificates: bool = True
) -> MITMAttackResponse:
    """
    Run a simulation of a Man-in-the-Middle attack.
    
    Args:
        protocol: The communication protocol to simulate
        intercept_mode: "passive" for monitoring or "active" for tampering
        encryption_strength: Strength of encryption in bits
        message_count: Number of messages to simulate
        custom_messages: Optional list of specific messages to use
        enable_certificates: Whether to use certificate validation
        
    Returns:
        The results of the simulation
    """
    logger.info(
        f"Starting MITM simulation with protocol={protocol}, mode={intercept_mode}"
    )
    
    # Normalize protocol name and check if it exists
    protocol = protocol.upper()
    if protocol not in PROTOCOLS:
        protocol = "TLS"  # Default if not found
    
    # Get protocol details
    protocol_details = PROTOCOLS[protocol]
    uses_encryption = protocol_details["uses_encryption"]
    uses_certificates = protocol_details["uses_certificates"] and enable_certificates
    vulnerable = protocol_details["vulnerable"]
    mitigation = protocol_details["mitigation"]
    
    # Track simulation steps
    steps: List[SimulationStep] = []
    steps.append(SimulationStep(
        step="Simulation Setup",
        description=f"Setting up {protocol} communication with {intercept_mode} interception"
    ))
    
    # Set up participants
    alice = MITMParticipant(id="alice", name="Alice (Sender)")
    bob = MITMParticipant(id="bob", name="Bob (Receiver)")
    eve = MITMParticipant(id="eve", name="Eve (MITM Attacker)")
    
    # Generate keys for encrypted protocols
    if uses_encryption:
        alice_key = generate_key(encryption_strength)
        bob_key = generate_key(encryption_strength)
        eve_key = generate_key(encryption_strength)  # Eve's key for when she pretends to be Alice or Bob
        
        alice.key = alice_key
        bob.key = bob_key
        eve.key = eve_key
        
        steps.append(SimulationStep(
            step="Key Generation",
            description=f"Generated {encryption_strength}-bit keys for secure communication"
        ))
    
    # Generate certificates if the protocol uses them
    if uses_certificates:
        alice_cert = generate_certificate("Alice")
        bob_cert = generate_certificate("Bob")
        # For the MITM, Eve might have an invalid or spoofed certificate
        eve_cert = generate_certificate("Alice", is_valid=intercept_mode != "active")
        
        alice.certificate = alice_cert
        bob.certificate = bob_cert
        eve.certificate = eve_cert
        
        steps.append(SimulationStep(
            step="Certificate Creation",
            description=f"Created digital certificates for identity verification"
        ))
    
    # Determine attack type based on protocol and interception mode
    if not uses_encryption:
        attack_type = "Plaintext Interception"
        if intercept_mode == "active":
            attack_type = "Plaintext Modification"
    else:
        if not uses_certificates:
            attack_type = "Key Exchange Interception"
        else:
            if intercept_mode == "passive":
                attack_type = "Certificate Monitoring"
            else:
                attack_type = "Certificate Spoofing"
    
    steps.append(SimulationStep(
        step="Attack Preparation",
        description=f"MITM attack type: {attack_type}"
    ))
    
    # Establish connection
    steps.append(SimulationStep(
        step="Connection Establishment",
        description=f"Alice initiates connection to Bob on port {protocol_details['port']}"
    ))
    
    # Certificate exchange and validation if applicable
    if uses_certificates:
        steps.append(SimulationStep(
            step="Certificate Exchange",
            description="Alice and Bob exchange digital certificates to verify identity"
        ))
        
        # If MITM is active, Eve may try to present a spoofed certificate
        if intercept_mode == "active":
            steps.append(SimulationStep(
                step="Certificate Interception",
                description="Eve intercepts the certificate exchange and presents her own certificate to Alice"
            ))
            
            # In a real scenario, if certificate validation is properly implemented,
            # Alice might detect the invalid certificate
            if not is_certificate_valid(eve_cert):
                steps.append(SimulationStep(
                    step="Certificate Validation",
                    description="Alice detects invalid certificate! Connection refused."
                ))
                
                # In this case, the attack would normally fail, but for simulation purposes
                # we'll continue with the warning
                steps.append(SimulationStep(
                    step="Warning Bypassed",
                    description="For simulation purposes, Alice ignores the certificate warning"
                ))
    
    # Key exchange simulation (simplified)
    if uses_encryption:
        if intercept_mode == "passive":
            # In passive mode, Eve can only observe the encrypted communications
            steps.append(SimulationStep(
                step="Secure Key Exchange",
                description="Alice and Bob perform a key exchange to establish a secure channel"
            ))
        else:  # active interception
            # In active mode, Eve establishes separate connections with both Alice and Bob
            steps.append(SimulationStep(
                step="Intercepted Key Exchange",
                description="Eve intercepts the key exchange, establishing separate encrypted channels with both Alice and Bob"
            ))
            
            steps.append(SimulationStep(
                step="Connection Status",
                description=(
                    f"Alice ⟷ (encrypted with Alice-Eve key) ⟷ Eve ⟷ "
                    f"(encrypted with Eve-Bob key) ⟷ Bob"
                )
            ))
    
    # Prepare messages for the simulation
    messages = []
    if custom_messages and len(custom_messages) > 0:
        sim_messages = custom_messages[:message_count]
    else:
        # Use default messages, ensuring we don't exceed available count
        max_count = min(message_count, len(DEFAULT_MESSAGES))
        sim_messages = DEFAULT_MESSAGES[:max_count]
    
    # Simulate the message exchange
    steps.append(SimulationStep(
        step="Communication Start",
        description="Alice and Bob begin exchanging messages"
    ))
    
    for i, msg_content in enumerate(sim_messages):
        # Determine if Alice or Bob is sending this message (alternate)
        is_alice_sending = i % 2 == 0
        sender_id = "alice" if is_alice_sending else "bob"
        receiver_id = "bob" if is_alice_sending else "alice"
        sender_name = "Alice" if is_alice_sending else "Bob"
        receiver_name = "Bob" if is_alice_sending else "Alice"
        
        # Create the message
        original_content = msg_content
        encrypted = uses_encryption
        
        if encrypted:
            if intercept_mode == "passive":
                # With passive interception and encryption, Eve can see the encrypted message
                # but not the content
                encrypted_content = encrypt_message(msg_content, alice_key if is_alice_sending else bob_key, encryption_strength)
                
                steps.append(SimulationStep(
                    step=f"Message {i+1} Sent",
                    description=f"{sender_name} sends to {receiver_name}: {msg_content}\nEncrypted: {encrypted_content}"
                ))
                
                # Eve sees the encrypted message
                steps.append(SimulationStep(
                    step=f"Message {i+1} Intercepted",
                    description=f"Eve intercepts encrypted message: {encrypted_content}\nEve cannot read the content."
                ))
                
                # Message is delivered as-is
                msg = MITMMessage(
                    sender_id=sender_id,
                    receiver_id=receiver_id,
                    content=msg_content,
                    encrypted=True,
                    intercepted=True,
                    modified=False
                )
                messages.append(msg)
                
            else:  # active interception
                # With active interception, Eve can potentially see and modify the content
                # by decrypting and re-encrypting with different keys
                
                # Eve receives the message encrypted with one key
                sender_to_eve_key = alice_key if is_alice_sending else bob_key
                encrypted_for_eve = encrypt_message(msg_content, sender_to_eve_key, encryption_strength)
                
                steps.append(SimulationStep(
                    step=f"Message {i+1} Sent",
                    description=f"{sender_name} sends to Eve (thinking it's {receiver_name}): {msg_content}\nEncrypted: {encrypted_for_eve}"
                ))
                
                # Eve decrypts the message
                decrypted_by_eve = decrypt_message(encrypted_for_eve, sender_to_eve_key, encryption_strength)
                
                steps.append(SimulationStep(
                    step=f"Message {i+1} Decrypted by Eve",
                    description=f"Eve decrypts: {decrypted_by_eve}"
                ))
                
                # Eve might modify the message (let's modify every other message for demonstration)
                modified = i % 3 == 0  # Modify every 3rd message
                if modified:
                    # Add Eve's tampering to the message
                    modified_content = decrypted_by_eve + " [MODIFIED BY EVE!]"
                    steps.append(SimulationStep(
                        step=f"Message {i+1} Modified",
                        description=f"Eve modifies the message to: {modified_content}"
                    ))
                else:
                    modified_content = decrypted_by_eve
                
                # Eve re-encrypts the possibly modified message with the key for the receiver
                eve_to_receiver_key = bob_key if is_alice_sending else alice_key
                encrypted_for_receiver = encrypt_message(modified_content, eve_to_receiver_key, encryption_strength)
                
                steps.append(SimulationStep(
                    step=f"Message {i+1} Re-encrypted",
                    description=f"Eve sends to {receiver_name}: {modified_content}\nRe-encrypted: {encrypted_for_receiver}"
                ))
                
                # Message is delivered potentially modified
                msg = MITMMessage(
                    sender_id=sender_id,
                    receiver_id=receiver_id,
                    content=modified_content,
                    encrypted=True,
                    intercepted=True,
                    modified=modified,
                    original_content=msg_content if modified else None
                )
                messages.append(msg)
                
        else:  # unencrypted communication
            # For unencrypted protocols, Eve can always see the content
            steps.append(SimulationStep(
                step=f"Message {i+1} Sent",
                description=f"{sender_name} sends to {receiver_name}: {msg_content}"
            ))
            
            steps.append(SimulationStep(
                step=f"Message {i+1} Intercepted",
                description=f"Eve intercepts message: {msg_content}"
            ))
            
            # In active mode, Eve might modify the message
            if intercept_mode == "active" and i % 2 == 0:  # Modify every 2nd message
                modified_content = msg_content + " [MODIFIED BY EVE!]"
                steps.append(SimulationStep(
                    step=f"Message {i+1} Modified",
                    description=f"Eve modifies the message to: {modified_content}"
                ))
                
                # Message is delivered modified
                msg = MITMMessage(
                    sender_id=sender_id,
                    receiver_id=receiver_id,
                    content=modified_content,
                    encrypted=False,
                    intercepted=True,
                    modified=True,
                    original_content=msg_content
                )
                messages.append(msg)
            else:
                # Message is delivered as-is
                msg = MITMMessage(
                    sender_id=sender_id,
                    receiver_id=receiver_id,
                    content=msg_content,
                    encrypted=False,
                    intercepted=True,
                    modified=False
                )
                messages.append(msg)
    
    # Summarize the attack results
    steps.append(SimulationStep(
        step="Attack Summary",
        description=(
            f"Protocol: {protocol}\n"
            f"Attack type: {attack_type}\n"
            f"Messages intercepted: {len(messages)}\n"
            f"Messages modified: {sum(1 for m in messages if m.modified)}\n"
            f"Vulnerable to MITM: {'Yes' if vulnerable else 'No with proper implementation'}\n"
            f"Mitigation: {mitigation}"
        )
    ))
    
    # Determine success (for demo purposes, if any message was intercepted/modified)
    success = any(m.intercepted for m in messages)
    if intercept_mode == "active":
        success = success and any(m.modified for m in messages)
    
    # Create and return response
    return MITMAttackResponse(
        participants=[alice, bob, eve],
        messages=messages,
        simulation_steps=steps,
        success=success,
        attack_type=attack_type,
        protocol=protocol,
        vulnerable=vulnerable,
        mitigation=mitigation
    )

def execute(**kwargs) -> Dict[str, Any]:
    """
    Execute the MITM attack simulation with the given parameters.
    This is the entry point function called by the simulation runner.
    """
    return run_simulation(**kwargs).dict()