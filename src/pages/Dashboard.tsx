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
    <Box>
      {/* Header */}
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            📊 Job Tracker - {user.email}
          </Typography>
          
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
            sx={{ mr: 2 }}
          >
            <ToggleButton value="kanban" aria-label="kanban view">
              <KanbanIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="table" aria-label="table view">
              <TableIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>

          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              企業管理ダッシュボード
            </Typography>
            <Typography variant="body1" color="text.secondary">
              応募中の企業: {companies.length}社
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddCompany}
            size="large"
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