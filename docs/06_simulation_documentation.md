# Simulation Documentation

## Overview

This document provides detailed information about each simulation available in the Cybersecurity Simulation Platform. For each simulation, you'll find a description, theoretical background, input parameters, expected outputs, and usage tips.

---

## 1. Håstad's Broadcast Attack

**Category:** Cryptographic Attack  
**File:** `backend/simulations/hastad_attack.py`

### Description
Demonstrates how RSA encryption with a small public exponent and repeated plaintexts can be broken using the Chinese Remainder Theorem.

### Theory
If the same message is encrypted with the same small exponent (e.g., e=3) under different moduli, an attacker can recover the plaintext by solving a system of congruences.

### Parameters
- `ciphertexts`: List of ciphertexts (hex strings)
- `moduli`: List of moduli (hex strings)
- `exponent`: Public exponent (integer, e.g., 3)

### Output
- `recovered_message`: The original plaintext message
- `steps`: Step-by-step breakdown of the attack
- `visualization_data`: Data for graph/tree visualization

### Usage Tips
- Use at least as many ciphertexts as the value of the exponent (e.g., 3 for e=3)
- All ciphertexts must be encryptions of the same message

---

## 2. CBC Padding Oracle Attack

**Category:** Cryptographic Attack  
**File:** `backend/simulations/cbc_padding_oracle.py`

### Description
Shows how an attacker can decrypt ciphertexts encrypted with CBC mode by exploiting padding validation errors.

### Theory
If a system reveals whether a decrypted message has valid padding, an attacker can iteratively modify ciphertext blocks to recover the plaintext one byte at a time.

### Parameters
- `ciphertext`: The ciphertext to attack (hex string)
- `oracle_url`: URL of the padding oracle (string)
- `block_size`: Block size in bytes (integer, e.g., 16)

### Output
- `recovered_plaintext`: The decrypted message
- `steps`: List of attack steps and intermediate states
- `visualization_data`: Data for block-by-block visualization

### Usage Tips
- The oracle must return distinguishable responses for valid/invalid padding
- Works best with short ciphertexts for demonstration

---

## 3. Coming Soon: Additional Simulations

- **Bleichenbacher's Attack** (RSA padding oracle)
- **Fermat's Factorization** (integer factorization)
- **Man-in-the-Middle Attack** (network interception)
- **TLS Handshake Visualization** (protocol analysis)
- **SQL Injection** (web security)
- **XSS Attack** (web security)

---

## Simulation Output Structure

All simulation outputs follow this structure:
```json
{
  "result": { ... },
  "steps": [ ... ],
  "visualization_data": { ... }
}
```

- `result`: Main output (e.g., recovered message)
- `steps`: Step-by-step breakdown for educational purposes
- `visualization_data`: Data for frontend visualizations (graphs, trees, timelines)

## Adding New Simulations

For instructions on adding new simulations, see the [Developer Guide](04_developer_guide.md).
