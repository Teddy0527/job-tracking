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
  Schedule as ScheduleIcon,
  Description as DocumentIcon,
} from '@mui/icons-material';
import { Company, SELECTION_STEPS, Schedule, CompanyDocument } from '../types';

interface DraggableCompanyCardProps {
  company: Company;
  schedules?: Schedule[];
  documents?: CompanyDocument[];
  onEdit: (company: Company) => void;
  onDelete: (id: string) => void;
  onViewDetail?: (company: Company) => void;
  isDragging?: boolean;
}

const DraggableCompanyCard: React.FC<DraggableCompanyCardProps> = ({
  company,
  schedules = [],
  documents = [],
  onEdit,
  onDelete,
  onViewDetail,
  isDragging = false,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [dragStarted, setDragStarted] = React.useState(false);
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

  const handleCardClick = (event: React.MouseEvent) => {
    // ドラッグが開始されていた場合は詳細表示をしない
    if (dragStarted || sortableIsDragging) {
      return;
    }
    
    // メニューボタンがクリックされた場合は詳細表示をしない
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }

    if (onViewDetail) {
      onViewDetail(company);
    }
  };

  const handleMouseDown = () => {
    setDragStarted(false);
  };

  const handleDragStart = () => {
    setDragStarted(true);
  };

  const handleDragEnd = () => {
    // ドラッグ終了後、少し待ってからクリック可能状態に戻す
    setTimeout(() => {
      setDragStarted(false);
    }, 100);
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
      ref={setNodeRef}
      style={style}
      elevation={0}
      onClick={handleCardClick}
      sx={{
        mb: 2,
        borderRadius: '12px',
        border: '1px solid #e1e4e7',
        bgcolor: 'white',
        cursor: sortableIsDragging ? 'grabbing' : 'grab',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: sortableIsDragging ? 'rotate(3deg)' : 'none',
        backgroundColor: sortableIsDragging ? alpha(getStepColor(company.current_step), 0.08) : 'white',
        borderColor: sortableIsDragging ? getStepColor(company.current_step) : '#e1e4e7',
        '&:hover': {
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
          transform: sortableIsDragging ? 'rotate(3deg)' : 'translateY(-4px)',
          borderColor: getStepColor(company.current_step),
        },
      }}
      {...attributes}
      {...listeners}
      onMouseDown={handleMouseDown}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <CardContent className="card-content" sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" alignItems="center" gap={1} flex={1}>
            <Avatar sx={{ bgcolor: getStepColor(company.current_step), width: 28, height: 28 }}>
              <BusinessIcon fontSize="small" />
            </Avatar>
            <Box flex={1} minWidth={0}>
              <Typography variant="subtitle1" component="h3" noWrap fontWeight="medium">
                {company.name}
              </Typography>
            </Box>
          </Box>
          
          <IconButton 
            size="small" 
            onClick={handleMenuClick}
            sx={{ 
              ml: 1, 
              flexShrink: 0,
              position: 'relative',
              zIndex: 10,
            }}
            onMouseDown={(e) => e.stopPropagation()}
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

        {/* Compact indicators */}
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          {schedules.length > 0 && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <ScheduleIcon fontSize="small" sx={{ color: getStepColor(company.current_step), fontSize: '14px' }} />
              <Typography variant="caption" fontSize="0.7rem" color="text.secondary">
                {schedules.length}
              </Typography>
            </Box>
          )}
          {documents.length > 0 && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <DocumentIcon fontSize="small" sx={{ color: getStepColor(company.current_step), fontSize: '14px' }} />
              <Typography variant="caption" fontSize="0.7rem" color="text.secondary">
                {documents.length}
              </Typography>
            </Box>
          )}
          {company.mypage_url && (
            <LinkIcon fontSize="small" sx={{ color: getStepColor(company.current_step), fontSize: '14px' }} />
          )}
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