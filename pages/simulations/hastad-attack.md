---
layout: simulation
title: Håstad's Broadcast Attack Simulation
description: Learn how the Chinese Remainder Theorem can be exploited to break RSA encryption when the same message is sent to multiple recipients using low exponents.
difficulty: Advanced
prerequisites:
  - Basic understanding of RSA encryption
  - Familiarity with modular arithmetic
  - Knowledge of the Chinese Remainder Theorem
demo_url: /CyberSec_Simulation_Platform/demo/hastad-attack
---

# Håstad's Broadcast Attack

<div class="simulation-image">
  <img src="{{ '/assets/images/Screenshot 2025-04-17 004051.png' | relative_url }}" alt="Håstad's Attack Simulation Interface" class="full-width-image">
  <p class="image-caption">The interactive simulation interface for Håstad's Broadcast Attack</p>
</div>

## Overview

Håstad's Broadcast Attack is a powerful cryptographic attack against the RSA encryption system when:

1. The same message is encrypted and sent to multiple recipients
2. A low public exponent (typically e = 3) is used
3. No random padding is applied to the message before encryption

This simulation visually demonstrates how an attacker can recover the original message without any private keys by using the Chinese Remainder Theorem.

## The Mathematics Behind the Attack

When a message `m` is encrypted using RSA with a public exponent `e` and modulus `n`, the ciphertext `c` is computed as:

```
c = m^e mod n
```

In Håstad's attack scenario:

1. The same message `m` is encrypted using different public keys (n₁, e), (n₂, e), ..., (nₖ, e)
2. This produces ciphertexts c₁, c₂, ..., cₖ
3. If k ≥ e and all moduli are relatively prime, the attacker can use the Chinese Remainder Theorem to find m^e
4. Since e is small (typically 3), the attacker can simply compute the eth root of m^e to recover the original message

## Interactive Simulation Components

<div class="simulation-screenshot">
  <img src="{{ '/assets/images/Screenshot 2025-04-17 004114.png' | relative_url }}" alt="Simulation Step-by-Step Process" class="medium-image">
</div>

Our interactive simulation guides you through:

1. **Key Generation**: Watch how multiple RSA key pairs are generated
2. **Message Encryption**: See how the same message is encrypted using different public keys
3. **Chinese Remainder Theorem**: Visualize how the CRT combines congruences to recover m^e
4. **Root Extraction**: See how taking the eth root reveals the original message

## Security Implications

This attack demonstrates why:

- Proper padding schemes like PKCS#1 v1.5 or OAEP are essential when using RSA
- Using larger exponents (e.g., e = 65537) can provide additional security
- Randomization is critical in cryptographic protocols

## Code Implementation

Below is a simplified Python implementation of the attack:

```python
import sympy
import math
from functools import reduce

def chinese_remainder_theorem(remainders, moduli):
    """Solve the Chinese Remainder Theorem for a system of congruences."""
    total = 0
    prod = reduce(lambda a, b: a*b, moduli)
    
    for r_i, m_i in zip(remainders, moduli):
        p = prod // m_i
        total += r_i * sympy.mod_inverse(p, m_i) * p
    
    return total % prod

def hastad_broadcast_attack(ciphertexts, public_keys, e=3):
    """
    Implement Hastad's broadcast attack to recover the message.
    
    Args:
        ciphertexts: List of ciphertext values
        public_keys: List of moduli (public keys)
        e: Public exponent used (default 3)
    
    Returns:
        The original plaintext message
    """
    # Ensure we have enough ciphertexts
    if len(ciphertexts) < e:
        raise ValueError(f"At least {e} ciphertexts are needed for exponent {e}")
    
    # Use Chinese Remainder Theorem to reconstruct m^e
    m_e = chinese_remainder_theorem(ciphertexts, public_keys)
    
    # Take the eth root to recover the original message
    m = round(math.pow(m_e, 1/e))
    return m
```

## Try It Yourself

In the interactive demo, you can:
- Adjust the public exponent value
- See different padding schemes in action
- Visualize how the number of recipients affects the attack's success probability

<div class="cta-box">
  <h3>Ready to explore Håstad's attack?</h3>
  <p>Launch our interactive simulation to see the attack in action and experiment with different parameters.</p>
  <a href="{{ page.demo_url }}" class="button button-primary">Launch Simulation</a>
</div>

## Further Reading

- [Original paper by Johan Håstad](https://link.springer.com/chapter/10.1007/3-540-47721-7_24)
- [PKCS#1 padding specifications](https://tools.ietf.org/html/rfc8017)
- [RSA Security Best Practices](https://crypto.stanford.edu/~dabo/pubs/papers/RSA-survey.pdf)