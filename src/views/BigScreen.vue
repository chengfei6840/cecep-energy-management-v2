<template>
  <div class="w-screen h-screen overflow-hidden bg-[#050c18] text-[#E2E8F0] font-sans flex flex-col select-none relative">
    
    <!-- 装饰背景线 & 科技网格纹理 -->
    <div class="absolute inset-0 bg-grid opacity-15 pointer-events-none" id="bg-grid-texture"></div>
    <div class="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#00D4FF]/50 to-transparent"></div>
    <div class="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#62B32E]/30 to-transparent"></div>

    <!-- 1. 顶部科技标题栏 -->
    <header id="main-header" class="h-14 flex-shrink-0 flex items-center justify-between px-6 bg-[#07172c]/90 border-b border-[#00D4FF]/20 relative z-10 backdrop-blur-md">
      <!-- 左侧 Logo & 系统名 -->
      <div class="flex items-center gap-3">
        <div class="h-8 w-8 rounded bg-[#62B32E] flex items-center justify-center text-white font-extrabold text-sm tracking-widest shadow-[0_0_12px_rgba(98,179,46,0.6)]">
          CE
        </div>
        <div class="flex flex-col">
          <div class="flex items-center gap-2">
            <span class="text-sm font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-[#00D4FF] to-[#62B32E]">
              中国节能 CECEP 光储充能源管理平台
            </span>
            <a-tag color="success" class="!bg-[#62B32E]/20 !border-[#62B32E]/40 !text-[#62B32E] text-[9px] py-0 h-4 leading-3 m-0">多站点集中监控一期</a-tag>
          </div>
          <span class="text-[8px] text-slate-400 font-mono tracking-wider uppercase leading-3 mt-0.5">
            CECEP Multi-site PV-ESS-EV Charging Operation Dashboard
          </span>
        </div>
      </div>

      <!-- 中间：当前监测区域 -->
      <div class="flex items-center gap-2 border border-[#00D4FF]/35 bg-[#09223A] rounded px-3 py-0.5 text-xs">
        <span class="text-slate-400 flex items-center gap-1 shrink-0">
          <span class="h-1.5 w-1.5 rounded-full bg-[#62B32E] animate-ping"></span> 集中管辖片区:
        </span>
        <a-select
          v-model:value="activeRegion"
          style="width: 170px"
          :bordered="false"
          class="dark-sceen-select m-0"
          dropdown-class-name="dark-screen-dropdown"
          @change="handleRegionChange"
        >
          <a-select-option value="all">全国合并监控中心 (10站)</a-select-option>
          <a-select-option value="east-china">华东大区中心 (3站)</a-select-option>
          <a-select-option value="south-china">华南大区中心 (2站)</a-select-option>
          <a-select-option value="north-china">北部与西部中心 (5站)</a-select-option>
        </a-select>
      </div>

      <!-- 右侧：时间、控制按钮 -->
      <div class="flex items-center gap-4 text-xs text-slate-300">
        <div class="flex items-center gap-3 bg-[#09223A]/55 px-2.5 py-0.5 rounded border border-[#00D4FF]/10 text-[11px]">
          <span class="flex items-center gap-1 text-[#62B32E] font-bold">
            📡 站网状态: {{ currentSummary.onlineCount }}/{{ currentSummary.totalCount }} 在线
          </span>
          <span class="text-slate-400 font-mono">
            今日减碳: <strong class="text-[#00D4FF] font-black">{{ currentSummary.carbon }} 吨</strong>
          </span>
        </div>

        <!-- 动态时钟 -->
        <div class="text-right font-mono text-[11px]">
          <p class="font-bold text-white tracking-widest m-0">{{ currentTime }}</p>
          <p class="text-[8px] text-slate-400 m-0">更新时间: <span class="text-[#00D4FF]">{{ refreshTime }}</span></p>
        </div>

        <!-- 返回与全屏 -->
        <div class="flex gap-1.5">
          <button @click="triggerAllHeal" class="h-7 px-2.5 rounded border border-[#62B32E]/40 text-[11px] font-bold bg-[#62B32E]/10 hover:bg-[#62B32E]/20 text-[#62B32E] cursor-pointer transition">
            ⚡ 一键自愈
          </button>
          <button @click="toggleFullScreen" class="h-7 px-2.5 rounded border border-[#00D4FF]/40 text-[11px] font-bold bg-[#041d33] hover:bg-[#1677FF]/20 text-[#00D4FF] cursor-pointer transition">
            {{ isFullScreen ? '退出全屏' : '全屏汇报' }}
          </button>
          <button @click="goBackToConsole" class="h-7 px-2.5 rounded border-slate-500/40 text-[11px] font-bold bg-[#142636] hover:bg-slate-700 text-slate-300 cursor-pointer transition">
            ← 后台
          </button>
        </div>
      </div>
    </header>

    <!-- 2. 全局核心指标 (10宫格矩阵) -->
    <div class="grid grid-cols-10 gap-2 px-4 pt-3 shrink-0 relative z-10" id="fleet-kpi-grid">
      <div 
        v-for="(card, idx) in metricsCards" 
        :key="idx"
        @click="openMetricDetail(card)"
        class="bg-card-dark border border-[#00D4FF]/15 rounded p-2 hover:border-[#00D4FF] transition duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden group"
      >
        <div class="absolute top-0 left-0 bottom-0 w-[2.5px]" :style="{ backgroundColor: card.color }"></div>
        <div class="flex items-center justify-between">
          <span class="text-[9px] text-slate-400 font-bold tracking-wider truncate">{{ card.label }}</span>
          <span class="text-[11px]" :style="{ color: card.color }">{{ card.icon }}</span>
        </div>
        <div class="mt-1 flex items-baseline gap-0.5">
          <span class="text-sm font-black font-mono text-white leading-none">{{ card.value }}</span>
          <span class="text-[8px] text-slate-400 font-medium">{{ card.unit }}</span>
        </div>
        <div class="mt-1 flex items-center justify-between text-[8px] text-slate-400 border-t border-slate-800/80 pt-1">
          <span>{{ card.trendLabel }}:</span>
          <span class="font-bold font-mono" :class="card.trendUp ? 'text-green-500' : 'text-red-400'">
            {{ card.trendValue }}
          </span>
        </div>
      </div>
    </div>

    <!-- 3. 三栏主展示面板 -->
    <div class="flex-1 p-3 grid grid-cols-12 gap-3 overflow-hidden min-h-0">
      
      <!-- ==================== 左侧核心指标区 (光储充及多能流总览) ==================== -->
      <div class="col-span-3 flex flex-col gap-3 min-h-0 overflow-hidden">
        
        <!-- 全局能源流向总览 -->
        <div class="flex-[1.1] bg-card-dark border border-[#00D4FF]/20 rounded p-3 flex flex-col min-h-0 relative">
          <div class="absolute top-0 left-0 w-6 h-[2px] bg-[#00D4FF]"></div>
          <div class="absolute top-0 left-0 w-[2px] h-6 bg-[#00D4FF]"></div>
          <h3 class="text-xs font-black text-white tracking-wider flex items-center gap-1.5 uppercase m-0 shrink-0">
            <span class="w-1.5 h-3 bg-[#00D4FF] rounded-sm"></span>
            联合多能流协同总览 GRID-FLOW
          </h3>
          <div class="grid grid-cols-3 gap-1.5 py-2 shrink-0">
            <div class="bg-[#0b1f32] p-1.5 rounded border border-slate-800 text-center">
              <span class="text-[9px] text-slate-400 block mb-0.5">光伏当前功率</span>
              <strong class="text-[#62B32E] text-xs font-mono font-bold">{{ currentSummary.pvPower }} kW</strong>
            </div>
            <div class="bg-[#0b1f32] p-1.5 rounded border border-slate-800 text-center">
              <span class="text-[9px] text-slate-400 block mb-0.5">储能充放功率</span>
              <strong class="text-[#00D4FF] text-xs font-mono font-bold" :class="currentSummary.essPower >= 0 ? 'text-[#00D4FF]' : 'text-red-400'">
                {{ currentSummary.essPower }} kW
              </strong>
            </div>
            <div class="bg-[#0b1f32] p-1.5 rounded border border-slate-800 text-center">
              <span class="text-[9px] text-slate-400 block mb-0.5">充电负荷占用</span>
              <strong class="text-purple-400 text-xs font-mono font-bold">{{ currentSummary.evPower }} kW</strong>
            </div>
          </div>
          <div class="flex-1 min-h-0 relative">
            <div ref="flowChartRef" class="w-full h-full"></div>
          </div>
        </div>

        <!-- 光伏联合出力集群 -->
        <div class="flex-1 bg-card-dark border border-[#00D4FF]/20 rounded p-3 flex flex-col min-h-0 relative">
          <div class="absolute top-0 left-0 w-6 h-[2px] bg-[#62B32E]"></div>
          <div class="absolute top-0 left-0 w-[2px] h-6 bg-[#62B32E]"></div>
          <div class="flex justify-between items-center mb-1.5 shrink-0">
            <h3 class="text-xs font-black text-white tracking-wider flex items-center gap-1.5 m-0 uppercase">
              <span class="w-1.5 h-3 bg-[#62B32E] rounded-sm"></span>
              光伏集群出力汇总 PHOTOVOLTAIC
            </h3>
            <span class="text-[9px] text-[#62B32E] font-bold">装机 6.55 MWp</span>
          </div>
          <div class="flex-1 min-h-0 relative">
            <div ref="pvTrendRef" class="w-full h-full"></div>
          </div>
        </div>

        <!-- 联合储能削峰蓄能 -->
        <div class="flex-1 bg-card-dark border border-[#00D4FF]/20 rounded p-3 flex flex-col min-h-0 relative">
          <div class="absolute top-0 left-0 w-6 h-[2px] bg-[#00D4FF]"></div>
          <div class="absolute top-0 left-0 w-[2px] h-6 bg-[#00D4FF]"></div>
          <div class="flex justify-between items-center mb-1.5 shrink-0">
            <h3 class="text-xs font-black text-white tracking-wider flex items-center gap-1.5 m-0 uppercase">
              <span class="w-1.5 h-3 bg-[#00D4FF] rounded-sm"></span>
              储能削峰蓄能系统 ESS-NETWORK
            </h3>
            <span class="text-[9px] font-mono text-[#00D4FF] bg-[#00D4FF]/10 px-1 border border-[#00D4FF]/25 rounded">SOC: {{ currentSummary.soc }}%</span>
          </div>
          <div class="flex-1 min-h-0 relative">
            <div ref="essPowerRef" class="w-full h-full"></div>
          </div>
        </div>

      </div>

      <!-- ==================== 中间核心：中国站网分布沙盘 & 实时测值列表 ==================== -->
      <div class="col-span-6 flex flex-col gap-3 min-h-0 overflow-hidden">
        
        <!-- 地图沙盘面板 -->
        <div class="flex-[1.5] bg-card-dark border border-[#00D4FF]/25 rounded p-3 flex flex-col min-h-0 relative overflow-hidden">
          
          <div class="flex justify-between items-center mb-1 shrink-0 z-10 relative">
            <h3 class="text-xs font-black text-white tracking-widest flex items-center gap-1.5 m-0 uppercase">
              <span class="w-1.5 h-3 bg-[#00D4FF] rounded-sm"></span>
              中国节能 CECEP 光储充多站点数字并网沙盘
            </h3>
            
            <!-- 状态筛选开关 -->
            <div class="flex items-center gap-1 bg-[#09223A]/80 border border-slate-700 rounded p-0.5 text-[10px]">
              <button 
                v-for="st in statusFilters" 
                :key="st.key"
                @click="onSelectFilterStatus(st.key)"
                class="px-2 py-0.5 rounded transition cursor-pointer text-slate-400 hover:text-white"
                :class="activeStatusFilter === st.key ? 'bg-[#00D4FF] !text-[#050c18] font-bold' : ''"
              >
                {{ st.label }} ({{ getStatusCount(st.key) }})
              </button>
            </div>
          </div>

          <!-- 地图图表 / SVG 中国分布沙盘区域 -->
          <div class="flex-grow min-h-0 relative bg-[#041221]/30 rounded flex items-center justify-center">
            
            <!-- 全国地图 SVG 背景及高亮 -->
            <svg viewBox="0 0 320 230" class="w-full h-full select-none text-[8px]">
              <defs>
                <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#00D4FF" stop-opacity="0.25" />
                  <stop offset="100%" stop-color="#00D4FF" stop-opacity="0" />
                </radialGradient>
                <filter id="neonShadow">
                  <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              <!-- 模糊发光背景圈 -->
              <circle cx="150" cy="115" r="95" fill="url(#mapGlow)" />

              <!-- 北京 HQ 朝各个站点的集控通信光波道 dashes -->
              <g opacity="0.3">
                <line 
                  v-for="st in filteredStations" 
                  :key="'line-'+st.id"
                  x1="160" y1="50" 
                  :x2="st.mapX" :y2="st.mapY"
                  stroke="#00D4FF" stroke-width="0.8" stroke-dasharray="2 5"
                />
              </g>

              <!-- 区域范围虚线框 -->
              <circle cx="160" cy="115" r="70" stroke="#143454" stroke-width="0.75" stroke-dasharray="5 5" fill="none" opacity="0.4" />

              <!-- 站点雷达闪烁光斑 -->
              <g v-for="st in filteredStations" :key="'glow-'+st.id">
                <circle 
                  v-if="st.status !== 'offline'"
                  :cx="st.mapX" :cy="st.mapY" 
                  r="6" 
                  :fill="st.status === 'danger' ? '#FF4D4F' : st.status === 'warning' ? '#FAAD14' : '#62B32E'"
                  class="animate-ping" 
                  opacity="0.4"
                />
              </g>

              <!-- 站点点位标记 -->
              <g 
                v-for="st in filteredStations" 
                :key="'node-'+st.id"
                transform="translate(0, 0)"
                class="cursor-pointer"
                @mouseenter="onMapNodeHover(st, $event)"
                @mouseleave="onMapNodeLeave()"
                @click="handleStationClick(st)"
              >
                <!-- 描边小点 -->
                <circle 
                  :cx="st.mapX" :cy="st.mapY" 
                  r="3.5" 
                  :fill="st.status === 'offline' ? '#64748b' : st.status === 'danger' ? '#FF4D4F' : st.status === 'warning' ? '#FAAD14' : '#62B32E'" 
                  stroke="#FFF" stroke-width="0.5"
                  :filter="st.id === hoveredStationId ? 'url(#neonShadow)' : ''"
                />
                
                <!-- 站名称文本 -->
                <text 
                  :x="st.mapX + 5" 
                  :y="st.mapY + 2.5" 
                  fill="#E2E8F0" 
                  class="font-sans text-[7.5px] font-semibold"
                  :class="hoveredStationId === st.id ? 'fill-[#00D4FF] !font-bold' : ''"
                >
                  {{ st.shortName }}
                </text>
              </g>

              <!-- 北京总部基地核心节点 -->
              <g transform="translate(160, 50)">
                <polygon points="0,-4 3.5,3 -3.5,3" fill="#00D4FF" />
                <text x="-15" y="-6" fill="#00D4FF" class="text-[7px] font-bold">CECEP 监控总部</text>
              </g>

            </svg>

            <!-- 地图上方实时 Hover 悬浮浮窗 -->
            <div 
              v-if="hoveredStation"
              class="absolute bg-[#06182c]/95 border border-[#00D4FF] rounded p-2 shadow-lg text-[10px] space-y-1 z-30 pointer-events-none transition-all duration-150"
              :style="{ left: hoveredMapStyle.left, top: hoveredMapStyle.top }"
            >
              <p class="font-bold text-[#00D4FF] text-xs border-b border-slate-700 pb-0.5 m-0">{{ hoveredStation.name }}</p>
              <div class="grid grid-cols-2 gap-x-3 gap-y-0.5 text-slate-300 font-mono">
                <span>运行状态: <strong :class="getStatusColorClass(hoveredStation.status)">{{ getStatusLabel(hoveredStation.status) }}</strong></span>
                <span>今日营收: <strong class="text-[#FAAD14]">¥{{ hoveredStation.gainsToday }}</strong></span>
                <span>今日光发电: <strong class="text-[#62B32E]">{{ hoveredStation.pvToday }} kWh</strong></span>
                <span>今日充电负: <strong class="text-purple-400">{{ hoveredStation.evLoad }} kW</strong></span>
                <span>当前电池 SOC: <strong class="text-amber-400">{{ hoveredStation.essPower === 0 ? '--' : hoveredStation.essSoc }}%</strong></span>
                <span>活动报警: <strong class="text-red-400">{{ hoveredStation.alarmsCount }} 个</strong></span>
              </div>
            </div>

          </div>

        </div>

        <!-- 底部场站集控实时对账列表 -->
        <div class="flex-[1.1] bg-card-dark border border-slate-800 rounded p-3 flex flex-col min-h-0 relative">
          <h3 class="text-xs font-black text-slate-300 tracking-wider flex items-center justify-between m-0 mb-1.5 shrink-0">
            <span class="flex items-center gap-1.5">
              <span class="w-1.5 h-3 bg-[#62B32E] rounded-sm"></span>
              在网场站底层遥数据透视列表 ({{ filteredStations.length }} 站)
            </span>
            <span class="text-[9px] text-[#00D4FF]">数据刷新精度：秒级SCADA对账</span>
          </h3>
          
          <div class="flex-grow overflow-y-auto space-y-1.5 pr-1 text-[11px]">
            <div 
              v-for="st in filteredStations" 
              :key="st.id"
              @mouseenter="hoveredStationId = st.id"
              @mouseleave="hoveredStationId = null"
              @click="handleStationClick(st)"
              class="p-1.5 rounded bg-[#09223A]/50 border transition duration-150 cursor-pointer flex items-center justify-between"
              :class="[
                hoveredStationId === st.id ? 'border-[#00D4FF] !bg-[#0b2947]' : 'border-slate-800/80',
                st.status === 'offline' ? 'opacity-40' : ''
              ]"
            >
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <span class="h-2 w-2 rounded-full shrink-0 animate-pulse" :class="getStatusBgClass(st.status)"></span>
                <span class="text-white font-bold truncate text-xs">{{ st.name }}</span>
              </div>

              <div class="grid grid-cols-4 gap-4 text-right text-[10.5px] shrink-0 font-mono text-slate-400 mr-2">
                <div>光伏: <strong class="text-[#62B32E]">{{ st.pvPower }} kW</strong></div>
                <div>储能: <strong :class="st.essPower >= 0 ? 'text-[#00D4FF]' : 'text-[#FF4D4F]'">{{ st.essPower }} kW</strong></div>
                <div>SOC: <strong class="text-amber-400">{{ st.essPower === 0 ? '--' : st.essSoc + '%' }}</strong></div>
                <div>充电: <strong class="text-purple-400">{{ st.evLoad }} kW</strong></div>
              </div>

              <div class="flex items-center gap-1 shrink-0 pl-1">
                <a-tag v-if="st.alarmsCount > 0" color="error" class="!text-[9px] !px-1.5 !my-0 !h-4 leading-3">{{ st.alarmsCount }}警</a-tag>
                <span class="text-slate-400 text-[10px] bg-slate-800 px-1 rounded">{{ st.region === 'east-china' ? '华东' : st.region === 'south-china' ? '华南' : '华北' }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- ==================== 右侧运营监控区 (排行、充电网与安全告警) ==================== -->
      <div class="col-span-3 flex flex-col gap-3 min-h-0 overflow-hidden">
        
        <!-- 拓扑站点排行榜 (切换对账) -->
        <div class="flex-1 bg-card-dark border border-[#00D4FF]/20 rounded p-3 flex flex-col min-h-0 relative">
          <div class="absolute top-0 right-0 w-6 h-[2px] bg-[#FAAD14]"></div>
          <div class="absolute top-0 right-0 w-[2px] h-6 bg-[#FAAD14]"></div>
          
          <div class="flex justify-between items-center mb-2 shrink-0">
            <h3 class="text-xs font-black text-white tracking-wider flex items-center gap-1.5 m-0 uppercase">
              <span class="w-1.5 h-3 bg-[#FAAD14] rounded-sm"></span>
              场站集约绩效排行榜 RANKING
            </h3>
          </div>

          <!-- 排行切换选项卡 -->
          <div class="grid grid-cols-4 gap-0.5 bg-slate-900 px-1 py-0.5 rounded text-[10px] mb-2 shrink-0 border border-slate-800 text-center text-slate-400 font-bold">
            <button 
              v-for="tab in rankTabs" 
              :key="tab.key"
              @click="activeRankTab = tab.key"
              class="py-0.5 rounded cursor-pointer transition"
              :class="activeRankTab === tab.key ? 'bg-[#FAAD14]/20 text-[#FAAD14] font-black' : 'hover:text-white'"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- 排行滚动列表 -->
          <div class="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[170px]">
            <div 
              v-for="(item, idx) in sortedRankData" 
              :key="item.id"
              class="text-[11px] flex flex-col gap-1"
            >
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-2 min-w-0">
                  <span 
                    class="h-[15px] w-[15px] rounded-full flex items-center justify-center font-mono font-bold text-[9px] shrink-0"
                    :class="[idx === 0 ? 'bg-amber-400 text-slate-900' : idx === 1 ? 'bg-slate-300 text-slate-900' : idx === 2 ? 'bg-amber-600 text-slate-900' : 'bg-slate-800 text-slate-400']"
                  >
                    {{ idx + 1 }}
                  </span>
                  <span class="text-slate-100 font-bold truncate">{{ item.name }}</span>
                </div>
                <span class="font-mono font-bold" :style="{ color: getRankTabColor() }">{{ item.valueLabel }}</span>
              </div>
              <div class="h-1 bg-slate-800 roundedoverflow-hidden">
                <div class="h-full rounded" :style="{ width: item.percent + '%', backgroundColor: getRankTabColor() }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 统一充电网络集优 -->
        <div class="flex-1 bg-card-dark border border-[#00D4FF]/20 rounded p-3 flex flex-col min-h-0 relative">
          <div class="absolute top-0 right-0 w-6 h-[2px] bg-[#A855F7]"></div>
          <div class="absolute top-0 right-0 w-[2px] h-6 bg-[#A855F7]"></div>
          <div class="flex justify-between items-center mb-1.5 shrink-0">
            <h3 class="text-xs font-black text-white tracking-wider flex items-center gap-1.5 m-0 uppercase">
              <span class="w-1.5 h-3 bg-[#A855F7] rounded-sm"></span>
              星络充电桩集群监控 CHARGER-NET
            </h3>
            <span class="text-[9px] text-[#A855F7] font-bold">在网桩总数 864 枪</span>
          </div>
          <div class="flex-1 min-h-0 relative">
            <div ref="chargingTrendRef" class="w-full h-full"></div>
          </div>
        </div>

        <!-- 全网报警监控与 API 诊断 -->
        <div class="flex-1 bg-card-dark border border-[#00D4FF]/20 rounded p-3 flex flex-col min-h-0 relative">
          <div class="absolute top-0 right-0 w-6 h-[2px] bg-[#FF4D4F]"></div>
          <div class="absolute top-0 right-0 w-[2px] h-6 bg-[#FF4D4F]"></div>
          
          <div class="flex justify-between items-center mb-1 shrink-0">
            <h3 class="text-xs font-black text-white tracking-wider flex items-center gap-1.5 m-0 uppercase">
              <span class="w-1.5 h-3 bg-[#FF4D4F] rounded-sm"></span>
              全网实时活动告警 ALARM-LOGS
            </h3>
            <span class="text-[9px] font-mono font-bold text-red-400 animate-pulse cursor-pointer hover:underline" @click="openAlarmsModal">
              诊断5G接口 (5) →
            </span>
          </div>

          <!-- 在线告警无缝滚动列表 -->
          <div class="flex-1 overflow-y-auto space-y-1 pr-1 max-h-[140px]">
            <div 
              v-for="al in alarmsList" 
              :key="al.id"
              @click="showAlarmDetails(al)"
              class="p-1 px-2 rounded text-[10px] cursor-pointer hover:bg-slate-800 border border-slate-800 transition flex items-center justify-between"
              :class="getAlarmBackgroundClass(al.type)"
            >
              <div class="flex items-center gap-1 min-w-0">
                <span class="font-bold shrink-0" :style="{ color: getAlarmSeverityColor(al.type) }">[{{ al.type }}]</span>
                <span class="text-slate-350 truncate font-sans">{{ al.station }} - {{ al.msg }}</span>
              </div>
              <span class="font-mono text-slate-500 text-[8.5px] scale-90">{{ al.time }}</span>
            </div>
          </div>
          
          <!-- 电网及需量利用利用微指标 -->
          <div class="mt-2 pt-1.5 border-t border-slate-800/80 flex justify-between items-center text-[10px] text-slate-400 shrink-0">
            <span>电网平均需量率: <strong class="text-amber-400 font-mono">{{ currentSummary.demandUtilPercent }}%</strong></span>
            <span>接口联通成功率: <strong class="text-green-400 font-mono">98.6%</strong></span>
          </div>

        </div>

      </div>

    </div>

    <!-- 4. 底部图表大区 -->
    <footer class="h-[140px] flex-shrink-0 border-t border-[#00D4FF]/20 bg-[#07192C]/85 p-3 flex gap-4 min-h-0 relative z-10 w-full" id="footer-charts-deck">
      
      <!-- 汇总大账：营收比例环状图 -->
      <div class="w-1/4 bg-card-dark border border-slate-800/80 rounded p-2 flex flex-col min-h-0 relative">
        <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 m-0 flex items-center gap-1 shrink-0">
          <span class="w-1 h-2.5 bg-[#FAAD14] rounded-sm"></span> 收益构成结算科目
        </h4>
        <div class="flex-1 min-h-0 relative">
          <div ref="revenuePieRef" class="w-full h-full"></div>
        </div>
      </div>

      <!-- 汇总大账：发、充综合日时序对账曲线 -->
      <div class="w-1/2 bg-card-dark border border-slate-800/80 rounded p-2 flex flex-col min-h-0 relative">
        <h4 class="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1.5 m-0 flex justify-between items-center shrink-0">
          <span class="flex items-center gap-1">
            <span class="w-1 h-2.5 bg-[#62B32E] rounded-sm"></span>
            中国节能 CECEP 光储充购售财务对账时序
          </span>
          <div class="flex bg-slate-900 border border-slate-800 p-0.5 rounded text-[8.5px]">
            <button @click="changeTimeWindow('today')" class="px-2 py-0.5 rounded cursor-pointer" :class="activeTimeWindow === 'today' ? 'bg-[#00D4FF] text-[#050c18] font-bold' : 'text-slate-400 hover:text-white'">今日合并</button>
            <button @click="changeTimeWindow('month')" class="px-2 py-0.5 rounded cursor-pointer" :class="activeTimeWindow === 'month' ? 'bg-[#00D4FF] text-[#050c18] font-bold' : 'text-slate-400 hover:text-white'">月度累计</button>
            <button @click="changeTimeWindow('year')" class="px-2 py-0.5 rounded cursor-pointer" :class="activeTimeWindow === 'year' ? 'bg-[#00D4FF] text-[#050c18] font-bold' : 'text-slate-400 hover:text-white'">年度总账</button>
          </div>
        </h4>
        <div class="flex-1 min-h-0 relative">
          <div ref="carbonTrendRef" class="w-full h-full"></div>
        </div>
      </div>

      <!-- 综治设备审计在网表 -->
      <div class="w-1/4 bg-card-dark border border-slate-800/80 rounded p-2 flex flex-col min-h-0 relative justify-between text-[11px] font-semibold py-1">
        <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest m-0 flex items-center gap-1 shrink-0">
          <span class="w-1 h-2.5 bg-[#10B981] rounded-sm"></span> 统一网联网关与设备物理审计
        </h4>
        <div class="flex justify-between items-center border-b border-slate-800 pb-1">
          <span class="text-slate-400">🌤️ 晶硅光伏逆变器在网数</span>
          <span class="font-mono text-green-400">{{ activeStatusFilter === 'offline' ? '0 / 120' : '112 / 120 正常' }}</span>
        </div>
        <div class="flex justify-between items-center border-b border-slate-800 pb-1">
          <span class="text-slate-400">🔋 新型化学储能柜 PCS 桥</span>
          <span class="font-mono text-green-400">{{ activeStatusFilter === 'offline' ? '0 / 16' : '16 / 16 正常' }}</span>
        </div>
        <div class="flex justify-between items-center border-b border-slate-800 pb-1">
          <span class="text-slate-400">⛽ 星络智能直流充电终端</span>
          <span class="font-mono text-amber-400">{{ activeStatusFilter === 'offline' ? '0 / 864' : '842 / 864 在网' }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-slate-400">🌐 异构第三方云端对接 API</span>
          <span class="font-mono text-red-400">{{ apiIntegrationsMock.filter(i => i.status === '正常').length }} / 5 连通</span>
        </div>
      </div>

    </footer>

    <!-- ==================== 四、交互弹窗部分 ==================== -->
    
    <!-- 单站数字孪生详情 Modals -->
    <a-modal
      v-model:open="isStationDetailModalOpen"
      :title="selectedStationForModal ? '🔬 CECEP 数字双生深度对账透视 — ' + selectedStationForModal.name : '场站数字双生'"
      @ok="isStationDetailModalOpen = false"
      ok-text="下报并网调节"
      cancel-text="关闭"
      width="680px"
      wrap-class-name="dark-screen-modal-wrapper"
    >
      <div v-if="selectedStationForModal" class="p-4 text-slate-200 text-xs space-y-4">
        
        <div class="flex justify-between items-center border-b border-slate-800 pb-2">
          <div class="flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-full" :class="getStatusBgClass(selectedStationForModal.status)"></span>
            <span class="text-sm font-bold text-white">{{ selectedStationForModal.name }}</span>
          </div>
          <span class="font-mono text-slate-400 text-[10px]">站点识别: {{ selectedStationForModal.id }} | 区域: {{ selectedStationForModal.region }}</span>
        </div>

        <div class="grid grid-cols-4 gap-3 text-center">
          <div class="bg-[#09223A] border border-[#00D4FF]/30 rounded p-2">
            <span class="text-[10px] text-slate-400 block">光伏瞬时有功</span>
            <strong class="block text-base font-black text-[#62B32E] font-mono mt-1">{{ selectedStationForModal.pvPower }} kW</strong>
          </div>
          <div class="bg-[#09223A] border border-[#00D4FF]/30 rounded p-2">
            <span class="text-[10px] text-slate-400 block">储能变流功率</span>
            <strong class="block text-base font-black text-[#00D4FF] font-mono mt-1">{{ selectedStationForModal.essPower }} kW</strong>
          </div>
          <div class="bg-[#09223A] border border-[#00D4FF]/30 rounded p-2">
            <span class="text-[10px] text-slate-400 block">电池荷电 SOC</span>
            <strong class="block text-base font-black text-amber-400 font-mono mt-1">{{ selectedStationForModal.essPower === 0 ? '--' : selectedStationForModal.essSoc + '%' }}</strong>
          </div>
          <div class="bg-[#09223A] border border-[#00D4FF]/30 rounded p-2">
            <span class="text-[10px] text-slate-400 block">今日收益估款</span>
            <strong class="block text-base font-black text-white font-mono mt-1">¥{{ selectedStationForModal.gainsToday }}</strong>
          </div>
        </div>

        <div class="bg-[#041727] border border-slate-800 rounded p-3 text-[11px] leading-relaxed text-slate-300">
          <h4 class="text-xs font-bold text-[#00D4FF] mb-1 m-0 flex items-center gap-1.5">
            ● Modbus RTU 现场通讯控制器及双向变流逻辑
          </h4>
          <p class="m-0">
            该智能电站通过 5G 专网与中国节能 CECEP 数据中心集联。现场集成光、储、充、网四大能端，支持毫瓦级无功自校正与高峰有功抑流响应，内置防短路电化学电池隔膜监控，保障跨区并网极度平安。
          </p>
          <div class="grid grid-cols-3 gap-2 text-[10.5px] text-slate-400 border-t border-slate-800/80 pt-2 mt-2">
            <span>在线组件数: <strong class="text-white font-mono">12 列</strong></span>
            <span>并网关口需量: <strong class="text-white font-mono">{{ selectedStationForModal.evLoad }} kW</strong></span>
            <span>物理状态: <strong class="text-green-400">稳定联通</strong></span>
          </div>
        </div>

        <!-- 远程控制下发与模拟跳转 -->
        <div class="border border-slate-700/60 p-3 bg-[#0d1e2e] rounded flex items-center justify-between">
          <div>
            <h5 class="text-xs font-bold text-white m-0">模拟深度站内穿透 (全集成后台联动)</h5>
            <p class="text-[10px] text-slate-400 m-0 mt-0.5">穿透当前多站集中监控屏，模拟直接跳转到本项目的该单站点监控页面</p>
          </div>
          <div class="flex gap-2">
            <a-button type="primary" size="small" class="!bg-[#1677FF] !border-[#1677FF]" @click="simulateSingelSiteFresh(selectedStationForModal.name)">
              自愈通讯校准
            </a-button>
            <a-button type="primary" danger size="small" class="!bg-[#FF4D4F] !border-[#FF4D4F]" @click="routeToSingleSiteDetail(selectedStationForModal)">
              🔬 穿透到单站详情
            </a-button>
          </div>
        </div>

      </div>
    </a-modal>

    <!-- 指标模态对账单 -->
    <a-modal
      v-model:open="isMetricModalOpen"
      :title="'财务对账快照 — ' + selectedMetricInfo.label"
      @ok="isMetricModalOpen = false"
      ok-text="确认消警封账"
      cancel-text="关闭"
      width="480px"
      wrap-class-name="dark-screen-modal-wrapper"
    >
      <div class="p-3 text-slate-300 space-y-3 text-xs">
        <div class="flex justify-between items-center border-b border-slate-700 pb-1.5">
          <span>账目参数科目:</span>
          <span class="font-bold text-white uppercase">{{ selectedMetricInfo.label }}</span>
        </div>
        <div class="flex items-baseline gap-1 bg-[#09223A] p-2.5 rounded text-center justify-center border border-slate-700">
          <span class="text-xs text-slate-400">集群合并：</span>
          <strong class="text-lg font-black font-mono text-white">{{ selectedMetricInfo.value }}</strong>
          <span class="text-[10px] text-slate-400 font-bold ml-1">{{ selectedMetricInfo.unit }}</span>
        </div>
        <p class="text-[11px] text-slate-400 leading-relaxed bg-slate-900/40 p-2.5 rounded m-0">
          此指标由现场 10 个分布式网关及计量 CT 表计通过 Modbus 协议高频累计。符合国家央企能源管理数据采集及资产盘点对账等级标准，数据完全真实，传输延迟极低。
        </p>
      </div>
    </a-modal>

    <!-- 告警与 5G 链路诊断 Modal -->
    <a-modal
      v-model:open="isAlarmsModalOpen"
      title="CECEP 异构第三方平台 API 连通链路与故障诊断控制中心"
      @ok="isAlarmsModalOpen = false"
      ok-text="全网一键清除告警"
      cancel-text="关闭"
      width="780px"
      wrap-class-name="dark-screen-modal-wrapper"
    >
      <div class="p-2 space-y-4">
        
        <!-- 活动告警表 -->
        <div>
          <h4 class="text-xs font-bold text-[#FF4D4F] mb-1.5 m-0 flex items-center gap-1">
            ⚠️ 实时多站点越限告警列表 (SCADA 遥信监测队列)
          </h4>
          <a-table :data-source="detailedAlarmsMock" :columns="alarmColumns" size="small" :pagination="false" class="dark-mini-table">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'severity'">
                <span class="px-1.5 py-0.5 rounded text-[10px] font-bold animate-pulse" 
                      :style="{ color: getAlarmSeverityColor(record.severity), backgroundColor: 'rgba(255,10,10,0.1)' }">
                  {{ record.severity }}
                </span>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-button type="link" size="small" class="!text-[#00D4FF] !p-0 !h-auto text-[11px]" @click="clearSingleAlarm(record)">
                  解除告警
                </a-button>
              </template>
            </template>
          </a-table>
        </div>

        <!-- 外部云接口接入状态度量 -->
        <div>
          <h4 class="text-xs font-bold text-[#00D4FF] mb-1.5 m-0 flex items-center gap-1">
            🔗 异构一期第三方数据接口联调监视
          </h4>
          <a-table :data-source="apiIntegrationsMock" :columns="apiColumns" size="small" :pagination="false" class="dark-mini-table">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <span :class="record.status === '正常' ? 'text-green-400' : 'text-red-400 font-bold'">
                  ● {{ record.status }}
                </span>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-button type="link" size="small" class="!text-[#00D4FF] !p-0 !h-auto text-[11px]" @click="showApiLogs(record)">
                  查看同步日志
                </a-button>
              </template>
            </template>
          </a-table>
        </div>

        <!-- 查看API日志模子 -->
        <div v-if="seclectedApiLog" class="bg-black/40 border border-slate-800 p-2 rounded text-[10px] font-mono text-slate-400">
          <p class="text-[#00D4FF] font-bold m-0 border-b border-slate-800 pb-1 mb-1">接口 [{{ seclectedApiLog.name }}] 今日秒级健康同步报文片段：</p>
          <p v-for="(lg, i) in seclectedApiLog.logs" :key="i" class="m-0 leading-normal">{{ lg }}</p>
        </div>

      </div>
    </a-modal>

  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import * as echarts from 'echarts';

const router = useRouter();

// ==================== 1. 系统时钟 & 基本状态 ====================
const currentTime = ref('');
const refreshTime = ref('');
const isFullScreen = ref(false);
const activeRegion = ref('all');
const activeStatusFilter = ref('all');

const statusFilters = [
  { key: 'all', label: '全部' },
  { key: 'online', label: '正常' },
  { key: 'warning', label: '预警' },
  { key: 'danger', label: '严重告警' },
  { key: 'offline', label: '离线' }
];

const updateClock = () => {
  const d = new Date();
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hr = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const sec = String(d.getSeconds()).padStart(2, '0');
  currentTime.value = `${yr}-${mo}-${day} ${hr}:${min}:${sec}`;
};

let clockInt: any = null;
onMounted(() => {
  updateClock();
  clockInt = setInterval(updateClock, 1000);
  const now = new Date();
  refreshTime.value = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
});
onBeforeUnmount(() => {
  if (clockInt) clearInterval(clockInt);
});

// ==================== 2. 十大并网站点 Mock 数据库 ====================
const stationsList = ref([
  { id: 'st-01', name: '中节能北京顺义光储充站', shortName: '北京站', region: 'north-china', status: 'online', mapX: 170, mapY: 70, pvPower: 410.5, pvToday: 4560, essSoc: 65, essPower: 120, evLoad: 280, gainsToday: 5480, alarmsCount: 0, capacity: '1.2MWp / 2.5MWh' },
  { id: 'st-02', name: '中节能上海临港开发区示范站', shortName: '上海站', region: 'east-china', status: 'online', mapX: 205, mapY: 135, pvPower: 310.0, pvToday: 3480, essSoc: 78, essPower: -150, evLoad: 190, gainsToday: 4120, alarmsCount: 0, capacity: '800kWp / 1.5MWh' },
  { id: 'st-03', name: '中节能杭州西湖数字并网站', shortName: '杭州站', region: 'east-china', status: 'warning', mapX: 195, mapY: 145, pvPower: 180.2, pvToday: 1820, essSoc: 48, essPower: -40, evLoad: 120, gainsToday: 1980, alarmsCount: 2, capacity: '400kWp / 800kWh' },
  { id: 'st-04', name: '中节能南京江宁低碳园区网', shortName: '南京站', region: 'east-china', status: 'online', mapX: 185, mapY: 130, pvPower: 260.0, pvToday: 2890, essSoc: 55, essPower: 80, evLoad: 155, gainsToday: 3260, alarmsCount: 0, capacity: '600kWp / 1.2MWh' },
  { id: 'st-05', name: '中节能广州高新技术超级站', shortName: '广州站', region: 'south-china', status: 'danger', mapX: 145, mapY: 195, pvPower: 350.5, pvToday: 3980, essSoc: 92, essPower: 180, evLoad: 310, gainsToday: 4950, alarmsCount: 4, capacity: '1.5MWp / 3MWh' },
  { id: 'st-06', name: '中节能深圳前海创维示范港', shortName: '深圳站', region: 'south-china', status: 'online', mapX: 155, mapY: 205, pvPower: 380.0, pvToday: 4200, essSoc: 85, essPower: -160, evLoad: 245, gainsToday: 5100, alarmsCount: 0, capacity: '1.0MWp / 2.0MWh' },
  { id: 'st-07', name: '中节能成都高新区环网示范站', shortName: '成都站', region: 'north-china', status: 'online', mapX: 85, mapY: 150, pvPower: 210.0, pvToday: 2240, essSoc: 71, essPower: 90, evLoad: 140, gainsToday: 2580, alarmsCount: 0, capacity: '500kWp / 1MWh' },
  { id: 'st-08', name: '中节能武汉东湖光储智能站', shortName: '武汉站', region: 'north-china', status: 'offline', mapX: 140, mapY: 135, pvPower: 0, pvToday: 0, essSoc: 0, essPower: 0, evLoad: 0, gainsToday: 0, alarmsCount: 1, capacity: '500kWp / 1MWh' },
  { id: 'st-09', name: '中节能西安航天新城智慧站', shortName: '西安站', region: 'north-china', status: 'online', mapX: 115, mapY: 110, pvPower: 195.4, pvToday: 2110, essSoc: 50, essPower: -50, evLoad: 105, gainsToday: 2340, alarmsCount: 0, capacity: '300kWp / 600kWh' },
  { id: 'st-10', name: '中节能天津滨海新区联控大站', shortName: '天津站', region: 'north-china', status: 'online', mapX: 180, mapY: 78, pvPower: 290.0, pvToday: 3120, essSoc: 60, essPower: 110, evLoad: 170, gainsToday: 3750, alarmsCount: 0, capacity: '750kWp / 1.5MWh' }
]);

// ==================== 3. 各种层级过滤 & KPI 数据计算 ====================
const activeTimeWindow = ref('today');

const filteredStations = computed(() => {
  let list = stationsList.value;
  // 按照管辖区域
  if (activeRegion.value !== 'all') {
    if (activeRegion.value === 'east-china') {
      list = list.filter(s => ['st-02', 'st-03', 'st-04'].includes(s.id));
    } else if (activeRegion.value === 'south-china') {
      list = list.filter(s => ['st-05', 'st-06'].includes(s.id));
    } else if (activeRegion.value === 'north-china') {
      list = list.filter(s => ['st-01', 'st-07', 'st-08', 'st-09', 'st-10'].includes(s.id));
    }
  }
  // 按照状态卡片
  if (activeStatusFilter.value !== 'all') {
    list = list.filter(s => s.status === activeStatusFilter.value);
  }
  return list;
});

const getStatusCount = (statusKey: string) => {
  if (statusKey === 'all') return stationsList.value.length;
  return stationsList.value.filter(s => s.status === statusKey).length;
};

const onSelectFilterStatus = (statusKey: string) => {
  activeStatusFilter.value = statusKey;
  message.info(`已按 [${statusFilters.find(f=>f.key === statusKey)?.label}] 状态过滤场站分布`);
  nextTick(initAllCharts);
};

// 时段缩放比
const timeFactor = computed(() => {
  if (activeTimeWindow.value === 'month') return 29.2;
  if (activeTimeWindow.value === 'year') return 345;
  return 1.0;
});

const currentSummary = computed(() => {
  const list = filteredStations.value;
  const count = list.length;
  const tf = timeFactor.value;

  if (count === 0) {
    return { pvPower: 0, pvToday: 0, essPower: 0, evPower: 0, soc: 0, gainsToday: 0, carbon: '0.0', demandUtilPercent: 0, totalCount: 0, onlineCount: 0 };
  }

  const pvPower = Math.round(list.reduce((sum, s) => sum + s.pvPower, 0));
  const pvToday = Math.round(list.reduce((sum, s) => sum + s.pvToday, 0) * tf);
  const essPower = Math.round(list.reduce((sum, s) => sum + s.essPower, 0));
  const evPower = Math.round(list.reduce((sum, s) => sum + s.evLoad, 0));
  
  const connectedEss = list.filter(s => s.status !== 'offline');
  const soc = connectedEss.length > 0 
    ? Math.round(connectedEss.reduce((sum, s) => sum + s.essSoc, 0) / connectedEss.length)
    : 0;

  const gainsToday = Math.round(list.reduce((sum, s) => sum + s.gainsToday, 0) * tf);
  const carbon = (pvToday * 0.00084).toFixed(1);
  const demandUtilPercent = count > 0 
    ? Math.min(100, Math.round(list.reduce((sum, s) => sum + (s.status === 'offline' ? 0 : 82), 0) / count))
    : 0;

  const onlineCount = list.filter(s => s.status === 'online' || s.status === 'warning').length;

  return {
    pvPower, pvToday, essPower, evPower, soc, gainsToday, carbon, demandUtilPercent, totalCount: count, onlineCount
  };
});

// KPI 10宫格指标卡
const metricsCards = computed(() => {
  const sc = currentSummary.value;
  const tf = timeFactor.value;
  const word = activeTimeWindow.value === 'today' ? '在网日' : activeTimeWindow.value === 'month' ? '月度累' : '年度联';

  return [
    { label: `${word}发电量`, value: sc.pvToday.toLocaleString(), unit: 'kWh', icon: '☀️', color: '#62B32E', trendLabel: '集群环比', trendValue: '+15.4%', trendUp: true },
    { label: `${word}充电消纳`, value: Math.round(sc.evPower * 14.5 * tf).toLocaleString(), unit: 'kWh', icon: '⚡', color: '#A855F7', trendLabel: '桩利用率', trendValue: '72.3%', trendUp: true },
    { label: `${word}合并收益`, value: '¥ ' + sc.gainsToday.toLocaleString(), unit: '元', icon: '🪙', color: '#FAAD14', trendLabel: '绿证溢价', trendValue: '+9.4%', trendUp: true },
    { label: '平均储能 SOC', value: sc.soc + ' %', unit: '', icon: '🔋', color: '#00D4FF', trendLabel: '电芯温康', trendValue: '96.8 SOH', trendUp: true },
    { label: `${word}替代碳汇`, value: sc.carbon, unit: 't CO₂', icon: '🌲', color: '#10B981', trendLabel: '折合标准煤', trendValue: (sc.pvToday * 0.4).toFixed(0) + ' kg', trendUp: true },
    { label: '并网无功补偿', value: '42.5', unit: 'kVar', icon: '📊', color: '#EF4444', trendLabel: '功率因数', trendValue: 'COS 0.99', trendUp: true },
    { label: '购电联合需量', value: (sc.evPower * 1.1).toFixed(0), unit: 'kW', icon: '📦', color: '#3B82F6', trendLabel: '变负载充差', trendValue: '-150 kW', trendUp: false },
    { label: '在网监控场站', value: sc.totalCount + ' 个', unit: '', icon: '📡', color: '#F43F5E', trendLabel: '接口联通数', trendValue: '25/25', trendUp: true },
    { label: '并网自供给率', value: '84.8 %', unit: '', icon: '⚖️', color: '#EC4899', trendLabel: '极高度自治', trendValue: '自消纳优', trendUp: true },
    { label: '外部平台对接', value: '5 平台', unit: '', icon: '🌐', color: '#8B5CF6', trendLabel: '连通抖延迟', trendValue: '42 ms', trendUp: true }
  ];
});

// ==================== 4. 场站排行切换 (四大维度) ====================
const activeRankTab = ref('gains');
const rankTabs = [
  { key: 'gains', label: '综合收益' },
  { key: 'pv', label: '发电电效' },
  { key: 'ev', label: '快充消耗' },
  { key: 'alarms', label: '告警隐患' }
];

const sortedRankData = computed(() => {
  const tab = activeRankTab.value;
  const list = [...filteredStations.value];

  const mapped = list.map(s => {
    let rawVal = 0;
    let valLabel = '';
    if (tab === 'gains') {
      rawVal = s.gainsToday;
      valLabel = `¥ ${s.gainsToday.toLocaleString()}`;
    } else if (tab === 'pv') {
      rawVal = s.pvToday;
      valLabel = `${s.pvToday.toLocaleString()} kWh`;
    } else if (tab === 'ev') {
      rawVal = s.evLoad;
      valLabel = `${s.evLoad.toLocaleString()} kW`;
    } else if (tab === 'alarms') {
      rawVal = s.alarmsCount;
      valLabel = `${s.alarmsCount} 次`;
    }
    return { id: s.id, name: s.name, rawVal, valueLabel: valLabel };
  });

  // 降序排序
  mapped.sort((a, b) => b.rawVal - a.rawVal);

  const maxVal = mapped[0]?.rawVal || 1;
  return mapped.map(item => ({
    ...item,
    percent: Math.min(100, Math.round((item.rawVal / maxVal) * 100))
  }));
});

const getRankTabColor = () => {
  const tab = activeRankTab.value;
  if (tab === 'gains') return '#FAAD14';
  if (tab === 'pv') return '#62B32E';
  if (tab === 'ev') return '#A855F7';
  return '#FF4D4F';
};

// ==================== 5. 5G 通讯接口与故障越限报警 ====================
const alarmsList = ref([
  { id: '1', time: '14:22:15', type: '严重', station: '广州超级站', msg: '星络快充枪 EVCS-022 触发高温急停断路' },
  { id: '2', time: '14:18:02', type: '重要', station: '杭州西湖站', msg: 'ESS-BMS-CAB 电芯温升过高自适应强排风开启' },
  { id: '3', time: '14:12:11', type: '重要', station: '武汉东湖站', msg: '电网无功计量总表 Modbus 上行抖动短延' },
  { id: '4', time: '13:56:45', type: '一般', station: '南京园区网', msg: 'PV-INV-12B 逆变单片测温略高报警补偿' },
  { id: '5', time: '13:40:22', type: '一般', station: '上海示范站', msg: '直流快充枪枪口检测电容电压出现微偏补偿' }
]);

const getAlarmSeverityColor = (type: string) => {
  if (type === '严重') return '#FF4D4F';
  if (type === '重要') return '#FAAD14';
  return '#3B82F6';
};

const getAlarmBackgroundClass = (type: string) => {
  if (type === '严重') return 'bg-red-950/30 border-red-900/40 hover:border-red-500';
  if (type === '重要') return 'bg-amber-950/20 border-amber-900/30 hover:border-amber-500';
  return 'bg-blue-950/20 border-blue-900/25 hover:border-blue-400';
};

// ==================== 6. 地图雷达交互 & Hover Floating Ticker ====================
const hoveredStationId = ref<string | null>(null);
const hoveredStation = ref<any>(null);
const hoveredMapStyle = ref({ left: '0px', top: '0px' });

const onMapNodeHover = (st: any, event: MouseEvent) => {
  hoveredStationId.value = st.id;
  hoveredStation.value = st;
  const currentTarget = event.currentTarget as SVGElement;
  const parentSvg = currentTarget.ownerSVGElement;
  if (parentSvg) {
    const parentRect = parentSvg.getBoundingClientRect();
    // 粗略估算相对坐标
    const clickX = event.clientX - parentRect.left;
    const clickY = event.clientY - parentRect.top;
    
    hoveredMapStyle.value = {
      left: `${clickX + 15}px`,
      top: `${clickY - 110}px`
    };
  }
};

const onMapNodeLeave = () => {
  hoveredStationId.value = null;
  hoveredStation.value = null;
};

// ==================== 7. ECharts 图表绘制生命周期 ====================
const flowChartRef = ref<HTMLDivElement | null>(null);
const pvTrendRef = ref<HTMLDivElement | null>(null);
const essPowerRef = ref<HTMLDivElement | null>(null);
const chargingTrendRef = ref<HTMLDivElement | null>(null);
const revenuePieRef = ref<HTMLDivElement | null>(null);
const carbonTrendRef = ref<HTMLDivElement | null>(null);

let fChart: echarts.ECharts | null = null;
let pChart: echarts.ECharts | null = null;
let eChart: echarts.ECharts | null = null;
let cChart: echarts.ECharts | null = null;
let rChart: echarts.ECharts | null = null;
let gChart: echarts.ECharts | null = null;

const initAllCharts = () => {
  const stations = filteredStations.value;
  const tf = timeFactor.value;

  // A. flow (ECharts Gauge or custom radar or ring)
  if (flowChartRef.value) {
    if (fChart) fChart.dispose();
    fChart = echarts.init(flowChartRef.value);
    fChart.setOption({
      radar: {
        indicator: [
          { name: '光伏有功', max: 500 },
          { name: '电网购入', max: 500 },
          { name: '储能深度', max: 100 },
          { name: '快充服务', max: 400 },
          { name: '绿自供给', max: 100 }
        ],
        radius: '65%',
        center: ['50%', '50%'],
        axisName: { color: '#94A3B8', fontSize: 9 },
        splitArea: { show: false },
        splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.15)' } }
      },
      series: [{
        type: 'radar',
        lineStyle: { color: '#00D4FF', width: 1.5 },
        areaStyle: { color: 'rgba(0, 212, 255, 0.18)' },
        data: [[
          Math.min(500, Math.max(10, currentSummary.value.pvPower / 2)),
          Math.min(500, currentSummary.value.evPower * 0.9 + 50),
          currentSummary.value.soc,
          Math.min(400, currentSummary.value.evPower),
          85
        ]]
      }]
    });
  }

  // B. pvTrend
  if (pvTrendRef.value) {
    if (pChart) pChart.dispose();
    pChart = echarts.init(pvTrendRef.value);
    pChart.setOption({
      grid: { left: '10%', right: '5%', top: '15%', bottom: '22%' },
      tooltip: { trigger: 'axis', backgroundColor: '#071A2E', borderColor: '#62B32E' },
      xAxis: {
        type: 'category',
        data: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
        axisLine: { lineStyle: { color: '#162e49' } },
        axisLabel: { color: '#94A3B8', fontSize: 9 }
      },
      yAxis: {
        type: 'value',
        name: 'kW',
        splitLine: { lineStyle: { color: 'rgba(30,41,59,0.3)' } },
        axisLabel: { color: '#94A3B8', fontSize: 9 }
      },
      series: [{
        name: '当前出力',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#62B32E', width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(98,179,46,0.35)' },
            { offset: 1, color: 'rgba(98,179,46,0.0)' }
          ])
        },
        data: [15, 120, 290, 480, 420, 210, 0].map(v => Math.round(v * (currentSummary.value.pvPower / 2600 + 0.1) * tf))
      }]
    });
  }

  // C. essPower
  if (essPowerRef.value) {
    if (eChart) eChart.dispose();
    eChart = echarts.init(essPowerRef.value);
    eChart.setOption({
      grid: { left: '10%', right: '10%', top: '15%', bottom: '22%' },
      xAxis: {
        type: 'category',
        data: ['02:00', '06:00', '10:00', '14:00', '18:00', '22:00'],
        axisLine: { lineStyle: { color: '#162e49' } },
        axisLabel: { color: '#94A3B8', fontSize: 9 }
      },
      yAxis: [
        { type: 'value', name: 'kW', splitLine: { lineStyle: { color: 'rgba(30,41,59,0.2)' } }, axisLabel: { color: '#94A3B8', fontSize: 9 } },
        { type: 'value', name: 'SOC(%)', max: 100, splitLine: { show: false }, axisLabel: { color: '#94A3B8', fontSize: 9 } }
      ],
      series: [
        {
          name: '充放功率',
          type: 'bar',
          barWidth: 6,
          itemStyle: { color: '#00D4FF', borderRadius: 2 },
          data: [120, 70, -90, -110, 130, 40].map(v => Math.round(v * tf))
        },
        {
          name: '平均SOC',
          type: 'line',
          yAxisIndex: 1,
          lineStyle: { color: '#FAAD14', width: 1.5 },
          data: [65, 80, 45, 20, 68, 75]
        }
      ]
    });
  }

  // D. chargingTrend
  if (chargingTrendRef.value) {
    if (cChart) cChart.dispose();
    cChart = echarts.init(chargingTrendRef.value);
    cChart.setOption({
      grid: { left: '10%', right: '5%', top: '12%', bottom: '22%' },
      xAxis: {
        type: 'category',
        data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
        axisLine: { lineStyle: { color: '#162e49' } },
        axisLabel: { color: '#94A3B8', fontSize: 9 }
      },
      yAxis: { type: 'value', name: 'kW', splitLine: { lineStyle: { color: 'rgba(30,41,59,0.2)' } }, axisLabel: { color: '#94A3B8', fontSize: 9 } },
      series: [{
        type: 'bar',
        barWidth: 10,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#A855F7' },
            { offset: 1, color: '#4F46E5' }
          ]),
          borderRadius: 2
        },
        data: [20, 45, 180, 240, 195, 110].map(v => Math.round(v * tf))
      }]
    });
  }

  // E. revenuePie
  if (revenuePieRef.value) {
    if (rChart) rChart.dispose();
    rChart = echarts.init(revenuePieRef.value);
    rChart.setOption({
      series: [{
        type: 'pie',
        radius: ['55%', '85%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        label: { show: true, position: 'outside', color: '#FFF', fontSize: 9, formatter: '{b}: {d}%' },
        labelLine: { length: 5, length2: 5, lineStyle: { color: '#475569' } },
        data: [
          { value: Math.round(currentSummary.value.gainsToday * 0.35), name: '光伏上网联', itemStyle: { color: '#62B32E' } },
          { value: Math.round(currentSummary.value.gainsToday * 0.18), name: '储削峰调蓄', itemStyle: { color: '#00D4FF' } },
          { value: Math.round(currentSummary.value.gainsToday * 0.47), name: '快充桩消纳', itemStyle: { color: '#A855F7' } }
        ]
      }]
    });
  }

  // F. carbonTrend / Multi-Balance 时序大账
  if (carbonTrendRef.value) {
    if (gChart) gChart.dispose();
    gChart = echarts.init(carbonTrendRef.value);

    let labels = ['北京', '上海', '南京', '深圳', '广州', '杭州', '成都', '天津', '西安', '武汉'];
    let pvVals = [4560, 3480, 2890, 4200, 3980, 1820, 2240, 3120, 2110, 0];
    let evVals = [3920, 3210, 2450, 3810, 4120, 1680, 1950, 2810, 1540, 0];

    if (activeTimeWindow.value !== 'today') {
      labels = ['05-01', '05-07', '05-14', '05-21', '05-26', '06-01'];
      pvVals = [18400, 24100, 29000, 31000, 26000, 19400];
      evVals = [21200, 28000, 34500, 32100, 29800, 21000];
    }

    gChart.setOption({
      grid: { left: '8%', right: '2%', top: '20%', bottom: '22%' },
      legend: { textStyle: { color: '#94A3B8', fontSize: 8 }, right: '2%', top: '2%' },
      tooltip: { trigger: 'axis', backgroundColor: '#071A2E' },
      xAxis: {
        type: 'category',
        data: labels,
        axisLine: { lineStyle: { color: '#162e49' } },
        axisLabel: { color: '#94A3B8', fontSize: 9 }
      },
      yAxis: { type: 'value', name: 'kWh', splitLine: { lineStyle: { color: 'rgba(30,41,59,0.3)' } }, axisLabel: { color: '#94A3B8', fontSize: 9 } },
      series: [
        { name: '集群出力发电量', type: 'bar', barWidth: 8, itemStyle: { color: '#62B32E', borderRadius: 1.5 }, data: pvVals.map(v => Math.round(v * tf / 2.5)) },
        { name: '智能充电消耗量', type: 'line', smooth: true, lineStyle: { color: '#A855F7', width: 2 }, data: evVals.map(v => Math.round(v * tf / 2.5)) }
      ]
    });
  }
};

