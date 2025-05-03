import { action, makeAutoObservable, observable } from 'mobx';
import { Team } from '@/app/lib/types/definitions';

class TeamsStore {
  activeTeam: Team | undefined = undefined;
  allTeams: Team[] = [];

  constructor() {
    makeAutoObservable(this, {
      activeTeam: observable,
      allTeams: observable,
      setActiveTeam: action,
      setAllTeams: action,
      addTeam: action,
      updateTeam: action,
    });
  }

  setActiveTeam = (team: Team) => {
    this.activeTeam = { ...this.activeTeam, ...team };
  };
  setAllTeams = (teams: Team[]) => {
    this.allTeams = teams;
  };
  addTeam = (newTeam: Team) => {
    this.allTeams.push(newTeam);
  };
  updateTeam = (id: string, newAttrs: Partial<Team>) => {
    const teamIndex = this.allTeams.findIndex((team) => team.id === id);
    this.allTeams[teamIndex] = {
      ...this.allTeams[teamIndex],
      ...newAttrs,
    };
  };
}

const teamsStore = new TeamsStore();
export default teamsStore;
