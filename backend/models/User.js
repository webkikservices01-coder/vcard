const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: { type: String, default: '' },
    lastName:  { type: String, default: '' },
    name:      { type: String, required: true },
    email:     { type: String, required: true, unique: true },
    phone:     { type: String, default: '' },
    password:  { type: String, required: true },
    plan:      { type: String, default: 'Free Trial' },
    planExpiry:{ type: Date, default: null },
    status:    { type: String, enum: ['active', 'inactive'], default: 'active' },
    cardLimit: { type: Number, default: 1 },
    isAdmin:   { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
