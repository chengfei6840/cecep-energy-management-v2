<template>
  <div class="patrol-record-container">
    <!-- 1、列表主视图 -->
    <div v-if="!activeRecordDetail" class="space-y-6">
      <!-- 过滤卡片 -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div class="space-y-1.5 text-sm">
            <span class="text-xs text-slate-500 font-semibold block">电站选择：</span>
            <a-select
              v-model:value="searchQuery.siteName"
              placeholder="请选择对应检验电站"
              style="width: 100%"
              allow-clear
            >
              <a-select-option v-for="site in siteOptions" :key="site" :value="site">
                {{ site }}
              </a-select-option>
            </a-select>
          </div>

          <div class="space-y-1.5 text-sm">
            <span class="text-xs text-slate-500 font-semibold block">判定状态：</span>
            <a-select
              v-model:value="searchQuery.status"
              placeholder="判定结果"
              style="width: 100%"
              allow-clear
            >
              <a-select-option value="正常">正常合格</a-select-option>
              <a-select-option value="异常">异常隐患</a-select-option>
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

      <!-- 表格操作区 -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="p-6 border-b border-slate-150 flex items-center justify-between flex-wrap gap-4 bg-slate-50/50">
          <div class="flex items-center gap-3">
            <button
              @click="handleBatchDelete"
              :disabled="selectedRowKeys.length === 0"
              class="px-4 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 text-sm font-medium rounded-md transition cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Trash2 :size="15" /> 批量删除
            </button>
            <button @click="handleExport" class="px-4 py-2 bg-white hover:bg-slate-50 text-slate-705 border border-slate-200 text-sm font-medium rounded-md transition cursor-pointer flex items-center gap-1.5">
              <Download :size="15" /> 记录导出
            </button>
          </div>
          <div>
            <button @click="handleRefresh" class="p-2 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-md transition cursor-pointer" title="刷新表格">
              <RotateCw :size="16" />
            </button>
          </div>
        </div>

        <!-- 数据表格 -->
        <div class="overflow-x-auto w-full">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-150 select-none">
                <th class="p-4 w-12 text-center pointer-events-auto">
                  <a-checkbox :checked="isAllSelected" @change="toggleAllSelection" />
                </th>
                <th class="p-4 w-16">序号</th>
                <th class="p-4">电站名称</th>
                <th class="p-4">巡检时间</th>
                <th class="p-4">主负责人</th>
                <th class="p-4 text-center">综合状态</th>
                <th class="p-4">巡检站址</th>
                <th class="p-4">主管签字审核</th>
                <th class="p-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr v-for="(item, idx) in paginatedRecords" :key="item.id" class="hover:bg-slate-50/70 transition">
                <td class="p-4 text-center">
                  <a-checkbox 
                    :checked="selectedRowKeys.includes(item.id)" 
                    @change="(e: any) => toggleRowSelection(item.id)" 
                  />
                </td>
                <td class="p-4 font-mono text-slate-500">
                  {{ (pagination.current - 1) * pagination.pageSize + idx + 1 }}
                </td>
                <td class="p-4 font-medium text-slate-850">
                  {{ item.siteName }}
                </td>
                <td class="p-4 font-mono text-xs">
                  {{ item.patrolTime }}
                </td>
                <td class="p-4">
                  <div class="flex items-center gap-1.5">
                    <span class="h-6 w-6 rounded-full bg-[#1890ff]/10 text-[#1890ff] flex items-center justify-center font-bold text-xs">
                      {{ item.responsiblePerson.slice(0, 1) }}
                    </span>
                    <span>{{ item.responsiblePerson }}</span>
                  </div>
                </td>
                <td class="p-4 text-center">
                  <span 
                    class="px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center justify-center gap-1.5 w-24 mx-auto"
                    :class="item.status === '正常' ? 'bg-emerald-50 text-emerald-700 border-emerald-250' : 'bg-red-50 text-red-600 border-red-250'"
                  >
                    <span class="h-1.5 w-1.5 rounded-full" :class="item.status === '正常' ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'"></span>
                    {{ item.status === '正常' ? '正常合格' : '异常警告' }}
                  </span>
                </td>
                <td class="p-4 text-xs text-slate-500 truncate max-w-[180px]" :title="item.address">
                  {{ item.address }}
                </td>
                <td class="p-4">
                  <div class="flex items-center gap-1.5">
                    <span v-if="item.signatureManager !== '待签名'" class="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                      ✓ 已签字 ({{ item.signatureManager }})
                    </span>
                    <span v-else class="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <span class="h-1.5 w-1.5 rounded-full bg-amber-400"></span> 待审核签名
                    </span>
                  </div>
                </td>
                <td class="p-4 text-center">
                  <div class="flex items-center justify-center gap-3">
                    <button @click="showDetailPanel(item)" class="text-xs font-bold text-[#1890ff] hover:text-[#40a9ff] transition cursor-pointer">
                      详情
                    </button>
                    <button 
                      v-if="item.signatureManager === '待签名'"
                      @click="quickSign(item.id)" 
                      class="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition cursor-pointer"
                    >
                      极速签名
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredRecords.length === 0">
                <td colspan="9" class="text-center py-12 text-slate-400">
                  <div class="flex flex-col items-center justify-center gap-2 select-none">
                    <History :size="38" class="text-slate-250" />
                    <span>无可查找的巡检历史台账</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 底部分页 -->
        <div class="p-5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4 select-none">
          <div class="text-xs text-slate-500">
            共 <span class="font-bold text-slate-800">{{ filteredRecords.length }}</span> 份历史台账，每页
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

    <!-- 2、高精度 B 端 “中节能智能光储巡检结果单” 详情报告单 -->
    <div v-if="activeRecordDetail" class="space-y-6">
      <div class="flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-sm border border-slate-100">
        <h2 class="text-base font-bold text-slate-800 m-0 flex items-center gap-2 select-none">
          <span class="h-4 w-1 bg-[#1890ff] rounded"></span>
          单据流转审计报告
        </h2>
        <button @click="activeRecordDetail = null" class="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition border border-slate-200 hover:border-slate-350 px-3 py-1.5 rounded cursor-pointer bg-white">
          <ArrowLeft :size="14" /> 返回记录列表
        </button>
      </div>

      <!-- 单据纸张容器 -->
      <div class="bg-white p-8 md:p-12 rounded-2xl shadow-md border border-slate-150 max-w-4xl mx-auto relative overflow-hidden">
        <!-- 侧边或者角落的合格/不合格彩色仿伪防窜改水墨印章效果 -->
        <div class="absolute top-10 right-10 select-none pointer-events-none transform rotate-12 transition">
          <div 
            v-if="activeRecordDetail.status === '正常'" 
            class="border-4 border-emerald-500/65 text-emerald-500 font-bold uppercase tracking-widest text-sm px-4 py-2 rounded-xl bg-emerald-50/20 shadow-inner flex flex-col items-center justify-center h-20 w-32 border-dashed"
          >
            <span class="text-xs font-medium">CECEP检定</span>
            <span class="text-lg tracking-wider font-extrabold pb-0.5">合格验收</span>
          </div>
          <div 
            v-else 
            class="border-4 border-red-500/65 text-red-500 font-bold uppercase tracking-widest text-sm px-4 py-2 rounded-xl bg-red-50/20 shadow-inner flex flex-col items-center justify-center h-20 w-32 border-dashed"
          >
            <span class="text-xs font-medium">CECEP监控</span>
            <span class="text-lg tracking-wider font-extrabold pb-0.5 animate-pulse">隐患待排</span>
          </div>
        </div>

        <!-- 标题头 -->
        <div class="text-center space-y-2 border-b-2 border-slate-850 pb-6 select-none">
          <h1 class="text-lg md:text-xl font-extrabold text-[#111827] tracking-wider m-0">
            中国节能 CECEP 光储充一体化智慧巡检单
          </h1>
          <div class="text-[11px] font-mono text-slate-400 flex items-center justify-center gap-2">
            <span>记录编号: {{ activeRecordDetail.id }}</span>
            <span>|</span>
            <span>报告生成: 安全可控工作流容器</span>
          </div>
        </div>

        <!-- 基本报告信息表单格子，高拟真度 -->
        <div class="grid grid-cols-1 md:grid-cols-2 border border-slate-200 text-xs bg-slate-50/30 mt-8 rounded-lg overflow-hidden shrink-0">
          <div class="p-3 border-r border-b border-slate-200">
            <span class="text-slate-400 font-medium">巡检站点：</span>
            <span class="text-slate-850 font-bold">{{ activeRecordDetail.siteName }}</span>
          </div>
          <div class="p-3 border-b border-slate-200">
            <span class="text-slate-400 font-medium">巡检日期：</span>
            <span class="text-slate-850 font-mono">{{ activeRecordDetail.patrolTime }}</span>
          </div>
          <div class="p-3 border-r border-b md:border-b-0 border-slate-200">
            <span class="text-slate-400 font-medium">现场主负责人：</span>
            <span class="text-slate-850 font-semibold">{{ activeRecordDetail.responsiblePerson }}</span>
          </div>
          <div class="p-3 border-slate-200 border-b md:border-b-0">
            <span class="text-slate-400 font-medium">报告判定：</span>
            <span 
              class="font-extrabold"
              :class="activeRecordDetail.status === '正常' ? 'text-emerald-700' : 'text-red-600'"
            >
              {{ activeRecordDetail.status === '正常' ? '全流程闭环及合格' : '发现局地设备存在隐患异常' }}
            </span>
          </div>
          <div class="p-3 md:col-span-2 border-t border-slate-200">
            <span class="text-slate-400 font-medium">电站地理位置：</span>
            <span class="text-slate-700">{{ activeRecordDetail.address }}</span>
          </div>
        </div>

        <!-- 运维参与组员多列小表 -->
        <div class="mt-8 space-y-3">
          <div class="text-xs font-bold text-slate-800 border-l-4 border-slate-800 pl-2">
            现场值守与巡回运维人员台账
          </div>
          <table class="w-full text-left border-collapse border border-slate-150 text-[11px] rounded-lg overflow-hidden">
            <thead>
              <tr class="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                <th class="p-2.5 w-16 text-center">序号</th>
                <th class="p-2.5">陪练/巡回人员姓名</th>
                <th class="p-2.5">执勤联系电话</th>
                <th class="p-2.5">执照身份标签</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-150 text-slate-700">
              <tr v-for="staff in activeRecordDetail.staffPhoneTable" :key="staff.index" class="hover:bg-slate-50/50 transition">
                <td class="p-2.5 text-center font-mono text-slate-500">{{ staff.index }}</td>
                <td class="p-2.5 font-semibold text-slate-850">{{ staff.name }}</td>
                <td class="p-2.5 font-mono">{{ staff.phone }}</td>
                <td class="p-2.5 text-slate-500">
                  {{ staff.index === 1 ? '工作流主要签署人' : '安全随行复校员' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 各核心单项判定结果 -->
        <div class="mt-8 space-y-4">
          <div class="text-xs font-bold text-slate-800 border-l-4 border-slate-800 pl-2">
            安全专项检查项目执行判定详情
          </div>

          <!-- 分部详情 A -->
          <div class="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
            <div class="flex items-center justify-between border-b border-slate-100 pb-2">
              <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span class="h-2 w-2 rounded-full bg-emerald-500"></span> 1、组件组串健康体检测量
              </span>
              <span class="text-[10px] text-slate-400">核查3个子项</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div class="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-100">
                <span class="text-slate-500">组件是否有形体破损：</span>
                <span class="font-extrabold" :class="activeRecordDetail.details.pvModules.damage === '正常' ? 'text-emerald-600' : 'text-red-500'">
                  {{ activeRecordDetail.details.pvModules.damage }}
                </span>
              </div>
              <div class="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-100">
                <span class="text-slate-500">组件是否存在阴影遮挡：</span>
                <span class="font-extrabold" :class="activeRecordDetail.details.pvModules.shadow === '正常' ? 'text-emerald-600' : 'text-red-500'">
                  {{ activeRecordDetail.details.pvModules.shadow }}
                </span>
              </div>
              <div class="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-100">
                <span class="text-slate-500">组件是否存在鸟粪表面污染：</span>
                <span class="font-extrabold" :class="activeRecordDetail.details.pvModules.pollution === '正常' ? 'text-emerald-600' : 'text-red-500'">
                  {{ activeRecordDetail.details.pvModules.pollution }}
                </span>
              </div>
            </div>

            <!-- 照片列表 -->
            <div v-if="activeRecordDetail.details.pvModules.photos.length > 0" class="pt-2">
              <span class="text-[10px] text-slate-400 block mb-2 font-medium">现场固态物证图像（组件情况）：</span>
              <div class="flex flex-wrap gap-3">
                <div 
                  v-for="(img, imidx) in activeRecordDetail.details.pvModules.photos" 
                  :key="imidx"
                  class="h-16 w-24 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 cursor-zoom-in group shadow-sm hover:scale-105 transition"
                  @click="previewImage(img)"
                >
                  <img :src="img" class="h-full w-full object-cover" referrerPolicy="no-referrer" />
                </div>
              </div>
            </div>
          </div>

          <!-- 分部详情 B -->
          <div class="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
            <div class="flex items-center justify-between border-b border-slate-100 pb-2">
              <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span class="h-2 w-2 rounded-full bg-blue-500"></span> 2、支架荷载支座连接检查
              </span>
              <span class="text-[10px] text-slate-400">核查3个子项</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div class="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-100">
                <span class="text-slate-500">各节点处连接是否松动：</span>
                <span class="font-extrabold" :class="activeRecordDetail.details.mounts.loose === '正常' ? 'text-emerald-600' : 'text-red-500'">
                  {{ activeRecordDetail.details.mounts.loose }}
                </span>
              </div>
              <div class="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-100">
                <span class="text-slate-500">混凝土基础抗风压水泥墩：</span>
                <span class="font-extrabold" :class="activeRecordDetail.details.mounts.offset === '正常' ? 'text-emerald-600' : 'text-red-500'">
                  {{ activeRecordDetail.details.mounts.offset }}
                </span>
              </div>
              <div class="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-100">
                <span class="text-slate-500">防护层表面是否大面锈蚀：</span>
                <span class="font-extrabold" :class="activeRecordDetail.details.mounts.corrosion === '正常' ? 'text-emerald-600' : 'text-red-500'">
                  {{ activeRecordDetail.details.mounts.corrosion }}
                </span>
              </div>
            </div>

            <!-- 照片列表 -->
            <div v-if="activeRecordDetail.details.mounts.photos.length > 0" class="pt-2">
              <span class="text-[10px] text-slate-400 block mb-2 font-medium">现场固态物证图像（支架连接）：</span>
              <div class="flex flex-wrap gap-3">
                <div 
                  v-for="(img, imidx) in activeRecordDetail.details.mounts.photos" 
                  :key="imidx"
                  class="h-16 w-24 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 cursor-zoom-in group shadow-sm hover:scale-105 transition"
                  @click="previewImage(img)"
                >
                  <img :src="img" class="h-full w-full object-cover" referrerPolicy="no-referrer" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 签字闭环流程区块 -->
        <div class="mt-12 pt-8 border-t border-dashed border-slate-300 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
          <!-- 巡检负责人手工签字 -->
          <div class="space-y-2">
            <span class="text-xs text-slate-400 block font-medium">巡检负责人手书认定签名：</span>
            <div class="h-20 border border-slate-200 rounded-xl bg-slate-50/50 flex items-center justify-center relative p-2 overflow-hidden select-none">
              <!-- 漂亮的手写手稿倾斜艺术墨水笔效果 -->
              <span class="font-cursive italic text-2xl tracking-widest text-slate-800 transform -rotate-3 select-none drop-shadow-sm font-bold">
                {{ activeRecordDetail.signatureOperator }}
              </span>
              <span class="absolute bottom-1 right-2 text-[9px] text-slate-400 font-mono">（数字抗辩校验）</span>
            </div>
          </div>

          <!-- 部门审核人手工签字 -->
          <div class="space-y-2">
            <span class="text-xs text-slate-400 block font-medium">上级业务部门审核复校（签字）：</span>
            <!-- 已经签字状态 -->
            <div 
              v-if="activeRecordDetail.signatureManager !== '待签名'" 
              class="h-20 border border-slate-200 rounded-xl bg-slate-50/50 flex items-center justify-center relative p-2 overflow-hidden select-none"
            >
              <span class="font-cursive italic text-2xl tracking-widest text-[#1890ff] transform -rotate-2 select-none font-bold">
                {{ activeRecordDetail.signatureManager }}
              </span>
              <!-- 圆形水墨红色电子印章 -->
              <div class="absolute -top-1 -right-1 h-14 w-14 rounded-full border-2 border-red-500/35 border-dashed flex items-center justify-center font-bold text-[8px] text-red-500/45 transform rotate-12 select-none uppercase pointer-events-none">
                CECEP已签署
              </div>
              <span class="absolute bottom-1 right-2 text-[9px] text-slate-400 font-mono">（安全密匙已流转）</span>
            </div>

            <!-- 未签字状态 -->
            <div 
              v-else 
              class="h-20 border-2 border-dashed border-slate-200 rounded-xl bg-white flex flex-col items-center justify-center relative p-3 text-center transition group"
            >
              <button 
                @click="performAuditSignature(activeRecordDetail.id)" 
                class="px-4 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 border border-emerald-200 text-xs font-bold rounded-lg shadow-sm transition cursor-pointer flex items-center gap-1.5"
              >
                <ClipboardPen :size="14" /> 点击极速核准并签字
              </button>
              <span class="text-[9.5px] text-slate-400 mt-1 block font-medium">当前仍处于等待上层审阀状态。</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 高分辨率大图预览弹窗 -->
    <a-modal
      v-model:open="previewModalOpen"
      :footer="null"
      width="640px"
      title="高清物证影像大图查看"
    >
      <div class="p-2 flex justify-center bg-slate-900 rounded-lg overflow-hidden border border-slate-850 mt-4">
        <img :src="previewSrc" class="max-h-[480px] w-auto max-w-full object-contain rounded" referrerPolicy="no-referrer" />
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { patrolStore, PatrolRecordItem } from '@/store/patrol';
import {
  Search,
  Trash2,
  Download,
  RotateCw,
  History,
  ArrowLeft,
  X,
  ClipboardPen
} from 'lucide-vue-next';

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

const filteredRecords = computed(() => {
  return patrolStore.records.filter(r => {
    let match = true;
    if (searchQuery.siteName && !r.siteName.includes(searchQuery.siteName)) {
      match = false;
    }
    if (searchQuery.status && r.status !== searchQuery.status) {
      match = false;
    }
    return match;
  });
});

const paginatedRecords = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize;
  return filteredRecords.value.slice(start, start + pagination.pageSize);
});

