import { createDojoStore } from "@dojoengine/sdk/react";
import { SchemaType as LutteSchemaType } from "../Helpers/models.gen";
import { create } from "zustand";

interface State {
  globalMusic: boolean;
  transitionTrigger: boolean;
  setTransitionTrigger: (new_value: boolean) => void;
  setGlobalMusic: (new_value: boolean) => void;
}

const useGameStore = create<State>((set) => ({
  globalMusic: true,
  transitionTrigger: false,
  setTransitionTrigger: (new_value: boolean) => {
    set(() => ({ transitionTrigger: new_value }));
  },
  setGlobalMusic: (new_value: boolean) => {
    set(() => ({ globalMusic: new_value }));
  }
}));

const useStore = createDojoStore<LutteSchemaType>();

export { useStore, useGameStore };
