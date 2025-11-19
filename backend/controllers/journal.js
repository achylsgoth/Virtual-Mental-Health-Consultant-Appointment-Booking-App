// controllers/journalController.js
const Client = require('../models/clientdb');

// Get all journals for a client
const getJournals = async (req, res) => {
  try {
    const clientId = req.userId; // Assuming user ID comes from auth middleware
    
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    res.status(200).json(client.journals);
  } catch (error) {
    console.error('Error fetching journals:', error);
    res.status(500).json({ message: 'Error fetching journals', error: error.message });
  }
};

// Get a specific journal by ID
const getJournalById = async (req, res) => {
  try {
    const clientId = req.userId;
    const journalId = req.params.journalId;
    
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    const journal = client.journals.id(journalId);
    if (!journal) {
      return res.status(404).json({ message: 'Journal not found' });
    }
    
    res.status(200).json(journal);
  } catch (error) {
    console.error('Error fetching journal:', error);
    res.status(500).json({ message: 'Error fetching journal', error: error.message });
  }
};

// Create a new journal entry
const createJournal = async (req, res) => {
  try {
    const clientId = req.userId;
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    const newJournal = {
      title,
      content,
      date: new Date()
    };
    
    client.journals.push(newJournal);
    await client.save();
    
    res.status(201).json(client.journals[client.journals.length - 1]);
  } catch (error) {
    console.error('Error creating journal:', error);
    res.status(500).json({ message: 'Error creating journal', error: error.message });
  }
};

// Update a journal entry
const updateJournal = async (req, res) => {
  try {
    const clientId = req.userId;
    const journalId = req.params.journalId;
    const { title, content } = req.body;
    
    if (!title && !content) {
      return res.status(400).json({ message: 'Title or content is required for update' });
    }
    
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    const journal = client.journals.id(journalId);
    if (!journal) {
      return res.status(404).json({ message: 'Journal not found' });
    }
    
    // Update fields if provided
    if (title) journal.title = title;
    if (content) journal.content = content;
    
    await client.save();
    
    res.status(200).json(journal);
  } catch (error) {
    console.error('Error updating journal:', error);
    res.status(500).json({ message: 'Error updating journal', error: error.message });
  }
};

// Delete a journal entry
const deleteJournal = async (req, res) => {
  try {
    const clientId = req.userId;
    const journalId = req.params.journalId;
    
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    const journal = client.journals.id(journalId);
    if (!journal) {
      return res.status(404).json({ message: 'Journal not found' });
    }
    
    client.journals.pull(journalId);
    await client.save();
    
    res.status(200).json({ message: 'Journal deleted successfully' });
  } catch (error) {
    console.error('Error deleting journal:', error);
    res.status(500).json({ message: 'Error deleting journal', error: error.message });
  }
};

// Get journals within a date range
const getJournalsByDateRange = async (req, res) => {
  try {
    const clientId = req.userId;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    const filteredJournals = client.journals.filter(journal => {
      const journalDate = new Date(journal.date);
      return journalDate >= start && journalDate <= end;
    });
    
    res.status(200).json(filteredJournals);
  } catch (error) {
    console.error('Error fetching journals by date range:', error);
    res.status(500).json({ message: 'Error fetching journals by date range', error: error.message });
  }
};

module.exports = {
  getJournals,
  getJournalById,
  createJournal,
  updateJournal,
  deleteJournal,
  getJournalsByDateRange
}