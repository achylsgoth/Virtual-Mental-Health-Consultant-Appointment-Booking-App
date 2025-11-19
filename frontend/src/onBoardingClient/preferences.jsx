import React from "react";
import { TextField, Grid, MenuItem } from "@mui/material";

const PreferencesForm = ({ data, onChange }) => {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...data, [name]: value });
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <TextField
                    select
                    label="Preferred Therapist Gender"
                    name="therapistGender"
                    value={data.therapistGender}
                    onChange={handleInputChange}
                    fullWidth
                >
                    <MenuItem value="Any">Any</MenuItem>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                </TextField>
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label="Preferred Language"
                    name="preferredLanguage"
                    value={data.preferredLanguage}
                    onChange={handleInputChange}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label="Preferred Session Time"
                    name="preferredSessionTime"
                    type="time"
                    value={data.preferredSessionTime}
                    onChange={handleInputChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>
        </Grid>
    );
};

export default PreferencesForm;
