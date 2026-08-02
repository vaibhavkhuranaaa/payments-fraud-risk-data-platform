#!/usr/bin/env python3
"""Chronological baseline/challenger evaluation from approved PostgreSQL fields."""
from __future__ import annotations
import argparse, json, os, time
from pathlib import Path
import numpy as np
import psycopg
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import average_precision_score, brier_score_loss

def recall_at_rate(y, scores, rate=0.01):
    n = max(1, round(len(scores) * rate)); top = np.argpartition(scores, -n)[-n:]
    return float(y[top].sum() / max(1, y.sum()))

def main():
    p=argparse.ArgumentParser(); p.add_argument('--database-url',default=os.getenv('DATABASE_URL')); p.add_argument('--output',type=Path,default=Path('data/validated/evaluation.json')); args=p.parse_args()
    if not args.database_url: raise SystemExit('DATABASE_URL is required')
    started=time.perf_counter()
    with psycopg.connect(args.database_url) as c:
        rows=c.execute("SELECT source_file, event_ts::date, amount::float, merchant, category, is_fraud::int FROM risk.event_features ORDER BY event_ts, event_id").fetchall()
    split=np.array([r[0]=='fraudTrain.csv' for r in rows]); y=np.array([r[5] for r in rows]); x=np.array([[r[2],r[3],r[4]] for r in rows],dtype=object)
    pre=ColumnTransformer([('amount',StandardScaler(),[0]),('categories',OneHotEncoder(handle_unknown='ignore'),[1,2])])
    models={'baseline':make_pipeline(pre,LogisticRegression(max_iter=150,n_jobs=-1)), 'challenger':make_pipeline(pre,LogisticRegression(C=3,max_iter=150,n_jobs=-1,class_weight='balanced'))}
    result={'split':'chronological source train/test','review_rate':0.01,'models':{},'elapsed_seconds':None}
    for name,model in models.items():
        model.fit(x[split],y[split]); scores=model.predict_proba(x[~split])[:,1]; truth=y[~split]
        bins=[]
        for low, high in zip(np.linspace(0, .9, 10), np.linspace(.1, 1, 10)):
            mask=(scores>=low)&((scores<high) if high<1 else (scores<=high)); bins.append({'low':round(float(low),1),'high':round(float(high),1),'count':int(mask.sum()),'observed_rate':float(truth[mask].mean()) if mask.any() else None})
        top=np.argpartition(scores,-max(1,round(len(scores)*.01)))[-max(1,round(len(scores)*.01)):]
        weeks=np.array([str(r[1])[:7] for r, is_test in zip(rows, ~split) if is_test]); selected_weeks=weeks[top]
        result['models'][name]={'pr_auc':average_precision_score(truth,scores),'recall_at_review_rate':recall_at_rate(truth,scores),'brier_score':brier_score_loss(truth,scores),'alert_volume':int(round(len(scores)*.01)),'calibration_bins':bins,'alert_volume_by_month':{month:int((selected_weeks==month).sum()) for month in sorted(set(selected_weeks))}}
    result['elapsed_seconds']=round(time.perf_counter()-started,3); args.output.parent.mkdir(parents=True,exist_ok=True); args.output.write_text(json.dumps(result,indent=2)+'\n')
if __name__=='__main__': main()