const handleWindowResize = () => {
  fChart?.resize();
  pChart?.resize();
  eChart?.resize();
  cChart?.resize();
  rChart?.resize();
  gChart?.resize();
};

onMounted(() => {
  setTimeout(() => {
    initAllCharts();
    window.addEventListener('resize', handleWindowResize);
  }, 250);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleWindowResize);
  fChart?.dispose();
  pChart?.dispose();
  eChart?.dispose();
  cChart?.dispose();
  rChart?.dispose();
  gChart?.dispose();
});

// ==================== 8. 交互逻辑 & Modals ====================
const isStationDetailModalOpen = ref(false);
const isMetricModalOpen = ref(false);
const isAlarmsModalOpen = ref(false);

const selectedStationForModal = ref<any>(null);
const selectedMetricInfo = ref<any>({ label: '', value: '', unit: '' });
const seclectedApiLog = ref<any>(null);

const handleRegionChange = (val: string) => {
  const regLabels: Record<string, string> = {
    all: '全国合并监控中心',
    'east-china': '华东大区中心',
    'south-china': '华南大区中心',
    'north-china': '北部与西部中心'
  };
  message.success(`集控大屏片区成功切换：${regLabels[val]}`);
  nextTick(initAllCharts);
};

const changeTimeWindow = (windowKey: string) => {
  activeTimeWindow.value = windowKey;
  message.loading({ content: '跨电网对账账簿累计重新结转中...', duration: 0.6 })
    .then(() => {
      initAllCharts();
      message.success('联合电站结算周期对账数据重构成功！');
    });
};

