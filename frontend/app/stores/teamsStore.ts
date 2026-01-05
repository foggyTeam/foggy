import { action, makeAutoObservable, observable } from 'mobx';
import { RawTeam, Role, Team, TeamMember } from '@/app/lib/types/definitions';
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
    this.activeTeam = {
      id: team.id,
      name: team.name,
      avatar: team.avatar,
      settings: team.settings,
      members: team.members.map((member) => {
        return { ...member } as TeamMember;
      }),
      projects: [...team.projects],
    };
    this.myRole = this.activeTeam.members.find(
      (member) => member.id === userStore.user?.id,
    )?.role;
  };
  revalidateActiveTeam = (revalidatedData: RawTeam) => {
    if (!this.activeTeam) return;
    Object.assign(this.activeTeam, revalidatedData);
    this.myRole = this.activeTeam.members.find(
      (member) => member.id === userStore.user?.id,
    )?.role;
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

  // MEMBERS
  updateTeamMember = (memberId: string, newAttrs: Partial<TeamMember>) => {
    if (this.activeTeam) {
      const memberIndex = this.activeTeam.members.findIndex(
        (member) => member.id === memberId,
      );
      if (memberIndex >= 0)
        this.activeTeam.members[memberIndex] = {
          ...this.activeTeam.members[memberIndex],
          ...newAttrs,
        };
    }
  };
  removeTeamMember = (memberId: string) => {
    if (this.activeTeam) {
      this.activeTeam.members = this.activeTeam.members.filter(
        (member) => member.id !== memberId,
      );
    }
  };
}

const teamsStore = new TeamsStore();
export default teamsStore;
