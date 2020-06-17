import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Route from './route.js'
import Tracker from './tracker.js'
import './App.css';

const App = () => {

  const [view, setView] = useState('track')
  const [stationList, setStationList] = useState([])
  const [currentLocation, setCurrentLocation] = useState(null)
  const [stationNames, setStationNames] = useState({})

  useEffect(() => {
    document.getElementById('track').checked = true
  }, [])

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_RAIL_INFO_API}/jStations?api_key=${process.env.REACT_APP_SECRET}`)
        .then((data) => setStationList(data.data.Stations));
        
    }, [])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) =>{
      setCurrentLocation({latitude: position.coords.latitude, longitude: position.coords.longitude})
    })
  }, [])

  useEffect(() => {
    var temp_dict = {}
    if (stationList.length){
      stationList.map((station) => {
        temp_dict[station.Code] = station.Name
      })

      setStationNames(temp_dict)
    }
  }, [stationList])


  const handleViewToggle = () => {
    if(document.getElementById('track').checked){
      setView('track')
    }
    else{
      setView('plan')
    }
  }

 
  function renderMainBody() {
    if (view === 'track') {
      return(
        <Tracker stationList={stationList} currentLocation={currentLocation}></Tracker>

      )
    }
    else{
      return(
        <Route 
          stationList={stationList}
          currentLocation={currentLocation}
          start={'A06'}
          end={'A09'}
          stationNames={stationNames}>
        </Route>
      )
    }
  }

  return (
    <div className="App row">
      <div className=''>
        <div className='spacer title noBottom'>WMATA Live Train Tracker and Planner</div>
        <div className='spacer column noBottom'>
          <div className='bottom_space'>
            <input type="radio" id="track" name="view" value="track" onClick={handleViewToggle}></input>
            <label className=' space_left' htmlFor='track'>Train Tracker</label>
          </div>
          <div className='bottom_space'>
            <input  className='space_right' type="radio" id="plan" name="view" value="plan" onClick={handleViewToggle}></input>
            <label className='space_left' htmlFor='plan'>Trip Planner </label>
          </div>
        </div>
        {renderMainBody()}   
      </div>    
    </div>
  );
}

export default App;