const openMetricDetail = (card: any) => {
  selectedMetricInfo.value = card;
  isMetricModalOpen.value = true;
};

const handleStationClick = (st: any) => {
  selectedStationForModal.value = st;
  isStationDetailModalOpen.value = true;
};

const simulateSingelSiteFresh = (stationName: string) => {
  message.loading({ content: `注入热遥信，自愈纠偏 [${stationName}] 通讯指令中...`, duration: 0.8 })
    .then(() => {
      message.success(`远端【${stationName}】自适应变流逻辑核对，无功损耗纠偏复位落盘！`);
      isStationDetailModalOpen.value = false;
    });
};

const routeToSingleSiteDetail = (st: any) => {
  isStationDetailModalOpen.value = false;
  message.loading({ content: `穿透光储充大屏，正在跳转到【${st.name}】单站详情终端...`, duration: 1.0 })
    .then(() => {
      // 模拟单站跳转，依据站点所拥有的子系统性质选择路由：储能/光伏/充电
      if (st.id === 'st-03' || st.id === 'st-05') {
        router.push('/storage');
      } else if (st.id === 'st-08') {
        router.push('/pv');
      } else {
        router.push('/dashboard');
      }
      message.success(`已穿透进入单站数字孪生运行舱。`);
    });
};

const triggerAllHeal = () => {
  message.loading({ content: '集控中心指令下达：开启5G射频自愈脉冲，校准全网10大电站...', duration: 1.2 })
    .then(() => {
      stationsList.value.forEach(s => {
        if (s.status === 'offline') {
          s.status = 'online';
          s.pvPower = Math.round(180 + Math.random() * 80);
          s.essPower = -60;
          s.essSoc = 55;
          s.evLoad = 120;
          s.gainsToday = 2100;
        } else if (s.status === 'warning' || s.status === 'danger') {
          s.status = 'online';
          s.alarmsCount = 0;
        }
      });
      // 移除活动警报列表的所有严重重要警情
      alarmsList.value = [
        { id: '4', time: '13:56:45', type: '一般', station: '南京园区网', msg: 'PV-INV-12B 逆变器参数自适应微偏补偿完成' },
        { id: '5', time: '13:40:22', type: '一般', station: '上海示范站', msg: '快充枪重连校准成功' }
      ];
      apiIntegrationsMock.value.forEach(api => {
        if (api.status === '异常') {
          api.status = '正常';
          api.latency = '54ms';
          api.logs.push(`[14:31:02] 自愈控制链握手复位成功，5G网络通道丢包率为0.00%`);
        }
      });
      message.success('一键集团网络自愈大捷！离线的【武汉东湖站】成功恢复并网，广州等暴限警情已消除！');
      initAllCharts();
    });
};

