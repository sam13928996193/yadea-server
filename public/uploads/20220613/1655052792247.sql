select a.m_id,a.make_date,a.m_code,m_name=(select m_name from material_h where m_code=a.m_code),wh_name=(select wh_name from warehouse where wh_id=a.wh_id),a.wh_placecode,a.remain_qty from (
select v.m_id,v.m_code,v.cubage_code,v.color_code,v.make_date,v.wh_id ,v.wh_placecode,b.remain_qty from v_mater_mid_info v,mater_bl_inv b where v.m_id=b.m_id and b.pyear='2022' and b.pmonth='05') as a,
(select v.m_id,v.m_code,v.cubage_code,v.color_code,v.make_date,v.wh_id ,v.wh_placecode,b.remain_qty from v_mater_mid_info v,mater_bl_inv b where v.m_id=b.m_id and b.pyear='2022' and b.pmonth='05') as b
where a.m_code=b.m_code and a.wh_id<>b.wh_id
order by a.m_code


select *from mater_bl_inv where m_id='2000173398'



/*
select v.m_id,v.m_code,v.cubage_code,v.color_code,v.make_date,v.wh_id from v_mater_mid_info v, mater_bl_inv a where 
v.m_id=a.m_id and a.pyear='2022' and a.pmonth='05' 
select * into quanzheng_debug..mater_bl_inv20220531 from mater_bl_inv
select * into quanzheng_debug..mater_bl_inv_bk20220531 from mater_bl_inv_bk

delete from mater_bl_inv_bk where 
INIT_QTY=0 and TURNIN_QTY=0 and TURNOUT_QTY=0 and PIN_QTY=0 and POUT_QTY=0 and ELSEIN_QTY=0 and ELSEOUT_QTY=0 and
	RETURN_QTY=0 and SOUT_QTY=0 and PMIN_QTY=0 and PMOUT_QTY=0 and CHECKIN_QTY=0 and CHECKOUT_QTY=0 and ADJUSTIN_QTY=0 and
	ADJUSTOUT_QTY=0 and UNUSED_QTY=0 and REMAIN_QTY=0 and CHECKINIT_QTY =0

	select count(*) from mater_bl_inv*/