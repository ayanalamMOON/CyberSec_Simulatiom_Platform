---
layout: default
title: Simulation Library
---

# Cybersecurity Simulations Library

Our platform provides hands-on interactive simulations for various cybersecurity concepts and attacks. These simulations allow you to visualize and understand complex security vulnerabilities in a safe, educational environment.

## Available Simulations

<div class="simulation-grid">
  <div class="simulation-card">
    <div class="simulation-card-header">
      <h3>Håstad's Broadcast Attack</h3>
      <span class="difficulty advanced">Advanced</span>
    </div>
    <p>Explore how the Chinese Remainder Theorem can be used to attack RSA when the same message is encrypted to multiple recipients using low public exponents.</p>
    <div class="simulation-tags">
      <span class="tag">Cryptography</span>
      <span class="tag">RSA</span>
      <span class="tag">Number Theory</span>
    </div>
    <a href="{{ '/simulations/hastad-attack' | relative_url }}" class="button">Learn More</a>
  </div>
  
  <div class="simulation-card">
    <div class="simulation-card-header">
      <h3>CBC Padding Oracle</h3>
      <span class="difficulty intermediate">Intermediate</span>
    </div>
    <p>Understand how padding oracle vulnerabilities can be exploited in CBC mode encryption to recover plaintext without the encryption key.</p>
    <div class="simulation-tags">
      <span class="tag">Cryptography</span>
      <span class="tag">Block Ciphers</span>
      <span class="tag">Side-Channel Attack</span>
    </div>
    <a href="{{ '/simulations/cbc-padding-oracle' | relative_url }}" class="button">Learn More</a>
  </div>
</div>

## Learning Path

For those new to cryptography and security vulnerabilities, we recommend following this learning path:

1. **Start with** the CBC Padding Oracle simulation to understand basic concepts of block ciphers and oracles
2. **Progress to** the Håstad's Broadcast Attack to explore more advanced mathematical concepts in cryptography

## Contribute a Simulation

Are you interested in contributing a new simulation to our platform? Check out our [Developer Guide]({{ '/developer-guide' | relative_url }}) for information on how to create and submit your own cybersecurity simulations.