<template>
  <div class="patrol-plan-container">
    <!-- 侧边栏及主视图面包屑通过的基本容器 -->
    <div v-if="currentView === 'list'" class="space-y-6">
      <!-- 搜索头部卡片 -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div class="flex flex-wrap items-center gap-6">
          <div class="flex items-center gap-2">
            <span class="text-sm text-slate-500 font-medium shrink-0">电站选择：</span>
            <a-select
              v-model:value="searchSite"
              placeholder="请选择电站"
              style="width: 260px"
              allow-clear
              class="rounded-lg"
            >
              <a-select-option v-for="site in siteOptions" :key="site" :value="site">
                {{ site }}
              </a-select-option>
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

      <!-- 数据表格及操作栏 -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="p-6 border-b border-slate-150 flex items-center justify-between flex-wrap gap-4 bg-slate-50/50">
          <div class="flex items-center gap-3">
            <button @click="gotoAdd" class="px-4 py-2 bg-[#1890ff] hover:bg-[#40a9ff] text-white text-sm font-medium rounded-md shadow-sm transition cursor-pointer flex items-center gap-1.5">
              <Plus :size="16" /> 新增巡检计划
            </button>
            <button
              @click="handleBatchDelete"
              :disabled="selectedRowKeys.length === 0"
              class="px-4 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 text-sm font-medium rounded-md transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <Trash2 :size="15" /> 批量删除
            </button>
            <button @click="handleExport" class="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-medium rounded-md transition cursor-pointer flex items-center gap-1.5">
              <Download :size="15" /> 计划导出
            </button>
          </div>
          <div>
            <button @click="handleRefresh" class="p-2 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-md transition cursor-pointer" title="刷新表格">
              <RotateCw :size="16" />
            </button>
          </div>
        </div>

        <!-- 计划列表表格 -->
        <div class="overflow-x-auto w-full">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-150 select-none">
                <th class="p-4 w-12 text-center">
                  <a-checkbox :checked="isAllSelected" @change="toggleAllSelection" />
                </th>
                <th class="p-4">序号</th>
                <th class="p-4">电站名称</th>
                <th class="p-4">责任人</th>
                <th class="p-4">联系电话</th>
                <th class="p-4">巡检周期</th>
                <th class="p-4">计划结束时间</th>
                <th class="p-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr 
                v-for="(item, idx) in paginatedPlans" 
                :key="item.id" 
                class="hover:bg-slate-50/70 transition"
              >
                <td class="p-4 text-center">
                  <a-checkbox 
                    :checked="selectedRowKeys.includes(item.id)" 
                    @change="(e: any) => toggleRowSelection(item.id)" 
                  />
                </td>
                <td class="p-4 font-mono text-slate-500">
                  {{ (pagination.current - 1) * pagination.pageSize + idx + 1 }}
                </td>
                <td class="p-4 font-medium text-slate-800">
                  {{ item.siteName }}
                </td>
                <td class="p-4">
                  <div class="flex items-center gap-1.5">
                    <span class="h-6 w-6 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      {{ item.responsiblePerson.slice(0, 1) }}
                    </span>
                    <span>{{ item.responsiblePerson }}</span>
                  </div>
                </td>
                <td class="p-4 font-mono text-xs">
                  {{ item.phone }}
                </td>
                <td class="p-4">
                  <span class="px-2.5 py-1 bg-blue-50 text-blue-700 font-medium text-xs rounded-full border border-blue-100">
                    {{ item.interval }}
                  </span>
                </td>
                <td class="p-4 text-xs font-mono text-slate-500">
                  {{ item.endTime }}
                </td>
                <td class="p-4 text-center">
                  <div class="flex items-center justify-center gap-3">
                    <button @click="showDetails(item)" class="text-[#1890ff] hover:text-[#40a9ff] transition cursor-pointer text-xs font-medium">
                      详情
                    </button>
                    <button @click="gotoCopy(item)" class="text-[#1890ff] hover:text-[#40a9ff] transition cursor-pointer text-xs font-medium">
                      复制
                    </button>
                    <button @click="gotoEdit(item)" class="text-[#1890ff] hover:text-[#40a9ff] transition cursor-pointer text-xs font-medium">
                      修改
                    </button>
                    <button @click="confirmDelete(item.id)" class="text-red-500 hover:text-red-600 transition cursor-pointer text-xs font-medium">
                      删除
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredPlans.length === 0">
                <td colspan="8" class="text-center py-12 text-slate-400">
                  <div class="flex flex-col items-center justify-center gap-2">
                    <FolderOpen :size="36" class="text-slate-250" />
                    <span>无可匹配的巡检计划数据</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 底部分页 -->
        <div class="p-5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4 select-none">
          <div class="text-xs text-slate-500">
            共 <span class="font-bold text-slate-800">{{ filteredPlans.length }}</span> 条记录，每页
            <a-select v-model:value="pagination.pageSize" size="small" style="width: 80px;" class="mx-1">
              <a-select-option :value="5">5条/页</a-select-option>
              <a-select-option :value="10">10条/页</a-select-option>
              <a-select-option :value="20">20条/页</a-select-option>
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

    <!-- 计划详情模态窗 -->
    <a-modal
      v-model:open="detailModalOpen"
      :title="'巡检计划详情 - ' + selectedPlan?.id"
      :footer="null"
      width="680px"
    >
      <div v-if="selectedPlan" class="space-y-5 pt-3">
        <div class="grid grid-cols-2 gap-4 text-sm bg-slate-50/50 p-4 rounded-lg border border-slate-100">
          <div><span class="text-slate-400">电站名称：</span><span class="text-slate-800 font-semibold">{{ selectedPlan.siteName }}</span></div>
          <div><span class="text-slate-400">巡检周期：</span><span class="font-medium text-blue-600">{{ selectedPlan.interval }}</span></div>
          <div><span class="text-slate-400">主要责任人：</span><span class="text-slate-800">{{ selectedPlan.responsiblePerson }}</span></div>
          <div><span class="text-slate-400">联系电话：</span><span class="text-slate-800 font-mono">{{ selectedPlan.phone }}</span></div>
          <div><span class="text-slate-400">首次执行时间：</span><span class="text-slate-800">{{ selectedPlan.firstExecution }}</span></div>
          <div><span class="text-slate-400">循环次数限额：</span><span class="text-slate-800">{{ selectedPlan.cyclesCount }}次</span></div>
          <div><span class="text-slate-400">计划截止时间：</span><span class="text-slate-800">{{ selectedPlan.endTime }}</span></div>
          <div><span class="text-slate-400">关联提醒人：</span><span class="text-slate-800">{{ selectedPlan.extraReminders.join(', ') || '暂无提醒完成人' }}</span></div>
        </div>

        <div class="space-y-3">
          <div class="text-sm font-semibold text-slate-800 border-l-4 border-[#1890ff] pl-2 flex items-center justify-between">
            <span>巡检检查项目配置</span>
            <span class="text-[11px] text-slate-400 font-normal">共计 {{ selectedPlan.itemsGroup.pvModules.length + selectedPlan.itemsGroup.mounts.length }} 项巡检内容</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="border border-slate-150 rounded-lg p-3.5 bg-white">
              <span class="text-xs font-bold text-slate-800 block mb-2 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                <span class="h-2 w-2 rounded-full bg-emerald-500"></span> 1、组件情况
              </span>
              <ul class="space-y-1.5 text-xs text-slate-600">
                <li v-for="pi in selectedPlan.itemsGroup.pvModules" :key="pi" class="flex items-center gap-1.5">
                  <CheckSquare :size="13" class="text-slate-400" /> {{ pi }}
                </li>
              </ul>
            </div>

            <div class="border border-slate-150 rounded-lg p-3.5 bg-white">
              <span class="text-xs font-bold text-slate-800 block mb-2 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                <span class="h-2 w-2 rounded-full bg-[#1890ff]"></span> 2、支架情况
              </span>
              <ul class="space-y-1.5 text-xs text-slate-600">
                <li v-for="mi in selectedPlan.itemsGroup.mounts" :key="mi" class="flex items-center gap-1.5">
                  <CheckSquare :size="13" class="text-slate-400" /> {{ mi }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 新增 / 编辑巡检计划基本面板 -->
    <div v-if="currentView === 'add' || currentView === 'edit'" class="space-y-6">
      <div class="flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-sm border border-slate-100">
        <h2 class="text-base font-bold text-slate-800 m-0 flex items-center gap-1.5">
          <span class="h-4 w-1 bg-[#1890ff] rounded"></span>
          {{ currentView === 'add' ? '新增巡检计划' : '编辑巡检计划' }}
        </h2>
        <button @click="currentView = 'list'" class="flex items-center gap-1 text-xs text-slate-500 hover:text-[#1890ff] transition border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded cursor-pointer font-medium bg-white">
          <ArrowLeft :size="14" /> 返回上级页面
        </button>
      </div>

      <!-- 编辑主体 -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- 左侧：任务编辑区域 -->
        <div class="lg:col-span-5 bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-6 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between border-b border-slate-150 pb-3.5">
              <span class="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                <span class="h-2.5 w-2.5 bg-[#1890ff] rounded-full"></span> 任务检查项配置
              </span>
              <button @click="showAddItemPrompt" class="px-2.5 py-1 border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-600 text-xs font-medium rounded transition flex items-center gap-1 cursor-pointer">
                <Plus :size="13" /> 新增检查项
              </button>
            </div>

            <div class="space-y-6 mt-5 max-h-[480px] overflow-y-auto pr-1">
              <!-- 第一组 -->
              <div class="space-y-3">
                <h3 class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  1、组件情况
                </h3>
                <div class="space-y-2">
                  <div 
                    v-for="(item, idx) in formModel.itemsGroup.pvModules" 
                    :key="idx"
                    class="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition"
                  >
                    <span class="text-xs text-slate-700 font-medium">{{ item }}</span>
                    <div class="flex items-center gap-2">
                      <span class="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 font-bold border border-emerald-100 rounded">必填</span>
                      <button @click="removeFormItem('pvModules', idx)" class="text-slate-400 hover:text-red-500 transition cursor-pointer p-0.5">
                        <X :size="14" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 第二组 -->
              <div class="space-y-3 pt-2">
                <h3 class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  2、支架情况
                </h3>
                <div class="space-y-2">
                  <div 
                    v-for="(item, idx) in formModel.itemsGroup.mounts" 
                    :key="idx"
                    class="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition"
                  >
                    <span class="text-xs text-slate-700 font-medium">{{ item }}</span>
                    <div class="flex items-center gap-2">
                      <span class="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 font-bold border border-emerald-100 rounded">必填</span>
                      <button @click="removeFormItem('mounts', idx)" class="text-slate-400 hover:text-red-500 transition cursor-pointer p-0.5">
                        <X :size="14" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-100 pt-4 text-center select-none text-slate-400 text-xs font-medium">
            没有更多了
          </div>
        </div>

        <!-- 右侧：属性细节编辑区域 -->
        <div class="lg:col-span-12 xl:col-span-7 bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-6">
          <div class="border-b border-slate-150 pb-3.5">
            <span class="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
              <span class="h-2.5 w-2.5 bg-emerald-500 rounded-full"></span> 设置循环周期、起止时间
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
            <div class="space-y-1.5">
              <label class="text-xs text-slate-500 font-semibold block">循环周期：</label>
              <div class="flex items-center gap-2">
                <a-input v-model:value="formModel.intervalVal" placeholder="30" class="!w-full" />
                <a-select v-model:value="formModel.intervalUnit" style="width: 100px">
                  <a-select-option value="天">天</a-select-option>
                  <a-select-option value="周">周</a-select-option>
                  <a-select-option value="月">月</a-select-option>
                </a-select>
                <span class="text-xs text-slate-400 shrink-0">循环1次</span>
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs text-slate-500 font-semibold block">第一次任务执行时间：</label>
              <a-date-picker 
                v-model:value="formFirstExecDate" 
                show-time 
                placeholder="选择日期时间" 
                format="YYYY-MM-DD HH:mm:ss" 
                class="w-full" 
              />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs text-slate-500 font-semibold block">计划结束时间：</label>
              <div class="flex items-center gap-3">
                <a-radio-group v-model:value="formModel.endType">
                  <a-radio value="never">永不</a-radio>
                  <a-radio value="custom">指定时间</a-radio>
                </a-radio-group>
                <a-date-picker 
                  v-if="formModel.endType === 'custom'" 
                  v-model:value="formEndDate" 
                  format="YYYY-MM-DD" 
                  placeholder="选择截止日期" 
                  style="width: 160px"
                />
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs text-slate-500 font-semibold block">提醒时间 (提前天数)：</label>
              <div class="flex items-center gap-1.5">
                <a-input v-model:value="formModel.reminderTime" placeholder="3" style="width: 80px;" />
                <span class="text-xs text-slate-500">周期结束前自动提醒</span>
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs text-slate-500 font-semibold block">巡检总次数：</label>
              <div class="flex items-center">
                <button @click="formModel.cyclesCount = Math.max(1, formModel.cyclesCount - 1)" class="h-8 w-8 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-l border border-slate-300 font-bold transition flex items-center justify-center">-</button>
                <div class="h-8 px-4 border-t border-b border-slate-300 bg-white flex items-center justify-center text-xs font-semibold">{{ formModel.cyclesCount }}</div>
                <button @click="formModel.cyclesCount = formModel.cyclesCount + 1" class="h-8 w-8 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-r border border-slate-300 font-bold transition flex items-center justify-center">+</button>
              </div>
            </div>
          </div>

          <div class="border-b border-slate-150 pb-3.5 pt-4">
            <span class="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
              <span class="h-2.5 w-2.5 bg-[#62B32E] rounded-full"></span> 其他属性设置
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
            <div class="space-y-1.5">
              <label class="text-xs text-slate-500 font-semibold block">选择电站：</label>
              <a-select v-model:value="formModel.siteName" placeholder="请选择维护目标电站" class="w-full">
                <a-select-option v-for="site in rawSitesList" :key="site" :value="site">
                  {{ site }}
                </a-select-option>
              </a-select>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs text-slate-500 font-semibold block">主要责任人：</label>
              <a-select v-model:value="formModel.responsiblePerson" @change="syncLeaderPhone" placeholder="请选择责任人" class="w-full">
                <a-select-option v-for="user in usersList" :key="user.name" :value="user.name">
                  {{ user.name }} ({{ user.role }})
                </a-select-option>
              </a-select>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs text-slate-500 font-semibold block">联系电话：</label>
              <a-input v-model:value="formModel.phone" placeholder="联系手机号" class="w-full" />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs text-slate-500 font-semibold block">额外接收提醒人：</label>
              <a-select v-model:value="formModel.extraReminders" mode="multiple" placeholder="请选择在工作流中一并通知的同事" class="w-full">
                <a-select-option v-for="user in usersList" :key="user.name" :value="user.name">
                  {{ user.name }}
                </a-select-option>
              </a-select>
            </div>
          </div>

          <!-- 保存与取消 -->
          <div class="pt-6 border-t border-slate-100 flex items-center justify-end gap-3.5">
            <button @click="currentView = 'list'" class="px-6 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-semibold rounded-lg shadow-sm transition cursor-pointer">
              取消
            </button>
            <button @click="submitForm" class="px-7 py-2.5 bg-[#1890ff] hover:bg-[#40a9ff] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition cursor-pointer">
              保存
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 简易内嵌弹窗：添加检查项 -->
    <a-modal
      v-model:open="addItemModalOpen"
      title="新增检查内容"
      @ok="addCustomCheckItem"
      ok-text="确认添加"
      cancel-text="关闭"
    >
      <div class="space-y-4 pt-3 text-sm">
        <div class="space-y-1.5">
          <label class="text-xs text-slate-500 font-semibold block">归属分组：</label>
          <a-select v-model:value="newItemType" class="w-full">
            <a-select-option value="pvModules">1、组件情况</a-select-option>
            <a-select-option value="mounts">2、支架情况</a-select-option>
          </a-select>
        </div>
        <div class="space-y-1.5">
          <label class="text-xs text-slate-500 font-semibold block">检查指标描述：</label>
          <a-input v-model:value="newItemText" placeholder="请输入如：基础水泥墩是否有磨损破裂" />
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { patrolStore, PatrolPlanItem } from '@/store/patrol';
import { mockSites, mockUsers } from '@/mock/data';
import dayjs from 'dayjs';
import {
  Search,
  Plus,
  Trash2,
  Download,
  RotateCw,
  X,
  CheckSquare,
  ArrowLeft,
  FolderOpen
} from 'lucide-vue-next';

const currentView = ref<'list' | 'add' | 'edit'>('list');

// 过滤参数
const searchSite = ref<string | undefined>(undefined);
const filteredPlansList = ref<PatrolPlanItem[]>([]);

// 原始电站可选选项与用户组数据
const siteOptions = computed(() => {
  return [
    '中节能嘉兴秀洲 5MW 屋顶分布式光伏电站',
    '中节能绍兴柯桥 8MW 印染厂光储系统项目',
    '中节能湖州南浔 10MW 渔光互补光伏电站',
    '中节能杭州萧山生物医药园光储充示范项目'
  ];
});

const rawSitesList = siteOptions;

const usersList = computed(() => {
  return mockUsers;
});

// 表格多选
const selectedRowKeys = ref<string[]>([]);

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 5
});

const isAllSelected = computed(() => {
  if (filteredPlans.value.length === 0) return false;
  return filteredPlans.value.every(p => selectedRowKeys.value.includes(p.id));
});

const filteredPlans = computed(() => {
  if (!searchSite.value) {
    return patrolStore.plans;
  }
  return patrolStore.plans.filter(p => p.siteName.includes(searchSite.value as string));
});

const paginatedPlans = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize;
  return filteredPlans.value.slice(start, start + pagination.pageSize);
});

