const express = require('express');
const router = express.Router();
const Transaction = require('../models/transaction');

// Get all flagged accounts
router.get('/flagged-accounts', async (req, res) => {
    try {
        // More flexible query to match any status that might be "Flagged"
        const flaggedAccounts = await Transaction.find({ 
            status: { $regex: /flagged/i } 
        }).sort({ timestamp: -1 });
        
        console.log(`Found ${flaggedAccounts.length} flagged accounts`);
        
        // If still getting 0 results after regex, try this more permissive query
        if (flaggedAccounts.length === 0) {
            const allAccounts = await Transaction.find({}).limit(10);
            console.log(`DEBUG: Found ${allAccounts.length} total accounts`);
            console.log(`DEBUG: Sample account:`, allAccounts.length > 0 ? allAccounts[0] : 'None');
            res.json(allAccounts);
        } else {
            res.json(flaggedAccounts);
        }
    } catch (error) {
        console.error('Error fetching flagged accounts:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Block a transaction
router.post('/transactions/block', async (req, res) => {
    try {
        const { transactionId } = req.body;
        
        if (!transactionId) {
            return res.status(400).json({ message: 'Transaction ID is required' });
        }
        
        const transaction = await Transaction.findOneAndUpdate(
            { transaction_id: transactionId },
            { 
                $set: { 
                    action: 'block',
                    'action_details.actioned_by': 'admin',
                    'action_details.actioned_at': new Date(),
                    status: 'Blocked'
                } 
            },
            { new: true }
        );
        
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        
        res.json(transaction);
    } catch (error) {
        console.error('Error blocking transaction:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Warn about a transaction
router.post('/transactions/warn', async (req, res) => {
    try {
        const { transactionId } = req.body;
        
        if (!transactionId) {
            return res.status(400).json({ message: 'Transaction ID is required' });
        }
        
        const transaction = await Transaction.findOneAndUpdate(
            { transaction_id: transactionId },
            { 
                $set: { 
                    action: 'warn',
                    'action_details.actioned_by': 'admin',
                    'action_details.actioned_at': new Date()
                } 
            },
            { new: true }
        );
        
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        
        res.json(transaction);
    } catch (error) {
        console.error('Error warning about transaction:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
