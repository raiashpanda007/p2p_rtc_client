
import Sender from './Components/Sender'
import Reciever from './Components/Reciever'
import { Route, BrowserRouter, Routes } from 'react-router-dom'
import './App.css'

function App () {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/sender' element={<Sender />} />
        <Route path='/reciever' element={<Reciever />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App
