import React, { useEffect } from "react";
import { RenderingEngine, Enums } from "@cornerstonejs/core"; // Add this import if using WADO-RS
import {createImageIdsAndCacheMetaData} from './helper.js'
import {initDemo} from './Component/initDemo.js'
// Register the WADO-RS loader 

const { ViewportType } = Enums;

const CornerstoneViewer = () => {
  useEffect(() => {
    const setupViewer = async () => {
      try {
        // Initialize Cornerstone
        await initDemo();

        // Register the WADO-RS loader
         // Ensure the loader is registered
         
        const imageIds = await createImageIdsAndCacheMetaData({
          StudyInstanceUID:
            '1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463',
          SeriesInstanceUID:
            '1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561',
          wadoRsRoot: 'https://d3t6nz73ql33tx.cloudfront.net/dicomweb',
        });
        
        const content = document.getElementById("content");
        const element = document.createElement("div");
        element.style.width = "500px";
        element.style.height = "300px";

        content.appendChild(element);

        const renderingEngineId = "myRenderingEngine";
        const viewportId = "CT_AXIAL_STACK";
        const renderingEngine = new RenderingEngine(renderingEngineId);

        const viewportInput = {
          viewportId,
          element,
          type: ViewportType.STACK,
        };

        renderingEngine.enableElement(viewportInput);

         const viewport = renderingEngine.getViewport(viewportId);

        // Set the stack
          
        viewport.setStack(imageIds, 60);
        // Render the viewport
         viewport.render();
      } catch (error) {
        console.error("Error setting up Cornerstone:", error);
      }
    };

    setupViewer();
  }, []);

  return <div id="content"></div>;
};

export default CornerstoneViewer;
