import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'

const navOrder = ['/', '/about', '/services', '/contact-us']

function App() {
  const location = useLocation()
  const [prevPath, setPrevPath] = useState(location.pathname)
  const [direction, setDirection] = useState('')

  if (prevPath !== location.pathname) {
    const currentIdx = navOrder.indexOf(location.pathname)
    const prevIdx = navOrder.indexOf(prevPath)
    setDirection(
      currentIdx !== -1 && prevIdx !== -1 && currentIdx !== prevIdx
        ? currentIdx > prevIdx
          ? 'page-enter-right'
          : 'page-enter-left'
        : ''
    )
    setPrevPath(location.pathname)
  } 

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1">
        <div key={location.pathname} className={direction}>
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default App
