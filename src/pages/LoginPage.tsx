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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={8} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box textAlign="center" mb={4}>
              <Typography
                variant="h3"
                component="h1"
                fontWeight="bold"
                color="primary"
                mb={1}
              >
                📊 Job Tracker
              </Typography>
              <Typography variant="h6" color="text.secondary" mb={3}>
                就活情報を一元管理しよう
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={2}>
                企業カード • 選考ステップ • スケジュール管理
              </Typography>
              <Typography variant="body2" color="text.secondary">
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
                  fontSize: '1.1rem',
                  borderRadius: 2,
                  textTransform: 'none',
                }}
                fullWidth
              >
                Google でログイン
              </Button>
            </Box>

            <Box mt={4} textAlign="center">
              <Typography variant="caption" color="text.secondary">
                利用することで、利用規約とプライバシーポリシーに同意したものとみなされます
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Box mt={3} textAlign="center">
          <Typography variant="body2" color="white" sx={{ opacity: 0.8 }}>
            MVP版 v1.0 - 就活生のための情報管理ツール
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;