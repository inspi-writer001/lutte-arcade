// import { shortString } from "starknet";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import "./App.css";
import HomePage from "./Pages/HomePage";
import SelectCharacter from "./Pages/SelectCharacter";

// const CONTRACT_ADDRESS =
//   "0x0548f0a62cf7d5cd0ad5d01e009d309a2bf53bb08e7b59bd696dcb146d4dfdcf";

function App() {
  return (
    <>
      {/* <StarknetConfig
        autoConnect
        chains={[sepolia]}
        connectors={[connector]}
        explorer={starkscan}
        provider={provider}
      > */}
      <Router>
        <Routes>
          <Route path="/" Component={() => <HomePage />} />

          <Route path="/character-shop" Component={() => <SelectCharacter />} />
        </Routes>
      </Router>
      {/* </StarknetConfig> */}
    </>
  );
}

export default App;
