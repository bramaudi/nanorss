import routes from './routes';
import { useRoutes } from '@solidjs/router'

const App = () => {
  const Routes = useRoutes(routes)
  return <Routes />;
};

export default App;
