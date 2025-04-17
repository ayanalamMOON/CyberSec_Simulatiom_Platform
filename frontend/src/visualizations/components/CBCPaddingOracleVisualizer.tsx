import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { CBCPaddingOracleResponse } from '../../api/simulationApi';
import { useVisualization } from '../VisualizationContext';

interface CBCPaddingOracleVisualizerProps {
  data: CBCPaddingOracleResponse;
  width?: number;
  height?: number;
  className?: string;
}

const CBCPaddingOracleVisualizer: React.FC<CBCPaddingOracleVisualizerProps> = ({
  data,
  width = 800,
  height = 500,
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

    const margin = { top: 40, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const blockWidth = Math.min(100, innerWidth / (data.blocks.length * 1.5));
    const blockHeight = 70;
    const arrowLength = 40;
    
    // Create container group
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add title
    svg.append("text")
      .attr("class", "title")
      .attr("x", width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("CBC Mode Encryption and Padding Oracle Attack");

    // Draw IV block
    const ivBlock = g.append("g")
      .attr("class", "iv-block")
      .attr("transform", `translate(0, ${innerHeight / 2 - blockHeight})`);
      
    ivBlock.append("rect")
      .attr("width", blockWidth)
      .attr("height", blockHeight)
      .attr("rx", 5)
      .attr("fill", "#4299e1")
      .attr("stroke", "#2b6cb0")
      .attr("stroke-width", 2);

    ivBlock.append("text")
      .attr("x", blockWidth / 2)
      .attr("y", blockHeight / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("fill", "white")
      .style("font-weight", "bold")
      .text("IV");

    // Draw blocks with connecting arrows
    data.blocks.forEach((block, i) => {
      const blockX = (i + 1) * (blockWidth + arrowLength);
      const blockG = g.append("g")
        .attr("class", `block-${i}`)
        .attr("transform", `translate(${blockX}, ${innerHeight / 2 - blockHeight})`);

      // Draw block
      const fillColor = block.decrypted ? "#68d391" : "#f6ad55";
      const strokeColor = block.decrypted ? "#2f855a" : "#c05621";
      
      blockG.append("rect")
        .attr("width", blockWidth)
        .attr("height", blockHeight)
        .attr("rx", 5)
        .attr("fill", fillColor)
        .attr("stroke", strokeColor)
        .attr("stroke-width", 2);

      blockG.append("text")
        .attr("x", blockWidth / 2)
        .attr("y", blockHeight / 2 - 10)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-weight", "bold")
        .text(`Block ${i}`);

      if (block.decrypted && block.decrypted_data) {
        blockG.append("text")
          .attr("x", blockWidth / 2)
          .attr("y", blockHeight / 2 + 15)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .style("font-size", "10px")
          .text(block.decrypted_data.length > 6 
            ? block.decrypted_data.substring(0, 6) + "..." 
            : block.decrypted_data);
      }

      // Draw arrow from previous block
      if (i === 0) {
        // Arrow from IV to first block
        drawArrow(g, blockWidth, innerHeight / 2 - blockHeight / 2, blockX, innerHeight / 2 - blockHeight / 2);
      } else {
        // Arrow from previous block to this block
        const prevBlockX = i * (blockWidth + arrowLength) + blockWidth;
        drawArrow(g, prevBlockX, innerHeight / 2 - blockHeight / 2, blockX, innerHeight / 2 - blockHeight / 2);
      }
    });

    // If we're animating a specific step, draw that as well
    if (data.simulation_steps && data.simulation_steps[currentStep]) {
      // Highlight the specific step being visualized
      const stepText = data.simulation_steps[currentStep].step;
      // We're not using the description text in the SVG directly, but we're showing it in the UI below
      // const descriptionText = data.simulation_steps[currentStep].description;
      
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

    // Add legend
    const legend = g.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${innerWidth - 120}, 0)`);
      
    // Original block
    legend.append("rect")
      .attr("width", 20)
      .attr("height", 20)
      .attr("rx", 3)
      .attr("fill", "#f6ad55")
      .attr("stroke", "#c05621")
      .attr("stroke-width", 1);
      
    legend.append("text")
      .attr("x", 30)
      .attr("y", 15)
      .attr("dominant-baseline", "middle")
      .text("Encrypted");
      
    // Decrypted block
    legend.append("rect")
      .attr("width", 20)
      .attr("height", 20)
      .attr("rx", 3)
      .attr("y", 30)
      .attr("fill", "#68d391")
      .attr("stroke", "#2f855a")
      .attr("stroke-width", 1);
      
    legend.append("text")
      .attr("x", 30)
      .attr("y", 45)
      .attr("dominant-baseline", "middle")
      .text("Decrypted");
  };

  // Helper function to draw an arrow
  const drawArrow = (g: d3.Selection<SVGGElement, unknown, null, undefined>, 
                   x1: number, y1: number, x2: number, y2: number) => {
    g.append("line")
      .attr("x1", x1)
      .attr("y1", y1)
      .attr("x2", x2 - 10)
      .attr("y2", y2)
      .attr("stroke", "#4a5568")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrow)");

    // Define arrowhead marker if it doesn't exist yet
    const defs = d3.select(svgRef.current).select("defs");
    if (defs.empty()) {
      const newDefs = d3.select(svgRef.current).append("defs");
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
        setCurrentStep(0);
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
  }, [data, currentStep, state.showLabels, state.colorScheme, width, height, renderVisualization]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  return (
    <div className={`cbc-padding-oracle-visualizer ${className}`}>
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
        </div>
      )}
    </div>
  );
};

export default CBCPaddingOracleVisualizer;