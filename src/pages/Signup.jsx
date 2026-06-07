import { useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  TextField,
  Typography,
} from '@mui/material'
import StorefrontIcon from '@mui/icons-material/Storefront'
import { useAuth } from '../context/AuthContext'

function Signup() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    email: '',
    firstname: '',
    lastname: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { register } = useAuth()

  const handleChange = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!form.username || !form.password || !form.email) {
      setError('Username, email, and password are required.')
      return
    }

    setLoading(true)
    try {
      await register({
        username: form.username,
        password: form.password,
        email: form.email,
        name: {
          firstname: form.firstname,
          lastname: form.lastname,
        },
      })
      setSuccess('Account created and signed in successfully.')
      setTimeout(() => navigate('/products'), 1200)
    } catch (err) {
      setError(err.message || 'Unable to create account.')
    } finally {
      setLoading(false)
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
          maxWidth: 520,
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
            Create your account
          </Typography>
          <Typography color="text.secondary" fontSize="0.9375rem">
            Join{' '}
            <Box component="span" fontWeight={700} color="primary.main">
              ShopEase
            </Box>{' '}
            and start shopping today
          </Typography>
        </Box>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="First name"
                value={form.firstname}
                onChange={handleChange('firstname')}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last name"
                value={form.lastname}
                onChange={handleChange('lastname')}
                fullWidth
              />
            </Grid>
          </Grid>

          <TextField
            label="Email address"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            fullWidth
            required
          />
          <TextField
            label="Username"
            value={form.username}
            onChange={handleChange('username')}
            fullWidth
            required
          />
          <TextField
            label="Password"
            type="password"
            value={form.password}
            onChange={handleChange('password')}
            fullWidth
            required
          />

          {(error || success) && (
            <Alert severity={error ? 'error' : 'success'}>{error || success}</Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            fullWidth
            sx={{ py: 1.6, fontSize: '1rem', fontWeight: 700, borderRadius: 3 }}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Already have an account?
          </Typography>
        </Divider>

        <Button
          component={NavLink}
          to="/login"
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
          Sign in instead
        </Button>
      </Card>
    </Box>
  )
}

export default Signup
