// 中国节能 CECEP 光储充能源管理平台 一期 Mock 数据
export interface Site {
  key: string;
  name: string;
  code: string;
  region: string;
  address: string;
  type: '光储充一体站' | '光伏站' | '储能站' | '充电站' | string;
  pvCapacity: number; // kWp
  essCapacity: number; // kWh
  chargerCount: number;
  deviceCount: number;
  status: '正常' | '预警' | '告警' | '离线' | '停用';
  accessStatus: '已接入' | '部分接入' | '未接入';
  createdAt: string;
  longitude: number;
  latitude: number;
  manager: string;
  phone: string;
  thirdPartySynced: boolean;
  remark: string;
}

export interface Platform {
  id: string;
  name: string;
  type: '光伏平台' | '储能平台' | '充电桩平台' | '电表平台' | '气象平台';
  method: 'API拉取' | '消息推送' | '文件同步';
  status: '正常' | '异常' | '停用';
  lastSync: string;
  owner: string;
  url: string;
  authType: 'Token' | 'AppKey-Secret' | 'OAuth2.0';
  appKey?: string;
  secret?: string;
  period: string;
  remark: string;
}

export interface SyncTask {
  id: string;
  name: string;
  platform: string;
  target: string;
  period: string;
  lastExecution: string;
  status: '成功' | '失败' | '进行中' | '空闲';
  successCount: number;
  failCount: number;
}

export interface Device {
  id: string;
  name: string;
  type: '逆变器' | '储能PCS' | '电池管理系统(BMS)' | '充电桩' | '关口电表';
  site: string;
  source: string;
  thirdPartyId: string;
  status: '运行' | '待机' | '故障' | '离线';
  lastUpdate: string;
}

export interface Point {
  id: string;
  name: string;
  code: string;
  device: string;
  unit: string;
  type: '模拟量' | '状态量' | '累计电量';
  status: '就绪' | '异常';
  thirdField: string;
  value: string | number;
  lastUpdate: string;
}

export interface Alarm {
  id: string;
  time: string;
  level: '一级(紧急)' | '二级(重要)' | '三级(次要)';
  source: string;
  device: string;
  type: string;
  content: string;
  status: '待确认' | '已确认' | '已处理';
  handler?: string;
  handleTime?: string;
  handleRemark?: string;
}

export interface ChargingOrder {
  id: string;
  pileId: string;
  startTime: string;
  endTime: string;
  duration: string;
  energy: number; // kWh
  amount: number; // 元
  paymentStatus: '已支付' | '未支付';
  orderStatus: '进行中' | '已完成';
}

