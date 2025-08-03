import { LinearProgress } from '@mui/material'
import Box from '@mui/material/Box'

export default function SplashScreenServer() {
  return (
    <Box position="relative" top="50%" mt="-2px">
      <Box maxWidth={{ xs: '70%', md: '50%', lg: '15%', xl: '10%' }} mx="auto">
        <LinearProgress sx={{ height: 4, bgcolor: 'grey.50016' }} />
      </Box>
    </Box>
  )
}
