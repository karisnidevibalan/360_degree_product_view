import React, { useState, useEffect, useMemo } from 'react';
import { getProductImage, getProductImageAlt } from '../utils/productUtils';

const Image = React.memo(({ 
  src, 
  alt, 
  productId,
  className = '', 
  style = {}, 
  fallback = '/placeholder-product.svg'
}) => {
  const [imageSrc, setImageSrc] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Memoize the source to prevent unnecessary updates
  const source = useMemo(() => {
    if (productId) return getProductImage(productId, fallback);
    if (src) return src;
    return fallback;
  }, [src, productId, fallback]);

  useEffect(() => {
    let isMounted = true;
    
    if (source) {
      const img = new window.Image();
      img.src = source;
      
      img.onload = () => {
        if (isMounted) {
          setImageSrc(source);
          setIsLoading(false);
          setHasError(false);
        }
      };
      
      img.onerror = () => {
        if (isMounted) {
          setImageSrc(fallback);
          setIsLoading(false);
          setHasError(true);
        }
      };
      
      return () => {
        isMounted = false;
        img.onload = null;
        img.onerror = null;
      };
    }
    
    return () => {
      isMounted = false;
    };
  }, [source, fallback]);

  // Generate the alt text using the utility function or use the provided alt prop
  const displayAlt = useMemo(
    () => alt || (productId ? getProductImageAlt(alt || '') : 'Product Image'),
    [alt, productId]
  );

  const imageStyle = useMemo(() => ({
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    opacity: isLoading ? 0 : 1,
    transform: isHovered ? 'scale(1.02)' : 'scale(1)',
    transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
    willChange: 'transform, opacity',
    backfaceVisibility: 'hidden',
    ...style
  }), [isLoading, isHovered, style]);

  const containerStyle = useMemo(() => ({
    backgroundColor: isLoading ? '#f8fafc' : 'transparent',
    overflow: 'hidden',
    position: 'relative',
    ...(style.position ? { position: style.position } : {}),
    ...(style.width ? { width: style.width } : {}),
    ...(style.height ? { height: style.height } : {})
  }), [isLoading, style]);

  return (
    <div 
      className={`image-container ${className}`}
      style={containerStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {imageSrc && (
        <img
          src={hasError ? fallback : imageSrc}
          alt={displayAlt}
          style={imageStyle}
          className={`${isLoading ? 'loading' : 'loaded'}`}
          loading="lazy"
        />
      )}
      {isLoading && (
        <div 
          className="shimmer"
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#f8fafc',
            backgroundImage: 'linear-gradient(90deg, #f8fafc 0%, #f1f5f9 20%, #f8fafc 40%, #f8fafc 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite linear',
            borderRadius: 'inherit',
            opacity: 0.8
          }}
        />
      )}
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          
          .image-container {
            transition: all 0.3s ease-in-out;
          }
          
          .image-container img {
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            -moz-backface-visibility: hidden;
            -ms-backface-visibility: hidden;
          }
          
          .image-container:hover img {
            transform: scale(1.02);
          }
        `}
      </style>
    </div>
  );
});

Image.displayName = 'Image';

export default Image;
