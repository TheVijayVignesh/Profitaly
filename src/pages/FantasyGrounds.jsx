import { FantasyProvider } from "../features/fantasy-grounds/hooks/useFantasyContext";
import FantasyGroundsPage from "../features/fantasy-grounds/pages/FantasyGrounds";

const FantasyGrounds = () => {
  return (
    <FantasyProvider>
      <FantasyGroundsPage />
    </FantasyProvider>
  );
};

export default FantasyGrounds; 