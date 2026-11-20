import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App'

const ArtSheet = lazy(() => import('./dev/ArtSheet'))
const dev = new URLSearchParams(location.search).has('art')

createRoot(document.getElementById('root')!).render(
  <StrictMode>{dev ? <Suspense fallback={null}><ArtSheet /></Suspense> : <App />}</StrictMode>,
)

if ('serviceWorker' in navigator && location.hostname !== 'localhost') {
  window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}) })
}
