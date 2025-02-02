import {
  action,
  autorun,
  computed,
  makeAutoObservable,
  observable,
} from 'mobx';

class UserStore {}

const userStore = new UserStore();
export default userStore;
