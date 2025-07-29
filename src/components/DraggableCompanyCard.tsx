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
    // ドラッグハンドルやメニューボタンがクリックされた場合は詳細表示をしない
    if (!sortableIsDragging && 
        event.target === event.currentTarget || 
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
      ref={setNodeRef}
      style={style}
      elevation={0}
      onClick={handleCardClick}
      sx={{
        mb: 2,
        borderRadius: '12px',
        border: '1px solid #e1e4e7',
        bgcolor: 'white',
        cursor: sortableIsDragging ? 'grabbing' : 'pointer',
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
    >
      <CardContent className="card-content" sx={{ p: 3, '&:last-child': { pb: 3 } }}>
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
              <ScheduleIcon fontSize="small" color="action" />
              <Typography variant="body2" fontWeight="medium" fontSize="0.8rem">
                スケジュール
              </Typography>
            </Box>
            {schedules.slice(0, 1).map((schedule) => (
              <Box key={schedule.id} display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="body2" color="text.secondary" fontSize="0.75rem" noWrap>
                  {schedule.title}
                </Typography>
                <Typography variant="body2" color="primary" fontSize="0.75rem">
                  {new Date(schedule.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                </Typography>
              </Box>
            ))}
            {schedules.length > 1 && (
              <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                他 {schedules.length - 1} 件
              </Typography>
            )}
          </Box>
        )}

        {/* Documents */}
        {documents.length > 0 && (
          <Box mb={2}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <DocumentIcon fontSize="small" color="action" />
              <Typography variant="body2" fontWeight="medium" fontSize="0.8rem">
                資料
              </Typography>
            </Box>
            {documents.slice(0, 1).map((document) => (
              <Box key={document.id} mb={0.5}>
                <Typography
                  variant="body2"
                  color="primary"
                  fontSize="0.75rem"
                  component="a"
                  href={document.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                  noWrap
                >
                  {document.title}
                </Typography>
              </Box>
            ))}
            {documents.length > 1 && (
              <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                他 {documents.length - 1} 件
              </Typography>
            )}
          </Box>
        )}

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