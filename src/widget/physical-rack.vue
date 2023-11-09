<template>
  <div class="">
    <div v-if="repeatNames.length > 0" style="margin-bottom: 10px; color: red; word-break: break-word">
      <a-alert :closable="false" type="error">
        <template #description>
          <div class="rack-alert">
            <p>{{ $t('Node.Error') }}</p>
            <p :title="repeatNames.join(', ')">
              {{ repeatNames.join(', ') }}
            </p>
          </div>
        </template>
      </a-alert>
    </div>
    <div :style="rack_css">
      <div class="rack-inner-public">
        <div
          v-for="node in nodes"
          v-show="!node.location.chassisId"
          :key="node.id + 'node'"
          :class="{ 'node-is-selected': selected == node.hostname }"
          :style="get_node_css(node.location.height, node.location.width, node.location.u, node.frontimage)"
          @click="onNodeClick(node)">
          <physical-node :colors="levelColors" :ranges="levelRanges" :node="node" :mode="mode" node-type="" />
        </div>
        <div
          v-for="sw in switches"
          :key="sw.id + 'switch'"
          :style="get_node_css(sw.location.height, sw.location.width, sw.location.u, sw.frontimage)">
          <physical-node :colors="levelColors" :ranges="levelRanges" :node="sw" :mode="mode" nodetype="switch" />
        </div>
        <div
          v-for="c in chassis"
          :key="c.id + 'chassis'"
          :style="get_node_css(get_u_num(c.width_height[1]), 1, c.location.u, c.frontimage)">
          <div :style="get_chassis_css(c)">
            <a-popover
              v-if="!chassisNodes[c.id]"
              class="chassisPopoverstyle"
              :disabled="chassisDisable(c)"
              width="200"
              trigger="hover"
              :title="c.name">
              <template #content>
                <p>
                  {{ $t('Node.MachineType') + '：' + c.machinetype }}
                </p>
              </template>
              <div :id="'chassis_' + c.id" class="rack-inner-public" />
            </a-popover>
            <div v-else :id="'chassis_' + c.id" class="rack-inner-public">
              <div
                v-for="n in chassisNodes[c.id]"
                :key="n.id + 'chassis_node'"
                :class="{ 'node-is-selected': selected == n.hostname }"
                :style="get_node_css(n.location.height, n.location.width, n.location.u, n.frontimage, 'in_chassis', c)"
                @click.stop="onNodeClick(n)">
                <physical-node
                  :colors="levelColors"
                  :ranges="levelRanges"
                  :node="n"
                  :mode="mode"
                  nodetype=""
                  :chassis-name="c.name" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <level-card :colors="levelColors" :ranges="levelRanges" :mode="mode" @get-chart-color="getChartColor" />
  </div>
</template>

<script type="text/javascript">
import PhysicalNode from './physical-rack/physical-node.vue'
import LevelCard from '@/widget/level-card.vue'

