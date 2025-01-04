import { makeAutoObservable } from 'mobx';

class PetStore {
  pets: any[] = [];
  currentPet: any = null;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setPets(pets: any[]) {
    this.pets = pets;
  }

  setCurrentPet(pet: any) {
    this.currentPet = pet;
  }

  setError(error: string) {
    this.error = error;
  }
}

const petStore = new PetStore();
export default petStore;
