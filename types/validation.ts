/** One fact in a Validation summary; its label is `tools.items.<tool>.summary.<key>`. */
export type SummaryItem = {
  key: string;
  value: string | number | boolean | string[];
  /** When set, `value` is a code shown as `tools.items.<tool>.<enumKey>.<value>`. */
  enumKey?: string;
};

/** What a successful Server Action returns as its payload. An invalid credential throws instead. */
export type ValidationResult = {
  outcome: "valid" | "restricted";
  /** Why the probe was refused; only for "restricted". Comes from the service. */
  reason?: string;
  summary: SummaryItem[];
};
