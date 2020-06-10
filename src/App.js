import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {

  const [stationList, setStationList] = useState([])
  const [selectedStation, setSelectedStation] = useState(null)
  const [selectedStationName, setSelectedStationName] = useState(null)
  const [currentTrains, setCurrentTrains] = useState([])

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_RAIL_INFO_API}/jStations?api_key=${process.env.REACT_APP_SECRET}`)
      .then((data) => setStationList(data.data.Stations));
  }, [])

  


  const handleStationSelect = (event) => {
    setSelectedStation(event.target.value)

    
    axios.get(`${process.env.REACT_APP_PREDICTION_API}/${event.target.value}?api_key=${process.env.REACT_APP_SECRET}`)
      .then(payload => {
        payload.data.Trains.length && setSelectedStationName(payload.data.Trains[0].LocationName)
        setCurrentTrains(payload.data.Trains)
      })
  
  }

  return (
    <div className="App">
      <label htmlFor='stations'>Stations:</label>
      {stationList.length && (
      <select name='stations' onChange={handleStationSelect}>
        {stationList.map((item) => {
          return(<option value={item.Code}>{item.Name}</option>)
        })}
      </select> )}
      {selectedStationName && <div>Current Station: {selectedStationName} </div>}

      <div>
        {currentTrains.map((item) => {
          return(
            <div>A train to {item.DestinationName} is {item.Min} minutes away on the {item.Line} line.</div>
          )
        })}
      </div>
    </div>
  );
}

export default App;
