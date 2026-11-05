import { Outlet, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'

function App() {
  const location = useLocation()

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1 pt-[76px]">
        <div key={location.pathname} className="page-enter-up">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default App
