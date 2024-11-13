import Grid  from '@mui/material/Grid2';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';

export default function Normalisation(){
    function normalise(){
        return (
            <Grid container spacing={2}>
                <Grid size={12}>
                    Normalise
                    <Divider variant="middle" />
                </Grid>
                <Grid size={6}>
                <TextField id="normalise--averaging--input" size="small" label="Data" variant="outlined" required  helperText="Amount of averaging" fullWidth/>
                </Grid>
                <Grid size={6}>
                <TextField id="normalise--cutoff--input" size="small" label="Data" variant="outlined" required helperText="Amount of cutoff" fullWidth/>
                </Grid>
                
            </Grid>
        )
    }
    return(
        <>        
        {normalise()}
        </>

    )
    
}