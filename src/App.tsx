import React, { useState } from "react";
import "./App.css";
import { useSelector } from "react-redux";

import HomePage from "./pages/home/home";
import LoginPage from "./pages/login/login";
import SettingsPage from "./pages/settings/settings";

import { RootState } from "./state/store";

const App: React.FC = () => {
  let isLoggedIn = useSelector((state: RootState) => state.login.isLoggedIn);
  let settings = useSelector((state: RootState) => state.login.settings);
  if (settings) {
    return <SettingsPage />;
  } else if (isLoggedIn) {
    return <HomePage />;
  } else {
    return <LoginPage />;
  }
}

export default App;