// 1. 站点数据
export const mockSites: Site[] = [
  {
    key: 'site-01',
    name: '中节能北京光储充示范站',
    code: 'CECEP-BJ-001',
    region: '华北区域',
    address: '北京市海淀区中节能研发基地',
    type: '光储充一体站',
    pvCapacity: 350,
    essCapacity: 800,
    chargerCount: 16,
    deviceCount: 22,
    status: '正常',
    accessStatus: '已接入',
    createdAt: '2024-03-12 09:00:00',
    longitude: 116.3974,
    latitude: 39.9087,
    manager: '王建平',
    phone: '13811112222',
    thirdPartySynced: true,
    remark: '国家重点微网示范试点工程'
  },
  {
    key: 'site-02',
    name: '中节能上海光储充站',
    code: 'CECEP-SH-002',
    region: '华东区域',
    address: '上海市浦东新区临港重装备园区18号',
    type: '光储充一体站',
    pvCapacity: 500,
    essCapacity: 1200,
    chargerCount: 24,
    deviceCount: 30,
    status: '正常',
    accessStatus: '已接入',
    createdAt: '2024-06-20 10:30:00',
    longitude: 121.4737,
    latitude: 31.2304,
    manager: '李明德',
    phone: '13922223333',
    thirdPartySynced: true,
    remark: '临港自贸区高低压微网联调示范站'
  },
  {
    key: 'site-03',
    name: '中节能杭州光储充站',
    code: 'CECEP-HZ-003',
    region: '华东区域',
    address: '浙江省杭州市余杭区高教路中节能西溪首座',
    type: '储能站',
    pvCapacity: 0,
    essCapacity: 2000,
    chargerCount: 0,
    deviceCount: 15,
    status: '预警',
    accessStatus: '部分接入',
    createdAt: '2024-09-15 14:00:00',
    longitude: 120.1551,
    latitude: 30.2741,
    manager: '赵敏',
    phone: '13533334444',
    thirdPartySynced: false,
    remark: '调峰辅助服务备用电池堆节点'
  },
  {
    key: 'site-04',
    name: '中节能南京光储充站',
    code: 'CECEP-NJ-004',
    region: '华东区域',
    address: '江苏省南京市江宁经济开发区天元中路',
    type: '光伏站',
    pvCapacity: 1200,
    essCapacity: 0,
    chargerCount: 0,
    deviceCount: 18,
    status: '正常',
    accessStatus: '已接入',
    createdAt: '2024-11-05 11:20:00',
    longitude: 118.7969,
    latitude: 32.0603,
    manager: '钱广华',
    phone: '13644445555',
    thirdPartySynced: true,
    remark: '自发自用，高压网关智能接入'
  },
  {
    key: 'site-05',
    name: '中节能广州光储充站',
    code: 'CECEP-GZ-005',
    region: '华南区域',
    address: '广东省广州市南沙区凤凰二路',
    type: '光储充一体站',
    pvCapacity: 250,
    essCapacity: 600,
    chargerCount: 16,
    deviceCount: 18,
    status: '告警',
    accessStatus: '已接入',
    createdAt: '2025-01-18 09:45:00',
    longitude: 113.2644,
    latitude: 23.1292,
    manager: '孙卫国',
    phone: '13755556666',
    thirdPartySynced: true,
    remark: '配网侧微网动态控制，当前BMS有局部预警'
  },
  {
    key: 'site-06',
    name: '中节能深圳光储充站',
    code: 'CECEP-SZ-006',
    region: '华南区域',
    address: '广东省深圳市龙岗区坂田街道中节能环保大厦',
    type: '充电站',
    pvCapacity: 100,
    essCapacity: 150,
    chargerCount: 32,
    deviceCount: 20,
    status: '正常',
    accessStatus: '已接入',
    createdAt: '2025-02-14 15:30:00',
    longitude: 114.0579,
    latitude: 22.5431,
    manager: '周少杰',
    phone: '13866667777',
    thirdPartySynced: true,
    remark: '高功率全液冷超充终端试点'
  },
  {
    key: 'site-07',
    name: '中节能成都光储充站',
    code: 'CECEP-CD-007',
    region: '西南区域',
    address: '四川省成都市双流区空港二路',
    type: '光储充一体站',
    pvCapacity: 450,
    essCapacity: 1000,
    chargerCount: 12,
    deviceCount: 24,
    status: '离线',
    accessStatus: '未接入',
    createdAt: '2025-04-10 16:15:00',
    longitude: 104.0665,
    latitude: 30.5728,
    manager: '吴志鹏',
    phone: '13977778888',
    thirdPartySynced: false,
    remark: '由于地质网络调试，暂时保持单机状态'
  },
  {
    key: 'site-08',
    name: '中节能武汉光储充站',
    code: 'CECEP-WH-008',
    region: '华中区域',
    address: '湖北省武汉市洪山区光谷大道高新二路',
    type: '储能站',
    pvCapacity: 150,
    essCapacity: 800,
    chargerCount: 8,
    deviceCount: 16,
    status: '正常',
    accessStatus: '已接入',
    createdAt: '2025-05-01 10:00:00',
    longitude: 114.3054,
    latitude: 30.5928,
    manager: '郑大勇',
    phone: '13588889999',
    thirdPartySynced: true,
    remark: '多期储能网格联合运行控制中心'
  }
];

