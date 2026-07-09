// Team metadata - joins odds.json (keyed by full team name) to the FIFA code,
// group letter (from fixtures.json), and ISO-3166 alpha-2 code that flag-icons
// uses to name its flag SVG. England / Scotland use GB subdivisions.
//
// We import only the 48 flags actually in the tournament (as Vite-hashed URLs)
// rather than the whole flag-icons stylesheet - that ships ~250 flags and a
// 437 KB CSS file for a 48-team table.
import f_ar from 'flag-icons/flags/4x3/ar.svg'
import f_fr from 'flag-icons/flags/4x3/fr.svg'
import f_br from 'flag-icons/flags/4x3/br.svg'
import f_gb_eng from 'flag-icons/flags/4x3/gb-eng.svg'
import f_es from 'flag-icons/flags/4x3/es.svg'
import f_pt from 'flag-icons/flags/4x3/pt.svg'
import f_co from 'flag-icons/flags/4x3/co.svg'
import f_nl from 'flag-icons/flags/4x3/nl.svg'
import f_ch from 'flag-icons/flags/4x3/ch.svg'
import f_no from 'flag-icons/flags/4x3/no.svg'
import f_jp from 'flag-icons/flags/4x3/jp.svg'
import f_be from 'flag-icons/flags/4x3/be.svg'
import f_ec from 'flag-icons/flags/4x3/ec.svg'
import f_de from 'flag-icons/flags/4x3/de.svg'
import f_mx from 'flag-icons/flags/4x3/mx.svg'
import f_tr from 'flag-icons/flags/4x3/tr.svg'
import f_hr from 'flag-icons/flags/4x3/hr.svg'
import f_sn from 'flag-icons/flags/4x3/sn.svg'
import f_uy from 'flag-icons/flags/4x3/uy.svg'
import f_ca from 'flag-icons/flags/4x3/ca.svg'
import f_ma from 'flag-icons/flags/4x3/ma.svg'
import f_at from 'flag-icons/flags/4x3/at.svg'
import f_py from 'flag-icons/flags/4x3/py.svg'
import f_us from 'flag-icons/flags/4x3/us.svg'
import f_au from 'flag-icons/flags/4x3/au.svg'
import f_kr from 'flag-icons/flags/4x3/kr.svg'
import f_gb_sct from 'flag-icons/flags/4x3/gb-sct.svg'
import f_dz from 'flag-icons/flags/4x3/dz.svg'
import f_cz from 'flag-icons/flags/4x3/cz.svg'
import f_ir from 'flag-icons/flags/4x3/ir.svg'
import f_pa from 'flag-icons/flags/4x3/pa.svg'
import f_eg from 'flag-icons/flags/4x3/eg.svg'
import f_uz from 'flag-icons/flags/4x3/uz.svg'
import f_cd from 'flag-icons/flags/4x3/cd.svg'
import f_jo from 'flag-icons/flags/4x3/jo.svg'
import f_ba from 'flag-icons/flags/4x3/ba.svg'
import f_ci from 'flag-icons/flags/4x3/ci.svg'
import f_nz from 'flag-icons/flags/4x3/nz.svg'
import f_se from 'flag-icons/flags/4x3/se.svg'
import f_cv from 'flag-icons/flags/4x3/cv.svg'
import f_cw from 'flag-icons/flags/4x3/cw.svg'
import f_gh from 'flag-icons/flags/4x3/gh.svg'
import f_ht from 'flag-icons/flags/4x3/ht.svg'
import f_iq from 'flag-icons/flags/4x3/iq.svg'
import f_qa from 'flag-icons/flags/4x3/qa.svg'
import f_sa from 'flag-icons/flags/4x3/sa.svg'
import f_za from 'flag-icons/flags/4x3/za.svg'
import f_tn from 'flag-icons/flags/4x3/tn.svg'

const FLAG = {
  ar: f_ar,
  fr: f_fr,
  br: f_br,
  'gb-eng': f_gb_eng,
  es: f_es,
  pt: f_pt,
  co: f_co,
  nl: f_nl,
  ch: f_ch,
  no: f_no,
  jp: f_jp,
  be: f_be,
  ec: f_ec,
  de: f_de,
  mx: f_mx,
  tr: f_tr,
  hr: f_hr,
  sn: f_sn,
  uy: f_uy,
  ca: f_ca,
  ma: f_ma,
  at: f_at,
  py: f_py,
  us: f_us,
  au: f_au,
  kr: f_kr,
  'gb-sct': f_gb_sct,
  dz: f_dz,
  cz: f_cz,
  ir: f_ir,
  pa: f_pa,
  eg: f_eg,
  uz: f_uz,
  cd: f_cd,
  jo: f_jo,
  ba: f_ba,
  ci: f_ci,
  nz: f_nz,
  se: f_se,
  cv: f_cv,
  cw: f_cw,
  gh: f_gh,
  ht: f_ht,
  iq: f_iq,
  qa: f_qa,
  sa: f_sa,
  za: f_za,
  tn: f_tn,
}

