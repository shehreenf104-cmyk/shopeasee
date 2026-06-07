import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  Divider,
  TextField,
  Typography,
} from '@mui/material'
import { NavLink } from 'react-router-dom'
import StorefrontIcon from '@mui/icons-material/Storefront'
import { useAuth } from '../context/AuthContext'

function Login() {
  const { signIn, isAuthenticated, error, loading } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/products'

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, from, navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!identifier || !password) {
      setFormError('Username/email and password are required.')
      return
    }
    setFormError('')
    try {
      await signIn({ identifier, password })
    } catch {
      // Error is handled by auth context
    }
  }

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 68px)',
        background: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        px: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 460,
          p: { xs: 3, sm: 4.5 },
          boxShadow: '0 24px 64px rgba(0,0,0,0.14)',
          border: '1px solid rgba(0,0,0,0.05)',
          borderRadius: 4,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Brand */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: 3.5,
              background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
              boxShadow: '0 10px 28px rgba(37,99,235,0.4)',
            }}
          >
            <StorefrontIcon sx={{ color: 'white', fontSize: 30 }} />
          </Box>
          <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em" gutterBottom>
            Welcome back
          </Typography>
          <Typography color="text.secondary" fontSize="0.9375rem">
            Sign in to continue to{' '}
            <Box component="span" fontWeight={700} color="primary.main">
              ShopEase
            </Box>
          </Typography>
        </Box>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2.5 }}>
          <TextField
            label="Username or email"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            fullWidth
            autoFocus
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            fullWidth
          />

          {(formError || error) && (
            <Alert severity="error">{formError || error}</Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            fullWidth
            sx={{ py: 1.6, fontSize: '1rem', fontWeight: 700, borderRadius: 3 }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            New to ShopEase?
          </Typography>
        </Divider>

        <Button
          component={NavLink}
          to="/signup"
          variant="outlined"
          size="large"
          fullWidth
          sx={{
            py: 1.5,
            fontSize: '0.9375rem',
            borderWidth: '1.5px',
            '&:hover': { borderWidth: '1.5px' },
          }}
        >
          Create a free account
        </Button>
      </Card>
    </Box>
  )
}

export default Login
