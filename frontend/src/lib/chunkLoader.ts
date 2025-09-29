// Chunk loading error handling utility

interface ChunkLoadError extends Error {
  name: 'ChunkLoadError';
  message: string;
}

export const isChunkLoadError = (error: Error): error is ChunkLoadError => {
  return error.name === 'ChunkLoadError' || 
         error.message.includes('Loading chunk') ||
         error.message.includes('Loading CSS chunk');
};

export const handleChunkLoadError = (error: Error): boolean => {
  if (isChunkLoadError(error)) {
    console.warn('Chunk load error detected, attempting recovery...', error);
    
    // Try to reload the page after a short delay
    setTimeout(() => {
      console.log('Reloading page due to chunk load error...');
      window.location.reload();
    }, 1000);
    
    return true;
  }
  
  return false;
};

// Global error handler for unhandled chunk load errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.error && isChunkLoadError(event.error)) {
      console.warn('Global chunk load error detected:', event.error);
      handleChunkLoadError(event.error);
    }
  });

  // Handle unhandled promise rejections (common with chunk load errors)
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && isChunkLoadError(event.reason)) {
      console.warn('Unhandled chunk load promise rejection:', event.reason);
      handleChunkLoadError(event.reason);
      event.preventDefault(); // Prevent the default error handling
    }
  });
}
