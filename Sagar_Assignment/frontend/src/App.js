import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const API_URL = 'http://localhost:5000/feedback';

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch feedback');
      const data = await response.json();
      setFeedbackList(data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to submit feedback');

      const newFeedback = await response.json();
      setFeedbackList(prev => [...prev, newFeedback]);
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleVote = async (id, direction) => {
    try {
      const response = await fetch(`${API_URL}/${id}/vote`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ direction }),
      });

      if (!response.ok) throw new Error('Failed to update vote');

      const updatedFeedback = await response.json();
      setFeedbackList(prev =>
        prev.map(item => item.id === id ? updatedFeedback : item)
      );
    } catch (error) {
      console.error('Error updating vote:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete feedback');

      setFeedbackList(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  return (
    <div className="app">
      <h1>Feedback Tracker</h1>
      
      <div className="feedback-form">
        <h2>Submit Feedback</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Message:</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <button type="submit">Submit</button>
        </form>
      </div>
      
      <div className="feedback-list">
        <h2>Feedback Entries</h2>
        {feedbackList.length === 0 ? (
          <p>No feedback yet. Be the first to submit!</p>
        ) : (
          <ul>
            {feedbackList.map(item => (
              <li key={item.id} className="feedback-item">
                <div className="feedback-content">
                  <h3>{item.name}</h3>
                  <p>{item.message}</p>
                  <p className="email">{item.email}</p>
                </div>
                <div className="feedback-actions">
                  <div className="vote-buttons">
                    <button onClick={() => handleVote(item.id, 'up')}>👍</button>
                    <span className="vote-count">{item.votes}</span>
                    <button onClick={() => handleVote(item.id, 'down')}>👎</button>
                  </div>
                  <button 
                    className="delete-button"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;