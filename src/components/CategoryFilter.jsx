import { Box, Chip, Typography } from '@mui/material'

function CategoryFilter({ categories, selected, onSelect }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
      <Typography variant="subtitle2" sx={{ minWidth: 90 }}>
        Filter:
      </Typography>
      <Chip
        label="All"
        variant={selected === 'all' ? 'filled' : 'outlined'}
        onClick={() => onSelect('all')}
      />
      {categories.map((category) => (
        <Chip
          key={category}
          label={category}
          variant={selected === category ? 'filled' : 'outlined'}
          onClick={() => onSelect(category)}
        />
      ))}
    </Box>
  )
}

export default CategoryFilter
