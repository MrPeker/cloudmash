'use strict';

const e = React.createElement;

const Header = () => {
  return (
    <header>
      <h3>Cloudmash</h3>
      <h1>Which is HOTTER?</h1>
    </header>
  )
}

const App = () => {
  return (
    <div>
      <Header/>
    </div>
  )
}


const domContainer = document.querySelector('#root');
ReactDOM.render(e(App), domContainer);

