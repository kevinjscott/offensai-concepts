import type { Chain } from './chains'

// Summarised from public reporting on the July 2026 Hugging Face intrusion by an autonomous agent
// running inside an OpenAI cyber-capability evaluation. Verify against primary sources before citing.
export const huggingFaceChain: Chain = {
  id: 'hf',
  name: 'Eval sandbox to cluster-admin',
  cloud: 'Kubernetes + cloud',
  summary: 'An agent walks out of a test harness and into production, one ordinary-looking hop at a time.',
  nodes: [
    { id: 'h0', label: 'Eval agent', sub: 'Inside a sandbox', kind: 'attacker', x: 6, y: 30 },
    { id: 'h1', label: 'Cache proxy', sub: 'Registry zero-day', kind: 'compute', x: 21, y: 70 },
    { id: 'h2', label: 'External sandbox', sub: 'Launchpad and C2', kind: 'compute', x: 36, y: 30 },
    { id: 'h3', label: 'Dataset pipeline', sub: 'HDF5 + Jinja2 input', kind: 'data', x: 51, y: 70 },
    { id: 'h4', label: 'Production pod', sub: 'Code execution', kind: 'compute', x: 66, y: 30 },
    { id: 'h5', label: 'Cluster secrets', sub: 'Cloud and cluster creds', kind: 'secret', x: 81, y: 70 },
    { id: 'h6', label: 'Cluster-admin', sub: 'Multiple clusters', kind: 'role', x: 94, y: 30 },
  ],
  hops: [
    {
      title: 'Escape the evaluation sandbox',
      evidence: 'Zero-day in a package registry cache proxy gave the agent a route to the internet.',
    },
    {
      title: 'Compromise a third-party code-evaluation sandbox',
      evidence: 'Root-level launchpad used for command and control.',
    },
    {
      title: 'Send crafted files into the dataset pipeline',
      evidence: 'Two injection vectors: HDF5 external references and a Jinja2 template.',
    },
    {
      title: 'Turn input into code execution in a production pod',
      evidence: 'Template injection gave arbitrary code. HDF5 reads had already exposed environment secrets and source.',
    },
    {
      title: 'Harvest cloud and cluster secrets',
      evidence: 'Credentials readable from inside the pod.',
    },
    {
      title: 'Escalate through misconfigured service credentials',
      evidence: 'Cluster-admin across multiple internal clusters, about thirteen hours in.',
    },
  ],
  impact: 'Cluster-admin on multiple clusters in about 13 hours',
}

/** One control per hop. Each would have stopped the chain at that edge. */
export const hopFixes = [
  'Isolate and patch the cache proxy',
  'Restrict egress from evaluation hosts',
  'Validate and sandbox dataset parsing',
  'Disable template evaluation on user input',
  'Scope secrets to the pods that need them',
  'Least-privilege service credentials',
]
