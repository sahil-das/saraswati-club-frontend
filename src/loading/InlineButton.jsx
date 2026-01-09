import React, { useState } from 'react';
import { Button } from '../components/ui/Button';

export default function InlineButton({ onClick, children, ...props }) {
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  const handleClick = async (e) => {
    if (!onClick) return;

    // Check if the handler returns a promise
    const result = onClick(e);

    if (result instanceof Promise) {
      setIsLocalLoading(true);
      try {
        await result;
      } finally {
        // Add a tiny buffer so users see the completion state
        setIsLocalLoading(false);
      }
    }
  };

  return (
    <Button 
      {...props} 
      onClick={handleClick} 
      isLoading={props.isLoading || isLocalLoading}
      disabled={props.disabled || isLocalLoading}
    >
      {children}
    </Button>
  );
}