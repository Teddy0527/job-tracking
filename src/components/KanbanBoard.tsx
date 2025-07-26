import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Badge,
} from '@mui/material';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Company, SELECTION_STEPS } from '../types';
import CompanyCard from './CompanyCard';
import DraggableCompanyCard from './DraggableCompanyCard';
import DropZone from './DropZone';
import { deleteCompany, updateCompany } from '../services/supabase';

interface KanbanBoardProps {
  companies: Company[];
  onEditCompany: (company: Company) => void;
  onRefresh: () => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  companies,
  onEditCompany,
  onRefresh,
}) => {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [draggedCompany, setDraggedCompany] = React.useState<Company | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [overId, setOverId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDeleteCompany = async (id: string) => {
    try {
      const { error } = await deleteCompany(id);
      if (error) {
        console.error('Error deleting company:', error);
        alert('削除に失敗しました。');
        return;
      }
      onRefresh();
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('削除に失敗しました。');
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    const company = companies.find(c => c.id === active.id);
    setDraggedCompany(company || null);
    console.log('Drag started:', active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over ? over.id as string : null);
    console.log('Drag over:', over?.id);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    console.log('Drag ended:', { active: active.id, over: over?.id });
    
    setActiveId(null);
    setDraggedCompany(null);
    setOverId(null);

    if (!over) {
      console.log('No drop target');
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // ステップエリアにドロップされた場合
    if (overId.startsWith('step-')) {
      const newStep = parseInt(overId.replace('step-', ''));
      const company = companies.find(c => c.id === activeId);
      
      if (company && company.current_step !== newStep) {
        console.log(`Moving company ${company.name} from step ${company.current_step} to step ${newStep}`);
        
        try {
          const { error } = await updateCompany(activeId, { 
            current_step: newStep 
          });
          
          if (error) {
            console.error('Error updating company step:', error);
            alert('ステップの更新に失敗しました。');
          } else {
            console.log('Successfully updated company step');
            onRefresh();
          }
        } catch (error) {
          console.error('Error updating company step:', error);
          alert('ステップの更新に失敗しました。');
        }
      } else {
        console.log('No step change needed');
      }
    }
  };

  const getColumnColor = (stepId: number) => {
    switch (stepId) {
      case 1:
        return '#e3f2fd'; // Light blue
      case 2:
        return '#f3e5f5'; // Light purple
      case 3:
        return '#fff3e0'; // Light orange
      case 4:
        return '#ffebee'; // Light red
      case 5:
        return '#e8f5e8'; // Light green
      default:
        return '#f5f5f5';
    }
  };

  const getColumnBorderColor = (stepId: number) => {
    switch (stepId) {
      case 1:
        return '#2196f3'; // Blue
      case 2:
        return '#9c27b0'; // Purple
      case 3:
        return '#ff9800'; // Orange
      case 4:
        return '#f44336'; // Red
      case 5:
        return '#4caf50'; // Green
      default:
        return '#ccc';
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Box>
        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
          {SELECTION_STEPS.map((step) => {
            const stepCompanies = companies.filter(
              (company) => company.current_step === step.id
            );

            return (
              <Paper
                key={step.id}
                elevation={1}
                sx={{
                  minWidth: 280,
                  flex: '1 1 280px',
                  minHeight: '70vh',
                  backgroundColor: getColumnColor(step.id),
                  borderTop: `4px solid ${getColumnBorderColor(step.id)}`,
                  borderRadius: 2,
                  transition: 'background-color 0.2s ease',
                  '&:hover': {
                    backgroundColor: activeId ? 'rgba(25, 118, 210, 0.08)' : getColumnColor(step.id),
                  },
                }}
              >
                {/* Column Header */}
                <Box
                  sx={{
                    p: 2,
                    borderBottom: '1px solid',
                    borderColor: 'grey.200',
                    bgcolor: 'white',
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight="bold" noWrap>
                      {step.name}
                    </Typography>
                    <Badge
                      badgeContent={stepCompanies.length}
                      color="primary"
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: getColumnBorderColor(step.id),
                          color: 'white',
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    進捗: {step.progress}%
                  </Typography>
                </Box>

                {/* Drop Zone */}
                <Box
                  sx={{
                    maxHeight: 'calc(70vh - 80px)',
                    overflowY: 'auto',
                  }}
                >
                  <DropZone
                    id={`step-${step.id}`}
                    isEmpty={stepCompanies.length === 0}
                  >
                    <SortableContext
                      items={stepCompanies.map(c => c.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {stepCompanies.map((company) => (
                        <DraggableCompanyCard
                          key={company.id}
                          company={company}
                          onEdit={onEditCompany}
                          onDelete={handleDeleteCompany}
                          isDragging={activeId === company.id}
                        />
                      ))}
                    </SortableContext>
                  </DropZone>
                </Box>
              </Paper>
            );
          })}
        </Box>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId && draggedCompany ? (
            <CompanyCard
              company={draggedCompany}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          ) : null}
        </DragOverlay>
      </Box>

      {/* Summary */}
      <Box mt={3}>
        <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            📊 進捗サマリー
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 2 }}>
            {SELECTION_STEPS.map((step) => {
              const count = companies.filter(
                (company) => company.current_step === step.id
              ).length;
              const percentage = companies.length > 0 ? (count / companies.length) * 100 : 0;

              return (
                <Box key={step.id} textAlign="center" sx={{ minWidth: 120 }}>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color={getColumnBorderColor(step.id)}
                  >
                    {count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({percentage.toFixed(1)}%)
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Paper>
      </Box>
    </DndContext>
  );
};

export default KanbanBoard;