// 2. 第三方平台
export const mockPlatforms: Platform[] = [
  { id: 'plat-01', name: '固德威固瑞光伏监控平台', type: '光伏平台', method: 'API拉取', status: '正常', lastSync: '2026-05-23 08:50:00', owner: '张工', url: 'https://api.goodwe-power.com/v2/metrics', authType: 'AppKey-Secret', appKey: 'DEMO_APP_KEY', secret: 'DEMO_SECRET', period: '5分钟', remark: '拉取一期及二期分布式光伏逆变器数据' },
  { id: 'plat-02', name: '高特电子储能EMS平台', type: '储能平台', method: 'API拉取', status: '正常', lastSync: '2026-05-23 08:52:12', owner: '李工', url: 'https://pcs-api.gote-ess.com/v1/realtime', authType: 'Token', appKey: '', secret: 'DEMO_TOKEN', period: '1分钟', remark: '高频获取PCS充放电功率、簇SOC与电芯最高/最低温度' },
  { id: 'plat-03', name: '星络充电桩运营平台', type: '充电桩平台', method: '消息推送', status: '正常', lastSync: '2026-05-23 08:53:15', owner: '赵工', url: 'https://push.star-charging.cn/cecep/orders', authType: 'Token', appKey: '', secret: 'DEMO_TOKEN', period: '事件触发', remark: '订阅订单、结束充电包、告警报文推送' },
  { id: 'plat-04', name: '威胜电表计量网关平台', type: '电表平台', method: 'API拉取', status: '正常', lastSync: '2026-05-23 08:50:00', owner: '张工', url: 'https://meter.wasion-iot.com/api', authType: 'AppKey-Secret', appKey: 'DEMO_APP_KEY', secret: 'DEMO_SECRET', period: '15分钟', remark: '获取关口结算平、峰、谷、尖四个时段的表计累计值' },
  { id: 'plat-05', name: '中央气象台专业气象服务站', type: '气象平台', method: 'API拉取', status: '正常', lastSync: '2026-05-23 08:00:00', owner: '王工', url: 'http://env.cma.gov.cn/api/solar/forecast', authType: 'Token', appKey: '', secret: 'DEMO_TOKEN', period: '1小时', remark: '获取局地太阳总辐射、DNI梯度预测及环境温度' }
];

// 3. 数据同步任务
export const mockSyncTasks: SyncTask[] = [
  { id: 'task-01', name: '逆变器逐分钟功率遥测', platform: '固德威固瑞光伏监控平台', target: '光伏发电量及直流参数', period: '1分钟', lastExecution: '2026-05-23 08:53:00', status: '成功', successCount: 1420, failCount: 0 },
  { id: 'task-02', name: '储能电池堆SOC/电压高频抓取', platform: '高特电子储能EMS平台', target: '电池簇及单体极值监测', period: '30秒', lastExecution: '2026-05-23 08:53:30', status: '成功', successCount: 2840, failCount: 2 },
  { id: 'task-03', name: '用户充电订单流水接收', platform: '星络充电桩运营平台', target: '充电结算与桩耗电遥计', period: '事件推送', lastExecution: '2026-05-23 08:51:24', status: '成功', successCount: 142, failCount: 0 },
  { id: 'task-04', name: '10kV主变压器多功能表计量拉取', platform: '威胜电表计量网关平台', target: '站内总购售电电量', period: '15分钟', lastExecution: '2026-05-23 08:45:00', status: '成功', successCount: 95, failCount: 1 },
  { id: 'task-05', name: '日辐射与云量预测预报', platform: '中央气象台专业气象服务站', target: '光照分度预测指标', period: '1小时', lastExecution: '2026-05-23 08:00:00', status: '成功', successCount: 8, failCount: 0 }
];

// 4. 接入异常监控
export interface SyncException {
  id: string;
  time: string;
  platform: string;
  type: string;
  content: string;
  severity: '高' | '中' | '低';
  status: '待排查' | '已恢复';
}

export const mockExceptions: SyncException[] = [
  { id: 'exc-01', time: '2026-05-23 08:45:22', platform: '威胜电表计量网关平台', type: '连接超时(HTTP 504)', content: '计量网关网卡心跳异常，丢包率45%，三次握手超时', severity: '高', status: '待排查' },
  { id: 'exc-02', time: '2026-05-23 08:12:00', platform: '高特电子储能EMS平台', type: '返回为空(Null Field)', content: '电池簇3号单体极值字段缺失，无法映射计算电池寿命', severity: '中', status: '待排查' },
  { id: 'exc-03', time: '2026-05-23 07:30:15', platform: '星络充电桩运营平台', type: '鉴权失败(401 Unauthorized)', content: '星络服务端密钥自动刷新导致原Token失效，已尝试拉取新凭证已恢复', severity: '低', status: '已恢复' }
];

