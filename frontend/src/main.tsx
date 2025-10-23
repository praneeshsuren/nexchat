import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from '@asgardeo/auth-react'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider
      config={{
        signInRedirectURL: "http://localhost:5173/",
        signOutRedirectURL: "http://localhost:5173/",
        baseUrl: "https://api.asgardeo.io/t/praneesh",
        clientID: "LBkYPqD3Ly2p7SDUW4QMLlezoWQa",
        scope: ["openid", "profile"],
      }}
    >
      <App />
    </AuthProvider>
  </StrictMode>,
)
