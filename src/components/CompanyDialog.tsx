import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  LinearProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Business as BusinessIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Description as DocumentIcon,
} from '@mui/icons-material';
import { Company, SELECTION_STEPS, SelectionStatus } from '../types';
import { 
  createCompany, 
  updateCompany, 
  createSchedules, 
  createCompanyDocuments,
  deleteCompanySchedules,
  deleteCompanyDocuments,
  getSchedules,
  getCompanyDocuments
} from '../services/supabase';

interface CompanyDialogProps {
  open: boolean;
  company?: Company | null;
  onClose: () => void;
  onSave: () => void;
}

const CompanyDialog: React.FC<CompanyDialogProps> = ({
  open,
  company,
  onClose,
  onSave,
}) => {
  console.log('🔄 CompanyDialog rendered with:', { open, company: company?.name });
  
  // TEST: Immediate log to verify this component is loading
  React.useEffect(() => {
    if (open) {
      console.log('🚀 CompanyDialog opened - new version loaded!');
    }
  }, [open]);
  const [formData, setFormData] = useState({
    name: '',
    mypage_url: '',
    mypage_password: '',
    current_step: 1,
    status: '選考中' as SelectionStatus,
    memo: '',
    application_date: new Date().toISOString().split('T')[0], // 今日の日付をデフォルトに
  });
  
  const [schedules, setSchedules] = useState<{title: string, date: string}[]>([]);
  const [documents, setDocuments] = useState<{title: string, url: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const loadCompanyData = async () => {
      if (company) {
        setFormData({
          name: company.name || '',
          mypage_url: company.mypage_url || '',
          mypage_password: company.mypage_password || '',
          current_step: company.current_step || 1,
          status: company.status || '選考中',
          memo: company.memo || '',
          application_date: company.application_date || new Date().toISOString().split('T')[0],
        });
        
        // Load existing schedules and documents for the company
        try {
          const [schedulesResult, documentsResult] = await Promise.all([
            getSchedules(company.id),
            getCompanyDocuments(company.id)
          ]);
          
          if (schedulesResult.data) {
            setSchedules(schedulesResult.data.map(s => ({
              title: s.title,
              date: s.date
            })));
          }
          
          if (documentsResult.data) {
            setDocuments(documentsResult.data.map(d => ({
              title: d.title,
              url: d.url
            })));
          }
        } catch (error) {
          console.error('Error loading company schedules and documents:', error);
          setSchedules([]);
          setDocuments([]);
        }
      } else {
        setFormData({
          name: '',
          mypage_url: '',
          mypage_password: '',
          current_step: 1,
          status: '選考中',
          memo: '',
          application_date: new Date().toISOString().split('T')[0],
        });
        setSchedules([]);
        setDocuments([]);
      }
    };

    if (open) {
      loadCompanyData();
    }
  }, [company, open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addSchedule = () => {
    console.log('Adding new schedule');
    setSchedules(prev => {
      const newSchedules = [...prev, { title: '', date: '' }];
      console.log('New schedules state:', newSchedules);
      return newSchedules;
    });
  };

  const updateSchedule = (index: number, field: 'title' | 'date', value: string) => {
    console.log(`Updating schedule ${index} field ${field} to:`, value);
    setSchedules(prev => prev.map((schedule, i) => 
      i === index ? { ...schedule, [field]: value } : schedule
    ));
  };

  const removeSchedule = (index: number) => {
    console.log('Removing schedule at index:', index);
    setSchedules(prev => prev.filter((_, i) => i !== index));
  };

  const addDocument = () => {
    console.log('Adding new document');
    setDocuments(prev => {
      const newDocuments = [...prev, { title: '', url: '' }];
      console.log('New documents state:', newDocuments);
      return newDocuments;
    });
  };

  const updateDocument = (index: number, field: 'title' | 'url', value: string) => {
    console.log(`Updating document ${index} field ${field} to:`, value);
    setDocuments(prev => prev.map((doc, i) => 
      i === index ? { ...doc, [field]: value } : doc
    ));
  };

  const removeDocument = (index: number) => {
    console.log('Removing document at index:', index);
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('企業名を入力してください。');
      return;
    }

    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('Form data:', formData);
    console.log('Schedules state:', schedules);
    console.log('Documents state:', documents);
    console.log('Company being edited:', company);
    console.log('=============================');
    
    setLoading(true);
    
    try {
      let companyId: string;
      
      if (company) {
        // Update existing company
        console.log('Updating existing company:', company.id);
        const { data, error } = await updateCompany(company.id, formData);
        if (error) {
          console.error('Error updating company:', error);
          alert(`更新に失敗しました: ${error.message}`);
          return;
        }
        console.log('Update successful:', data);
        companyId = company.id;

        // Delete existing schedules and documents
        await deleteCompanySchedules(companyId);
        await deleteCompanyDocuments(companyId);
      } else {
        // Create new company
        console.log('Creating new company');
        const { data, error } = await createCompany(formData);
        if (error) {
          console.error('Error creating company:', error);
          alert(`作成に失敗しました: ${error.message || error.details || '不明なエラー'}`);
          return;
        }
        console.log('Creation successful:', data);
        companyId = data.id;
      }

      // Save schedules
      console.log('Saving schedules:', schedules);
      if (schedules.length > 0) {
        const validSchedules = schedules.filter(s => s.title.trim() && s.date);
        console.log('Valid schedules to save:', validSchedules);
        
        if (validSchedules.length > 0) {
          const { data: schedulesData, error: schedulesError } = await createSchedules(companyId, validSchedules);
          if (schedulesError) {
            console.error('Error saving schedules:', schedulesError);
            alert(`スケジュールの保存に失敗しました: ${schedulesError.message}`);
            return;
          }
          console.log('Schedules saved successfully:', schedulesData);
        }
      }

      // Save documents
      console.log('Saving documents:', documents);
      if (documents.length > 0) {
        const validDocuments = documents.filter(d => d.title.trim() && d.url.trim());
        console.log('Valid documents to save:', validDocuments);
        
        if (validDocuments.length > 0) {
          const { data: documentsData, error: documentsError } = await createCompanyDocuments(companyId, validDocuments);
          if (documentsError) {
            console.error('Error saving documents:', documentsError);
            alert(`資料の保存に失敗しました: ${documentsError.message}`);
            return;
          }
          console.log('Documents saved successfully:', documentsData);
        }
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving company:', error);
      alert(`保存に失敗しました: ${error.message || '不明なエラー'}`);
    } finally {
      setLoading(false);
    }
  };

  const currentStep = SELECTION_STEPS.find(step => step.id === formData.current_step);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <BusinessIcon color="primary" />
          <Typography variant="h6">
            {company ? '企業情報を編集' : '新しい企業を追加'}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* 企業名 */}
          <TextField
            label="企業名"
            required
            fullWidth
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={!formData.name && formData.name !== ''}
            helperText={!formData.name && formData.name !== '' ? '企業名は必須です' : ''}
          />

          {/* マイページ情報 */}
          <TextField
            label="マイページURL"
            fullWidth
            type="url"
            value={formData.mypage_url}
            onChange={(e) => handleInputChange('mypage_url', e.target.value)}
            placeholder="https://example.com/recruit"
          />
          <TextField
            label="マイページパスワード"
            fullWidth
            type={showPassword ? 'text' : 'password'}
            value={formData.mypage_password}
            onChange={(e) => handleInputChange('mypage_password', e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            helperText="企業の採用サイトログイン用（暗号化して保存されます）"
          />

          {/* 選考ステップ・ステータス */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>選考ステップ</InputLabel>
              <Select
                value={formData.current_step}
                label="選考ステップ"
                onChange={(e) => handleInputChange('current_step', e.target.value)}
              >
                {SELECTION_STEPS.map((step) => (
                  <MenuItem key={step.id} value={step.id}>
                    {step.name} ({step.progress}%)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>ステータス</InputLabel>
              <Select
                value={formData.status}
                label="ステータス"
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <MenuItem value="選考中">選考中</MenuItem>
                <MenuItem value="合格">合格</MenuItem>
                <MenuItem value="不合格">不合格</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* 進捗表示 */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              現在の進捗: {currentStep?.name} ({currentStep?.progress}%)
            </Typography>
            <LinearProgress
              variant="determinate"
              value={currentStep?.progress || 0}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'grey.200',
              }}
            />
          </Box>

          {/* スケジュール */}
          <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <ScheduleIcon color="primary" />
                <Typography variant="h6" fontWeight="medium">
                  スケジュール
                </Typography>
              </Box>
              <IconButton onClick={addSchedule} color="primary" size="small">
                <AddIcon />
              </IconButton>
            </Box>
            {schedules.map((schedule, index) => (
              <Box key={index} display="flex" gap={2} mb={2} alignItems="center">
                <TextField
                  label="タイトル"
                  value={schedule.title}
                  onChange={(e) => updateSchedule(index, 'title', e.target.value)}
                  placeholder="例: 一次面接、ES締切"
                  size="small"
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="日付"
                  type="date"
                  value={schedule.date}
                  onChange={(e) => updateSchedule(index, 'date', e.target.value)}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: 150 }}
                />
                <IconButton 
                  onClick={() => removeSchedule(index)} 
                  color="error" 
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            {schedules.length === 0 && (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                スケジュールを追加してください
              </Typography>
            )}
          </Box>

          {/* 資料 */}
          <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <DocumentIcon color="primary" />
                <Typography variant="h6" fontWeight="medium">
                  資料
                </Typography>
              </Box>
              <IconButton onClick={addDocument} color="primary" size="small">
                <AddIcon />
              </IconButton>
            </Box>
            {documents.map((document, index) => (
              <Box key={index} display="flex" gap={2} mb={2} alignItems="center">
                <TextField
                  label="タイトル"
                  value={document.title}
                  onChange={(e) => updateDocument(index, 'title', e.target.value)}
                  placeholder="例: ES下書き、企業研究"
                  size="small"
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="URL"
                  value={document.url}
                  onChange={(e) => updateDocument(index, 'url', e.target.value)}
                  placeholder="https://docs.google.com/..."
                  size="small"
                  sx={{ flex: 2 }}
                />
                <IconButton 
                  onClick={() => removeDocument(index)} 
                  color="error" 
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            {documents.length === 0 && (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                関連資料のリンクを追加してください
              </Typography>
            )}
          </Box>

          {/* メモ */}
          <TextField
            label="メモ"
            fullWidth
            multiline
            rows={3}
            value={formData.memo}
            onChange={(e) => handleInputChange('memo', e.target.value)}
            placeholder="面接の感想、企業の特徴など..."
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={loading}>
          キャンセル
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !formData.name.trim()}
          sx={{ minWidth: 100 }}
        >
          {loading ? (
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                component="div"
                sx={{
                  width: 16,
                  height: 16,
                  border: '2px solid',
                  borderColor: 'white',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }}
              />
              保存中...
            </Box>
          ) : (
            company ? '更新' : '作成'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CompanyDialog;