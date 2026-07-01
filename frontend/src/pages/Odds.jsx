import ChampionshipOdds from '../components/ChampionshipOdds'
import { loadOdds } from '../lib/data'

const oddsData = loadOdds()

function Odds() {
  return <ChampionshipOdds odds={oddsData} />
}

export default Odds
