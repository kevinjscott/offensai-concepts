export type NodeKind =
  | 'attacker'
  | 'repo'
  | 'identity'
  | 'role'
  | 'secret'
  | 'compute'
  | 'data'

export interface ChainNode {
  id: string
  label: string
  sub: string
  kind: NodeKind
  /** 0-100, horizontal position in the desktop graph */
  x: number
  /** 0-100, vertical position in the desktop graph */
  y: number
}

export interface ChainHop {
  /** What happens on this hop, in plain English */
  title: string
  /** The evidence line the validation run would log */
  evidence: string
}

export interface Chain {
  id: string
  name: string
  cloud: string
  summary: string
  nodes: ChainNode[]
  /** hops[i] connects nodes[i] to nodes[i + 1] */
  hops: ChainHop[]
  impact: string
}

// Illustrative scenarios. Modeled on the GitLab OIDC wildcard trust example OFFENSAI shows publicly.
export const azureChain: Chain = {
  id: 'azure',
  name: 'GitLab to Azure production',
  cloud: 'Azure',
  summary: 'A CI token walks into a production tenant through one loose trust rule.',
  nodes: [
    { id: 'a0', label: 'Attacker', sub: 'Forked project', kind: 'attacker', x: 7, y: 30 },
    { id: 'a1', label: 'GitLab CI job', sub: 'Mints OIDC token', kind: 'repo', x: 25, y: 70 },
    { id: 'a2', label: 'Federated trust', sub: 'Wildcard subject', kind: 'identity', x: 44, y: 28 },
    { id: 'a3', label: 'Service principal', sub: 'Contributor role', kind: 'role', x: 62, y: 72 },
    { id: 'a4', label: 'Key Vault', sub: 'Reads signing key', kind: 'secret', x: 80, y: 30 },
    { id: 'a5', label: 'Production tenant', sub: 'Customer data', kind: 'data', x: 93, y: 70 },
  ],
  hops: [
    { title: 'Run code in a pipeline the attacker can influence', evidence: 'Pipeline executed on untrusted ref. Token minted.' },
    { title: 'Present the token to Azure', evidence: 'Trust subject matches wildcard. Exchange accepted.' },
    { title: 'Become the service principal', evidence: 'Assumed identity with Contributor on prod subscription.' },
    { title: 'Read secrets the role can reach', evidence: 'Signing key retrieved from Key Vault (read-only proof).' },
    { title: 'Reach production data', evidence: 'Storage account enumerated. Customer containers reachable.' },
  ],
  impact: 'Production data reachable from an untrusted fork',
}

export const awsChain: Chain = {
  id: 'aws',
  name: 'Leaked key to data lake',
  cloud: 'AWS',
  summary: 'A stale developer key pivots through two role hops into the data lake.',
  nodes: [
    { id: 'w0', label: 'Attacker', sub: 'Leaked dev key', kind: 'attacker', x: 7, y: 70 },
    { id: 'w1', label: 'IAM user', sub: 'Low privilege', kind: 'identity', x: 25, y: 30 },
    { id: 'w2', label: 'ci-deploy role', sub: 'AssumeRole allowed', kind: 'role', x: 44, y: 72 },
    { id: 'w3', label: 'Lambda function', sub: 'PassRole abuse', kind: 'compute', x: 62, y: 28 },
    { id: 'w4', label: 'Secrets Manager', sub: 'Db credentials', kind: 'secret', x: 80, y: 70 },
    { id: 'w5', label: 'Data lake', sub: 'Customer records', kind: 'data', x: 93, y: 30 },
  ],
  hops: [
    { title: 'Authenticate with the leaked key', evidence: 'sts:GetCallerIdentity succeeded for dev-contractor.' },
    { title: 'Assume a deploy role', evidence: 'Trust policy allows the user. Session issued.' },
    { title: 'Pass a stronger role to compute', evidence: 'iam:PassRole permitted to function execution role.' },
    { title: 'Pull credentials from the secret store', evidence: 'Secret value readable by function role.' },
    { title: 'Reach the data lake', evidence: 'Bucket listing returned with the recovered credentials.' },
  ],
  impact: 'Data lake reachable from a single leaked key',
}