const totalPages = computed(() => {
  return Math.ceil(filteredPlans.value.length / pagination.pageSize) || 1;
});

// 重页码防护
watch(filteredPlans, () => {
  pagination.current = 1;
});

// 筛选搜索动作
const handleSearch = () => {
  message.success('筛选已生效');
};

const handleReset = () => {
  searchSite.value = undefined;
  message.info('筛选已重置');
};

const handleRefresh = () => {
  message.loading({ content: '正在同步最新计划列表...', duration: 0.5 })
    .then(() => {
      message.success('计划列表刷新完成');
    });
};

// 多选控制数
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
    // 全取消
    const visibleIds = filteredPlans.value.map(p => p.id);
    selectedRowKeys.value = selectedRowKeys.value.filter(id => !visibleIds.includes(id));
  } else {
    // 全选择可见项
    filteredPlans.value.forEach(p => {
      if (!selectedRowKeys.value.includes(p.id)) {
        selectedRowKeys.value.push(p.id);
      }
    });
  }
};

// 详情查看
const selectedPlan = ref<PatrolPlanItem | null>(null);
const detailModalOpen = ref(false);

const showDetails = (item: PatrolPlanItem) => {
  selectedPlan.value = item;
  detailModalOpen.value = true;
};

// 批量删除
const handleBatchDelete = () => {
  Modal.confirm({
    title: '批量删除确认',
    content: `确定要一并废除当前选中的 ${selectedRowKeys.value.length} 个巡检计划吗？此操作会导致周期工作流中断。`,
    okText: '确认废除',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      patrolStore.deletePlans(selectedRowKeys.value);
      selectedRowKeys.value = [];
      message.success('已批量废除对应巡检计划');
    }
  });
};

