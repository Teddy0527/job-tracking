import React from 'react';
import {
  Box,
  Paper,
  Typography,
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
import { Company, SELECTION_STEPS, Schedule, CompanyDocument } from '../types';
import CompanyCard from './CompanyCard';
import DraggableCompanyCard from './DraggableCompanyCard';
import CompanyDetailDialog from './CompanyDetailDialog';
import DropZone from './DropZone';
import { deleteCompany, updateCompany, getSchedules, getCompanyDocuments } from '../services/supabase';

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
  const [companySchedules, setCompanySchedules] = React.useState<Record<string, Schedule[]>>({});
  const [companyDocuments, setCompanyDocuments] = React.useState<Record<string, CompanyDocument[]>>({});
  const [selectedCompany, setSelectedCompany] = React.useState<Company | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Load schedules and documents for all companies
  React.useEffect(() => {
    const loadSchedulesAndDocuments = async () => {
      console.log('Loading schedules and documents for companies:', companies.length);
      const schedules: Record<string, Schedule[]> = {};
      const documents: Record<string, CompanyDocument[]> = {};

      for (const company of companies) {
        try {
          const { data: scheduleData, error: scheduleError } = await getSchedules(company.id);
          const { data: documentData, error: documentError } = await getCompanyDocuments(company.id);
          
          if (scheduleError) {
            console.error(`Error loading schedules for company ${company.name}:`, scheduleError);
          }
          if (documentError) {
            console.error(`Error loading documents for company ${company.name}:`, documentError);
          }
          
          schedules[company.id] = scheduleData || [];
          documents[company.id] = documentData || [];
          
          console.log(`Loaded for ${company.name}:`, {
            schedules: schedules[company.id].length,
            documents: documents[company.id].length
          });
        } catch (error) {
          console.error(`Error loading data for company ${company.id}:`, error);
          schedules[company.id] = [];
          documents[company.id] = [];
        }
      }

      setCompanySchedules(schedules);
      setCompanyDocuments(documents);
      console.log('All schedules and documents loaded:', { schedules, documents });
    };

    if (companies.length > 0) {
      loadSchedulesAndDocuments();
    }
  }, [companies]);

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

  const handleViewDetail = (company: Company) => {
    setSelectedCompany(company);
    setDetailDialogOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailDialogOpen(false);
    setSelectedCompany(null);
  };

  const handleEditFromDetail = (company: Company) => {
    setDetailDialogOpen(false);
    setSelectedCompany(null);
    onEditCompany(company);
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

  const getColumnBorderColor = (stepId: number) => {
    switch (stepId) {
      case 1:
        return '#579bfc'; // monday.com blue
      case 2:
        return '#a25ddc'; // monday.com purple
      case 3:
        return '#ff642e'; // monday.com orange
      case 4:
        return '#e2445c'; // monday.com red
      case 5:
        return '#00c875'; // monday.com green
      default:
        return '#c4c4c4';
    }
  };

  const getColumnHeaderColor = (stepId: number) => {
    switch (stepId) {
      case 1:
        return '#579bfc';
      case 2:
        return '#a25ddc';
      case 3:
        return '#ff642e';
      case 4:
        return '#e2445c';
      case 5:
        return '#00c875';
      default:
        return '#676879';
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
        <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', pb: 3 }}>
          {SELECTION_STEPS.map((step) => {
            const stepCompanies = companies.filter(
              (company) => company.current_step === step.id
            );

            return (
              <Paper
                key={step.id}
                elevation={0}
                sx={{
                  minWidth: 300,
                  flex: '1 1 300px',
                  minHeight: '75vh',
                  backgroundColor: 'white',
                  border: '1px solid #e1e4e7',
                  borderRadius: '12px',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  '&:hover': {
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {/* Column Header */}
                <Box
                  sx={{
                    p: 4,
                    borderBottom: '1px solid #e1e4e7',
                    bgcolor: 'white',
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: getColumnBorderColor(step.id),
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12,
                    },
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: getColumnHeaderColor(step.id),
                        }}
                      />
                      <Typography 
                        variant="h6" 
                        sx={{
                          fontWeight: 700,
                          fontSize: '18px',
                          color: '#323338',
                        }}
                      >
                        {step.name}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        minWidth: 40,
                        height: 40,
                        borderRadius: '12px',
                        backgroundColor: getColumnHeaderColor(step.id),
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 800,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      {stepCompanies.length}
                    </Box>
                  </Box>
                  <Typography 
                    variant="caption" 
                    sx={{
                      color: '#676879',
                      fontSize: '13px',
                      fontWeight: 500,
                    }}
                  >
                    進捗: {step.progress}%
                  </Typography>
                </Box>

                {/* Drop Zone */}
                <Box
                  sx={{
                    maxHeight: 'calc(75vh - 120px)',
                    overflowY: 'auto',
                    px: 2,
                    py: 1,
                    '&::-webkit-scrollbar': {
                      width: 6,
                    },
                    '&::-webkit-scrollbar-track': {
                      background: '#f1f2f4',
                      borderRadius: 3,
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#c4c7d0',
                      borderRadius: 3,
                      '&:hover': {
                        background: '#9ca3af',
                      },
                    },
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
                      {stepCompanies.length === 0 ? (
                        <Box
                          sx={{
                            minHeight: '250px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            mx: 1,
                            my: 2,
                            border: '2px dashed #e1e4e7',
                            borderRadius: '12px',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: getColumnHeaderColor(step.id),
                              backgroundColor: `${getColumnHeaderColor(step.id)}08`,
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: '50%',
                              backgroundColor: `${getColumnHeaderColor(step.id)}15`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mb: 2,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: '20px',
                                color: getColumnHeaderColor(step.id),
                              }}
                            >
                              +
                            </Typography>
                          </Box>
                          <Typography 
                            variant="body2"
                            sx={{
                              color: '#676879',
                              fontSize: '13px',
                              fontWeight: 500,
                              mb: 0.5,
                            }}
                          >
                            企業をここにドラッグ
                          </Typography>
                          <Typography 
                            variant="caption"
                            sx={{
                              color: '#9ca3af',
                              fontSize: '11px',
                            }}
                          >
                            または「企業を追加」ボタンから追加
                          </Typography>
                        </Box>
                      ) : (
                        stepCompanies.map((company) => (
                          <DraggableCompanyCard
                            key={company.id}
                            company={company}
                            schedules={companySchedules[company.id] || []}
                            documents={companyDocuments[company.id] || []}
                            onEdit={onEditCompany}
                            onDelete={handleDeleteCompany}
                            onViewDetail={handleViewDetail}
                            isDragging={activeId === company.id}
                          />
                        ))
                      )}
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
              schedules={companySchedules[draggedCompany.id] || []}
              documents={companyDocuments[draggedCompany.id] || []}
              onEdit={() => {}}
              onDelete={() => {}}
              onViewDetail={() => {}}
            />
          ) : null}
        </DragOverlay>
      </Box>

      {/* Company Detail Dialog */}
      <CompanyDetailDialog
        open={detailDialogOpen}
        company={selectedCompany}
        schedules={selectedCompany ? companySchedules[selectedCompany.id] || [] : []}
        documents={selectedCompany ? companyDocuments[selectedCompany.id] || [] : []}
        onClose={handleCloseDetail}
        onEdit={handleEditFromDetail}
      />
    </DndContext>
  );
};

export default KanbanBoard;