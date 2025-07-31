import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Typography,
  Box,
  LinearProgress,
  Menu,
  MenuItem,
  TableSortLabel,
  TextField,
  InputAdornment,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Search as SearchIcon,
  Link as LinkIcon,
  Description as DocumentIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { Company, SELECTION_STEPS, Schedule, CompanyDocument } from '../types';
import { deleteCompany, getSchedules, getCompanyDocuments } from '../services/supabase';

interface CompanyTableProps {
  companies: Company[];
  onEditCompany: (company: Company) => void;
  onRefresh: () => void;
}

type SortField = 'name' | 'industry' | 'position' | 'current_step' | 'status' | 'updated_at';
type SortOrder = 'asc' | 'desc';

const CompanyTable: React.FC<CompanyTableProps> = ({
  companies,
  onEditCompany,
  onRefresh,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [sortField, setSortField] = useState<SortField>('updated_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [companySchedules, setCompanySchedules] = useState<Record<string, Schedule[]>>({});
  const [companyDocuments, setCompanyDocuments] = useState<Record<string, CompanyDocument[]>>({});

  // Load schedules and documents for all companies
  useEffect(() => {
    const loadSchedulesAndDocuments = async () => {
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
        } catch (error) {
          console.error(`Error loading data for company ${company.id}:`, error);
          schedules[company.id] = [];
          documents[company.id] = [];
        }
      }

      setCompanySchedules(schedules);
      setCompanyDocuments(documents);
    };

    if (companies.length > 0) {
      loadSchedulesAndDocuments();
    }
  }, [companies]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, company: Company) => {
    setAnchorEl(event.currentTarget);
    setSelectedCompany(company);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCompany(null);
  };

  const handleEdit = () => {
    if (selectedCompany) {
      onEditCompany(selectedCompany);
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!selectedCompany) return;
    
    if (window.confirm(`「${selectedCompany.name}」を削除しますか？`)) {
      try {
        const { error } = await deleteCompany(selectedCompany.id);
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
    }
    handleMenuClose();
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '合格':
        return 'success';
      case '不合格':
        return 'error';
      case '選考中':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getStepName = (stepId: number) => {
    const step = SELECTION_STEPS.find(s => s.id === stepId);
    return step?.name || '未設定';
  };

  const getProgress = (stepId: number) => {
    const step = SELECTION_STEPS.find(s => s.id === stepId);
    return step?.progress || 0;
  };

  const getUpcomingSchedules = (companyId: string) => {
    const schedules = companySchedules[companyId] || [];
    const today = new Date().toISOString().split('T')[0];
    return schedules
      .filter(schedule => schedule.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter and sort companies
  const filteredAndSortedCompanies = companies
    .filter(company => {
      const searchLower = searchTerm.toLowerCase();
      return (
        company.name.toLowerCase().includes(searchLower) ||
        (company.industry?.toLowerCase().includes(searchLower)) ||
        (company.position?.toLowerCase().includes(searchLower)) ||
        company.status.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'industry':
          aValue = a.industry || '';
          bValue = b.industry || '';
          break;
        case 'position':
          aValue = a.position || '';
          bValue = b.position || '';
          break;
        case 'current_step':
          aValue = a.current_step;
          bValue = b.current_step;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        default:
          aValue = '';
          bValue = '';
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  return (
    <Box>
      {/* Search */}
      <Box mb={2}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="企業名、業界、職種、ステータスで検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'name'}
                  direction={sortField === 'name' ? sortOrder : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    企業名
                  </Typography>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'industry'}
                  direction={sortField === 'industry' ? sortOrder : 'asc'}
                  onClick={() => handleSort('industry')}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    業界
                  </Typography>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'position'}
                  direction={sortField === 'position' ? sortOrder : 'asc'}
                  onClick={() => handleSort('position')}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    職種
                  </Typography>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'current_step'}
                  direction={sortField === 'current_step' ? sortOrder : 'asc'}
                  onClick={() => handleSort('current_step')}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    選考ステップ
                  </Typography>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'status'}
                  direction={sortField === 'status' ? sortOrder : 'asc'}
                  onClick={() => handleSort('status')}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    ステータス
                  </Typography>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight="bold">
                  スケジュール
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight="bold">
                  資料
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight="bold">
                  リンク
                </Typography>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'updated_at'}
                  direction={sortField === 'updated_at' ? sortOrder : 'asc'}
                  onClick={() => handleSort('updated_at')}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    更新日
                  </Typography>
                </TableSortLabel>
              </TableCell>
              <TableCell width={50}>
                <Typography variant="subtitle2" fontWeight="bold">
                  操作
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedCompanies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {searchTerm ? '検索結果が見つかりません' : '企業データがありません'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedCompanies.map((company) => (
                <TableRow key={company.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
                        {company.name}
                      </Typography>
                      {company.application_date && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          応募日: {new Date(company.application_date).toLocaleDateString('ja-JP')}
                        </Typography>
                      )}
                      {company.memo && (
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          sx={{ 
                            display: 'block',
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={company.memo}
                        >
                          📝 {company.memo}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {company.industry || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {company.position || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: (() => {
                              switch (company.current_step) {
                                case 1: return '#579bfc';
                                case 2: return '#a25ddc';
                                case 3: return '#ff642e';
                                case 4: return '#e2445c';
                                case 5: return '#00c875';
                                default: return '#c4c4c4';
                              }
                            })(),
                          }}
                        />
                        <Typography variant="body2" fontWeight="medium">
                          {getStepName(company.current_step)}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={getProgress(company.current_step)}
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: (() => {
                              switch (company.current_step) {
                                case 1: return '#579bfc';
                                case 2: return '#a25ddc';
                                case 3: return '#ff642e';
                                case 4: return '#e2445c';
                                case 5: return '#00c875';
                                default: return '#c4c4c4';
                              }
                            })(),
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        進捗: {getProgress(company.current_step)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={company.status}
                      size="small"
                      color={getStatusColor(company.status) as any}
                      variant="outlined"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        '& .MuiChip-label': {
                          px: 1,
                          py: 0,
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getUpcomingSchedules(company.id).length > 0 ? (
                        <>
                          <Tooltip 
                            title={
                              <Box>
                                {getUpcomingSchedules(company.id).map((schedule, index) => (
                                  <Typography key={index} variant="caption" display="block">
                                    {formatDate(schedule.date)}: {schedule.title}
                                  </Typography>
                                ))}
                              </Box>
                            }
                          >
                            <Badge 
                              badgeContent={getUpcomingSchedules(company.id).length} 
                              color="primary"
                              sx={{ cursor: 'pointer' }}
                            >
                              <CalendarIcon fontSize="small" color="action" />
                            </Badge>
                          </Tooltip>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(getUpcomingSchedules(company.id)[0].date)}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {companyDocuments[company.id]?.length > 0 ? (
                        <Tooltip title={`${companyDocuments[company.id].length}件の資料`}>
                          <Badge badgeContent={companyDocuments[company.id].length} color="secondary">
                            <DocumentIcon fontSize="small" color="action" />
                          </Badge>
                        </Tooltip>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {company.mypage_url ? (
                      <IconButton
                        size="small"
                        onClick={() => window.open(company.mypage_url, '_blank')}
                      >
                        <LinkIcon fontSize="small" />
                      </IconButton>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(company.updated_at).toLocaleDateString('ja-JP')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, company)}
                    >
                      <MoreIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Summary */}
      <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          {searchTerm ? `${filteredAndSortedCompanies.length}件中 ` : ''}
          全{companies.length}社を表示
        </Typography>
      </Box>

      {/* Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit}>編集</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          削除
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CompanyTable;