export type TermKind = 'cmd' | 'out' | 'ok' | 'warn' | 'err' | 'dim'

export interface TermLine {
  k: TermKind
  t: string
}
