import { reactive, watch } from 'vue';

export interface PatrolPlanItem {
  id: string;
  siteName: string;
  responsiblePerson: string;
  phone: string;
  interval: string; // e.g. "30天", "45天"
  endTime: string;  // "永不" or date
  firstExecution: string;
  reminderTime: string; // in days
  cyclesCount: number;
  extraReminders: string[];
  itemsGroup: {
    pvModules: string[];
    mounts: string[];
  };
}

export interface PatrolTaskItem {
  id: string;
  siteName: string;
  responsiblePerson: string;
  phone: string;
  status: '未开始' | '未填写' | '已暂存' | '已完成';
  startTime: string;
  endTime: string;
  currentCycleNum: number;
  totalCycles: number;
  details?: {
    pvModules: {
      has: boolean;
      damage: '正常' | '异常';
      shadow: '正常' | '异常';
      pollution: '正常' | '异常';
      photos: string[];
    };
    mounts: {
      has: boolean;
      loose: '正常' | '异常';
      offset: '正常' | '异常';
      corrosion: '正常' | '异常';
      photos: string[];
    };
  };
}

export interface PatrolRecordItem {
  id: string;
  siteName: string;
  patrolTime: string;
  responsiblePerson: string;
  patrolStaff: string[];
  status: '正常' | '异常';
  address: string;
  staffPhoneTable: { index: number; name: string; phone: string }[];
  details: {
    currentCycleNum: number;
    totalCycles: number;
    pvModules: {
      damage: '正常' | '异常';
      shadow: '正常' | '异常';
      pollution: '正常' | '异常';
      photos: string[];
    };
    mounts: {
      loose: '正常' | '异常';
      offset: '正常' | '异常';
      corrosion: '正常' | '异常';
      photos: string[];
    };
  };
  signatureOperator?: string; // photo or drawing
  signatureManager?: string;  // "待签名" or photo/drawing
}

const DEFAULT_PLANS: PatrolPlanItem[] = [
  {
    id: 'PLAN-001',
    siteName: '中节能嘉兴秀洲 5MW 屋顶分布式光伏电站',
    responsiblePerson: '李光华',
    phone: '13987654321',
    interval: '30天',
    endTime: '永不',
    firstExecution: '2026-06-01 09:00:00',
    reminderTime: '3',
    cyclesCount: 12,
    extraReminders: ['王敏敏'],
    itemsGroup: {
      pvModules: ['组件是否破损', '组件是否存在遮挡', '组件是否存在污染'],
      mounts: ['支架连接处是否松动', '水泥墩是否移位', '支架是否腐蚀']
    }
  },
  {
    id: 'PLAN-002',
    siteName: '中节能绍兴柯桥 8MW 印染厂光储系统项目',
    responsiblePerson: '王敏敏',
    phone: '13566778899',
    interval: '45天',
    endTime: '2027-06-30',
    firstExecution: '2026-06-05 10:00:00',
    reminderTime: '2',
    cyclesCount: 8,
    extraReminders: ['张建国'],
    itemsGroup: {
      pvModules: ['组件是否破损', '组件是否存在遮挡', '组件是否存在污染'],
      mounts: ['支架连接处是否松动', '水泥墩是否移位', '支架是否腐蚀']
    }
  },
  {
    id: 'PLAN-003',
    siteName: '中节能湖州南浔 10MW 渔光互补光伏电站',
    responsiblePerson: '刘晨波',
    phone: '18857112024',
    interval: '60天',
    endTime: '永不',
    firstExecution: '2026-05-10 08:30:00',
    reminderTime: '5',
    cyclesCount: 6,
    extraReminders: ['李光华', '王敏敏'],
    itemsGroup: {
      pvModules: ['组件是否破损', '组件是否存在遮挡', '组件是否存在污染'],
      mounts: ['支架连接处是否松动', '水泥墩是否移位', '支架是否腐蚀']
    }
  },
  {
    id: 'PLAN-004',
    siteName: '中节能杭州萧山生物医药园光储充示范项目',
    responsiblePerson: '赵明德',
    phone: '15966442018',
    interval: '90天',
    endTime: '2027-12-31',
    firstExecution: '2026-05-15 09:30:00',
    reminderTime: '2',
    cyclesCount: 4,
    extraReminders: [],
    itemsGroup: {
      pvModules: ['组件是否破损', '组件是否存在遮挡', '组件是否存在污染'],
      mounts: ['支架连接处是否松动', '水泥墩是否移位', '支架是否腐蚀']
    }
  }
];

