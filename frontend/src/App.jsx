import { useState, useRef } from "react";
import { Paperclip, Send, Sparkles, Loader2, AlertCircle, RefreshCw } from "lucide-react";

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  
  // Reference to trigger the hidden file input
  const fileInputRef = useRef(null);

  const handleAttachClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSend = async () => {
    if (!file) {
      setError("Please attach a PDF contract first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // NOTE: Ensure this matches your GCP Public IP in production!
      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server Error (${response.status}): Failed to process the document.`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      // Catch "Failed to fetch" specifically to give better instructions
      if (err.message.includes("Failed to fetch")) {
        setError("Connection failed: Unable to reach the backend server. The firewall might be blocking it or the server is offline.");
      } else {
        setError(`Analysis failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1d] via-[#111827] to-[#0a0f1d] text-white flex flex-col items-center p-6 font-sans">
      
      {/* Main Chat Container */}
      <div className="w-full max-w-2xl mt-12 flex flex-col items-center">
        
        {/* Glowing Orb */}
        <div className="w-50 h-50 rounded-full bg-blue-500 blur-2xl opacity-60 mb-6"></div>
        <div className="w-50 h-50 rounded-full bg-gradient-to-tr from-blue-600 to-blue-300 absolute mt-2 shadow-[0_0_40px_rgba(59,130,246,0.8)]"></div>

        {/* Greeting */}
        <h1 className="text-3xl font-medium mt-24 mb-1">Hi there!</h1>
        <h2 className="text-3xl font-medium text-blue-400 mb-10">What's on your mind?</h2>

        {/* Glassmorphism Input Card */}
        <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 shadow-2xl">
          
          {/* Input Area */}
          <div className="flex items-center gap-3 bg-transparent p-2 rounded-2xl mb-4">
            <Sparkles className="text-gray-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Upload the PDF file of Contract..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-white placeholder-gray-400"
              disabled
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center px-2">
            
            <div className="flex gap-2">
              {/* Hidden File Input */}
              <input 
                type="file" 
                accept=".pdf" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
              />
              
              <button 
                onClick={handleAttachClick}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-full text-sm font-medium text-gray-200"
              >
                <Paperclip className="w-4 h-4" />
                {file ? file.name : "Attach"}
              </button>
            </div>

            <button 
              onClick={handleSend}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition-colors px-6 py-2 rounded-full text-sm font-medium text-white shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send
                </>
              )}
            </button>
          </div>
        </div>

        {/* 1. NEW DEDICATED ERROR STATE */}
        {error && !loading && (
          <div className="mt-8 w-full p-6 bg-red-900/20 border border-red-500/30 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 shadow-lg backdrop-blur-md">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-red-200 text-sm font-medium">{error}</p>
            <button 
              onClick={handleAttachClick}
              className="mt-2 flex items-center gap-2 bg-red-500/20 hover:bg-red-500/40 transition-colors px-5 py-2.5 rounded-full text-sm font-semibold text-red-200"
            >
              <RefreshCw className="w-4 h-4" />
              Re-upload PDF & Try Again
            </button>
          </div>
        )}

        {/* 2. NEW DEDICATED LOADING ANIMATION */}
        {loading && (
          <div className="mt-8 w-full bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl flex flex-col items-center justify-center space-y-6 shadow-xl">
            <div className="relative flex items-center justify-center">
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-blue-500/30 animate-ping"></div>
              {/* Inner spinning icon */}
              <Loader2 className="w-12 h-12 text-blue-400 animate-spin relative z-10" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium text-gray-200 animate-pulse">Analyzing Contract...</h3>
              <p className="text-sm text-gray-400">Extracting text and identifying legal liabilities via Gemini AI.</p>
            </div>
            
            {/* Visual Progress Bar */}
            <div className="w-64 h-1.5 bg-gray-800 rounded-full overflow-hidden mt-4 relative">
              <div className="absolute top-0 left-0 h-full bg-blue-500 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" style={{ width: '75%' }}></div>
            </div>
          </div>
        )}

        {/* 3. Results Area */}
        {results && !loading && !error && (
          <div className="mt-8 w-full space-y-4">
            <h3 className="text-xl font-medium text-gray-200 ml-2">Contract Analysis</h3>
            {results.clauses.map((clause, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
                <div className="flex justify-between items-center mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    clause.risk_level === 'Red' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                    clause.risk_level === 'Yellow' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
                    'bg-green-500/20 text-green-400 border border-green-500/30'
                  }`}>
                    {clause.risk_level} FLAG
                  </span>
                </div>
                <p className="italic text-gray-300 mb-4 border-l-2 border-gray-600 pl-3">"{clause.text}"</p>
                <p className="text-sm text-gray-200 mb-3"><span className="text-blue-400 font-semibold mr-2">Meaning:</span>{clause.explaination}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}