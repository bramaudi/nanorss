import routes from './routes';
import { useRoutes } from '@solidjs/router'
import Header from './components/Header';

const App = () => {
  const Routes = useRoutes(routes)
  return (
    <>
      <Header />
      <Routes />
    </>
  );
};

export default App;
