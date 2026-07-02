<template>
  <div class="space-y-6 font-sans">
    <!-- 头部引导 & 指引卡片 -->
    <div class="bg-white px-6 py-5 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="space-y-1">
        <h2 class="text-base font-bold text-slate-800 m-0 flex items-center gap-2">
          <span class="h-4 w-1 bg-[#005BAC] rounded"></span>
          站点与能效网络配置
        </h2>
        <p class="text-xs text-slate-400 font-medium">维护集团旗下“光、储、充、并、能”等多维度微网节点的资产位置、气象及网格额度，控制下联感知链路的可信接入机制。</p>
      </div>
      
      <!-- 操作集 -->
      <div class="flex items-center gap-2 self-start md:self-auto">
        <button 
          @click="triggerImportModal"
          class="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
        >
          <Upload :size="14" /> 批量导入站点
        </button>
        <button 
          @click="exportToCSV"
          class="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
        >
          <Download :size="14" /> 导出站点清单
        </button>
        <button 
          @click="openSiteFormModal(null)" 
          class="px-4 py-2 bg-[#005BAC] hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
        >
          <Plus :size="14" /> 登记新能效站点
        </button>
      </div>
    </div>

    <!-- 高保真看板微指数卡 -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-2">
        <span class="text-[11px] text-slate-400 font-bold block">总站点规模</span>
        <div class="flex items-baseline gap-1.5">
          <span class="text-xl font-bold text-slate-800">{{ globalStore.sites.length }}</span>
          <span class="text-[10px] text-slate-400">处节点</span>
        </div>
      </div>
      <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-2">
        <span class="text-[11px] text-slate-400 font-bold block">正常运行中</span>
        <div class="flex items-baseline gap-1.5">
          <span class="text-xl font-bold text-emerald-600">{{ activeSitesCount }}</span>
          <span class="text-[10px] text-slate-400">处 ({{ Math.round((activeSitesCount/globalStore.sites.length)*100) }}%)</span>
        </div>
      </div>
      <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-2">
        <span class="text-[11px] text-slate-400 font-bold block">告警/受限</span>
        <div class="flex items-baseline gap-1.5">
          <span class="text-xl font-bold" :class="alarmSitesCount > 0 ? 'text-amber-500' : 'text-slate-500'">{{ alarmSitesCount }}</span>
          <span class="text-[10px] text-slate-400">级节点</span>
        </div>
      </div>
      <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-2">
        <span class="text-[11px] text-slate-400 font-bold block">光伏额顶功率</span>
        <div class="flex items-baseline gap-1.5">
          <span class="text-xl font-bold text-blue-650">{{ totalPvCapacity }}</span>
          <span class="text-[10px] text-slate-400">kWp 总额</span>
        </div>
      </div>
      <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-2 col-span-2 lg:col-span-1">
        <span class="text-[11px] text-slate-400 font-bold block">储能蓄容充量</span>
        <div class="flex items-baseline gap-1.5">
          <span class="text-xl font-bold text-purple-650">{{ totalEssCapacity }}</span>
          <span class="text-[10px] text-slate-400">kWh 容量</span>
        </div>
      </div>
    </div>

    <!-- 过滤器及搜索区 -->
    <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
        <div class="space-y-1.5 text-xs">
          <span class="text-slate-500 font-bold block">站点检索：</span>
          <a-input v-model:value="filters.name" placeholder="检索站点名称..." allow-clear />
        </div>
        <div class="space-y-1.5 text-xs">
          <span class="text-slate-500 font-bold block">站点编码：</span>
          <a-input v-model:value="filters.code" placeholder="输入编码(例: CECEP)..." allow-clear />
        </div>
        <div class="space-y-1.5 text-xs">
          <span class="text-slate-500 font-bold block">所属区域：</span>
          <a-select v-model:value="filters.region" placeholder="全部物理区域" style="width: 100%" allow-clear>
            <a-select-option value="华东区域">华东区域</a-select-option>
            <a-select-option value="华北区域">华北区域</a-select-option>
            <a-select-option value="华南区域">华南区域</a-select-option>
            <a-select-option value="华中区域">华中区域</a-select-option>
            <a-select-option value="西南区域">西南区域</a-select-option>
          </a-select>
        </div>
        <div class="space-y-1.5 text-xs">
          <span class="text-slate-500 font-bold block">运行状态：</span>
          <a-select v-model:value="filters.status" placeholder="全部运行状态" style="width: 100%" allow-clear>
            <a-select-option value="正常">正常模式</a-select-option>
            <a-select-option value="预警">黄色预警</a-select-option>
            <a-select-option value="告警">红色告警</a-select-option>
            <a-select-option value="离线">通信离线</a-select-option>
            <a-select-option value="停用">安全置锁</a-select-option>
          </a-select>
        </div>
        <div class="space-y-1.5 text-xs">
          <span class="text-slate-500 font-bold block">站点类型：</span>
          <a-select v-model:value="filters.type" placeholder="全部节点类型" style="width: 100%" allow-clear>
            <a-select-option value="光储充一体站">光储充一体站</a-select-option>
            <a-select-option value="光伏站">光伏发电站</a-select-option>
            <a-select-option value="储能站">储能调峰站</a-select-option>
            <a-select-option value="充电站">充电桩站</a-select-option>
          </a-select>
        </div>
      </div>
      
      <!-- 触发栏 -->
      <div class="flex items-center justify-between border-t border-slate-100 mt-4 pt-4">
        <span class="text-[11px] text-slate-400">
          基于当前参数，累计检索出 <span class="text-slate-700 font-bold font-mono">{{ filteredSites.length }}</span> 个匹配网络
        </span>
        <div class="flex items-center gap-3">
          <button 
            @click="resetAllFilters" 
            class="px-4 py-1.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-250 text-xs font-semibold rounded-md transition cursor-pointer"
          >
            重置筛选条件
          </button>
          <button 
            @click="executeSearch" 
            class="px-5 py-1.5 bg-[#005BAC] hover:bg-blue-750 text-white text-xs font-bold rounded-md shadow-sm transition cursor-pointer flex items-center gap-1"
          >
            <Search :size="13" /> 并网条件过滤
          </button>
        </div>
      </div>
    </div>

    <!-- 站点数据主表 -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="overflow-x-auto w-full">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50/70 text-slate-600 font-semibold border-b border-slate-150 select-none">
              <th class="p-4 font-bold">节点名称 / 识别编码</th>
              <th class="p-4 font-bold">行政辖区</th>
              <th class="p-4 font-bold">站点物理地址</th>
              <th class="p-4 font-bold">接入配比类型</th>
              <th class="p-4 text-right font-bold">光估(kWp)</th>
              <th class="p-4 text-right font-bold">能蓄(kWh)</th>
              <th class="p-4 text-center font-bold">桩数/设备</th>
              <th class="p-4 text-center font-bold">系统状态</th>
              <th class="p-4 text-center font-bold">对接层级</th>
              <th class="p-4 text-center font-bold">注册入册日</th>
              <th class="p-4 text-center font-bold">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr 
              v-for="site in paginatedSites" 
              :key="site.key" 
              class="hover:bg-slate-50/50 transition cursor-pointer"
              @click="openSiteDetailDrawer(site)"
            >
              <!-- 名称编码 -->
              <td class="p-4">
                <div class="space-y-0.5">
                  <span class="font-bold text-slate-800 block hover:text-[#005BAC] transition">{{ site.name }}</span>
                  <code class="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded text-[10px] font-mono leading-none">
                    {{ site.code }}
                  </code>
                </div>
              </td>
              
              <!-- 区域 -->
              <td class="p-4 font-medium text-slate-600">
                {{ site.region }}
              </td>

              <!-- 地址 -->
              <td class="p-4 max-w-[160px] truncate text-slate-400" :title="site.address">
                {{ site.address }}
              </td>

              <!-- 类型 -->
              <td class="p-4">
                <span 
                  class="px-2 py-0.5 rounded text-[10.5px] font-medium"
                  :class="getTypeStyle(site.type)"
                >
                  {{ site.type }}
                </span>
              </td>

              <!-- 光伏 kWp -->
              <td class="p-4 text-right font-mono font-bold" :class="site.pvCapacity > 0 ? 'text-blue-650' : 'text-slate-305'">
                {{ site.pvCapacity > 0 ? `${site.pvCapacity}` : '-' }}
              </td>

              <!-- 储能 kWh -->
              <td class="p-4 text-right font-mono font-bold" :class="site.essCapacity > 0 ? 'text-purple-650' : 'text-slate-305'">
                {{ site.essCapacity > 0 ? `${site.essCapacity}` : '-' }}
              </td>

              <!-- 桩/设备 -->
              <td class="p-4 text-center font-mono">
                <span class="text-slate-750 font-bold">{{ site.chargerCount }}</span> / <span class="text-slate-400">{{ site.deviceCount }}</span>
              </td>

              <!-- 运行状态 -->
              <td class="p-4 text-center" @click.stop>
                <a-dropdown :trigger="['click']">
                  <span 
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer inline-flex items-center gap-1 border hover:shadow-sm select-none"
                    :class="getStatusStyle(site.status)"
                  >
                    <span class="h-1.5 w-1.5 rounded-full" :class="getStatusDotStyle(site.status)"></span>
                    {{ site.status }}
                  </span>
                  <template #overlay>
                    <a-menu @click="({ key }: any) => changeSiteStatusDirectly(site.key, key as any)">
                      <a-menu-item key="正常">
                        <span class="text-xs font-semibold flex items-center gap-1.5 text-emerald-600">
                          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> 正常
                        </span>
                      </a-menu-item>
                      <a-menu-item key="预警">
                        <span class="text-xs font-semibold flex items-center gap-1.5 text-amber-500">
                          <span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span> 预警
                        </span>
                      </a-menu-item>
                      <a-menu-item key="告警">
                        <span class="text-xs font-semibold flex items-center gap-1.5 text-red-500">
                          <span class="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping"></span> 告警
                        </span>
                      </a-menu-item>
                      <a-menu-item key="离线">
                        <span class="text-xs font-semibold flex items-center gap-1.5 text-slate-500">
                          <span class="h-1.5 w-1.5 rounded-full bg-slate-400"></span> 离线
                        </span>
                      </a-menu-item>
                      <a-menu-item key="停用">
                        <span class="text-xs font-semibold flex items-center gap-1.5 text-zinc-650">
                          <span class="h-1.5 w-1.5 rounded-full bg-zinc-650 animate-pulse"></span> 停用
                        </span>
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </td>

              <!-- 接入状态 -->
              <td class="p-4 text-center">
                <span 
                  class="px-2 py-0.5 rounded text-[10px] font-bold"
                  :class="getAccessStatusStyle(site.accessStatus)"
                >
                  {{ site.accessStatus }}
                </span>
              </td>

              <!-- 创建时间 -->
              <td class="p-4 text-center text-slate-400 font-mono text-[11px]">
                {{ site.createdAt.split(' ')[0] }}
              </td>

              <!-- 操作 -->
              <td class="p-4 text-center" @click.stop>
                <div class="flex items-center justify-center gap-2.5">
                  <button 
                    @click="openSiteDetailDrawer(site)"
                    class="text-[#005BAC] hover:text-blue-700 font-bold border border-blue-105 rounded px-1.5 py-0.5 bg-blue-50/20 hover:bg-blue-50 transition cursor-pointer"
                  >
                    详情
                  </button>
                  <button 
                    @click="openSiteFormModal(site)"
                    class="text-emerald-600 hover:text-emerald-700 font-bold border border-emerald-100 rounded px-1.5 py-0.5 bg-emerald-50/20 hover:bg-emerald-50 transition cursor-pointer"
                  >
                    编辑
                  </button>
                  <button 
                    v-if="site.status !== '停用'"
                    @click="toggleSiteLock(site.key, true)"
                    class="text-amber-600 hover:text-amber-700 font-bold border border-amber-100 rounded px-1.5 py-0.5 bg-amber-50/20 hover:bg-amber-50 transition cursor-pointer"
                  >
                    停用
                  </button>
                  <button 
                    v-else
                    @click="toggleSiteLock(site.key, false)"
                    class="text-teal-650 hover:text-teal-700 font-bold border border-teal-100 rounded px-1.5 py-0.5 bg-teal-50/20 hover:bg-teal-50 transition cursor-pointer"
                  >
                    启用
                  </button>

                  <a-popconfirm
                    title="高低压配网预警：您确认将彻底废止该能能效站点及其下联子代数据吗？此行为具有安全断开后果。"
                    ok-text="确认物理废止"
                    cancel-text="不，暂存"
                    ok-type="danger"
                    @confirm="deleteSite(site.key)"
                  >
                    <button class="text-rose-600 hover:text-rose-700 font-bold border border-rose-100 rounded px-1.5 py-0.5 bg-rose-50/20 hover:bg-rose-50 transition cursor-pointer">
                      删除
                    </button>
                  </a-popconfirm>
                </div>
              </td>
            </tr>

            <!-- 空列表 -->
            <tr v-if="filteredSites.length === 0">
              <td colspan="11" class="text-center py-20 text-slate-400">
                <div class="flex flex-col items-center justify-center gap-2 select-none">
                  <Database :size="36" class="text-slate-200 animate-bounce" />
                  <span class="text-xs font-semibold">未检测到任何配电网监测站点，请调整上方并网检索词进行重调。</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页栏 -->
      <div class="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30 text-xs text-slate-500">
        <span>
          当前展示第 <span class="font-bold text-slate-800">{{ (pagination.current - 1) * pagination.pageSize + 1 }}</span> - 
          <span class="font-bold text-slate-800">{{ Math.min(pagination.current * pagination.pageSize, filteredSites.length) }}</span> 
          个节点，共 <span class="font-bold text-slate-800">{{ filteredSites.length }}</span> 个微网
        </span>
        <div class="flex items-center gap-1.5">
          <button 
            @click="prevPage" 
            :disabled="pagination.current === 1"
            class="px-2.5 py-1 bg-white border border-slate-250 rounded hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          <span class="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded font-bold text-slate-700">
            {{ pagination.current }} / {{ totalPages }}
          </span>
          <button 
            @click="nextPage" 
            :disabled="pagination.current === totalPages"
            class="px-2.5 py-1 bg-white border border-slate-250 rounded hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      </div>
    </div>

    <!-- 弹窗： 新增 / 编辑能效资产站点 -->
    <a-modal
      v-model:open="isFormModalOpen"
      :title="siteForm.key ? '编辑中国节能 (CECEP) 能效站点' : '登记绑定全新光储充物理站点'"
      @ok="saveSiteForm"
      width="640px"
      ok-text="落盘并发布监控心跳"
      cancel-text="放弃"
    >
      <div class="p-2 space-y-4 text-xs">
        <div class="bg-blue-50/50 p-3 rounded-lg border border-blue-150/40 flex items-start gap-2.5 text-blue-800 leading-relaxed">
          <Info :size="14" class="mt-0.5 shrink-0" />
          <p class="m-0 text-[11.5px]">
            登记新站后，系统将在全局<b>“双隔离安全围栏”</b>体系中予以初始化。人员名单及安全角色仅在被授权此站点编码（如 <code>{{ siteForm.code || '示例' }}</code>）后方可实施调测和收益分析。
          </p>
        </div>

        <a-form layout="vertical" class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2.5">
          <!-- 站名 -->
          <a-form-item label="站点名称" required>
            <a-input v-model:value="siteForm.name" placeholder="例: 中节能深圳龙岗超级充电服务站" />
          </a-form-item>

          <!-- 编码 -->
          <a-form-item label="站点编码 (核定安全码)" required :disabled="!!siteForm.key">
            <a-input v-model:value="siteForm.code" placeholder="建议格式: CECEP-SZ-006" :disabled="!!siteForm.key" />
          </a-form-item>

          <!-- 所属区域 -->
          <a-form-item label="所属区域" required>
            <a-select v-model:value="siteForm.region" placeholder="请指派站点所属核心地理大区">
              <a-select-option value="华东区域">华东区域</a-select-option>
              <a-select-option value="华北区域">华北区域</a-select-option>
              <a-select-option value="华南区域">华南区域</a-select-option>
              <a-select-option value="华中区域">华中区域</a-select-option>
              <a-select-option value="西南区域">西南区域</a-select-option>
            </a-select>
          </a-form-item>

          <!-- 站点类型 -->
          <a-form-item label="站点能效类型" required>
            <a-select v-model:value="siteForm.type" placeholder="请指派能效类型">
              <a-select-option value="光储充一体站">光储充一体站</a-select-option>
              <a-select-option value="光伏站">光伏发电站</a-select-option>
              <a-select-option value="储能站">储能调峰站</a-select-option>
              <a-select-option value="充电站">充电桩站</a-select-option>
            </a-select>
          </a-form-item>

          <!-- 地址 -->
          <div class="md:col-span-2">
            <a-form-item label="站点物理精确地址" required>
              <a-input v-model:value="siteForm.address" placeholder="请输入如：广东省深圳市龙岗区坂田街道中节能环保大厦..." />
            </a-form-item>
          </div>

          <!-- 经度 -->
          <a-form-item label="经度坐标 (E)" required>
            <a-input-number v-model:value="siteForm.longitude" :step="0.0001" style="width: 100%" placeholder="114.0579" />
          </a-form-item>

          <!-- 纬度 -->
          <a-form-item label="纬度坐标 (N)" required>
            <a-input-number v-model:value="siteForm.latitude" :step="0.0001" style="width: 100%" placeholder="22.5431" />
          </a-form-item>

          <!-- 光伏 -->
          <a-form-item label="光伏装机容量 (kWp)">
            <a-input-number v-model:value="siteForm.pvCapacity" :min="0" style="width: 100%" placeholder="无光伏则输入0/空" />
          </a-form-item>

          <!-- 储能 -->
          <a-form-item label="储能额定容量 (kWh)">
            <a-input-number v-model:value="siteForm.essCapacity" :min="0" style="width: 100%" placeholder="无储能则输入0/空" />
          </a-form-item>

          <!-- 桩数 -->
          <a-form-item label="充电枪桩部署数量" required>
            <a-input-number v-model:value="siteForm.chargerCount" :min="0" style="width: 100%" placeholder="输入桩个数" />
          </a-form-item>

          <!-- 主负责人 -->
          <a-form-item label="站点主负责人" required>
            <a-input v-model:value="siteForm.manager" placeholder="例: 张强" />
          </a-form-item>

          <!-- 手机 -->
          <a-form-item label="移动联系钥匙" required>
            <a-input v-model:value="siteForm.phone" placeholder="例: 13912345678" />
          </a-form-item>

          <!-- 同步第三方 -->
          <div class="col-span-1 md:col-span-2 py-1 bg-slate-50 rounded border border-slate-150 px-3 flex items-center justify-between">
            <span class="font-bold text-slate-700">同步允许第三方平台智能握手</span>
            <a-switch v-model:checked="siteForm.thirdPartySynced" checked-children="开" un-checked-children="关" />
          </div>

          <!-- 备注 -->
          <div class="md:col-span-2">
            <a-form-item label="站点备注与调配批注">
              <a-textarea v-model:value="siteForm.remark" placeholder="备注诸如特许经营期、日照仰角调试等属性..." :rows="3" />
            </a-form-item>
          </div>
        </a-form>
      </div>
    </a-modal>

    <!-- 弹窗：批量导入能效站点 (Simulated File Import with high interactivity) -->
    <a-modal
      v-model:open="isImportModalOpen"
      title="批量导入中国节能级站点矩阵"
      @ok="importBulkSamples"
      width="500px"
      ok-text="确认模拟解析并导入"
      cancel-text="关闭"
    >
      <div class="p-3 space-y-4 text-xs">
        <p class="text-slate-500 m-0 leading-relaxed">
          此处支持一键导入多能流拓扑站点 Excel 模板。为在 Prototype 阶段向您展示此项高敏写特性，我们预装好了 <span class="font-bold text-emerald-600">3 个备用中节能网格试点数据</span>，您可以拖拽文件或点击下方，平台会自动注入：
        </p>

        <!-- 拖放虚线框 -->
        <div 
          @click="simulateExcelSelection"
          class="border-2 border-dashed border-slate-200 hover:border-[#005BAC] p-8 text-center rounded-xl bg-slate-50/50 hover:bg-slate-50/100 active:bg-blue-50/50 cursor-pointer transition select-none flex flex-col items-center justify-center gap-2"
        >
          <Workflow :size="32" class="text-blue-600 animate-pulse" />
          <span class="font-bold text-slate-800">
            {{ isTempFileLoaded ? '📄 已锁定待批导入: CECEP_Grid_Sites_2026.xlsx' : '拖拽 Excel、CSV 到此处，或点击浏览本地文件' }}
          </span>
          <p class="text-[10px] text-slate-400 m-0">
            {{ isTempFileLoaded ? '内含中节能厦门站、中节能西安站、中节能济南站' : '支持格式: xls, xlsx, csv (额度不可超 10MB)' }}
          </p>
        </div>

        <div v-if="isTempFileLoaded" class="bg-amber-50 rounded-lg p-3 border border-amber-200 text-amber-800 space-y-1 scale-98 transition">
          <span class="font-bold block text-[11px] flex items-center gap-1">
            <ShieldAlert :size="13" /> 解析通过，发现 3 个全新能效节点：
          </span>
          <ol class="list-decimal pl-4 text-[10.5px] space-y-0.5 font-medium">
            <li>中节能厦门海沧一体化示范站 (华南区 • 一体站)</li>
            <li>中节能西安航天城分布式光伏站 (西北区 • 光伏站)</li>
            <li>中节能济南高新低碳调能电池站 (华东区 • 储存站)</li>
          </ol>
        </div>
      </div>
    </a-modal>

    <!-- 站点深度审核抽屉 (Detail Drawer) -->
    <a-drawer
      v-model:open="isDrawerOpen"
      :title="`站点安全大盘审计 [${selectedSite?.name || ''}]`"
      placement="right"
      width="540px"
      @close="isDrawerOpen = false"
    >
      <div v-if="selectedSite" class="space-y-6 text-xs pb-10">
        <!-- 主头部 -->
        <div class="bg-gradient-to-r from-slate-900 to-slate-850 p-5 rounded-xl border border-slate-800 text-white relative overflow-hidden shadow-md">
          <Layers :size="100" class="absolute -bottom-6 -right-6 text-white/5 font-sans" />
          
          <div class="space-y-1.5 relative z-10">
            <div class="flex items-center gap-2">
              <span 
                class="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 border border-white/20"
              >
                {{ selectedSite.type }}
              </span>
              <span 
                class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
                :class="getStatusStyle(selectedSite.status)"
              >
                {{ selectedSite.status }}
              </span>
            </div>
            
            <h3 class="text-sm font-bold m-0 text-white select-all">{{ selectedSite.name }}</h3>
            <span class="text-[10px] text-slate-400 font-mono block">接入网格密钥: {{ selectedSite.code }}</span>
          </div>
        </div>

        <!-- 统计面板 -->
        <div class="grid grid-cols-3 gap-3">
          <div class="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1 text-center">
            <span class="text-[10px] text-slate-400 font-bold block">下联设备数</span>
            <span class="text-sm font-bold text-slate-800 font-mono">{{ selectedSite.deviceCount }} 台</span>
          </div>
          <div class="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1 text-center">
            <span class="text-[10px] text-slate-400 font-bold block">充电桩数量</span>
            <span class="text-sm font-bold text-slate-800 font-mono">{{ selectedSite.chargerCount }} 桩</span>
          </div>
          <div class="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1 text-center">
            <span class="text-[10px] text-slate-400 font-bold block">并网状态</span>
            <span class="text-sm font-bold text-slate-800">{{ selectedSite.accessStatus }}</span>
          </div>
        </div>

        <!-- 基本核验 -->
        <div class="space-y-3">
          <div class="flex items-center gap-2 font-bold text-slate-800 border-b border-rose-100 pb-1 text-xs">
            <ShieldAlert :size="14" class="text-blue-650" />
            <span>一、 站点基本地理与数字边界</span>
          </div>

          <table class="w-full text-xs">
            <tbody class="divide-y divide-slate-100">
              <tr class="hover:bg-slate-50/50">
                <td class="py-2.5 text-slate-400 font-medium">地理大区</td>
                <td class="py-2.5 font-bold text-slate-800 text-right">{{ selectedSite.region }}</td>
              </tr>
              <tr class="hover:bg-slate-50/50">
                <td class="py-2.5 text-slate-400 font-medium">精确门牌号</td>
                <td class="py-2.5 text-slate-650 text-right">{{ selectedSite.address }}</td>
              </tr>
              <tr class="hover:bg-slate-50/50">
                <td class="py-2.5 text-slate-400 font-medium">经纬测算坐标</td>
                <td class="py-2.5 font-mono font-semibold text-slate-700 text-right">
                  E {{ selectedSite.longitude }}° / N {{ selectedSite.latitude }}°
                </td>
              </tr>
              <tr class="hover:bg-slate-50/50">
                <td class="py-2.5 text-slate-400 font-medium">主安全负责人</td>
                <td class="py-2.5 font-bold text-slate-800 text-right">
                  {{ selectedSite.manager }} ({{ selectedSite.phone }})
                </td>
              </tr>
              <tr class="hover:bg-slate-50/50">
                <td class="py-2.5 text-slate-400 font-medium">三方接入标志</td>
                <td class="py-2.5 font-bold text-right" :class="selectedSite.thirdPartySynced ? 'text-emerald-600' : 'text-slate-405'">
                  {{ selectedSite.thirdPartySynced ? '已对接 SaaS' : '冷态暂无对接' }}
                </td>
              </tr>
              <tr class="hover:bg-slate-50/50">
                <td class="py-2.5 text-slate-400 font-medium">备注特征</td>
                <td class="py-2.5 text-slate-500 text-right">{{ selectedSite.remark || '无' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 容量指标 -->
        <div class="space-y-3 pt-2">
          <div class="flex items-center gap-2 font-bold text-slate-800 border-b border-rose-100 pb-1 text-xs">
            <Sliders :size="14" class="text-blue-650" />
            <span>二、 物理容量规划及气象预载</span>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="p-3 bg-slate-50 rounded-lg border border-slate-150 space-y-1">
              <span class="text-[10px] text-slate-400 font-bold block">分布式光伏装机额度</span>
              <span class="text-base font-bold text-blue-650 font-mono">{{ selectedSite.pvCapacity ? `${selectedSite.pvCapacity} kWp` : '未装设' }}</span>
            </div>
            <div class="p-3 bg-slate-50 rounded-lg border border-slate-150 space-y-1">
              <span class="text-[10px] text-slate-400 font-bold block">物理蓄能电池存储总限</span>
              <span class="text-base font-bold text-purple-650 font-mono">{{ selectedSite.essCapacity ? `${selectedSite.essCapacity} kWh` : '未部署' }}</span>
            </div>
          </div>
        </div>

        <!-- 关联角色与用户授权 (Dynamic relationship calculation!) -->
        <div class="space-y-3 pt-2">
          <div class="flex items-center gap-2 font-bold text-slate-800 border-b border-rose-100 pb-1 text-xs">
            <Users :size="14" class="text-blue-650" />
            <span>三、 当前站房数字授权持钥人员 ({{ authorizedUsers.length }} 位)</span>
          </div>

          <div v-if="authorizedUsers.length > 0" class="flex flex-wrap gap-2">
            <div 
              v-for="u in authorizedUsers" 
              :key="u.id"
              class="px-2 py-1.5 border border-slate-200 bg-slate-50 rounded-lg flex items-center gap-1.5 hover:bg-white transition"
            >
              <div class="h-5 w-5 rounded-full bg-[#005BAC] text-white flex items-center justify-center text-[9px] font-bold">
                {{ u.name[0] }}
              </div>
              <div class="leading-none">
                <span class="font-bold text-slate-800 block text-[10px]">{{ u.name }}</span>
                <span class="text-[9px] text-slate-400 mt-0.5 block">{{ u.role }}</span>
              </div>
            </div>
          </div>
          <div v-else class="p-4 rounded-xl border border-slate-100 bg-slate-50 text-center text-slate-450 text-xs">
            尚未给任何人员划分本监控站点的访问作用域，请去 [人员管理] 核发。
          </div>
        </div>

        <!-- 告警 -->
        <div class="space-y-3 pt-2">
          <div class="flex items-center justify-between font-bold text-slate-800 border-b border-rose-100 pb-1 text-xs">
            <span class="flex items-center gap-1.5">
              <BellOff :size="14" class="text-rose-600" />
              四、 关联运行中安全告警跟踪
            </span>
            <span class="text-[10px] text-slate-400 font-mono">24H 波动统计</span>
          </div>

          <div v-if="associatedAlarms.length > 0" class="space-y-2">
            <div 
              v-for="al in associatedAlarms" 
              :key="al.id"
              class="p-3 bg-red-50/30 border border-red-100 rounded-lg space-y-1 hover:bg-red-50/50 transition"
            >
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold text-slate-700">{{ al.device }}</span>
                <span class="text-[10px] font-mono text-red-600 font-bold">{{ al.level }}</span>
              </div>
              <p class="m-0 text-[11px] text-slate-550 leading-relaxed">{{ al.content }}</p>
              <span class="text-[9.5px] text-slate-400 block">{{ al.time }} • {{ al.status }}</span>
            </div>
          </div>
          <div v-else class="p-4 rounded-xl border border-slate-100 bg-emerald-50/20 text-center text-emerald-800 text-[10.5px] font-semibold flex items-center justify-center gap-1">
            <CheckCircle :size="13" class="text-emerald-600" />
            当前并网监测机组一切物理特征处于和谐区间，暂无告警。
          </div>
        </div>

        <!-- 尾部更新标记 -->
        <div class="text-[10.5px] text-slate-400 font-sans flex items-center gap-1.5 justify-center pt-6 border-t border-slate-100">
          <Clock :size="12" />
          <span>边缘网络最近遥测更新于: {{ currentTimeStampReady }}</span>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { globalStore } from '@/store';
import { message } from 'ant-design-vue';
import {
  Plus,
  Search,
  Upload,
  Download,
  Database,
  Info,
  Layers,
  ShieldAlert,
  Sliders,
  Users,
  BellOff,
  CheckCircle,
  Clock,
  Workflow
} from 'lucide-vue-next';

// 页面级状态过滤
const filters = reactive({
  name: '',
  code: '',
  region: undefined as string | undefined,
  status: undefined as '正常' | '预警' | '告警' | '离线' | '停用' | undefined,
  type: undefined as string | undefined
});

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 5
});

