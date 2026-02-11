# Hostel Complaint Management System

## Project Overview

The **Hostel Complaint Management System** is a full‑stack web application developed to digitize and streamline the process of registering, tracking, and resolving hostel‑related complaints. The system replaces the existing manual and fragmented complaint mechanism with a centralized, transparent, and efficient platform for students and hostel administration.

This project was developed as an **academic group project (Team 12)** and focuses on improving operational efficiency, communication, and facility management within college hostels.

---

## Problem Statement

Traditional hostel complaint handling systems suffer from:

* Lack of a centralized platform
* Slow complaint resolution
* Poor tracking and prioritization of issues
* Communication gaps between students and administrators

These issues result in delayed maintenance, low transparency, and inefficient administrative workflows. This system addresses these challenges through automation and real‑time tracking.

---

## Objectives

* Manage complaint records efficiently
* Enable real‑time complaint status tracking
* Ensure faster issue resolution
* Improve overall hostel facility management
* Enhance communication between students and administration

---

## Key Features

### Student Module

* Secure user authentication
* Complaint submission with category and description
* Real‑time status tracking (Submitted → In Progress → Resolved)
* Complaint history view

### Admin / Warden Module

* Dashboard to view and manage all complaints
* Assign complaints to maintenance teams
* Update complaint status
* Monitor resolution efficiency

### System Features

* Role‑based access control
* Notifications on status updates
* Centralized digital complaint records

---

## Technology Stack

### Frontend

* React.js
* TypeScript
* Responsive UI (PWA-ready)

### Backend

* Node.js
* Express.js
* RESTful APIs
* Nodemailer (email notifications)

### Database

* MongoDB (MongoDB Atlas)

### Media & File Handling

* ImageKit (secure image uploads and storage)

### Security

* JWT authentication with refresh tokens
* bcrypt password hashing

### Deployment & Tools

* Git & GitHub for version control
* Cloud hosting (Render / Vercel)
* Nodemailer for email notifications
* ImageKit for image upload and media storage

---

## System Architecture

The system follows a layered architecture:

1. **Presentation Layer** – React.js UI for complaint submission and tracking
2. **Application Layer** – Node.js & Express.js handling business logic and routing
3. **Data Access Layer** – Mongoose models for secure CRUD operations
4. **Database Layer** – MongoDB Atlas for persistent cloud storage

---

## Functional Requirements

* User authentication (Student / Admin)
* Complaint submission with optional attachments
* Real‑time complaint tracking
* Admin dashboard for complaint management
* Notification system
* Complaint history maintenance

---

## Non‑Functional Requirements

* **Usability:** Intuitive UI requiring no training
* **Performance:** Fast response for core operations
* **Security:** JWT, bcrypt, and role‑based access control
* **Reliability:** High availability with regular backups
* **Scalability:** Modular architecture for future growth
* **Portability:** Works on all modern browsers and mobile devices

---

## Installation & Setup

### Prerequisites

* Node.js
* MongoDB / MongoDB Atlas
* Git

### Steps

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
npm install
```

Create a `.env` file based on `.env.example` and configure environment variables.

Run the application:

```bash
npm start
```

---

---

## Future Enhancements

* QR code‑based complaint registration
* Email / SMS notifications
* Priority‑based complaint handling
* Analytics and reporting dashboard
* Mobile application support

---

## Contributors

This project was developed as an academic group project.

---

## License

This project is developed for academic and learning purposes.
