import { useState, useRef } from "react";
import { Paperclip, Mic, Send, Sparkles } from "lucide-react";

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
      const response = await fetch("http://127.0.0.1:8000/analyze-clause/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process the document. Check backend logs.");
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
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

              {/* <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-full text-sm font-medium text-gray-200">
                <Mic className="w-4 h-4" />
                Voice
              </button> */}
            </div>

            <button 
              onClick={handleSend}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition-colors px-6 py-2 rounded-full text-sm font-medium text-white shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-pulse">Scanning...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 w-full p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-center">
            {error}
          </div>
        )}

        {/* Results Area (Dark Theme) */}
        {results && (
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