const showAlarmDetails = (al: any) => {
  message.info(`SCADA 遥信通告【${al.station}】警：${al.msg}`);
};

const clearSingleAlarm = (record: any) => {
  const idx = detailedAlarmsMock.value.findIndex(a => a.id === record.id);
  if (idx !== -1) {
    detailedAlarmsMock.value.splice(idx, 1);
    message.success(`警情【${record.id}】已被现场运维员核对消纳闭环！`);
  }
};

// ==================== 9. 异构外部平台 API Dock 数据库 = pointer-events ====================
const detailedAlarmsMock = ref([
  { id: 'ALM-101', time: '14:22:15', severity: '严重', source: '广州超级站 - EVCS-022', content: '快充枪电流超出 250A 水位，锁闭自热排风异常' },
  { id: 'ALM-098', time: '14:18:02', severity: '重要', source: '杭州西湖站 - ESS-BMS', content: '第4柜蓄锂电池簇存在内阻微升，下发热排热控防护' },
  { id: 'ALM-085', time: '14:12:11', severity: '重要', source: '武汉东湖站 - 数据总线', content: 'Modbus 502 并网网关拉取接口发生间歇性丢包重连' }
]);

const apiIntegrationsMock = ref([
  { name: 'CECEP 光伏发电并网汇集接口 (cecep_pv_scada)', status: '正常', latency: '42ms', successRate: '99.98%', todayCount: 18450, failCount: 1, logs: ['[14:30:00] 合并拉取10站光伏逆变器数据包 268 台正常', '[14:29:00] 校验和无偏，逆变数据落盘'] },
  { name: '跨域 BMS 储能双放深度充放 (ess_bms_dispatch)', status: '正常', latency: '58ms', successRate: '99.95%', todayCount: 14220, failCount: 4, logs: ['[14:30:01] 周期电能套利逻辑策略成功发布', '[14:28:10] BMS 各站热耗监控无过流过载迹象'] },
  { name: '星络快充实时账单清结算中心 (star_ev_billing)', status: '正常', latency: '68ms', successRate: '99.91%', todayCount: 31280, failCount: 11, logs: ['[14:30:01] 充电流水 482 笔对账完成，一致率 100%', '[14:27:00] 星络网关可用桩枪数据推流完毕'] },
  { name: '国常网分布式需量CT大表计量网关', status: '异常', latency: '5G断流', successRate: '94.22%', todayCount: 5200, failCount: 228, logs: ['[14:30:02] 限时重试超时：504 Gateway Timeout', '[14:29:40] 国网关口无功补偿 CT 数据采集丢包失准'] },
  { name: '中节能气象太空云微辐射仪 (cecep_eco_weather)', status: '正常', latency: '92ms', successRate: '100.0%', todayCount: 5400, failCount: 0, logs: ['[14:30:00] 西北、华东等多地区多云向午转晴谱图同步完毕', '[14:20:00] 地表辐照均值：710 W/㎡'] }
]);

