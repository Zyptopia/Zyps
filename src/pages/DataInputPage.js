import React, { useState, useEffect } from 'react';
import { db } from '../firebase';  // Import Firestore instance
import { collection, addDoc } from 'firebase/firestore';  // Import addDoc to add new document to Firestore

const DataInputPage = () => {
  const [date, setDate] = useState('');
  const [reward, setReward] = useState('');
  const [tokens, setTokens] = useState('');
  const [rewardPerToken, setRewardPerToken] = useState(''); // Reward for 1,000,000 tokens

  // Calculate reward for 1,000,000 tokens automatically whenever 'reward' or 'tokens' changes
  useEffect(() => {
    if (tokens && reward) {
      const calculatedReward = (reward / tokens) * 1000000; // Formula to calculate reward for 1,000,000 tokens
      setRewardPerToken(calculatedReward); // Update the rewardPerToken state
    }
  }, [reward, tokens]); // Only re-run when reward or tokens change

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Add data to Firestore using the addDoc function from Firebase
      const rewardsCollection = collection(db, 'rewards');
      await addDoc(rewardsCollection, {
        date,
        reward,
        tokens,
        rewardPerToken
      });
    
      // Clear form after submit
      setDate('');
      setReward('');
      setTokens('');
      setRewardPerToken('');
    } catch (error) {
      console.error("Error adding document: ", error); // Handle errors in Firestore operation
    }
  };

  return (
    <div className="page-content">
      <h1>Enter New Reward Data</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label>Reward:</label>
          <input
            type="number"
            placeholder="Reward"
            value={reward}
            onChange={(e) => setReward(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label>Tokens:</label>
          <input
            type="number"
            placeholder="Tokens"
            value={tokens}
            onChange={(e) => setTokens(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label>Reward for 1,000,000 Tokens:</label>
          <input
            type="number"
            placeholder="Reward for 1,000,000 tokens"
            value={rewardPerToken || ''} // Display the calculated reward
            readOnly
          />
        </div>
        
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default DataInputPage;
