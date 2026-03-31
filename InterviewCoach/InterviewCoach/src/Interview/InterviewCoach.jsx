import React, { useState, useRef, useEffect } from "react";
import {
  Globe,
  Mic,
  MicOff,
  MessageSquare,
  User,
  Brain,
  Camera,
  Briefcase,
  RotateCcw,
  Sparkles,
  Activity,
  ChevronDown,
  Wifi,
  WifiOff,
  ArrowLeft,
} from "lucide-react";

export const InterviewCoach = () => {
  const [audioUrl, setAudioUrl] = useState("");
  const [transcribedText, setTranscribedText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedRole, setSelectedRole] = useState("Software Engineer");
  const [isConnected, setIsConnected] = useState(true);

  const roleOptions = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Data Analyst",
    "Data Scientist",
    "Machine Learning Engineer",
    "Product Manager",
    "DevOps Engineer",
    "QA Engineer",
  ];

  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const userId = "user123";
  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, transcribedText]);

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    const recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript + " ";
      }
      setTranscribedText(text.trim());
    };

    recognition.start();
    setIsListening(true);
  };

  const handleDoneSpeaking = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
    if (transcribedText) {
      setMessages((prev) => [
        ...prev,
        { type: "user", text: transcribedText, timestamp: new Date() },
      ]);
      generateVoice(transcribedText);
    }
  };

  const generateVoice = async (text) => {
    if (!text) return;
    try {
      const response = await fetch("http://localhost:5001/generate-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, text, role: selectedRole }),
      });

      const data = await response.json();
      setAiResponse(data.text);
      setMessages((prev) => [
        ...prev,
        { type: "ai", text: data.text, timestamp: new Date() },
      ]);
      setIsPlaying(true);

      if (data.audio) {
        const binaryString = atob(data.audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const audioBlob = new Blob([bytes], { type: "audio/mpeg" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => setIsPlaying(false);
        audio.play();
      } else {
        const utterance = new SpeechSynthesisUtterance(data.text);
        utterance.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error("Error generating voice:", error);
      setIsPlaying(false);
    }
  };

  const resetConversation = async () => {
    try {
      const response = await fetch("http://localhost:5001/reset-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      if (data.success) {
        setMessages([]);
        setTranscribedText("");
        setAiResponse("");
      }
    } catch (error) {
      console.error("Error resetting conversation:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background gradient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => window.location.href = "http://localhost:3000/dashboard"}
          className="group flex items-center gap-2 px-4 py-2 bg-gray-900/60 backdrop-blur border border-gray-700/60 text-gray-400 hover:text-white text-sm font-bold rounded-xl transition-all duration-300 mb-8 hover:border-blue-500/50"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </button>

        {/* ─── Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-500/20">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-indigo-400">
                Saarthi AI
              </h1>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Live</span>
              </div>
            </div>
            <p className="text-gray-400 font-medium">
              Practice your interview skills with real-time AI feedback
            </p>
          </div>

          {/* Controls Row */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {/* Role Selector */}
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none z-10" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="appearance-none pl-9 pr-10 py-2.5 bg-gray-900/60 backdrop-blur border border-gray-700/60 text-white text-sm font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-pointer"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role} className="bg-gray-900">
                    {role}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Reset Button */}
            <button
              onClick={resetConversation}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/60 backdrop-blur border border-gray-700/50 hover:border-red-500/50 hover:bg-red-500/10 text-gray-300 hover:text-red-400 text-sm font-semibold rounded-xl transition-all duration-300"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

        {/* ─── Main Grid ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Main Interface */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* AI Avatar Card */}
              <div className="glass-card p-7 relative overflow-hidden group md:col-span-4 flex flex-col justify-between">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Card Badge */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-1.5 bg-blue-500/10 rounded-lg">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-sm font-bold text-white uppercase tracking-widest leading-none">AI Avatar</span>
                </div>

                {/* Globe / Avatar */}
                <div className="flex items-center justify-center h-52 relative mb-6">
                  <div className="relative">
                    {/* Ambient glow rings when playing */}
                    {isPlaying && (
                      <>
                        <div className="absolute inset-0 -m-8 rounded-full border border-blue-500/30 pulse-ring" />
                        <div className="absolute inset-0 -m-14 rounded-full border border-blue-500/20 pulse-ring" style={{ animationDelay: "0.4s" }} />
                        <div className="absolute inset-0 -m-20 rounded-full border border-blue-500/10 pulse-ring" style={{ animationDelay: "0.8s" }} />
                      </>
                    )}
                    <div className={`absolute inset-0 rounded-full blur-3xl transition-all duration-500 ${isPlaying ? 'bg-blue-500/20' : 'bg-blue-500/5'}`} />
                    <Globe
                      className={`w-28 h-28 relative z-10 transition-all duration-500 ${
                        isPlaying ? "text-blue-400 drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]" : "text-gray-600"
                      }`}
                    />
                  </div>
                </div>

                {/* Waveform when listening */}
                {isListening && (
                  <div className="flex items-end justify-center gap-1 h-8 mb-4">
                    {[0.3, 0.6, 1, 0.7, 0.4, 0.9, 0.5, 0.8, 0.3, 0.6].map((delay, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-gradient-to-t from-red-500 to-rose-400 rounded-full waveform-bar"
                        style={{
                          height: "100%",
                          animationDelay: `${i * 0.08}s`,
                          animationDuration: `${0.6 + delay * 0.4}s`,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Mic Button */}
                <div className="flex justify-center">
                  <button
                    onClick={isListening ? handleDoneSpeaking : startListening}
                    className={`relative px-8 py-3.5 rounded-2xl font-bold text-white text-sm flex items-center gap-3 transition-all duration-300 shadow-lg active:scale-95 ${
                      isListening
                        ? "bg-red-500 hover:bg-red-600 shadow-red-500/30"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/30"
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-5 h-5" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5" />
                        Start Speaking
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Video Feed Card */}
              <div className="glass-card p-7 relative overflow-hidden group md:col-span-8 flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-1.5 bg-purple-500/10 rounded-lg">
                    <Camera className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-sm font-bold text-white uppercase tracking-widest">Video Feed</span>
                  <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-400">
                    <Wifi className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Feed Active</span>
                  </div>
                </div>

                <div className="aspect-video bg-gray-900/50 rounded-2xl overflow-hidden border border-gray-800/50 relative flex-1 min-h-[300px]">
                  {/* Fallback when camera not connected */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-0">
                    <Camera className="w-12 h-12 text-gray-700" />
                    <p className="text-gray-600 text-sm font-medium">Camera Feed</p>
                    <p className="text-gray-700 text-xs">Start the Python server to activate</p>
                  </div>
                  <img
                    src="http://localhost:6500/video_feed1"
                    alt="Webcam Feed"
                    className="relative z-10 w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>

                {/* Emotion/Status bar */}
                {aiResponse && (
                  <div className="mt-4 p-3 bg-gray-800/40 border border-gray-700/30 rounded-xl">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Last Response</p>
                    <p className="text-sm text-gray-300 leading-relaxed line-clamp-2">{aiResponse}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Live Transcript Preview */}
            {isListening && transcribedText && (
              <div className="glass-card p-5 border-blue-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-black text-red-400 uppercase tracking-widest">Recording</span>
                </div>
                <p className="text-gray-200 text-sm leading-relaxed">{transcribedText}</p>
              </div>
            )}
          </div>

          {/* Right: Chat Conversation */}
          <div className="lg:col-span-4">
            <div className="glass-card h-full flex flex-col" style={{ minHeight: "500px" }}>
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-xl">
                    <MessageSquare className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">Interview Chat</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{messages.length} exchanges</p>
                  </div>
                  <div className="ml-auto px-2 py-1 bg-gray-800/50 border border-gray-700/30 rounded-lg text-xs text-gray-400 font-semibold">
                    {selectedRole}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-5 space-y-4"
                style={{ maxHeight: "calc(100vh - 280px)" }}
              >
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full gap-4 py-12 text-center">
                    <div className="p-4 bg-indigo-500/10 rounded-full">
                      <Sparkles className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-white font-bold mb-1">Ready to Begin</p>
                      <p className="text-gray-500 text-sm">Click "Start Speaking" to begin your mock interview session.</p>
                    </div>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`group transition-all duration-200 ${
                      message.type === "user" ? "ml-0" : "ml-0"
                    }`}
                  >
                    <div
                      className={`rounded-2xl p-4 border transition-all ${
                        message.type === "user"
                          ? "bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40"
                          : "bg-gray-800/40 border-gray-700/30 hover:border-gray-600/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2.5">
                        <div className={`p-1 rounded-lg ${message.type === "user" ? "bg-blue-500/20" : "bg-indigo-500/20"}`}>
                          {message.type === "user" ? (
                            <User className="w-3 h-3 text-blue-400" />
                          ) : (
                            <Brain className="w-3 h-3 text-indigo-400" />
                          )}
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-widest ${message.type === "user" ? "text-blue-400" : "text-indigo-400"}`}>
                          {message.type === "user" ? "You" : "Saarthi AI"}
                        </span>
                        <span className="text-xs text-gray-600 ml-auto">
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-gray-200 text-sm leading-relaxed">{message.text}</p>
                    </div>
                  </div>
                ))}

                {/* Live typing indicator */}
                {transcribedText && !messages.find((m) => m.text === transcribedText) && (
                  <div className="rounded-2xl p-4 border bg-blue-500/5 border-blue-500/20 border-dashed">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Live Transcription</span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">{transcribedText}</p>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};