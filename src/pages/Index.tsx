import React from 'react';

// Simple test - temporarily removed all complex imports
const Index = () => {
  return (
    <div style={{ padding: '20px', fontSize: '24px' }}>
      <h1>Тест загрузки сайта</h1>
      <p>Если вы видите этот текст, React работает!</p>
      <p>Время: {new Date().toLocaleTimeString()}</p>
    </div>
  );
};

export default Index;