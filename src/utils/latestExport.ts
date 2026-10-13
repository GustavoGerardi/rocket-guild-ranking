export interface ExportFileMetadata {
  name: string;
  lastModified: number;
}

// The clock is supplied by the caller so each click has a fixed cutoff.
export function findLatestJsonFile<T extends ExportFileMetadata>(
  files: Iterable<T>,
  now: number,
): T | null {
  let latest: T | null = null;

  for (const file of files) {
    if (!file.name.toLowerCase().endsWith('.json')) continue;
    if (!Number.isFinite(file.lastModified) || file.lastModified > now)
      continue;

    if (
      !latest ||
      file.lastModified > latest.lastModified ||
      (file.lastModified === latest.lastModified &&
        file.name.localeCompare(latest.name) > 0)
    ) {
      latest = file;
    }
  }

  return latest;
}
