import React from "react";
import { TextField, Grid } from "@mui/material";

const EmergencyContactForm = ({ data, onChange }) => {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...data, [name]: value });
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <TextField
                    label="Name"
                    name="name"
                    value={data.name}
                    onChange={handleInputChange}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label="Relationship"
                    name="relationship"
                    value={data.relationship}
                    onChange={handleInputChange}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label="Phone Number"
                    name="phoneNumber"
                    value={data.phoneNumber}
                    onChange={handleInputChange}
                    fullWidth
                />
            </Grid>
        </Grid>
    );
};

export default EmergencyContactForm;
