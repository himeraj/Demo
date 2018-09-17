import React, { Component } from 'react';

import FusionCharts from 'fusioncharts/core';
import FusionMaps from 'fusioncharts/fusioncharts.maps';
import World from 'fusioncharts/maps/es/fusioncharts.world';
import ReactFC from 'react-fusioncharts';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';
import Line2D from 'fusioncharts/viz/line'

ReactFC.fcRoot(FusionCharts, FusionMaps, World, FusionTheme);
ReactFC.fcRoot(FusionCharts, Line2D);

class Connected2DLine extends Component {

    constructor() {
        super();
        this.state = {
            data : {},
            input : ''
        };
        this.handleChange = this.handleChange.bind(this);
    }

    responseToTimeSeriesData(randomNumResponse, dateTimeData) {
        let responseObj = [];
        var arrayLength = randomNumResponse.length;
        for (var i = 0; i < arrayLength; i++) {
            let data = {};
            data['label'] = dateTimeData[i];
            data['value'] = randomNumResponse[i];
            responseObj.push(data);
        }
        return responseObj;
    }

    getTimeSeries(count){
        let dateTimeArray = [];
        var d = new Date();
        var date = d.getDate();
        var month = d.getMonth()+1;
        var hours = d.getHours(); // Hour
        var h = hours >= 12 ? (hours-12) : hours; // Hours in 12hours format
        hours = hours >= 12 ? (hours-12)+" pm" : hours+" am"; // hours postfix with am or pm
        var meridiem = hours.substring(2,4); //AM or PM
        dateTimeArray[0] = month+"/"+date+" "+h+" "+meridiem;
        for(var i=1;i<=count;i++) {
            if(date === 1) {
                month = month-1;
            }
            if(h === 12) {
              if(meridiem === 'am'){
                date = date-1;
                h = 11;
                meridiem = "pm"
              } else {
                h = 11;
                meridiem = "am"
              }
            } else if(h === 1 && (meridiem === 'am' || meridiem === 'pm')){
                if(meridiem === 'pm'){
                    h = 12;
                    meridiem = 'pm';
                } else {
                    h = 12;
                    meridiem = 'am';
                }
            } else if(h === 0){
                h = 12-h;
                meridiem = meridiem==='am'?'pm':'am';
            } else {
                if(h ===1 ) {
                    h = 12;
                } else {
                    h = h-1;
                }
            }
            dateTimeArray[i] = month+"/"+date+" "+h+" "+meridiem;
        }
        return dateTimeArray;
    }

    displayTimeSeriesChart(){
        let count = this.state.input;
        const fetchConfig = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "jsonrpc": "2.0",
                "method": "generateIntegers",
                "params": {
                    "apiKey": "5bb9566b-5647-4704-9fbe-c2aafb79dd47",
                    "n": count,
                    "min": -100,
                    "max": 1000,
                    "replacement": false
                },
                "id": 42
            })
        };
        fetch('https://api.random.org/json-rpc/1/invoke', fetchConfig)
        .then(res =>  res.json())
        .then(e => {
            let randomNumData = e.result.random.data;
            let dateTimeData = this.getTimeSeries(count);
            let chartData = this.responseToTimeSeriesData(randomNumData, dateTimeData);
            this.setState({ data: chartData });
        });
    }

    handleChange(e) {
        this.setState({ input: e.target.value });
    }
    
    render(){
        const line2dconfig = {
            type: 'line', // The chart type
            width: '1200', // Width of the chart
            height: '400', // Height of the chart
            dataFormat: 'json', // Data type
            dataSource : {
                "chart": {
                    "labelDisplay": "Auto",
                    "useEllipsesWhenOverflow":"0",
                    "caption": "2D Connected line time series data",
                    "xAxisName": "Time Series",
                    "yAxisName": "Random Numbers",
                    "lineThickness": "2",
                    "theme": "fusion"
                },
                "data": this.state.data
            }
        };
        
        if(this.state.input === ''){
            return  (
                <div className="center">
                    <input type="text" onChange={ this.handleChange }></input>
                    <input type="button" value="Load"></input>
                </div>
            )
        } else {
            this.displayTimeSeriesChart();
            return  (
                <div className="center">
                    <input type="text" onChange={ this.handleChange }></input>
                    <input type="button" value="Load"></input>
                    <ReactFC {...line2dconfig} />
                </div>
            )
        }           
    }
}

export default Connected2DLine;