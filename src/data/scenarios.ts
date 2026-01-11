import { ScenarioParams } from '../simulation/scenarioBuilder'

export interface ScenarioDefinition {
  id: string
  name: string
  description: string
  params: ScenarioParams
}

export const SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'baseline',
    name: 'Baseline Operation',
    description: 'Iowa location with 8,000 H100 GPUs running at 85% utilization under normal conditions',
    params: {
      location: 'iowa',
      gpuType: 'H100_SXM',
      gpuCount: 8000,
      targetUtilization: 0.85,
      ambientTempC: 25,
      wetBulbTempC: 18,
      economizerEnabled: true
    }
  },
  {
    id: 'dynamic_summer',
    name: '🌡️ Dynamic Summer Day',
    description: 'Varying temperature, business hours workload, time-of-use pricing - see the dynamics!',
    params: {
      location: 'iowa',
      gpuType: 'H100_SXM',
      gpuCount: 8000,
      targetUtilization: 0.85,
      ambientTempC: 25,
      wetBulbTempC: 18,
      economizerEnabled: true,
      weatherProfile: 'typical_summer',
      workloadProfile: 'business_hours',
      electricityProfile: 'tou_standard'
    }
  },
  {
    id: 'extreme_heat_dynamic',
    name: '🔥 Extreme Heat + Peak Pricing',
    description: 'Hot day with varying load and extreme peak pricing - worst case scenario',
    params: {
      location: 'texas',
      gpuType: 'H100_SXM',
      gpuCount: 8000,
      targetUtilization: 0.85,
      ambientTempC: 40,
      wetBulbTempC: 28,
      economizerEnabled: true,
      weatherProfile: 'hot_day',
      workloadProfile: 'batch_training',
      electricityProfile: 'tou_extreme'
    }
  },
  {
    id: 'cool_day_optimal',
    name: '❄️ Cool Day - Free Cooling',
    description: 'Low temperatures enable free cooling all day, minimal costs',
    params: {
      location: 'sweden',
      gpuType: 'H100_SXM',
      gpuCount: 8000,
      targetUtilization: 0.85,
      ambientTempC: 10,
      wetBulbTempC: 7,
      economizerEnabled: true,
      weatherProfile: 'cool_day',
      workloadProfile: 'constant',
      electricityProfile: 'flat_rate'
    }
  },
  {
    id: 'inference_workload',
    name: '🤖 Inference-Heavy Workload',
    description: 'Lower base utilization with peaks during user activity hours',
    params: {
      location: 'iowa',
      gpuType: 'H100_SXM',
      gpuCount: 8000,
      targetUtilization: 0.60,
      ambientTempC: 25,
      wetBulbTempC: 18,
      economizerEnabled: true,
      weatherProfile: 'typical_summer',
      workloadProfile: 'inference_heavy',
      electricityProfile: 'renewable_heavy'
    }
  },
  {
    id: 'hot_day',
    name: 'Hot Day Stress Test',
    description: 'Same as baseline but with extreme heat (40°C ambient) to test cooling limits',
    params: {
      location: 'iowa',
      gpuType: 'H100_SXM',
      gpuCount: 8000,
      targetUtilization: 0.85,
      ambientTempC: 40,
      wetBulbTempC: 28,
      economizerEnabled: true
    }
  },
  {
    id: 'b200_upgrade',
    name: 'B200 Technology Upgrade',
    description: 'Upgraded to B200 GPUs with higher TDP (1000W vs 700W) for increased performance',
    params: {
      location: 'iowa',
      gpuType: 'B200',
      gpuCount: 8000,
      targetUtilization: 0.85,
      ambientTempC: 25,
      wetBulbTempC: 18,
      economizerEnabled: true
    }
  }
]
