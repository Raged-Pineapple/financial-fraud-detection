const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  id: String,
  account_id: String,
  transaction_id: String,
  amount: Number,
  asset: String,
  timestamp: Date,
  suspicion: {
    reason: String,
    detection_score: Number,
    detection_method: String,
    rule_triggered: String
  },
  status: {
    type: String,
    enum: ['Flagged', 'Cleared', 'Blocked'],
    default: 'Flagged'
  },
  review: {
    reviewed_by: String,
    reviewed_at: Date,
    notes: String
  },
  meta: {
    source_account: String,
    destination_account: String
  },
  // New fields for block and warn functionality
  action: {
    type: String,
    enum: ['none', 'block', 'warn'],
    default: 'none'
  },
  action_details: {
    actioned_by: String,
    actioned_at: {
      type: Date,
      default: null
    },
    action_notes: String
  }
});

// Pre-save middleware to update status when action is 'block'
TransactionSchema.pre('save', function(next) {
  if (this.action === 'block' && this.status !== 'Blocked') {
    this.status = 'Blocked';
  }
  next();
});

module.exports = mongoose.model('Transaction', TransactionSchema, 'report');
