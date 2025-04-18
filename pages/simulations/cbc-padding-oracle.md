---
layout: simulation
title: CBC Padding Oracle Attack Simulation
description: Learn how padding oracle vulnerabilities can be exploited in CBC mode encryption to recover plaintext without the encryption key.
difficulty: Intermediate
prerequisites:
  - Understanding of block ciphers
  - Basic knowledge of CBC mode encryption
  - Familiarity with PKCS#7 padding
demo_url: /CyberSec_Simulation_Platform/demo/cbc-padding-oracle
---

# CBC Padding Oracle Attack

<div class="simulation-image">
  <img src="{{ '/assets/images/Screenshot 2025-04-17 004130.png' | relative_url }}" alt="CBC Padding Oracle Simulation" class="full-width-image">
  <p class="image-caption">Interactive visualization of the CBC Padding Oracle attack process</p>
</div>

## Overview

The CBC (Cipher Block Chaining) Padding Oracle Attack is a side-channel attack that exploits information leaked by systems that use CBC mode encryption with padding validation. This simulation demonstrates how an attacker can decrypt ciphertext without knowing the encryption key by manipulating the ciphertext and observing error messages related to padding.

## How CBC Mode Works

In CBC mode encryption:

1. Each plaintext block is XORed with the previous ciphertext block before encryption
2. The first block is XORed with an Initialization Vector (IV)
3. Padding is added to ensure the plaintext fits into complete blocks

<div class="simulation-diagram">
  <img src="{{ '/assets/images/Screenshot 2025-04-17 004618.png' | relative_url }}" alt="CBC Mode Encryption Diagram" class="medium-image">
</div>

The decryption process works in reverse:
1. Each ciphertext block is decrypted with the block cipher
2. The result is XORed with the previous ciphertext block (or IV for the first block)
3. Padding is removed from the final block

## Understanding the Vulnerability

A padding oracle vulnerability occurs when:

1. An application decrypts encrypted data
2. The application reveals whether the padding is valid or not (through error messages, timing differences, etc.)
3. An attacker can modify the ciphertext and observe these differences

## The Attack Methodology

Our simulation walks through the attack step by step:

<div class="simulation-steps">
  <img src="{{ '/assets/images/Screenshot 2025-04-17 004152.png' | relative_url }}" alt="Step-by-step attack visualization" class="medium-image">
</div>

### Step 1: Understand the Target
- Identify the application's behavior with valid/invalid padding
- Determine the block size (typically 16 bytes for AES)
- Isolate the ciphertext blocks you want to decrypt

### Step 2: Decrypt the Last Byte
- For each possible value of the last byte (0-255):
  - Create a crafted block where the last byte will produce valid padding when XORed with the decryption output
  - Send this crafted block to the server
  - If valid padding is reported, you've found the correct value for that position

### Step 3: Decrypt Remaining Bytes
- Once you know byte N, you can craft inputs to discover byte N-1
- Repeat the process, working backward through the block
- For each byte, craft input that will produce valid padding of increasing length

### Step 4: Move to Previous Blocks
- After decrypting a complete block, move to the previous block
- Repeat the process until all blocks are decrypted

## Code Implementation

Here's a simplified Python implementation of the attack:

```python
def padding_oracle_attack(ciphertext, oracle_function, block_size=16):
    """
    Decrypt ciphertext using padding oracle attack.
    
    Args:
        ciphertext: The encrypted message as bytes
        oracle_function: Function that returns True if padding is valid, False otherwise
        block_size: Block size in bytes (default 16 for AES)
    
    Returns:
        The decrypted plaintext
    """
    if len(ciphertext) % block_size != 0:
        raise ValueError("Ciphertext length must be a multiple of block size")
    
    # Split ciphertext into blocks
    blocks = [ciphertext[i:i+block_size] for i in range(0, len(ciphertext), block_size)]
    
    # We can't decrypt the first block without an IV, so start from second block
    decrypted = bytearray()
    
    # For each block (except first which is treated as IV)
    for block_index in range(1, len(blocks)):
        target_block = blocks[block_index]
        previous_block = blocks[block_index-1]
        
        # This will store the intermediate state (what we XOR with previous block)
        intermediate_bytes = bytearray(block_size)
        
        # Work from last byte to first
        for byte_index in range(block_size-1, -1, -1):
            # This will store the padding value we're testing for
            padding_value = block_size - byte_index
            
            # Modify previous bytes to ensure correct padding
            crafted_previous = bytearray(block_size)
            for i in range(byte_index+1, block_size):
                # XOR with the known intermediate byte and the padding value
                crafted_previous[i] = intermediate_bytes[i] ^ padding_value
            
            # Try all 256 possible values for the current byte
            for guess in range(256):
                crafted_previous[byte_index] = guess
                
                # Test if padding is valid with this crafted block
                crafted_ciphertext = bytes(crafted_previous) + target_block
                if oracle_function(crafted_ciphertext):
                    # If padding is valid, we've found the intermediate byte
                    intermediate_bytes[byte_index] = guess ^ padding_value
                    break
        
        # Calculate plaintext by XORing intermediate state with previous block
        block_plaintext = bytearray(block_size)
        for i in range(block_size):
            block_plaintext[i] = intermediate_bytes[i] ^ previous_block[i]
        
        decrypted.extend(block_plaintext)
    
    # Remove padding from the result
    padding_length = decrypted[-1]
    return bytes(decrypted[:-padding_length])
```

## Interactive Simulation Features

In our interactive simulation, you can:

- See the step-by-step decryption process
- Visualize how each byte is recovered through the attack
- Understand the XOR operations involved in the attack
- Experiment with different padding schemes

## Real-World Impact

This attack has been successfully used against:

- HTTPS servers (BEAST attack)
- Various web applications using encrypted cookies
- Secure communication protocols
- VPN solutions using CBC mode

In 2014, the Padding Oracle vulnerability (CVE-2014-3566) known as "POODLE" affected SSLv3 implementations worldwide, forcing widespread updates to more secure protocols.

## Mitigation Strategies

To prevent CBC Padding Oracle attacks:

- Use authenticated encryption (AEAD) like GCM or ChaCha20-Poly1305
- Implement constant-time padding validation
- Do not reveal different error messages for padding failures
- Consider using padding schemes that are less vulnerable to this attack

<div class="cta-box">
  <h3>Ready to try the CBC Padding Oracle attack?</h3>
  <p>Launch our interactive simulation to see how an attacker can decrypt messages without the encryption key.</p>
  <a href="{{ page.demo_url }}" class="button button-primary">Launch Simulation</a>
</div>

## Further Reading

- [Original paper by Serge Vaudenay](https://www.iacr.org/archive/eurocrypt2002/23320530/23320530.pdf)
- [Practical Padding Oracle Attacks](https://www.usenix.org/legacy/event/woot10/tech/full_papers/Rizzo.pdf)
- [OWASP guide on Cryptographic Failures](https://owasp.org/Top10/A02_2021-Cryptographic_Failures/)