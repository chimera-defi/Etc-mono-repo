import {
  SITE_CONFIG,
  NAV_LINKS,
  STATS,
  EXECUTION_CLIENTS,
  CONSENSUS_CLIENTS,
  FEATURES,
  DOCUMENTATION_LINKS,
  INSTALLATION_STEPS,
  PREREQUISITES,
} from '@/lib/constants'

describe('constants', () => {
  it('SITE_CONFIG has required properties', () => {
    expect(SITE_CONFIG.github).toMatch(/^https:\/\/github\.com\//)
  })

  it('arrays are not empty', () => {
    expect(NAV_LINKS.length).toBeGreaterThan(0)
    expect(STATS.length).toBeGreaterThan(0)
    expect(EXECUTION_CLIENTS).toHaveLength(6)
    expect(CONSENSUS_CLIENTS).toHaveLength(6)
    expect(FEATURES).toHaveLength(5)
    expect(DOCUMENTATION_LINKS.length).toBeGreaterThan(0)
    expect(INSTALLATION_STEPS).toHaveLength(5)
    expect(PREREQUISITES.length).toBeGreaterThan(0)
  })

  it('clients have required properties', () => {
    EXECUTION_CLIENTS.forEach(c => {
      expect(c).toHaveProperty('name')
      expect(c).toHaveProperty('language')
    })
    CONSENSUS_CLIENTS.forEach(c => {
      expect(c).toHaveProperty('name')
      expect(c).toHaveProperty('language')
    })
  })

  it('installation steps are sequential', () => {
    INSTALLATION_STEPS.forEach((step, i) => {
      expect(step.step).toBe(i + 1)
    })
  })
})
