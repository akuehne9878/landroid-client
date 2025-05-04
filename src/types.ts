type ConfigSchedule = {
    m: number;
    distm: number;
    ots: {
      bc: number;
      wtm: number;
    };
    p: number;
    d: [string, number, number][];
    dd: [string, number, number][];
  };
  
  type ConfigAlert = {
    lvl: number;
    t: number;
  };
  
  type ConfigModules = {
    US: {
      enabled: number;
    };
  };
  
  type Config = {
    id: number;
    lg: string;
    tm: string;
    dt: string;
    sc: ConfigSchedule;
    cmd: number;
    mz: number[];
    mzv: number[];
    mzk: number;
    rd: number;
    sn: string;
    al: ConfigAlert;
    tq: number;
    modules: ConfigModules;
  };
  
  type BatteryInfo = {
    t: number;
    v: number;
    p: number;
    nr: number;
    c: number;
    m: number;
  };
  
  type Status = {
    b: number;
    d: number;
    wt: number;
    bl: number;
  };
  
  type RainInfo = {
    s: number;
    cnt: number;
  };
  
  type DataModules = {
    US: {
      stat: string;
    };
  };
  
  type Data = {
    mac: string;
    fw: number;
    fwb: number;
    bt: BatteryInfo;
    dmp: [number, number, number];
    st: Status;
    ls: number;
    le: number;
    lz: number;
    rsi: number;
    lk: number;
    act: number;
    tr: number;
    conn: string;
    rain: RainInfo;
    modules: DataModules;
  };
  
  export type MowerStatus = {
    cfg: Config;
    dat: Data;
  };