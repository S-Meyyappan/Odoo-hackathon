import { useState } from 'react'
import Addproject from "./pages/AddProject"
import { BrowserRouter as Router } from 'react-router-dom'
import Approutes from './routes/route'

function App() {

  return (
    <Router> 
      <Approutes/>
    </Router>
  )
}

export default App
