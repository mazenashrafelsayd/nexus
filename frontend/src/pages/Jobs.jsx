import React, { useState } from 'react'
import { Cpu, Blocks, BarChart3, Code2, PenTool } from 'lucide-react'
import Modal from '@/components/Modal'
import { useToast } from '@/components/Toast'

const JOBS = [
  { id:1, title:'Blockchain Developer', icon:Blocks, intro:'Smart contracts, L2, audits, cross-chain.', requirements:[
    '3+ years blockchain dev; Solidity/Rust', 'Deployed to mainnet; security mindset', 'Hardhat/Foundry, TS ecosystem'
  ], responsibilities:[
    'Design & implement smart contracts', 'Write tests and security checks', 'Collaborate with product & research'
  ], benefits:['Remote-first','Conference budget','Equity options'] },
  { id:2, title:'AI Engineer', icon:Cpu, intro:'Ship LLM/ML features into production.', requirements:[
    'Python/TS; vector DBs; evals', 'MLOps pipelines; CI/CD', 'Cloud experience (AWS/GCP/Azure)'
  ], responsibilities:[
    'Build inference & eval harnesses','Implement guardrails and monitoring','Own data/feature pipelines'
  ], benefits:['Flexible hours','Hardware budget','Annual offsite'] },
  { id:3, title:'Data Scientist', icon:BarChart3, intro:'Decision science and applied modeling.', requirements:[
    'SQL/Python; statistics', 'A/B testing and causal basics','Dashboarding/BI tools'
  ], responsibilities:[
    'Define metrics and experiments','Build training datasets','Present findings to stakeholders'
  ], benefits:['Learning time','Wellness stipend','Competitive salary'] },
  { id:4, title:'Full-Stack Developer', icon:Code2, intro:'Frontend + backend across the stack.', requirements:[
    'React, Node.js, REST/GraphQL','Testing and performance','Basic DevOps'
  ], responsibilities:[
    'Build scalable web apps','Design clean APIs','Improve DX and tooling'
  ], benefits:['Career growth','Paid certifications','Remote allowance'] },
  { id:5, title:'UI/UX Designer', icon:PenTool, intro:'Design intuitive, human-centered interfaces for AI & blockchain apps.', requirements:[
    '3+ years in product/UI/UX design roles',
    'Proficiency in Figma, Sketch, or Adobe XD',
    'Strong portfolio demonstrating design systems, responsive layouts, and interaction design',
    'Familiarity with accessibility standards (WCAG) and design for global audiences'
  ], responsibilities:[
    'Collaborate with engineers & PMs to shape product direction',
    'Conduct user research, interviews, and usability testing',
    'Design wireframes, prototypes, and final high-fidelity UI',
    'Define and maintain design guidelines and component libraries',
    'Advocate for user needs while balancing technical feasibility'
  ], benefits:[
    'Creative autonomy and ownership of the design process',
    'Annual design conference sponsorship',
    'Remote-friendly with coworking allowance',
    'Wellness & learning stipends'
  ] }
]

export default function Jobs() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(null)
  const { push } = useToast()

  const onApply = (job) => { setActive(job); setOpen(true) }
  const onSubmit = (e) => {
    e.preventDefault()
    setOpen(false)
    push('Application submitted successfully! We’ll get back to you soon.')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-6">Job Openings</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {JOBS.map(job => {
          const Icon = job.icon
          return (
            <div key={job.id} className="card p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-indigo/10 dark:bg-emerald/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-indigo dark:text-emerald" />
                  </div>
                  <div>
                    <div className="font-semibold text-xl">{job.title}</div>
                    <div className="text-slate-600 dark:text-slate-300">{job.intro}</div>
                  </div>
                </div>
                <button className="btn btn-primary" onClick={() => onApply(job)}>Apply Now</button>
              </div>
              <div className="mt-4 grid sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold">Requirements</h4>
                  <ul className="list-disc pl-5 space-y-1">{job.requirements.map((x,i)=><li key={i}>{x}</li>)}</ul>
                </div>
                <div>
                  <h4 className="font-semibold">Responsibilities</h4>
                  <ul className="list-disc pl-5 space-y-1">{job.responsibilities.map((x,i)=><li key={i}>{x}</li>)}</ul>
                </div>
                <div>
                  <h4 className="font-semibold">Benefits</h4>
                  <ul className="list-disc pl-5 space-y-1">{job.benefits.map((x,i)=><li key={i}>{x}</li>)}</ul>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Modal open={open} onClose={()=>setOpen(false)} title={active ? `Apply — ${active.title}` : 'Apply'}>
        <form name="apply" method="POST" data-netlify="true" netlify-honeypot="bot-field" onSubmit={onSubmit}>
          <input type="hidden" name="form-name" value="apply" />
          <p className="hidden"><label>Don’t fill: <input name="bot-field" /></label></p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Full Name</label>
              <input className="input" name="name" required />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" name="email" required />
            </div>
          </div>
          <div className="mt-3">
            <label className="label">Resume (URL or attach)</label>
            <input className="input" name="resume" placeholder="Link to resume" />
          </div>
          <div className="mt-3">
            <label className="label">Cover Letter</label>
            <textarea className="input" rows="4" name="cover" placeholder="A short note"></textarea>
          </div>
          <div className="mt-3" data-netlify-recaptcha="true"></div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={()=>setOpen(false)} className="btn btn-ghost">Cancel</button>
            <button type="submit" className="btn btn-primary">Submit</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
