import SearchIcon from '@mui/icons-material/Search'
import { InputAdornment, TextField } from '@mui/material'

function SearchBar({ value, onChange }) {
  return (
    <TextField
      fullWidth
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search products by name…"
      aria-label="Search products"
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
            </InputAdornment>
          ),
        },
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          fontSize: '0.9375rem',
          '& input::placeholder': { color: '#94A3B8', opacity: 1 },
        },
      }}
    />
  )
}

export default SearchBar
