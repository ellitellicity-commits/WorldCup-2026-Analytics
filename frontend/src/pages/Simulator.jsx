import { useRef, useState } from 'react'
import GlobeHero from '../components/GlobeHero'
import CountryEmblem from '../components/CountryEmblem'
import { TEAM_COORDINATES, STADIUMS } from '../lib/stadiumData'
import { teamMeta } from '../lib/teams'
import './Simulator.css'

// Minimal Part-A/B harness: proves GlobeHero flies a real great-circle arc and
// that crossing a host's airspace plays that country's emblem. The full
// team/round selector + result panel land in Part C (via craft).
const AR = TEAM_COORDINATES['Argentina']
const STAD = STADIUMS['MetLife Stadium']
const HOSTS = [
  { code: 'CA', label: 'Canada' },
  { code: 'MX', label: 'Mexico' },
  { code: 'US', label: 'USA' },
]

export default function Simulator() {
  const [flight, setFlight] = useState(null)
  const [arrived, setArrived] = useState(false)
  const [emblem, setEmblem] = useState(null)
  const lastHost = useRef(null)

  const markers = [
    { name: 'Argentina', lat: AR[0], lng: AR[1], code: teamMeta('Argentina').code, hot: true },
    { name: 'MetLife Stadium', lat: STAD.lat, lng: STAD.lng, hot: true },
  ]
  const fly = () => {
    setArrived(false)
    lastHost.current = null
    setFlight({ id: Date.now(), from: AR, to: [STAD.lat, STAD.lng] })
  }
  // Fire an emblem the first frame the plane enters a host's circle; reset when
  // it leaves so re-entry can re-trigger. One host at a time (no cross-fire).
  const onProgress = ({ host }) => {
    if (host && host !== lastHost.current) {
      lastHost.current = host
      setEmblem({ code: host, id: Date.now() })
    } else if (!host) {
      lastHost.current = null
    }
  }

  return (
    <div className="sim">
      <div className="sim__stage">
        <GlobeHero
          mode="flight"
          markers={markers}
          flight={flight}
          onFlightProgress={onProgress}
          onFlightComplete={() => setArrived(true)}
          ariaLabel="Match flight globe"
        />
      </div>
      <div className="sim__controls">
        <button className="sim__btn" onClick={fly} type="button">Fly to the match</button>
        <div className="sim__emblems" role="group" aria-label="Preview host emblems">
          {HOSTS.map((h) => (
            <button
              key={h.code}
              type="button"
              className="sim__emblem-btn"
              data-emblem={h.code}
              onClick={() => setEmblem({ code: h.code, id: Date.now() })}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>
      <p className="sim__status" data-arrived={arrived}>{arrived ? 'Arrived' : ''}</p>
      {emblem && <CountryEmblem key={emblem.id} country={emblem.code} onDone={() => setEmblem(null)} />}
    </div>
  )
}
