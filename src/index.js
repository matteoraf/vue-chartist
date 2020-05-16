exports.install = function (Vue, options = {}) {
  const defaultOptions = { messageNoData: '', classNoData: 'ct-nodata' }
  options = Object.assign({}, defaultOptions, options)

  Vue.chartist = require('@matteoraf/chartist')
  Vue.prototype.$chartist = require('@matteoraf/chartist')

  Vue.component('Chartist', {
    props: {
      ratio: {
        type: String,
        default: 'ct-square'
      },
      data: {
        type: Object,
        default () {
          return {
            series: [],
            labels: []
          }
        }
      },
      options: {
        type: Object,
        default () {
          return {}
        }
      },
      type: {
        type: String,
        required: true,
        validator (val) {
          return val === 'Pie' || val === 'Line' || val === 'Bar'
        }
      },
      eventHandlers: {
        type: Array,
        default () {
          return []
        }
      },
      responsiveOptions: {
        type: Array,
        default () {
          return []
        }
      }
    },
    data () {
      return {
        chart: null,
        error: { onError: false, message: '' },
        noData: false,
        message: '',
        classNoData: options.classNoData
      }
    },
    watch: {
      ratio: 'redraw',
      options: { handler: 'redraw', deep: true },
      responsiveOptions: { handler: 'redraw', deep: true },
      data: { handler: 'redraw', deep: true },
      type: 'draw',
      eventHandlers: 'resetEventHandlers'
    },
    mounted () {
      this.draw()
    },
    methods: {
      clear () {
        this.noData = false
        this.message = ''
        if (this.error.onError) {
          this.error = { onError: false, message: '' }
        }
      },
      draw () {
        if (this.haveNoData()) {
          return this.setNoData()
        }
        this.clear()
        this.chart = new this.$chartist[this.type](this.$refs.chart, this.data, this.options, this.responsiveOptions)
        this.setEventHandlers()
      },
      haveNoData () {
        return !this.data ||
          !this.data.series ||
          this.data.series.length < 1 ||
          (
            (this.type !== 'Pie' && !this.options.distributeSeries) &&
            this.data.series.every(series => {
              if (Array.isArray(series)) {
                return !series.length
              }
              return !series.data.length
            })
          )
      },
      redraw: function redraw() {
        if (this.error.onError) {
          return this.draw();
        }
        this.clear();
        this.chart.update(this.data, this.options, false, this.responsiveOptions);
        if (this.haveNoData()) {
          return this.setNoData();
        }
      },
      resetEventHandlers (eventHandlers, oldEventHandler) {
        if (!this.chart) {
          return
        }
        for (let item of oldEventHandler) {
          this.chart.off(item.event, item.fn)
        }
        for (let item of eventHandlers) {
          this.chart.on(item.event, item.fn)
        }
      },
      setEventHandlers () {
        if (this.eventHandlers) {
          for (let item of this.eventHandlers) {
            this.chart.on(item.event, item.fn)
          }
        }
      },
      setNoData () {
        this.error = { onError: true, message: options.messageNoData }
        this.noData = true
        this.message = this.error.message
      }
    },
    render (h) {
      const children = this.message || this.$slots.default || [];

      return h('div', {
        ref: 'chart',
        'class': [
          this.ratio,
          { [this.classNoData]: this.noData }
        ]
      }, children)
    }
  })
}
