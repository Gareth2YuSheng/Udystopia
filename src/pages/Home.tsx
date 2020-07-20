import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonButton,
  IonCardHeader,
  IonSearchbar,
  IonIcon,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonGrid, 
  IonRow, 
  IonCol,
  IonSegment, 
  IonSegmentButton,
  IonLoading
} from "@ionic/react";
import "./Home.css";
import { useTable } from "react-table";
import styled from "styled-components";
import {
  arrowForwardCircleOutline,
  arrowBackCircleOutline
} from "ionicons/icons";

import { NativeStorage } from  '@ionic-native/native-storage';
import { isPlatform } from '@ionic/react';

var host_addr = "https://ades-backend-jsys.herokuapp.com/"
// var host_addr = "http://192.168.5.52:3000/"

var timeoutDuration = 30000;

//data table style
const Styles = styled.div`
  table {
    tr {
      font-family: 'Fjalla One', sans-serif;
    }
    text-align: center;
    margin: 0px auto;
    width: 100%;
    border: 3px solid black;
    th,
    td {
      padding: 5px;
      border: 3px solid black;
      width: 20%;
    }
    th {
      font: normal 100% "mohaveMedium";
      background-color: var(--ion-color-pink);
      color: white;
    }
  }
`;

//data table funtion
function Table({ columns, data }) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
  } = useTable({
    columns,
    data,
  });
  
  //render data table UI
  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()}>{column.render("Header")}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => {
                return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}


//get data for data table & pagination function
function getData(type, festivalId, startTime, endTime, page, pageSize, setError, setItems, setTotalPages, setSelectOptions, setPage, setRows) {
  // var url = host_addr+"basic/data?";
  var url = (type == 'basic') ? host_addr+"basic/data?" : host_addr+"advance/data?";

  if (festivalId) {
    url += "festivalId=" + festivalId + "&";
  }
  if (startTime) {
    url += "startTime=" + startTime + "&";
  }
  if (endTime) {
    url += "endTime=" + endTime + "&";
  }
  if (page) {
    url += "page=" + page + "&";
  }
  if (pageSize) {
    url += "pageSize=" + pageSize + "&";
  }

  const controller = new AbortController();
  const signal = controller.signal;
  const fetchPromise = fetch(url, {signal});
  const timeOutReq = setTimeout(() => controller.abort(), timeoutDuration);

  fetchPromise
    .then((res) => res.json())
    .then((result) => {
      console.log(result);
      clearTimeout(timeOutReq);

      if (result.error) {
        console.log("ERROR");
        setError(result);
      } else {

        setItems(result.result);
        var pages = 0;
        pages = Math.ceil(result.count / pageSize);
        setTotalPages(pages);
        var options = [];
        for (var i = 0; i < pages; i++) {
          options.push(i);
        }
        setSelectOptions(options);

        //cache in storage
        if (isPlatform('android')) {
          NativeStorage.setItem(url, {performances: result.result, totalPages: pages, selectOptions: options, page: page, pageSize: pageSize})
          .then(
            () => console.log('Stored item as '+url),
            error => console.error('Error storing item', error)
          );
        }
        
      }
    })
    .catch((error) => {
      setError(error);
      console.log(error)

      if (isPlatform('android')) {
        //fetch from storage if exists
        NativeStorage.getItem(url)
        .then(
          data => {console.log(data);
            setItems(data.performances);
            setTotalPages(data.totalPages);
            setSelectOptions(data.selectOptions);
            setPage(data.page);
            setRows(data.pageSize);
          },
          error => console.error("Record does not exist")
        );
      }

    });
}


//handle filter search funtion
function validateSearchParams(festivalId, startTime, endTime) {
  if (festivalId) {
    if (!(/^\d+$/.test(festivalId)) || festivalId.length < 10) {
      return false;
    }
  }
  if (startTime) { 
    if (!(/^\d{2}:\d{2}$/.test(startTime))) {
      // console.log("Bad format")
      return false
      
    }

    if ((startTime[0] > 2 && startTime[1]>3)) {
      // console.log("More than 24")
      return false
      
    }
  }
  if (endTime) { 
    if (!(/^\d{2}:\d{2}$/.test(endTime))) {
      // console.log("Bad format")
      return false
      
    }

    if ((endTime[0] > 2 && endTime[1]>3)) {
      // console.log("More than 24")
      return false
      
    }
  }

  return true;
}

