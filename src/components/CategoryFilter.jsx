import { Box, Chip, Typography } from '@mui/material'

function CategoryFilter({ categories, selected, onSelect }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
      <Typography
        variant="caption"
        fontWeight={700}
        color="text.secondary"
        sx={{ minWidth: 56, letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '0.7rem' }}
      >
        Filter:
      </Typography>
      <Chip
        label="All"
        onClick={() => onSelect('all')}
        variant={selected === 'all' ? 'filled' : 'outlined'}
        color={selected === 'all' ? 'primary' : 'default'}
        size="small"
        sx={{
          fontWeight: selected === 'all' ? 700 : 500,
          cursor: 'pointer',
          '&:hover': { opacity: 0.88 },
        }}
      />
      {categories.map((category) => (
        <Chip
          key={category}
          label={category}
          onClick={() => onSelect(category)}
          variant={selected === category ? 'filled' : 'outlined'}
          color={selected === category ? 'primary' : 'default'}
          size="small"
          sx={{
            fontWeight: selected === category ? 700 : 500,
            textTransform: 'capitalize',
            cursor: 'pointer',
            '&:hover': { opacity: 0.88 },
          }}
        />
      ))}
    </Box>
  )
}

export default CategoryFilter