const totalPages = computed(() => {
  return Math.ceil(filteredRecords.value.length / pagination.pageSize) || 1;
});

watch(filteredRecords, () => {
  pagination.current = 1;
});

const isAllSelected = computed(() => {
  if (filteredRecords.value.length === 0) return false;
  return filteredRecords.value.every(r => selectedRowKeys.value.includes(r.id));
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
    const visibleIds = filteredRecords.value.map(r => r.id);
    selectedRowKeys.value = selectedRowKeys.value.filter(id => !visibleIds.includes(id));
  } else {
    filteredRecords.value.forEach(r => {
      if (!selectedRowKeys.value.includes(r.id)) {
        selectedRowKeys.value.push(r.id);
      }
    });
  }
};

const handleSearch = () => {
  message.success('条件检索已生效');
};

const handleReset = () => {
  searchQuery.siteName = undefined;
  searchQuery.status = undefined;
  message.info('清盘检索项');
};

const handleRefresh = () => {
  message.loading({ content: '抽取系统数据库底表归档...', duration: 0.5 }).then(() => {
    message.success('光伏现场巡检结果记录刷新成功');
  });
};

const handleBatchDelete = () => {
  Modal.confirm({
    title: '极其危险的动作警告',
    content: `您选中了 ${selectedRowKeys.value.length} 个历史巡检结果记录卷宗。确认将其从本地存储完全销毁吗？`,
    okText: '确认硬删除',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      patrolStore.deleteRecords(selectedRowKeys.value);
      selectedRowKeys.value = [];
      message.success('巡检纸质单据归档已彻底销毁！');
    }
  });
};