// 5. 电价方案数据
export interface TariffScheme {
  id: string;
  name: string;
  site: string;
  year: string;
  effectiveFrom: string;
  type: '大工业分时电价' | '一般工商业分时电价' | '协议协议定价';
  status: '执行中' | '草稿' | '已停用';
  prices: {
    sharp: number; // 尖
    peak: number;  // 峰
    flat: number;  // 平
    valley: number; // 谷
    deepValley: number; // 深谷
  };
  segments: { start: string; end: string; type: '尖' | '峰' | '平' | '谷' | '深谷' }[];
}

export const mockTariffs: TariffScheme[] = [
  {
    id: 'price-01',
    name: '中节能光储充示范站2026大工业峰谷电价',
    site: '中节能光储充示范站',
    year: '2026',
    effectiveFrom: '2026-01-01',
    type: '大工业分时电价',
    status: '执行中',
    prices: { sharp: 1.28, peak: 1.05, flat: 0.68, valley: 0.32, deepValley: 0.18 },
    segments: [
      { start: '00:00', end: '05:00', type: '谷' },
      { start: '05:00', end: '07:00', type: '深谷' },
      { start: '07:00', end: '08:30', type: '平' },
      { start: '08:30', end: '11:30', type: '峰' },
      { start: '11:30', end: '13:30', type: '尖' },
      { start: '13:30', end: '17:00', type: '峰' },
      { start: '17:00', end: '19:00', type: '平' },
      { start: '19:00', end: '22:00', type: '尖' },
      { start: '22:00', end: '24:00', type: '谷' }
    ]
  },
  {
    id: 'price-02',
    name: '临港一般工商业电价策略V2',
    site: '中节能上海临港微网站点1',
    year: '2026',
    effectiveFrom: '2026-03-01',
    type: '一般工商业分时电价',
    status: '执行中',
    prices: { sharp: 1.15, peak: 0.95, flat: 0.62, valley: 0.35, deepValley: 0.22 },
    segments: [
      { start: '00:00', end: '06:00', type: '谷' },
      { start: '06:00', end: '08:00', type: '平' },
      { start: '08:00', end: '12:00', type: '峰' },
      { start: '12:00', end: '14:00', type: '平' },
      { start: '14:00', end: '17:00', type: '峰' },
      { start: '17:00', end: '21:00', type: '尖' },
      { start: '21:00', end: '24:00', type: '谷' }
    ]
  }
];

// 6. 设备台账 & 点位
export const mockDevices: Device[] = [
  { id: 'PV-INV-001', name: '1号-300kW光伏逆变器', type: '逆变器', site: '中节能光储充示范站', source: '固德威监控平台', thirdPartyId: 'GWE-300K-001', status: '运行', lastUpdate: '2026-05-23 08:53:00' },
  { id: 'PV-INV-002', name: '2号-300kW光伏逆变器', type: '逆变器', site: '中节能光储充示范站', source: '固德威监控平台', thirdPartyId: 'GWE-300K-002', status: '运行', lastUpdate: '2026-05-23 08:52:00' },
  { id: 'ESS-PCS-001', name: '500kW储能变流器PCM', type: '储能PCS', site: '中节能光储充示范站', source: '高特电气EMS', thirdPartyId: 'GOT-PCS-500K-1', status: '运行', lastUpdate: '2026-05-23 08:53:00' },
  { id: 'ESS-BMS-001', name: '1.2MWh磷酸铁锂电池簇群', type: '电池管理系统(BMS)', site: '中节能光储充示范站', source: '高特电气EMS', thirdPartyId: 'GOT-BMS-1.2MW-A', status: '运行', lastUpdate: '2026-05-23 08:53:11' },
  { id: 'EVCS-001', name: '120kW双枪直流快充桩01', type: '充电桩', site: '中节能光储充示范站', source: '星络运营平台', thirdPartyId: 'STR-CS-120K-1', status: '运行', lastUpdate: '2026-05-23 08:53:15' },
  { id: 'EVCS-002', name: '120kW双枪直流快充桩02', type: '充电桩', site: '中节能光储充示范站', source: '星络运营平台', thirdPartyId: 'STR-CS-120K-2', status: '待机', lastUpdate: '2026-05-23 08:53:15' },
  { id: 'EVCS-003', name: '7kW单相交流慢充桩01', type: '充电桩', site: '中节能光储充示范站', source: '星络运营平台', thirdPartyId: 'STR-CS-7K-1', status: '运行', lastUpdate: '2026-05-23 08:51:00' },
  { id: 'METER-001', name: '10kV网侧并网总电表', type: '关口电表', site: '中节能光储充示范站', source: '威胜表计平台', thirdPartyId: 'WAS-METER-10KV', status: '运行', lastUpdate: '2026-05-23 08:50:00' }
];

