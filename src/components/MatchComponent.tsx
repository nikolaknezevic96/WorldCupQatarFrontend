import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonLabel,
  IonRadioGroup,
  IonListHeader,
  IonRadio,
  IonItem,
  IonDatetime,
  IonPage,
  IonInput,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonModal,
  IonAlert,
  IonHeader,
  IonToolbar,
  IonTitle
} from '@ionic/react';
import StadiumService from '../Api/StadiumService';
import MatchService from '../Api/MatchService';
import TeamService from '../Api/TeamService';
import './GroupComponent.css';
import { IonIcon } from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';  // Import useHistory

import axios, { AxiosError, Axios } from 'axios';


// Define TypeScript interfaces for the props and state
interface Team {
  id: number;
  teamName: string;
  numWins: number;
  NumDraws: number;
  numLosses: number;
  numGoalsScored: number;
  numGoalsConceded: number;
  numPoints: number;

}

interface Stadium {
  id: number;
  stadiumName: string;
}

interface Match {
  id: number;
  team1Id: number;
  team2Id: number;
  startDateTime: string;
  stadiumId?: number | null;
  forfeited?: boolean;
  team1GoalsScored?: number | null;
  team2GoalsScored?: number | null;
  team1Forfeited?: boolean;  
  team2Forfeited?: boolean;  
}


interface Props {
  teams: Team[];
  onMatchScheduled: () => void;
  selectedGroupId: number; 
  onBack: () => void; 
}