const handleExport = () => {
  message.loading({ content: '正在打包现场隐患指标与高清大图物证压缩中...', duration: 1.0 }).then(() => {
    message.success('历史巡点报告台账打包导出成功！');
  });
};

// 单条详情展示
const activeRecordDetail = ref<PatrolRecordItem | null>(null);

const showDetailPanel = (item: PatrolRecordItem) => {
  activeRecordDetail.value = item;
};

// 极速主管签字
const quickSign = (id: string) => {
  Modal.confirm({
    title: '极速复核签署确认',
    content: '您确定要作为部门主管（张建国）签署此任务评判书吗？点击确认将即时进行数字印章盖墨。',
    okText: '确认合规签署',
    okType: 'primary',
    cancelText: '取消',
    onOk() {
      patrolStore.signManagerRecord(id);
      message.success('电子安全数字印章已完美盖印！');
    }
  });
};

// 单据内部签字
const performAuditSignature = (id: string) => {
  message.loading({ content: '正在与中国节能证书中心(CECEP-CA)进行密钥校对...', duration: 1.0 }).then(() => {
    patrolStore.signManagerRecord(id);
    if (activeRecordDetail.value) {
      activeRecordDetail.value.signatureManager = '张建国';
    }
    message.success('签署成功！上级主管电子CA数字墨水笔盖章成功，报告单已完全闭环流转。');
  });
};

// 放大图预览
const previewModalOpen = ref(false);
const previewSrc = ref('');

const previewImage = (src: string) => {
  previewSrc.value = src;
  previewModalOpen.value = true;
};

const prevPage = () => {
  if (pagination.current > 1) pagination.current--;
};

const nextPage = () => {
  if (pagination.current < totalPages.value) pagination.current++;
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Zhi+Mang+Xing&display=swap');

.patrol-record-container {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* 采用特殊的手写风格字体 class 作为签名的手稿 */
.font-cursive {
  font-family: 'Zhi Mang Xing', cursive, 'STKaiti', 'Kaiti SC', sans-serif;
}
</style>
