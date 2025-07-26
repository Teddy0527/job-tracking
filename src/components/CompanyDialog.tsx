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
} from '@mui/icons-material';
import { Company, SELECTION_STEPS, SelectionStatus } from '../types';
import { createCompany, updateCompany } from '../services/supabase';

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
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    position: '',
    mypage_url: '',
    mypage_password: '',
    current_step: 1,
    status: '選考中' as SelectionStatus,
    memo: '',
    application_date: new Date().toISOString().split('T')[0], // 今日の日付をデフォルトに
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        industry: company.industry || '',
        position: company.position || '',
        mypage_url: company.mypage_url || '',
        mypage_password: company.mypage_password || '',
        current_step: company.current_step || 1,
        status: company.status || '選考中',
        memo: company.memo || '',
        application_date: company.application_date || new Date().toISOString().split('T')[0],
      });
    } else {
      setFormData({
        name: '',
        industry: '',
        position: '',
        mypage_url: '',
        mypage_password: '',
        current_step: 1,
        status: '選考中',
        memo: '',
        application_date: new Date().toISOString().split('T')[0],
      });
    }
  }, [company, open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('企業名を入力してください。');
      return;
    }

    console.log('Form submission started with data:', formData);
    setLoading(true);
    
    try {
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

          {/* 業界・職種 */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="業界"
              fullWidth
              value={formData.industry}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              placeholder="例: IT、金融、製造業"
            />
            <TextField
              label="職種"
              fullWidth
              value={formData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
              placeholder="例: エンジニア、営業、企画"
            />
          </Box>

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