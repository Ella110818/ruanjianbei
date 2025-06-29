<template>
  <div class="stat-card">
    <div class="card-header">
      <h3>教学效率指数</h3>
    </div>
    <div class="chart-container">
      <v-chart class="chart" :option="chartOption" />
    </div>
  </div>
</template>

<script>
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import { LegendComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer,
  PieChart,
  LegendComponent,
  TooltipComponent
])

export default {
  name: 'TeachingEfficiency',
  components: {
    VChart
  },
  data() {
    return {
      chartOption: {
        tooltip: {
          show: false
        },
        legend: {
          show: false
        },
        series: [
          {
            type: 'pie',
            radius: ['42%', '65%'],
            center: ['50%', '55%'],
            silent: true,
            animation: false,
            itemStyle: {
              color: 'rgba(255, 255, 255, 0.25)',
              borderWidth: 2,
              borderColor: 'rgba(255, 255, 255, 0.35)'
            },
            label: {
              show: false
            },
            data: [{ value: 100 }],
            z: 1
          },
          {
            type: 'pie',
            radius: ['45%', '60%'],
            center: ['50%', '55%'],
            avoidLabelOverlap: true,
            label: {
              show: true,
              position: 'outside',
              formatter: function(params) {
                return params.name + ': ' + params.value + 'h';
              },
              color: '#72b9f7',
              fontSize: 13,
              lineHeight: 18,
              padding: [0, 0, 0, 0],
              distanceToLabelLine: 15
            },
            labelLine: {
              show: true,
              length: 50,
              length2: 15,
              maxSurfaceAngle: 100,
              minTurnAngle: 90,
              lineStyle: {
                color: '#72b9f7',
                width: 1,
                type: 'solid'
              }
            },
            data: [
              { 
                value: 1.9, 
                name: '备课耗时',
                itemStyle: { 
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 1,
                    y2: 0,
                    colorStops: [{
                      offset: 0,
                      color: '#0281F8'
                    }, {
                      offset: 1,
                      color: '#00ABFC'
                    }]
                  }
                }
              },
              { 
                value: 1.1, 
                name: '备课修正耗时',
                itemStyle: { 
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 1,
                    y2: 0,
                    colorStops: [{
                      offset: 0,
                      color: '#44E16B'
                    }, {
                      offset: 1,
                      color: '#73EB8B'
                    }]
                  }
                }
              },
              { 
                value: 0.8, 
                name: '练习设计耗时',
                itemStyle: { 
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 1,
                    y2: 0,
                    colorStops: [{
                      offset: 0,
                      color: '#F89F08'
                    }, {
                      offset: 1,
                      color: '#FDC500'
                    }]
                  }
                }
              },
              { 
                value: 1.8, 
                name: '练习修正耗时',
                itemStyle: { 
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 1,
                    y2: 0,
                    colorStops: [{
                      offset: 0,
                      color: '#23B3FC'
                    }, {
                      offset: 1,
                      color: '#09E5FC'
                    }]
                  }
                }
              }
            ],
            emphasis: {
              disabled: true
            },
            z: 2
          }
        ]
      }
    }
  }
}
</script>

<style scoped>
.stat-card {
  background: linear-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)), url('@/assets/image 8.png') no-repeat;
  background-size: 100% 100%;
  padding: 10px 25px 25px 25px;
  border-radius: 10px;
  height: 320px;
  color: #fff;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: center;
  padding-left: 20px;
}

.header-icon {
  width: 30px;
  height: 30px;
  margin-right: 10px;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #3f6487 !important;
  margin-left: 20px;
}

.chart-container {
  width: 100%;
  height: calc(100% - 45px);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 5px;
  padding: 0 10px;
}

.chart {
  width: 100%;
  height: 100%;
  margin: 0 auto;
}
</style> 