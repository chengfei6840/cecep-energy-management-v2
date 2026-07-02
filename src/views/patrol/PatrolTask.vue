<template>
  <div class="patrol-task-container">
    <!-- 列表主页面 -->
    <div v-if="currentView === 'list'" class="space-y-6">
      <!-- 搜索查询卡片 -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div class="space-y-1.5 text-sm">
            <span class="text-xs text-slate-500 font-semibold block">电站选择：</span>
            <a-select
              v-model:value="searchQuery.siteName"
              placeholder="请输入或选择对应电站"
              style="width: 100%"
              allow-clear
            >
              <a-select-option v-for="site in siteOptions" :key="site" :value="site">
                {{ site }}
              </a-select-option>
            </a-select>
          </div>

          <div class="space-y-1.5 text-sm">
            <span class="text-xs text-slate-500 font-semibold block">巡检状态：</span>
            <a-select
              v-model:value="searchQuery.status"
              placeholder="请选择任务进行状态"
              style="width: 100%"
              allow-clear
            >
              <a-select-option value="未开始">未开始</a-select-option>
              <a-select-option value="未填写">未填写</a-select-option>
              <a-select-option value="已暂存">已暂存</a-select-option>
              <a-select-option value="已完成">已完成</a-select-option>
            </a-select>
          </div>

          <div class="flex items-center gap-3">
            <button @click="handleSearch" class="px-5 py-2 bg-[#1890ff] hover:bg-[#40a9ff] text-white text-sm font-medium rounded-md shadow-sm transition cursor-pointer flex items-center gap-1">
              <Search :size="15" /> 查询
            </button>
            <button @click="handleReset" class="px-5 py-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-sm font-medium rounded-md transition cursor-pointer">
              重置
            </button>
          </div>
        </div>
      </div>

      <!-- 操作与表格区 -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="p-6 border-b border-slate-150 flex items-center justify-between flex-wrap gap-4 bg-slate-50/50">
          <div class="flex items-center gap-3">
            <button
              @click="handleBatchDelete"
              :disabled="selectedRowKeys.length === 0"
              class="px-4 py-2 bg-red-50 text-red-600 border border-red-250 hover:bg-red-100 text-sm font-medium rounded-md transition cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Trash2 :size="15" /> 批量删除
            </button>
            <button @click="handleExport" class="px-4 py-2 bg-white hover:bg-slate-50 text-slate-705 border border-slate-200 text-sm font-medium rounded-md transition cursor-pointer flex items-center gap-1.5">
              <Download :size="15" /> 任务导出
            </button>
          </div>
          <div>
            <button @click="handleRefresh" class="p-2 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-md transition cursor-pointer" title="刷新任务">
              <RotateCw :size="16" />
            </button>
          </div>
        </div>

        <!-- 任务明细表 -->
        <div class="overflow-x-auto w-full">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-150 select-none">
                <th class="p-4 w-12 text-center whitespace-nowrap">
                  <a-checkbox :checked="isAllSelected" @change="toggleAllSelection" />
                </th>
                <th class="p-4 w-16 whitespace-nowrap">序号</th>
                <th class="p-4 whitespace-nowrap">电站名称</th>
                <th class="p-4 whitespace-nowrap">责任人</th>
                <th class="p-4 w-36 whitespace-nowrap">联系电话</th>
                <th class="p-4 text-center whitespace-nowrap">巡检状态</th>
                <th class="p-4 whitespace-nowrap">任务开始时间</th>
                <th class="p-4 whitespace-nowrap">任务结束时间</th>
                <th class="p-4 text-center whitespace-nowrap">任务详情</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr v-for="(item, idx) in paginatedTasks" :key="item.id" class="hover:bg-slate-50/70 transition">
                <td class="p-4 text-center whitespace-nowrap">
                  <a-checkbox 
                    :checked="selectedRowKeys.includes(item.id)" 
                    @change="(e: any) => toggleRowSelection(item.id)" 
                  />
                </td>
                <td class="p-4 font-mono text-slate-500 whitespace-nowrap">
                  {{ (pagination.current - 1) * pagination.pageSize + idx + 1 }}
                </td>
                <td class="p-4 font-medium text-slate-850">
                  {{ item.siteName }}
                </td>
                <td class="p-4 whitespace-nowrap">
                  <div class="flex items-center gap-1.5 flex-nowrap whitespace-nowrap">
                    <span class="h-6 w-6 rounded-full bg-[#1890ff]/10 text-[#1890ff] flex items-center justify-center font-bold text-xs shrink-0 select-none">
                      {{ item.responsiblePerson.slice(0, 1) }}
                    </span>
                    <span class="whitespace-nowrap">{{ item.responsiblePerson }}</span>
                  </div>
                </td>
                <td class="p-4 font-mono text-xs whitespace-nowrap">
                  {{ item.phone }}
                </td>
                <td class="p-4 text-center whitespace-nowrap">
                  <span 
                    class="px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap inline-flex items-center justify-center shrink-0"
                    :class="getStatusClass(item.status)"
                  >
                    {{ item.status }}
                  </span>
                </td>
                <td class="p-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                  {{ item.startTime }}
                </td>
                <td class="p-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                  {{ item.endTime }}
                </td>
                <td class="p-4 text-center whitespace-nowrap">
                  <div class="flex items-center justify-center gap-2 whitespace-nowrap">
                    <button 
                      v-if="item.status !== '已完成'"
                      @click="gotoFillTask(item)" 
                      class="text-xs font-bold text-[#1890ff] hover:text-[#40a9ff] transition cursor-pointer whitespace-nowrap shrink-0"
                    >
                      巡检人填写
                    </button>
                    <button 
                      v-else
                      @click="viewTaskDetails(item)" 
                      class="text-xs font-medium text-slate-500 hover:text-slate-850 transition cursor-pointer whitespace-nowrap shrink-0"
                    >
                      查看
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredTasks.length === 0">
                <td colspan="9" class="text-center py-12 text-slate-400">
                  <div class="flex flex-col items-center justify-center gap-2 select-none">
                    <Inbox :size="38" class="text-slate-250" />
                    <span>无可用的巡检任务安排</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div class="p-5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4 select-none">
          <div class="text-xs text-slate-500">
            共 <span class="font-bold text-slate-800">{{ filteredTasks.length }}</span> 条任务安排，每页
            <a-select v-model:value="pagination.pageSize" size="small" style="width: 80px;" class="mx-1">
              <a-select-option :value="5">5条/页</a-select-option>
              <a-select-option :value="10">10条/页</a-select-option>
            </a-select>
          </div>
          <div class="flex items-center gap-1.5">
            <button 
              @click="prevPage" 
              :disabled="pagination.current === 1" 
              class="px-2.5 py-1.5 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded transition disabled:opacity-45 disabled:cursor-not-allowed text-xs cursor-pointer"
            >
              上一页
            </button>
            <div class="flex items-center gap-1">
              <button 
                v-for="p in totalPages" 
                :key="p" 
                @click="pagination.current = p" 
                class="h-7 w-7 rounded flex items-center justify-center font-medium text-xs transition cursor-pointer"
                :class="pagination.current === p ? 'bg-[#1890ff] text-white shadow-sm' : 'border border-slate-200 hover:bg-slate-50 text-slate-600'"
              >
                {{ p }}
              </button>
            </div>
            <button 
              @click="nextPage" 
              :disabled="pagination.current === totalPages" 
              class="px-2.5 py-1.5 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded transition disabled:opacity-45 disabled:cursor-not-allowed text-xs cursor-pointer"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 填写巡检任务表单面板 -->
    <div v-if="currentView === 'fill' && activeTask" class="space-y-6">
      <div class="flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-sm border border-slate-100">
        <h2 class="text-base font-bold text-slate-800 m-0 flex items-center gap-2">
          <span class="h-4 w-1 bg-[#1890ff] rounded"></span>
          填写巡检任务
        </h2>
        <button @click="currentView = 'list'" class="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition border border-slate-200 hover:border-slate-350 px-3 py-1.5 rounded cursor-pointer bg-white">
          <ArrowLeft :size="14" /> 返回上级列表
        </button>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-6">
        <!-- 第次巡检信息栏 -->
        <div class="flex items-center justify-between border-b border-slate-150 pb-4 h-11">
          <span class="font-bold text-sm text-[#1890ff] flex items-center gap-1.5">
            <span class="h-2 w-2 rounded-full bg-[#1890ff]"></span> 任务项填写
          </span>
          <span class="text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            本次为第 <span class="text-blue-600 font-bold font-sans">{{ activeTask.currentCycleNum }}</span> / <span class="font-bold font-sans">{{ activeTask.totalCycles }}</span> 次巡检
          </span>
        </div>

        <!-- 1、组件情况分区 -->
        <div class="space-y-4">
          <div class="flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-100">
            <span class="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              1、组件情况
            </span>
            <div class="flex items-center gap-3">
              <span class="text-xs text-slate-400">是否需要巡检：</span>
              <a-radio-group v-model:value="formFill.pvModules.has" size="small">
                <a-radio :value="true">有</a-radio>
                <a-radio :value="false">无</a-radio>
              </a-radio-group>
            </div>
          </div>

          <div v-if="formFill.pvModules.has" class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <!-- 项组件是否破损 -->
            <div class="p-4 border border-slate-150 rounded-xl space-y-3 bg-white">
              <div class="text-xs font-semibold text-slate-800 leading-tight">组件是否破损</div>
              <div class="flex items-center gap-2">
                <button 
                  @click="formFill.pvModules.damage = '正常'"
                  class="flex-1 py-1.5 border rounded-lg text-xs font-medium cursor-pointer transition flex items-center justify-center gap-1"
                  :class="formFill.pvModules.damage === '正常' ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'"
                >
                  ✓ 正常
                </button>
                <button 
                  @click="formFill.pvModules.damage = '异常'"
                  class="flex-1 py-1.5 border rounded-lg text-xs font-medium cursor-pointer transition flex items-center justify-center gap-1"
                  :class="formFill.pvModules.damage === '异常' ? 'border-red-300 bg-red-50 text-red-600 font-bold' : 'border-slate-200 text-slate-500 hover:bg-slate-50'"
                >
                  ✗ 异常
                </button>
              </div>
            </div>

            <!-- 项组件是否存在遮挡 -->
            <div class="p-4 border border-slate-150 rounded-xl space-y-3 bg-white">
              <div class="text-xs font-semibold text-slate-800 leading-tight">组件是否存在遮挡</div>
              <div class="flex items-center gap-2">
                <button 
                  @click="formFill.pvModules.shadow = '正常'"
                  class="flex-1 py-1.5 border rounded-lg text-xs font-medium cursor-pointer transition flex items-center justify-center gap-1"
                  :class="formFill.pvModules.shadow === '正常' ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'"
                >
                  ✓ 正常
                </button>
                <button 
                  @click="formFill.pvModules.shadow = '异常'"
                  class="flex-1 py-1.5 border rounded-lg text-xs font-medium cursor-pointer transition flex items-center justify-center gap-1"
                  :class="formFill.pvModules.shadow === '异常' ? 'border-red-300 bg-red-50 text-red-600 font-bold' : 'border-slate-200 text-slate-500 hover:bg-slate-50'"
                >
                  ✗ 异常
                </button>
              </div>
            </div>

            <!-- 项组件是否存在污染 -->
            <div class="p-4 border border-slate-150 rounded-xl space-y-3 bg-white">
              <div class="text-xs font-semibold text-slate-800 leading-tight">组件是否存在污染</div>
              <div class="flex items-center gap-2">
                <button 
                  @click="formFill.pvModules.pollution = '正常'"
                  class="flex-1 py-1.5 border rounded-lg text-xs font-medium cursor-pointer transition flex items-center justify-center gap-1"
                  :class="formFill.pvModules.pollution === '正常' ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'"
                >
                  ✓ 正常
                </button>
                <button 
                  @click="formFill.pvModules.pollution = '异常'"
                  class="flex-1 py-1.5 border rounded-lg text-xs font-medium cursor-pointer transition flex items-center justify-center gap-1"
                  :class="formFill.pvModules.pollution === '异常' ? 'border-red-300 bg-red-50 text-red-600 font-bold' : 'border-slate-200 text-slate-500 hover:bg-slate-50'"
                >
                  ✗ 异常
                </button>
              </div>
            </div>
          </div>

          <!-- 现场照片上传 -->
          <div v-if="formFill.pvModules.has" class="border border-dashed border-slate-200 rounded-xl p-5 bg-slate-50/50">
            <span class="text-xs font-semibold text-slate-500 block mb-3">现场照片（最少1张，最多3张）：</span>
            <div class="flex flex-wrap items-center gap-4">
              <!-- 已保存/上传的照片 -->
              <div 
                v-for="(photo, pidx) in formFill.pvModules.photos" 
                :key="pidx"
                class="relative h-20 w-28 bg-black rounded-lg overflow-hidden border border-slate-200 shadow-sm transition group"
              >
                <img :src="photo" class="h-full w-full object-cover" referrerPolicy="no-referrer" />
                <button @click="removePhoto('pvModules', pidx)" class="absolute top-1 right-1 h-5 w-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition pointer cursor-pointer">
                  <X :size="12" />
                </button>
              </div>

              <!-- 上传按钮模态 -->
              <div 
                v-if="formFill.pvModules.photos.length < 3"
                @click="mockPhotoUpload('pvModules')"
                class="h-20 w-28 rounded-lg border-2 border-dashed border-slate-200 hover:border-blue-300 bg-white flex flex-col items-center justify-center cursor-pointer transition gap-1"
              >
                <Camera :size="20" class="text-slate-400" />
                <span class="text-[10px] text-slate-400 font-medium">点击添加照片</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 2、支架情况分区 -->
        <div class="space-y-4 pt-4">
          <div class="flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-100">
            <span class="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              2、支架情况
            </span>
            <div class="flex items-center gap-3">
              <span class="text-xs text-slate-400">是否需要巡检：</span>
              <a-radio-group v-model:value="formFill.mounts.has" size="small">
                <a-radio :value="true">有</a-radio>
                <a-radio :value="false">无</a-radio>
              </a-radio-group>
            </div>
          </div>

          <div v-if="formFill.mounts.has" class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <!-- 项安全支架连接 -->
            <div class="p-4 border border-slate-150 rounded-xl space-y-3 bg-white">
              <div class="text-xs font-semibold text-slate-800 leading-tight">支架连接处是否松动</div>
              <div class="flex items-center gap-2">
                <button 
                  @click="formFill.mounts.loose = '正常'"
                  class="flex-1 py-1.5 border rounded-lg text-xs font-medium cursor-pointer transition flex items-center justify-center gap-1"
                  :class="formFill.mounts.loose === '正常' ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'"
                >
                  ✓ 正常
                </button>
                <button 
                  @click="formFill.mounts.loose = '异常'"
                  class="flex-1 py-1.5 border rounded-lg text-xs font-medium cursor-pointer transition flex items-center justify-center gap-1"
                  :class="formFill.mounts.loose === '异常' ? 'border-red-300 bg-red-50 text-red-600 font-bold' : 'border-slate-200 text-slate-500 hover:bg-slate-50'"
                >
                  ✗ 异常
                </button>
              </div>
            </div>

            <!-- 水泥墩 -->
            <div class="p-4 border border-slate-150 rounded-xl space-y-3 bg-white">
              <div class="text-xs font-semibold text-slate-800 leading-tight">水泥墩是否移位</div>
              <div class="flex items-center gap-2">
                <button 
                  @click="formFill.mounts.offset = '正常'"
                  class="flex-1 py-1.5 border rounded-lg text-xs font-medium cursor-pointer transition flex items-center justify-center gap-1"
                  :class="formFill.mounts.offset === '正常' ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'"
                >
                  ✓ 正常
                </button>
                <button 
                  @click="formFill.mounts.offset = '异常'"
                  class="flex-1 py-1.5 border rounded-lg text-xs font-medium cursor-pointer transition flex items-center justify-center gap-1"
                  :class="formFill.mounts.offset === '异常' ? 'border-red-300 bg-red-50 text-red-600 font-bold' : 'border-slate-200 text-slate-500 hover:bg-slate-50'"
                >
                  ✗ 异常
                </button>
              </div>
            </div>

            <!-- 支架腐蚀 -->
            <div class="p-4 border border-slate-150 rounded-xl space-y-3 bg-white">
              <div class="text-xs font-semibold text-slate-800 leading-tight">支架是否腐蚀</div>
              <div class="flex items-center gap-2">
                <button 
                  @click="formFill.mounts.corrosion = '正常'"
                  class="flex-1 py-1.5 border rounded-lg text-xs font-medium cursor-pointer transition flex items-center justify-center gap-1"
                  :class="formFill.mounts.corrosion === '正常' ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'"
                >
                  ✓ 正常
                </button>
                <button 
                  @click="formFill.mounts.corrosion = '异常'"
                  class="flex-1 py-1.5 border rounded-lg text-xs font-medium cursor-pointer transition flex items-center justify-center gap-1"
                  :class="formFill.mounts.corrosion === '异常' ? 'border-red-300 bg-red-50 text-red-600 font-bold' : 'border-slate-200 text-slate-500 hover:bg-slate-50'"
                >
                  ✗ 异常
                </button>
              </div>
            </div>
          </div>

          <!-- 现场照片上传 -->
          <div v-if="formFill.mounts.has" class="border border-dashed border-slate-200 rounded-xl p-5 bg-slate-50/50">
            <span class="text-xs font-semibold text-slate-500 block mb-3">现场照片（最少1张，最多3张）：</span>
            <div class="flex flex-wrap items-center gap-4">
              <!-- 已保存/上传的照片 -->
              <div 
                v-for="(photo, pidx) in formFill.mounts.photos" 
                :key="pidx"
                class="relative h-20 w-28 bg-black rounded-lg overflow-hidden border border-slate-200 shadow-sm transition group"
              >
                <img :src="photo" class="h-full w-full object-cover" referrerPolicy="no-referrer" />
                <button @click="removePhoto('mounts', pidx)" class="absolute top-1 right-1 h-5 w-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition cursor-pointer">
                  <X :size="12" />
                </button>
              </div>

              <!-- 上传按钮模态 -->
              <div 
                v-if="formFill.mounts.photos.length < 3"
                @click="mockPhotoUpload('mounts')"
                class="h-20 w-28 rounded-lg border-2 border-dashed border-slate-200 hover:border-blue-300 bg-white flex flex-col items-center justify-center cursor-pointer transition gap-1"
              >
                <Camera :size="20" class="text-slate-400" />
                <span class="text-[10px] text-slate-400 font-medium">点击添加照片</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between border-t border-slate-100 pt-5">
          <span class="text-xs text-slate-400 font-medium">
            共 <span class="font-bold text-slate-700">2</span> 个任务组 / <span class="font-bold text-slate-700">6</span> 个核心巡检项
          </span>
          <div class="flex items-center gap-3">
            <button @click="submitTaskForm(true)" class="px-5 py-2.5 bg-white border border-slate-250 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg shadow-sm transition cursor-pointer">
              暂存并退出
            </button>
            <button @click="submitTaskForm(false)" class="px-6 py-2.5 bg-[#1890ff] hover:bg-[#40a9ff] text-white font-bold rounded-lg shadow-md transition cursor-pointer">
              提交巡检结果
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { patrolStore, PatrolTaskItem } from '@/store/patrol';
import {
  Search,
  Trash2,
  Download,
  RotateCw,
  Inbox,
  ArrowLeft,
  Camera,
  X
} from 'lucide-vue-next';