// 数据检索触发器
const executeSearch = () => {
  pagination.current = 1;
  message.success('已应用检索过滤，能效测站状态刷新成功。');
};

const resetAllFilters = () => {
  Object.assign(filters, {
    name: '',
    code: '',
    region: undefined,
    status: undefined,
    type: undefined
  });
  pagination.current = 1;
  message.info('重置全部关联多级站点检索。');
};

// 状态过滤后的站点
const filteredSites = computed(() => {
  return globalStore.sites.filter((site: any) => {
    let match = true;
    if (filters.name && !site.name.toLowerCase().includes(filters.name.toLowerCase())) {
      match = false;
    }
    if (filters.code && !site.code.toLowerCase().includes(filters.code.toLowerCase())) {
      match = false;
    }
    if (filters.region && site.region !== filters.region) {
      match = false;
    }
    if (filters.status && site.status !== filters.status) {
      match = false;
    }
    if (filters.type && site.type !== filters.type) {
      match = false;
    }
    return match;
  });
});

const totalPages = computed(() => {
  return Math.ceil(filteredSites.value.length / pagination.pageSize);
});

const paginatedSites = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize;
  return filteredSites.value.slice(start, start + pagination.pageSize);
});

const prevPage = () => {
  if (pagination.current > 1) pagination.current--;
};

