import TextField from '@mui/material/TextField';

export default function Normalisation(){
    function normalise(){
        return (
            <>
            <TextField id="normalise--averaging--input" label="Data" variant="outlined" required helperText="Amount of averaging"/>
            <TextField id="normalise--cutoff--input" label="Data" variant="outlined" required helperText="Amount of cutoff"/>
            </>
        )
    }
    return(
        <>        
        {normalise()}
        </>

    )
    
}