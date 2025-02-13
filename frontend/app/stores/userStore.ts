import { action, makeAutoObservable, observable } from 'mobx';
import { User } from 'next-auth';

class UserStore {
  user: User | undefined = undefined;
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
    this.user = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      image: userData.image,
    };
    this.isAuthenticated = true;
  }

  clearUser() {
    this.user = undefined;
    this.isAuthenticated = false;
  }
}

const userStore = new UserStore();
export default userStore;
