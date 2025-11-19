import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Grid,
  Avatar,
  Button,
  Stack,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  FormControlLabel,
  Switch,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Divider,
  Tooltip
} from '@mui/material';
import {
  HomeOutlined,
  CalendarMonthOutlined,
  PeopleOutlined,
  MessageOutlined,
  AccessTimeOutlined,
  CheckCircleOutlined,
  StarOutlined,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Google as GoogleIcon,
  Sync as SyncIcon
} from '@mui/icons-material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import useTherapistStore from '../store/therapistStore';
import dayjs from "dayjs";
import Layout from "./layout";

// Component for the availability section
const AvailabilitySection = () => {
  const {
    availability,
    loading,
    error,
    therapist,
    fetchAuthenticatedAvailability=[],
    addUpdateAvailability,
    deleteAvailability
  } = useTherapistStore();

  // State for modals
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openImportModal, setOpenImportModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [googleConnected, setGoogleConnected] = useState(false);
  const [syncInProgress, setSyncInProgress] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    date: dayjs(),
    startTime: dayjs().hour(9).minute(0),
    endTime: dayjs().hour(10).minute(0),
    isAvailable: true,
    timezone: 'GMT'
  });

  // Import settings
  const [importSettings, setImportSettings] = useState({
    startDate: dayjs(),
    endDate: dayjs().add(30, 'day'),
    excludeWeekends: false,
    importBusyAsUnavailable: true
  });

  // Extract the authenticated therapist's availability slots
  const therapistAvailability = therapist && availability[therapist._id] ? availability[therapist._id] : {slots: []};
  const slots = Array.isArray(therapistAvailability.slots) ? therapistAvailability.slots : [];

  // Function to handle opening the create modal
  const handleOpenCreateModal = () => {
    setFormData({
      date: dayjs(),
      startTime: dayjs().hour(9).minute(0),
      endTime: dayjs().hour(10).minute(0),
      isAvailable: true,
      timezone: 'GMT'
    });
    setOpenCreateModal(true);
  };

  // Function to handle opening the update modal
  const handleOpenUpdateModal = (slot) => {
    setSelectedSlot(slot);
    const slotDate = dayjs(slot.startDateTime);
    setFormData({
      date: slotDate,
      startTime: slotDate,
      endTime: dayjs(slot.endDateTime),
      isAvailable: slot.isAvailable,
      timezone: slot.timezone || 'GMT'
    });
    setOpenUpdateModal(true);
  };

  // Function to handle opening the delete modal
  const handleOpenDeleteModal = (slot) => {
    setSelectedSlot(slot);
    setOpenDeleteModal(true);
  };

  // Function to handle opening the import modal
  const handleOpenImportModal = () => {
    setOpenImportModal(true);
  };

  // Function to handle form input changes
  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Function to handle import settings changes
  const handleImportSettingChange = (field, value) => {
    setImportSettings({
      ...importSettings,
      [field]: value
    });
  };

  // Function to handle Google Calendar connection
  const handleGoogleCalendarConnect = () => {
    console.log('Connecting to Google Calendar');
    const googleAuthUrl = 'http://localhost:5555/api/calendar/auth/google';
    
    // Open a popup window for OAuth authentication
    const authWindow = window.open(googleAuthUrl, '_blank', 'width=600,height=700');
    
    // Listen for messages from the popup window
    window.addEventListener('message', (event) => {
      if (event.origin === 'http://localhost:5555' && event.data && event.data.type === 'google-auth-success') {
        // Close the popup
        if (authWindow) authWindow.close();
        
        // Update state and show success message
        setGoogleConnected(true);
        setSnackbar({
          open: true,
          message: 'Successfully connected to Google Calendar!',
          severity: 'success'
        });
        
        // Open import modal after successful connection
        handleOpenImportModal();
      }
    }, { once: true });
  };

  // Function to sync with Google Calendar
  const handleSyncWithGoogleCalendar = async () => {
    try {
      setSyncInProgress(true);
      
      // Mock API call - replace with actual API call
      console.log('Syncing with Google Calendar with settings:', importSettings);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Close the modal and show success message
      setOpenImportModal(false);
      setSyncInProgress(false);
      setSnackbar({
        open: true,
        message: 'Successfully synced with Google Calendar!',
        severity: 'success'
      });
      
      // Refresh the availability data
      fetchAuthenticatedAvailability(therapist._id);
    } catch (error) {
      console.error('Error syncing with Google Calendar:', error);
      setSyncInProgress(false);
      setSnackbar({
        open: true,
        message: 'Failed to sync with Google Calendar.',
        severity: 'error'
      });
    }
  };

  // Function to create a new availability slot
  const handleCreateSlot = async () => {
    try {
      // Create the start and end date times
      const startDateTime = formData.date
        .hour(formData.startTime.hour())
        .minute(formData.startTime.minute())
        .second(0)
        .millisecond(0);
      
      const endDateTime = formData.date
        .hour(formData.endTime.hour())
        .minute(formData.endTime.minute())
        .second(0)
        .millisecond(0);

      // Prepare the data for the API call
      const newSlot = {
        slots: [
          {
            startDateTime: startDateTime.toISOString(),
            endDateTime: endDateTime.toISOString(),
            isAvailable: formData.isAvailable
          }
        ],
        timezone: formData.timezone,
        isAvailable: formData.isAvailable
      };

      // Call the API to create the slot
      await addUpdateAvailability(newSlot);
      
      // Close the modal and show success message
      setOpenCreateModal(false);
      setSnackbar({
        open: true,
        message: 'Availability slot created successfully!',
        severity: 'success'
      });
      
      // Refresh the availability data
      await fetchAuthenticatedAvailability();
    } catch (error) {
      console.error('Error creating availability slot:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create availability slot.',
        severity: 'error'
      });
    }
  };

  // Function to update an existing availability slot
  const handleUpdateSlot = async () => {
    try {
      // Create the start and end date times
      const startDateTime = formData.date
        .hour(formData.startTime.hour())
        .minute(formData.startTime.minute())
        .second(0)
        .millisecond(0);
      
      const endDateTime = formData.date
        .hour(formData.endTime.hour())
        .minute(formData.endTime.minute())
        .second(0)
        .millisecond(0);

      // Prepare the data for the API call
      const updatedSlot = {
        slots: [
          {
            startDateTime: startDateTime.toISOString(),
            endDateTime: endDateTime.toISOString(),
            isAvailable: formData.isAvailable
          }
        ],
        timezone: formData.timezone,
        isAvailable: formData.isAvailable
      };

      // Call the API to update the slot
      await addUpdateAvailability(updatedSlot);
      
      // Close the modal and show success message
      setOpenUpdateModal(false);
      setSnackbar({
        open: true,
        message: 'Availability slot updated successfully!',
        severity: 'success'
      });
      
      // Refresh the availability data
      fetchAuthenticatedAvailability();
    } catch (error) {
      console.error('Error updating availability slot:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update availability slot.',
        severity: 'error'
      });
    }
  };

  // Function to delete an availability slot
  const handleDeleteSlot = async () => {
    try {
      // Call the API to delete the slot
      await deleteAvailability(selectedSlot.startDateTime);
      
      // Close the modal and show success message
      setOpenDeleteModal(false);
      setSnackbar({
        open: true,
        message: 'Availability slot deleted successfully!',
        severity: 'success'
      });
      
      // Refresh the availability data
      await fetchAuthenticatedAvailability();
    } catch (error) {
      console.error('Error deleting availability slot:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete availability slot.',
        severity: 'error'
      });
    }
  };

  // Function to close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };


  // Availability section content
  return (
    <Grid item xs={12} md={6}>
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
          Available Time Slots
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title={googleConnected ? "Sync with Google Calendar" : "Connect Google Calendar"}>
            <Button
              variant="outlined"
              startIcon={googleConnected ? <SyncIcon /> : <GoogleIcon />}
              onClick={googleConnected ? handleOpenImportModal : handleGoogleCalendarConnect}
              sx={{
                borderColor: googleConnected ? 'success.main' : 'primary.main',
                color: googleConnected ? 'success.main' : 'primary.main',
                '&:hover': {
                  backgroundColor: googleConnected ? 'rgba(46, 125, 50, 0.04)' : 'rgba(0, 0, 0, 0.04)',
                  borderColor: googleConnected ? 'success.dark' : 'primary.dark',
                }
              }}
            >
              {googleConnected ? "Sync Calendar" : "Connect Google"}
            </Button>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateModal}
            sx={{
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark',
              }
            }}
          >
            Add Slot
          </Button>
        </Box>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Typography color="error">{error}</Typography>}

      {!loading && !error && slots.length > 0 ? (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          {slots.map((slot, index) => (
            <Card
              key={index}
              sx={{
                minWidth: 120,
                maxWidth: 150,
                boxShadow: 2,
                border: "1px solid",
                borderColor: slot.isAvailable ? "primary.light" : "grey.300",
                borderRadius: 2,
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "pointer",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: 4,
                  borderColor: slot.isAvailable ? "primary.main" : "grey.400"
                },
                position: "relative",
                opacity: slot.isAvailable ? 1 : 0.75
              }}
              onClick={() => handleOpenUpdateModal(slot)}
            >
              <CardContent sx={{ textAlign: "center", p: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Box sx={{
                  backgroundColor: slot.isAvailable ? "primary.light" : "grey.200",
                  py: 0.5,
                  borderRadius: 1,
                  mb: 1.5,
                  color: slot.isAvailable ? "primary.dark" : "text.secondary"
                }}>
                  <Typography variant="body2" fontWeight="bold">
                    {dayjs(slot.startDateTime).format("MMM D, YYYY")}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 0.5 }}>
                  <AccessTimeOutlined sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary">
                    {dayjs(slot.startDateTime).format("HH:mm")} - {dayjs(slot.endDateTime).format("HH:mm")}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{
                  display: "inline-block",
                  backgroundColor: slot.isAvailable ? "success.light" : "error.light",
                  color: slot.isAvailable ? "success.dark" : "error.dark",
                  px: 1,
                  py: 0.25,
                  borderRadius: 5,
                  mt: 0.5
                }}>
                  {slot.isAvailable ? "Available" : "Unavailable"}
                </Typography>
                <IconButton
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 5,
                    right: 5,
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDeleteModal(slot);
                  }}
                >
                  <DeleteIcon fontSize="small" sx={{ color: "error.main" }} />
                </IconButton>
              </CardContent>
            </Card>
          ))}
          <Card
            sx={{
              minWidth: 120,
              maxWidth: 150,
              height: "100%",
              boxShadow: 1,
              border: "1px dashed",
              borderColor: "grey.400",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              backgroundColor: "grey.50",
              transition: "background-color 0.2s",
              "&:hover": {
                backgroundColor: "grey.100",
              },
            }}
            onClick={handleOpenCreateModal}
          >
            <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 1.5 }}>
              <Box sx={{ border: "1px solid", borderColor: "grey.400", borderRadius: "50%", p: 1, mb: 1 }}>
                <AddIcon sx={{ color: "grey.600" }} />
              </Box>
              <Typography variant="body2" color="text.secondary" align="center">
                Add new slot
              </Typography>
            </CardContent>
          </Card>
        </Box>
      ) : (
        !loading && !error &&
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 4, bgcolor: "grey.50", borderRadius: 2, border: "1px dashed", borderColor: "grey.300" }}>
          <CalendarMonthOutlined sx={{ fontSize: 40, color: "grey.500", mb: 2 }} />
          <Typography variant="body1" sx={{ mb: 2, color: "text.secondary" }}>No available slots found.</Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleCalendarConnect}
              sx={{
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              Import from Google
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateModal}
              sx={{
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                }
              }}
            >
              Create Your First Slot
            </Button>
          </Stack>
        </Box>
      )}

        {/* Create Slot Modal */}
        <Dialog open={openCreateModal} onClose={() => setOpenCreateModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              Create New Availability Slot
              <IconButton onClick={() => setOpenCreateModal(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ mt: 2 }}>
                <DatePicker
                  label="Date"
                  value={formData.date}
                  onChange={(newValue) => handleInputChange('date', newValue)}
                  slots={{ textField: TextField }}
                  slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
                  sx={{ width: '100%', mb: 2 }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TimePicker
                  label="Start Time"
                  value={formData.startTime}
                  onChange={(newValue) => handleInputChange('startTime', newValue)}
                  slots={{ textField: TextField }}
                  slotProps={{ textField: { fullWidth: true } }}
                  sx={{ width: '50%' }}
                />
                <TimePicker
                  label="End Time"
                  value={formData.endTime}
                  onChange={(newValue) => handleInputChange('endTime', newValue)}
                  slots={{ textField: TextField }}
                  slotProps={{ textField: { fullWidth: true } }}
                  sx={{ width: '50%' }}
                />
              </Box>
            </LocalizationProvider>
            <FormControl fullWidth margin="normal">
              <InputLabel>Timezone</InputLabel>
              <Select
                value={formData.timezone}
                label="Timezone"
                onChange={(e) => handleInputChange('timezone', e.target.value)}
              >
                <MenuItem value="GMT">GMT</MenuItem>
                <MenuItem value="EST">EST</MenuItem>
                <MenuItem value="PST">PST</MenuItem>
                <MenuItem value="CST">CST</MenuItem>
                <MenuItem value="MST">MST</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isAvailable}
                    onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
                    color="primary"
                  />
                }
                label="Available"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreateModal(false)} color="inherit">
              Cancel
            </Button>
            <Button onClick={handleCreateSlot} variant="contained" color="primary">
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Update Slot Modal */}
        <Dialog open={openUpdateModal} onClose={() => setOpenUpdateModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              Update Availability Slot
              <IconButton onClick={() => setOpenUpdateModal(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ mt: 2 }}>
                <DatePicker
                  label="Date"
                  value={formData.date}
                  onChange={(newValue) => handleInputChange('date', newValue)}
                  slots={{ textField: TextField }}
                  slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
                  sx={{ width: '100%', mb: 2 }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TimePicker
                  label="Start Time"
                  value={formData.startTime}
                  onChange={(newValue) => handleInputChange('startTime', newValue)}
                  slots={{ textField: TextField }}
                  slotProps={{ textField: { fullWidth: true } }}
                  sx={{ width: '50%' }}
                />
                <TimePicker
                  label="End Time"
                  value={formData.endTime}
                  onChange={(newValue) => handleInputChange('endTime', newValue)}
                  slots={{ textField: TextField }}
                  slotProps={{ textField: { fullWidth: true } }}
                  sx={{ width: '50%' }}
                />
              </Box>
            </LocalizationProvider>
            <FormControl fullWidth margin="normal">
              <InputLabel>Timezone</InputLabel>
              <Select
                value={formData.timezone}
                label="Timezone"
                onChange={(e) => handleInputChange('timezone', e.target.value)}
              >
                <MenuItem value="GMT">GMT</MenuItem>
                <MenuItem value="EST">EST</MenuItem>
                <MenuItem value="PST">PST</MenuItem>
                <MenuItem value="CST">CST</MenuItem>
                <MenuItem value="MST">MST</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isAvailable}
                    onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
                    color="primary"
                  />
                }
                label="Available"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => handleOpenDeleteModal(selectedSlot)} 
              color="error" 
              startIcon={<DeleteIcon />}
              sx={{ marginRight: 'auto' }}
            >
              Delete
            </Button>
            <Button onClick={() => setOpenUpdateModal(false)} color="inherit">
              Cancel
            </Button>
            <Button onClick={handleUpdateSlot} variant="contained" color="primary">
              Update
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              Delete Availability Slot
              <IconButton onClick={() => setOpenDeleteModal(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this availability slot?
            </Typography>
            {selectedSlot && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Date:</strong> {dayjs(selectedSlot.startDateTime).format("MMM D, YYYY")}
                </Typography>
                <Typography variant="body2">
                  <strong>Time:</strong> {dayjs(selectedSlot.startDateTime).format("HH:mm")} - {dayjs(selectedSlot.endDateTime).format("HH:mm")}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong> {selectedSlot.isAvailable ? "Available" : "Unavailable"}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteModal(false)} color="inherit">
              Cancel
            </Button>
            <Button onClick={handleDeleteSlot} variant="contained" color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Google Calendar Import Modal */}
        <Dialog open={openImportModal} onClose={() => setOpenImportModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              Import from Google Calendar
              <IconButton onClick={() => setOpenImportModal(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <GoogleIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body1" sx={{ color: 'success.main', fontWeight: 'medium' }}>
                Google Calendar Connected
              </Typography>
            </Box>
            
            <Typography variant="body2" paragraph sx={{ mb: 3 }}>
              Select a date range to import your Google Calendar events. Your busy times can be automatically marked as unavailable slots.
            </Typography>
            
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <DatePicker
                  label="Start Date"
                  value={importSettings.startDate}
                  onChange={(newValue) => handleImportSettingChange('startDate', newValue)}
                  slots={{ textField: TextField }}
                  slotProps={{ textField: { fullWidth: true } }}
                  sx={{ width: '50%' }}
                />
                <DatePicker
                  label="End Date"
                  value={importSettings.endDate}
                  onChange={(newValue) => handleImportSettingChange('endDate', newValue)}
                  slots={{ textField: TextField }}
                  slotProps={{ textField: { fullWidth: true } }}
                  sx={{ width: '50%' }}
                />
              </Box>
            </LocalizationProvider>
            
            <FormControlLabel
              control={
                <Switch
                  checked={importSettings.excludeWeekends}
                  onChange={(e) => handleImportSettingChange('excludeWeekends', e.target.checked)}
                  color="primary"
                />
              }
              label="Exclude weekends"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={importSettings.importBusyAsUnavailable}
                  onChange={(e) => handleImportSettingChange('importBusyAsUnavailable', e.target.checked)}
                  color="primary"
                />
              }
              label="Mark busy times as unavailable"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenImportModal(false)} color="inherit">
              Cancel
            </Button>
            <Button 
              onClick={handleSyncWithGoogleCalendar} 
              variant="contained" 
              color="primary"
              disabled={syncInProgress}
              startIcon={syncInProgress ? <CircularProgress size={20} color="inherit" /> : <SyncIcon />}
            >
              {syncInProgress ? "Syncing..." : "Sync Calendar"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Grid>
  );
};

export default AvailabilitySection;