const nextPage = () => {
  if (pagination.current < totalPages.value) pagination.current++;
};

// 快速数值统计
const activeSitesCount = computed(() => {
  return globalStore.sites.filter(s => s.status === '正常').length;
});

const alarmSitesCount = computed(() => {
  return globalStore.sites.filter(s => s.status === '预警' || s.status === '告警').length;
});

const totalPvCapacity = computed(() => {
  return globalStore.sites.reduce((sum, s) => sum + (s.pvCapacity || 0), 0);
});

const totalEssCapacity = computed(() => {
  return globalStore.sites.reduce((sum, s) => sum + (s.essCapacity || 0), 0);
});

// 样式对应转化 Map样式
const getTypeStyle = (type: string) => {
  switch (type) {
    case '光储充一体站':
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    case '光伏站':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case '储能站':
      return 'bg-purple-50 text-purple-700 border border-purple-200';
    case '充电站':
      return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
    default:
      return 'bg-slate-50 text-slate-700 border border-slate-200';
  }
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case '正常':
      return 'bg-emerald-50 text-emerald-700 border-emerald-250';
    case '预警':
      return 'bg-amber-50 text-amber-600 border-amber-200';
    case '告警':
      return 'bg-red-50 text-red-600 border-red-200';
    case '离线':
      return 'bg-slate-50 text-slate-500 border-slate-200';
    case '停用':
      return 'bg-zinc-50 text-zinc-650 border-zinc-200';
    default:
      return 'bg-stone-50 text-stone-600 border-stone-200';
  }
};

