import './App.css';
import Table from './pages/Table';
import Graph from './pages/Graph';
import NavBar from './components/NavBar';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Router>
        <NavBar/>
        <Switch>
          <Route exact path="/" component={Table} />
          <Route path="/graph" component={Graph} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
