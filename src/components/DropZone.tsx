import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Box, Typography } from '@mui/material';

interface DropZoneProps {
  id: string;
  children: React.ReactNode;
  isEmpty?: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ id, children, isEmpty = false }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        minHeight: isEmpty ? '300px' : '100px',
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
    >
      {children}
      {isOver && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: '2px dashed #6c5dd3',
            borderRadius: '8px',
            backgroundColor: 'rgba(108, 93, 211, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <Typography 
            variant="body2" 
            sx={{
              color: '#6c5dd3',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            ここにドロップ
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DropZone;