const getStatusDotStyle = (status: string) => {
  switch (status) {
    case '正常': return 'bg-emerald-500';
    case '预警': return 'bg-amber-500';
    case '告警': return 'bg-red-500 animate-ping';
    case '离线': return 'bg-slate-400';
    case '停用': return 'bg-zinc-550';
    default: return 'bg-stone-400';
  }
};

const getAccessStatusStyle = (access: string) => {
  switch (access) {
    case '已接入':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-150';
    case '部分接入':
      return 'bg-cyan-50/80 text-cyan-700 border border-cyan-200';
    case '未接入':
      return 'bg-slate-50 text-slate-400 border border-slate-150';
    default:
      return 'bg-slate-50 text-slate-500 border border-slate-150';
  }
};

// 直接下拉菜单变更状态 (具有极速反馈高保真)
const changeSiteStatusDirectly = (siteKey: string, newStatus: '正常' | '预警' | '告警' | '离线' | '停用') => {
  const found = globalStore.sites.find(s => s.key === siteKey);
  if (found) {
    found.status = newStatus;
    message.success(`站点【${found.name}】并网状态即时重置为: ${newStatus}`);
  }
};

// 弹窗表单状态
const isFormModalOpen = ref(false);
const siteForm = reactive({
  key: '',
  name: '',
  code: '',
  region: '华东区域',
  address: '',
  longitude: 114.0579,
  latitude: 22.5431,
  type: '光储充一体站',
  pvCapacity: 200,
  essCapacity: 500,
  chargerCount: 8,
  manager: '张建国',
  phone: '13800001111',
  thirdPartySynced: true,
  remark: ''
});

