import React, { useEffect, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonSearchbar, IonItem, IonLabel, IonCheckbox } from '@ionic/react';
import './Tab2.css';
import { NativeStorage } from  '@ionic-native/native-storage';
import { isPlatform } from '@ionic/react';

var host_addr = "https://ades-backend-jsys.herokuapp.com/"
// var host_addr = "http://192.168.5.52:3000/"

var timeoutDuration = 30000;

function fillInRowsResult (data, setTableData, setTotalPopularity=null) {
  //genetate table rows
  var totalPopularity = 0;
  var performances = data.performances;
  var performance;
  var headers = data.headers;
  var schedule = data.result;
  var schedulePerformanceIDs = [];
  for (var x in schedule) {
    schedulePerformanceIDs.push(schedule[x].performanceid);
  }
  var addingSlot;
  var rows = [];
  var row = [];
  var keyCount = 0;
  var slotsNeeded;


  for (var p=0;p<performances.length;p++) {
    performance = performances[p];

    //GET PERFORMANCE LENGTH
    slotsNeeded = 0
    addingSlot = false;
    for (var h=0;h<headers.length;h++) { 
      if (headers[h].substr(0,8) == performance.starttime) {
        addingSlot = true;
      } else if (headers[h].substr(0,8) == performance.endtime) {
        addingSlot = false;
      } 
      if (addingSlot) {
        slotsNeeded++;
      } 
    }

    row = []
    for (var h=0;h<headers.length-slotsNeeded+1;h++) { 
      if (headers[h].substr(0,8) == performance.starttime) {
        if (schedulePerformanceIDs.includes(performance.performanceid)) {   
          if (performance.popularity) {
            row.push(<td key={keyCount++} className={'performaceSlotResult'} colSpan={slotsNeeded} >{performance.performanceid} ({performance.popularity})</td>);
            totalPopularity += performance.popularity;
          } else {
            row.push(<td key={keyCount++} className={'performaceSlotResult'} colSpan={slotsNeeded} >{performance.performanceid}</td>); 
          }
        } else {
          if (performance.popularity) {
            row.push(<td key={keyCount++} className={'performaceSlot'} colSpan={slotsNeeded} >{performance.performanceid} ({performance.popularity})</td>); 
          } else {
            row.push(<td key={keyCount++} className={'performaceSlot'} colSpan={slotsNeeded} >{performance.performanceid}</td>); 
          }
        }
      } else {
        row.push(<td key={keyCount++} className={'emptySlot'} ></td>);
      }

    }
    rows.push(row);
  }

  setTableData(rows);
  // setTotalPopularity(totalPopularity);
  if (setTotalPopularity) setTotalPopularity(totalPopularity);
}

function cache(url, performances, headers, result) {
  //cache in storage
  if (isPlatform('android')) {
    NativeStorage.setItem(url, {performances: performances, headers: headers, result: result})
    .then(
      () => console.log('Stored item as '+url),
      error => console.error('Error storing item', error)
    );
  }
}


function populateSchedule(type, festivalId, setError, setTableHeader, setTableData, setPerformances) {
  // var url = host_addr+"advanced/result/festival/startEnd?festivalId="+festivalId;
  var url = (type == 'basic') ? host_addr+"basic/result/festival/startEnd?festivalId="+festivalId : host_addr+"advanced/result/festival/startEnd?festivalId="+festivalId;

  const controller = new AbortController();
  const signal = controller.signal;
  const fetchPromise = fetch(url, {signal});
  const timeOutReq = setTimeout(() => controller.abort(), timeoutDuration);

  fetchPromise
    .then(res => res.json())
    .then(
      (result) => {
        console.log(result);
        clearTimeout(timeOutReq);

        if (result.error) {
          console.log("ERROR");
          setError(result); 
        } 

        var festivalStartTime = result.start.split(":");
        var date = new Date();
        date.setHours(festivalStartTime[0]);
        date.setMinutes(festivalStartTime[1]);
        date.setSeconds(festivalStartTime[2]);

        var time = date.toTimeString().substr(0,8);
        var timings = [];
        var headers = [];

        //Get timings every 30 mins
        while ( time <= result.end ) {
          timings.push(time);
          date.setMinutes(date.getMinutes() + 30);
          time = date.toTimeString().substr(0,8);
        }

        for (var t=0;t<timings.length-1;t++) {
          headers.push(timings[t]+" - "+timings[t+1]);
        }

        setTableHeader(headers);
        setPerformances(result.performances)

        var data = {
          headers: headers,
          performances: result.performances,
          result: null
        }

        fillInRowsResult(data, setTableData);

        cache(url, result.performances, headers, null);
      })
      .catch((error) => {
        setError(error);

        if (isPlatform('android')) {
          NativeStorage.getItem(url)
            .then(
              data => {console.log(data);
                setTableHeader(data.headers);
                setPerformances(data.performances); 

                fillInRowsResult(data, setTableData);
                
              },
              error => console.error("Record does not exist")
            );
        }
      })
  
}

