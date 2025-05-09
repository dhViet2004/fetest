import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { CartProvider } from './context/CartContext'
import { NotifyProvider } from './context/NotifyContext.jsx'

import './index.css'
import App from './App.jsx'
const clientId = "529229710013-4hem1vqpc1vbjp649sqgjo4gso04b676.apps.googleusercontent.com"
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <CartProvider>
        <NotifyProvider>
          <App />
        </NotifyProvider>
      </CartProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