const alarmColumns = [
  { title: '警情编码', dataIndex: 'id', key: 'id', width: 90 },
  { title: '触发时刻', dataIndex: 'time', key: 'time', width: 85 },
  { title: '风险水位', dataIndex: 'severity', key: 'severity', width: 80 },
  { title: '警情及现场设备源', dataIndex: 'source', key: 'source', width: 180 },
  { title: '警情日志内容描述', dataIndex: 'content', key: 'content' },
  { title: '安防反馈', key: 'action', width: 90 }
];

const apiColumns = [
  { title: '一期第三方API接口通道', dataIndex: 'name', key: 'name' },
  { title: '连通健康', dataIndex: 'status', key: 'status', width: 90 },
  { title: '实时时延', dataIndex: 'latency', key: 'latency', width: 100 },
  { title: '握手率', dataIndex: 'successRate', key: 'successRate', width: 90 },
  { title: '通信吞错比', key: 'count', customRender: ({ record }: any) => `${record.todayCount}/${record.failCount}` },
  { title: '诊断', key: 'action', width: 90 }
];

const openAlarmsModal = () => {
  isAlarmsModalOpen.value = true;
};

const showApiLogs = (record: any) => {
  seclectedApiLog.value = record;
  message.success(`拉取接口 [${record.name}] 会话日志片段成功`);
};

