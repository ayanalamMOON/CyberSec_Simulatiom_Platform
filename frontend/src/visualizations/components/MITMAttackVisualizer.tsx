import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { MITMAttackResponse } from '../../api/simulationApi';

interface MITMAttackVisualizerProps {
  data: MITMAttackResponse;
  width?: number;
  height?: number;
  className?: string;
}

interface VisualizationState {
  currentStep: number;
  playing: boolean;
  showLabels: boolean;
  animationSpeed: number;
}

const MITMAttackVisualizer: React.FC<MITMAttackVisualizerProps> = ({
  data,
  width = 800,
  height = 600,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [state, setState] = useState<VisualizationState>({
    currentStep: 0,
    playing: false,
    showLabels: true,
    animationSpeed: 1500
  });
  
  // Timer for auto-play
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Extract participants and messages for easier access
  const { messages, simulation_steps: steps } = data;
  
  // Define renderVisualization function before it's used in the useEffect dependency array
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const renderVisualization = () => {
    if (!svgRef.current) return;
    
    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();
    
    const svg = d3.select(svgRef.current);
    const margin = { top: 40, right: 30, bottom: 40, left: 30 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Create a group for the main visualization area
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    // Define participant positions
    const aliceX = 100;
    const aliceY = 150;
    const bobX = innerWidth - 100;
    const bobY = 150;
    const eveX = innerWidth / 2;
    const eveY = 300;
    
    // Draw participants
    drawParticipant(g, aliceX, aliceY, 'Alice', '#4299e1', true); // Sender - Blue
    drawParticipant(g, bobX, bobY, 'Bob', '#48bb78', true); // Receiver - Green
    drawParticipant(g, eveX, eveY, 'Eve', '#ed64a6', false); // MITM - Pink
    
    // Draw protocol and attack type information
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .style('font-size', '18px')
      .style('font-weight', 'bold')
      .text(`${data.protocol} - ${data.attack_type}`);
    
    // Draw vulnerability information
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 60)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', data.vulnerable ? '#e53e3e' : '#48bb78')
      .style('font-weight', 'bold')
      .text(`Vulnerable: ${data.vulnerable ? 'Yes' : 'No with proper implementation'}`);
    
    // Get current simulation step
    const currentStep = steps[state.currentStep];
    
    // Display simulation step information
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight - 40)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(currentStep.step);
    
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight - 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', '#4a5568')
      .text(currentStep.description.split('\n')[0]);
    
    // Draw additional description lines if any
    const descLines = currentStep.description.split('\n');
    if (descLines.length > 1) {
      for (let i = 1; i < Math.min(descLines.length, 3); i++) {
        g.append('text')
          .attr('x', innerWidth / 2)
          .attr('y', innerHeight - 15 + (i * 20))
          .attr('text-anchor', 'middle')
          .style('font-size', '14px')
          .style('fill', '#4a5568')
          .text(descLines[i]);
      }
    }
    
    // Visualize connections based on current step
    visualizeConnections(g, state.currentStep, svg, {
      aliceX, aliceY, bobX, bobY, eveX, eveY
    });
  };
  
  // Auto-advance steps when playing
  useEffect(() => {
    if (state.playing) {
      timerRef.current = setTimeout(() => {
        const nextStep = state.currentStep + 1;
        if (nextStep < steps.length) {
          setState(prev => ({ ...prev, currentStep: nextStep }));
        } else {
          // Stop playing when we reach the end
          setState(prev => ({ ...prev, playing: false }));
        }
      }, state.animationSpeed);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [state.playing, state.currentStep, state.animationSpeed, steps.length]);

  // Render visualization whenever the step changes
  useEffect(() => {
    if (!svgRef.current) return;
    
    renderVisualization();
  }, [state.currentStep, state.showLabels, renderVisualization]);
  
  const togglePlay = () => {
    setState(prev => ({ ...prev, playing: !prev.playing }));
  };
  
  const toggleLabels = () => {
    setState(prev => ({ ...prev, showLabels: !prev.showLabels }));
  };
  
  const changeSpeed = (speedMultiplier: number) => {
    setState(prev => ({ ...prev, animationSpeed: 1500 / speedMultiplier }));
  };
  
  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setState(prev => ({ ...prev, currentStep: stepIndex }));
    }
  };
  
  const drawParticipant = (
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    x: number,
    y: number,
    name: string,
    color: string,
    isLegitimate: boolean
  ) => {
    // Draw participant circle
    g.append('circle')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', 40)
      .attr('fill', color)
      .attr('opacity', 0.2)
      .attr('stroke', color)
      .attr('stroke-width', 2);
    
    // Draw participant icon (person)
    g.append('circle')
      .attr('cx', x)
      .attr('cy', y - 15)
      .attr('r', 12)
      .attr('fill', color);
    
    g.append('path')
      .attr('d', `M${x-15},${y+15} Q${x},${y+35} ${x+15},${y+15}`)
      .attr('stroke', color)
      .attr('stroke-width', 3)
      .attr('fill', 'none');
    
    // For Eve (attacker), add a hacker icon element
    if (!isLegitimate) {
      g.append('path')
        .attr('d', `M${x-20},${y-25} L${x+20},${y-25}`)
        .attr('stroke', color)
        .attr('stroke-width', 2);
      
      g.append('circle')
        .attr('cx', x)
        .attr('cy', y - 32)
        .attr('r', 7)
        .attr('fill', color);
    }
    
    // Draw participant name
    g.append('text')
      .attr('x', x)
      .attr('y', y + 55)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(name);
  };
  
  const visualizeConnections = (
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    stepIndex: number,
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    coords: {
      aliceX: number,
      aliceY: number,
      bobX: number,
      bobY: number,
      eveX: number,
      eveY: number
    }
  ) => {
    const { aliceX, aliceY, bobX, bobY, eveX, eveY } = coords;
    const stepName = steps[stepIndex].step.toLowerCase();
    
    // Determine what to display based on the current step
    if (stepName.includes('setup') || stepName.includes('preparation')) {
      // Initial setup - no connections yet
      return;
    }
    
    // Connection establishment phase
    if (stepName.includes('connection')) {
      drawConnection(g, aliceX, aliceY, bobX, bobY, '#4299e1', '', svg); 
      return;
    }
    
    // Certificate exchange phase
    if (stepName.includes('certificate')) {
      if (stepName.includes('interception')) {
        // Eve is intercepting certificates
        drawConnection(g, aliceX, aliceY, eveX, eveY, '#4299e1', 'Certificate', svg);
        drawConnection(g, eveX, eveY, bobX, bobY, '#ed64a6', 'Fake Certificate', svg);
      } else {
        // Normal certificate exchange
        drawConnection(g, aliceX, aliceY, bobX, bobY, '#4299e1', 'Certificate', svg);
      }
      return;
    }
    
    // Key exchange phase
    if (stepName.includes('key exchange')) {
      if (stepName.includes('intercepted')) {
        // Eve is intercepting key exchange
        drawConnection(g, aliceX, aliceY, eveX, eveY, '#4299e1', 'Key', svg);
        drawConnection(g, eveX, eveY, bobX, bobY, '#ed64a6', 'Key', svg);
      } else {
        // Normal key exchange
        drawConnection(g, aliceX, aliceY, bobX, bobY, '#4299e1', 'Key', svg);
      }
      return;
    }
    
    // Message sending phase
    if (stepName.includes('message')) {
      const messageNumber = parseInt(stepName.match(/message\s+(\d+)/i)?.[1] || '0');
      
      // Get corresponding message if available
      const relevantMessage = messages.find((_, i) => i === messageNumber - 1);
      if (!relevantMessage) return;
      
      const isAliceSending = relevantMessage.sender_id === 'alice';
      const senderX = isAliceSending ? aliceX : bobX;
      const senderY = isAliceSending ? aliceY : bobY;
      const receiverX = isAliceSending ? bobX : aliceX;
      const receiverY = isAliceSending ? bobY : aliceY;
      const senderColor = isAliceSending ? '#4299e1' : '#48bb78';
      
      // Check if this message is intercepted
      if (relevantMessage.intercepted) {
        const messageContent = relevantMessage.encrypted ? 
          '🔒 Encrypted' : 
          relevantMessage.content.length > 15 ? 
            relevantMessage.content.substring(0, 15) + '...' : 
            relevantMessage.content;
        
        // Draw first part of interception (sender to Eve)
        drawConnection(g, senderX, senderY, eveX, eveY, senderColor, messageContent, svg);
        
        // For intercepted & modified messages or decryption steps
        if (stepName.includes('decrypted') || stepName.includes('modified')) {
          // Add a text bubble for Eve showing what she sees
          const decryptedText = relevantMessage.original_content || relevantMessage.content;
          const displayText = decryptedText.length > 15 ? decryptedText.substring(0, 15) + '...' : decryptedText;
          
          drawTextBubble(g, eveX, eveY - 60, displayText, '#ed64a6');
        }
        
        // For re-encrypted or forwarded messages
        if (stepName.includes('re-encrypted') || (stepName.includes('intercepted') && !stepName.includes('decrypted'))) {
          // Draw the second part (Eve to receiver)
          const finalContent = relevantMessage.modified ? '🔄 Modified' : messageContent;
          drawConnection(g, eveX, eveY, receiverX, receiverY, '#ed64a6', finalContent, svg);
        }
      } else {
        // Direct communication (no interception)
        const messageContent = relevantMessage.encrypted ? 
          '🔒 Encrypted' : 
          relevantMessage.content.length > 15 ? 
            relevantMessage.content.substring(0, 15) + '...' : 
            relevantMessage.content;
        
        drawConnection(g, senderX, senderY, receiverX, receiverY, senderColor, messageContent, svg);
      }
      return;
    }
    
    // Default: show current connection state based on protocol
    if (data.protocol === 'HTTP' || data.protocol === 'FTP' || data.protocol === 'Telnet') {
      // Insecure protocols - show Eve can see everything
      drawConnection(g, aliceX, aliceY, eveX, eveY, '#4299e1', '', svg);
      drawConnection(g, eveX, eveY, bobX, bobY, '#ed64a6', '', svg);
    } else {
      // Secure protocols - depends on if active MITM is successful
      if (data.attack_type.includes("Spoofing") || data.attack_type.includes("Interception")) {
        drawConnection(g, aliceX, aliceY, eveX, eveY, '#4299e1', '🔒', svg);
        drawConnection(g, eveX, eveY, bobX, bobY, '#ed64a6', '🔒', svg);
      } else {
        drawConnection(g, aliceX, aliceY, bobX, bobY, '#4299e1', '🔒 Secure', svg);
      }
    }
  };
  
  const drawConnection = (
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    label: string,
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  ) => {
    // Draw line with arrow
    const arrowId = `arrow-${Math.random().toString(36).substring(2, 9)}`;
    
    // Define arrow marker
    svg.append('defs')
      .append('marker')
      .attr('id', arrowId)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', color);
    
    // Draw line with arrow marker
    g.append('line')
      .attr('x1', x1)
      .attr('y1', y1)
      .attr('x2', x2)
      .attr('y2', y2)
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,3')
      .attr('marker-end', `url(#${arrowId})`);
    
    // Add label if provided
    if (label) {
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      
      // Add a white background for better readability
      g.append('rect')
        .attr('x', midX - 50)
        .attr('y', midY - 15)
        .attr('width', 100)
        .attr('height', 22)
        .attr('fill', 'white')
        .attr('rx', 5)
        .attr('opacity', 0.8);
      
      g.append('text')
        .attr('x', midX)
        .attr('y', midY)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .style('font-size', '12px')
        .style('font-weight', label.includes('Modified') ? 'bold' : 'normal')
        .style('fill', label.includes('Modified') ? '#e53e3e' : '#2d3748')
        .text(label);
    }
  };
  
  const drawTextBubble = (
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    x: number,
    y: number,
    text: string,
    color: string
  ) => {
    const bubbleWidth = Math.max(text.length * 8, 80);
    const bubbleHeight = 30;
    
    // Draw bubble
    g.append('rect')
      .attr('x', x - bubbleWidth / 2)
      .attr('y', y - bubbleHeight / 2)
      .attr('width', bubbleWidth)
      .attr('height', bubbleHeight)
      .attr('rx', 10)
      .attr('fill', 'white')
      .attr('stroke', color)
      .attr('stroke-width', 2);
    
    // Draw pointer
    g.append('path')
      .attr('d', `M${x},${y + bubbleHeight / 2} L${x - 10},${y + bubbleHeight / 2 + 10} L${x + 10},${y + bubbleHeight / 2 + 10} Z`)
      .attr('fill', 'white')
      .attr('stroke', color)
      .attr('stroke-width', 2);
    
    // Draw text
    g.append('text')
      .attr('x', x)
      .attr('y', y)
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .style('font-size', '12px')
      .style('fill', '#2d3748')
      .text(text);
  };
  
  return (
    <div className={`mitm-attack-visualizer ${className}`}>
      <div className="flex mb-4 justify-between items-center">
        <div>
          <button
            onClick={togglePlay}
            className={`mr-2 px-4 py-2 rounded ${
              state.playing ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            } text-white`}
          >
            {state.playing ? 'Pause' : 'Play'}
          </button>
          
          <button
            onClick={() => goToStep(0)}
            disabled={state.currentStep === 0}
            className="mr-2 px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Reset
          </button>
          
          <button
            onClick={() => goToStep(state.currentStep - 1)}
            disabled={state.currentStep === 0}
            className="mr-2 px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            &lt; Back
          </button>
          
          <button
            onClick={() => goToStep(state.currentStep + 1)}
            disabled={state.currentStep === steps.length - 1}
            className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Next &gt;
          </button>
        </div>
        
        <div>
          <span className="mr-2">Speed:</span>
          <button
            onClick={() => changeSpeed(0.5)}
            className={`mr-1 px-2 py-1 rounded ${
              state.animationSpeed === 3000 ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            0.5x
          </button>
          <button
            onClick={() => changeSpeed(1)}
            className={`mr-1 px-2 py-1 rounded ${
              state.animationSpeed === 1500 ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            1x
          </button>
          <button
            onClick={() => changeSpeed(2)}
            className={`px-2 py-1 rounded ${
              state.animationSpeed === 750 ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            2x
          </button>
        </div>
      </div>
      
      <div className="relative">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="bg-white border border-gray-300 rounded shadow-lg"
        ></svg>
        
        <div className="absolute bottom-2 left-2 bg-white bg-opacity-75 px-2 py-1 rounded text-sm">
          Step {state.currentStep + 1} of {steps.length}
        </div>
      </div>
      
      <div className="mt-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={state.showLabels}
            onChange={toggleLabels}
            className="mr-2"
          />
          <span>Show labels</span>
        </label>
      </div>
      
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h3 className="text-lg font-semibold mb-2">Current Step:</h3>
        <p className="font-medium">{steps[state.currentStep].step}</p>
        <p className="text-gray-700 whitespace-pre-line">{steps[state.currentStep].description}</p>
      </div>
    </div>
  );
};

export default MITMAttackVisualizer;