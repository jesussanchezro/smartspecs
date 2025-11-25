# SmartSpecs

## Description

SmartSpecs is a web application built using React to manage tasks and projects, providing a user-friendly interface for effective collaboration. The application utilizes Firebase for storing requirements data and audio files. Additionally, OpenAI is used to analyze data, enhancing the application's capabilities.

## Video Overview

For a visual overview of the project, you can watch this [video](https://www.loom.com/share/229039890df042b08760942306ca4228?sid=ea4a11e5-803e-441f-9eb8-696c0c14d5f1).
Alternatively, you can view the embedded video below:

https://github.com/user-attachments/assets/003cb94b-6148-44f6-9443-62a6ab1cd1cb


## Tools and Technologies

- **Frontend:**
  - **Framework:** React
  - **Styling:**
    - Sass
    - Tailwind CSS
    - Ant Design (UI Component Library)
  - **State Management:** Context API
- **Backend:**
  - **Database:** Firebase Firestore (for storing requirements data)
  - **Storage:** Firebase Storage (for saving audio files)
  - **Data Analysis:** OpenAI (for analyzing data)

## Architecture

The architecture of the project is organized into several layers:

- **Datasource:** Handles data retrieval and storage using Firebase Firestore for requirements data and Firebase Storage for audio files.
- **Domain:** Contains the business logic and rules of the application.
- **Infrastructure:** Provides necessary data management tools.
- **Presentation:** Responsible for the user interface, built using React components styled with Sass, Tailwind CSS, and Ant Design.
- **Utils:** Includes utility functions and helpers for code reusability.
- **Config:** Manages configuration settings for the application.

## Installation

Instructions on how to set up the project locally. For example:

1. Clone the repository:
   ```bash
   git clone https://github.com/jesussanchezro/smartspecs.git
   ```
2. Navigate to the project directory:
   ```bash
   cd smartspecs
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Usage

Instructions on how to run the project. For example:

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open your browser and navigate to `http://localhost:3000`.

## Contributing

Guidelines for contributing to the project. For example:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Make your changes and commit them (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.


## Running Dify Locally

1. Clone Dify project: https://github.com/langgenius/dify
2. Run the following commands:
   ```bash
   cd dify
   cd docker
   cp .env.example .env
   docker compose up -d
   ```

3. In the Dify app, follow these steps:
   - Create a new project or import a DSL file
   - After your project is ready to use, publish it
   - Create an API KEY in: API Access → API Key → Create new secret key
   - Use this key in your environment variable `DIFY_API_KEY`
   - Also set `DIFY_API_URL` which can be found in API Access
   - Remember to configure your OpenAI API key in the model settings

## Deployment

To deploy the application, run the following commands:
```bash
npm install firebase
npm install -g firebase-tools
firebase login
firebase init
firebase deploy
```
**Note:** you should have an `env.local` file (not `.env`) with environment variables.

After deployment, go to Firebase Console → Hosting section. There you will find the deployment URL and additional deployment details.

## Features

SmartSpecs includes the following key functionalities:

### 🔐 **User Management**
- User registration and authentication
- Secure login/logout system
- Protected routes requiring authentication
- User session management with Firebase Auth

### 📋 **Project Management**
- Create, edit, and delete projects

### 🎙️ **Meeting Management**
- Manual meeting creation with transcriptions
- Meeting details including title, description, and transcription
- Meeting history per project
- Integration with audio transcription services

### 📝 **Requirements Management**
- Create and manage project requirements
- Requirement approval/rejection workflow
- Responsible assignment
- Change history tracking

### 🔗 **Fireflies Integration**
- Automatic webhook integration with Fireflies.ai
- Real-time meeting transcription processing
- Automatic pending meeting creation from Fireflies webhooks
- Host and participant email tracking
- Meeting metadata preservation

### ⏳ **Pending Meetings**
- View meetings processed from Fireflies
- Filter meetings by user participation (host or attendee)
- Accept pending meetings to link them to projects
- Delete unwanted pending meetings
- Automatic assignment to user's first project

### 🤖 **AI-Powered Requirements Generation**
- Integration with Dify workflow platform
- Automatic requirement generation from meeting transcriptions
- Smart requirement updates based on meeting content
- AI-powered analysis of project needs
- Requirement history tracking with AI origins