function populateResultTable(type, festivalId, setError, setTableData, headers, performances, setTableHeader, setPerformances, setTotalPopularity=null) {
  // var url = host_addr+"basic/result?festivalId="+festivalId;
  var url = (type == 'basic') ? host_addr+"basic/result?festivalId="+festivalId : host_addr+"advanced/result?festivalId="+festivalId;

  const controller = new AbortController();
  const signal = controller.signal;
  const fetchPromise = fetch(url, {signal});
  const timeOutReq = setTimeout(() => controller.abort(), timeoutDuration);

  fetchPromise
    .then(res => res.json())
    .then(
      (result) => {
        console.log(result);
        clearTimeout(timeOutReq);

        if (result.error) {
          console.log("ERROR");
          setError(result); 
        } 

        var data = {
          headers: headers,
          performances: performances,
          result: result.result
        }

        
        fillInRowsResult(data, setTableData, setTotalPopularity);

        cache(url, performances, headers, result.result);
      })
      .catch((error) => {
        setError(error);
        if (isPlatform('android')) {
          NativeStorage.getItem(url)
            .then(
              data => {console.log(data);
                setTableHeader(data.headers);
                setPerformances(data.performances); 

                fillInRowsResult(data, setTableData, setTotalPopularity);

              },
              error => console.error("Record does not exist")
            );
        }
      })
}


function validation(festivalId) {
  if (!(/^\d+$/.test(festivalId))) {
    return false;
  } 
  return true;
}


const Tab2: React.FC = () => {
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);

  const [festivalId, setFestivalId] = useState(null);
  const [tableHeader, setTableHeader] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [checked, setChecked] = useState(false);
  const [checked2, setChecked2] = useState(false);
  const [performances, setPerformances] = useState([]);
  const [totalPopularity, setTotalPopularity] = useState(0);
  const [typeOfRV, setTypeOfRV] = useState('basic');

  useEffect(() => {
      
  }, []);


      return (
        <IonPage>
          <IonHeader>
            <IonToolbar>
              <div className="appName">Udystopia</div>
            </IonToolbar>
          </IonHeader>
    
          <IonContent>
            <h1>Schedule</h1>
            <IonSearchbar id="searchBarC" className="searchBar" value={festivalId} onIonChange={e => {setFestivalId(e.detail.value!);}} show-cancel-button="never" placeholder="Search festivalId"></IonSearchbar>
            
            <div id="searchB">
            <IonButton id="searchButton" color="dark" onClick={()=>{
              if (validation(festivalId)) {
                populateSchedule(typeOfRV,festivalId,setError,setTableHeader,setTableData,setPerformances);
                setChecked(false);
                setChecked2(false);
              }
              
            }}>Search</IonButton>

            </div>

            {/*toggle buttons*/}
            <div id="toggleB">
              <button
                id="toggleBasicB"
                onClick={() => {
                  setTypeOfRV('basic');
                  if (festivalId) populateSchedule('basic',festivalId,setError,setTableHeader,setTableData,setPerformances);
                  if (checked2) setChecked2(false);
                }}
              >
                Basic
              </button>

              <button
                id="toggleAdvancedB"
                onClick={() => {
                  setTypeOfRV('advanced');
                  if (festivalId) populateSchedule('advanced',festivalId,setError,setTableHeader,setTableData,setPerformances);
                  if (checked) setChecked(false);
                }}
              >
                Advanced
              </button>
            </div>


          <IonLabel id=""><b>Schedule for festivalId = '{festivalId}'</b></IonLabel>

            <table id="resultViewer">
              <thead>
                <tr>
                  {tableHeader.map((item, index) => (
                    <th key={index}>{item}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                
                {tableData.map((item,index)=> {
                  return <tr key={index}>{item}</tr>
                })}
  
              </tbody>
            </table>
            {tableData.length>0 && typeOfRV == 'basic' && <div id="checkboxSection">
              <IonItem lines="none">
                <IonLabel id="checkboxTitle">Show Me The Most Performances I Can Watch</IonLabel>
                <IonCheckbox id="checkbox" checked={checked} onIonChange={e => setChecked(e.detail.checked)} onClick={()=>{
                  if (checked && validation(festivalId) && tableHeader.length > 0) {
                    if (checked2) {
                      setChecked2(false);
                    }
                    populateResultTable(typeOfRV,festivalId, setError, setTableData, tableHeader, performances, setTableHeader, setPerformances)
                  } else {
                    populateSchedule(typeOfRV,festivalId,setError,setTableHeader,setTableData,setPerformances);
                  }
                  }}></IonCheckbox>
              </IonItem>
            </div>}

            {tableData.length>0 && typeOfRV == 'advanced' && <div id="checkboxSection2">
              <IonItem lines="none">
                <IonLabel id="checkboxTitle2">Show Me The Most <b>Popular</b> Performances I Can Watch</IonLabel>
                <IonCheckbox id="checkbox2" checked={checked2} onIonChange={e => setChecked2(e.detail.checked)} onClick={()=>{
                  if (checked2 && validation(festivalId) && tableHeader.length > 0) {
                    if (checked) {
                      setChecked(false);
                    }
                    populateResultTable(typeOfRV,festivalId, setError, setTableData, tableHeader, performances, setTableHeader, setPerformances, setTotalPopularity)
                  } else {
                    populateSchedule(typeOfRV,festivalId,setError,setTableHeader,setTableData,setPerformances);
                  }
                  }}></IonCheckbox>
              </IonItem>
            </div>}

            {typeOfRV == 'advanced' && <IonItem lines="none">
              <IonLabel id="">*Number inside brackets is popularity of particular performance</IonLabel>
            </IonItem>}

            {checked2 && <div id="">
              <IonItem lines="none">
                <IonLabel id=""><b>Total Popularity: {totalPopularity}</b></IonLabel>
              </IonItem>
            </div>}


          </IonContent>
        </IonPage>
      );

};

export default Tab2;
