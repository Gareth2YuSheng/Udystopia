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
} from "@ionic/react";
import "./Home.css";
import { useTable } from "react-table";
import styled from "styled-components";
import {
  arrowForwardCircleOutline,
  arrowBackCircleOutline,
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
      font: normal 100% "mohaveRegular";
      :last-child {
        td {
          :last-child {
            border-bottom-right-radius: 10px;
          }
        }
      }
    }
    border-collapse: separate;
    border-top-left-radius: 15px;
    border-bottom-right-radius: 15px;
    text-align: center;
    margin: 0px auto;
    width: 50%;
    border: 2px solid black;
    th,
    td {
      padding: 5px;
      border: 2px solid black;
      width: 20%;
    }
    th {
      :first-child {
        border-top-left-radius: 10px;
      }
      font: normal 100% "mohaveMedium";
      background-color: #ff3366;
      color: white;
      border-bottom: 3px solid black;
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
  var url = (type == 'basic') ? host_addr+"basic/data?" : host_addr+"advanced/data?";

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
    if (!(/^\d+$/.test(festivalId))) {
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
          {/*data table title*/}
          <IonCardHeader>
            <div className="title">Performances Data Viewer</div>
          </IonCardHeader>

          {/*search bar*/}
          <div id="searchB">
            <ul id="searchBox">
              {/*search bar for festivalId*/}
              <li>
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
              </li>

              {/*search bar for startTime*/}
              <li>
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
              </li>

              {/*search bar for endTime*/}
              <li>
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
              </li>
            </ul>
          </div>

          {/*search button*/}
          <div id="searchB">
            <IonButton
              id="searchButton"
              color="dark"
              onClick={() => {
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
          </div>

          {/*toggle buttons*/}
          <div id="toggleB">
            <button
              id="toggleBasicB"
              onClick={() => {
                setTypeOfDV('basic');
                getData('basic', festivalId, startTime, endTime, page, pageSize, setError, setItems, setTotalPages, setSelectOptions, setPage, setRows);
              }}
            >
              Basic
            </button>

            <button
              id="toggleAdvancedB"
              onClick={() => {
                setTypeOfDV('advanced');
                getData('advanced', festivalId, startTime, endTime, page, pageSize, setError, setItems, setTotalPages, setSelectOptions, setPage, setRows);
              }}
            >
              Advanced
            </button>
          </div>

          {/*Basic data table*/}
          {typeOfDV == 'basic' && <Styles>
            <Table data={items} columns={columnsBasic} />
          </Styles>}

          {/*Advanced data table*/}
          {typeOfDV == 'advanced' && <Styles>
            <Table data={items} columns={columnsAdvanced} />
          </Styles>}

          {/*pagination*/}
          <div className="pagination">
            {/*previous page button*/}
            <div id="navPage">
              {page > 0 && (
                <IonButton
                  id="paginationB"
                  color="medium"
                  onClick={() => {
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
                  id="paginationB"
                  color="dark"
                  onClick={() => {
                    setPage((prevPage) => prevPage + 1);
                  }}
                >
                  <IonIcon slot="end" icon={arrowForwardCircleOutline} />
                  Next Page
                </IonButton>
              )}
            </div>

            {/*rows per page section*/}
            <div id="rowsPPage">
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
            </div>

            {/*go to page section*/}
            <div id="go2Page">
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
            </div>
          </div>
        </IonContent>
      </IonPage>
    );

};

export default Home;
