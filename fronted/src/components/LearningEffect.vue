<template>
  <div class="stat-card">
    <div class="card-header">
      <h3>学生学习效果</h3>
    </div>
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script>
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent
} from "echarts/components";
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent
]);

export default {
  name: 'LearningEffect',
  setup() {
    const chartRef = ref(null);
    let chart = null;

    const initChart = () => {
      if (chartRef.value) {
        chart = echarts.init(chartRef.value);
        const option = {
          grid: {
            top: '15%',
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderColor: '#78c4dd',
            borderWidth: 1,
            padding: [10, 15],
            textStyle: {
              color: '#3f6487',
              fontSize: 13
            },
            formatter: function(params) {
              return params[0].name + '<br/>' +
                     '<span style="color: #78c4dd; font-weight: bold; font-size: 14px">' + 
                     params[0].value + '%</span>';
            },
            extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 4px;'
          },
          xAxis: {
            type: 'category',
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            axisLine: {
              lineStyle: {
                color: '#78c4dd',
                width: 2
              }
            },
            axisLabel: {
              color: '#3f6487',
              fontSize: 12,
              margin: 12
            }
          },
          yAxis: {
            type: 'value',
            name: '正确率',
            nameTextStyle: {
              color: '#78c4dd',
              fontSize: 13,
              padding: [0, 0, 8, 0]
            },
            min: 0,
            max: 100,
            axisLine: {
              show: true,
              lineStyle: {
                color: '#78c4dd',
                width: 2
              }
            },
            axisLabel: {
              color: '#3f6487',
              fontSize: 12,
              formatter: '{value}%'
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(120,196,221,0.1)',
                type: 'dashed'
              }
            }
          },
          series: [
            {
              name: '正确率',
              type: 'line',
              smooth: true,
              symbol: 'circle',
              symbolSize: 8,
              itemStyle: {
                color: '#A0DB67'
              },
              lineStyle: {
                color: '#A0DB67',
                width: 2
              },
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [{
                    offset: 0,
                    color: 'rgba(160, 219, 103, 0.3)'
                  }, {
                    offset: 1,
                    color: 'rgba(160, 219, 103, 0.05)'
                  }]
                }
              },
              data: [85, 90, 85, 90, 85, 95, 90]
            }
          ]
        };
        chart.setOption(option);

        // 监听窗口大小变化
        window.addEventListener('resize', () => {
          chart && chart.resize();
        });
      }
    };

    onMounted(() => {
      initChart();
    });

    return {
      chartRef
    };
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
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(120, 196, 221, 0.1) 0%, rgba(47, 137, 227, 0.05) 100%);
  pointer-events: none;
}

.card-header {
  display: flex;
  align-items: center;
  padding-left: 20px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.header-icon {
  width: 30px;
  height: 30px;
  margin-right: 10px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #3f6487 !important;
  margin-left: 20px;
  font-weight: 600;
  letter-spacing: 0.5px;
  position: relative;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.chart-container {
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.4));
  border-radius: 8px;
  padding: 15px;
  height: calc(100% - 50px);
  margin-top: 10px;
}

.chart {
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.5));
  border-radius: 8px;
  padding: 10px;
}

.chart-container:hover {
  background: rgba(255, 255, 255, 0.18);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}
</style> 