export const crossCloudChain: Chain = {
  id: 'cross',
  name: 'One path, two clouds',
  cloud: 'AWS + Azure',
  summary: 'The attacker never stays in one cloud. Neither can the graph.',
  nodes: [
    { id: 'c0', label: 'Attacker', sub: 'Phished developer', kind: 'attacker', x: 7, y: 30 },
    { id: 'c1', label: 'Source repo', sub: 'Write access', kind: 'repo', x: 25, y: 70 },
    { id: 'c2', label: 'AWS build role', sub: 'OIDC to AWS', kind: 'role', x: 44, y: 28 },
    { id: 'c3', label: 'Cross-cloud cred', sub: 'Federated to Azure', kind: 'identity', x: 62, y: 72 },
    { id: 'c4', label: 'Azure app', sub: 'Graph API scope', kind: 'compute', x: 80, y: 30 },
    { id: 'c5', label: 'Entra tenant', sub: 'Admin consent', kind: 'data', x: 93, y: 70 },
  ],
  hops: [
    { title: 'Push to a repo the developer can write to', evidence: 'Branch protection absent on deploy branch.' },
    { title: 'Build job assumes an AWS role', evidence: 'Role assumed through OIDC from the build.' },
    { title: 'Use the role to mint an Azure credential', evidence: 'Federated credential exchange accepted by Azure.' },
    { title: 'Act as the Azure application', evidence: 'Token issued with directory read and write scope.' },
    { title: 'Reach the identity tenant', evidence: 'Admin consent grant path confirmed (not executed).' },
  ],
  impact: 'Two clouds, one chain, no alert in either',
}

// Mirrors the four steps on offensai.com/external-attack-validation: start from a domain, account ID or bucket
// with no credentials, expand with OSINT, enumerate and classify exposure, then validate the chain.
export const externalChain: Chain = {
  id: 'external',
  name: 'Domain to data lake',
  cloud: 'External',
  summary: 'No credentials. Public signals only, until one exposed bucket changes that.',
  nodes: [
    { id: 'e0', label: 'Attacker', sub: 'A domain, no credentials', kind: 'attacker', x: 5, y: 30 },
    { id: 'e1', label: 'Public code repo', sub: 'Leaks account ID and bucket', kind: 'repo', x: 18, y: 70 },
    { id: 'e2', label: 'Public bucket', sub: 'Key left in a backup file', kind: 'secret', x: 31, y: 30 },
    { id: 'e3', label: 'IAM user', sub: 'Low privilege', kind: 'identity', x: 44, y: 70 },
    { id: 'e4', label: 'ci-deploy role', sub: 'AssumeRole allowed', kind: 'role', x: 57, y: 30 },
    { id: 'e5', label: 'Lambda function', sub: 'PassRole abuse', kind: 'compute', x: 70, y: 70 },
    { id: 'e6', label: 'Secrets Manager', sub: 'Db credentials', kind: 'secret', x: 83, y: 30 },
    { id: 'e7', label: 'Data lake', sub: 'Customer records', kind: 'data', x: 95, y: 70 },
  ],
  hops: [
    { title: 'Map the footprint using only public signals', evidence: 'OSINT on the domain found a public repo naming an AWS account ID and a bucket.' },
    { title: 'Reach the exposed bucket', evidence: 'Bucket listing is public. A backup file is readable.' },
    { title: 'Use the credential found in the file', evidence: 'sts:GetCallerIdentity succeeded for dev-contractor.' },
    { title: 'Assume a deploy role', evidence: 'Trust policy allows the user. Session issued.' },
    { title: 'Pass a stronger role to compute', evidence: 'iam:PassRole permitted to function execution role.' },
    { title: 'Pull credentials from the secret store', evidence: 'Secret value readable by function role.' },
    { title: 'Reach the data lake', evidence: 'Bucket listing returned with the recovered credentials.' },
  ],
  impact: 'Data lake reachable starting from nothing but a domain name',
}

export const chains = [externalChain, azureChain, awsChain, crossCloudChain]
