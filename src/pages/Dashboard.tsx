import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Button,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Fab,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Logout as LogoutIcon,
  ViewKanban as KanbanIcon,
  TableChart as TableIcon,
} from '@mui/icons-material';
import type { User } from '@supabase/supabase-js';
import { signOut, getCompanies } from '../services/supabase';
import { Company, ViewMode } from '../types';
import KanbanBoard from '../components/KanbanBoard';
import CompanyTable from '../components/CompanyTable';
import CompanyDialog from '../components/CompanyDialog';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const { data, error } = await getCompanies();
      if (error) {
        console.error('Error loading companies:', error);
        return;
      }
      setCompanies(data || []);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: ViewMode | null
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleAddCompany = () => {
    setEditingCompany(null);
    setDialogOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingCompany(null);
  };

  const handleCompanyUpdate = () => {
    loadCompanies();
    handleDialogClose();
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f6f7fb' }}>
      {/* Header */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          bgcolor: 'white',
          color: '#323338',
          borderBottom: '1px solid #e1e4e7',
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important' }}>
          <Box display="flex" alignItems="center" gap={2} sx={{ flexGrow: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6c5dd3 0%, #7b68ee 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              JT
            </Box>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 600,
                color: '#323338',
                fontSize: '20px',
              }}
            >
              Job Tracker
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#676879',
                ml: 1,
                fontSize: '14px',
              }}
            >
              {user.email}
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" gap={2}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
              sx={{ 
                '& .MuiToggleButton-root': {
                  border: '1px solid #e1e4e7',
                  color: '#676879',
                  '&.Mui-selected': {
                    bgcolor: '#6c5dd3',
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#5a4fcf',
                    },
                  },
                  '&:hover': {
                    bgcolor: '#f1f2f4',
                  },
                },
              }}
            >
              <ToggleButton value="kanban" aria-label="kanban view">
                <KanbanIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="table" aria-label="table view">
                <TableIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>

            <IconButton 
              onClick={handleLogout}
              sx={{
                color: '#676879',
                '&:hover': {
                  bgcolor: '#f1f2f4',
                },
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                color: '#323338',
                fontSize: '32px',
                mb: 1,
              }}
            >
              企業管理ダッシュボード
            </Typography>
            <Box display="flex" alignItems="center" gap={3}>
              <Typography 
                variant="body1" 
                sx={{
                  color: '#676879',
                  fontSize: '16px',
                }}
              >
                応募中の企業: <strong style={{ color: '#323338' }}>{companies.length}社</strong>
              </Typography>
              <Box
                sx={{
                  px: 2,
                  py: 0.5,
                  bgcolor: companies.length > 0 ? '#e1f5fe' : '#fff3e0',
                  color: companies.length > 0 ? '#0277bd' : '#f57c00',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                {companies.length > 0 ? 'アクティブ' : '企業を追加してください'}
              </Box>
            </Box>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddCompany}
            size="large"
            sx={{
              bgcolor: '#6c5dd3',
              color: 'white',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
              textTransform: 'none',
              boxShadow: '0 2px 8px rgba(108, 93, 211, 0.3)',
              '&:hover': {
                bgcolor: '#5a4fcf',
                boxShadow: '0 4px 12px rgba(108, 93, 211, 0.4)',
              },
            }}
          >
            企業を追加
          </Button>
        </Box>

        {/* View Content */}
        {viewMode === 'kanban' ? (
          <KanbanBoard 
            companies={companies} 
            onEditCompany={handleEditCompany}
            onRefresh={loadCompanies}
          />
        ) : (
          <CompanyTable 
            companies={companies} 
            onEditCompany={handleEditCompany}
            onRefresh={loadCompanies}
          />
        )}
      </Container>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add company"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleAddCompany}
      >
        <AddIcon />
      </Fab>

      {/* Company Dialog */}
      <CompanyDialog
        open={dialogOpen}
        company={editingCompany}
        onClose={handleDialogClose}
        onSave={handleCompanyUpdate}
      />
    </Box>
  );
};

export default Dashboard;