
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import LandingPage from './pages/LandingPage'
import BookingPage from './pages/BookingPage'
import SignUpPage from './pages/SignUpPage'
import SignInPage from './pages/SignInPage'
import { NavbarContext } from './context/AllContext'
import { useState } from 'react'



function App() {

  const [selectedNavbar, setSelectedNavbar] = useState("Home")
  const [showSignin, setShowSignin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [currentUser, setCurrentUser] = useState({})
  return (
    <>
      <NavbarContext.Provider
        value={{
          selectedNavbar,
          setSelectedNavbar,
          showSignin,
          setShowSignin,
          showSignup,
          setShowSignup,
          currentUser,
          setCurrentUser
        }}
      >
          <BrowserRouter>
            <Routes>
              <Route path='/' element={<LandingPage />} />
              <Route path='/booking' element={<BookingPage />} />
              <Route path='/sign-up' element={<SignUpPage />} />
              <Route path='/sign-in' element={<SignInPage />} />
            </Routes>
          </BrowserRouter>
      </NavbarContext.Provider>

    </>
  )
}

export default App
