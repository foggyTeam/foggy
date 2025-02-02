import { action, makeAutoObservable, observable } from 'mobx';
import { User } from 'next-auth';

class UserStore {
  user: User | null = null;
  isAuthenticated = false;

  constructor() {
    makeAutoObservable(this, {
      user: observable,
      isAuthenticated: observable,
      setUser: action,
      clearUser: action,
    });
  }

  setUser(userData: User) {
    this.user = userData;
    this.isAuthenticated = true;
  }

  clearUser() {
    this.user = null;
    this.isAuthenticated = false;
  }
}

const userStore = new UserStore();
export default userStore;