// 导出计划
const handleExport = () => {
  message.loading({ content: '正在打包并计算周期图纸，生成计划表...', duration: 1.5 })
    .then(() => {
      message.success('巡检计划导出成功！请查收系统发出的 Excel 单据。');
    });
};

// 删除单条计划
const confirmDelete = (id: string) => {
  Modal.confirm({
    title: '废除警告',
    content: '您确定要全面停止并删除该巡检工作流计划吗？这会阻断所有未完成的值班任务生成。',
    okText: '确认删除',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      patrolStore.deletePlan(id);
      message.success('巡检计划已成功销毁');
    }
  });
};

// 表单部分 State 变量
const formModel = ref({
  id: '',
  siteName: '',
  responsiblePerson: '',
  phone: '',
  intervalVal: '30',
  intervalUnit: '天',
  endType: 'never',
  reminderTime: '3',
  cyclesCount: 4,
  extraReminders: [] as string[],
  itemsGroup: {
    pvModules: [] as string[],
    mounts: [] as string[]
  }
});

const formFirstExecDate = ref<any>(null);
const formEndDate = ref<any>(null);

// 同步电话号码
const syncLeaderPhone = (name: string) => {
  const user = usersList.value.find(u => u.name === name);
  if (user) {
    formModel.value.phone = user.phone;
  }
};