// ==================== 10. 全屏模式和路由返回后台 ====================
const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
      .then(() => {
        isFullScreen.value = true;
        message.info('已开启全屏监测模式。按 ESC 可随时退出。');
      })
      .catch((err) => {
        message.error(`全屏被浏览器打断: ${err.message}`);
      });
  } else {
    document.exitFullscreen()
      .then(() => {
        isFullScreen.value = false;
      });
  }
};

const goBackToConsole = () => {
  router.push('/dashboard');
  message.success('大屏已离线挂起，已成功返回监控普通后台。');
};

const getStatusBgClass = (status: string) => {
  if (status === 'online') return 'bg-[#62B32E]';
  if (status === 'warning') return 'bg-[#FAAD14]';
  if (status === 'danger') return 'bg-[#FF4D4F]';
  return 'bg-slate-500';
};

const getStatusColorClass = (status: string) => {
  if (status === 'online') return 'text-green-400';
  if (status === 'warning') return 'text-[#FAAD14]';
  if (status === 'danger') return 'text-[#FF4D4F]';
  return 'text-slate-400';
};

const getStatusLabel = (status: string) => {
  if (status === 'online') return '运行正常';
  if (status === 'warning') return '设备预警';
  if (status === 'danger') return '严重告警';
  return '连接离线';
};
</script>

