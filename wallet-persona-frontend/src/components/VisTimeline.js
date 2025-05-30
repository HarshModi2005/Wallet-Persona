import React, { useEffect, useRef } from 'react';
import { Timeline } from 'vis-timeline/standalone';
import 'vis-timeline/styles/vis-timeline-graph2d.min.css'; // Default styles

const VisTimeline = ({ items, options, onClick }) => {
    const timelineRef = useRef(null);
    const timelineInstance = useRef(null); // To store the timeline instance

    useEffect(() => {
        if (timelineRef.current) {
            // Destroy existing instance before creating a new one
            if (timelineInstance.current) {
                timelineInstance.current.destroy();
            }

            // Create new instance
            timelineInstance.current = new Timeline(timelineRef.current, items, options);

            // Attach event listeners
            if (onClick) {
                timelineInstance.current.on('click', (properties) => {
                    // properties contain information about the clicked item, group, time, etc.
                    // We're interested in item IDs if an item was clicked.
                    if (properties.item !== null && properties.item !== undefined) {
                        onClick(properties.item); // Pass the ID of the clicked item
                    }
                });
            }
        }

        // Cleanup on component unmount or before re-render
        return () => {
            if (timelineInstance.current) {
                timelineInstance.current.destroy();
                timelineInstance.current = null;
            }
        };
    }, [items, options, onClick]); // Re-run effect if items, options, or onClick handler changes

    return <div ref={timelineRef} style={{ width: '100%', height: '300px' }} />; // Adjust height as needed
};

export default VisTimeline; 