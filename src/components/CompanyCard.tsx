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
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Business as BusinessIcon,
  Link as LinkIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { Company, SELECTION_STEPS, Schedule, CompanyDocument } from '../types';

interface CompanyCardProps {
  company: Company;
  schedules?: Schedule[];
  documents?: CompanyDocument[];
  onEdit: (company: Company) => void;
  onDelete: (id: string) => void;
  onViewDetail?: (company: Company) => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  schedules = [],
  documents = [],
  onEdit,
  onDelete,
  onViewDetail,
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

  const handleCardClick = (event: React.MouseEvent) => {
    // メニューボタンがクリックされた場合は詳細表示をしない
    if (event.target === event.currentTarget || 
        (event.target as HTMLElement).closest('.card-content')) {
      if (onViewDetail) {
        onViewDetail(company);
      }
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

  const getStepColor = (stepId: number) => {
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
        return '#676879';
    }
  };

  return (
    <Card
      elevation={0}
      onClick={handleCardClick}
      sx={{
        mb: 2,
        borderRadius: '12px',
        border: '1px solid #e1e4e7',
        bgcolor: 'white',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
          transform: 'translateY(-4px)',
          borderColor: getStepColor(company.current_step),
        },
      }}
    >
      <CardContent className="card-content" sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${getStepColor(company.current_step)}20 0%, ${getStepColor(company.current_step)}40 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${getStepColor(company.current_step)}30`,
              }}
            >
              <BusinessIcon 
                fontSize="small" 
                sx={{ color: getStepColor(company.current_step) }}
              />
            </Box>
            <Box>
              <Typography 
                variant="h6" 
                component="h3" 
                sx={{
                  fontWeight: 700,
                  fontSize: '16px',
                  color: '#323338',
                }}
              >
                {company.name}
              </Typography>
            </Box>
          </Box>
          
          <IconButton 
            size="small" 
            onClick={handleMenuClick}
            sx={{
              color: '#676879',
              '&:hover': {
                bgcolor: '#f1f2f4',
                color: '#323338',
              },
            }}
          >
            <MoreIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Progress */}
        <Box mb={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Typography 
              variant="body2" 
              sx={{
                fontWeight: 600,
                fontSize: '13px',
                color: '#323338',
              }}
            >
              {currentStep?.name || '未設定'}
            </Typography>
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: '12px',
                bgcolor: `${getStepColor(company.current_step)}15`,
                color: getStepColor(company.current_step),
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              {progressValue}%
            </Box>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressValue}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: '#f1f2f4',
              '& .MuiLinearProgress-bar': {
                bgcolor: getStepColor(company.current_step),
                borderRadius: 4,
                background: `linear-gradient(90deg, ${getStepColor(company.current_step)} 0%, ${getStepColor(company.current_step)}CC 100%)`,
              },
            }}
          />
        </Box>

        {/* Status */}
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
        </Box>

        {/* Schedules */}
        {schedules.length > 0 && (
          <Box mb={2}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <EventIcon 
                fontSize="small" 
                sx={{ color: '#676879', fontSize: '16px' }}
              />
              <Typography 
                variant="body2" 
                sx={{
                  color: '#323338',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                スケジュール
              </Typography>
            </Box>
            {schedules.slice(0, 2).map((schedule, index) => (
              <Box key={schedule.id} display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography 
                  variant="body2" 
                  sx={{
                    color: '#676879',
                    fontSize: '12px',
                    flex: 1,
                  }}
                >
                  {schedule.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{
                    color: getStepColor(company.current_step),
                    fontSize: '12px',
                    fontWeight: 500,
                  }}
                >
                  {new Date(schedule.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                </Typography>
              </Box>
            ))}
            {schedules.length > 2 && (
              <Typography 
                variant="caption" 
                sx={{
                  color: '#676879',
                  fontSize: '11px',
                  fontStyle: 'italic',
                }}
              >
                他 {schedules.length - 2} 件
              </Typography>
            )}
          </Box>
        )}

        {/* Documents */}
        {documents.length > 0 && (
          <Box mb={2}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <EventIcon 
                fontSize="small" 
                sx={{ color: '#676879', fontSize: '16px' }}
              />
              <Typography 
                variant="body2" 
                sx={{
                  color: '#323338',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                資料
              </Typography>
            </Box>
            {documents.slice(0, 2).map((document, index) => (
              <Box key={document.id} mb={0.5}>
                <Typography 
                  variant="body2" 
                  sx={{
                    color: getStepColor(company.current_step),
                    fontSize: '12px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                  component="a"
                  href={document.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {document.title}
                </Typography>
              </Box>
            ))}
            {documents.length > 2 && (
              <Typography 
                variant="caption" 
                sx={{
                  color: '#676879',
                  fontSize: '11px',
                  fontStyle: 'italic',
                }}
              >
                他 {documents.length - 2} 件
              </Typography>
            )}
          </Box>
        )}

        {/* Links and Memo */}
        <Box mb={2}>
          {company.mypage_url && (
            <Box display="flex" alignItems="center" gap={1} mb={1.5}>
              <LinkIcon 
                fontSize="small" 
                sx={{ color: '#676879', fontSize: '16px' }}
              />
              <Typography 
                variant="body2" 
                sx={{
                  color: getStepColor(company.current_step),
                  fontSize: '13px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
                component="a"
                href={company.mypage_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                マイページを開く
              </Typography>
            </Box>
          )}

          {company.memo && (
            <Typography
              variant="body2"
              sx={{
                color: '#676879',
                fontSize: '12px',
                fontStyle: 'italic',
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {company.memo}
            </Typography>
          )}
        </Box>

        {/* Last Updated */}
        <Box 
          mt={3} 
          pt={2} 
          borderTop="1px solid" 
          borderColor="#f1f2f4"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box display="flex" alignItems="center" gap={0.5}>
            <EventIcon 
              fontSize="small" 
              sx={{ 
                color: '#676879',
                fontSize: '14px',
              }} 
            />
            <Typography 
              variant="caption" 
              sx={{
                color: '#676879',
                fontSize: '11px',
                fontWeight: 500,
              }}
            >
              更新: {new Date(company.updated_at).toLocaleDateString('ja-JP')}
            </Typography>
          </Box>
          {company.mypage_url && (
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: '#00c875',
              }}
            />
          )}
        </Box>
      </CardContent>

      {/* Menu */}
      <Menu 
        anchorEl={anchorEl} 
        open={open} 
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            border: '1px solid #e1e4e7',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
            minWidth: 120,
          },
        }}
      >
        <MenuItem 
          onClick={handleEdit}
          sx={{
            fontSize: '14px',
            fontWeight: 500,
            color: '#323338',
            '&:hover': {
              bgcolor: '#f1f2f4',
            },
          }}
        >
          編集
        </MenuItem>
        <MenuItem 
          onClick={handleDelete} 
          sx={{ 
            fontSize: '14px',
            fontWeight: 500,
            color: '#e2445c',
            '&:hover': {
              bgcolor: '#fff5f5',
            },
          }}
        >
          削除
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default CompanyCard;