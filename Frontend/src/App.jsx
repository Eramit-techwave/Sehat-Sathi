import React, { useState } from 'react'

function App() {
  const [testCount, setTestCount] = useState(0)

  return (
    <div className="min-h-screen bg-brand-light flex flex-col items-center justify-center p-6 font-sans bg-emerald-50/50">
      {/* Main Container Card */}
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-emerald-100">
        
        {/* App Branding Header */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-3xl">🚀</span>
          <h1 className="text-3xl font-extrabold text-emerald-800 tracking-tight">
            Sehat-Sathi
          </h1>
        </div>
        
        <p className="text-gray-600 mb-6 font-medium">
          Frontend Core Layer Engine is now fully integrated with Tailwind CSS!
        </p>

        {/* Dynamic Tailwind Interactive Component */}
        <div className="bg-emerald-50 p-4 rounded-xl mb-6 border border-emerald-200">
          <p className="text-sm text-emerald-800 font-semibold mb-2">
            Interactive State Test:
          </p>
          <span className="text-2xl font-bold text-emerald-600">
            {testCount} Click{testCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Premium Tailwind Styled Button */}
        <button 
          onClick={() => setTestCount(testCount + 1)}
          className="w-full bg-emerald-600 hover:bg-emerald-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
        >
          Test UI Trigger
        </button>

      </div>
      
      {/* Footer Status Badge */}
      <p className="mt-6 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
        ● Architecture Layer 2 Status: Live & Secure
      </p>
    </div>
  )
}

export default App