// 自定义指标弹窗
const addItemModalOpen = ref(false);
const newItemType = ref<'pvModules' | 'mounts'>('pvModules');
const newItemText = ref('');

const showAddItemPrompt = () => {
  newItemText.value = '';
  addItemModalOpen.value = true;
};

const addCustomCheckItem = () => {
  if (!newItemText.value.trim()) {
    message.warning('请输入新检查指标的描述文本');
    return;
  }
  const t = newItemType.value;
  formModel.value.itemsGroup[t].push(newItemText.value.trim());
  addItemModalOpen.value = false;
  message.success('自定巡检指标配置成功');
};

const removeFormItem = (group: 'pvModules' | 'mounts', index: number) => {
  formModel.value.itemsGroup[group].splice(index, 1);
  message.info('检查项已剔除');
};

// 新增与编辑控制
const gotoAdd = () => {
  formModel.value = {
    id: `PLAN-${dayjs().format('YYYYMMDD')}-${String(patrolStore.plans.length + 1).padStart(3, '0')}`,
    siteName: rawSitesList.value[0],
    responsiblePerson: usersList.value[0].name,
    phone: usersList.value[0].phone,
    intervalVal: '30',
    intervalUnit: '天',
    endType: 'never',
    reminderTime: '3',
    cyclesCount: 5,
    extraReminders: [],
    itemsGroup: {
      pvModules: ['组件是否破损', '组件是否存在遮挡', '组件是否存在污染'],
      mounts: ['支架连接处是否松动', '水泥墩是否移位', '支架是否腐蚀']
    }
  };
  formFirstExecDate.value = dayjs();
  formEndDate.value = null;
  currentView.value = 'add';
};