const currentView = ref<'list' | 'fill'>('list');

const searchQuery = reactive({
  siteName: undefined as string | undefined,
  status: undefined as string | undefined
});

const siteOptions = computed(() => {
  return [
    '中节能嘉兴秀洲 5MW 屋顶分布式光伏电站',
    '中节能绍兴柯桥 8MW 印染厂光储系统项目',
    '中节能湖州南浔 10MW 渔光互补光伏电站',
    '中节能杭州萧山生物医药园光储充示范项目'
  ];
});

// 分页与多选
const selectedRowKeys = ref<string[]>([]);
const pagination = reactive({
  current: 1,
  pageSize: 5
});

const filteredTasks = computed(() => {
  return patrolStore.tasks.filter(t => {
    let match = true;
    if (searchQuery.siteName && !t.siteName.includes(searchQuery.siteName)) {
      match = false;
    }
    if (searchQuery.status && t.status !== searchQuery.status) {
      match = false;
    }
    return match;
  });
});

const paginatedTasks = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize;
  return filteredTasks.value.slice(start, start + pagination.pageSize);
});

const totalPages = computed(() => {
  return Math.ceil(filteredTasks.value.length / pagination.pageSize) || 1;
});

watch(filteredTasks, () => {
  pagination.current = 1;
});

