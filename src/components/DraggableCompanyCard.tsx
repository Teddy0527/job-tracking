import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  alpha,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Business as BusinessIcon,
  Link as LinkIcon,
  Event as EventIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { Company, SELECTION_STEPS } from '../types';

interface DraggableCompanyCardProps {
  company: Company;
  onEdit: (company: Company) => void;
  onDelete: (id: string) => void;
  isDragging?: boolean;
}

const DraggableCompanyCard: React.FC<DraggableCompanyCardProps> = ({
  company,
  onEdit,
  onDelete,
  isDragging = false,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: sortableIsDragging,
  } = useSortable({ id: company.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: sortableIsDragging ? 0.5 : 1,
  };

  const currentStep = SELECTION_STEPS.find(step => step.id === company.current_step);
  const progressValue = currentStep ? currentStep.progress : 0;

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
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
      ref={setNodeRef}
      style={style}
      elevation={sortableIsDragging ? 6 : 2}
      sx={{
        mb: 2,
        borderRadius: 2,
        cursor: sortableIsDragging ? 'grabbing' : 'grab',
        transition: 'all 0.2s ease-in-out',
        transform: sortableIsDragging ? 'rotate(5deg)' : 'none',
        backgroundColor: sortableIsDragging ? alpha('#1976d2', 0.1) : 'white',
        border: sortableIsDragging ? '2px solid #1976d2' : '1px solid transparent',
        '&:hover': {
          elevation: 4,
          transform: sortableIsDragging ? 'rotate(5deg)' : 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        },
      }}
      {...attributes}
    >
      <CardContent sx={{ pb: 2 }}>
        {/* Header with Drag Handle */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" alignItems="center" gap={1} flex={1}>
            <Box 
              {...listeners}
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                cursor: 'grab',
                p: 0.5,
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.04)',
                },
                '&:active': {
                  cursor: 'grabbing',
                }
              }}
            >
              <DragIcon fontSize="small" color="action" />
            </Box>
            <Avatar sx={{ bgcolor: getStepColor(company.current_step), width: 28, height: 28 }}>
              <BusinessIcon fontSize="small" />
            </Avatar>
            <Box flex={1} minWidth={0}>
              <Typography variant="subtitle1" component="h3" noWrap fontWeight="medium">
                {company.name}
              </Typography>
              {company.industry && (
                <Typography variant="caption" color="text.secondary" noWrap>
                  {company.industry}
                </Typography>
              )}
            </Box>
          </Box>
          
          <IconButton 
            size="small" 
            onClick={handleMenuClick}
            sx={{ ml: 1, flexShrink: 0 }}
          >
            <MoreIcon />
          </IconButton>
        </Box>

        {/* Progress */}
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" fontWeight="medium" fontSize="0.8rem">
              {currentStep?.name || '未設定'}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
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
            <Typography variant="body2" color="primary" noWrap fontSize="0.8rem">
              マイページ
            </Typography>
          </Box>
        )}

        {/* Memo */}
        {company.memo && (
          <Typography
            variant="body2"
            color="text.secondary"
            fontSize="0.75rem"
            sx={{
              fontStyle: 'italic',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.3,
              mb: 1,
            }}
          >
            {company.memo}
          </Typography>
        )}

        {/* Last Updated */}
        <Box pt={1} borderTop="1px solid" borderColor="grey.200">
          <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
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

export default DraggableCompanyCard;