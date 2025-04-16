import React from 'react';
import { motion } from 'framer-motion';

const AboutPage: React.FC = () => {
  return (
    <div className="py-8">
      <motion.h1 
        className="text-4xl font-bold mb-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        About CyberSecurity Simulation Platform
      </motion.h1>
      
      <motion.div 
        className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto prose prose-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2>Our Mission</h2>
        <p>
          The CyberSecurity Simulation Platform was created to make complex cybersecurity concepts accessible through interactive, visual learning experiences. We believe that understanding the mechanics of cybersecurity attacks and defenses is crucial for developing robust security skills.
        </p>
        
        <h2>Why Visual Simulations?</h2>
        <p>
          Traditional cybersecurity education often relies on abstract concepts and mathematical formulas that can be difficult to grasp. Our platform transforms these concepts into interactive visualizations that demonstrate the step-by-step process of various attacks and defense mechanisms, making them more intuitive and memorable.
        </p>
        
        <h2>Platform Features</h2>
        <ul>
          <li><strong>Interactive Simulations:</strong> Engage with live demonstrations of cybersecurity concepts</li>
          <li><strong>Step-by-Step Guidance:</strong> Learn at your own pace with detailed explanations</li>
          <li><strong>Visual Animations:</strong> See complex cryptographic operations unfold visually</li>
          <li><strong>Practical Examples:</strong> Apply theoretical knowledge to real-world scenarios</li>
          <li><strong>Customizable Parameters:</strong> Experiment with different settings to see how they affect outcomes</li>
        </ul>
        
        <h2>Educational Philosophy</h2>
        <p>
          We follow the "learning by doing" approach, allowing users to experiment with parameters, observe outcomes, and develop an intuitive understanding of cybersecurity principles. Our simulations bridge the gap between theory and practice, helping users develop practical skills they can apply in real-world scenarios.
        </p>
        
        <h2>Technical Implementation</h2>
        <p>
          Our platform is built using modern web technologies:
        </p>
        <ul>
          <li><strong>Frontend:</strong> React.js with TypeScript, TailwindCSS, Framer Motion for animations, and D3.js for visualizations</li>
          <li><strong>Backend:</strong> FastAPI (Python) for efficient simulation processing</li>
          <li><strong>Infrastructure:</strong> Docker containers for consistent deployment and scalability</li>
        </ul>
        
        <h2>Roadmap</h2>
        <p>
          We're constantly expanding our library of simulations. Upcoming additions include:
        </p>
        <ul>
          <li>Advanced Web Security Attack Simulations (XSS, CSRF, SQL Injection)</li>
          <li>Network Protocol Vulnerabilities (TLS, DNS spoofing)</li>
          <li>Applied Cryptography Weaknesses (Side-channel attacks, timing attacks)</li>
          <li>User-contributed simulations through our open API</li>
        </ul>
        
        <h2>Contributing</h2>
        <p>
          We welcome contributions from the cybersecurity community! Whether it's suggesting new simulations, improving existing ones, or helping with code development, please reach out to our team.
        </p>
        
        <div className="mt-12 text-center">
          <p className="font-semibold">
            Start exploring cybersecurity concepts today through our interactive simulations!
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutPage;