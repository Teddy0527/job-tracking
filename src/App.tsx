import React, { useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Typography } from '@mui/material';
import { supabase } from './services/supabase';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import type { User } from '@supabase/supabase-js';

// Material-UI theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // URL parameters check (for OAuth callback)
    const urlParams = new URLSearchParams(window.location.search);
    const fragment = window.location.hash;
    console.log('URL Check:', {
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      hasAccessToken: fragment.includes('access_token'),
      hasError: urlParams.has('error') || fragment.includes('error')
    });
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('Initial session check:', { 
        session, 
        error, 
        user: session?.user,
        userEmail: session?.user?.email,
        hasUser: !!session?.user 
      });
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', { 
        event, 
        session, 
        user: session?.user,
        userEmail: session?.user?.email,
        hasUser: !!session?.user,
        timestamp: new Date().toISOString()
      });
      
      // イベントタイプによる詳細ログ
      if (event === 'SIGNED_IN') {
        console.log('✅ User successfully signed in!');
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed');
      }
      
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    console.log('App is loading...');
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          gap={2}
        >
          <Typography variant="h6">読み込み中...</Typography>
          <Typography variant="body2" color="text.secondary">
            認証状態を確認しています
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  console.log('App rendering:', { 
    hasUser: !!user, 
    userEmail: user?.email,
    loading 
  });
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box minHeight="100vh" bgcolor="background.default">
        {user ? (
          <>
            {console.log('Rendering Dashboard for user:', user.email)}
            <Dashboard user={user} />
          </>
        ) : (
          <>
            {console.log('Rendering LoginPage')}
            <LoginPage />
          </>
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
