import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Close as CloseIcon,
  Business as BusinessIcon,
  Link as LinkIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  Description as DocumentIcon,
  CalendarToday as CalendarIcon,
  Notes as NotesIcon,
} from '@mui/icons-material';
import { Company, SELECTION_STEPS, Schedule, CompanyDocument } from '../types';

interface CompanyDetailDialogProps {
  open: boolean;
  company: Company | null;
  schedules: Schedule[];
  documents: CompanyDocument[];
  onClose: () => void;
  onEdit: (company: Company) => void;
}

const CompanyDetailDialog: React.FC<CompanyDetailDialogProps> = ({
  open,
  company,
  schedules,
  documents,
  onClose,
  onEdit,
}) => {
  if (!company) return null;

  const currentStep = SELECTION_STEPS.find(step => step.id === company.current_step);
  const progressValue = currentStep ? currentStep.progress : 0;

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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, maxHeight: '90vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${getStepColor(company.current_step)}20 0%, ${getStepColor(company.current_step)}40 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${getStepColor(company.current_step)}30`,
              }}
            >
              <BusinessIcon 
                sx={{ color: getStepColor(company.current_step), fontSize: 24 }}
              />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="#323338">
                {company.name}
              </Typography>
              <Chip
                label={company.status}
                size="small"
                color={getStatusColor(company.status) as any}
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* 選考進捗 */}
          <Box>
            <Typography variant="h6" fontWeight={600} mb={2} display="flex" alignItems="center" gap={1}>
              <EventIcon color="primary" />
              選考進捗
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography variant="body1" fontWeight={600}>
                {currentStep?.name || '未設定'}
              </Typography>
              <Box
                sx={{
                  px: 2,
                  py: 0.5,
                  borderRadius: '12px',
                  bgcolor: `${getStepColor(company.current_step)}15`,
                  color: getStepColor(company.current_step),
                  fontSize: '14px',
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
                height: 10,
                borderRadius: 5,
                bgcolor: '#f1f2f4',
                '& .MuiLinearProgress-bar': {
                  bgcolor: getStepColor(company.current_step),
                  borderRadius: 5,
                },
              }}
            />
          </Box>

          <Divider />

          {/* 基本情報 */}
          <Box>
            <Typography variant="h6" fontWeight={600} mb={2} display="flex" alignItems="center" gap={1}>
              <BusinessIcon color="primary" />
              基本情報
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              {company.mypage_url && (
                <Box display="flex" alignItems="center" gap={2}>
                  <LinkIcon color="action" />
                  <Typography
                    component="a"
                    href={company.mypage_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: getStepColor(company.current_step),
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    マイページを開く
                  </Typography>
                </Box>
              )}
              {company.application_date && (
                <Box display="flex" alignItems="center" gap={2}>
                  <CalendarIcon color="action" />
                  <Typography>
                    応募日: {new Date(company.application_date).toLocaleDateString('ja-JP')}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* スケジュール */}
          {schedules.length > 0 && (
            <>
              <Divider />
              <Box>
                <Typography variant="h6" fontWeight={600} mb={2} display="flex" alignItems="center" gap={1}>
                  <ScheduleIcon color="primary" />
                  スケジュール ({schedules.length}件)
                </Typography>
                <List dense>
                  {schedules.map((schedule, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <EventIcon color="action" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={schedule.title}
                        secondary={new Date(schedule.date).toLocaleDateString('ja-JP')}
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </>
          )}

          {/* 資料 */}
          {documents.length > 0 && (
            <>
              <Divider />
              <Box>
                <Typography variant="h6" fontWeight={600} mb={2} display="flex" alignItems="center" gap={1}>
                  <DocumentIcon color="primary" />
                  関連資料 ({documents.length}件)
                </Typography>
                <List dense>
                  {documents.map((document, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <DocumentIcon color="action" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            component="a"
                            href={document.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              color: getStepColor(company.current_step),
                              textDecoration: 'none',
                              fontWeight: 500,
                              '&:hover': { textDecoration: 'underline' },
                            }}
                          >
                            {document.title}
                          </Typography>
                        }
                        secondary={document.url}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </>
          )}

          {/* メモ */}
          {company.memo && (
            <>
              <Divider />
              <Box>
                <Typography variant="h6" fontWeight={600} mb={2} display="flex" alignItems="center" gap={1}>
                  <NotesIcon color="primary" />
                  メモ
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    bgcolor: '#f8f9fa',
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid #e9ecef',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                  }}
                >
                  {company.memo}
                </Typography>
              </Box>
            </>
          )}

          {/* 更新情報 */}
          <Divider />
          <Box>
            <Typography variant="body2" color="text.secondary">
              作成日: {new Date(company.created_at).toLocaleDateString('ja-JP')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              更新日: {new Date(company.updated_at).toLocaleDateString('ja-JP')}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={onClose} variant="outlined">
          閉じる
        </Button>
        <Button 
          onClick={() => onEdit(company)} 
          variant="contained"
          startIcon={<BusinessIcon />}
        >
          編集
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CompanyDetailDialog;