// 多选控制
const isAllSelected = computed(() => {
  if (filteredTasks.value.length === 0) return false;
  return filteredTasks.value.every(t => selectedRowKeys.value.includes(t.id));
});

const toggleRowSelection = (id: string) => {
  const index = selectedRowKeys.value.indexOf(id);
  if (index !== -1) {
    selectedRowKeys.value.splice(index, 1);
  } else {
    selectedRowKeys.value.push(id);
  }
};

const toggleAllSelection = () => {
  if (isAllSelected.value) {
    const visibleIds = filteredTasks.value.map(t => t.id);
    selectedRowKeys.value = selectedRowKeys.value.filter(id => !visibleIds.includes(id));
  } else {
    filteredTasks.value.forEach(t => {
      if (!selectedRowKeys.value.includes(t.id)) {
        selectedRowKeys.value.push(t.id);
      }
    });
  }
};

// 状态标签色彩样式
const getStatusClass = (status: string) => {
  if (status === '已完成') return 'bg-emerald-50 text-emerald-700 border-emerald-150';
  if (status === '已暂存') return 'bg-blue-50 text-blue-700 border-blue-150';
  if (status === '未填写') return 'bg-red-50 text-red-600 border-red-150';
  return 'bg-slate-100 text-slate-500 border-slate-200';
};

