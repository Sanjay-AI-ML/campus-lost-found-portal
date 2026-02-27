📦 Campus Lost & Found Portal

A full-stack web application built to digitize and streamline the campus lost-and-found process.

This system enables students to report lost or found items, submit structured claim requests, verify ownership using a 3-clue validation system, and maintain a permanent record of verified owners. It also includes a credit score system that rewards responsible finders.

🚀 Tech Stack

Frontend

HTML

Bootstrap 5

JavaScript (Fetch API)

Backend

Python

Flask

Flask-CORS

Database

Firebase Firestore (Cloud NoSQL Database)

🎯 Core Features
1️⃣ Item Reporting

Post Lost Items

Post Found Items

Categorize items

Store contact details

2️⃣ 3-Clue Claim Verification System

Owner submits:

Name

Contact

3 identifying clues

Finder manually verifies the clues

Prevents false claims

Real-world workflow simulation

3️⃣ Multi-Step Status Workflow

Each item transitions through structured states:

active

claim_pending

resolved

This ensures controlled resolution and accountability.

4️⃣ Verified Owner Record Keeping

Once approved:

Claim data is moved to verified_owner

Resolution timestamp is stored

Claim request is removed

Permanent audit trail maintained

5️⃣ Finder Credit Score System

To encourage ethical behavior:

Each successful verified return increases finder credit score.

Tracks:

Total items returned

Credit score points

Badge levels:

🥉 Bronze

🥈 Silver

🥇 Gold

Items can optionally be sorted based on finder trust score.

6️⃣ Category-Based Sorting

Users can filter items by category:

Electronics

Books

Accessories

ID Cards

Bags

Others

Backend supports query-based filtering.

7️⃣ Basic Login System (Hackathon Version)

User Registration

Login

Role-based access:

Finder

Owner

Simple session handling using frontend storage

🧠 System Architecture
Frontend (Bootstrap UI)
        ↓
Fetch API Calls
        ↓
Flask REST API
        ↓
Firebase Firestore
🗂 Database Structure
Collection: items
title
description
category
location
type (lost / found)
contact
status (active / claim_pending / resolved)
timestamp

claim_request:
    name
    contact
    clue1
    clue2
    clue3

verified_owner:
    name
    contact
    clue1
    clue2
    clue3
    resolved_at
Collection: users
name
email
password
role
credit_score
total_items_returned
⚙️ Installation & Setup
1️⃣ Clone Repository
git clone <your-repo-link>
cd campus-lost-found
2️⃣ Install Dependencies
pip install flask firebase-admin flask-cors
3️⃣ Firebase Setup

Create project at Firebase Console

Enable Firestore Database

Generate Service Account Key

Download JSON file

Rename to:

serviceAccountKey.json

Place it in project root directory

4️⃣ Run Application
python app.py

Server runs at:

http://127.0.0.1:5000
📌 API Endpoints
Add Item
POST /add_item
Get Items
GET /get_items
GET /get_items?category=Electronics
Submit Claim
POST /claim_item/<item_id>
Approve Claim
PUT /approve_claim/<item_id>
Reject Claim
PUT /reject_claim/<item_id>
Register
POST /register
Login
POST /login
🎨 UI Features

Bootstrap Card Layout

Status Badges

Dynamic Filtering

Conditional Rendering

Role-Based Controls

🏆 What Makes This Project Strong

Real-world problem solving

Multi-step workflow modeling

Manual verification logic

Cloud database integration

Role-based system design

Reputation / credit score implementation

Clean REST API architecture

📈 Future Improvements

Password hashing

JWT authentication

Email verification

Real-time updates using Firebase listeners

Admin dashboard

Analytics panel

File/image upload support
