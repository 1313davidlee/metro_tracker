import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LineMap from './linemap.js'
import './App.css';


const PositionMap = props => {

    const [positions, setPositions] = useState(null)
    const [lineCode, setLineCode] = useState('BL')
    const [currentLine, setCurrentLine] = useState(null)
    const [trainLocations, setTrainLocations] = useState(null)
    const [finalDict, setFinalDict] = useState(null)

    const [lineData, setLineData] = useState(null)
    const [lineName, setLineName] = useState(null)
    const [lineRoute, setLineRoute] = useState([])
    const [currentStation, setCurrentStation] = useState(null)
    const [incidentList, setIncidentList] = useState([])
    const [finalIncidentList, setFinalIncidentList] = useState([])

    useEffect(() =>{
        document.getElementById("lineMapParent").style.display = 'inherit'

    })


    useEffect(() => {
        if(props.lineMap){
            axios.get(`${process.env.REACT_APP_LINE_API}?api_key=${process.env.REACT_APP_SECRET}`)
            .then(data => {
                var lineArray = data.data.Lines
                lineArray.map((line) => {
                    if (line.LineCode === props.lineMap){
                        setLineName(line.DisplayName)
                        setLineData(line)
                    
                    }  
                })
            })
        }
    }, [props.lineMap])

    useEffect(()=>{
        if(props.currentStation){
            setCurrentStation(props.currentStation)
        }
    }, [props.currentStation])

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_INCIDENT_API}?api_key=${process.env.REACT_APP_SECRET}`)
         .then((data) => {
           setIncidentList(data.data.Incidents)
         })
      }, [])


    useEffect(() => {
        if(lineData){
            var station1 = lineData.StartStationCode
            var station2 = lineData.EndStationCode
            axios.get(`${process.env.REACT_APP_STATION_PATH_API}?FromStationCode=${station1}&ToStationCode=${station2}&api_key=${process.env.REACT_APP_SECRET}`)
            .then(data => {
                setLineRoute(data.data.Path)
                console.log(data.data.Path)

            })
        }
    }, [lineData])

    function getCustomColor(line) {
        switch(line) {
          case 'RD':
            return '#f76f6f'
          case 'BL':
            return '#8fc1ff'
          case 'OR':
            return '#ff9900'
          case 'GR':
            return '#abd1af'
          case 'SV':
            return '#c2c2c2'
          case 'YL':
            return '#ffe999'
        }
      }


    useEffect(() => {
        if (props.lineMap && incidentList){
            const incidentArray = []
            var line = props.lineMap
            incidentList.map((incident) => {
                if(incident.LinesAffected.includes(line)){
                    if (!incidentArray.includes(incident.Description)){
                        console.log('mango')

                        incidentArray.push(incident.Description)
                    }
                }
            })
            setFinalIncidentList(incidentArray)
        }
    }, [incidentList, props.lineMap])







    useEffect(() => {
        axios.get(`${process.env.REACT_APP_POSITION_API}StandardRoutes?contentType=json&api_key=${process.env.REACT_APP_SECRET}`)
         .then((data) => {
           setPositions(data.data.StandardRoutes)
         })
      }, [])

      useEffect(() => {
          axios.get(`${process.env.REACT_APP_TRAIN_POSITION_API}?contentType=json&api_key=${process.env.REACT_APP_SECRET}`)
          .then((data) => {
              console.log('curr pos loc', data)
              setTrainLocations(data.data.TrainPositions)
          })
      }, [])

    useEffect(() => {
        if(positions && lineCode) {
            positions.map((line) => {
                if (line.LineCode === lineCode){
                    setCurrentLine(line)
                    console.log('blah', line)

                }
            })
        }
    }, [lineCode, positions])

    useEffect(() => {

        if (currentLine){
            var final_dict = {}
            var station_dict = {}

            var count = 0
            var temp = []
            currentLine.TrackCircuits.map((point) => {
                count += 1
                if (point.StationCode !== null){
                    station_dict[point.CircuitId] = count

                    temp.map((id) => {
                        station_dict[id] = count
                    })
                    temp = []
                    count = 0
                }
                else{
                    temp.push(point.CircuitId)
                }
            })
            var count2 = 0
            var temp2 = []
            currentLine.TrackCircuits.map((point) => {
                count2 += 1
                final_dict[point.CircuitId] = [count2, station_dict[point.CircuitId], point.StationCode] 
                if (point.StationCode !== null){
                    count2 = 0
                    temp2.map((id) => {
                        final_dict[id][2] = point.StationCode
                    })
                    temp2 = []
                }
                else{
                    temp2.push(point.CircuitId)
                }
                
            })
            console.log(final_dict)
            setFinalDict(final_dict)
        }
    }, currentLine)






      return(
          <div style={{paddingLeft: '80px', paddingBottom: '80px'}}>
            

            


        <div id='lineMapParent'>

            {lineRoute.length && lineRoute.map((stop, i) => {
                return(
                    <div>
                        <div className='row'>
                            {i === 0 ? <div className='spacer'></div> : <div className='longStopLine'></div>}
                            {trainLocations && finalDict && trainLocations.map((train) => {
                                var data = finalDict[train.CircuitId]
                                console.log(data)
                                
                                if (data && data[2] === stop.StationCode){
                                    return(
                                        <div className='spaceLeft trainDot' style={{marginTop: `${(60 * data[0] / data[1]) + 60}px`}}></div>
                                    )
                                }
                                console.log('data from train', data)
                            })}
                        </div>
                        

                        <div className='row vertical_align'>
                            <div className='stopIconBorder centerContent vertical_center'>
                                <div style={{backgroundColor: getCustomColor(stop.LineCode)}} className='stopIcon'></div>
                            </div>
                            { currentStation && currentStation === stop.StationCode ? 
                                <div className='spaceLeft medTitle spaceTop'><b>{stop.StationName}</b></div>:
                                <div className='spaceLeft  spaceTop'>{stop.StationName}</div>
                            }       
                        </div>
                        
                    </div>

                )
            })}

        </div>
            
          </div>

          
      )

    


}

export default PositionMap