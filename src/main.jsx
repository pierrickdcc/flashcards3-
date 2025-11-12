import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { FlashcardProvider } from './context/FlashcardContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FlashcardProvider>
      <App />
    </FlashcardProvider>
  </StrictMode>,
)
