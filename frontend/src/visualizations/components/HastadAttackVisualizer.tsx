import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { HastadAttackResponse } from '../../api/simulationApi';
import { useVisualization } from '../VisualizationContext';

interface HastadAttackVisualizerProps {
  data: HastadAttackResponse;
  width?: number;
  height?: number;
  className?: string;
}

const HastadAttackVisualizer: React.FC<HastadAttackVisualizerProps> = ({
  data,
  width = 800,
  height = 600,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { state } = useVisualization();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepDelay, setStepDelay] = useState(1500);
  const animationRef = useRef<number | null>(null);

  // Function to render the visualization
  const renderVisualization = () => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 50, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create container group
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add title
    svg.append("text")
      .attr("class", "title")
      .attr("x", width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text("Håstad's Broadcast Attack Visualization");

    // Define dimensions for recipient boxes
    const boxWidth = 180;
    const boxHeight = 150;
    const boxSpacing = 40;
    const totalWidth = data.recipients.length * (boxWidth + boxSpacing) - boxSpacing;
    const startX = (innerWidth - totalWidth) / 2;

    // Set up for current step visualization
    const currentStepData = data.simulation_steps[currentStep];
    
    // Draw the common message at the top if appropriate for this step
    if (currentStep > 0) {
      const messageBox = g.append("g")
        .attr("class", "message-box")
        .attr("transform", `translate(${innerWidth / 2 - 100}, 10)`);

      messageBox.append("rect")
        .attr("width", 200)
        .attr("height", 60)
        .attr("rx", 10)
        .attr("fill", "#9ae6b4")
        .attr("stroke", "#38a169")
        .attr("stroke-width", 2);

      messageBox.append("text")
        .attr("x", 100)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Original Message");

      messageBox.append("text")
        .attr("x", 100)
        .attr("y", 50)
        .attr("text-anchor", "middle")
        .style("font-family", "monospace")
        .text(data.original_message.length > 15 
          ? data.original_message.substring(0, 15) + "..." 
          : data.original_message);
    }

    // Draw recipient boxes
    data.recipients.forEach((recipient, i) => {
      const x = startX + i * (boxWidth + boxSpacing);
      const y = 120;

      const recipientG = g.append("g")
        .attr("class", `recipient-${i}`)
        .attr("transform", `translate(${x}, ${y})`);

      // Background
      recipientG.append("rect")
        .attr("width", boxWidth)
        .attr("height", boxHeight)
        .attr("rx", 8)
        .attr("fill", "#ebf8ff")
        .attr("stroke", "#4299e1")
        .attr("stroke-width", 1.5);

      // Recipient title
      recipientG.append("text")
        .attr("x", boxWidth / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-weight", "bold")
        .text(`Recipient ${recipient.index}`);

      // Modulus (n)
      recipientG.append("text")
        .attr("x", 10)
        .attr("y", 50)
        .attr("text-anchor", "start")
        .style("font-size", "12px")
        .style("font-family", "monospace")
        .text(`n = ${recipient.n.substring(0, 10)}...`);

      // Private components if showing in context
      recipientG.append("text")
        .attr("x", 10)
        .attr("y", 70)
        .attr("text-anchor", "start")
        .style("font-size", "12px")
        .style("font-family", "monospace")
        .style("opacity", state.showLabels ? "1" : "0.4")
        .text(`p = ${recipient.p.substring(0, 8)}...`);

      recipientG.append("text")
        .attr("x", 10)
        .attr("y", 90)
        .attr("text-anchor", "start")
        .style("font-size", "12px")
        .style("font-family", "monospace")
        .style("opacity", state.showLabels ? "1" : "0.4")
        .text(`q = ${recipient.q.substring(0, 8)}...`);

      // Ciphertext
      if (data.ciphertexts && data.ciphertexts[i] && currentStep >= i + 2) {
        recipientG.append("text")
          .attr("x", 10)
          .attr("y", 120)
          .attr("text-anchor", "start")
          .style("font-size", "12px")
          .style("font-weight", "bold")
          .style("fill", "#805ad5")
          .text("Ciphertext:");

        recipientG.append("text")
          .attr("x", 80)
          .attr("y", 120)
          .attr("text-anchor", "start")
          .style("font-size", "12px")
          .style("font-family", "monospace")
          .style("fill", "#805ad5")
          .text(`${data.ciphertexts[i].substring(0, 10)}...`);
      }

      // Draw arrows from message to recipients if we're at the encryption step
      if (currentStep >= 2 && currentStep < data.recipients.length + 2) {
        // Only draw arrows to recipients we've encrypted for
        if (i < currentStep - 1) {
          const arrowStartX = innerWidth / 2;
          const arrowStartY = 70;
          const arrowEndX = x + boxWidth / 2;
          const arrowEndY = y;
          
          drawArrow(svg, arrowStartX + margin.left, arrowStartY + margin.top, 
                   arrowEndX + margin.left, arrowEndY + margin.top);
        }
      }
    });

    // Visualization for CRT step (one of the final steps)
    if (currentStep >= data.recipients.length + 2) {
      const crtY = 300;
      const crtHeight = 80;
      
      // CRT box
      const crtBox = g.append("g")
        .attr("class", "crt-box")
        .attr("transform", `translate(${innerWidth / 2 - 150}, ${crtY})`);

      crtBox.append("rect")
        .attr("width", 300)
        .attr("height", crtHeight)
        .attr("rx", 8)
        .attr("fill", "#fed7d7")
        .attr("stroke", "#e53e3e")
        .attr("stroke-width", 2);

      crtBox.append("text")
        .attr("x", 150)
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Chinese Remainder Theorem");

      crtBox.append("text")
        .attr("x", 150)
        .attr("y", 50)
        .attr("text-anchor", "middle")
        .style("font-family", "monospace")
        .text("Solving system of congruences...");

      // Draw arrows from all recipients to CRT
      data.recipients.forEach((recipient, i) => {
        const recipientX = startX + i * (boxWidth + boxSpacing) + boxWidth / 2;
        const recipientY = 120 + boxHeight;
        const crtX = innerWidth / 2;
        const crtY = 300;

        drawArrow(svg, recipientX + margin.left, recipientY + margin.top, 
                 crtX + margin.left, crtY + margin.top);
      });
    }

    // Final result
    if (currentStep === data.simulation_steps.length - 1) {
      const resultY = 420;
      const resultBox = g.append("g")
        .attr("class", "result-box")
        .attr("transform", `translate(${innerWidth / 2 - 150}, ${resultY})`);

      resultBox.append("rect")
        .attr("width", 300)
        .attr("height", 80)
        .attr("rx", 8)
        .attr("fill", data.success ? "#c6f6d5" : "#fed7d7")
        .attr("stroke", data.success ? "#38a169" : "#e53e3e")
        .attr("stroke-width", 2);

      resultBox.append("text")
        .attr("x", 150)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Recovered Message");

      resultBox.append("text")
        .attr("x", 150)
        .attr("y", 55)
        .attr("text-anchor", "middle")
        .style("font-family", "monospace")
        .text(data.recovered_message);

      // Draw arrow from CRT to result
      drawArrow(svg, innerWidth / 2 + margin.left, 380 + margin.top, 
               innerWidth / 2 + margin.left, resultY + margin.top);
    }

    // Add step information at the bottom
    if (data.simulation_steps && data.simulation_steps[currentStep]) {
      const stepText = data.simulation_steps[currentStep].step;
      
      // Add step info at the bottom
      const stepInfo = g.append("g")
        .attr("class", "step-info")
        .attr("transform", `translate(${innerWidth / 2}, ${innerHeight - 20})`);
        
      stepInfo.append("text")
        .attr("class", "step-text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text(`Step ${currentStep + 1}/${data.simulation_steps.length}: ${stepText}`);
    }
  };

  // Helper function to draw an arrow
  const drawArrow = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, 
                   x1: number, y1: number, x2: number, y2: number) => {
    // Calculate angle for the arrow
    const angle = Math.atan2(y2 - y1, x2 - x1);
    // Adjust endpoint to account for arrowhead
    const endX = x2 - 10 * Math.cos(angle);
    const endY = y2 - 10 * Math.sin(angle);

    svg.append("line")
      .attr("x1", x1)
      .attr("y1", y1)
      .attr("x2", endX)
      .attr("y2", endY)
      .attr("stroke", "#4a5568")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrow)");

    // Define arrowhead marker if it doesn't exist yet
    const defs = svg.select("defs");
    if (defs.empty()) {
      const newDefs = svg.append("defs");
      newDefs.append("marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 8)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#4a5568");
    }
  };

  // Animation control functions
  const playAnimation = () => {
    setIsPlaying(true);
    let step = currentStep;
    
    const animate = () => {
      if (step >= data.simulation_steps.length - 1) {
        setIsPlaying(false);
        return;
      }
      
      step += 1;
      setCurrentStep(step);
      animationRef.current = window.setTimeout(animate, stepDelay);
    };
    
    animationRef.current = window.setTimeout(animate, stepDelay);
  };

  const stopAnimation = () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
    setIsPlaying(false);
  };

  const goToNextStep = () => {
    setCurrentStep(current => 
      current < data.simulation_steps.length - 1 ? current + 1 : current
    );
  };

  const goToPrevStep = () => {
    setCurrentStep(current => current > 0 ? current - 1 : current);
  };

  // Re-render when data or visualization state changes
  useEffect(() => {
    renderVisualization();
  }, [data, currentStep, state.showLabels, state.colorScheme, width, height]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  return (
    <div className={`hastad-attack-visualizer ${className}`}>
      <svg 
        ref={svgRef} 
        width={width} 
        height={height}
        className="bg-white rounded-lg shadow"
      ></svg>

      {data.simulation_steps && (
        <div className="controls flex flex-col mt-4">
          <div className="step-description bg-gray-100 p-4 rounded mb-4">
            <p className="font-bold">{data.simulation_steps[currentStep]?.step}</p>
            <p>{data.simulation_steps[currentStep]?.description}</p>
          </div>
          <div className="controls-row flex items-center justify-between">
            <div className="buttons flex space-x-2">
              <button 
                className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
                onClick={goToPrevStep}
                disabled={currentStep === 0 || isPlaying}
              >
                Previous
              </button>
              
              {!isPlaying ? (
                <button
                  className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
                  onClick={playAnimation}
                  disabled={currentStep === data.simulation_steps.length - 1}
                >
                  Play
                </button>
              ) : (
                <button
                  className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded"
                  onClick={stopAnimation}
                >
                  Stop
                </button>
              )}
              
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
                onClick={goToNextStep}
                disabled={currentStep === data.simulation_steps.length - 1 || isPlaying}
              >
                Next
              </button>
            </div>
            
            <div className="step-counter">
              Step {currentStep + 1} of {data.simulation_steps.length}
            </div>
            
            <div className="speed-control flex items-center">
              <label htmlFor="speed" className="mr-2">Speed:</label>
              <input
                id="speed"
                type="range"
                min="500"
                max="3000"
                step="100"
                value={stepDelay}
                onChange={(e) => setStepDelay(parseInt(e.target.value))}
                disabled={isPlaying}
              />
              <span className="ml-2">{stepDelay}ms</span>
            </div>
          </div>
          
          {/* Toggle controls for visibility options */}
          <div className="additional-controls mt-4 flex space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={state.showLabels}
                onChange={() => {
                  const { setState } = useVisualization();
                  setState(prev => ({ ...prev, showLabels: !prev.showLabels }));
                }}
              />
              Show Private Key Components
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default HastadAttackVisualizer;