const gotoEdit = (item: PatrolPlanItem) => {
  // 解析 interval 字符串
  const valMatch = item.interval.match(/\d+/);
  const unitMatch = item.interval.match(/[^\d]+/);

  formModel.value = {
    id: item.id,
    siteName: item.siteName,
    responsiblePerson: item.responsiblePerson,
    phone: item.phone,
    intervalVal: valMatch ? valMatch[0] : '30',
    intervalUnit: unitMatch ? unitMatch[0] : '天',
    endType: item.endTime === '永不' ? 'never' : 'custom',
    reminderTime: item.reminderTime,
    cyclesCount: item.cyclesCount,
    extraReminders: [...item.extraReminders],
    itemsGroup: {
      pvModules: [...item.itemsGroup.pvModules],
      mounts: [...item.itemsGroup.mounts]
    }
  };

  formFirstExecDate.value = dayjs(item.firstExecution);
  formEndDate.value = item.endTime === '永不' ? null : dayjs(item.endTime);
  currentView.value = 'edit';
};

const gotoCopy = (item: PatrolPlanItem) => {
  gotoEdit(item);
  // 更换 ID 改为复制模式
  formModel.value.id = `PLAN-${dayjs().format('YYYYMMDD')}-${String(patrolStore.plans.length + 1).padStart(3, '0')}-COPY`;
  currentView.value = 'add';
};