// 操作事件
const handleSearch = () => {
  message.success('查询生效');
};

const handleReset = () => {
  searchQuery.siteName = undefined;
  searchQuery.status = undefined;
  message.info('重置过滤条件');
};

const handleRefresh = () => {
  message.loading({ content: '任务明细更新中...', duration: 0.5 }).then(() => {
    message.success('最新派工任务已抓取');
  });
};

const handleBatchDelete = () => {
  Modal.confirm({
    title: '删除动作警告',
    content: `您确定要批量抹掉历史上的这 ${selectedRowKeys.value.length} 条巡检工序任务吗？`,
    okText: '彻底删除',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      patrolStore.deleteTasks(selectedRowKeys.value);
      selectedRowKeys.value = [];
      message.success('已删除选定任务指令');
    }
  });
};

const handleExport = () => {
  message.loading({ content: '正在打包压缩并流转导出数据至下载通道...', duration: 1.0 }).then(() => {
    message.success('巡检派工清单导出完成');
  });
};

// 任务编辑与填写机制
const activeTask = ref<PatrolTaskItem | null>(null);

const formFill = ref({
  pvModules: {
    has: true,
    damage: '正常' as '正常' | '异常',
    shadow: '正常' as '正常' | '异常',
    pollution: '正常' as '正常' | '异常',
    photos: [] as string[]
  },
  mounts: {
    has: true,
    loose: '正常' as '正常' | '异常',
    offset: '正常' as '正常' | '异常',
    corrosion: '正常' as '正常' | '异常',
    photos: [] as string[]
  }
});