export const mockPoints: Point[] = [
  { id: 'pt-01', name: '光伏1号交流有功功率', code: 'PV_01_PAC', device: '1号-300kW光伏逆变器', unit: 'kW', type: '模拟量', status: '就绪', thirdField: 'ActivePower_AC', value: 145.2, lastUpdate: '2026-05-23 08:53:00' },
  { id: 'pt-02', name: '光伏1号日发电量', code: 'PV_01_EDAY', device: '1号-300kW光伏逆变器', unit: 'kWh', type: '累计电量', status: '就绪', thirdField: 'E_Day_AC', value: 1680.5, lastUpdate: '2026-05-23 08:53:00' },
  { id: 'pt-03', name: '电池堆最高单体温度', code: 'BMS_TEMP_MAX', device: '1.2MWh磷酸铁锂电池簇群', unit: '℃', type: '模拟量', status: '就绪', thirdField: 'MaxTemp_Cel', value: 32.5, lastUpdate: '2026-05-23 08:53:11' },
  { id: 'pt-04', name: '储能PCS有功功率', code: 'PCS_PAC', device: '500kW储能变流器PCM', unit: 'kW', type: '模拟量', status: '就绪', thirdField: 'InvPowerActive', value: -120.0, lastUpdate: '2026-05-23 08:53:00' },
  { id: 'pt-05', name: '电池系统SOC', code: 'ESS_SOC', device: '1.2MWh磷酸铁锂电池簇群', unit: '%', type: '模拟量', status: '就绪', thirdField: 'StateOfCharge', value: 68.0, lastUpdate: '2026-05-23 08:53:11' },
  { id: 'pt-06', name: '120kW快充桩01A枪头电流', code: 'EV_01_IA', device: '120kW双枪直流快充桩01', unit: 'A', type: '模拟量', status: '就绪', thirdField: 'PortA_Current', value: 145.8, lastUpdate: '2026-05-23 08:53:15' }
];

// 7. 告警登记
export const mockAlarms: Alarm[] = [
  { id: 'al-01', time: '2026-05-23 08:42:15', level: '一级(紧急)', source: '储能系统', device: '500kW储能变流器PCM', type: '配电拓扑故障', content: '电池堆2号簇发生单体电池过充引发温控降载，功率已被限幅至60kW级', status: '待确认' },
  { id: 'al-02', time: '2026-05-23 08:21:05', level: '二级(重要)', source: '充电桩', device: '120kW双枪直流快充桩01', type: '控制导引告警', content: '快充桩01检测到对端车辆BMS辅助供电发生电压振荡，枪口自保护锁定', status: '已确认', handler: '张工', handleTime: '2026-05-23 08:30:00', handleRemark: '系统自锁扣除，待现场维护人员巡回。' },
  { id: 'al-03', time: '2026-05-23 07:15:30', level: '三级(次要)', source: '接入平台', device: '威胜网关', type: '接口时延过高', content: '威胜电表网关连接延迟突破5000ms触发波动告警', status: '已处理', handler: '李工', handleTime: '2026-05-23 07:45:00', handleRemark: '执行了链路拨测与网络路由重定向成功。' },
  { id: 'al-04', time: '2026-05-23 08:49:10', level: '二级(重要)', source: '电网计量', device: '10kV主变压器', type: '变压器负荷阈警', content: '总耗电负荷瞬时超过780kW(变压器许可85%限额)，建议EMS启动电池应急放电', status: '待确认' }
];

