import React, {useState,useEffect} from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent,IonText,IonButton,IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonRow,
    IonCol
 } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import TeamService from '../Api/TeamService';
import StadiumService from '../Api/StadiumService';
import GroupComponent from './GroupComponent';
import axios from 'axios';
import './GroupComponent.css';


const MainPage: React.FC = () => {
  const [selectedGroupId, setSelectedGroupId] = React.useState<number | null>(null);
  const [teams, setTeams] = React.useState<any[]>([]);
  const [stadiums, setStadiums] = useState<any[]>([]);
  const [showDeleteStadiumConfirm, setShowDeleteStadiumConfirm] = useState(false);
  const [currentStadiumId, setCurrentStadiumId] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const history = useHistory();
  const firstName = sessionStorage.getItem('firstName') || '';
  const lastName = sessionStorage.getItem('lastName') || '';


  const handleDeleteStadium = (id:number) => {
    setCurrentStadiumId(id);
    setShowDeleteStadiumConfirm(true);
  }

  const handleEditStadium = (id:number) => {
    setCurrentStadiumId(id);
    setShowDeleteStadiumConfirm(true);
  }

  const handleAddStadium = () => {
    // Logic to add a new stadium
  }

  const fetchStadiums = async () => {
      try {
        const stadiumData = await StadiumService.getAllStadiums();      
        setStadiums(stadiumData);
      } catch (error) {
        console.error('Failed to fetch stadiums:', error);
      }
    };

  useEffect(() => {
      const token = sessionStorage.getItem('token');
      setIsAuthenticated(!!token);
      console.log(isAuthenticated);
      console.log(token);
  }, [sessionStorage.getItem("token")]);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    setIsAuthenticated(!!token);
    console.log(isAuthenticated);
    console.log(token);
});


useEffect(() => {
  const token = sessionStorage.getItem('token');
  setIsAuthenticated(!!token);
}, []);


  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      // Set the Authorization header on page load or when the token changes
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      setIsAuthenticated(false);
    }
  }, []);  

  if (!isAuthenticated) {
    return (
      <IonPage>
        <IonContent className="ion-padding" fullscreen>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            textAlign: 'center'
          }}>
            <IonText color="medium" style={{ marginBottom: '20px' }}>
              Niste ulogovani. Ulogujte se ili se registrujte da biste nastavili.
            </IonText>
            <div style={{ display: 'flex', gap: '10px' }}>
              <IonButton expand="block" className="small-button1" onClick={() => history.push('/login')}>
                Log In
              </IonButton>
              <IonButton expand="block" className="small-button1" onClick={() => history.push('/register')}>
                Register
              </IonButton>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }



  const handleGroupSelect = async (groupId: number) => {
    setSelectedGroupId(groupId);
    await fetchTeams(groupId);
  };

  const fetchTeams = async (groupId: number) => {
    try {
      const teams = await TeamService.getTeamsByGroupId(groupId);
      setTeams(teams);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    }
  };

  const handleLogout = () => {
    // Clear session storage first
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('firstName');
    sessionStorage.removeItem('lastName');

    // Update authentication state
    setIsAuthenticated(false);

    // Redirect to the landing page
    window.location.href = '/LandingPage';

  
};



  return (
    <IonPage>
      <IonHeader>
    <IonToolbar>
        <IonTitle>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                { // Conditional rendering based on screen width or available space
                  window.innerWidth > 600 ? (
                    <>
                        <span style={{ marginRight: '20px' }}>Svetsko prvenstvo Qatar 2024</span>
                        {firstName && lastName && (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span>{`${firstName} ${lastName}`}</span>
                                <IonButton onClick={handleLogout} fill="clear">Odjava</IonButton>
                            </div>
                        )}
                    </>
                  ) : (
                    // If the screen width is less than 600px, display only the name and logout button
                    firstName && lastName && (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span>{`${firstName} ${lastName}`}</span>
                            <IonButton onClick={handleLogout} fill="clear">Odjava</IonButton>
                        </div>
                    )
                  )
                }
            </div>
        </IonTitle>
    </IonToolbar>
</IonHeader>
    
      <IonContent className="ion-padding">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
          {/* Pass the handleGroupSelect function as a prop */}
          <GroupComponent onGroupSelect={handleGroupSelect} />
        </div>
      </IonContent>
      
    </IonPage>
  );
};

export default MainPage;
