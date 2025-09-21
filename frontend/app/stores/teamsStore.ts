import { action, makeAutoObservable, observable } from 'mobx';
import { RawTeam, Role, Team } from '@/app/lib/types/definitions';
import userStore from '@/app/stores/userStore';

class TeamsStore {
  myRole: Role | undefined = undefined;
  activeTeam: Team | undefined = undefined;
  allTeams: Team[] = [];

  constructor() {
    makeAutoObservable(this, {
      myRole: observable,
      activeTeam: observable,
      allTeams: observable,
      revalidateActiveTeam: action,
      setActiveTeam: action,
      setAllTeams: action,
      addTeam: action,
      updateTeam: action,
    });
  }

  setActiveTeam = (team: RawTeam | null) => {
    if (!team) {
      this.activeTeam = undefined;
      this.myRole = undefined;
      return;
    }
    this.activeTeam = { ...team };
    this.myRole = this.activeTeam.members.find(
      (member) => member.id === userStore.user?.id,
    )?.role;
  };
  revalidateActiveTeam = (revalidatedData: RawTeam) => {
    if (!this.activeTeam) return;
    Object.assign(this.activeTeam, revalidatedData);
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
