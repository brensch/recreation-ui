import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Button from '@mui/material/Button';

function App() {

  const [thing, setThing] = useState(0)

  return (
    <div className="App">
      <Button variant="text" onClick={() => {
        setThing(thing + 1)
        console.log(thing)
      }
      }>Text</Button>

    </div>
  );
}

export default App;