const openSiteFormModal = (item: any | null) => {
  if (item) {
    // 编辑
    Object.assign(siteForm, {
      key: item.key,
      name: item.name,
      code: item.code,
      region: item.region,
      address: item.address,
      longitude: item.longitude,
      latitude: item.latitude,
      type: item.type,
      pvCapacity: item.pvCapacity,
      essCapacity: item.essCapacity,
      chargerCount: item.chargerCount,
      manager: item.manager,
      phone: item.phone,
      thirdPartySynced: item.thirdPartySynced,
      remark: item.remark
    });
  } else {
    // 新增
    const mockId = Math.floor(100 + Math.random() * 899);
    Object.assign(siteForm, {
      key: '',
      name: '',
      code: `CECEP-REG-${mockId}`,
      region: '华东区域',
      address: '',
      longitude: 115.8234 + Math.random() * 2,
      latitude: 28.5234 + Math.random() * 2,
      type: '光储充一体站',
      pvCapacity: 300,
      essCapacity: 800,
      chargerCount: 12,
      manager: '张天豪',
      phone: '135' + Math.floor(10000000 + Math.random() * 90000000).toString().slice(-8),
      thirdPartySynced: true,
      remark: ''
    });
  }
  isFormModalOpen.value = true;
};

const saveSiteForm = () => {
  if (!siteForm.name || !siteForm.code || !siteForm.address || !siteForm.manager || !siteForm.phone) {
    message.error('测站名称、核定安全码、物理地址与联系人均为并网审查必填项！');
    return;
  }

  if (siteForm.key) {
    // 编辑保存
    const fIdx = globalStore.sites.findIndex(s => s.key === siteForm.key);
    if (fIdx !== -1) {
      globalStore.sites[fIdx] = {
        ...globalStore.sites[fIdx],
        name: siteForm.name,
        region: siteForm.region,
        address: siteForm.address,
        longitude: siteForm.longitude,
        latitude: siteForm.latitude,
        type: siteForm.type,
        pvCapacity: siteForm.pvCapacity || 0,
        essCapacity: siteForm.essCapacity || 0,
        chargerCount: siteForm.chargerCount || 0,
        manager: siteForm.manager,
        phone: siteForm.phone,
        thirdPartySynced: siteForm.thirdPartySynced,
        remark: siteForm.remark
      };
      message.success(`「${siteForm.name}」网格机组参数微调修订通过！`);
    }
  } else {
    // 新建
    const nKey = `site-0${globalStore.sites.length + 1}`;
    globalStore.sites.push({
      key: nKey,
      name: siteForm.name,
      code: siteForm.code,
      region: siteForm.region,
      address: siteForm.address,
      longitude: siteForm.longitude,
      latitude: siteForm.latitude,
      type: siteForm.type,
      pvCapacity: siteForm.pvCapacity || 0,
      essCapacity: siteForm.essCapacity || 0,
      chargerCount: siteForm.chargerCount || 0,
      deviceCount: Math.floor(10 + Math.random() * 10),
      status: '正常',
      accessStatus: '已接入',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      manager: siteForm.manager,
      phone: siteForm.phone,
      thirdPartySynced: siteForm.thirdPartySynced,
      remark: siteForm.remark
    });
    message.success(`全新物理站点「${siteForm.name}」初始化发布，遥测就绪！`);
  }
  isFormModalOpen.value = false;
};

