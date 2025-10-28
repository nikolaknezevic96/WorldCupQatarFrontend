import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import LandingPage from './components/LandingPage';
import MainPage from './components/MainPage'; // Import MainPage

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
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

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import RegisterPage from './pages/Register';
import LoginPage from './pages/Login';
import ScheduleMatchComponent from './components/MatchComponent';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        {/* Redirect from root to the LandingPage */}
        <Route exact path="/" render={() => <Redirect to="/LandingPage" />} />
        {/* Route for LandingPage */}
        <Route exact path="/LandingPage" component={LandingPage} />
        {/* Route for Home */}
        <Route exact path="/home" component={Home} />
        {/* Route for MainPage */}
        <Route exact path="/main" component={MainPage} />
        <Route exact path="/register" component={RegisterPage}/>
        <Route exact path="/login" component={LoginPage}/>
        <Route exact path="/matches" component={ScheduleMatchComponent}/>

      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