const DEFAULT_TASKS: PatrolTaskItem[] = [
  {
    id: 'TASK-2026-001',
    siteName: '中节能嘉兴秀洲 5MW 屋顶分布式光伏电站',
    responsiblePerson: '李光华',
    phone: '13987654321',
    status: '未填写',
    startTime: '2026-05-26 00:00:00',
    endTime: '2026-06-09 23:59:59',
    currentCycleNum: 1,
    totalCycles: 4
  },
  {
    id: 'TASK-2026-002',
    siteName: '中节能绍兴柯桥 8MW 印染厂光储系统项目',
    responsiblePerson: '王敏敏',
    phone: '13566778899',
    status: '未填写',
    startTime: '2026-05-20 00:00:00',
    endTime: '2026-06-05 23:59:59',
    currentCycleNum: 2,
    totalCycles: 8
  },
  {
    id: 'TASK-2026-003',
    siteName: '中节能湖州南浔 10MW 渔光互补光伏电站',
    responsiblePerson: '刘晨波',
    phone: '18857112024',
    status: '未开始',
    startTime: '2026-06-15 00:00:00',
    endTime: '2026-06-30 23:59:59',
    currentCycleNum: 1,
    totalCycles: 6
  },
  {
    id: 'TASK-2026-004',
    siteName: '中节能杭州萧山生物医药园光储充示范项目',
    responsiblePerson: '赵明德',
    phone: '15966442018',
    status: '已暂存',
    startTime: '2026-05-15 00:00:00',
    endTime: '2026-05-30 23:59:59',
    currentCycleNum: 1,
    totalCycles: 4,
    details: {
      pvModules: {
        has: true,
        damage: '正常',
        shadow: '异常',
        pollution: '正常',
        photos: ['https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&auto=format&fit=crop&q=80']
      },
      mounts: {
        has: true,
        loose: '正常',
        offset: '正常',
        corrosion: '正常',
        photos: []
      }
    }
  }
];

const DEFAULT_RECORDS: PatrolRecordItem[] = [
  {
    id: 'REC-20260526-001',
    siteName: '中节能嘉兴秀洲 5MW 屋顶分布式光伏电站',
    patrolTime: '2026-05-26',
    responsiblePerson: '李光华',
    patrolStaff: ['曹俊杰', '周焱'],
    status: '正常',
    address: '浙江省嘉兴市秀洲经济开发区光伏大道288号中节能秀洲示范基地',
    staffPhoneTable: [
      { index: 1, name: '曹俊杰', phone: '15105841735' },
      { index: 2, name: '周焱', phone: '16679068847' }
    ],
    details: {
      currentCycleNum: 2,
      totalCycles: 4,
      pvModules: {
        damage: '正常',
        shadow: '正常',
        pollution: '正常',
        photos: [
          'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=400&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1620038650424-8547d27e77db?w=400&auto=format&fit=crop&q=80'
        ]
      },
      mounts: {
        loose: '正常',
        offset: '正常',
        corrosion: '正常',
        photos: []
      }
    },
    signatureOperator: '李光华',
    signatureManager: '张建国'
  },
  {
    id: 'REC-20260525-002',
    siteName: '中节能绍兴柯桥 8MW 印染厂光储系统项目',
    patrolTime: '2026-05-25',
    responsiblePerson: '王敏敏',
    patrolStaff: ['蔡海风'],
    status: '异常',
    address: '浙江省绍兴市柯桥区纺织工业园滨海路中节能光储电站',
    staffPhoneTable: [
      { index: 1, name: '蔡海风', phone: '13799882231' }
    ],
    details: {
      currentCycleNum: 1,
      totalCycles: 8,
      pvModules: {
        damage: '正常',
        shadow: '异常',
        pollution: '正常',
        photos: [
          'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&auto=format&fit=crop&q=80'
        ]
      },
      mounts: {
        loose: '正常',
        offset: '正常',
        corrosion: '异常',
        photos: [
          'https://images.unsplash.com/photo-1536852966563-3fd1e5b56853?w=400&auto=format&fit=crop&q=80'
        ]
      }
    },
    signatureOperator: '王敏敏',
    signatureManager: '待签名'
  },
  {
    id: 'REC-20260520-003',
    siteName: '中节能湖州南浔 10MW 渔光互补光伏电站',
    patrolTime: '2026-05-20',
    responsiblePerson: '刘晨波',
    patrolStaff: ['严勇辉', '曾向东'],
    status: '正常',
    address: '浙江省湖州市浔溪镇杨家庄中节能南浔渔光示范电站',
    staffPhoneTable: [
      { index: 1, name: '严勇辉', phone: '15857214011' },
      { index: 2, name: '曾向东', phone: '15067223019' }
    ],
    details: {
      currentCycleNum: 3,
      totalCycles: 6,
      pvModules: {
        damage: '正常',
        shadow: '正常',
        pollution: '正常',
        photos: []
      },
      mounts: {
        loose: '正常',
        offset: '正常',
        corrosion: '正常',
        photos: []
      }
    },
    signatureOperator: '刘晨波',
    signatureManager: '李光华'
  }
];

// 从 localStorage 加载
const loadStoredPlans = (): PatrolPlanItem[] => {
  const cached = localStorage.getItem('cecep_patrol_plans');
  return cached ? JSON.parse(cached) : DEFAULT_PLANS;
};

const loadStoredTasks = (): PatrolTaskItem[] => {
  const cached = localStorage.getItem('cecep_patrol_tasks');
  return cached ? JSON.parse(cached) : DEFAULT_TASKS;
};

