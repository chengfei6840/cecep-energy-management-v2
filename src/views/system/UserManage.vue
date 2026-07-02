<template>
  <div class="space-y-6 font-sans">
    <!-- 头部引导 & 操作卡片 -->
    <div class="bg-white px-6 py-5 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="space-y-1">
        <h2 class="text-base font-bold text-slate-800 m-0 flex items-center gap-2">
          <span class="h-4 w-1 bg-[#005BAC] rounded"></span>
          安全用户与组织中台
        </h2>
        <p class="text-xs text-slate-400 font-medium">维护平台登录作业人员，指配功能角色钥匙、可阅数据站房作用域，确保一期配网安全指令在合规边界行使。</p>
      </div>
      
      <!-- 功能按钮 -->
      <a-button 
        type="primary" 
        class="bg-[#005BAC] text-xs font-bold h-9 flex items-center gap-1.5 rounded-lg border-none hover:bg-blue-700 cursor-pointer shadow-sm"
        @click="openAddUserModal"
      >
        <Plus :size="14" /> 注册登记新作业员
      </a-button>
    </div>

    <!-- 用户权限双重隔离策略宣誓卡 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- 隔离机制1 -->
      <div class="bg-gradient-to-r from-[#005BAC]/5 to-blue-55/10 p-4 rounded-xl border border-blue-100 flex gap-3">
        <div class="h-10 w-10 shrink-0 rounded-lg bg-[#005BAC]/10 text-[#005BAC] flex items-center justify-center font-bold text-sm">
          功
        </div>
        <div class="space-y-1">
          <span class="text-xs font-bold text-slate-800 block">功能权限：多角色合并(并集)控制菜单与按钮</span>
          <p class="text-[11px] text-slate-550 leading-relaxed font-medium">
            用户支持指派一个或多个安全岗位角色（如运营管理员 + 第三方接口管理员），系统自动取两者的<b>并集</b>，决定该用户可访问的左侧菜单、大屏面板以及一键调优、电子印鉴等敏感操作按钮。
          </p>
        </div>
      </div>
      <!-- 隔离机制2 -->
      <div class="bg-gradient-to-r from-emerald-50/40 to-emerald-50/10 p-4 rounded-xl border border-emerald-150 flex gap-3">
        <div class="h-10 w-10 shrink-0 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-sm">
          数
        </div>
        <div class="space-y-1">
          <span class="text-xs font-bold text-slate-800 block">数据权限：站口级实体物理多级遮蔽机制</span>
          <p class="text-[11px] text-slate-550 leading-relaxed font-medium">
            没有核绑定的物理光储充站点，用户登录后在首页总览、逆变器监测、电池调控、智能告警等任何功能页面<b>一律无法查看其数据</b>。顶部站点切换下拉框只暴露该用户被授权受阅的值。
          </p>
        </div>
      </div>
    </div>

    <!-- 高级多条件过滤区 -->
    <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-100 space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <!-- 姓名 -->
        <div class="space-y-1.5 text-xs">
          <span class="text-slate-500 font-semibold block">用户姓名：</span>
          <a-input v-model:value="queries.name" placeholder="检索姓名..." allow-clear class="h-8.5 rounded-lg text-xs" />
        </div>
        <!-- 登录账号 -->
        <div class="space-y-1.5 text-xs">
          <span class="text-slate-500 font-semibold block">登录账号：</span>
          <a-input v-model:value="queries.account" placeholder="检索账号..." allow-clear class="h-8.5 rounded-lg text-xs" />
        </div>
        <!-- 手机号 -->
        <div class="space-y-1.5 text-xs">
          <span class="text-slate-500 font-semibold block">手机号：</span>
          <a-input v-model:value="queries.phone" placeholder="输入手机号..." allow-clear class="h-8.5 rounded-lg text-xs" />
        </div>
        <!-- 所属部门 -->
        <div class="space-y-1.5 text-xs">
          <span class="text-slate-500 font-semibold block">所属部门：</span>
          <a-input v-model:value="queries.department" placeholder="检索部门..." allow-clear class="h-8.5 rounded-lg text-xs" />
        </div>
        <!-- 角色筛选 -->
        <div class="space-y-1.5 text-xs">
          <span class="text-slate-500 font-semibold block">主安全角色：</span>
          <a-select v-model:value="queries.role" placeholder="不限安全角色" style="width: 100%" allow-clear class="text-xs">
            <a-select-option v-for="r in globalStore.roles" :key="r.id" :value="r.name">{{ r.name }}</a-select-option>
          </a-select>
        </div>
        <!-- 状态筛选 -->
        <div class="space-y-1.5 text-xs">
          <span class="text-slate-500 font-semibold block">密钥在册状态：</span>
          <a-select v-model:value="queries.status" placeholder="不限状态" style="width: 100%" allow-clear class="text-xs">
            <a-select-option value="启用">正常启用</a-select-option>
            <a-select-option value="停用">安全停用</a-select-option>
            <a-select-option value="锁定">违规锁定</a-select-option>
          </a-select>
        </div>
      </div>

      <!-- 搜索动作栏 -->
      <div class="flex items-center justify-between border-t border-slate-100 pt-3 flex-wrap gap-2">
        <span class="text-[10px] text-slate-400 font-mono font-bold leading-none">24小时身份验签控制中心在线中 ●</span>
        <div class="flex items-center gap-2">
          <button @click="resetQueries" class="px-4 py-1.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer">
            清空条件
          </button>
          <button @click="handleFilter" class="px-5 py-1.5 bg-[#005BAC] hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition cursor-pointer flex items-center gap-1.5">
            <Search :size="13" /> 检索权限矩阵
          </button>
        </div>
      </div>
    </div>

    <!-- 列端用户流水表格 -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <span class="text-xs font-bold text-slate-500 flex items-center gap-1.5">
          <Users2 :size="15" class="text-[#005BAC]" />
          作业人员流水档案清单 (共检索出 {{ filteredUsers.length }} 席在册账号)
        </span>
      </div>

      <div class="overflow-x-auto w-full">
        <a-table 
          :columns="columns" 
          :data-source="filteredUsers" 
          row-key="id"
          :pagination="pagination"
          size="middle"
          class="cecep-user-table"
        >
          <template #bodyCell="{ column, record }">
            <!-- 姓名 / 账号 -->
            <template v-if="column.key === 'user_info'">
              <div class="flex items-center gap-3">
                <div class="h-9 w-9 rounded-full bg-[#005BAC]/5 border border-[#005BAC]/15 text-[#005BAC] flex items-center justify-center font-bold text-sm select-none uppercase">
                  {{ record.name[0] }}
                </div>
                <div class="space-y-0.5">
                  <span class="font-bold text-slate-800 text-xs hover:text-[#005BAC] transition cursor-pointer" @click="openDetailDrawer(record)">
                    {{ record.name }}
                  </span>
                  <div class="flex items-center gap-1.5">
                    <span class="text-[10px] text-slate-400 font-mono font-semibold">{{ record.account }}</span>
                    <span class="h-1 w-1 rounded-full bg-slate-300"></span>
                    <span class="text-[10px] text-slate-400 font-mono font-semibold">{{ record.phone }}</span>
                  </div>
                </div>
              </div>
            </template>

            <!-- 部门与岗位 -->
            <template v-else-if="column.key === 'department_post'">
              <div class="space-y-0.5">
                <span class="font-semibold text-slate-700 text-xs leading-none block">{{ record.department }}</span>
                <span class="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                  <Briefcase :size="11" class="text-slate-400" />
                  {{ record.post || '能效主值班员' }}
                </span>
              </div>
            </template>

            <!-- 分配角色 -->
            <template v-else-if="column.key === 'roles_tag'">
              <div class="flex flex-wrap gap-1 max-w-[180px]">
                <span 
                  v-for="role in getUserRolesList(record)" 
                  :key="role"
                  class="px-1.5 py-0.5 rounded text-[10px] font-bold"
                  :class="getRoleTagStyle(role)"
                >
                  {{ role }}
                </span>
              </div>
            </template>

            <!-- 授权站点数 -->
            <template v-else-if="column.key === 'allowed_sites'">
              <a-tooltip title="点击快速查看所辖站点明细列">
                <a-tag 
                  color="cyan" 
                  class="cursor-pointer hover:bg-cyan-100 font-mono font-bold text-xs px-2.5 py-0.5 rounded-full border-cyan-200 transition scale-95"
                  @click="showSitesListModal(record)"
                >
                  {{ record.allowedSites?.length || 0 }} 站房
                </a-tag>
              </a-tooltip>
            </template>

            <!-- 最近登录时间 -->
            <template v-else-if="column.key === 'lastLoginTime'">
              <span class="font-mono text-slate-500 font-medium text-xs">{{ record.lastLoginTime || '尚未登录过' }}</span>
            </template>

            <!-- 状态 -->
            <template v-else-if="column.key === 'status'">
              <span 
                class="px-2 py-0.5 rounded-full text-[9.5px] font-bold inline-flex items-center gap-1 select-none"
                :class="getStatusStyle(record.status)"
              >
                <span class="h-1.5 w-1.5 rounded-full" :class="getStatusDotStyle(record.status)"></span>
                {{ record.status }}
              </span>
            </template>

            <!-- 操作 -->
            <template v-else-if="column.key === 'action'">
              <div class="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                <!-- 详情 -->
                <a-button size="small" type="link" class="text-emerald-600 p-0 font-bold hover:text-emerald-700 text-xs" @click="openDetailDrawer(record)">
                  详情
                </a-button>

                <span class="text-slate-205 select-none text-[10px]">|</span>

                <!-- 编辑 -->
                <a-button size="small" type="link" class="text-[#005BAC] p-0 font-bold hover:text-blue-700 text-xs" @click="openUserEditModal(record)">
                  编辑
                </a-button>

                <span class="text-slate-205 select-none text-[10px]">|</span>

                <!-- 角色 -->
                <a-button size="small" type="link" class="text-purple-600 p-0 font-bold hover:text-purple-700 text-xs" @click="openAssignRolesModal(record)">
                  分配角色
                </a-button>

                <span class="text-slate-205 select-none text-[10px]">|</span>

                <!-- 站点 -->
                <a-button size="small" type="link" class="text-indigo-600 p-0 font-bold hover:text-indigo-700 text-xs" @click="openAssignSitesModal(record)">
                  分配站点
                </a-button>

                <span class="text-slate-205 select-none text-[10px]">|</span>

                <!-- 重置密码 -->
                <a-popconfirm
                  title="您确定一键将该员密钥口令重置为[cecep666]默认初始口令吗？该动作无法撤回。"
                  ok-text="确认重置"
                  cancel-text="取消"
                  @confirm="handleResetPassword(record)"
                >
                  <a-button size="small" type="link" class="text-amber-600 p-0 font-bold hover:text-amber-700 text-xs">
                    重置
                  </a-button>
                </a-popconfirm>

                <span class="text-slate-205 select-none text-[10px]">|</span>

                <!-- 启用/停用 -->
                <a-popconfirm
                  :title="`安全警示：确定要将用户「${record.name}」的状态紧急变动为「${record.status === '启用' ? '停用' : '启用'}」吗？`"
                  ok-text="执行变更"
                  cancel-text="考虑一下"
                  @confirm="handleToggleStatus(record)"
                >
                  <a-button size="small" type="link" :class="record.status === '启用' ? 'text-rose-600 hover:text-rose-700' : 'text-emerald-600 hover:text-emerald-700'" class="p-0 font-bold text-xs">
                    {{ record.status === '启用' ? '停用' : '启用' }}
                  </a-button>
                </a-popconfirm>
              </div>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- MODAL 1: 新增/编辑用户基本信息 -->
    <a-modal
      v-model:open="isFormModalOpen"
      :title="userForm.id ? '编辑 CECEP 平台在册作业员属性' : '高标录入新并网作业组员密钥'"
      @ok="saveUserForm"
      width="560px"
      ok-text="落盘并激活印戳"
      cancel-text="放弃"
    >
      <div class="p-2 space-y-4 text-xs font-sans">
        <div class="bg-blue-50/50 p-3.5 rounded-xl border border-blue-150 flex items-start gap-2.5 select-none leading-normal">
          <Info :size="14" class="text-[#005BAC] shrink-0 mt-0.5" />
          <p class="m-0 text-[10.5px] text-blue-900 font-medium">
            登记后系统将为其生成初始并网安全哈希。角色组与受阅站点可随时在主表格操作栏中进行高频细粒度动态指配解偶。
          </p>
        </div>

        <a-form layout="vertical" class="grid grid-cols-2 gap-x-4 gap-y-1">
          <!-- 姓名 -->
          <a-form-item label="用户姓名" required>
            <a-input v-model:value="userForm.name" placeholder="例: 张建国 / 李明琪" />
          </a-form-item>

          <!-- 登录账号 -->
          <a-form-item label="登录账号 (Authentication Account)" required>
            <a-input v-model:value="userForm.account" placeholder="建议拼音: jg_zhang" :disabled="!!userForm.id" />
          </a-form-item>

          <!-- 手机号 -->
          <a-form-item label="实机验证手机号" required>
            <a-input v-model:value="userForm.phone" placeholder="请输入其11位合规手机" />
          </a-form-item>

          <!-- 邮箱 -->
          <a-form-item label="企业电子邮箱">
            <a-input v-model:value="userForm.email" placeholder="如: example@cecep.cn" />
          </a-form-item>

          <!-- 所属部门 -->
          <a-form-item label="组织部门分派" required>
            <a-input v-model:value="userForm.department" placeholder="例: 华北资产运营突击组" />
          </a-form-item>

          <!-- 岗位 -->
          <a-form-item label="安全作业岗位" required>
            <a-input v-model:value="userForm.post" placeholder="例: 主控室值班长 / PCS组专家" />
          </a-form-item>

          <!-- 初始密码 (只在新增时展示) -->
          <a-form-item v-if="!userForm.id" label="验证初始密码" required class="col-span-2">
            <a-input-password v-model:value="userForm.password" placeholder="推荐默认: cecep666" />
          </a-form-item>

          <!-- 状态 -->
          <a-form-item label="账号授权在册状态" required class="col-span-2">
            <a-radio-group v-model:value="userForm.status" class="flex gap-4">
              <a-radio value="启用"><span class="text-xs font-bold text-emerald-600">正常起用(有效)</span></a-radio>
              <a-radio value="停用"><span class="text-xs font-bold text-slate-400">心跳置闭(停用)</span></a-radio>
              <a-radio value="锁定"><span class="text-xs font-bold text-rose-500">违规闭锁(锁定)</span></a-radio>
            </a-radio-group>
          </a-form-item>

          <!-- 备注 -->
          <a-form-item label="岗位安责备注" class="col-span-2">
            <a-textarea v-model:value="userForm.remark" placeholder="请输入职责及授权边界，例如：负责华东临港示范高压输电调频..." :rows="3" />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- MODAL 2: 分配多重角色等级 -->
    <a-modal
      v-model:open="isRoleAssModalOpen"
      title="配置多重安全角色等级作用域"
      @ok="saveAssignedRoles"
      width="580px"
      ok-text="核定保存安全角色"
      cancel-text="放弃"
    >
      <div class="p-2 space-y-4 text-xs font-sans">
        <div v-if="editingUserForRole" class="bg-purple-50/50 p-3.5 rounded-xl border border-purple-150 relative">
          <span class="text-xs font-bold text-purple-950 block mb-1">当前对象: {{ editingUserForRole.name }} (账号: {{ editingUserForRole.account }})</span>
          <p class="text-[10.5px] text-purple-700 m-0 leading-relaxed font-semibold">
            勾选的角色具有<b>逻辑并集</b>累加效果。角色所囊括的菜单范围和动作，都将自动赋权予其操作底模上。
          </p>
        </div>

        <!-- 角色列表的多选样式卡片 -->
        <span class="text-slate-500 font-bold block mb-1 select-none">请勾选要核准的多维岗位角色：</span>
        <div class="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
          <div 
            v-for="role in globalStore.roles" 
            :key="role.id"
            class="p-3 border rounded-xl bg-white hover:border-purple-305 transition cursor-pointer flex items-start gap-3 shadow-2xs"
            :class="tempRolesChecked.includes(role.name) ? 'border-purple-300 bg-purple-50/5' : 'border-slate-150'"
            @click="toggleTempRoleCheck(role.name)"
          >
            <a-checkbox 
              :checked="tempRolesChecked.includes(role.name)" 
              class="scale-100 mt-1 shrink-0" 
              @click.stop
              @change="toggleTempRoleCheck(role.name)" 
            />
            <div class="space-y-1 text-xs">
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-800">{{ role.name }}</span>
                <code class="px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded font-mono text-[9px] border border-slate-200">{{ role.code }}</code>
                <span class="px-1.5 py-0.1 bg-purple-50 text-purple-600 rounded text-[9.5px] font-bold border border-purple-100">{{ role.roleType }}</span>
              </div>
              <p class="m-0 text-[10.5px] text-slate-500 font-medium leading-normal">{{ role.desc }}</p>
              
              <!-- 折叠面板式权限透视 -->
              <div class="bg-slate-50 p-2 rounded-lg border border-slate-205/60 text-[10px] mt-1.5 text-slate-650 grid grid-cols-2 gap-x-4">
                <div>
                  <span class="font-bold text-slate-700 block mb-0.5">可阅菜单大屏：</span>
                  <p class="m-0 text-slate-400 leading-tight truncate">
                    {{ role.menuRights.includes('all') ? '通配全站核心看板(16项)' : `${role.menuRights.length} 个子单页面` }}
                  </p>
                </div>
                <div>
                  <span class="font-bold text-slate-700 block mb-0.5 font-sans">敏感执行按钮能力：</span>
                  <p class="m-0 text-emerald-600 font-bold leading-tight truncate">
                    {{ role.buttonRights.includes('all') ? '完全特权写操作' : `${role.buttonRights.length} 项核心写指令` }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- MODAL 3: 分配站点可阅范围 (按区域组织站点，带全选及快速检索) -->
    <a-modal
      v-model:open="isSiteAssModalOpen"
      title="物理数据受阅站点边界围栏授权"
      @ok="saveAssignedSites"
      width="555px"
      ok-text="锁定物理站点权限"
      cancel-text="暂不绑定"
    >
      <div class="p-2 space-y-4 text-xs font-sans">
        <div v-if="editingUserForSite" class="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-150 leading-normal">
          <span class="text-xs font-bold text-emerald-950 block mb-1">当前对象: {{ editingUserForSite.name }} (安全钥匙已就绪)</span>
          <p class="text-[10.5px] m-0 text-emerald-700 leading-relaxed font-semibold">
            多能流并网平台安全机制：在此处分配的物理站房，将物理下刷至账户解封缓存上。若不进行勾选，该用户任何子仪表盘都将进入断路空态。
          </p>
        </div>

        <!-- 站点快速搜寻过滤 -->
        <div class="flex items-center gap-2">
          <a-input v-model:value="siteSearchText" placeholder="快速定位特定华东/西北/光储充站房名称..." allow-clear class="h-8.5 rounded-lg text-xs flex-1">
            <template #prefix>
              <Search :size="12" class="text-slate-400" />
            </template>
          </a-input>
          <!-- 快捷全域清除 -->
          <a-button size="small" type="dashed" danger class="text-neutral-600 border border-slate-300 font-bold text-xs hover:bg-neutral-50" @click="tempSitesChecked = []">
            清空所有站点
          </a-button>
        </div>

        <!-- 站房多区域折叠与区域全选树 -->
        <div class="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
          <div 
            v-for="(sites, region) in filteredGroupedSites" 
            :key="region"
            class="bg-slate-50/50 border border-slate-150 rounded-xl p-3.5 space-y-2.5"
          >
            <!-- 区域级控板，全组全选 -->
            <div class="flex items-center justify-between border-b border-slate-200 pb-2">
              <span class="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                <span class="h-1.5 w-1.5 rounded-full bg-[#005BAC]"></span>
                {{ region }}
                <span class="text-[10px] text-slate-440 font-semibold font-mono">({{ sites.length }} 站)</span>
              </span>
              <!-- 全选本区域 checkbox -->
              <label class="flex items-center gap-1 cursor-pointer select-none">
                <a-checkbox 
                  :checked="isRegionAllChecked(region, sites)"
                  :indeterminate="isRegionIndeterminate(region, sites)"
                  @change="(e: any) => toggleRegionAll(region, sites, e.target.checked)"
                  class="scale-90"
                />
                <span class="text-[10.5px] font-bold text-neutral-500 hover:text-neutral-700">全选本区域</span>
              </label>
            </div>

            <!-- 具体站点列表 -->
            <div class="grid grid-cols-2 gap-2">
              <div 
                v-for="site in sites" 
                :key="site.key"
                class="flex items-start gap-2 p-2 bg-white border rounded-lg hover:border-emerald-350 transition transition-all cursor-pointer"
                :class="tempSitesChecked.includes(site.key) ? 'border-emerald-200 shadow-2xs' : 'border-slate-100'"
                @click="toggleTempSiteCheck(site.key)"
              >
                <a-checkbox 
                  :checked="tempSitesChecked.includes(site.key)" 
                  class="scale-90 mt-0.5" 
                  @click.stop
                  @change="toggleTempSiteCheck(site.key)" 
                />
                <div class="space-y-0.5 text-xs">
                  <span class="font-bold text-slate-800 block leading-tight">{{ site.name }}</span>
                  <span class="text-[9.5px] text-slate-400 font-mono block">{{ site.code }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 无匹配站点 -->
          <div v-if="Object.keys(filteredGroupedSites).length === 0" class="text-center py-10 text-slate-405">
            <span class="text-xs">无符合搜索检索的任何光储充数据站房。</span>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- MODAL 4: 快速受阅物理站点列表显示 Modal (点击 "站房" 数触发展示) -->
    <a-modal
      v-model:open="isSitesListModalOpen"
      title="该用户目前已被绑定授信可阅的物理变电/光储充站房"
      :footer="null"
      width="440px"
    >
      <div v-if="viewingUserForSites" class="space-y-4 text-xs font-sans p-1">
        <div class="flex items-center justify-between border-b pb-2">
          <span class="font-bold text-slate-700">在册作业员: <b class="text-slate-900 text-sm">{{ viewingUserForSites.name }}</b></span>
          <span class="text-[11px] text-slate-400 font-mono font-bold">{{ viewingUserForSites.account }}</span>
        </div>

        <div class="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          <!-- 站房按区域折子 -->
          <div v-for="(sites, region) in getGroupedSitesOfUser(viewingUserForSites)" :key="region" class="space-y-1.5">
            <span class="text-[11px] font-bold text-slate-500 block bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/50">{{ region }}</span>
            <ul class="list-none pl-1 space-y-1">
              <li v-for="site in sites" :key="site.key" class="flex items-center justify-between py-1 text-slate-700 border-b border-dashed border-slate-100 last:border-none">
                <span class="font-bold flex items-center gap-1.5">
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  {{ site.name }}
                </span>
                <code class="text-[9.5px] font-mono text-slate-400 bg-slate-100/60 border border-slate-205 rounded px-1">{{ site.code }}</code>
              </li>
            </ul>
          </div>
          
          <div v-if="viewingUserForSites.allowedSites?.length === 0" class="text-center py-8 text-slate-430">
            <span class="text-xs">该账号由于安全脱钩，目前尚未核定任何受阅站房，将无法阅取系统数据。</span>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- DRAWER: 用户深度安全审计详情宿主页 -->
    <a-drawer
      v-model:open="isDetailDrawerOpen"
      title="持钥作业员全景安全管理与审计工作台"
      width="580px"
      placement="right"
      :footer-style="{ textAlign: 'right' }"
    >
      <div v-if="detailUser" class="space-y-6 text-xs pb-10 font-sans">
        <!-- 侧栏头部个人名卡 -->
        <div class="bg-gradient-to-br from-slate-905 to-slate-805 p-5 rounded-2xl text-white select-all border border-slate-800 shadow-md">
          <div class="flex items-start gap-4">
            <div class="h-12 w-12 rounded-full bg-slate-700/50 border border-slate-600/50 flex items-center justify-center font-extrabold text-base text-yellow-400 shrink-0">
              {{ detailUser.name[0] }}
            </div>
            <div class="space-y-1 flex-1">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-extrabold text-white m-0 tracking-tight flex items-center gap-1.5">
                  {{ detailUser.name }}
                  <span class="text-[10px] text-zinc-400 font-mono font-medium">({{ detailUser.id }})</span>
                </h3>
                <span 
                  class="px-1.5 py-0.2 rounded text-[9px] font-bold inline-flex items-center gap-1 select-none border"
                  :class="getStatusDetailCardStyle(detailUser.status)"
                >
                  {{ detailUser.status }}
                </span>
              </div>
              <div class="text-[10px] text-zinc-330 font-semibold font-mono flex items-center gap-1">
                账号: {{ detailUser.account }}
                <span class="text-slate-500">|</span>
                手机: {{ detailUser.phone }}
              </div>
              <p class="m-0 text-[10px] text-slate-400 leading-normal font-medium mt-1 select-none">
                {{ detailUser.remark || '暂无职责安责描述。本员主要配合配电大板进行各项一期心跳校验印签工作。' }}
              </p>
            </div>
          </div>
        </div>

        <!-- 详细卡级拆解 -->
        <a-tabs v-model:activeKey="detailActiveTabKey" class="cecep-detail-tabs">
          <!-- 基础信息 -->
          <a-tab-pane key="1" tab="1. 基础属性档案">
            <div class="grid grid-cols-2 gap-4 pt-2">
              <div class="bg-slate-50 p-3 rounded-xl border border-slate-205">
                <span class="text-[9.5px] text-slate-400 font-bold block mb-0.5">真实姓名</span>
                <span class="text-xs font-bold text-slate-800 block">{{ detailUser.name }}</span>
              </div>
              <div class="bg-slate-50 p-3 rounded-xl border border-slate-205">
                <span class="text-[9.5px] text-slate-400 font-bold block mb-0.5">登录系统账户</span>
                <span class="text-xs font-bold font-mono text-[#005BAC] block select-all">{{ detailUser.account }}</span>
              </div>
              <div class="bg-slate-50 p-3 rounded-xl border border-slate-205">
                <span class="text-[9.5px] text-slate-400 font-bold block mb-0.5">双非实名手机号</span>
                <span class="text-xs font-bold font-mono text-slate-800 block">{{ detailUser.phone }}</span>
              </div>
              <div class="bg-slate-50 p-3 rounded-xl border border-slate-205">
                <span class="text-[9.5px] text-slate-400 font-bold block mb-0.5">企业电子信箱</span>
                <span class="text-xs font-bold font-mono text-slate-800 block">{{ detailUser.email || `${detailUser.account}@cecep.cn` }}</span>
              </div>
              <div class="bg-slate-50 p-3 rounded-xl border border-slate-205">
                <span class="text-[9.5px] text-slate-400 font-bold block mb-0.5">组织所属部门</span>
                <span class="text-xs font-bold text-slate-800 block">{{ detailUser.department }}</span>
              </div>
              <div class="bg-slate-50 p-3 rounded-xl border border-slate-205">
                <span class="text-[9.5px] text-slate-400 font-bold block mb-0.5">核定安全岗位</span>
                <span class="text-xs font-bold text-slate-800 block">{{ detailUser.post || '能效总值班长' }}</span>
              </div>
              <div class="bg-slate-50 p-3 rounded-xl border border-slate-205 col-span-2">
                <span class="text-[9.5px] text-slate-400 font-bold block mb-0.5">安全身份核发注册时间</span>
                <span class="text-xs font-mono font-medium text-slate-650 block">{{ detailUser.createdAt || '2024-03-12 10:00:00' }}</span>
              </div>
            </div>
          </a-tab-pane>

          <!-- 安全职责与特权摘要 -->
          <a-tab-pane key="2" tab="2. 权限特权摘要">
            <div class="space-y-4 pt-2">
              <span class="text-slate-500 font-extrabold block mb-0.5">通过绑定角色合并计算(并集)得出的可用特权树：</span>
              
              <!-- 角色堆叠 -->
              <div class="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-205">
                <span class="text-[10px] text-slate-400 font-bold block mb-1">岗位角色堆叠</span>
                <div class="flex flex-wrap gap-1.5">
                  <span 
                    v-for="role in getUserRolesList(detailUser)" 
                    :key="role"
                    class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200"
                  >
                    {{ role }}
                  </span>
                </div>
              </div>

              <!-- 菜单权限审计 -->
              <div class="space-y-2.5">
                <span class="text-[11px] font-extrabold text-slate-500 flex items-center gap-1 select-none">
                  <Compass :size="13" class="text-[#005BAC]" /> 可访问的功能菜单页面(首级)：
                </span>
                <div class="flex flex-wrap gap-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-205/80 max-h-40 overflow-y-auto">
                  <span 
                    v-for="menu in getComputedMenusOfUser(detailUser)" 
                    :key="menu"
                    class="px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 text-[10px] font-bold"
                  >
                    {{ menu }}
                  </span>
                  <span v-if="getComputedMenusOfUser(detailUser).length === 0" class="text-slate-400 italic">完全无可用页面，请联系管理员核配</span>
                </div>
              </div>

              <!-- 写特权操作审计 -->
              <div class="space-y-2 pt-2 border-t border-dashed border-slate-100">
                <span class="text-[11px] font-extrabold text-slate-500 flex items-center gap-1 select-none">
                  <LockKeyhole :size="13" class="text-emerald-600" /> 已锁定核准的写特指令、发布按钮：
                </span>
                <div class="grid grid-cols-2 gap-2">
                  <div 
                    v-for="btn in getComputedButtonsShowList(detailUser)" 
                    :key="btn.key"
                    class="flex items-center gap-1.5 p-2 bg-slate-50 border border-slate-200/80 rounded-lg text-[10.5px] font-semibold text-slate-700"
                  >
                    <span class="h-2 w-2 rounded-full bg-emerald-520"></span>
                    <span>{{ btn.label }}</span>
                  </div>
                  <div v-if="getComputedButtonsShowList(detailUser).length === 0" class="col-span-2 text-center text-slate-410 italic py-2 bg-slate-50 rounded-lg">
                    该账号为 100% 只读观察员，无任何写操作、参数发布、数据清损等决策特权。
                  </div>
                </div>
              </div>
            </div>
          </a-tab-pane>

          <!-- 授权站点区域 -->
          <a-tab-pane key="3" tab="3. 物理站点数据边界">
            <div class="space-y-3 pt-2">
              <span class="text-slate-550 font-bold block mb-1">该作业人员在物联传感端获准受阅的数据网格站点：</span>
              
              <div class="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                <div v-for="(sites, region) in getGroupedSitesOfUser(detailUser)" :key="region" class="space-y-2">
                  <span class="text-[11px] font-bold text-slate-500 block bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg">
                    {{ region }}
                  </span>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div v-for="site in sites" :key="site.key" class="p-2 bg-white border border-slate-100 rounded-lg shadow-2xs flex items-center justify-between">
                      <span class="font-bold text-slate-805 flex items-center gap-1.5 leading-tight">
                        <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        {{ site.name }}
                      </span>
                      <code class="text-[9px] font-mono text-slate-400 bg-slate-50 border border-slate-200/60 rounded px-1">{{ site.code }}</code>
                    </div>
                  </div>
                </div>

                <div v-if="detailUser.allowedSites?.length === 0" class="text-center py-10 bg-slate-50 rounded-xl border border-slate-200/50">
                  <ShieldAlert :size="24" class="mx-auto text-amber-500 mb-1.5" />
                  <span class="text-xs text-slate-440">无授权，即登录平台后无法进行任何站房遥测取数。</span>
                </div>
              </div>
            </div>
          </a-tab-pane>

          <!-- 安全日志 -->
          <a-tab-pane key="4" tab="4. 访问及操作安全日志">
            <div class="space-y-4 pt-2">
              <span class="text-slate-505 font-bold block mb-1.5">最近24小时安全审计与会话操作轨迹：</span>
              
              <div class="relative border-l border-slate-200 pl-4 space-y-4.5 py-1 max-h-[385px] overflow-y-auto overflow-x-hidden">
                <div v-for="(log, idx) in auditLogsMock" :key="idx" class="relative group">
                  <!-- 节点 -->
                  <div class="absolute -left-[20.5px] top-1 h-3 w-3 bg-white border-2 border-indigo-600 rounded-full group-hover:bg-indigo-600 transition"></div>
                  
                  <div class="space-y-1 text-xs">
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-[10.5px] text-indigo-700 font-bold">{{ log.time }}</span>
                      <span class="text-[10px] px-1.5 py-0.2 bg-slate-100 border border-slate-200 rounded text-slate-500 font-mono scale-90">{{ log.ip }}</span>
                    </div>
                    <span class="font-bold text-slate-800 block">{{ log.desc }}</span>
                    <p class="m-0 text-[10.5px] text-slate-440 font-medium leading-relaxed">{{ log.detail }}</p>
                  </div>
                </div>
              </div>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
      <template #extra>
        <a-button type="primary" class="bg-[#005BAC]" @click="isDetailDrawerOpen = false">审计完毕</a-button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { globalStore } from '@/store';
import { message, Modal } from 'ant-design-vue';
import {
  Plus,
  Search,
  Users2,
  LockKeyhole,
  Lock,
  Compass,
  Briefcase,
  ShieldAlert,
  Info
} from 'lucide-vue-next';

// 页面一期树型菜单结构定义（供详情审计转义或描述）
const originalMenuMap: Record<string, string> = {
  'dashboard': '首页总览',
  'big-screen': '运营大屏',
  'integration': '数据网格平台',
  'tariff': '电价方案',
  'pv': '光伏发电智能监测',
  'storage': '储能电池调峰微电网',
  'charging': '充电桩资产负荷网',
  'grid': '电网安全运行拓扑',
  'energy-flow': '实时能流联合拓扑',
  'revenue': '收益结算中心',
  'device': '设备台账',
  'alarm': '消缺告警系统',
  'report': '综合遥测报表中心',
  'system': '底层权限管理'
};

// 预定义一期标准的demo站房
const DEMO_SITES_POOL = [
  { key: 'site-01', name: '中节能北京光储充示范站', code: 'CECEP-BJ-001', region: '华北区域' },
  { key: 'site-11', name: '中节能天津光储充站', code: 'CECEP-TJ-011', region: '华北区域' },
  { key: 'site-02', name: '中节能上海光储充站', code: 'CECEP-SH-002', region: '华东区域' },
  { key: 'site-03', name: '中节能杭州光储充站', code: 'CECEP-HZ-003', region: '华东区域' },
  { key: 'site-04', name: '中节能南京光储充站', code: 'CECEP-NJ-004', region: '华东区域' },
  { key: 'site-05', name: '中节能广州光储充站', code: 'CECEP-GZ-005', region: '华南区域' },
  { key: 'site-06', name: '中节能深圳光储充站', code: 'CECEP-SZ-006', region: '华南区域' },
  { key: 'site-07', name: '中节能武汉光储充站', code: 'CECEP-WH-007', region: '华中区域' },
  { key: 'site-08', name: '中节能成都光储充站', code: 'CECEP-CD-008', region: '西南区域' },
  { key: 'site-09', name: '中节能西安光储充站', code: 'CECEP-XA-009', region: '西北区域' },
];

onMounted(() => {
  // 1. 下刷缺失的 demo 站房到全局 store 保证穿梭框全覆盖
  DEMO_SITES_POOL.forEach(demo => {
    const found = globalStore.sites.find(s => s.key === demo.key);
    if (!found) {
      globalStore.sites.push({
        key: demo.key,
        name: demo.name,
        code: demo.code,
        region: demo.region,
        address: 'CECEP微电网资产中心',
        type: '光储充一体站',
        pvCapacity: 200,
        essCapacity: 500,
        chargerCount: 8,
        deviceCount: 10,
        status: '正常',
        accessStatus: '已接入',
        createdAt: '2525-01-01 10:00:00',
        longitude: 110,
        latitude: 35,
        manager: '陈主管',
        phone: '13812345678',
        thirdPartySynced: true,
        remark: '一期并网测试数据站'
      });
    }
  });

  // 2. 初始化补充现有 mock 用户的属性
  globalStore.users.forEach(u => {
    if (!u.email) u.email = `${u.account}@cecep.cn`;
    if (!u.post) {
      if (u.role === '超级管理员' || u.role === '平台管理员') u.post = '系统总负责人';
      else if (u.role === '运营管理员') u.post = '业务运营主管';
      else if (u.role === '运维人员') u.post = '现场高级作业官';
      else u.post = '大区现场工管工程师';
    }
    if (!u.roles) {
      u.roles = [u.role];
    }
    if (!u.lastLoginTime) {
      const minMocks = ['2026-05-26 11:22:04', '2026-05-26 10:14:50', '2026-05-25 16:32:11', '2026-05-24 09:12:00'];
      u.lastLoginTime = minMocks[Math.floor(Math.random() * minMocks.length)];
    }
    if (!u.createdAt) {
      u.createdAt = '2024-03-12 10:00:00';
    }
  });
});

// 筛选条件响应式
const queries = reactive({
  name: '',
  account: '',
  phone: '',
  department: '',
  role: undefined as string | undefined,
  status: undefined as string | undefined
});

// A-Table 字段
const columns = [
  {
    title: '用户姓名 / 账号',
    key: 'user_info',
    width: '210px'
  },
  {
    title: '部门及安全岗位',
    key: 'department_post',
    width: '180px'
  },
  {
    title: '分配角色(可多选)',
    key: 'roles_tag',
    width: '185px'
  },
  {
    title: '授权物理站点',
    key: 'allowed_sites',
    width: '115px',
    align: 'center' as const
  },
  {
    title: '最近登录时间',
    dataIndex: 'lastLoginTime',
    key: 'lastLoginTime',
    width: '150px'
  },
  {
    title: '系统状态',
    dataIndex: 'status',
    key: 'status',
    width: '95px',
    align: 'center' as const
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: '110px'
  },
  {
    title: '操作防线与特权指配',
    key: 'action',
    align: 'center' as const,
    width: '320px'
  }
];

// A-Table 分页参数
const pagination = reactive({
  pageSize: 6,
  current: 1,
  showSizeChanger: false,
  total: computed(() => filteredUsers.value.length)
});

// 过滤后的用户列表
const filteredUsers = computed(() => {
  return globalStore.users.filter((u: any) => {
    let match = true;
    if (queries.name && !u.name.toLowerCase().includes(queries.name.toLowerCase().trim())) {
      match = false;
    }
    if (queries.account && !u.account.toLowerCase().includes(queries.account.toLowerCase().trim())) {
      match = false;
    }
    if (queries.phone && !u.phone.includes(queries.phone.trim())) {
      match = false;
    }
    if (queries.department && !u.department.toLowerCase().includes(queries.department.toLowerCase().trim())) {
      match = false;
    }
    
    // 多角色匹配
    const uRoles = getUserRolesList(u);
    if (queries.role && !uRoles.includes(queries.role)) {
      match = false;
    }
    
    // 心跳状态
    if (queries.status && u.status !== queries.status) {
      match = false;
    }
    return match;
  });
});

// 数据拉取及重置方法
const handleFilter = () => {
  message.success('高级人员权限矩阵检索渲染成功！');
};

const resetQueries = () => {
  queries.name = '';
  queries.account = '';
  queries.phone = '';
  queries.department = '';
  queries.role = undefined;
  queries.status = undefined;
  message.info('过滤底模已被清空复位。');
};

// 获取用户的角色列表形式
const getUserRolesList = (user: any): string[] => {
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles;
  }
  if (user.role) {
    return user.role.split('、');
  }
  return [];
};

// 角色 Tag 视觉风格映射
const getRoleTagStyle = (role: string) => {
  switch (role) {
    case '超级管理员':
    case '平台管理员':
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    case '运营管理员':
      return 'bg-purple-50 text-purple-700 border border-purple-200';
    case '运维人员':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case '财务查看人员':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case '客户查看人员':
      return 'bg-cyan-50 text-cyan-700 border border-cyan-200';
    default:
      return 'bg-slate-50 text-slate-600 border border-slate-200';
  }
};

// 账号状态 Tags 视觉映射
const getStatusStyle = (status: string) => {
  if (status === '启用') {
    return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  } else if (status === '锁定') {
    return 'bg-red-50 text-red-700 border border-red-200 animate-pulse';
  }
  return 'bg-slate-100 text-slate-500 border border-slate-200';
};

const getStatusDotStyle = (status: string) => {
  if (status === '启用') return 'bg-emerald-500';
  if (status === '锁定') return 'bg-red-500';
  return 'bg-slate-400';
};

const getStatusDetailCardStyle = (status: string) => {
  if (status === '启用') return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35';
  if (status === '锁定') return 'bg-red-500/15 text-red-300 border-red-500/35';
  return 'bg-slate-580/50 text-slate-400 border-slate-700';
};

// ===================== [1. 新增/编辑用户 A-Modal 数据交互] =====================
const isFormModalOpen = ref(false);
const userForm = reactive({
  id: '',
  name: '',
  account: '',
  phone: '',
  email: '',
  department: '',
  post: '',
  password: '',
  status: '启用',
  remark: ''
});

const openAddUserModal = () => {
  Object.assign(userForm, {
    id: '',
    name: '',
    account: '',
    phone: '',
    email: '',
    department: '分布式多能能效运维部',
    post: '现场能控技术师',
    password: '',
    status: '启用',
    remark: ''
  });
  isFormModalOpen.value = true;
};

const openUserEditModal = (record: any) => {
  Object.assign(userForm, {
    id: record.id,
    name: record.name,
    account: record.account,
    phone: record.phone,
    email: record.email || '',
    department: record.department,
    post: record.post || '高级作业官',
    password: '',
    status: record.status || '启用',
    remark: record.remark || ''
  });
  isFormModalOpen.value = true;
};

const saveUserForm = () => {
  if (!userForm.name || !userForm.account || !userForm.phone || !userForm.department || !userForm.post) {
    message.error('带 * 号必填项尚未录入完整，拒绝落盘。');
    return;
  }
  // 如果是新增，密码必填
  if (!userForm.id && !userForm.password) {
    message.error('由于安全政策，创建新持卡账号必须核准其初始初始密码。');
    return;
  }

  if (userForm.id) {
    // 编辑
    const index = globalStore.users.findIndex(u => u.id === userForm.id);
    if (index !== -1) {
      globalStore.users[index] = {
        ...globalStore.users[index],
        name: userForm.name,
        phone: userForm.phone,
        email: userForm.email,
        department: userForm.department,
        post: userForm.post,
        status: userForm.status as any,
        remark: userForm.remark
      };
      message.success(`作业人员「${userForm.name}」基础属性在云端复核重构成功！`);
    }
  } else {
    // 新增
    const isExisted = globalStore.users.some(u => u.account === userForm.account);
    if (isExisted) {
      message.error(`极其危险！全局命名中已饱含此登录账号 [${userForm.account}]，请变更为其它识别子。`);
      return;
    }

    const nId = 'u-' + Math.floor(100 + Math.random() * 899);
    globalStore.users.unshift({
      id: nId,
      name: userForm.name,
      account: userForm.account,
      phone: userForm.phone,
      email: userForm.email || `${userForm.account}@cecep.cn`,
      department: userForm.department,
      post: userForm.post,
      role: '客户查看人员', // 默认初始化
      roles: ['客户查看人员'],
      status: userForm.status as any,
      allowedSites: ['site-01'], // 默认受阅北京
      lastLoginTime: '',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      remark: userForm.remark || '新注册作业员，未定义特殊操作特权。'
    });
    message.success(`新并网持卡账席「${userForm.name}」已登记注册！系统密钥已部署就绪。`);
  }
  
  isFormModalOpen.value = false;
};

// ===================== [2. 分配角色等级 (A-Modal)] =====================
const isRoleAssModalOpen = ref(false);
const editingUserForRole = ref<any>(null);
const tempRolesChecked = ref<string[]>([]);

const openAssignRolesModal = (record: any) => {
  editingUserForRole.value = record;
  tempRolesChecked.value = getUserRolesList(record);
  isRoleAssModalOpen.value = true;
};

const toggleTempRoleCheck = (roleName: string) => {
  const list = [...tempRolesChecked.value];
  const idx = list.indexOf(roleName);
  if (idx !== -1) {
    if (list.length === 1) {
      message.warning('安全防护规定：每一个持权在册作业员必须具有至少一个主岗位。');
      return;
    }
    list.splice(idx, 1);
  } else {
    list.push(roleName);
  }
  tempRolesChecked.value = list;
};

const saveAssignedRoles = () => {
  if (!editingUserForRole.value) return;
  const user = editingUserForRole.value;
  
  const targetIdx = globalStore.users.findIndex(u => u.id === user.id);
  if (targetIdx !== -1) {
    // 更新
    globalStore.users[targetIdx].roles = [...tempRolesChecked.value];
    globalStore.users[targetIdx].role = tempRolesChecked.value.join('、');
    
    // 动态模拟提升或降低其用户角色的计数审计
    globalStore.roles.forEach(r => {
      // 重新计算有多少人分配了此角色
      const matchCount = globalStore.users.filter(u => getUserRolesList(u).includes(r.name)).length;
      r.userCount = matchCount;
    });

    message.success(`保存成功！作业员「${user.name}」多重岗位角色及菜单特权已安全部署就绪。`);
  }
  isRoleAssModalOpen.value = false;
};

// ===================== [3. 绑定物理可阅站点边界 (A-Modal)] =====================
const isSiteAssModalOpen = ref(false);
const editingUserForSite = ref<any>(null);
const tempSitesChecked = ref<string[]>([]);
const siteSearchText = ref('');

// 计算过滤后显示的折叠段落
const groupedSites = computed(() => {
  const result: Record<string, any[]> = {
    '华北区域': [],
    '华东区域': [],
    '华南区域': [],
    '华中区域': [],
    '西南区域': [],
    '西北区域': [],
  };
  globalStore.sites.forEach(s => {
    const reg = s.region || '其他区域';
    if (!result[reg]) result[reg] = [];
    result[reg].push(s);
  });
  return result;
});

// 按名称过滤
const filteredGroupedSites = computed(() => {
  const query = siteSearchText.value.toLowerCase().trim();
  const pool = groupedSites.value;
  const finalGroup: Record<string, any[]> = {};

  Object.keys(pool).forEach(region => {
    const list = pool[region].filter(s => 
      !query || s.name.toLowerCase().includes(query) || s.code.toLowerCase().includes(query)
    );
    if (list.length > 0) {
      finalGroup[region] = list;
    }
  });

  return finalGroup;
});

const openAssignSitesModal = (record: any) => {
  editingUserForSite.value = record;
  tempSitesChecked.value = record.allowedSites ? [...record.allowedSites] : [];
  siteSearchText.value = '';
  isSiteAssModalOpen.value = true;
};

// 勾选或去勾选单个站点
const toggleTempSiteCheck = (siteKey: string) => {
  const list = [...tempSitesChecked.value];
  const idx = list.indexOf(siteKey);
  if (idx !== -1) {
    if (list.length === 1) {
      message.warning('多能流安全隔离规定：最少必须为员工指配一座并网看守站点房。');
      return;
    }
    list.splice(idx, 1);
  } else {
    list.push(siteKey);
  }
  tempSitesChecked.value = list;
};

// 区域全选/去选
const isRegionAllChecked = (region: string, sites: any[]) => {
  if (sites.length === 0) return false;
  return sites.every(s => tempSitesChecked.value.includes(s.key));
};

const isRegionIndeterminate = (region: string, sites: any[]) => {
  const checkedCount = sites.filter(s => tempSitesChecked.value.includes(s.key)).length;
  return checkedCount > 0 && checkedCount < sites.length;
};

const toggleRegionAll = (region: string, sites: any[], checked: boolean) => {
  let list = [...tempSitesChecked.value];
  if (checked) {
    // 全选：把未加上的补上
    sites.forEach(s => {
      if (!list.includes(s.key)) {
        list.push(s.key);
      }
    });
  } else {
    // 全消：从 list 中减去当前区域所有
    const regionKeys = sites.map(s => s.key);
    list = list.filter(k => !regionKeys.includes(k));
    if (list.length === 0) {
      // 必须要留存至少一个兜底，避免 0
      list = [sites[0].key];
      message.info('因站点隔离边界保护机制，已自动为您保留受阅一处底层站房。');
    }
  }
  tempSitesChecked.value = list;
};

const saveAssignedSites = () => {
  if (!editingUserForSite.value) return;
  const user = editingUserForSite.value;
  
  const idx = globalStore.users.findIndex(u => u.id === user.id);
  if (idx !== -1) {
    globalStore.users[idx].allowedSites = [...tempSitesChecked.value];
    
    // 如果修改的是当前登录的人 (admin 模拟联动)，则提示重新核载
    if (user.id === 'u-1') {
      message.info('因您的站点可阅边界调控更改，首页、监测桑工图已发生即时物理隔离联动。');
    }
    
    message.success(`保存成功！作业员「${user.name}」所看守受阅物理资产受界锁定成功！`);
  }
  isSiteAssModalOpen.value = false;
};

// ===================== [4. 点击 "站房" 数触发展示 (A-Modal)] =====================
const isSitesListModalOpen = ref(false);
const viewingUserForSites = ref<any>(null);

const showSitesListModal = (record: any) => {
  viewingUserForSites.value = record;
  isSitesListModalOpen.value = true;
};

const getGroupedSitesOfUser = (user: any) => {
  const list: Record<string, any[]> = {};
  if (!user || !user.allowedSites) return list;

  user.allowedSites.forEach((siteKey: string) => {
    const item = globalStore.sites.find(s => s.key === siteKey);
    if (item) {
      const reg = item.region || '其他区域';
      if (!list[reg]) list[reg] = [];
      list[reg].push(item);
    }
  });

  return list;
};

// ===================== [5. 二次确认单项行为操作] =====================
// 状态紧急切换
const handleToggleStatus = (record: any) => {
  const current = record.status;
  const target = current === '启用' ? '停用' : '启用';
  record.status = target;

  if (target === '停用') {
    message.warning({ content: `已对作业员【${record.name}】进行心跳闭锁冻结，登录鉴权密钥即时失效！` });
  } else {
    message.success({ content: `作业员【${record.name}】安全钥匙身份档案激活恢复成功！` });
  }
};

// 重置密码
const handleResetPassword = (record: any) => {
  message.success({ content: `保存成功！作业员「${record.name}」授权哈希已还原重置为 [cecep666] 初始验证戳！` });
};

// ===================== [6. 详情大 Drawer 审计细节] =====================
const isDetailDrawerOpen = ref(false);
const detailUser = ref<any>(null);
const detailActiveTabKey = ref('1');

const openDetailDrawer = (record: any) => {
  // 生成一些随机操作审计以增加高保真实录感
  detailUser.value = record;
  detailActiveTabKey.value = '1';
  isDetailDrawerOpen.value = true;
};

// 动态通过分配角色属性来合并计算菜单
const getComputedMenusOfUser = (user: any) => {
  if (!user) return [];
  const rolesList = getUserRolesList(user);
  const menusSet = new Set<string>();

  globalStore.roles.forEach(roleObj => {
    if (rolesList.includes(roleObj.name)) {
      roleObj.menuRights.forEach(m => {
        if (m === 'all') {
          // 通配
          Object.keys(originalMenuMap).forEach(k => menusSet.add(originalMenuMap[k]));
        } else if (originalMenuMap[m]) {
          menusSet.add(originalMenuMap[m]);
        }
      });
    }
  });

  return Array.from(menusSet);
};

// 按钮特权
const getComputedButtonsShowList = (user: any) => {
  if (!user) return [];
  const rolesList = getUserRolesList(user);
  
  // 敏感按钮选项池
  const mockButtonDef: Record<string, string> = {
    'btn-platform-add': '第三方网关接入新建绑定权',
    'btn-platform-edit': '数据网格热部署映射重组权',
    'btn-task-run': '电表PCS遥测数据命令强制补采',
    'btn-tariff-add': '新建峰谷电价定方案调度权',
    'btn-tariff-edit': '分时购电单价高频浮动修改权',
    'btn-alarm-confirm': '一期配网告警紧急签署确权',
    'btn-alarm-handle': '现场缺陷消缺作业工单分派签发权',
    'btn-user-add': '编制新作业组员并下发安全卡套权',
    'btn-site-add': '物理变电光储设施台账删除修改'
  };

  const results: { key: string, label: string }[] = [];
  const buttonKeysSet = new Set<string>();

  globalStore.roles.forEach(roleObj => {
    if (rolesList.includes(roleObj.name)) {
      roleObj.buttonRights.forEach(b => {
        if (b === 'all') {
          Object.keys(mockButtonDef).forEach(k => buttonKeysSet.add(k));
        } else {
          buttonKeysSet.add(b);
        }
      });
    }
  });

  buttonKeysSet.forEach(key => {
    if (mockButtonDef[key]) {
      results.push({ key, label: mockButtonDef[key] });
    }
  });

  return results;
};

// 会话日志Mock
const auditLogsMock = [
  { time: '2026-05-26 11:24:12', ip: '112.90.142.15', desc: '通过网页端进行登录鉴权', detail: '输入账号密码并验证密码口令，下发多能流2小时临时授权令牌，验签顺利无告阻。' },
  { time: '2026-05-26 10:45:00', ip: '112.90.142.15', desc: '执行[北京示范站房]PCS自控曲线校验', detail: '对PCS大电堆电池簇SOC进行了指标比率巡查核对，校验无超压，数据流写入缓存。' },
  { time: '2026-05-25 16:32:11', ip: '112.91.13.44', desc: '触发智能告警消缺工单分发', detail: '对储能柜二期逆变器过载发出应急排查派单，安全电子签名下刷。' },
  { time: '2026-05-25 09:12:00', ip: '112.91.13.44', desc: '成功握手并同步星络充电接口协议', detail: '调用第三方同步平台参数, 核验5项映射配置，取得20条同步任务回响。' }
];
</script>

<style scoped>
.cecep-user-table :deep(.ant-table-thead > tr > th) {
  background-color: #f8fafc !important;
  color: #475569 !important;
  font-weight: 700 !important;
  font-size: 11.5px !important;
  border-bottom: 2px solid #e2e8f0 !important;
}

.cecep-user-table :deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid #f1f5f9 !important;
}

.cecep-detail-tabs :deep(.ant-tabs-nav-wrap) {
  border-bottom: 1px solid #e2e8f0 !important;
}

.cecep-detail-tabs :deep(.ant-tabs-tab-btn) {
  font-weight: 700 !important;
  font-size: 11px !important;
}
</style>
