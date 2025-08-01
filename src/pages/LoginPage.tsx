import React from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { signInWithGoogle } from '../services/supabase';

const LoginPage: React.FC = () => {
  const handleGoogleLogin = async () => {
    try {
      console.log('Starting Google login...');
      const { data, error } = await signInWithGoogle();
      console.log('Google login result:', { data, error });
      
      if (error) {
        console.error('Login error:', error.message);
        alert(`ログインエラー: ${error.message}`);
      } else {
        console.log('Login successful, redirecting...');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('ログインに失敗しました。もう一度お試しください。');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f6f7fb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card 
          elevation={0} 
          sx={{ 
            borderRadius: '12px',
            border: '1px solid #e1e4e7',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box textAlign="center" mb={4}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #6c5dd3 0%, #7b68ee 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '24px',
                  margin: '0 auto 16px',
                }}
              >
                JT
              </Box>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 700,
                  color: '#323338',
                  fontSize: '32px',
                  mb: 1,
                }}
              >
                Job Tracker
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#676879',
                  fontWeight: 400,
                  fontSize: '18px',
                  mb: 3,
                }}
              >
                就活情報を一元管理しよう
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#676879',
                  fontSize: '16px',
                  mb: 2,
                }}
              >
                企業カード • 選考ステップ • スケジュール管理
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#676879',
                  fontSize: '14px',
                }}
              >
                Google アカウントでかんたんログイン
              </Typography>
            </Box>

            <Box display="flex" flexDirection="column" gap={2}>
              <Button
                variant="contained"
                size="large"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleLogin}
                sx={{
                  py: 1.5,
                  fontSize: '16px',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  bgcolor: '#6c5dd3',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(108, 93, 211, 0.3)',
                  '&:hover': {
                    bgcolor: '#5a4fcf',
                    boxShadow: '0 4px 12px rgba(108, 93, 211, 0.4)',
                  },
                }}
                fullWidth
              >
                Google でログイン
              </Button>
            </Box>

            <Box mt={4} textAlign="center">
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#676879',
                  fontSize: '12px',
                }}
              >
                利用することで、利用規約とプライバシーポリシーに同意したものとみなされます
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Box mt={3} textAlign="center">
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#676879',
              fontSize: '14px',
              opacity: 0.8,
            }}
          >
            MVP版 v1.0 - 就活生のための情報管理ツール
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;