import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import path from "path";

// LangChain imports
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ChatGroq } from "@langchain/groq";
import { RetrievalQAChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";
import { formatDocumentsAsString } from "langchain/util/document";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

// Try to import embeddings with fallbacks
let embeddings;
let EmbeddingsClass;

try {
  // Try different possible imports for embeddings
  const { GroqEmbeddings } = await import("@langchain/groq").catch(() => ({}));
  if (GroqEmbeddings) {
    EmbeddingsClass = GroqEmbeddings;
  } else {
    // Fallback to OpenAI embeddings or fake embeddings
    const { FakeEmbeddings } = await import("langchain/embeddings/fake");
    EmbeddingsClass = FakeEmbeddings;
    console.warn("⚠️ Using fake embeddings as fallback");
  }
} catch (error) {
  console.warn("⚠️ Could not load embeddings, using fake embeddings");
  const { FakeEmbeddings } = await import("langchain/embeddings/fake");
  EmbeddingsClass = FakeEmbeddings;
}

// Document loaders
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { Document } from "@langchain/core/documents";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/plain', 'text/csv', 'application/csv'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Only PDF, TXT, and CSV files are allowed.'));
    }
  }
});

// Global variables
let vectorStore;
let llm;
let textSplitter;
let retrievalChain;

// Initialize LangChain components
async function initializeLangChain() {
  try {
    // Initialize embeddings
    if (process.env.GROQ_API_KEY && EmbeddingsClass.name === 'GroqEmbeddings') {
      embeddings = new EmbeddingsClass({
        apiKey: process.env.GROQ_API_KEY,
        model: "nomic-embed-text-v1",
      });
      console.log("✅ Groq embeddings initialized");
    } else if (EmbeddingsClass) {
      embeddings = new EmbeddingsClass();
      console.log("✅ Fallback embeddings initialized");
    } else {
      throw new Error("No embeddings class available");
    }

    // Initialize text splitter with better chunking
    textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1500, // Larger chunks for more context
      chunkOverlap: 300, // More overlap for continuity
      separators: ["\n\n", "\n", ". ", "! ", "? ", " ", ""],
    });

    // Initialize vector store (using memory store for simplicity)
    vectorStore = new MemoryVectorStore(embeddings);
    console.log("✅ Memory vector store initialized");

    // Initialize LLM with better configuration
    if (process.env.GROQ_API_KEY) {
      llm = new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        modelName: "deepseek-r1-distill-llama-70b", // Fixed model name
        temperature: 0.2, // Slightly higher for more natural responses
        maxTokens: 2000, // Increased for more comprehensive answers
        topP: 0.9, // Better response diversity
      });
      console.log("✅ Groq LLM initialized with deepseek-r1-distill-llama-70b");
    } else {
      console.warn("⚠️ No Groq API key found, answer generation will be limited");
    }

    // Initialize retrieval chain
    if (llm && vectorStore) {
      const prompt = PromptTemplate.fromTemplate(`
        You are an expert AI assistant with access to relevant documentation. Your task is to provide accurate, helpful, and comprehensive answers based on the provided context.

        Instructions:
        1. Use the provided context as your primary source of information
        2. If the context contains relevant information, provide a detailed and well-structured answer
        3. If the context doesn't contain enough information, clearly state this and explain what information would be needed
        4. Be conversational and helpful in your tone
        5. Structure your response with clear explanations and examples when possible
        6. If you can provide partial information from the context, do so and indicate what's missing

        Context Information:
        {context}

        User Question: {question}

        Provide a comprehensive answer based on the above context:
      `);

      const retriever = vectorStore.asRetriever({
        k: 8, // Increased for more context
        searchType: "similarity",
      });

      retrievalChain = RunnableSequence.from([
        {
          context: retriever.pipe(formatDocumentsAsString),
          question: new RunnablePassthrough(),
        },
        prompt,
        llm,
        new StringOutputParser(),
      ]);

      console.log("✅ Retrieval chain initialized");
    }

  } catch (error) {
    console.error("Failed to initialize LangChain:", error);
    throw error;
  }
}

// Helper function to load document based on file type
async function loadDocument(filePath, mimetype, originalname) {
  let loader;
  
  switch (mimetype) {
    case 'application/pdf':
      loader = new PDFLoader(filePath);
      break;
    case 'text/csv':
    case 'application/csv':
      loader = new CSVLoader(filePath);
      break;
    case 'text/plain':
    default:
      loader = new TextLoader(filePath);
      break;
  }

  const docs = await loader.load();
  
  // Add metadata
  docs.forEach(doc => {
    doc.metadata = {
      ...doc.metadata,
      source: 'file',
      filename: originalname,
      uploadTime: new Date().toISOString()
    };
  });

  return docs;
}

// Routes

