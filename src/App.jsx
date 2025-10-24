import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'

function App() {
  // State: message list, input text, and loading flag
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  // CHANGE: Add background theme state
  const [background, setBackground] = useState('default')

  // Ref: used to auto-scroll to bottom as new messages arrive
  const endRef = useRef(null)

  // Auto-scroll whenever messages or loading state change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // CHANGE: Background options for chat area
  const backgrounds = {
    default: 'bg-gradient-to-b from-white to-gray-50',
    ocean: 'bg-gradient-to-b from-blue-50 to-cyan-50',
    sunset: 'bg-gradient-to-b from-orange-50 to-pink-50',
    forest: 'bg-gradient-to-b from-green-50 to-emerald-50',
    lavender: 'bg-gradient-to-b from-purple-50 to-violet-50',
    rose: 'bg-gradient-to-b from-rose-50 to-pink-50',
    dark: 'bg-gradient-to-b from-gray-800 to-gray-900'
  }

  // CHANGE: Outer background options
  const outerBackgrounds = {
    default: 'bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800',
    ocean: 'bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-700',
    sunset: 'bg-gradient-to-br from-orange-500 via-pink-600 to-red-700',
    forest: 'bg-gradient-to-br from-green-600 via-emerald-600 to-teal-800',
    lavender: 'bg-gradient-to-br from-purple-500 via-violet-600 to-purple-800',
    rose: 'bg-gradient-to-br from-rose-500 via-pink-600 to-rose-800',
    dark: 'bg-gradient-to-br from-gray-900 via-gray-800 to-black'
  }

  // Sends the user's message and requests an AI reply.
  // Keeps only the last 10 messages (user+assistant) for context.
  function sendMessage() {
    const text = question.trim()
    if (!text || loading) return

    // Clear the input immediately after sending
    setQuestion('')

    // 1) Append the user message to the conversation
    const userMsg = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]

    // 2) Limit context to last 10 messages for the API call
    const messagesToSend = newMessages.slice(-10)

    // 3) Update UI immediately and show typing indicator
    setMessages(newMessages)
    setLoading(true)

    // 4) Prepare OpenRouter request (uses your VITE_OPENROUTER_API_KEY)
    const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY
    const url = 'https://openrouter.ai/api/v1/chat/completions'

    // 5) Call the chat completions API with the limited context
    axios
      .post(
        url,
        {
          model: 'gpt-4o-mini',
          messages: messagesToSend
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`
          }
        }
      )
      .then((response) => {
        const botReply = response.data.choices[0]?.message?.content || ''
        const updated = [...newMessages, { role: 'assistant', content: botReply }]
        setMessages(updated.slice(-10))
      })
      .finally(() => {
        setLoading(false)
      })
  }

  // Enter to send (Shift+Enter to add a newline if you switch to textarea in future)
  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Clear Chat: resets the entire conversation and input
  function clearChat() {
    setMessages([])
    setQuestion('')
  }

  // Simple logo SVG (used in header)
  const Logo = () => (
    <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="g1" x1="2" y1="2" x2="22" y2="12">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
      <path d="M12 2 2 7l10 5 10-5-10-5Z" fill="url(#g1)" />
      <path d="M2 12l10 5 10-5" stroke="url(#g1)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="9.5" cy="9.5" r="0.8" fill="white" />
      <circle cx="14.5" cy="9.5" r="0.8" fill="white" />
    </svg>
  )

  // CHANGE: Smaller welcome logo to fit without scroll
  const WelcomeLogo = () => (
    <svg className="w-20 h-20 sm:w-24 sm:h-24" viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="welcomeGrad1" x1="10" y1="10" x2="90" y2="50">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
        <linearGradient id="welcomeGrad2" x1="10" y1="50" x2="90" y2="90">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
      <path d="M50 10 L10 30 L50 50 L90 30 Z" fill="url(#welcomeGrad1)" opacity="0.9" />
      <path d="M10 50 L50 70 L90 50" stroke="url(#welcomeGrad2)" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
      <path d="M10 60 L50 80 L90 60" stroke="url(#welcomeGrad2)" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
      <circle cx="40" cy="40" r="3" fill="white" />
      <circle cx="60" cy="40" r="3" fill="white" />
    </svg>
  )

  return (
    <div className={`min-h-screen ${outerBackgrounds[background]} flex items-center justify-center md:p-4 transition-all duration-500`}>
      {/* CHANGE: Full screen on mobile, centered box on desktop */}
      <div className="w-full h-screen md:h-[90vh] md:max-h-[750px] md:max-w-3xl md:rounded-3xl bg-white/95 backdrop-blur shadow-2xl overflow-hidden flex flex-col">
        {/* CHANGE: Compact header with new name "CogniBot" */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-white rounded-xl p-1.5 sm:p-2 shadow">
              <Logo />
            </div>
            <div>
              <h1 className="text-white text-lg sm:text-xl md:text-2xl font-bold tracking-tight">
                CogniBot
              </h1>
              <p className="text-purple-100 text-[9px] sm:text-[10px] md:text-xs">Intelligent AI Conversations</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* CHANGE: Background theme dropdown */}
            <select
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg bg-white/10 text-white border border-white/30 hover:bg-white/20 transition cursor-pointer outline-none"
              title="Change background theme"
            >
              <option value="default" className="text-gray-900">Default</option>
              <option value="ocean" className="text-gray-900">Ocean</option>
              <option value="sunset" className="text-gray-900">Sunset</option>
              <option value="forest" className="text-gray-900">Forest</option>
              <option value="lavender" className="text-gray-900">Lavender</option>
              <option value="rose" className="text-gray-900">Rose</option>
              <option value="dark" className="text-gray-900">Dark</option>
            </select>
            <button
              onClick={clearChat}
              className="text-white/90 border border-white/30 hover:border-white/60 hover:bg-white/10 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* CHANGE: Fixed height scrollable chat area with dynamic background */}
        <div className={`flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-3 space-y-3 ${backgrounds[background]} ${background === 'dark' ? 'text-white' : ''}`}>
          {/* CHANGE: Compact welcome screen */}
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full py-4 animate-fadeIn">
              <WelcomeLogo />
              <h2 className={`mt-3 text-xl sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600`}>
                Welcome to CogniBot
              </h2>
              <p className={`mt-2 text-center max-w-md text-[11px] sm:text-xs md:text-sm px-4 ${background === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Your intelligent AI assistant with customizable themes and context-aware conversations. 
                Ask questions, get insights, and explore ideas.
              </p>
              {/* CHANGE: Compact feature cards */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 px-4 max-w-2xl w-full">
                <div className={`${background === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-white border-purple-100'} border rounded-xl p-2.5 sm:p-3 text-center shadow-sm`}>
                  <div className="text-lg sm:text-xl mb-1">💡</div>
                  <h3 className={`font-semibold text-[11px] sm:text-xs ${background === 'dark' ? 'text-white' : 'text-gray-800'}`}>Smart Answers</h3>
                  <p className={`text-[9px] sm:text-[10px] mt-0.5 ${background === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Accurate responses</p>
                </div>
                <div className={`${background === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-white border-purple-100'} border rounded-xl p-2.5 sm:p-3 text-center shadow-sm`}>
                  <div className="text-lg sm:text-xl mb-1">🎨</div>
                  <h3 className={`font-semibold text-[11px] sm:text-xs ${background === 'dark' ? 'text-white' : 'text-gray-800'}`}>Custom Themes</h3>
                  <p className={`text-[9px] sm:text-[10px] mt-0.5 ${background === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>7 beautiful themes</p>
                </div>
                <div className={`${background === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-white border-purple-100'} border rounded-xl p-2.5 sm:p-3 text-center shadow-sm`}>
                  <div className="text-lg sm:text-xl mb-1">⚡</div>
                  <h3 className={`font-semibold text-[11px] sm:text-xs ${background === 'dark' ? 'text-white' : 'text-gray-800'}`}>Fast & Reliable</h3>
                  <p className={`text-[9px] sm:text-[10px] mt-0.5 ${background === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Lightning-fast</p>
                </div>
              </div>
            </div>
          )}

          {/* Chat messages */}
          {messages.map((m, i) => {
            const isUser = m.role === 'user'
            return (
              <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm ${
                    isUser
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                      : background === 'dark' 
                        ? 'bg-gray-700 text-white border border-gray-600'
                        : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <div className={`prose prose-sm max-w-none prose-p:my-0 prose-strong:font-semibold prose-headings:my-0 ${background === 'dark' && !isUser ? 'prose-invert' : ''} prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded text-xs sm:text-sm`}>
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className={`max-w-[80%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm ${background === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-200'} border`}>
                <div className="flex items-center gap-2 text-purple-600">
                  <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs sm:text-sm font-medium ml-1">Thinking…</span>
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* CHANGE: Compact composer */}
        <div className="border-t border-gray-200 bg-white px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 flex-shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type a message and press Enter…"
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition text-xs sm:text-sm"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !question.trim()}
              className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
            >
              Send
            </button>
          </div>
          <p className="text-[9px] sm:text-[10px] text-gray-400 mt-1 sm:mt-1.5">Press Enter to send</p>
        </div>
      </div>
    </div>
  )
}

export default App