// 8. 充电订单
export const mockOrders: ChargingOrder[] = [
  { id: 'ORD-20260523-01', pileId: 'EVCS-001', startTime: '2026-05-23 08:00:23', endTime: '2026-05-23 08:42:00', duration: '41分37秒', energy: 35.8, amount: 53.7, paymentStatus: '已支付', orderStatus: '已完成' },
  { id: 'ORD-20260523-02', pileId: 'EVCS-001', startTime: '2026-05-23 08:12:15', endTime: '2026-05-23 08:52:12', duration: '39分57秒', energy: 31.2, amount: 46.8, paymentStatus: '已支付', orderStatus: '已完成' },
  { id: 'ORD-20260523-03', pileId: 'EVCS-002', startTime: '2026-05-23 08:22:11', endTime: '正在充电...', duration: '正在进行...', energy: 12.5, amount: 18.75, paymentStatus: '未支付', orderStatus: '进行中' },
  { id: 'ORD-20260523-04', pileId: 'EVCS-003', startTime: '2026-05-23 07:15:00', endTime: '2026-05-23 08:35:00', duration: '1小时20分', energy: 8.5, amount: 12.75, paymentStatus: '已支付', orderStatus: '已完成' }
];

// 9. 主要指标，支持根据站点切换
export const getOverviewMetrics = (siteKey: string) => {
  const multiplier = siteKey === 'site-01' ? 1.0 : siteKey === 'site-02' ? 0.6 : 0.8;
  return {
    pvPower: Math.round(286.5 * multiplier * 10) / 10,
    pvTodayEnergy: Math.round(3268 * multiplier),
    pvTotalEnergy: Math.round(184200 * multiplier),
    essSoc: Math.round((multiplier === 1.0 ? 68 : multiplier === 0.6 ? 45 : 82)),
    essPower: multiplier === 1.0 ? -120 : multiplier === 0.6 ? 85 : -50, // 负数代表充电/正数放电
    essTodayCharge: Math.round(920 * multiplier),
    essTodayDischarge: Math.round(860 * multiplier),
    chargerCount: Math.round(10 * multiplier),
    chargerOnline: Math.round(8 * multiplier),
    chargerOccupied: Math.round(4 * multiplier),
    chargerTodayEnergy: Math.round(1856 * multiplier),
    chargerTodayRevenue: Math.round(3920 * multiplier),
    gridPower: Math.round(420 * multiplier),
    gridTodayBuy: Math.round(4850 * multiplier),
    gridTodaySell: Math.round(620 * multiplier),
    currentDemand: Math.round(760 * multiplier),
    targetDemand: Math.round(900 * multiplier),
    todayRevenue: Math.round(8630 * multiplier),
    monthRevenue: Math.round(242000 * multiplier),
    totalRevenue: Math.round(3650000 * multiplier),
    todayCarbon: Math.round(2.8 * multiplier * 10) / 10
  };
};

// 10. 用户管理
export interface User {
  id: string;
  name: string;
  account: string;
  phone: string;
  department: string;
  role: string;
  status: '启用' | '停用';
}

export const mockUsers: User[] = [
  { id: 'u-1', name: '张建国', account: 'admin', phone: '13812345678', department: '信息化保障部', role: '系统管理员', status: '启用' },
  { id: 'u-2', name: '李光华', account: 'manager_li', phone: '13987654321', department: '中节能运营班组', role: '站点值班长', status: '启用' },
  { id: 'u-3', name: '王敏敏', account: 'operator_wang', phone: '13566778899', department: '资产运维室', role: '运维工程师', status: '启用' }
];

// 11. 角色列表
export interface Role {
  id: string;
  name: string;
  code: string;
  desc: string;
  menuRights: string[];
  roleType: '系统角色' | '业务角色' | '只读角色';
  userCount: number;
  status: '启用' | '停用';
  createdAt: string;
  buttonRights: string[];
}

