import { makeAutoObservable } from 'mobx';

class UsersStore {
  users: any[] = [];
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setAllUsers(users: any[]) {
    this.users = users;
  }
  setError(error: string) {
    this.error = error;
  }
}

const usersStore = new UsersStore();
export default usersStore;