const Home: React.FC = () => {
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [pageSize, setRows] = useState(10);
  const [page, setPage] = useState(0);
  const [startTime, setST] = useState(null);
  const [endTime, setET] = useState(null);
  const [festivalId, setFestivalId] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [selectOptions, setSelectOptions] = useState([]);
  const [typeOfDV, setTypeOfDV] = useState('basic');
  const [segmentValue, setSegmentValue] = useState('Basic');
  const [showLoading, setShowLoading] = useState(true);

  const columnsBasic = [
    {
      Header: "performanceId",
      accessor: "performanceid",
    },
    {
      Header: "festivalId",
      accessor: "festivalid",
    },
    {
      Header: "startTime",
      accessor: "starttime",
    },
    {
      Header: "endTime",
      accessor: "endtime",
    },
  ];

  const columnsAdvanced = [
    {
      Header: "performanceId",
      accessor: "performanceid",
    },
    {
      Header: "festivalId",
      accessor: "festivalid",
    },
    {
      Header: "startTime",
      accessor: "starttime",
    },
    {
      Header: "endTime",
      accessor: "endtime",
    },
    {
      Header: "popularity",
      accessor: "popularity",
    },
  ];

  useEffect(() => {

    getData(typeOfDV, festivalId, startTime, endTime, page, pageSize, setError, setItems, setTotalPages, setSelectOptions, setPage, setRows);

  }, []);

    return (
      <IonPage>
        <IonHeader>
          {/*toolbar with app name*/}
          <IonToolbar>
            <div className="appName">Udystopia</div>
          </IonToolbar>
        </IonHeader>

        <IonContent>

          <IonLoading
            cssClass='loading'
            isOpen={showLoading}
            onDidDismiss={() => setShowLoading(false)}
            message={'Please wait...'}
            duration={2000}
          />

          {/*data table title*/}
          <IonCardHeader>
            <div className="title">Data Viewer</div>
          </IonCardHeader>

          <div className="tableContent">
          {/*search bar*/}
            <IonGrid>
              <IonRow>

                {/*search bar for festivalId*/}
                {typeOfDV == 'basic' &&
                <IonCol size-xs="6">
                  <IonSearchbar 
                    inputmode="numeric"
                    id="searchBarA"
                    className="searchBar"
                    value={festivalId}
                    onIonChange={(e) => {
                      setFestivalId(e.detail.value!);
                    }}
                    show-cancel-button="never"
                    placeholder="Search festivalId"
                  ></IonSearchbar>
                </IonCol>
                }

                {/*search bar for startTime*/}
                {typeOfDV == 'basic' &&
                <IonCol size-xs="6">
                  <IonSearchbar 
                    inputmode="numeric"
                    id="searchBarB"
                    className="searchBar"
                    value={startTime}
                    onIonChange={(e) => {
                      setST(e.detail.value!);
                    }}
                    show-cancel-button="never"
                    placeholder="Search startTime (e.g. 08:00)"
                  ></IonSearchbar>
                </IonCol>
                }

                {/*search bar for festivalId*/}
                {typeOfDV == 'advanced' &&
                <IonCol size-md="4" size-xs="12">
                  <IonSearchbar 
                    inputmode="numeric"
                    id="searchBarA"
                    className="searchBar"
                    value={festivalId}
                    onIonChange={(e) => {
                      setFestivalId(e.detail.value!);
                    }}
                    show-cancel-button="never"
                    placeholder="Search festivalId"
                  ></IonSearchbar>
                </IonCol>
                }

                {/*search bar for startTime*/}
                {typeOfDV == 'advanced' &&
                <IonCol size-md="4" size-xs="6">
                  <IonSearchbar 
                    inputmode="numeric"
                    id="searchBarB"
                    className="searchBar"
                    value={startTime}
                    onIonChange={(e) => {
                      setST(e.detail.value!);
                    }}
                    show-cancel-button="never"
                    placeholder="Search startTime (e.g. 08:00)"
                  ></IonSearchbar>
                </IonCol>
                }

                  {/*search bar for endTime*/}
                  {typeOfDV == 'advanced' &&
                  <IonCol size-md="4" size-xs="6">
                    <IonSearchbar
                      inputmode="numeric"
                      id="searchBarC"
                      className="searchBar"
                      value={endTime}
                      onIonChange={(e) => {
                        setET(e.detail.value!);
                      }}
                      show-cancel-button="never"
                      placeholder="Search endTime (e.g. 18:00)"
                    ></IonSearchbar>
                  </IonCol>
                  }
              </IonRow>
            </IonGrid>

          {/*search button*/}
          <IonButton
            id="searchButton"
            color="dark"
            onClick={() => {
              setShowLoading(true);
              setPage(0);
              if (validateSearchParams(festivalId, startTime, endTime)) {
                getData(
                  typeOfDV,
                  festivalId,
                  startTime,
                  endTime,
                  0,
                  pageSize,
                  setError,
                  setItems,
                  setTotalPages,
                  setSelectOptions,
                  setPage,
                  setRows
                );
                
              }
            }}
          >
            Search
          </IonButton>

            {/*toggle buttons*/}
            <IonSegment className="segment" value={segmentValue}>
              <IonSegmentButton className="segmentButton" value="Basic" onClick={() => {
                setSegmentValue("Basic");
                setTypeOfDV('basic');
                getData('basic', festivalId, startTime, endTime, page, pageSize, setError, setItems, setTotalPages, setSelectOptions, setPage, setRows);
              }}>
                <IonLabel>Basic</IonLabel>
              </IonSegmentButton>

              <IonSegmentButton className="segmentButton" value="Advanced" onClick={() => {
                setShowLoading(true);
                setSegmentValue("Advanced");
                setTypeOfDV('advanced');
                getData('advanced', festivalId, startTime, endTime, page, pageSize, setError, setItems, setTotalPages, setSelectOptions, setPage, setRows);
              }}>
                <IonLabel>Advanced</IonLabel>
              </IonSegmentButton>
            </IonSegment>

          {/*Basic data table*/}
          {typeOfDV == 'basic' && <Styles>
            <Table data={items} columns={columnsBasic} />
          </Styles>}

          {/*Advanced data table*/}
          {typeOfDV == 'advanced' && <Styles>
            <Table data={items} columns={columnsAdvanced} />
          </Styles>}

          {/*pagination*/}
          <IonGrid>
            <IonRow className="pagination">

            {/*previous page button*/}
            <IonCol size-md="6" size-xs="12">
              {page > 0 && (
                <IonButton
                  id="paginationBPrevious"
                  color="dark"
                  onClick={() => {
                    setShowLoading(true);
                    setPage((prevPage) => prevPage - 1);
                  }}
                >
                  <IonIcon slot="start" icon={arrowBackCircleOutline} />
                  Previous page
                </IonButton>
              )}

            {/*next page button*/}
              {page < totalPages - 1 && (
                <IonButton
                  id="paginationBNext"
                  color="dark"
                  onClick={() => {
                    setShowLoading(true);
                    setPage((prevPage) => prevPage + 1);
                  }}
                >
                  <IonIcon slot="end" icon={arrowForwardCircleOutline} />
                  Next Page
                </IonButton>
              )}
            </IonCol>

            {/*go to page section*/}
            <IonCol id="go2Page" size-md="3" size-xs="6">
              <ul id="goToPage">
                <li>
                  <IonLabel id="ionLabel">Go to Page: </IonLabel>
                </li>

                <li>
                  <IonSelect
                    id="ionSelect"
                    value={page}
                    interface="popover"
                    placeholder={(page + 1).toString()}
                    onIonChange={(e) => {
                      setShowLoading(true);
                      setPage(e.detail.value);
                      getData(
                        typeOfDV,
                        festivalId,
                        startTime,
                        endTime,
                        e.detail.value,
                        pageSize,
                        setError,
                        setItems,
                        setTotalPages,
                        setSelectOptions,
                        setPage,
                        setRows
                      );
                    }}
                  >
                    {selectOptions.map((option) => (
                      <IonSelectOption key={option} value={option}>
                        {option + 1}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </li>
                <li id="of">of {totalPages}</li>
              </ul>
            </IonCol>

            {/*rows per page section*/}
            <IonCol id="rowsPPage" size-md="3" size-xs="6">
              <ul id="rowsPerPage">
                <li>
                  <IonLabel id="ionLabel1">Rows per page: </IonLabel>
                </li>
                <li>
                  <IonSelect
                    id="ionSelect1"
                    value={pageSize}
                    interface="popover"
                    placeholder={(10).toString()}
                    onIonChange={(e) => {
                      setShowLoading(true);
                      setRows(e.detail.value);
                      setPage(0);
                      getData(
                        typeOfDV,
                        festivalId,
                        startTime,
                        endTime,
                        0,
                        e.detail.value,
                        setError,
                        setItems,
                        setTotalPages,
                        setSelectOptions,
                        setPage,
                        setRows
                      );
                    
                    }}
                  >
                    <IonSelectOption value={5}>
                      {5}
                    </IonSelectOption>
                    <IonSelectOption value={7}>
                      {7}
                    </IonSelectOption>
                    <IonSelectOption value={10}>
                      {10}
                    </IonSelectOption>
                    <IonSelectOption value={12}>
                      {12}
                    </IonSelectOption>
                    <IonSelectOption value={15}>
                      {15}
                    </IonSelectOption>
                  </IonSelect>
                </li>
              </ul>
            </IonCol>
          </IonRow>
          </IonGrid>
          </div>
        </IonContent>
      </IonPage>
    );

};

export default Home;