// Upload & index a file
// Upload & index a file
app.post("/upload", upload.single('file'), async (req, res) => {
  console.log("Received upload request. File object:", req.file ? req.file.originalname : "No file");
  try {
    if (!req.file) {
      console.error("No file uploaded in request. Body:", req.body, "Files:", req.files);
      return res.status(400).json({ error: "No file uploaded. Please ensure a file is selected and the field name is 'file'." });
    }

    if (!vectorStore) {
      console.error("Vector store not initialized");
      return res.status(500).json({ error: "Vector store not initialized" });
    }

    const filePath = req.file.path;
    console.log("Processing file at:", filePath);

    // Load document using appropriate loader
    const docs = await loadDocument(filePath, req.file.mimetype, req.file.originalname);
    console.log("Loaded document with", docs.length, "pages/chunks");

    if (!docs || docs.length === 0) {
      console.warn("No content found in file:", req.file.originalname);
      return res.status(400).json({ error: "No content found in file" });
    }

    // Split documents into chunks
    const splitDocs = await textSplitter.splitDocuments(docs);
    console.log("Split into", splitDocs.length, "chunks");

    // Add to vector store
    await vectorStore.addDocuments(splitDocs);
    console.log("Added", splitDocs.length, "chunks to vector store");

    // Clean up uploaded file
    fs.unlinkSync(filePath);
    console.log("Cleaned up temporary file:", filePath);

    res.json({ 
      message: "File processed & stored successfully",
      chunks: splitDocs.length,
      filename: req.file.originalname
    });

  } catch (error) {
    console.error("Upload error for file", req.file?.originalname, ":", error.stack);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ error: `Multer error: ${error.message}. Check file size (max 50MB) or type (PDF, TXT, CSV).` });
    }
    res.status(500).json({ error: "Failed to upload file: " + error.message });
  }
});

// Add website content
app.post("/add-website", async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: "No URL provided" });
    }

    if (!vectorStore) {
      return res.status(500).json({ error: "Vector store not initialized" });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    // Load website content
    const loader = new CheerioWebBaseLoader(url, {
      selector: "body",
    });
    
    const docs = await loader.load();
    
    if (!docs || docs.length === 0) {
      return res.status(400).json({ error: "No content found on the website" });
    }

    // Add metadata
    const hostname = new URL(url).hostname;
    docs.forEach(doc => {
      doc.metadata = {
        ...doc.metadata,
        source: 'website',
        url: url,
        hostname: hostname,
        uploadTime: new Date().toISOString()
      };
    });

    // Split documents
    const splitDocs = await textSplitter.splitDocuments(docs);

    // Add to vector store
    await vectorStore.addDocuments(splitDocs);

    res.json({ 
      message: "Website content processed & stored successfully",
      chunks: splitDocs.length,
      url: url,
      hostname: hostname
    });

  } catch (error) {
    console.error("Add website error:", error);
    res.status(500).json({ error: "Failed to add website: " + error.message });
  }
});

// Query documents (similarity search)
app.post("/query", async (req, res) => {
  try {
    const { question, k = 5 } = req.body;
    
    if (!question || !question.trim()) {
      return res.status(400).json({ error: "No question provided" });
    }

    if (!vectorStore) {
      return res.status(500).json({ error: "Vector store not initialized" });
    }

    // Perform similarity search
    const results = await vectorStore.similaritySearchWithScore(question, k);
    
    const formattedResults = results.map(([doc, score], index) => ({
      id: `result-${index}`,
      content: doc.pageContent,
      metadata: doc.metadata,
      score: score,
      distance: 1 - score // Convert similarity to distance
    }));

    res.json({
      question: question,
      results: formattedResults,
      totalResults: results.length
    });

  } catch (error) {
    console.error("Query error:", error);
    res.status(500).json({ error: "Failed to query documents: " + error.message });
  }
});

