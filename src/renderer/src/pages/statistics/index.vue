<script setup lang='ts'>
import { useFilesStore } from "@renderer/stores"
import { computed, ref } from "vue"
import { VueEcharts, } from "vue3-echarts"
import { EChartsOption, color } from "echarts"
import { chunk, floor, fromPairs, isArray, sortBy, toPairs, keys, sumBy, sum, values, uniq, ceil } from "lodash-es"
import { NScrollbar } from "naive-ui"
import { FileObj } from "@renderer/helpers/data"
const filesStore = useFilesStore()
const allFileByOrigin = computed(() => fromPairs(keys(filesStore.tags.origin).map(origin => [origin, filesStore.editedFiles.filter(file => file.meta[0]?.includes(origin))] as [string, FileObj[]])))
const allFileByAnthor = computed(() => fromPairs(keys(filesStore.tags.anthor).map(anthor => [anthor, filesStore.editedFiles.filter(file => file.meta[1]?.includes(anthor))] as [string, FileObj[]])))
const isByAnthor = ref(true)
const countValue = (valueRound: string[], needValue: string) => {
  const result = Array.from({ length: valueRound.length }).map(() => 0)
  let index = -1
  for (const value of valueRound) {
    index++
    for (const flies of (isByAnthor.value ? allFileByAnthor : allFileByOrigin).value[value]) {
      for (const fileValue of uniq(flies.meta[isByAnthor.value ? 0 : 1]!)) {
        if (needValue == fileValue) {
          result[index]++
        }
      }
    }
  }

  return result
}
const dataColorMap = computed(() => {
  const value = keys(!isByAnthor.value ? filesStore.tags.anthor : filesStore.tags.origin)
  return fromPairs(value.map(v => [v, color.random()]))
})

const chunkLength = 15
const options = computed<EChartsOption[]>(() => chunk(sortBy(toPairs(isByAnthor.value ? filesStore.tags.anthor : filesStore.tags.origin), v => v[1]).map(v => v[0]).toReversed(), chunkLength).map((valueRound, index) => (<EChartsOption>{
  title: {
    text: `${keys(isByAnthor.value ? filesStore.tags.anthor : filesStore.tags.origin).length}/[${1 + index * chunkLength}->${valueRound.length + index * chunkLength}](${valueRound.length})`
  },
  legend: {
    type: 'scroll',
    orient: 'vertical',
    right: 10,
    top: 20,
    bottom: 20,
    height: '50%'
  },
  yAxis: {
    type: 'value',
    min: 0,
    max(value) {
      return ceil(value.max * 1.1)
    }
  },
  xAxis: {
    type: 'category',
    data: valueRound,
    axisLabel: {
      interval: 0,
      rotate: 30
    },
    splitLine: { show: false }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
    appendTo: document.body,
    formatter: (params: echarts.TooltipComponentFormatterCallbackParams) => {
      if (isArray(params)) {
        let res = `
          <div>
            <span class="mr-1">${params[0].name}</span>
            <span class="font-bold">${sumBy(params, v => Number(v.value))}</span>
          </div>
        `
        for (const item of params) {
          if (item.value !== 0) {
            res += `
            <div class="flex justify-between">
              <span><span class="size-[10px] rounded-full inline-block mr-[10px]" style="background: ${item.color};"></span> ${item.seriesName}</span>
              <span class="font-bold ml-3">${item.value}</span>
            </div>
            `
          }
        }
        return res
      }
      return ''
    }
  },

  series: (isByAnthor.value ? keys(filesStore.tags.origin) : keys(filesStore.tags.anthor)).map(needValue => (<echarts.SeriesOption>{
    name: needValue,
    emphasis: {
      focus: 'series'
    },
    type: 'bar',
    stack: 'totel',
    barWidth: '50%',
    label: {
      show: true,
      formatter: (v) => v.value == 0 ? '' : `${needValue}: ${v.value}`
    },
    data: countValue(valueRound, needValue),
    color: dataColorMap.value[needValue]
  })).filter(v => (<number[]>v.data).some(v => v != 0))
})))

const persentMapOption = computed<EChartsOption>(() => (<EChartsOption>{
  legend: {
    type: 'scroll',
    orient: 'vertical',
    left: 10,
    top: 20,
    bottom: 20,
    height: '90%'
  },
  label: {
    alignTo: 'edge',
    formatter: '{name|{b}}\n{file|{c} 张}',
    // minMargin: 50,
    edgeDistance: 50,
    // lineHeight: 15,
    rich: {
      file: {
        fontSize: 10,
        color: '#999'
      }
    }
  },
  labelLine: {
    length: 15,
    length2: 0,
    maxSurfaceAngle: 80
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  tooltip: {
    trigger: 'item',
    formatter: (params: echarts.TooltipComponentFormatterCallbackParams) => {
      if (isArray(params)) return
      return `
        <div>
          <span class="mr-1">${params.name}</span>
          <span class="font-bold">${params.value}</span>
        </div>
        <div class="flex justify-between">
          <span> ${params.seriesName}</span>
          <span class="font-bold ml-3">${floor(Number(params.value) / sum(values(isByAnthor.value ? filesStore.tags.anthor : filesStore.tags.origin)) * 100, 2)}%</span>
        </div>
      `
    }
  },
  series: [{
    name: '占比统计',
    type: 'pie',
    radius: '80%',
    data: sortBy(toPairs(isByAnthor.value ? filesStore.tags.anthor : filesStore.tags.origin).map(v => ({ name: v[0], value: v[1], })), v => v.value),
    label: {
      length: 15,
      length2: 0,
      maxSurfaceAngle: 80
    },
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    }
  }]
}))
</script>

<template>
  <div>
    <div class="w-full h-10 flex items-center justify-center">
      <span class="font-bold mr-2 text-lg ">
        已加入统计的文件:{{ filesStore.editedNamedFilesNumber }}
        ({{ floor((filesStore.editedNamedFilesNumber / filesStore.files.length) * 100, 2) }}%)
      </span>
      <div>按出处<n-switch v-model:value="isByAnthor" />按作者</div>
    </div>
    <NScrollbar class="w-full h-[80vh]">
      <VueEcharts v-for="option of options" :option class="w-[95%] mx-auto h-[75vh]" />
      <VueEcharts :option="persentMapOption" class="w-[95%] mx-auto h-[75vh]" />
    </NScrollbar>
  </div>
</template>