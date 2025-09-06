import { useState } from 'react'
import Addproject from "./pages/AddProject"
import { BrowserRouter as Router } from 'react-router-dom'

function App() {

  return (
    <Router> 
      <Addproject/>
    </Router>
  )
}

export default App
