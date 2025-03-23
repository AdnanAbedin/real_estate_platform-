# Real Estate Platform

A full-stack real estate platform with advanced features and Firebase sync.

## Features
- Filter properties by real estate company (CRUD, PostgreSQL + Firebase sync)
- Banner ad system for admins (CRUD, PostgreSQL + Firebase sync)
- Premium property tier (top-ranked listings)
- WhatsApp inquiry tracking (PostgreSQL + Firebase sync)
- Fixed price update bug (consistent PostgreSQL & Firebase sync)

## Setup
1. Clone the repo: `git clone https://github.com/AdnanAbedin/real_estate_platform-.git`
2. Install dependencies: `npm install`
3. Backend: `cd backend && npm run dev`
4. Frontend: `npm run dev`

## WhatsApp Inquiry Check
1. Navigate to the Properties page and select a property.
2. In the "Contact Agent via WhatsApp" section, enter a phone number and send a message.
3. On the Admin page, go to "Agent Performance," view pending messages, select one, and send a response.  
   - All data is stored in PostgreSQL and synced with Firebase.
  
## Demo
- WhatsApp Feature: [Demo Video](https://drive.google.com/drive/folders/1fQLeb8D1ah_TqQmCFl7UDJ3XcQNpt8mM?usp=sharing)

## Tech Stack
- Backend: Node.js, PostgreSQL, Firebase
- Frontend: React.js

## Notes
- WhatsApp message demo available (no subscription required).
- Full Firebase sync implemented for real-time updates.
- Contact for issues or demo.