const deleteSite = (siteKey: string) => {
  const f = globalStore.sites.find(s => s.key === siteKey);
  if (f) {
    globalStore.sites = globalStore.sites.filter(s => s.key !== siteKey);
    message.success(`物理测控站点【${f.name}】已被彻底除名并切除并网负载。`);
    // 自动变更新的活跃选定站，防止顶部崩溃
    if (globalStore.activeSiteKey === siteKey && globalStore.sites.length > 0) {
      globalStore.activeSiteKey = globalStore.sites[0].key;
    }
  }
};

const toggleSiteLock = (siteKey: string, doLock: boolean) => {
  const f = globalStore.sites.find(s => s.key === siteKey);
  if (f) {
    f.status = doLock ? '停用' : '正常';
    if (doLock) {
      message.warning(`站点【${f.name}】已实施软闭锁锁定！遥测数据停止下刷。`);
    } else {
      message.success(`站点【${f.name}】并网激活，心跳恢复正常。`);
    }
  }
};

// 抽屉详情查看相关
const isDrawerOpen = ref(false);
const selectedSite = ref<any>(null);

const openSiteDetailDrawer = (item: any) => {
  selectedSite.value = item;
  isDrawerOpen.value = true;
};

// 1. 动态关联被授权该站点的作业持钥人员
const authorizedUsers = computed(() => {
  if (!selectedSite.value) return [];
  const sKey = selectedSite.value.key;
  return globalStore.users.filter((u: any) => u.allowedSites && u.allowedSites.includes(sKey));
});

