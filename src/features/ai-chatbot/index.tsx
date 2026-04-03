import React from 'react';

const Chatbot = () => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#7aa2f7',
        color: 'white',
        padding: '10px 15px',
        borderRadius: '25px',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        fontSize: '14px',
        fontWeight: '500'
      }}>
        💬 AI Assistant
      </div>
    </div>
  );
};

export default Chatbot;
