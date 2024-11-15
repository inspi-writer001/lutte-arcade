import { useState } from "react";
import LoadingPage from "./Pages/LoadingPage";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import "./App.css";
import HomePage from "./Pages/HomePage";
import SelectCharacter from "./Pages/SelectCharacter";

function App() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {loaded ? (
        <Router>
          <Routes>
            <Route path="/" Component={() => <HomePage />} />

            <Route
              path="/character-shop"
              Component={() => <SelectCharacter />}
            />
          </Routes>
        </Router>
      ) : (
        <LoadingPage onLoaded={() => setLoaded(true)} />
      )}
    </>
  );
}

export default App;