export default {
  components: {
    'physical-node': PhysicalNode,
    'level-card': LevelCard,
  },
  props: ['mode', 'rackInfo'],
  emits: ['node-click'],
  data() {
    return {
      rack: {},
      switches: {},
      chassis: {},
      chassisNodes: {},
      nodes: {},
      repeatNames: [],
      selected: 0,
      tmp_node_loc: '66px',
      rack_css: {
        position: 'relative',
        top: '0px',
        left: '0px',
        width: '0px',
        height: '0px',
        padding: '0px 0px',
        'box-sizing': 'border-box',
        background: "url('/static/img/rack/RACK.png') no-repeat",
      },
      levelRanges: {
        temperature: [0, 100],
        energy: [0, 2000],
        load: [0, 100],
        cpu: [0, 100],
        ram: [0, 100],
        disk: [0, 100],
        network: [0, 50000],
      },
      levelColors: [
        '#F6EFA6',
        '#EFD79B',
        '#E9BF8F',
        '#E2A684',
        '#DB8E79',
        '#D57B6F',
        '#D06D66',
        '#CA605D',
        '#C55255',
        '#BF444C',
      ],
    }
  },
  mounted() {
    this.cookRackInfo()
    this.check_location()
    this.$nextTick(() => {
      if (this.nodes.length > 0) {
        this.selected = this.nodes[0].hostname
        this.$emit('node-click', this.selected)
      }
    })
  },
  methods: {
    cookRackInfo() {
      // RackService.getRackInfo().then((res) => {
      // get rack info
      this.rack = this.rackInfo
      this.nodes = this.rackInfo.nodes
      this.switches = this.rackInfo.switches
      this.chassis = this.rackInfo.chassis
      for (let i = 0; i < this.nodes.length; i++) {
        const id = this.nodes[i].location.chassisId
        if (id !== '') {
          if (Object.prototype.hasOwnProperty.call(this.chassisNodes, id)) {
            this.chassisNodes[id].push(this.nodes[i])
          } else {
            this.chassisNodes[id] = [this.nodes[i]]
          }
        }
      }
      // set rack css
      this.rack_css.width = this.rack.width_height[0] + 'px'
      this.rack_css.height = this.rack.width_height[1] + 'px'
      this.rack_css.padding =
        this.rack.padding[0] +
        'px ' +
        this.rack.padding[1] +
        'px ' +
        this.rack.padding[2] +
        'px ' +
        this.rack.padding[3] +
        'px'

      // })
    },
    get_img(imgFile) {
      return '/static/img/rack/node/' + imgFile
    },
    get_u_num(height) {
      return Math.round(height / (this.rack.uheight[0] + this.rack.gap[0]))
    },
    get_chassis_css(chassis) {
      const chassisCss = {
        position: 'absolute',
        padding:
          chassis.padding[0] +
          'px ' +
          chassis.padding[1] +
          'px ' +
          chassis.padding[2] +
          'px ' +
          chassis.padding[3] +
          'px',
        'box-sizing': 'border-box',
        width: '100%',
        height: '100%',
        bottom: '0px',
        cursor: 'default',
      }

      return chassisCss
    },
    get_node_css(uHeight, uWidth, location, image, type, chassis) {
      if (!type) {
        type = 'in_rack'
      }

      let cssWidth, cssLeft, nodeCss, loc
      if (type === 'in_chassis' && chassis) {
        // var cssWidth = '49%';
        cssWidth = String((chassis.width_height[0] - chassis.padding[1] * 2) / (1 / uWidth) - chassis.gap[1]) + 'px'
        if (uWidth === 1 && location % 2 === 0) {
          location = location - 1
        }
        if (location % 2 === 0) {
          // var cssLeft = '50%';
          cssLeft = String(50 + (100 * chassis.gap[1]) / (chassis.width_height[0] - chassis.padding[1] * 2)) + '%'
        } else {
          cssLeft = ''
        }
        nodeCss = {
          position: 'absolute',
          width: cssWidth,
          height: String(uHeight * (chassis.uheight[0] - 2)) + 'px',
          bottom:
            String(
              (Math.floor((parseInt(location) + 1) / 2) - 1) * chassis.uheight[0] +
                (Math.floor((parseInt(location) + 1) / 2) * chassis.gap[0] - chassis.gap[0] + 1),
            ) + 'px',
          background: 'url(' + this.get_img(image) + ')',
          cursor: 'pointer',
          left: cssLeft,
        }
      } else {
        location = String(location)
        if (location.substring(location.length - 1, location.length) === 'R') {
          cssLeft = String(50 + (100 * this.rack.gap[1]) / (this.rack.width_height[0] - this.rack.padding[1] * 2)) + '%'
          loc = parseInt(location.substring(0, location.length - 2))
        } else if (location.substring(location.length - 1, location.length) === 'L') {
          cssLeft = ''
          loc = parseInt(location.substring(0, location.length - 2))
        } else {
          cssLeft = ''
          loc = location
        }

        if (uWidth !== 0.5) {
          cssWidth = String(uWidth * (this.rack.width_height[0] - this.rack.padding[1] * 2)) + 'px'
        } else {
          cssWidth = String((this.rack.width_height[0] - this.rack.padding[1] * 2) / 2 - this.rack.gap[1]) + 'px'
        }
        nodeCss = {
          position: 'absolute',
          width: cssWidth,
          height: String(uHeight * this.rack.uheight[0] + (uHeight - 1) * this.rack.gap[0]) + 'px',
          // bottom: String((loc-1)*2+loc*21-2+15)+'px',
          bottom: String((loc - 1) * (this.rack.uheight[0] + this.rack.gap[0])) + 'px',
          background: 'url(' + this.get_img(image) + ')',
          cursor: 'pointer',
          left: cssLeft,
        }
      }
      return nodeCss
    },
    onNodeClick(node) {
      this.selected = node.hostname
      this.$emit('node-click', node.hostname)
    },
    chassisDisable(chassis) {
      const result = this.nodes.filter(node => {
        return node.location.chassisId === chassis.id
      })
      return !!result.length
    },
    getChartColor(colors) {
      this.levelColors = colors
    },
    check_location() {
      let namePairList = []
      // Gather chassis > node
      this.rackInfo.chassis.forEach(chassis => {
        const outer = {
          name: chassis.name,
          rect: {
            x: 0,
            y: 0,
            w: chassis.capacity.width,
            h: chassis.capacity.height,
          },
        }
        const innerList = []
        this.rackInfo.nodes.forEach(node => {
          if (node.location.chassisId === chassis.id) {
            const u = node.location.u
            const inner = {
              name: node.hostname,
              rect: {
                x: ((u - 1) % 2) * 0.5,
                y: Math.floor((u - 1) / 2),
                w: node.location.width,
                h: node.location.height,
              },
            }
            innerList.push(inner)
          }
        })
        const result = this.check_duplicate_rects(outer, innerList)
        result.forEach(namePair => {
          namePairList.push(namePair)
        })
      })
      // Gather rack > chassis+node
      const outer = {
        name: this.rackInfo.name,
        rect: {
          x: 0,
          y: 0,
          w: this.rackInfo.capacity.width,
          h: this.rackInfo.capacity.height,
        },
      }
      const innerList = []
      this.rackInfo.chassis.forEach(chassis => {
        const inner = {
          name: chassis.name,
          rect: {
            x: 0,
            y: chassis.location.u - 1,
            w: chassis.location.width,
            h: chassis.location.height,
          },
        }
        innerList.push(inner)
      })
      this.rackInfo.nodes.forEach(node => {
        if (node.location.chassisId) {
          // Skip node in chassis
        } else {
          const inner = {
            name: node.hostname,
            rect: {
              x: 0,
              y: node.location.u - 1,
              w: node.location.width,
              h: node.location.height,
            },
          }
          innerList.push(inner)
        }
      })
      const result = this.check_duplicate_rects(outer, innerList)
      result.forEach(namePair => {
        namePairList.push(namePair)
      })
      namePairList = namePairList.filter((item, index) => {
        return namePairList.indexOf(item) === index
      })
      this.repeatNames = namePairList
      return namePairList
    },
    check_duplicate_rects(outer, innerList) {
      const namePairList = []
      innerList.forEach(inner => {
        if (!this.is_rect_in(inner.rect, outer.rect)) {
          namePairList.push(inner.name, outer.name)
        }
      })
      for (let i = 0; i < innerList.length; i++) {
        for (let j = i + 1; j < innerList.length; j++) {
          if (this.is_rect_intersect(innerList[i].rect, innerList[j].rect)) {
            namePairList.push(innerList[i].name, innerList[j].name)
          }
        }
      }
      return namePairList
    },
    is_rect_in(ra, rb) {
      const x01 = ra.x
      const x02 = ra.x + ra.w
      const y01 = ra.y
      const y02 = ra.y + ra.h
      const x11 = rb.x
      const x12 = rb.x + rb.w
      const y11 = rb.y
      const y12 = rb.y + rb.h
      if (x01 >= x11 && x02 <= x12 && y01 >= y11 && y02 <= y12) {
        return true
      }
      return false
    },
    is_rect_intersect(ra, rb) {
      const x01 = ra.x
      const x02 = ra.x + ra.w
      const y01 = ra.y
      const y02 = ra.y + ra.h
      const x11 = rb.x
      const x12 = rb.x + rb.w
      const y11 = rb.y
      const y12 = rb.y + rb.h
      const zx = this.ab(x01 + x02 - x11 - x12)
      const x = this.ab(x01 - x02) + this.ab(x11 - x12)
      const zy = this.ab(y01 + y02 - y11 - y12)
      const y = this.ab(y01 - y02) + this.ab(y11 - y12)
      if (zx < x && zy < y) return true
      else return false
    },
    ab(n) {
      if (n >= 0) return n
      else return -n
    },
  },
}
</script>

<style media="screen" scoped>
.rack-inner-public {
  position: relative;
  width: 100%;
  height: 100%;
}
.node-is-selected {
  box-sizing: border-box;
  border: 1px solid #5fb4f9;
}
.chassisPopoverstyle {
  opacity: 0.4;
  background-color: black;
  color: white;
}
.rack-alert {
  max-width: 250px;
  overflow: hidden;
  color: red;
}
</style>
