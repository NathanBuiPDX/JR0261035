import "./App.css";
import Table from "./pages/Table";
import Graph from "./pages/Graph";
import NavBar from "./components/NavBar";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Router>
        <NavBar />
        <Switch>
          <Route exact path="/" render={(props) => <Redirect to="/table" />} />
          <Route exact path="/table" component={Table} />
          <Route exact path="/graph" component={Graph} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
