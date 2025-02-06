import { action, makeAutoObservable, observable } from 'mobx';

class MenuStore {
  isOpen: boolean = false;
  activeTab: '0' | '1' | '2' = '0';

  constructor() {
    makeAutoObservable(this, {
      isOpen: observable,
      activeTab: observable,
      toggleRightMenu: action,
      closeRightMenu: action,
      setActiveTab: action,
    });
  }

  toggleRightMenu = () => {
    this.isOpen = !this.isOpen;
  };

  closeRightMenu = () => {
    this.isOpen = false;
  };

  setActiveTab = (tab: '0' | '1' | '2') => {
    this.activeTab = tab;
  };
}

const menuStore = new MenuStore();
export default menuStore;
