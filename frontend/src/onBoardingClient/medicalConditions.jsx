import React from "react";
import { TextField, Grid, Chip } from "@mui/material";

const MedicalHistoryForm = ({ data, onChange }) => {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...data, [name]: value });
    };

    const handleArrayChange = (name, value) => {
        onChange({ ...data, [name]: value.split(",").map(item => item.trim()) });
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <TextField
                    label="Medical Conditions"
                    name="conditions"
                    value={data.conditions.join(", ")}
                    onChange={(e) => handleArrayChange("conditions", e.target.value)}
                    fullWidth
                    helperText="Separate with commas"
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label="Medications"
                    name="medications"
                    value={data.medications.join(", ")}
                    onChange={(e) => handleArrayChange("medications", e.target.value)}
                    fullWidth
                    helperText="Separate with commas"
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label="Allergies"
                    name="allergies"
                    value={data.allergies.join(", ")}
                    onChange={(e) => handleArrayChange("allergies", e.target.value)}
                    fullWidth
                    helperText="Separate with commas"
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label="Last Updated"
                    name="lastUpdated"
                    type="date"
                    value={data.lastUpdated}
                    onChange={handleInputChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>
        </Grid>
    );
};

export default MedicalHistoryForm;
