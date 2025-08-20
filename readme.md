RAG Application
Welcome to the RAG Application! This is a web-based tool that allows you to upload documents, add website content or text data, store it in a retrieval-augmented generation (RAG) system, and chat with your data using a language model. Built with a Node.js backend and a modern HTML/JavaScript frontend, this application leverages the LangChain framework and the Groq API for advanced text processing and generation.
Table of Contents

Features
Prerequisites
Installation
Usage
Project Structure
Configuration
API Endpoints
Troubleshooting
Contributing
License
Contact

Features

Data Ingestion: Upload PDF, TXT, or CSV files, add text directly, or fetch content from websites.
RAG Store: View and manage indexed data with chunk counts and source details.
Chat Interface: Interact with your data using a conversational AI powered by Groq LLM.
Real-Time Updates: Automatically refresh the RAG store and chat interface after data additions or deletions.
Error Handling: Detailed status messages for successful operations and errors.
Responsive Design: Works on desktop and mobile devices with a notebook-like UI.

Prerequisites

Node.js: Version 14.x or higher.
npm: Comes with Node.js installation.
Backend Dependencies: Install required packages via npm.
Groq API Key: Required for LLM functionality (optional for fallback embeddings).
Text Editors: Any code editor (e.g., VS Code) for development.

Installation

Clone the Repository:
git clone https://github.com/your-username/rag-application.git
cd rag-application


Install Backend Dependencies:

Navigate to the project root where Server-langchain.js is located.
Run:npm install


Required packages include express, multer, langchain, @groq-ai/groq, and others (check package.json).


Set Up Environment Variables:

Create a .env file in the project root.
Add your Groq API key:GROQ_API_KEY=your_groq_api_key_here


(Optional) Configure other settings like port or file size limits if needed.


Run the Backend:
node Server-langchain.js


The backend will start on http://localhost:5000.


Open the Frontend:

Open index.html in a web browser, or serve it using a local server (e.g., npx serve or a Python HTTP server).



Usage

Add Data:

Text Input: Enter text in the "Direct Text Input" textarea and click "Add Text".
File Upload: Select a PDF, TXT, or CSV file and click "Upload File".
Website Content: Enter a URL and click "Add Website".


Manage RAG Store:

View indexed data in the "RAG Store" panel.
Clear all data by clicking "Clear Store" (confirms with a dialog).


Chat with Data:

Type a question in the chat input field and press "Send" or "Enter".
The RAG Assistant will respond based on indexed data.


Status Updates:

Success, error, or info messages appear temporarily above the RAG Store.



Project Structure
rag-application/
├── Server-langchain.js    # Backend server with LangChain integration
├── index.html            # Frontend UI
├── README.md             # This file
├── .env                  # Environment variables (create manually)
└── node_modules/         # Backend dependencies (after npm install)

Configuration

API Base URL: Set to http://localhost:5000 by default in index.html. Change API_BASE_URL if hosting on a different server.
File Limits: Backend supports files up to 50MB (configurable via multer).
LLM: Uses deepseek-r1-distill-llama-70b by default with Groq. Fallback embeddings are used if the API key is missing.

API Endpoints

POST /upload: Upload files (PDF, TXT, CSV).
POST /add-text: Add text directly.
POST /add-website: Add website content.
POST /query: Perform similarity search on documents.
POST /generate-answer: Generate answers using RAG.
GET /stats: Get collection statistics.
DELETE /clear: Clear the vector store.
GET /health: Check backend health.

Troubleshooting

File Upload Fails:
Check browser Network tab for /upload request errors.
Ensure the file field name is file and type is supported.
Verify backend logs for multer or processing errors.


No Backend Response:
Confirm the server is running on http://localhost:5000.
Check CORS settings or firewall issues.


Fake Embeddings Warning:
Provide a valid GROQ_API_KEY in .env to use real embeddings.


RAG Store Not Updating:
Reload stats manually or check /stats endpoint response.



Contributing

Fork the repository.
Create a feature branch (git checkout -b feature/new-feature).
Commit changes (git commit -m 'Add new feature').
Push to the branch (git push origin feature/new-feature).
Open a Pull Request.

License
This project is licensed under the MIT License. See the LICENSE file for details (create one if not present).
Contact

GitHub: [https://github.com/diiviij]
Date Created: August 20, 2025
