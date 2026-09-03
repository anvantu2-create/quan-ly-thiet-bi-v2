import type {Device} from './types';
export const stations=[{id:'pc',name:'Trạm 110kV Phú Chánh',code:'T1'},{id:'bd',name:'Trạm 110kV Bến Đình',code:'T2'},{id:'td',name:'Trạm 110kV Tân Định',code:'T3'}];
export const feeders=[{id:'471',name:'471 Phú Chánh',station:'Phú Chánh'},{id:'473',name:'473 Phú Chánh',station:'Phú Chánh'},{id:'475',name:'475 Bến Đình',station:'Bến Đình'},{id:'477',name:'477 Tân Định',station:'Tân Định'}];
export const devices:Device[]=[
{id:'1',code:'REC-471-01',name:'REC Phú Chánh 3',type:'REC',station:'Phú Chánh',feeder:'471 Phú Chánh',status:'Đóng',enabled:true,pole:'Trụ 42',setting:'400 A'},
{id:'2',code:'LBS-471-02',name:'LBS nhánh Bình Mỹ',type:'LBS',station:'Phú Chánh',feeder:'471 Phú Chánh',status:'Đóng',enabled:true,pole:'Trụ 67',setting:'—'},
{id:'3',code:'LBS-475-01',name:'LBS liên lạc PC–BĐ',type:'LBS',station:'Bến Đình',feeder:'475 Bến Đình',status:'Mở',enabled:true,pole:'Trụ 108',setting:'—'},
{id:'4',code:'DS-477-01',name:'DS Tân Định 1',type:'DS',station:'Tân Định',feeder:'477 Tân Định',status:'Đóng',enabled:false,pole:'Trụ 21',setting:'—'}];