<style scoped>
/* 科技渐变卡片特殊背景 */
.bg-card-dark {
  background: rgba(8, 24, 43, 0.85);
  box-shadow: inset 0 0 12px rgba(0, 212, 255, 0.12), 0 3px 15px rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(8px);
}

/* 科技仿网格背景 */
.bg-grid {
  background-image: linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* Select 框重置适配科技大屏 */
.dark-sceen-select :deep(.ant-select-selector) {
  background-color: transparent !important;
  border: none !important;
  color: #00D4FF !important;
  font-weight: 800 !important;
  font-size: 11.5px !important;
  padding: 0 !important;
}
.dark-sceen-select :deep(.ant-select-arrow) {
  color: #00D4FF !important;
}

/* 弹框层级 */
:global(.dark-screen-modal-wrapper .ant-modal-content) {
  background-color: #061524 !important;
  border: 1.2px solid rgba(0, 212, 255, 0.35) !important;
  box-shadow: 0 0 24px rgba(0, 212, 255, 0.25) !important;
  border-radius: 6px !important;
}
:global(.dark-screen-modal-wrapper .ant-modal-header) {
  background-color: #081d31 !important;
  border-bottom: 1px solid rgba(0, 212, 255, 0.2) !important;
  padding: 10px 16px !important;
}
:global(.dark-screen-modal-wrapper .ant-modal-title) {
  color: #00D4FF !important;
  font-weight: 800 !important;
  font-size: 13px !important;
}
:global(.dark-screen-modal-wrapper .ant-modal-close) {
  color: #00D4FF !important;
}
:global(.dark-screen-modal-wrapper .ant-modal-footer) {
  background-color: #081d31 !important;
  border-top: 1px solid rgba(0, 212, 255, 0.15) !important;
  padding: 8px 16px !important;
}
:global(.dark-screen-modal-wrapper .ant-modal-footer .ant-btn-default) {
  background-color: #12283d !important;
  border-color: rgba(0, 212, 255, 0.15) !important;
  color: #94A3B8 !important;
}

/* 暗色表格样式重置 */
:global(.dark-screen-modal-wrapper .dark-mini-table .ant-table) {
  background: #041421 !important;
  color: #CBD5E1 !important;
}
:global(.dark-screen-modal-wrapper .dark-mini-table .ant-table-thead > tr > th) {
  background: #081b2a !important;
  color: #00D4FF !important;
  font-weight: bold !important;
  border-bottom: 1.2px solid rgba(0, 212, 255, 0.25) !important;
  font-size: 10.5px !important;
}
:global(.dark-screen-modal-wrapper .dark-mini-table .ant-table-tbody > tr > td) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
  font-size: 10.5px !important;
  padding: 6px !important;
}
:global(.dark-screen-modal-wrapper .dark-mini-table .ant-table-row:hover > td) {
  background: rgba(0, 212, 255, 0.1) !important;
}
</style>
