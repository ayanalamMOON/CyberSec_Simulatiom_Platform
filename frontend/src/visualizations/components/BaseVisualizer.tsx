import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useVisualization } from '../VisualizationContext';

export interface BaseVisualizerProps {
  width?: number;
  height?: number;
  data: any;
  className?: string;
  title?: string;
  description?: string;
}

const BaseVisualizer: React.FC<BaseVisualizerProps> = ({
  width = 800,
  height = 500,
  data,
  className = '',
  title,
  description
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { state } = useVisualization();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Create a container for the visualization
  useEffect(() => {
    if (!svgRef.current || !data || isInitialized) return;

    // Clear any existing content
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Add base SVG group with margins
    const margin = { top: 40, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;');
      
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
      
    // Add optional title
    if (title) {
      svg.append('text')
        .attr('class', 'visualization-title')
        .attr('x', width / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text(title);
    }

    setIsInitialized(true);
    
    return () => {
      // Cleanup function if needed
    };
  }, [data, width, height, title, isInitialized]);

  // Update visualization when settings change
  useEffect(() => {
    if (!isInitialized) return;
    
    // This is where subclasses would update visualization based on settings
    // For example, toggle labels, change animation speed, etc.
    // This basic implementation doesn't do anything
    
  }, [state, isInitialized]);

  return (
    <div className={`visualization-container ${className}`}>
      {description && (
        <div className="visualization-description text-sm text-gray-600 mb-2">
          {description}
        </div>
      )}
      <div className="visualization-svg-container">
        <svg ref={svgRef} className="visualization-svg"></svg>
      </div>
      <div className="visualization-controls mt-2">
        {/* Common controls could go here */}
      </div>
    </div>
  );
};

export default BaseVisualizer;