const gotoFillTask = (task: PatrolTaskItem) => {
  activeTask.value = task;
  if (task.details) {
    // 带有暂存细节
    formFill.value = {
      pvModules: {
        has: task.details.pvModules.has,
        damage: task.details.pvModules.damage,
        shadow: task.details.pvModules.shadow,
        pollution: task.details.pvModules.pollution,
        photos: [...task.details.pvModules.photos]
      },
      mounts: {
        has: task.details.mounts.has,
        loose: task.details.mounts.loose,
        offset: task.details.mounts.offset,
        corrosion: task.details.mounts.corrosion,
        photos: [...task.details.mounts.photos]
      }
    };
  } else {
    // 全新填写
    formFill.value = {
      pvModules: {
        has: true,
        damage: '正常',
        shadow: '正常',
        pollution: '正常',
        photos: []
      },
      mounts: {
        has: true,
        loose: '正常',
        offset: '正常',
        corrosion: '正常',
        photos: []
      }
    };
  }
  currentView.value = 'fill';
};

const viewTaskDetails = (task: PatrolTaskItem) => {
  message.info(`该任务已于最近归档。如需查看，请通过“巡检记录”进行精准调阅。`);
};

// 预设的高灵敏图表照片以供模拟上传
const MOCK_PV_PHOTOS = [
  'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1620038650424-8547d27e77db?w=600&auto=format&fit=crop&q=80'
];