// Enhanced generate answer with better context processing
app.post("/generate-answer", async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || !question.trim()) {
      return res.status(400).json({ error: "No question provided" });
    }

    if (!retrievalChain) {
      return res.status(500).json({ 
        error: "Retrieval chain not available. Please ensure Groq API key is configured." 
      });
    }

    // Get relevant documents first to check context quality
    const retriever = vectorStore.asRetriever({ k: 8 });
    const sourceDocs = await retriever.getRelevantDocuments(question);
    
    // Filter out low-quality or irrelevant chunks
    const relevantDocs = sourceDocs.filter(doc => {
      const content = doc.pageContent.toLowerCase();
      const query = question.toLowerCase();
      const queryWords = query.split(' ').filter(word => word.length > 3);
      
      // Check if document contains at least one significant query word
      return queryWords.some(word => content.includes(word)) && 
             doc.pageContent.trim().length > 50; // Minimum content length
    });

    if (relevantDocs.length === 0) {
      return res.json({
        answer: "I couldn't find relevant information in the knowledge base to answer your question. Please try rephrasing your question or add more relevant documents to the system.",
        sources: [],
        model: "deepseek-r1-distill-llama-70b",
        contextFound: false
      });
    }

    // Create enhanced context with better formatting
    const context = relevantDocs
      .map((doc, index) => {
        const source = doc.metadata.filename || doc.metadata.title || doc.metadata.url || 'Unknown source';
        return `[Source ${index + 1}: ${source}]\n${doc.pageContent}\n`;
      })
      .join('\n---\n\n');

    // Enhanced prompt with better instructions
    const enhancedPrompt = `You are an expert AI assistant with access to relevant documentation. Provide a comprehensive, accurate, and helpful answer based on the context below.

Context Information:
${context}

User Question: ${question}

Instructions:
- Provide a detailed, well-structured answer based on the context
- Use clear explanations and include relevant details
- If the context provides partial information, explain what you can determine and what might be missing
- Be conversational and helpful
- Structure your response logically with examples when appropriate

Answer:`;

    // Use the LLM directly for better control
    const response = await llm.invoke(enhancedPrompt);
    const answer = typeof response === 'string' ? response : response.content || response.text;

    res.json({
      answer: answer,
      sources: relevantDocs.map(doc => ({
        ...doc.metadata,
        preview: doc.pageContent.substring(0, 200) + '...'
      })),
      model: "deepseek-r1-distill-llama-70b",
      contextFound: true,
      chunksUsed: relevantDocs.length
    });

  } catch (error) {
    console.error("Generate answer error:", error);
    
    // Enhanced fallback response
    try {
      const retriever = vectorStore.asRetriever({ k: 3 });
      const docs = await retriever.getRelevantDocuments(question);
      
      if (docs.length > 0) {
        const contextSummary = docs
          .map(doc => doc.pageContent.substring(0, 300))
          .join('\n\n---\n\n');
        
        const fallbackAnswer = `Based on the available information in my knowledge base:

${contextSummary}

Note: I'm providing this information directly from the stored documents. For more detailed analysis, please ensure the Groq API is properly configured.

Would you like me to search for more specific information or would you like to add more relevant documents?`;
        
        res.json({
          answer: fallbackAnswer,
          sources: docs.map(doc => doc.metadata),
          model: "fallback-enhanced",
          contextFound: true
        });
      } else {
        res.json({
          answer: "I don't have relevant information in my knowledge base to answer your question. Please add more documents or try a different question.",
          sources: [],
          model: "fallback",
          contextFound: false
        });
      }
    } catch (fallbackError) {
      res.status(500).json({ error: "Failed to generate answer: " + error.message });
    }
  }
});

// Get collection stats
app.get("/stats", async (req, res) => {
  try {
    let stats = {
      totalChunks: 0,
      sources: {},
      collectionName: "rag-app"
    };

    if (vectorStore instanceof MemoryVectorStore) {
      // For memory vector store, we need to access the documents differently
      stats.totalChunks = vectorStore.memoryVectors?.length || 0;
      stats.vectorStoreType = "memory";
    }

    res.json(stats);
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ error: "Failed to get stats: " + error.message });
  }
});

// Clear collection
app.delete("/clear", async (req, res) => {
  try {
    // For memory vector store
    if (vectorStore instanceof MemoryVectorStore) {
      vectorStore.memoryVectors = [];
      res.json({ message: "Memory vector store cleared successfully" });
    } else {
      // Reinitialize
      await initializeLangChain();
      res.json({ message: "Vector store cleared successfully" });
    }
  } catch (error) {
    console.error("Clear error:", error);
    res.status(500).json({ error: "Failed to clear collection: " + error.message });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    features: {
      vectorStore: !!vectorStore,
      embeddings: !!embeddings,
      llm: !!llm,
      retrievalChain: !!retrievalChain,
      groqAPI: !!process.env.GROQ_API_KEY
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
    }
    return res.status(400).json({ error: error.message });
  }
  
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Initialize and start server
async function startServer() {
  try {
    console.log("🔄 Initializing LangChain components...");
    await initializeLangChain();
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`\n🚀 RAG Backend (LangChain) running on http://localhost:${PORT}`);
      console.log("📊 System Status:");
      console.log(`   Vector Store: ${vectorStore ? '✅' : '❌'}`);
      console.log(`   Embeddings: ${embeddings ? '✅' : '❌'}`);
      console.log(`   LLM: ${llm ? '✅' : '❌'}`);
      console.log(`   Retrieval Chain: ${retrievalChain ? '✅' : '❌'}`);
      console.log(`   Groq API: ${process.env.GROQ_API_KEY ? '✅' : '❌'}`);
      console.log("\n📝 Available endpoints:");
      console.log("  POST /upload - Upload files (PDF, TXT, CSV)");
      console.log("  POST /add-text - Add text directly");
      console.log("  POST /add-website - Add website content");
      console.log("  POST /query - Query documents (similarity search)");
      console.log("  POST /generate-answer - Generate answers using RAG");
      console.log("  GET /stats - Get collection statistics");
      console.log("  DELETE /clear - Clear collection");
      console.log("  GET /health - Health check");
    });
    
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();