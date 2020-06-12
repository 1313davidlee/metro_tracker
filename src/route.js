import React, { useEffect, useState, useContext } from 'react';
import { getDistance } from 'geolib';
import axios from 'axios';
import './App.css';

const Route = (props) => {

    const [stationList, setStationList] = useState([])
    const [currentRoute, setCurrentRoute] = useState([])
    const [startStation, setStartStation] = useState(null)
    const [endStation, setEndStation] = useState(null)
    const [showResponse, setShowResponse] = useState(false)
    const [stationNames, setStationNames] = useState({})
    const [startDelta, setStartDelta] = useState(0)
    const [endDelta, setEndDelta] = useState(0)
    const [currentTrains, setCurrentTrains] = useState([])
    const [startLocation, setStartLocation] = useState(null)
    const [endLocation, setEndLocation] = useState(null)
    const [invalidLocation, setInvalidLocation] = useState(false)
    const [endLocationName, setEndLocationName] = useState(null)
    const [startLocationName, setStartLocationName] = useState(null)

    useEffect(() => {
        setStationList(props.stationList)
      }, [props.stationList])
    
    useEffect(() => {
        setStationNames(props.stationNames)
    }, [props.stationNames])
    
    
    useEffect(() => {
        setInvalidLocation(false)
        if (startStation && endStation) {
            if (startStation === endStation) {
                console.log('same location')
                setInvalidLocation(true)
            }
            else{
                var start = startStation
                var end = endStation
                axios.get(`${process.env.REACT_APP_ROUTE_API}?FromStationCode=${start}&ToStationCode=${end}&api_key=${process.env.REACT_APP_SECRET}`)
                .then((data) => setCurrentRoute(data.data['StationToStationInfos']))
            }
            
        }
    }, [startStation, endStation])

    useEffect(() => {
        console.log('blallal')
        if (startLocation && endLocation){
            console.log('calling handledestenter')
            handleDestinationEnter()
        }
    }, [startLocation, endLocation])

    useEffect(() => {
        if (startStation){
            var value = startStation
            console.log('calling api with station', value)
            axios.get(`${process.env.REACT_APP_PREDICTION_API}/${value}?api_key=${process.env.REACT_APP_SECRET}`)
              .then(payload => {
                setCurrentTrains(payload.data.Trains)
                console.log(payload.data.Trains)
              })
          }
 
    }, [startStation])
    

    const handleDestinationEnter = () => {
        var starter = findNearestStation(startLocation)
        var startDelta = starter[0]
        var startStation = starter[1]

        var ender = findNearestStation(endLocation)
        var endDelta = ender[0]
        var endStation = ender[1]

        console.log(startStation, endStation)
        setStartStation(startStation)
        setEndStation(endStation)
        setShowResponse(true)
        setStartDelta(startDelta)
        setEndDelta(endDelta)
    }

    function findNearestStation(inputLocation){
        var minDistance = Infinity
        var minStationCode = null
        stationList.map((station) => {
            var currDist = getDistance(
                                {latitude: station.Lat, longitude: station.Lon},
                                inputLocation) * 0.000621371
            if (currDist < minDistance){
                minDistance = currDist
                minStationCode = station.Code
            }
        })
        return [minDistance, minStationCode]
    }

    function generateResponse() {
        if (showResponse && currentRoute[0] && Object.keys(stationNames).length != 0){
            var start = stationNames[startStation]
            var end = stationNames[endStation]

            console.log(currentRoute[0])
            var routeData = currentRoute[0]

            return(
                <div  className='spacer'>
                    {invalidLocation ? <div id='responseStyle'>Must enter valid location pair</div> : 
                    <div id='responseStyle'>
                        <div className='double_bottom_space'><b>Recommended Route:</b></div>
                        <div className='bottom_space wrapper'><b>Depart from:</b> {start} ({startDelta.toFixed(2)} miles from {startLocationName})</div>
                        <div className='bottom_space wrapper'><b>Get off at: </b>{end} ({endDelta.toFixed(2)} miles to {endLocationName})</div> 
                        <div className='row  double_bottom_space'>
                            <div className='wrapper'><b>Ride time: </b>{routeData.RailTime} minutes</div>
                            <div className='wrapper'><b>Ride cost: </b>${routeData.RailFare.OffPeakTime}</div>
                        </div>
                        <div>
                            <div>
                                <div className='double_bottom_space'><b>Trains leaving from: {stationNames[startStation]}</b></div>
                                {(currentTrains.length > 0) ? currentTrains.map((item) => {
                                    return(
                                        <div className='wrapper row vertical_center'>
                                            <div style={{backgroundColor: getCustomColor(item.Line)}} className='spaceRight' id='lineIcon'></div>
                                            <b>{item.DestinationName}</b> : {getTrainStatus(item.Min)}
                                        </div>
                                    )}): 
                                    <div className='spacer'>No trains found</div>}
                            </div>
                        </div>
                      </div>}
                    </div>
            )
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

      var startItems = document.getElementsByClassName("startBut");
      var endItems = document.getElementsByClassName("endBut");
      const placesData = {}
      const placesNames = {}
      placesData['wp'] = {latitude: 38.902736, longitude: -77.0329657}
      placesData['curr'] = props.currentLocation
      placesData['rra'] = {latitude: 38.8512417, longitude: -77.0489863}
      placesData['gtwn'] = {latitude: 38.9048319, longitude: -77.0799871}
      placesNames['wp'] = 'The Washington Post'
      placesNames['curr'] = 'your current location'
      placesNames['rra'] = 'Ronald Reagan Airport'
      placesNames['gtwn'] = 'Georgetown'


      function handleStartClick(item, code){
        var object = document.getElementById(code + 'Start')
        if (object){
            clear();
            object.style.backgroundColor = 'gray';
            object.style.color = 'white'
            setStartLocation(placesData[code])
            setStartLocationName(placesNames[code])
        }
    

        function clear() {
            for(var i=0; i < startItems.length; i++) {
                var item = startItems[i];
                item.style.backgroundColor = 'white';
                item.style.color = 'black'
            }
        }
      }

      function handleEndClick(item, code){
        var object = document.getElementById(code + 'End')
        if (object){
            clear();
            object.style.backgroundColor = 'gray';
            object.style.color = 'white'

            setEndLocation(placesData[code])
            setEndLocationName(placesNames[code])
        }
    
        function clear() {
            for(var i=0; i < endItems.length; i++) {
                var item = endItems[i];
                item.style.backgroundColor = 'white';
                item.style.color = 'black'
            }
        }
      }

    return(
        <div>
            <div className='row spacer'>
                <div>
                    <div>Where are you starting?</div>
                    <div className='row'>
                        <div className='wrapper button startBut smallButtonWidth' id='currStart' onClick={() => handleStartClick(this, 'curr')}>Current Location</div>
                        <div className='wrapper button startBut smallButtonWidth' id='wpStart' onClick={() => handleStartClick(this, 'wp')}>The Washington Post</div>
                        <div className='wrapper button startBut smallButtonWidth' id='rraStart' onClick={() => handleStartClick(this, 'rra')}>Ronald Reagon Airport</div>
                        <div className='wrapper button startBut smallButtonWidth' id='gtwnStart' onClick={() => handleStartClick(this, 'gtwn')}>Georgetown</div>
                    </div>
                    <div>Where are you going?</div>
                    <div className='row'>
                        <div className='wrapper button endBut smallButtonWidth' id='currEnd' onClick={() => handleEndClick(this, 'curr')}>Current Location</div>
                        <div className='wrapper button endBut smallButtonWidth' id='wpEnd' onClick={() => handleEndClick(this, 'wp')}>The Washington Post</div>
                        <div className='wrapper button endBut smallButtonWidth' id='rraEnd' onClick={() => handleEndClick(this, 'rra')}>Ronald Reagon Airport</div>
                        <div className='wrapper button endBut smallButtonWidth' id='gtwnEnd' onClick={() => handleEndClick(this, 'gtwn')}>Georgetown</div>
                    </div>
                </div>
                {generateResponse()}
            </div>           
        </div>
    )
}

export default Route;