const MOCK_MOUNT_PHOTOS = [
  'https://images.unsplash.com/photo-1536852966563-3fd1e5b56853?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&auto=format&fit=crop&q=80'
];

const mockPhotoUpload = (group: 'pvModules' | 'mounts') => {
  message.loading({ content: '正在调用现场硬件及摄像头自锁测试...', duration: 0.5 }).then(() => {
    const list = group === 'pvModules' ? MOCK_PV_PHOTOS : MOCK_MOUNT_PHOTOS;
    const currentLength = formFill.value[group].photos.length;
    
    if (currentLength < list.length) {
      formFill.value[group].photos.push(list[currentLength]);
      message.success('高清现场照片上传并进行了防伪校验！');
    } else {
      formFill.value[group].photos.push('https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80');
      message.success('高清现场照片上传成功！');
    }
  });
};

const removePhoto = (group: 'pvModules' | 'mounts', index: number) => {
  formFill.value[group].photos.splice(index, 1);
  message.info('照片已移除');
};

const submitTaskForm = (isDraft: boolean) => {
  if (!activeTask.value) return;

  if (!isDraft) {
    // 强制校验必须要有现场照片
    if (formFill.value.pvModules.has && formFill.value.pvModules.photos.length === 0) {
      message.error('提交失败：请至少上传一张组件情况下的现场佐证照片');
      return;
    }
    if (formFill.value.mounts.has && formFill.value.mounts.photos.length === 0) {
      message.error('提交失败：请至少上传一张支架情况下的现场佐证照片');
      return;
    }
  }

  patrolStore.submitTask(activeTask.value.id, formFill.value, isDraft);
  
  if (isDraft) {
    message.success('草稿数据已暂存于云端安全容器。');
  } else {
    message.success('巡检表单提交成功！系统已同步流转至“巡检记录”中生成正式台账。');
  }
  currentView.value = 'list';
};

const prevPage = () => {
  if (pagination.current > 1) pagination.current--;
};

const nextPage = () => {
  if (pagination.current < totalPages.value) pagination.current++;
};
</script>

<style scoped>
.patrol-task-container {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
</style>
