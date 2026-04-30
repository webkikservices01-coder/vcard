// const mongoose = require('mongoose');

// const vCardSchema = new mongoose.Schema({
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     username: { type: String, required: true, unique: true }, // Jaise: website.com/rahul
//     theme: { type: String, default: 'theme-one' },
//     personalInfo: {
//         name: String,
//         designation: String,
//         company: String,
//         bio: String,
//         profilePic: String,
//         bannerImage: String
//     },
//     contactDetails: {
//         phone: String,
//         email: String,
//         whatsapp: String,
//         address: String 
//     },
//     socialLinks: {
//         instagram: String,
//         linkedin: String,
//         facebook: String
//     },
//     services: [{ title: String, description: String, price: String }]
// }, { timestamps: true });

// module.exports = mongoose.model('vCard', vCardSchema);




const mongoose = require('mongoose');

const vCardSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true, unique: true }, // Jaise: mycardlink.site/marketer-esskay
    theme: { type: String, default: 'theme-one' },
    personalInfo: {
        name: String,
        designation: String,
        company: String,
        bio: String,
        profilePic: String,
        bannerImage: String
    },
    
    // YEH NAYA BLOCK HAI: Jo sabhi Social, Email, Phone aur Custom URLs ko dynamically save karega
    dynamicLinks: [{
        fieldType: String,
        title: String,
        url: String
    }],

    services: [{ title: String, description: String, price: String }],

    customTheme: {
        layout:            { type: String, default: 'classic' },
        bg:                { type: String, default: '#ffffff' },
        bgImage:           { type: String, default: '' },
        bannerColor:       { type: String, default: '#111827' },
        bannerImage:       { type: String, default: '' },
        nameColor:         { type: String, default: '#111827' },
        designationColor:  { type: String, default: '#6b7280' },
        contactBg:         { type: String, default: '#111827' },
        contactText:       { type: String, default: '#ffffff' },
        sectionBg:         { type: String, default: '#f9fafb' },
        border:            { type: String, default: '#e5e7eb' },
        accent:            { type: String, default: '#111827' },
    }
}, { timestamps: true });

module.exports = mongoose.model('vCard', vCardSchema);