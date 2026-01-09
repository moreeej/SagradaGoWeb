import React, { useState, useRef, useEffect } from 'react';
import { Modal } from 'antd';
import {
  CloseOutlined,
  ExpandOutlined,
  LeftOutlined,
  RightOutlined,
  FullscreenExitOutlined
} from '@ant-design/icons';
import facadeImage from '../assets/360facade.jpg';
import altarImage from '../assets/360altar.jpg';
import pewsImage from '../assets/360pews.jpg';
import '../styles/virtualTour.css';

export default function VirtualTour({ isOpen, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [translateX, setTranslateX] = useState(-33.33);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const isMouseDownRef = useRef(false);


  const tourImages = [
    {
      id: 'facade',
      name: 'Facade',
      image: facadeImage,
      description: 'The magnificent facade of the Sagrada Familia Parish showcases stunning architectural details and intricate designs. This grand entrance welcomes visitors with its beautiful stonework and traditional church architecture.',
    },
    {
      id: 'altar',
      name: 'Altar',
      image: altarImage,
      description: 'The sacred altar is the heart of our parish, where the Holy Eucharist is celebrated. This sacred space is beautifully adorned and serves as the focal point for worship and prayer, creating a reverent atmosphere for all who visit.',
    },
    {
      id: 'pews',
      name: 'Pews',
      image: pewsImage,
      description: 'The pews area provides a peaceful space for congregation members to gather for Mass and prayer. The carefully arranged seating creates a sense of community and togetherness during worship services.',
    },
  ];

  const currentImage = tourImages[currentImageIndex];

  useEffect(() => {
    setTranslateX(-33.33);
    setImageLoaded(false);
  }, [currentImageIndex]);

  const handleDrag = (clientX) => {
    if (!isDragging) return;
    const deltaX = dragStart - clientX;
    const sensitivity = 0.3;
    const newTranslateX = translateX + (deltaX * sensitivity);
    setTranslateX(Math.max(-66.66, Math.min(0, newTranslateX)));
    setDragStart(clientX);
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      closeIcon={false}
      width={isFullscreen ? '100vw' : 900}
      centered
      className={`virtual-tour-modal ${isFullscreen ? 'fullscreen-mode' : ''}`}
      styles={{
        body: { padding: 0 },
        content: { borderRadius: isFullscreen ? 0 : '12px', overflow: 'hidden', backgroundColor: '#fff' }
      }}
    >
      <div className="virtual-tour-wrapper">

        {!isFullscreen && (
          <div className="virtual-tour-header">
            <div className="virtual-tour-title">
              <h2>{currentImage.name}</h2>
              <p>Virtual Tour - 360° Experience</p>
            </div>
            <div className="header-button-group">
              <button className="header-icon-btn" onClick={() => setIsFullscreen(true)}>
                <ExpandOutlined />
              </button>
              <button className="header-icon-btn close-btn" onClick={onClose}>
                <CloseOutlined />
              </button>
            </div>
          </div>
        )}

        <div
          className={`virtual-tour-image-container ${isFullscreen ? 'image-only-fs' : ''}`}
          onMouseDown={(e) => { setIsDragging(true); setDragStart(e.clientX); isMouseDownRef.current = true; }}
          onMouseMove={(e) => isMouseDownRef.current && handleDrag(e.clientX)}
          onMouseUp={() => { setIsDragging(false); isMouseDownRef.current = false; }}
          onMouseLeave={() => { setIsDragging(false); isMouseDownRef.current = false; }}
          onTouchStart={(e) => { setIsDragging(true); setDragStart(e.touches[0].clientX); }}
          onTouchMove={(e) => handleDrag(e.touches[0].clientX)}
          onTouchEnd={() => setIsDragging(false)}
        >
          {isFullscreen && (
            <button className="exit-fs-overlay" onClick={() => setIsFullscreen(false)}>
              <FullscreenExitOutlined /> Exit Fullscreen
            </button>
          )}

          {!imageLoaded && (
            <div className="virtual-tour-loading">
              <div className="loading-spinner"></div>
            </div>
          )}

          <div
            className="virtual-tour-panorama-wrapper"
            style={{
              transform: `translateX(${translateX}%)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            }}
          >
            <img
              src={currentImage.image}
              alt={currentImage.name}
              className="virtual-tour-panorama-image"
              onLoad={() => setImageLoaded(true)}
              draggable={false}
            />
          </div>
        </div>

        {!isFullscreen && (
          <>
            <div className="virtual-tour-description">
              <p>{currentImage.description}</p>
            </div>

            <div className="virtual-tour-controls">
              <button className="virtual-tour-nav-btn" onClick={() => setCurrentImageIndex((p) => (p - 1 + tourImages.length) % tourImages.length)}>
                <LeftOutlined /> Previous
              </button>

              <div className="virtual-tour-dots">
                {tourImages.map((_, index) => (
                  <button
                    key={index}
                    className={`virtual-tour-dot ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>

              <button className="virtual-tour-nav-btn" onClick={() => setCurrentImageIndex((p) => (p + 1) % tourImages.length)}>
                Next <RightOutlined />
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}