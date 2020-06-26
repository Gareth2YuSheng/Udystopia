import React, { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from '@ionic/react';
import './Tab2.css';
import mobiscroll from "@mobiscroll/react-lite";
import "@mobiscroll/react-lite/dist/css/mobiscroll.min.css";

interface DemoProps {
  /* you can define props type definitions here */
}

interface DemoState {
    formValues?: any;
    formErrors?: any;
}

mobiscroll.settings = {
    theme: 'ios',
    themeVariant: 'light',
};

const Tab2: React.FC = () => {
  const [error] = useState(null);
  
    if (error) {
      return (
        <IonPage>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Tab 2</IonTitle>
            </IonToolbar>
          </IonHeader>
    
          <IonContent class="main">
            
              <div id="errortext"><b>Error: </b>{error.error}
              <br></br><b>Code:</b> {error.code}</div>
    
          </IonContent>
        </IonPage>
      );
    } else {
      return (
        <IonPage>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Insert Data</IonTitle>
            </IonToolbar>
          </IonHeader>
    
          <IonContent>


          <div mbsc-form className="mbsc-form-grid">
    <div className="mbsc-grid">
        <div className="mbsc-row">
            <div className="mbsc-col-12 mbsc-col-md-6 mbsc-col-lg-3">
                <label>
                    performanceId
                    <input mbsc-input data-input-style="box" data-label-style="floating" type="text" placeholder="Enter performanceId" />
                </label>
            </div>
            <div className="mbsc-col-12 mbsc-col-md-6 mbsc-col-lg-3">
                <label>
                    festivalId
                    <input mbsc-input data-input-style="box" data-label-style="floating" type="password" placeholder="festivalId" data-password-toggle="true" />
                </label>
            </div>
            <div className="mbsc-col-12 mbsc-col-lg-6">
                <label>
                    startTime
                    <input mbsc-input data-input-style="box" data-label-style="floating" placeholder="What is your address?" />
                </label>
            </div>
        </div>
        <div className="mbsc-row">
            <div className="mbsc-col-12 mbsc-col-md-6 mbsc-col-lg-3">
                <label>
                    endTime
                    <input mbsc-input data-input-style="box" data-label-style="floating" type="text" placeholder="Enter your town" />
                </label>
            </div>
        </div>
    </div>
</div>




          </IonContent>
        </IonPage>
      );
    }

};

export default Tab2;
