import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import './App.css';


const LineMap = props => {
    const [lineData, setLineData] = useState(null)
    const [lineName, setLineName] = useState(null)
    const [lineRoute, setLineRoute] = useState([])
    const [currentStation, setCurrentStation] = useState(null)

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
            return '#8fc1ff'
          case 'GR':
            return '#abd1af'
          case 'SV':
            return '#c2c2c2'
          case 'YL':
            return '#ffe999'
        }
      }

    return(
        <div >
            <div className='double_bottom_space'><b>Map of the {lineName} line</b></div>
            {lineRoute.length && lineRoute.map((stop, i) => {
                return(
                    <div>
                        <div className='row vertical_align'>
                            <div className='stopIconBorder centerContent vertical_center'>
                                <div style={{backgroundColor: getCustomColor(stop.LineCode)}} className='stopIcon'></div>
                            </div>
                            { currentStation && currentStation === stop.StationCode ? 
                                <div className='spaceLeft medTitle spaceTop'><b>{stop.StationName}</b></div>:
                                <div className='spaceLeft  spaceTop'>{stop.StationName}</div>
                            }       
                        </div>
                        {i === lineRoute.length - 1 ? <div className='spacer'></div> : <div className='stopLine'></div>}
                    </div>

                )
            })}

        </div>
        
        

    )
}

export default LineMap