import {Button,Box } from '@mui/material';
import StartIcon from '@mui/icons-material/Start';
import Visibility from '@mui/icons-material/Visibility';
import {maxWidth, sizing} from '@mui/system';

export default function Submit(){
    return(
        <Box
        sx={{
          display: 'flex',
          gap: 2, // Adds space between the buttons
        }}
      >
            <Button variant="contained" startIcon={<Visibility/>} disabled sx={{ flex: 1 }} size='large'>Show Result </Button> 
            <Button variant="contained" startIcon={<StartIcon/>} sx={{ flex: 1}} size='large' >Reconstruct</Button>
        </Box>
    )
}