const loadStoredRecords = (): PatrolRecordItem[] => {
  const cached = localStorage.getItem('cecep_patrol_records');
  return cached ? JSON.parse(cached) : DEFAULT_RECORDS;
};

export const patrolStore = reactive({
  plans: loadStoredPlans(),
  tasks: loadStoredTasks(),
  records: loadStoredRecords(),

  // 新增/修改巡检计划
  savePlan(plan: PatrolPlanItem) {
    const idx = this.plans.findIndex(p => p.id === plan.id);
    if (idx !== -1) {
      this.plans[idx] = { ...plan };
    } else {
      this.plans.unshift({ ...plan });
      
      // 联动新增一个对应的巡检任务
      const taskId = `TASK-2026-${String(this.tasks.length + 1).padStart(3, '0')}`;
      this.tasks.unshift({
        id: taskId,
        siteName: plan.siteName,
        responsiblePerson: plan.responsiblePerson,
        phone: plan.phone,
        status: '未填写',
        startTime: plan.firstExecution.split(' ')[0] + ' 00:00:00',
        endTime: new Date(new Date(plan.firstExecution.split(' ')[0]).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59',
        currentCycleNum: 1,
        totalCycles: plan.cyclesCount
      });
    }
    this.persistAll();
  },

  // 删除巡检计划
  deletePlan(id: string) {
    this.plans = this.plans.filter(p => p.id !== id);
    this.persistAll();
  },

  // 批量删除
  deletePlans(ids: string[]) {
    this.plans = this.plans.filter(p => !ids.includes(p.id));
    this.persistAll();
  },

  // 提交巡检任务
  submitTask(taskId: string, details: any, isDraft = false) {
    const taskIdx = this.tasks.findIndex(t => t.id === taskId);
    if (taskIdx !== -1) {
      const task = this.tasks[taskIdx];
      task.status = isDraft ? '已暂存' : '已完成';
      task.details = details;

      if (!isDraft) {
        // 联动：生成一条巡检记录
        const recordId = `REC-${new Date().toISOString().replace(/-/g, '').split('T')[0]}-${String(this.records.length + 1).padStart(3, '0')}`;
        
        let address = '北京市海淀区中节能研发基地';
        if (task.siteName.includes('嘉兴')) {
          address = '浙江省嘉兴市秀洲经济开发区光伏大道288号';
        } else if (task.siteName.includes('绍兴')) {
          address = '浙江省绍兴市柯桥区工业园滨海大道100号';
        } else if (task.siteName.includes('湖州')) {
          address = '浙江省湖州市浔溪镇杨家庄中节能基地';
        } else if (task.siteName.includes('杭州')) {
          address = '浙江省杭州市萧山高新开发区生物医药港';
        }

        const isAnyError = 
          details.pvModules.damage === '异常' || 
          details.pvModules.shadow === '异常' || 
          details.pvModules.pollution === '异常' ||
          details.mounts.loose === '异常' || 
          details.mounts.offset === '异常' || 
          details.mounts.corrosion === '异常';

        this.records.unshift({
          id: recordId,
          siteName: task.siteName,
          patrolTime: new Date().toISOString().split('T')[0],
          responsiblePerson: task.responsiblePerson,
          patrolStaff: ['周焱'], // 默认辅助
          status: isAnyError ? '异常' : '正常',
          address,
          staffPhoneTable: [
            { index: 1, name: task.responsiblePerson, phone: task.phone },
            { index: 2, name: '周焱', phone: '16679068847' }
          ],
          details: {
            currentCycleNum: task.currentCycleNum,
            totalCycles: task.totalCycles,
            pvModules: {
              damage: details.pvModules.damage,
              shadow: details.pvModules.shadow,
              pollution: details.pvModules.pollution,
              photos: details.pvModules.photos || []
            },
            mounts: {
              loose: details.mounts.loose,
              offset: details.mounts.offset,
              corrosion: details.mounts.corrosion,
              photos: details.mounts.photos || []
            }
          },
          signatureOperator: task.responsiblePerson,
          signatureManager: '待签名'
        });
      }
    }
    this.persistAll();
  },

  // 签署主管意见
  signManagerRecord(recordId: string) {
    const idx = this.records.findIndex(r => r.id === recordId);
    if (idx !== -1) {
      this.records[idx].signatureManager = '张建国';
    }
    this.persistAll();
  },

  // 批量删除记录
  deleteRecords(ids: string[]) {
    this.records = this.records.filter(r => !ids.includes(r.id));
    this.persistAll();
  },

  // 批量删除任务
  deleteTasks(ids: string[]) {
    this.tasks = this.tasks.filter(t => !ids.includes(t.id));
    this.persistAll();
  },

  persistAll() {
    localStorage.setItem('cecep_patrol_plans', JSON.stringify(this.plans));
    localStorage.setItem('cecep_patrol_tasks', JSON.stringify(this.tasks));
    localStorage.setItem('cecep_patrol_records', JSON.stringify(this.records));
  }
});
