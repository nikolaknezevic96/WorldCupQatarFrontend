import React, { useState, useEffect } from 'react';
import {
  IonButton,
  IonContent,
  IonItem,
  IonInput,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonPage,
  IonAlert, IonLoading
  
} from '@ionic/react';
import GroupService from '../Api/GroupService';
import TeamService from '../Api/TeamService';
import MatchService from '../Api/MatchService';
import StadiumService from '../Api/StadiumService';
import ScheduleMatchComponent from '../components/MatchComponent';
import { useHistory } from 'react-router-dom';
import './GroupComponent.css';

interface GroupComponentProps {
  onGroupSelect: (groupId: number) => Promise<void>;
}


const GroupComponent: React.FC<GroupComponentProps> = ({ onGroupSelect }) => {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [groupName, setGroupName] = useState<string>('');
  const [teams, setTeams] = useState<any[]>([]);
  const [stadiums, setStadiums] = useState<any[]>([]);
  const [teamName, setTeamName] = useState<string>('');
  const [showScheduleComponent, setShowScheduleComponent] = useState(false);
  const history = useHistory();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [showDeleteError, setShowDeleteError] = useState(false);
const [showDeleteStadiumError, setShowDeleteStadiumError] = useState(false);
const [deleting, setDeleting] = useState(false);
const [currentTeamId, setCurrentTeamId] = useState<number | null>(null);
const [currentStadiumId, setCurrentStadiumId] = useState<number | null>(null);
const [showTeamError, setShowTeamError] = useState(false);
const [teamErrorMessage, setTeamErrorMessage] = useState('');
const toggleScheduleView = () => {
  setShowScheduleComponent(prev => !prev);
  if (selectedGroupId !== null) {
    fetchTeams(selectedGroupId);
  
}};

  useEffect(() => {
    fetchGroups();
    fetchStadiums();
  }, []);



  const fetchGroups = async () => {
    try {
      const data = await GroupService.getAllGroups();
      setGroups(data);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setAlertMessage("Naziv grupe ne može biti prazan.");
      setShowAlert(true);
      return;
    }
    setShowConfirm(true);
  };

  const confirmCreateGroup = async () => {
    try {
      const newGroup = await GroupService.createGroup(groupName);
      setGroups(prev => [...prev, newGroup]);
      setGroupName('');
    } catch (error) {
      setAlertMessage("Došlo je do greške pri kreiranju grupe.");
      setShowAlert(true);
    }
  };


  const handleGroupSelect = async (groupId: number) => {
    setSelectedGroupId(groupId);
    await fetchTeams(groupId);
  };

  const fetchTeams = async (groupId: number) => {
    try {
      const teamData = await TeamService.getTeamsByGroupId(groupId);
      const sortedTeams = teamData.sort((a: any, b: any) => {
        if (b.NumPoints !== a.NumPoints) return b.NumPoints - a.NumPoints;
        const goalDifferenceA = a.NumGoalsScored - a.NumGoalsConceded;
        const goalDifferenceB = b.NumGoalsScored - b.NumGoalsConceded;
        if (goalDifferenceB !== goalDifferenceA) return goalDifferenceB - goalDifferenceA;
        return b.NumGoalsScored - a.NumGoalsScored;
      });
      setTeams(sortedTeams);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    }
  };

  const fetchStadiums = async () => {
    try {
      const stadiumData = await StadiumService.getAllStadiums();      
      setStadiums(stadiumData);
    } catch (error) {
      console.error('Failed to fetch stadiums:', error);
    }
  };

  const handleEditStadium = async (id: number) => {    
    setCurrentStadiumId(id);
    const newStadiumName = prompt("Unesite izmenjeni naziv stadiona:");
     if (!newStadiumName || !newStadiumName.trim()) {
    return; 
  }
  try {
    await StadiumService.updateStadium(id, { id, stadiumName: newStadiumName });
    
    fetchStadiums();
  } catch (error) {
    console.error('Greška pri ažuriranju stadiona:', error);    
  }
  }

  const handleAddStadium = async () => {
  const newName = window.prompt('Unesite ime novog stadiona:');
  if (!newName || !newName.trim()) {
    return;
  }

  try {
    await StadiumService.createStadium({ stadiumName: newName });
    fetchStadiums(); 
  } catch (error) {
    console.error('Greška pri dodavanju stadiona:', error);    
  }
};

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      setAlertMessage('Morate uneti ime tima');
      setShowAlert(true);
      return;
    }
    try {
      const newTeam = await TeamService.createTeam({
        teamName: teamName,
        groupId: selectedGroupId,
        flag: '',
        numPoints: 0,
        numWins: 0,
        numLosses: 0,
        numDraws: 0,
        numGoalsScored: 0,
        numGoalsConceded: 0
      });
      setTeams(prevTeams => [...prevTeams, newTeam]);
      setTeamName('');
      fetchTeams(selectedGroupId!);
    } catch (error: unknown) {
      console.error('Failed to create team:', error);
      let errorMessage = 'There was an issue creating the team. Please try again.';
      if (typeof error === 'object' && error !== null) {
        const e = error as { response?: { data?: { error?: string } }; message?: string };
        if (e.response && e.response.data && e.response.data.error) {
          errorMessage = e.response.data.error;
        } else if (e.message) {
          errorMessage = e.message;
        }
      }
      setTeamErrorMessage(errorMessage);
      setShowTeamError(true);
    }
  };



  const handleDeleteTeam = (id:number) => {
    setCurrentTeamId(id);
    setShowDeleteConfirm(true);
  };

  const handleEditTeam = async (team: any) => {  
  const newName = window.prompt('Unesite novo ime tima:', team.teamName);

  if (!newName || !newName.trim()) {
    return;
  }
  
  const updatedTeamDto = {
  Id: team.id,
  TeamName: newName.trim(),
  Flag: team.flag ?? '',
  GroupId: team.groupId ?? 0,       
  NumPoints: team.numPoints,
  NumWins: team.numWins,
  NumLosses: team.numLosses,
  NumDraws: team.numDraws,
  NumGoalsScored: team.numGoalsScored,
  NumGoalsConceded: team.numGoalsConceded
};


  try {
    await TeamService.updateTeam(team.id, updatedTeamDto);
    fetchTeams(selectedGroupId!); 
  } catch (error) {
    console.error('Greška pri ažuriranju tima:', error);    
  }
};


  const handleDeleteStadium = async (id: number) => {
  const confirmed = window.confirm('Da li ste sigurni da želite obrisati ovaj stadion?');
  if (!confirmed) {
    return;
  }

  try {
    await StadiumService.deleteStadium(id);
    fetchStadiums(); // Refresh list after deletion
  } catch (error) {
    console.error('Greška pri brisanju stadiona:', error);
    setShowDeleteStadiumError(true);
  }
};

  
  const confirmDeleteTeam = async () => {
    if (!currentTeamId) return;
    setDeleting(true);
    try {
      await TeamService.deleteTeam(currentTeamId);
      fetchTeams(selectedGroupId!);
    } catch (error) {
      console.error('Failed to delete team:', error);
      setShowDeleteError(true);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <IonPage>
      <IonAlert
      isOpen={showDeleteConfirm}
      onDidDismiss={() => setShowDeleteConfirm(false)}
      header={'Potvrda'}
      message={'Da li ste sigurni da želite da obrišete tim?'}
      buttons={[
        {
          text: 'Odustani',
          role: 'cancel',
          handler: () => setShowDeleteConfirm(false)
        },
        {
          text: 'Obriši',
          handler: () => confirmDeleteTeam()
        }
      ]}
    />
     <IonAlert
      isOpen={showTeamError}
      onDidDismiss={() => setShowTeamError(false)}
      header={'Error'}
      message={teamErrorMessage}
      buttons={['OK']}
    />
    <IonAlert
      isOpen={showDeleteError}
      onDidDismiss={() => setShowDeleteError(false)}
      header={'Greška'}
      message={'Došlo je do greške pri brisanju tima, proverite da li postoji utakmica koju ovaj tim igra.'}
      buttons={['OK']}
    />
    <IonAlert
      isOpen={showDeleteStadiumError}
      onDidDismiss={() => setShowDeleteStadiumError(false)}
      header={'Greška'}
      message={'Došlo je do greške pri brisanju stadiona, proverite da li postoji utakmica koja se igra na ovom stadionu.'}
      buttons={['OK']}
    />
    <IonLoading
      isOpen={deleting}
      message={'Brisanje tima...'}
    />
    <IonContent className="center-content">
      {showScheduleComponent ? (
        selectedGroupId !== null && (
          <ScheduleMatchComponent
            teams={teams}
            onMatchScheduled={toggleScheduleView}
            selectedGroupId={selectedGroupId}
            onBack={toggleScheduleView}  
          />
          
        )
        
      ) : (
        <IonGrid>
          <IonRow className="ion-justify-content-center ion-align-items-center">
            <IonCol size="10">
              <IonItem>
                <IonInput
                  value={groupName}
                  placeholder="Ime Grupe"
                  onIonChange={(e) => setGroupName(e.detail.value!)}
                />
              </IonItem>
              <IonButton
                expand="block"
                onClick={handleCreateGroup}
                className="small-button"
              >
                Kreiraj Grupu
              </IonButton>
            </IonCol>
          </IonRow>
          <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'Greška'}
          message={alertMessage}
          buttons={['OK']}
        />

        <IonAlert
          isOpen={showConfirm}
          onDidDismiss={() => setShowConfirm(false)}
          header={'Potvrda'}
          message={'Da li ste sigurni da želite da kreirate grupu?'}
          buttons={[
            {
              text: 'Ne',
              role: 'cancel',
              handler: () => {
                console.log('Cancel clicked');
              }
            },
            {
              text: 'Da',
              handler: () => {
                confirmCreateGroup();
              }
            }
          ]}
        />

            <IonRow className="ion-justify-content-center ion-align-items-center">
            {groups.map((group) => (
              <IonCol size="auto" key={group.id}>
                <IonButton
                  fill={selectedGroupId === group.id ? "solid" : "outline"}
                  onClick={() => handleGroupSelect(group.id)}
                  style={{
                    '--background': selectedGroupId === group.id ? '#6200ea' : '#f0f0f0', // Background color
                    '--color': selectedGroupId === group.id ? '#ffffff' : '#000000', // Text color
                    '--border-color': selectedGroupId === group.id ? '#6200ea' : '#000000' // Border color for outline buttons
                  }}
                >
                  {group.groupName}
                </IonButton>
              </IonCol>
            ))}
          </IonRow>

          {selectedGroupId && (
            
            <>
            {teams.length < 4 && (
  <IonGrid>
    <IonRow
    className="ion-justify-content-center ion-align-items-center">
      <IonCol size="10" className="ion-text-center">
        <IonItem>
          <IonInput
            value={teamName}
            placeholder="Ime Tima"
            onIonChange={(e) => setTeamName(e.detail.value!)}
          />
        </IonItem>
        <IonButton
          expand="block"
          onClick={handleCreateTeam}
          className="small-button"
        >
          Kreiraj tim
        </IonButton>
      </IonCol>
    </IonRow>
  </IonGrid>
)}
              {/* <div style={{ justifyContent: 'center', alignItems: 'center' }}>
              <div className="existing-content"> */}
              <div className="scrollable-container ion-justify-content-center ion-align-items-center">
                <div className="ion-justify-content-left ion-align-items-left">      
        <IonCard className ="ion-justify-content-left ion-align-items-left">
                            <IonCardHeader>
                              <IonCardTitle>Stadioni</IonCardTitle>
                            </IonCardHeader>
                            <IonCardContent>
                              <IonList>                                
                                {stadiums.map((stadium) =>(
                                  <IonRow key={stadium.id}>
                                    <IonCol className="scrollable-ion-col">{stadium.stadiumName}</IonCol>
                                    <IonCol className="scrollable-ion-col">
                                      <IonButton color="danger" onClick={() => handleEditStadium(stadium.id)}>
                                        Izmeni ime stadiona
                                      </IonButton>
                                    </IonCol>
                                    <IonCol className="scrollable-ion-col">
                                      <IonButton color="danger" onClick={() => handleDeleteStadium(stadium.id)}>
                                        Obriši stadion
                                      </IonButton>
                                    </IonCol>
                                  </IonRow>                                  
                                ))}
                                <IonRow>
                                  <IonCol className="scrollable-ion-col">
                                    <IonButton color="success" onClick={handleAddStadium}>
                                        Dodaj stadion
                                    </IonButton>
                                  </IonCol>
                                </IonRow> 
                              </IonList>
                            </IonCardContent>
                          </IonCard>       
      </div>
                <div className="scrollable-inner ion-justify-content-center ion-align-items-center">                  
                  <IonCard className="ion-justify-content-center ion-align-items-center">
                    <IonCardHeader>
                      <IonCardTitle>Timovi</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonList>
                        <IonRow>
                          <IonCol className="scrollable-ion-col">Ime tima</IonCol>
                          <IonCol className="scrollable-ion-col">Pobeda</IonCol>
                          <IonCol className="scrollable-ion-col">Nereseno</IonCol>
                          <IonCol className="scrollable-ion-col">Poraz</IonCol>
                          <IonCol className="scrollable-ion-col">Golova dato</IonCol>
                          <IonCol className="scrollable-ion-col">Golova primljeno</IonCol>
                          <IonCol className="scrollable-ion-col">Broj poena</IonCol>
                          <IonCol className="scrollable-ion-col">               </IonCol>
                          <IonCol className="scrollable-ion-col">               </IonCol>                                                    
                        </IonRow>
                        {teams.map((team) => (
                          <IonRow key={team.id}>
                            <IonCol className="scrollable-ion-col">{team.teamName}</IonCol>
                            <IonCol className="scrollable-ion-col">{team.numWins}</IonCol>
                            <IonCol className="scrollable-ion-col">{team.numDraws}</IonCol>
                            <IonCol className="scrollable-ion-col">{team.numLosses}</IonCol>
                            <IonCol className="scrollable-ion-col">{team.numGoalsScored}</IonCol>
                            <IonCol className="scrollable-ion-col">{team.numGoalsConceded}</IonCol>
                            <IonCol className="scrollable-ion-col">{team.numPoints}</IonCol>
                            <IonCol className="scrollable-ion-col">
          <IonButton color="danger" onClick={() => handleEditTeam(team)}>
            Izmeni ime tima
          </IonButton>
        </IonCol>
                            <IonCol className="scrollable-ion-col">
          <IonButton color="danger" onClick={() => handleDeleteTeam(team.id)}>
            Obriši tim
          </IonButton>
        </IonCol>
                          </IonRow>
                        ))}
                      </IonList>
                    </IonCardContent>
                  </IonCard>
                </div>
              </div>
              {/* </div>
              </div> */}

              

<IonGrid>
<IonRow className="ion-justify-content-center ion-align-items-center">
    <IonCol size="7">
      <IonButton
        expand="block"
        onClick={() => setShowScheduleComponent(true)}
        className="small-button"
        
      >
        Pregled Utakmica
      </IonButton>
    </IonCol>
  </IonRow>
</IonGrid>
            </>
          )}
        </IonGrid>
      )}
       <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'Obaveštenje'}
          message={alertMessage}
          buttons={['OK']}
        />
    </IonContent>
  </IonPage>
);
} 


export default GroupComponent;
