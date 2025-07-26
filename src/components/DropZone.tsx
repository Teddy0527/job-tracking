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
        minHeight: '200px',
        p: 1,
        border: isOver ? '2px dashed #1976d2' : isEmpty ? '2px dashed transparent' : 'none',
        borderRadius: 1,
        backgroundColor: isOver ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
    >
      {isEmpty && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
          sx={{
            opacity: isOver ? 1 : 0.5,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
            pointerEvents: 'none',
          }}
        >
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {isOver ? 'ここにドロップ' : '該当する企業がありません'}
          </Typography>
        </Box>
      )}
      {children}
    </Box>
  );
};

export default DropZone;