// 2. 动态关联该站点的当前活跃告警
const associatedAlarms = computed(() => {
  if (!selectedSite.value) return [];
  // 简明关联策略：告警的 device 或是 content 包含中节能某些文字，或者模糊匹配 site 名字
  // 我们也可以根据告警信息中的站点(如果存的话)来折算
  const sName = selectedSite.value.name.slice(0, 5); // 取前五个字匹配
  return globalStore.alarms.filter((a: any) => a.content.includes(sName) || a.device.includes(sName) || Math.random() > 0.65).slice(0, 2);
});

const currentTimeStampReady = computed(() => {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
});

// CSV 的纯前端高频物理下载
const exportToCSV = () => {
  let header = '站点名称,站点编码,区域,物理地址,类型,光伏装机(kWp),储能容量(kWh),直流枪桩数,运行状态,接入握手,负责人,注册时间\n';
  let body = globalStore.sites.map(s => {
    return `"${s.name}","${s.code}","${s.region}","${s.address}","${s.type}",${s.pvCapacity},${s.essCapacity},${s.chargerCount},"${s.status}","${s.accessStatus}","${s.manager}","${s.createdAt}"`;
  }).join('\n');

  const blob = new Blob(['\uFEFF' + header + body], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `CECEP_Sites_Export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  message.success('能流云端物理测站矩阵成功向您的本地存储核发 Excel-CSV 报表！');
};

// Simulated File Upload and Excel Parsing
const isImportModalOpen = ref(false);
const isTempFileLoaded = ref(false);

const triggerImportModal = () => {
  isTempFileLoaded.value = false;
  isImportModalOpen.value = true;
};

const simulateExcelSelection = () => {
  // 模拟选择 Excel 动作
  isTempFileLoaded.value = true;
  message.success('CECEP_Grid_Sites_2026.xlsx 文件模拟解析完毕，各子字段校验成功！');
};

const importBulkSamples = () => {
  if (!isTempFileLoaded.value) {
    message.warning('请先拖放或点击浏览并装载您的 EXCEL 配网清单文件。');
    return;
  }

  // 厦门站
  globalStore.sites.push({
    key: 'site-temp-xm',
    name: '中节能厦门海沧一体化示范站',
    code: 'CECEP-XM-009',
    region: '华南区域',
    address: '福建省厦门市海沧区海沧港一路',
    type: '光储充一体站',
    pvCapacity: 400,
    essCapacity: 1000,
    chargerCount: 16,
    deviceCount: 22,
    status: '正常',
    accessStatus: '已接入',
    createdAt: '2026-04-12 12:00:00',
    longitude: 118.0333,
    latitude: 24.4833,
    manager: '林家豪',
    phone: '13959218273',
    thirdPartySynced: true,
    remark: '华南港域绿色能流试点'
  });

  // 西安站
  globalStore.sites.push({
    key: 'site-temp-xa',
    name: '中节能西安航天城分布式光伏站',
    code: 'CECEP-XA-010',
    region: '西南区域',
    address: '陕西省西安市雁塔区航天中路',
    type: '光伏站',
    pvCapacity: 850,
    essCapacity: 0,
    chargerCount: 0,
    deviceCount: 12,
    status: '正常',
    accessStatus: '已接入',
    createdAt: '2026-05-01 09:15:00',
    longitude: 108.9486,
    latitude: 34.2631,
    manager: '杨光耀',
    phone: '13702938473',
    thirdPartySynced: true,
    remark: '自发自用余电上网项目'
  });

  // 济南站
  globalStore.sites.push({
    key: 'site-temp-jn',
    name: '中节能济南高新低碳调能电池站',
    code: 'CECEP-JN-011',
    region: '华东区域',
    address: '山东省济南市历下区龙奥北路',
    type: '储能站',
    pvCapacity: 0,
    essCapacity: 1600,
    chargerCount: 0,
    deviceCount: 14,
    status: '预警',
    accessStatus: '部分接入',
    createdAt: '2026-05-15 15:30:00',
    longitude: 117.0009,
    latitude: 36.6758,
    manager: '郭庆中',
    phone: '13612938487',
    thirdPartySynced: false,
    remark: '高新开发区虚拟电厂调控终端'
  });

  message.success('成功从 CECEP_Grid_Sites_2026.xlsx 一键落盘导入了比照的 3 个全新站点能流！');
  isImportModalOpen.value = false;
};
</script>

<style scoped>
/* 微调 antd number 宽度 */
:deep(.ant-input-number) {
  width: 100% !important;
}
</style>
