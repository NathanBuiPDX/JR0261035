import './App.css';
import Home from './pages/Home';
import Graph from './pages/Graph';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/graph" component={Graph} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