export const mockRoles: Role[] = [
  {
    id: 'r-1',
    name: '超级管理员',
    code: 'ROLE_SUPER_ADMIN',
    desc: '拥有系统全局管理权及全部配置最高读写与授权权限',
    menuRights: ['all'],
    roleType: '系统角色',
    userCount: 1,
    status: '启用',
    createdAt: '2024-01-10 08:00:00',
    buttonRights: ['all']
  },
  {
    id: 'r-2',
    name: '平台管理员',
    code: 'ROLE_ADMIN',
    desc: '负责除授权外的通用平台运行、设备能流及第三方参数配置调整',
    menuRights: ['dashboard', 'big-screen', 'integration', 'integration-platform', 'integration-config', 'integration-task', 'integration-mapping', 'integration-log', 'integration-exception', 'tariff', 'pv', 'storage', 'charging', 'grid', 'energy-flow', 'revenue', 'device', 'alarm', 'report', 'system', 'system-user', 'system-site'],
    roleType: '系统角色',
    userCount: 2,
    status: '启用',
    createdAt: '2024-02-15 09:30:00',
    buttonRights: ['btn-platform-view', 'btn-platform-add', 'btn-platform-edit', 'btn-task-view', 'btn-task-add', 'btn-task-edit', 'btn-task-run', 'btn-task-log', 'btn-tariff-view', 'btn-tariff-add', 'btn-tariff-edit', 'btn-alarm-view', 'btn-alarm-confirm', 'btn-alarm-handle', 'btn-report-view', 'btn-user-add', 'btn-user-edit', 'btn-site-add', 'btn-site-edit']
  },
  {
    id: 'r-3',
    name: '运营管理员',
    code: 'ROLE_OPER_MGR',
    desc: '针对各站能效指标、电价设定、充电账单进行精细化策略调度及报告导出',
    menuRights: ['dashboard', 'big-screen', 'tariff', 'pv', 'storage', 'charging', 'grid', 'energy-flow', 'revenue', 'report'],
    roleType: '业务角色',
    userCount: 1,
    status: '启用',
    createdAt: '2024-03-20 10:15:00',
    buttonRights: ['btn-tariff-view', 'btn-tariff-add', 'btn-tariff-edit', 'btn-tariff-copy', 'btn-tariff-export', 'btn-report-view', 'btn-report-export']
  },
  {
    id: 'r-4',
    name: '运维人员',
    code: 'ROLE_OPERATOR',
    desc: '负责现场设备台账、遥测点位绑定、警情确报并执行闭环派工消缺',
    menuRights: ['dashboard', 'pv', 'storage', 'charging', 'grid', 'energy-flow', 'device', 'alarm'],
    roleType: '业务角色',
    userCount: 4,
    status: '启用',
    createdAt: '2524-11-12 11:00:00',
    buttonRights: ['btn-alarm-view', 'btn-alarm-confirm', 'btn-alarm-handle', 'btn-alarm-export']
  },
  {
    id: 'r-5',
    name: '客户查看人员',
    code: 'ROLE_CUSTOMER',
    desc: '服务于园区或集团大客户，只读预览综合能流、环境减碳贡献大屏',
    menuRights: ['dashboard', 'big-screen', 'pv', 'storage', 'charging', 'energy-flow'],
    roleType: '只读角色',
    userCount: 12,
    status: '启用',
    createdAt: '2025-01-05 14:20:00',
    buttonRights: ['btn-tariff-view']
  },
  {
    id: 'r-6',
    name: '财务查看人员',
    code: 'ROLE_FINANCE',
    desc: '负责站房能效结算审计、购电售电计价单和多期报表结算只读查账',
    menuRights: ['dashboard', 'tariff', 'revenue', 'report'],
    roleType: '只读角色',
    userCount: 3,
    status: '启用',
    createdAt: '2025-02-14 16:00:00',
    buttonRights: ['btn-tariff-view', 'btn-tariff-export', 'btn-report-view', 'btn-report-export']
  },
  {
    id: 'r-7',
    name: '第三方接口管理员',
    code: 'ROLE_API_ADMIN',
    desc: '专负第三方网关遥测心跳握手，调度同步、映射映射参数补采消错',
    menuRights: ['dashboard', 'integration', 'integration-platform', 'integration-config', 'integration-task', 'integration-mapping', 'integration-log', 'integration-exception'],
    roleType: '系统角色',
    userCount: 2,
    status: '启用',
    createdAt: '2025-04-18 09:12:00',
    buttonRights: ['btn-platform-view', 'btn-platform-add', 'btn-platform-edit', 'btn-platform-delete', 'btn-platform-test', 'btn-platform-status', 'btn-task-view', 'btn-task-add', 'btn-task-edit', 'btn-task-run', 'btn-task-log', 'btn-task-delete']
  }
];
