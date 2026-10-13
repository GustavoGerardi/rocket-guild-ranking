import { useEffect, useState } from 'react';

const IMPORT_SEQUENCE = [
  'ArrowUp',
  'ArrowRight',
  'ArrowUp',
  'ArrowRight',
  'ArrowLeft',
  'ArrowLeft',
];

// Preserve the existing keyboard unlock; it is a UI control, not authentication.
export function useImportAccess(): boolean {
  const [importUnlocked, setImportUnlocked] = useState(false);
  useEffect(() => {
    let sequencePosition = 0;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat) return;

      if (event.key === IMPORT_SEQUENCE[sequencePosition]) {
        sequencePosition += 1;
        if (sequencePosition === IMPORT_SEQUENCE.length) {
          setImportUnlocked(true);
          sequencePosition = 0;
        }
      } else {
        sequencePosition = event.key === IMPORT_SEQUENCE[0] ? 1 : 0;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return importUnlocked;
}
