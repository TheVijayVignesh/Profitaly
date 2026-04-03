import React from 'react'

function App() {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#1a1b26',
      color: '#c0caf5',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#3498DB', marginBottom: '20px' }}>Profitaly</h1>
      <p style={{ fontSize: '18px', marginBottom: '20px' }}>
        Your financial trading platform is working!
      </p>
      <div style={{ 
        backgroundColor: '#24283b', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid #30374b'
      }}>
        <h2 style={{ color: '#7aa2f7', marginBottom: '10px' }}>Welcome</h2>
        <p>This is a minimal test to ensure the app loads correctly.</p>
      </div>
    </div>
  )
}

export default App
