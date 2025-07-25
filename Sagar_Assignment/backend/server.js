const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'feedback.json');

// Initialize feedback data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Helper function to read feedback
const readFeedback = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading feedback file:', err);
    return [];
  }
};

// Helper function to write feedback
const writeFeedback = (feedback) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(feedback, null, 2));
  } catch (err) {
    console.error('Error writing feedback file:', err);
  }
};

// Routes
app.get('/feedback', (req, res) => {
  const feedback = readFeedback();
  res.json(feedback);
});

app.post('/feedback', (req, res) => {
  const { name, email, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  const feedback = readFeedback();
  const newFeedback = {
    id: Date.now().toString(),
    name,
    email,
    message,
    votes: 0
  };
  
  feedback.push(newFeedback);
  writeFeedback(feedback);
  
  res.status(201).json(newFeedback);
});

app.put('/feedback/:id/vote', (req, res) => {
  const { id } = req.params;
  const { direction } = req.body;
  
  if (direction !== 'up' && direction !== 'down') {
    return res.status(400).json({ error: 'Invalid vote direction' });
  }

  const feedback = readFeedback();
  const index = feedback.findIndex(item => item.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Feedback not found' });
  }
  
  feedback[index].votes += direction === 'up' ? 1 : -1;
  writeFeedback(feedback);
  
  res.json(feedback[index]);
});

app.delete('/feedback/:id', (req, res) => {
  const { id } = req.params;
  let feedback = readFeedback();
  
  const initialLength = feedback.length;
  feedback = feedback.filter(item => item.id !== id);
  
  if (feedback.length === initialLength) {
    return res.status(404).json({ error: 'Feedback not found' });
  }
  
  writeFeedback(feedback);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});