import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import './styles.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const statuses = ['APPLIED','REVIEWING','SHORTLISTED','REJECTED','HIRED'];

async function request(path, options={}) {
  const token = localStorage.getItem('access');
  const response = await fetch(API + path, {headers:{'Content-Type':'application/json', ...(token ? {Authorization:`Bearer ${token}`} : {})}, ...options});
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(typeof data === 'object' ? Object.values(data).flat().join(' ') : 'Request failed');
  return data;
}

function Auth({onAuth}) {
  const [register,setRegister]=useState(false), [error,setError]=useState('');
  const submit=async e=>{e.preventDefault(); setError(''); const f=new FormData(e.currentTarget); const values=Object.fromEntries(f);
    try { let data;
      if(register) data=await request('/auth/register/',{method:'POST',body:JSON.stringify(values)});
      else {data=await request('/auth/login/',{method:'POST',body:JSON.stringify(values)}); data.user=await fetch(API+'/auth/me/',{headers:{Authorization:`Bearer ${data.access}`}}).then(r=>r.json())}
      localStorage.setItem('access',data.access); onAuth(data.user);
    } catch(err){setError(err.message)} };
  return <main className="auth"><section className="auth-copy"><div className="brand">Screenwise</div><h1>Hiring decisions, without the noise.</h1><p>A focused workspace for publishing roles, reviewing talent, and keeping every candidate informed.</p></section><section className="auth-card"><h2>{register?'Create your account':'Welcome back'}</h2><p>{register?'Join as a recruiter or candidate.':'Sign in to continue to your workspace.'}</p><form onSubmit={submit}>
    {register&&<><div className="two"><label>First name<input name="first_name" required/></label><label>Last name<input name="last_name" required/></label></div><label>Email<input name="email" type="email" required/></label></>}
    <label>Username<input name="username" required/></label><label>Password<input name="password" type="password" minLength="8" required/></label>
    {register&&<label>I am a<select name="role"><option value="CANDIDATE">Candidate</option><option value="RECRUITER">Recruiter</option></select></label>}
    {error&&<div className="error">{error}</div>}<button>{register?'Create account':'Sign in'}</button>
  </form><button className="link" onClick={()=>setRegister(!register)}>{register?'Already have an account? Sign in':'New here? Create an account'}</button></section></main>
}

function JobForm({job,onDone,onCancel}) { const submit=async e=>{e.preventDefault(); const values=Object.fromEntries(new FormData(e.currentTarget)); await request(job?`/jobs/${job.id}/`:'/jobs/',{method:job?'PUT':'POST',body:JSON.stringify(values)}); onDone()}; return <div className="modal"><form className="panel" onSubmit={submit}><div className="panel-head"><h2>{job?'Edit job':'Create a new job'}</h2><button type="button" className="icon" onClick={onCancel}>×</button></div><label>Job title<input name="title" defaultValue={job?.title} required/></label><div className="two"><label>Location<input name="location" defaultValue={job?.location} required/></label><label>Employment type<select name="employment_type" defaultValue={job?.employment_type||'Full-time'}><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option></select></label></div><label>Description<textarea name="description" rows="7" defaultValue={job?.description} required/></label><div className="actions"><button type="button" className="secondary" onClick={onCancel}>Cancel</button><button>Save job</button></div></form></div> }

function ApplyModal({job,onDone,onCancel}) {const submit=async e=>{e.preventDefault(); await request(`/jobs/${job.id}/apply/`,{method:'POST',body:JSON.stringify(Object.fromEntries(new FormData(e.currentTarget)))}); onDone()}; return <div className="modal"><form className="panel" onSubmit={submit}><div className="panel-head"><div><span className="eyebrow">Apply for</span><h2>{job.title}</h2></div><button type="button" className="icon" onClick={onCancel}>×</button></div><label>Resume URL<input name="resume_url" type="url" placeholder="https://drive.google.com/..." required/></label><label>Cover letter <span className="muted">optional</span><textarea name="cover_letter" rows="6" placeholder="Tell the recruiter why you're a strong fit."/></label><div className="actions"><button type="button" className="secondary" onClick={onCancel}>Cancel</button><button>Submit application</button></div></form></div>}