const TEAM_META = {
  Argentina: { code: 'ARG', group: 'J', iso: 'ar' },
  France: { code: 'FRA', group: 'I', iso: 'fr' },
  Brazil: { code: 'BRA', group: 'D', iso: 'br' },
  England: { code: 'ENG', group: 'L', iso: 'gb-eng' },
  Spain: { code: 'ESP', group: 'G', iso: 'es' },
  Portugal: { code: 'POR', group: 'K', iso: 'pt' },
  Colombia: { code: 'COL', group: 'K', iso: 'co' },
  Netherlands: { code: 'NED', group: 'F', iso: 'nl' },
  Switzerland: { code: 'SUI', group: 'B', iso: 'ch' },
  Norway: { code: 'NOR', group: 'I', iso: 'no' },
  Japan: { code: 'JPN', group: 'F', iso: 'jp' },
  Belgium: { code: 'BEL', group: 'H', iso: 'be' },
  Ecuador: { code: 'ECU', group: 'E', iso: 'ec' },
  Germany: { code: 'GER', group: 'E', iso: 'de' },
  Mexico: { code: 'MEX', group: 'A', iso: 'mx' },
  Turkey: { code: 'TUR', group: 'C', iso: 'tr' },
  Croatia: { code: 'CRO', group: 'L', iso: 'hr' },
  Senegal: { code: 'SEN', group: 'I', iso: 'sn' },
  Uruguay: { code: 'URU', group: 'G', iso: 'uy' },
  Canada: { code: 'CAN', group: 'B', iso: 'ca' },
  Morocco: { code: 'MAR', group: 'D', iso: 'ma' },
  Austria: { code: 'AUT', group: 'J', iso: 'at' },
  Paraguay: { code: 'PAR', group: 'C', iso: 'py' },
  'United States': { code: 'USA', group: 'C', iso: 'us' },
  Australia: { code: 'AUS', group: 'C', iso: 'au' },
  'South Korea': { code: 'KOR', group: 'A', iso: 'kr' },
  Scotland: { code: 'SCO', group: 'D', iso: 'gb-sct' },
  Algeria: { code: 'ALG', group: 'J', iso: 'dz' },
  Czechia: { code: 'CZE', group: 'A', iso: 'cz' },
  Iran: { code: 'IRN', group: 'H', iso: 'ir' },
  Panama: { code: 'PAN', group: 'L', iso: 'pa' },
  Egypt: { code: 'EGY', group: 'H', iso: 'eg' },
  Uzbekistan: { code: 'UZB', group: 'K', iso: 'uz' },
  'DR Congo': { code: 'COD', group: 'K', iso: 'cd' },
  Jordan: { code: 'JOR', group: 'J', iso: 'jo' },
  'Bosnia and Herzegovina': { code: 'BIH', group: 'B', iso: 'ba' },
  'Ivory Coast': { code: 'CIV', group: 'E', iso: 'ci' },
  'New Zealand': { code: 'NZL', group: 'H', iso: 'nz' },
  Sweden: { code: 'SWE', group: 'F', iso: 'se' },
  'Cape Verde': { code: 'CPV', group: 'G', iso: 'cv' },
  'Curaçao': { code: 'CUW', group: 'E', iso: 'cw' },
  Ghana: { code: 'GHA', group: 'L', iso: 'gh' },
  Haiti: { code: 'HAI', group: 'D', iso: 'ht' },
  Iraq: { code: 'IRQ', group: 'I', iso: 'iq' },
  Qatar: { code: 'QAT', group: 'B', iso: 'qa' },
  'Saudi Arabia': { code: 'KSA', group: 'G', iso: 'sa' },
  'South Africa': { code: 'RSA', group: 'A', iso: 'za' },
  Tunisia: { code: 'TUN', group: 'F', iso: 'tn' },
}

const UNKNOWN = { code: '-', group: '?', iso: null }

export function teamMeta(name) {
  return TEAM_META[name] || UNKNOWN
}

// Vite-hashed URL for a team's flag SVG, or null if we don't carry it.
export function flagUrl(iso) {
  return (iso && FLAG[iso]) || null
}

export default TEAM_META
