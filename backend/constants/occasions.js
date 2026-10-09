// Digital Invites: one system for every occasion (weddings, engagements, birthdays, Diwali …).
// Each design (constants/weddingTemplates.js) belongs to one occasion; the occasion decides the
// words used in emails, link previews and the AI assistant. Keep in sync with
// FRONTEND/src/wedding/data/occasions.ts.
const OCCASIONS = {
  wedding: { label: 'Wedding', invite: 'wedding invitation', event: 'wedding', hosts: 'the couple', manager: 'Your Wedding Manager', couple: true, rsvp: true },
  engagement: { label: 'Engagement', invite: 'engagement invitation', event: 'engagement', hosts: 'the couple', manager: 'Your Engagement Host', couple: true, rsvp: true },
  anniversary: { label: 'Anniversary', invite: 'anniversary invitation', event: 'anniversary celebration', hosts: 'the couple', manager: 'Your Anniversary Host', couple: true, rsvp: true },
  birthday: { label: 'Birthday', invite: 'birthday invitation', event: 'birthday party', hosts: 'the host', manager: 'Your Party Host', couple: false, rsvp: true },
  diwali: { label: 'Diwali Party', invite: 'Diwali invitation', event: 'Diwali celebration', hosts: 'the host family', manager: 'Your Diwali Host', couple: false, rsvp: true },
  housewarming: { label: 'Griha Pravesh', invite: 'housewarming invitation', event: 'Griha Pravesh (housewarming)', hosts: 'the host family', manager: 'Your Griha Pravesh Host', couple: false, rsvp: true },
  babyshower: { label: 'Baby Shower', invite: 'baby shower invitation', event: 'baby shower (Godh Bharai)', hosts: 'the parents-to-be', manager: 'Your Baby Shower Host', couple: true, rsvp: true },
  wishes: { label: 'Festival Wishes', invite: 'festival greeting', event: 'festival greeting', hosts: 'the sender', manager: 'Your Greeting Helper', couple: false, rsvp: false },
};

module.exports = { OCCASIONS };