function App(){const [user,setUser]=useState(null),[jobs,setJobs]=useState([]),[apps,setApps]=useState([]),[modal,setModal]=useState(null),[notice,setNotice]=useState(''),[tab,setTab]=useState('jobs');
 const load=async()=>{try{setJobs(await request('/jobs/')); setApps(await request('/applications/'))}catch{}};
 useEffect(()=>{if(localStorage.getItem('access'))request('/auth/me/').then(setUser).catch(()=>localStorage.clear())},[]); useEffect(()=>{if(user)load()},[user]);
 if(!user)return <Auth onAuth={setUser}/>; const recruiter=user.role==='RECRUITER';
 const done=async msg=>{setModal(null);setNotice(msg);await load();setTimeout(()=>setNotice(''),2500)};
 const close=async job=>{if(confirm(`Close ${job.title}? Candidates will no longer be able to apply.`)){await request(`/jobs/${job.id}/close/`,{method:'PATCH'});done('Job closed')}};
 const update=async(id,status)=>{await request(`/applications/${id}/status/`,{method:'PATCH',body:JSON.stringify({status})});done('Candidate status updated')};
 return <><header><div className="brand">Screenwise</div><nav><button className={tab==='jobs'?'active':''} onClick={()=>setTab('jobs')}>Jobs</button><button className={tab==='apps'?'active':''} onClick={()=>setTab('apps')}>{recruiter?'Applications':'My applications'}</button></nav><div className="profile"><span>{user.name}</span><small>{recruiter?'Recruiter':'Candidate'}</small></div><button className="logout" onClick={()=>{localStorage.clear();setUser(null)}}>Sign out</button></header>
 <main className="dashboard">{notice&&<div className="toast">{notice}</div>}{tab==='jobs'?<><div className="page-head"><div><span className="eyebrow">{recruiter?'Recruiter workspace':'Opportunities'}</span><h1>{recruiter?'Your jobs':'Find your next role'}</h1><p>{recruiter?'Create roles and follow candidate activity.':'Explore open positions and apply in minutes.'}</p></div>{recruiter&&<button onClick={()=>setModal({type:'job'})}>+ Create job</button>}</div>
 <div className="stats"><div><strong>{jobs.length}</strong><span>{recruiter?'Total jobs':'Open roles'}</span></div><div><strong>{recruiter?jobs.filter(j=>j.status==='OPEN').length:apps.length}</strong><span>{recruiter?'Currently open':'Applications sent'}</span></div><div><strong>{recruiter?apps.length:apps.filter(a=>a.status==='SHORTLISTED').length}</strong><span>{recruiter?'Applications':'Shortlisted'}</span></div></div>
 <section className="grid">{jobs.map(job=><article className="job" key={job.id}><div className="job-top"><span className={'badge '+job.status.toLowerCase()}>{job.status}</span><span className="date">{new Date(job.created_at).toLocaleDateString()}</span></div><h3>{job.title}</h3><p className="meta">{job.location} · {job.employment_type}</p><p>{job.description}</p><div className="job-foot">{recruiter?<><span><strong>{job.application_count}</strong> applicants</span><div><button className="secondary small" onClick={()=>setModal({type:'job',job})}>Edit</button>{job.status==='OPEN'&&<button className="danger small" onClick={()=>close(job)}>Close</button>}</div></>:<button disabled={job.has_applied} onClick={()=>setModal({type:'apply',job})}>{job.has_applied?'Applied':'Apply now'}</button>}</div></article>)}{!jobs.length&&<div className="empty"><h3>No jobs here yet</h3><p>{recruiter?'Create your first role to start receiving applications.':'Check back soon for new opportunities.'}</p></div>}</section></>:<><div className="page-head"><div><span className="eyebrow">Pipeline</span><h1>{recruiter?'Candidate applications':'Your applications'}</h1><p>{recruiter?'Review every applicant and move them through the hiring process.':'Follow the latest status of every role you applied to.'}</p></div></div><section className="table-wrap"><table><thead><tr><th>{recruiter?'Candidate':'Position'}</th>{recruiter&&<th>Position</th>}<th>Applied</th><th>Resume</th><th>Status</th></tr></thead><tbody>{apps.map(a=><tr key={a.id}><td><strong>{recruiter?a.candidate_name:a.job_title}</strong>{recruiter&&<small>{a.candidate_email}</small>}</td>{recruiter&&<td>{a.job_title}</td>}<td>{new Date(a.created_at).toLocaleDateString()}</td><td><a href={a.resume_url} target="_blank">View resume</a></td><td>{recruiter?<select value={a.status} onChange={e=>update(a.id,e.target.value)}>{statuses.map(s=><option key={s}>{s}</option>)}</select>:<span className={'badge '+a.status.toLowerCase()}>{a.status}</span>}</td></tr>)}</tbody></table>{!apps.length&&<div className="empty"><h3>No applications yet</h3><p>Applications will appear here when they are submitted.</p></div>}</section></>}</main>
 {modal?.type==='job'&&<JobForm job={modal.job} onCancel={()=>setModal(null)} onDone={()=>done(modal.job?'Job updated':'Job created')}/>} {modal?.type==='apply'&&<ApplyModal job={modal.job} onCancel={()=>setModal(null)} onDone={()=>done('Application submitted')}/>}</>}
createRoot(document.getElementById('root')).render(<App/>);

