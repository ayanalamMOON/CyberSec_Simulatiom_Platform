// Main JavaScript file for CyberSec Simulation Platform GitHub Pages

// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', () => {
  const navTrigger = document.querySelector('.nav-trigger');
  const trigger = document.querySelector('.trigger');
  
  if (navTrigger && trigger) {
    navTrigger.addEventListener('change', () => {
      if (navTrigger.checked) {
        trigger.style.display = 'flex';
      } else {
        trigger.style.display = '';
      }
    });
  }

  // Code snippet copy functionality
  const codeBlocks = document.querySelectorAll('pre');
  
  codeBlocks.forEach(block => {
    // Create copy button
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    copyButton.textContent = 'Copy';
    
    // Position the button
    block.style.position = 'relative';
    copyButton.style.position = 'absolute';
    copyButton.style.top = '0.5rem';
    copyButton.style.right = '0.5rem';
    copyButton.style.padding = '0.25rem 0.5rem';
    copyButton.style.fontSize = '0.75rem';
    copyButton.style.background = 'rgba(0, 0, 0, 0.1)';
    copyButton.style.border = 'none';
    copyButton.style.borderRadius = '3px';
    copyButton.style.cursor = 'pointer';
    
    // Add copy functionality
    copyButton.addEventListener('click', () => {
      const code = block.textContent;
      navigator.clipboard.writeText(code).then(() => {
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
          copyButton.textContent = 'Copy';
        }, 2000);
      });
    });
    
    block.appendChild(copyButton);
  });
  
  // Add smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // Update URL hash without scrolling
        history.pushState(null, null, targetId);
      }
    });
  });
});

// Dark mode toggle (if added later)
function setupDarkModeToggle() {
  const toggle = document.getElementById('dark-mode-toggle');
  if (!toggle) return;
  
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  const currentTheme = localStorage.getItem('theme');
  
  if (currentTheme === 'dark' || (!currentTheme && prefersDarkScheme.matches)) {
    document.body.classList.add('dark-mode');
    toggle.checked = true;
  }
  
  toggle.addEventListener('change', () => {
    if (toggle.checked) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  });
}

// Initialize event listeners when window loads
window.addEventListener('load', () => {
  // Setup future dark mode toggle
  setupDarkModeToggle();
});