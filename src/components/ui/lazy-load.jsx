import React, { useEffect, useRef, useState } from 'react';

export default function LazyLoad({ 
  children, 
  placeholder = null, 
  threshold = 0.1,
  rootMargin = '50px',
  className = ''
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : placeholder}
    </div>
  );
}

export function LazyImage({ src, alt, className = '', placeholder }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <LazyLoad
      placeholder={
        placeholder || (
          <div className={`${className} animate-pulse bg-gray-200 dark:bg-gray-700`} />
        )
      }
    >
      {!loaded && !error && (
        <div className={`${className} animate-pulse bg-gray-200 dark:bg-gray-700`} />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
      />
      {error && (
        <div className={`${className} bg-gray-100 dark:bg-gray-800 flex items-center justify-center`}>
          <span className="text-sm text-gray-400">Failed to load</span>
        </div>
      )}
    </LazyLoad>
  );
}