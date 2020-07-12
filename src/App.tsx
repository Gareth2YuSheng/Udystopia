import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import Tab2 from './pages/Tab2';
import './App.css';
import {homeOutline,calendarOutline} from 'ionicons/icons';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route path="/Udystopia/schedule" component={Tab2} exact={true} />
          <Route path="/Udystopia/home" component={Home} exact={true} />
          <Route path="/Udystopia" render={() => <Redirect to="/Udystopia/home" />} exact={true} />
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
        <IonTabButton tab="home" href="/Udystopia/home">
            <IonIcon className={'tabIcon'} icon={homeOutline} />
            <IonLabel class="tabLabel">Home</IonLabel>
          </IonTabButton>
          <IonTabButton tab="schedule" href="/Udystopia/schedule">
            <IonIcon className={'tabIcon'} icon={calendarOutline} />
            <IonLabel class="tabLabel">Schedule</IonLabel>
          </IonTabButton>
          
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>

);

export default App;