const ScheduleMatchComponent: React.FC<Props> = ({ teams, onMatchScheduled, selectedGroupId,onBack  }) => {
  console.log("Rendering ScheduleMatchComponent", {teams});
  const [matchDate, setMatchDate] = useState<string | null>(null);
  const [selectedTeam1, setSelectedTeam1] = useState<string>('');
  const [selectedTeam2, setSelectedTeam2] = useState<string>('');
  const [matchOutcome, setMatchOutcome] = useState<string>('played');
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [selectedStadium, setSelectedStadium] = useState<string>('');
  const [availableTeamsForTeam1, setAvailableTeamsForTeam1] = useState<Team[]>([]);
  const [availableTeamsForTeam2, setAvailableTeamsForTeam2] = useState<Team[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const history = useHistory();
  const [successAlertMessage, setSuccessAlertMessage] = useState('');
const [showSuccessAlert, setShowSuccessAlert] = useState(false);

const [showResultAlert, setShowResultAlert] = useState(false);
const [currentMatchId, setCurrentMatchId] = useState<number | null>(null);
const [team1Goals, setTeam1Goals] = useState<string>('');
const [team2Goals, setTeam2Goals] = useState<string>('');

const [alertMessage, setAlertMessage] = useState('');
const [showAlert, setShowAlert] = useState(false);

  const fetchMatches = async (groupId: number) => {
    try {
      const response = await MatchService.getMatchesByGroupId(groupId);
      console.log('Fetched matches from server:', response.data);
      const matches: Match[] = response.data;
  
      const teamAndStadiumData = await Promise.all(
        matches.map(async (match: Match) => {
          const team1 = await TeamService.getTeamById(match.team1Id);
          const team2 = await TeamService.getTeamById(match.team2Id);
  
          let stadiumName = 'Undefined';
          if (match.stadiumId) {
            const stadium = await StadiumService.getStadiumById(match.stadiumId);
            stadiumName = stadium.stadiumName;
          }
  
          return {
            ...match,
            team1Name:team1.teamName,
            team2Name: team2.teamName,
            stadiumName: stadiumName,
          };
        })
      );
  
      setMatches(teamAndStadiumData);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
      setMatches([]);
    }
  };

  useEffect(() => {
    fetchMatches(selectedGroupId);
  }, []);

  useEffect(() => {
    async function fetchStadiums() {
      try {
        const data: Stadium[] = await StadiumService.getAllStadiums();
        setStadiums(data);
      } catch (error) {
        console.error('Failed to fetch stadiums:', error);
      }
    }
    fetchStadiums();
  }, []);

  useEffect(() => {
    if (teams.length) {
      if (selectedTeam1) {
        setAvailableTeamsForTeam2(teams.filter(team => team.id.toString() !== selectedTeam1));
      } else {
        setAvailableTeamsForTeam2(teams);
      }
      if (selectedTeam2) {
        setAvailableTeamsForTeam1(teams.filter(team => team.id.toString() !== selectedTeam2));
      } else {
        setAvailableTeamsForTeam1(teams);
      }
    }
  }, [teams, selectedTeam1, selectedTeam2]);

  const handleMatchSchedule = async () => {

      // Check if both teams are picked
  if (!selectedTeam1 || !selectedTeam2) {
    setAlertMessage('Morate odabrati oba tima.');
    setShowAlert(true);
    return;
  }

  // Check if the stadium is picked if the match has been played
  if (matchOutcome === 'played' && !selectedStadium) {
    setAlertMessage('Morate odabrati stadion.');
    setShowAlert(true);
    return;
  }

  // Check if the datetime has been picked and if it's between 14h and 23h
  if (matchOutcome === 'played' && matchDate) {
    const matchTime = new Date(matchDate).getHours();
    if (matchTime < 14 || matchTime >= 23) {
      setAlertMessage('Vreme početka utakmice mora biti između 14:00 i 23:00.');
      setShowAlert(true);
      return;
    }
  } else if (matchOutcome === 'played' && !matchDate) {
    setAlertMessage('Morate uneti vreme početka utakmice.');
    setShowAlert(true);
    return;
  }

    const forfeitDate = new Date('2024-08-16T20:00:00');
    const isForfeit = matchOutcome !== 'played';
    const matchDetails = {
      id: 0,  // Assuming 'id' should be dynamically assigned usually
      team1Id: parseInt(selectedTeam1),
      team2Id: parseInt(selectedTeam2),
      startDateTime: isForfeit ? forfeitDate.toISOString() : matchDate,
      team1GoalsScored: isForfeit ? 0 : null,
      team2GoalsScored: isForfeit ? 0 : null,
      stadiumId: isForfeit ? null : parseInt(selectedStadium),
      forfeited: isForfeit,
      team1Forfeited: matchOutcome === 'forfeit1',
      team2Forfeited: matchOutcome === 'forfeit2'
    };

    try {
      console.log('Sending match details:', matchDetails); 
      await MatchService.scheduleMatch(matchDetails);
            
      setSuccessAlertMessage("Utakmica je uspešno zakazana!");
      setShowSuccessAlert(true);
  
      fetchMatches(selectedGroupId);
      resetForm();
      onMatchScheduled();
    } catch (error) {
      console.error('Failed to schedule the match:', error);
        
      if (error instanceof AxiosError) {
        setAlertMessage(error.response?.data || error.message);
      } else {
        setAlertMessage('Došlo je do neočekivane greške.');
      }
  
      setShowAlert(true);
    }
  };

  const handleSetResult = async (matchId: number) => {
    const match = matches.find((m: Match) => m.id === matchId);
    if (!match) {
      alert("Utakmica nije pronađena.");
      return;
    }
  
    const matchStartTime = new Date(match.startDateTime);
    if (matchStartTime > new Date()) {
      alert("Nije moguće postaviti rezultat pre zvaničnog vremena početka utakmice.");
      return;
    }
  
    const team1GoalsScored = prompt("Unesite broj golova koje je postigao Tim 1:");
    const team2GoalsScored = prompt("Unesite broj golova koje je postigao Tim 2:");
  
    // Checking if input numbers are valid, ints not equal to zero
    if (team1GoalsScored !== null && team2GoalsScored !== null && isValidScore(team1GoalsScored) && isValidScore(team2GoalsScored)) {
      try {
        await MatchService.setMatchResult(matchId, parseInt(team1GoalsScored), parseInt(team2GoalsScored));
        fetchMatches(selectedGroupId);  // Refreshes the data about the matches
           // Refreshes the team table to reflect any result changes 
      } catch (error) {
        console.error('Greška pri postavljanju rezultata utakmice:', error);
        alert("Došlo je do greške pri postavljanju rezultata.");
      }
    } else {
      alert("Unesite validne celobrojne vrednosti koje su veće ili jednake nuli za golove.");
    }
  };
  // Function to check if the score is a valid non-negative integer
  function isValidScore(score: string | null): boolean {
    if (score === null) return false;  // Prompt can return null if canceled
    const scoreNum = Number(score);
    return Number.isInteger(scoreNum) && scoreNum >= 0;
  }

  const handleDeleteMatch = async (id: number) => {
    if (window.confirm("Da li ste sigurni da želite da obrišete utakmicu?")) {
      try {
        await MatchService.deleteMatch(id);
        alert("Utakmica je uspešno obrisana!");
        fetchMatches(selectedGroupId!);
      } catch (error) {
        console.error('Failed to delete match:', error);
        alert("Došlo je do greške pri brisanju utakmice.");
      }
    }
  };
  
    // Navigation function to return back to the main component
    const handleBack = () => {
      history.push('/main');  // Navigate back to '/main'
    };
  

  const resetForm = () => {
    setSelectedTeam1('');
    setSelectedTeam2('');
    setSelectedStadium('');
    setMatchDate(null);
    setMatchOutcome('played');
  };

  const handleDateChange = (event: CustomEvent) => {
    setMatchDate(event.detail.value as string);
};

  const [pom1, setpom1] = useState<string>('');
  const [pom2, setpom2] = useState<string>('');

  return (
    
    <IonPage>
 
<IonAlert
  isOpen={showAlert}
  onDidDismiss={() => setShowAlert(false)}
  header={'Greška pri zakazivanju'}
  message={alertMessage}
  buttons={['OK']}
/>

<IonAlert
  isOpen={showSuccessAlert}
  onDidDismiss={() => setShowSuccessAlert(false)}
  header={'Uspeh'}
  message={successAlertMessage}
  buttons={['OK']}
/>
     <IonContent className="page-content">
    <div className="scrollable-container1">
      <div className="scrollable-inner1">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Utakmice</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonRow>
              <IonCol size="1"><strong>Tim 1</strong></IonCol>
              <IonCol size="1"><strong>Tim 2</strong></IonCol>
              <IonCol size="2.2"><strong>Vreme Početka</strong></IonCol>
              <IonCol size="1.5"><strong>Rezultat</strong></IonCol>
              <IonCol size="2"><strong>Stadion</strong></IonCol>
              <IonCol size="3.5"><strong>Akcije</strong></IonCol>
            </IonRow>
            {matches.map(match => (
              <IonRow key={match.id}>
                <IonCol size="1">{match.team1Name}</IonCol>
                <IonCol size="1">{match.team2Name}</IonCol>
                <IonCol size="2.2">{new Date(match.startDateTime).toLocaleString()}</IonCol>
                <IonCol size="1.5">
                  {match.forfeited ? (
                    match.team1GoalsScored === 0 && match.team2GoalsScored > 0 ? "Tim 1 predao" : 
                    match.team2GoalsScored === 0 && match.team1GoalsScored > 0 ? "Tim 2 predao" : 
                    `${match.team1GoalsScored} - ${match.team2GoalsScored}`
                  ) : (
                    `${match.team1GoalsScored ?? ' '} - ${match.team2GoalsScored ?? ' '}`
                  )}
                </IonCol>
                <IonCol size="2">{match.stadiumName != "Undefined" ? match.stadiumName : ' ' }</IonCol>
                <IonCol size="3.5">
                  {match.team1GoalsScored === null && !match.forfeited && (
                    <IonButton className="smaller-button" color="danger" onClick={() => handleDeleteMatch(match.id)}>
                      Obriši Utakmicu
                    </IonButton>
                  )}
                  {match.team1GoalsScored === null && !match.forfeited && (
                    <IonButton className="smaller-button" color="primary" onClick={() => handleSetResult(match.id)}>
                      Unesi rezultat
                    </IonButton>
                  )}
                </IonCol>
              </IonRow>
            ))}
          </IonList>
        </IonCardContent>
      </IonCard>
    </div>
  </div>

      
  <h3 style={{ marginLeft: '30px'}} >Zakazivanje Utakmice</h3>
    <IonGrid>
      <IonRow>
        <IonCol>
          <IonSelect style={{ marginLeft: '30px'}}  value={selectedTeam1} placeholder="Odaberite prvi tim:" onIonChange={e => setSelectedTeam1(e.detail.value)}>
            {availableTeamsForTeam1.map(team => (
              <IonSelectOption key={team.id} value={team.id.toString()}>{team.teamName}</IonSelectOption>
            ))}
          </IonSelect>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <IonSelect style={{ marginLeft: '30px'}} value={selectedTeam2} placeholder="Odaberite drugi tim" onIonChange={e => setSelectedTeam2(e.detail.value)}>
            {availableTeamsForTeam2.map(team => (
              <IonSelectOption key={team.id} value={team.id.toString()}>{team.teamName}</IonSelectOption>
            ))}
          </IonSelect>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <div className="radio-group">
            <IonRadioGroup value={matchOutcome} onIonChange={e => setMatchOutcome(e.detail.value)}>
            <IonListHeader>
            <IonLabel>Ishod utakmice</IonLabel>
          </IonListHeader>
            <IonItem>
            <IonLabel>Utakmica se odigrava</IonLabel>
            <IonRadio slot="start" value="played" />
          </IonItem>
          <IonItem>
            <IonLabel>Tim 1 predao</IonLabel>
            <IonRadio slot="start" value="forfeit1" />
          </IonItem>
          <IonItem>
            <IonLabel>Tim 2 predao</IonLabel>
            <IonRadio slot="start" value="forfeit2" />
          </IonItem>
            </IonRadioGroup>
          </div>
        </IonCol>
      </IonRow>
      {matchOutcome === 'played' && (
        <>
          <IonRow>
            <IonCol>
              <IonSelect style={{ marginLeft: '30px'}} value={selectedStadium} placeholder="Odaberite Stadion" onIonChange={e => setSelectedStadium(e.detail.value)}>
                {stadiums.map(stadium => (
                  <IonSelectOption key={stadium.id} value={stadium.id.toString()}>{stadium.stadiumName}</IonSelectOption>
                ))}
              </IonSelect>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol style={{ marginLeft: '30px', marginRight: '30px' }} >
              <IonDatetime
                value={matchDate}
                min="2020"
                max="2030"
                onIonChange={handleDateChange}
                presentation="date-time"
              />
            </IonCol>
          </IonRow>
        </>
      )}
      <IonRow>
    {/* Left button */}
    <IonCol size="3">
      <IonButton expand="block" onClick={onBack} className="small-button1" style={{ marginTop: '20px' }}>
        {/* You can use arrow or text */}
        <IonIcon slot="start" icon={arrowBack} />
        Nazad
      </IonButton>
    </IonCol>

    {/* Right button for scheduling */}
    <IonCol size="9">
      <IonButton expand="block" onClick={handleMatchSchedule} className="small-button1" style={{ marginTop: '20px' }}>
        Zakazite utakmicu
      </IonButton>
    </IonCol>
  </IonRow>
    </IonGrid>
  </IonContent>
</IonPage>
  );
};

export default ScheduleMatchComponent;