const submitForm = () => {
  if (!formModel.value.siteName) {
    message.error('请选择执行电站');
    return;
  }
  if (!formModel.value.phone) {
    message.error('请输入主要负责人联系电话');
    return;
  }
  if (!formModel.value.intervalVal) {
    message.error('请输入周期循环间隔');
    return;
  }

  const payload: PatrolPlanItem = {
    id: formModel.value.id,
    siteName: formModel.value.siteName,
    responsiblePerson: formModel.value.responsiblePerson,
    phone: formModel.value.phone,
    interval: `${formModel.value.intervalVal}${formModel.value.intervalUnit}`,
    endTime: formModel.value.endType === 'never' ? '永不' : (formEndDate.value ? formEndDate.value.format('YYYY-MM-DD') : '永不'),
    firstExecution: formFirstExecDate.value ? formFirstExecDate.value.format('YYYY-MM-DD HH:mm:ss') : dayjs().format('YYYY-MM-DD HH:mm:ss'),
    reminderTime: formModel.value.reminderTime || '3',
    cyclesCount: formModel.value.cyclesCount,
    extraReminders: formModel.value.extraReminders,
    itemsGroup: {
      pvModules: formModel.value.itemsGroup.pvModules,
      mounts: formModel.value.itemsGroup.mounts
    }
  };

  patrolStore.savePlan(payload);
  message.success(currentView.value === 'add' ? '新增全自动巡检计划成功！' : '修改巡检计划策略已生效');
  currentView.value = 'list';
};
</script>

<style scoped>
.patrol-plan-container {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
}
</style>
