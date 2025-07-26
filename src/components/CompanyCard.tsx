import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Business as BusinessIcon,
  Link as LinkIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { Company, SELECTION_STEPS } from '../types';

interface CompanyCardProps {
  company: Company;
  onEdit: (company: Company) => void;
  onDelete: (id: string) => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  onEdit,
  onDelete,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const currentStep = SELECTION_STEPS.find(step => step.id === company.current_step);
  const progressValue = currentStep ? currentStep.progress : 0;

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit(company);
    handleMenuClose();
  };

  const handleDelete = () => {
    if (window.confirm(`「${company.name}」を削除しますか？`)) {
      onDelete(company.id);
    }
    handleMenuClose();
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

  const getStepColor = (stepId: number) => {
    if (stepId <= 2) return '#1976d2'; // Blue
    if (stepId <= 4) return '#ed6c02'; // Orange
    return '#2e7d32'; // Green
  };

  return (
    <Card
      elevation={2}
      sx={{
        mb: 2,
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          elevation: 4,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ pb: 2 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ bgcolor: getStepColor(company.current_step), width: 32, height: 32 }}>
              <BusinessIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="h6" component="h3" noWrap>
                {company.name}
              </Typography>
              {company.industry && (
                <Typography variant="caption" color="text.secondary">
                  {company.industry}
                </Typography>
              )}
            </Box>
          </Box>
          
          <IconButton size="small" onClick={handleMenuClick}>
            <MoreIcon />
          </IconButton>
        </Box>

        {/* Progress */}
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" fontWeight="medium">
              {currentStep?.name || '未設定'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {progressValue}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressValue}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                bgcolor: getStepColor(company.current_step),
                borderRadius: 3,
              },
            }}
          />
        </Box>

        {/* Status and Position */}
        <Box display="flex" gap={0.5} mb={2} flexWrap="wrap">
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
          {company.position && (
            <Chip
              label={company.position}
              size="small"
              variant="outlined"
              color="default"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                maxWidth: 120,
                '& .MuiChip-label': {
                  px: 1,
                  py: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                },
              }}
            />
          )}
        </Box>

        {/* Links */}
        {company.mypage_url && (
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <LinkIcon fontSize="small" color="action" />
            <Typography variant="body2" color="primary" noWrap>
              マイページ
            </Typography>
          </Box>
        )}

        {/* Memo */}
        {company.memo && (
          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
            sx={{ fontStyle: 'italic' }}
          >
            {company.memo}
          </Typography>
        )}

        {/* Last Updated */}
        <Box mt={2} pt={1} borderTop="1px solid" borderColor="grey.200">
          <Typography variant="caption" color="text.secondary">
            <EventIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
            更新: {new Date(company.updated_at).toLocaleDateString('ja-JP')}
          </Typography>
        </Box>
      </CardContent>

      {/* Menu */}
      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit}>編集</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          削除
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default CompanyCard;