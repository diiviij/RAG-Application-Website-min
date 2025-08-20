# 🤖 RAG Application

<div align="center">

**Welcome to the RAG Application!** 🚀

*A web-based tool that allows you to upload documents, add website content or text data, store it in a retrieval-augmented generation (RAG) system, and chat with your data using a language model.*

### 🎥 **Watch Demo**
[![Demo Video](https://img.shields.io/badge/🎬-Watch_Demo-red?style=for-the-badge)](https://drive.google.com/file/d/1N203LKZEw1wZHLwvFm0SwfgWqRyPXOoX/view?usp=sharing)

[🏁 Quick Start](#installation) • [📚 Documentation](#usage) • [🛠️ API](#api-endpoints) • [🤝 Contributing](#contributing)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [📋 Prerequisites](#-prerequisites)
- [🚀 Installation](#-installation)
- [💡 Usage](#-usage)
- [📁 Project Structure](#-project-structure)
- [⚙️ Configuration](#️-configuration)
- [🔌 API Endpoints](#-api-endpoints)
- [🛠️ Troubleshooting](#️-troubleshooting)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [📞 Contact](#-contact)

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 📤 Data Ingestion
- 📄 Upload **PDF, TXT, CSV** files
- ✍️ Add text **directly**
- 🌐 Fetch content from **websites**

### 💬 Chat Interface
- 🤖 Conversational AI powered by **Groq LLM**
- 📊 **Real-time** responses
- 📱 **Mobile-friendly** design

</td>
<td width="50%">

### 🗄️ RAG Store
- 👁️ View and manage **indexed data**
- 📈 Track **chunk counts** and sources
- 🗑️ **Clear store** functionality

### 🛡️ Reliability
- ⚡ **Real-time updates**
- 🚨 Detailed **error handling**
- 📱 **Responsive design**

</td>
</tr>
</table>

---

## 📋 Prerequisites

> **Required Dependencies**

| Component | Version | Description |
|-----------|---------|-------------|
| Node.js | `14.x+` | JavaScript runtime |
| npm | Latest | Package manager |
| Groq API Key | - | API key for LLM functionality |

---

## 🚀 Installation

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/rag-application.git
cd rag-application
```

### Step 2: Install Backend Dependencies
```bash
npm install
```

<details>
<summary>📦 View Required Packages</summary>

- `express` - Web framework
- `multer` - File upload handling
- `langchain` - LLM framework
- `@langchain/groq` - Groq integration
- `cors` - Cross-origin requests
- `dotenv` - Environment variables

</details>

### Step 3: Configure Environment
Create a `.env` file in the project root:

```env
# 🔑 API Configuration
GROQ_API_KEY=your_groq_api_key_here

# 🚀 Server Configuration
PORT=5000

# 📁 File Configuration (Optional)
MAX_FILE_SIZE=50MB
```

### Step 4: Start the Backend
```bash
node Server-langchain.js
```

> ✅ Backend will start on `http://localhost:5000`

### Step 5: Open the Frontend
Open `index.html` in your browser or serve it locally:

```bash
# Option 1: Direct file
open index.html

# Option 2: Local server
npx serve .
# or
python -m http.server 8000
```

---

## 💡 Usage

### 📤 Adding Data

<table>
<tr>
<td width="33%">

#### ✍️ Text Input
1. Enter text in **"Direct Text Input"**
2. Click **"Add Text"**
3. ✅ Text processed and indexed

</td>
<td width="33%">

#### 📁 File Upload
1. Select **PDF/TXT/CSV** file
2. Click **"Upload File"**
3. ✅ File processed automatically

</td>
<td width="33%">

#### 🌐 Website Content
1. Enter website **URL**
2. Click **"Add Website"**
3. ✅ Content scraped and indexed

</td>
</tr>
</table>

### 💾 Managing RAG Store

- **View Data**: See all indexed documents in the "RAG Store" panel
- **Track Progress**: Monitor chunk counts and source details  
- **Clear Store**: Remove all data with confirmation dialog

### 💬 Chatting with Data

1. Type your question in the chat input field
2. Press **"Send"** or **"Enter"**
3. 🤖 RAG Assistant responds based on your indexed data

### 📊 Status Updates

| Status | Description | Color |
|--------|-------------|-------|
| ✅ Success | Operation completed successfully | Green |
| ❌ Error | Something went wrong | Red |
| ℹ️ Info | General information | Blue |

---

## 📁 Project Structure

```
rag-application/
├── 📄 Server-langchain.js    # Backend server with LangChain
├── 🌐 index.html            # Frontend UI
├── 📖 README.md             # Documentation (this file)
├── 🔧 .env                  # Environment variables
├── 📦 package.json          # Dependencies
└── 📁 node_modules/         # Backend dependencies
```

---

## ⚙️ Configuration

### 🔗 API Configuration
```javascript
// In index.html
const API_BASE_URL = 'http://localhost:5000';
```

### 📁 File Limits
- **Maximum file size**: 50MB (configurable)
- **Supported formats**: PDF, TXT, CSV

### 🤖 LLM Configuration
- **Default model**: `deepseek-r1-distill-llama-70b`
- **Fallback**: Fake embeddings if API key missing
- **Provider**: Groq API

---

## 🔌 API Endpoints

<table>
<tr>
<th width="20%">Method</th>
<th width="30%">Endpoint</th>
<th width="50%">Description</th>
</tr>
<tr>
<td><code>POST</code></td>
<td><code>/upload</code></td>
<td>📤 Upload files (PDF, TXT, CSV)</td>
</tr>
<tr>
<td><code>POST</code></td>
<td><code>/add-text</code></td>
<td>✍️ Add text directly</td>
</tr>
<tr>
<td><code>POST</code></td>
<td><code>/add-website</code></td>
<td>🌐 Add website content</td>
</tr>
<tr>
<td><code>POST</code></td>
<td><code>/query</code></td>
<td>🔍 Perform similarity search</td>
</tr>
<tr>
<td><code>POST</code></td>
<td><code>/generate-answer</code></td>
<td>🤖 Generate answers using RAG</td>
</tr>
<tr>
<td><code>GET</code></td>
<td><code>/stats</code></td>
<td>📊 Get collection statistics</td>
</tr>
<tr>
<td><code>DELETE</code></td>
<td><code>/clear</code></td>
<td>🗑️ Clear the vector store</td>
</tr>
<tr>
<td><code>GET</code></td>
<td><code>/health</code></td>
<td>❤️ Check backend health</td>
</tr>
</table>

---

## 🛠️ Troubleshooting

<details>
<summary>📤 File Upload Fails</summary>

**Symptoms**: Upload button doesn't work or shows errors

**Solutions**:
- ✅ Check browser Network tab for `/upload` request errors
- ✅ Ensure file field name is `file` and type is supported
- ✅ Verify backend logs for multer or processing errors
- ✅ Check file size (max 50MB)

</details>

<details>
<summary>🔌 No Backend Response</summary>

**Symptoms**: Frontend can't connect to backend

**Solutions**:
- ✅ Confirm server is running on `http://localhost:5000`
- ✅ Check CORS settings
- ✅ Verify firewall isn't blocking the connection
- ✅ Check console for network errors

</details>

<details>
<summary>⚠️ Fake Embeddings Warning</summary>

**Symptoms**: "Using fake embeddings as fallback" message

**Solutions**:
- ✅ Provide a valid `GROQ_API_KEY` in `.env`
- ✅ Restart the backend after adding the API key
- ✅ Verify API key is correct and has proper permissions

</details>

<details>
<summary>🔄 RAG Store Not Updating</summary>

**Symptoms**: Data added but not visible in store

**Solutions**:
- ✅ Check `/stats` endpoint response manually
- ✅ Refresh the browser page
- ✅ Check browser console for JavaScript errors
- ✅ Verify backend logs for processing errors

</details>

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### 🍴 Fork & Clone
```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR-USERNAME/rag-application.git
cd rag-application
```

### 🌿 Create Feature Branch
```bash
git checkout -b feature/awesome-new-feature
```

### 💾 Commit Changes
```bash
git add .
git commit -m "✨ Add awesome new feature"
```

### 🚀 Push & Create PR
```bash
git push origin feature/awesome-new-feature
# Then create a Pull Request on GitHub
```

### 📝 Contribution Guidelines
- 🐛 **Bug fixes** - Always welcome!
- ✨ **New features** - Discuss in issues first
- 📚 **Documentation** - Help improve our docs
- 🧪 **Tests** - Add tests for new functionality

---

## 📄 License

This project is licensed under the **MIT License**.

<details>
<summary>📋 View License Details</summary>

```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software.
```

</details>

---

## 📞 Contact

<div align="center">

### 👨‍💻 Developer

**GitHub**: [@diiviij](https://github.com/diiviij)

**Created**: August 20, 2025

---

<sub>Made with ❤️ and lots of ☕</sub>

### 🌟 If you found this helpful, please give it a star!

**Created**: August 20, 2025

[![GitHub stars](https://img.shields.io/github/stars/diiviij/rag-application?style=social)](https://github.com/diiviij/rag-application)

</div>
