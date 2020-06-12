import React, { useEffect, useState, useContext } from 'react';
import { getDistance } from 'geolib';
import LineMap from './linemap.js'
import axios from 'axios';
import './App.css';


const Tracker = (props) => {


  const [stationList, setStationList] = useState([])
  const [selectedStation, setSelectedStation] = useState(null)
  const [selectedStationName, setSelectedStationName] = useState(null)
  const [currentTrains, setCurrentTrains] = useState([])
  const [selectedDistance, setSelectedDistance] = useState(0)
  const [updateTime, setUpdateTime] = useState(null)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [renderLineMap, setRenderLineMap] = useState(false)
  const [lineMap, setLineMap] = useState(null)

  useEffect(() => {
    setStationList(props.stationList)
  }, [props.stationList])

  useEffect(() => {
    setCurrentLocation(props.currentLocation)
  }, [props.currentLocation])

  useEffect(() => {
    const interval = setInterval(() => {
      getTrainData(selectedStation)
    }, 10000);
    return () => clearInterval(interval);
  }, [selectedStation]);

  const handleNearestStationClick = () => {
    var minDistance = Infinity
    var closestStation = null
    var closestStationName = null

    stationList.map((station) =>{
        var currDistance = getDistance({currentLocation}.currentLocation, {
          latitude: station.Lat,
          longitude: station.Lon
        })
                    
        if (currDistance < minDistance){
          minDistance = currDistance
          closestStation = station.Code
          closestStationName = station.Name
        }
    })
    document.getElementById('stationSelect').value=closestStation
    setSelectedStation(closestStation)
    getTrainData(closestStation)
    setSelectedStationName(closestStationName)
    setSelectedDistance(minDistance * 0.000621371)
  }

  const handleStationSelect = (event) => {stationList.map((station) => {
    if (station.Code === event.target.value){
      setSelectedStationName(station.Name)
      setSelectedDistance(getDistance({currentLocation}.currentLocation, 
                                        {latitude: station.Lat,
                                        longitude: station.Lon}) * 0.000621371)
    }
  })
    setSelectedStation(event.target.value)
    getTrainData(event.target.value)
  }

  function getTrainStatus(min){
    if (min === 'BRD'){
      return <b> BOARDING NOW</b>
    }
    else if (min === 'ARR'){
      return <b> ARRIVING NOW</b>
    }
    else{
      return `${min} minute${(min > 1) ? 's' : ''} away`
    }
  }

  function getCustomColor(line) {
    switch(line) {
      case 'RD':
        return '#f76f6f'
      case 'BL':
        return '#8fc1ff'
      case 'OR':
        return '#8fc1ff'
      case 'GR':
        return '#abd1af'
      case 'SV':
        return '#c2c2c2'
      case 'YL':
        return '#ffe999'
    }
  }

  function getTrainData(value) {
    if (value){
      console.log('calling api with station', value)
      axios.get(`${process.env.REACT_APP_PREDICTION_API}/${value}?api_key=${process.env.REACT_APP_SECRET}`)
        .then(payload => {
          payload.data.Trains.length && setSelectedStationName(payload.data.Trains[0].LocationName)
          setCurrentTrains(payload.data.Trains)
          setUpdateTime(new Date().toLocaleTimeString())
        })
    }
    
  }

  function getSelectedStationDistance() {
    if (selectedDistance > 0){
      return(`(${selectedDistance.toFixed(2)} miles from you)`)
    }
  }

  const handleLineClick = (lineKey) => {
    setRenderLineMap(true)
    setLineMap(lineKey)

  }

  return (
    <div className='row fillWidth'>
       <div>
          <div className='row vertical_center'>
          <div className='button largeButtonWidth spacer' onClick={handleNearestStationClick}>Get Nearest Station</div>
          <div className='spacer'>or</div>
          <div className='column spacer'>
            <label className='bottom_space' htmlFor='stations'>Select Station: </label>
          
          
            {stationList.length && (
            <select name='stations' id='stationSelect' onChange={handleStationSelect}>
              <option selected disabled hidden style={{display: 'none'}} value=''></option>
              {stationList.map((item) => {
                return(<option key={item.Code} value={item.Code}>{item.Name}</option>)
              })}
            </select> )}
          </div>
        </div>

        {selectedStationName && 
        <div >
          
          <div className='spaceLeft'>Trains leaving from <b>{selectedStationName}</b> {getSelectedStationDistance()} </div>
          <div className='spaceLeft subtitle'>{(updateTime != null) ? `Last updated at ${updateTime}` : ''}</div>
          <div className='spaceLeft subtitle'>Click on the line icon to see more details</div>
        </div>}
        <div>
          {(currentTrains.length > 0) ? 
            currentTrains.map((item) => {
              return(
                <div className='wrapper spacer row vertical_center'>
                  <div style={{backgroundColor: getCustomColor(item.Line)}} className='spaceRight cursor' id='lineIcon' onClick={() => handleLineClick(item.Line)}></div>
                  <b>{item.DestinationName}</b> : {getTrainStatus(item.Min)}
                </div>
              )}): 
              <div className='spacer'>{(selectedStation === null) ? '' : 'No trains found'}</div>}
        </div>
      </div>
      <div className='extraSpaceLeft fillParent'>
        {renderLineMap ? <LineMap lineMap={lineMap} currentStation={selectedStation}></LineMap> : ''}
      </div>    
    </div>

  )
}

export default Tracker;