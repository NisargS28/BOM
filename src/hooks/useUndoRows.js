import { useState, useCallback } from 'react';

export function useUndoRows(init) {
  const [stack, setStack] = useState([init]);
  const [ptr, setPtr] = useState(0);
  const current = stack[ptr];

  const set = useCallback(fn => {
    setStack(prev => {
      const base = prev[ptr];
      const next = typeof fn === 'function' ? fn(base) : fn;
      const trimmed = prev.slice(0, ptr + 1);
      trimmed.push(next);
      if (trimmed.length > 50) trimmed.shift();
      return trimmed;
    });
    setPtr(p => Math.min(p + 1, 49));
  }, [ptr]);

  const undo = useCallback(() => {
    setPtr(p => Math.max(0, p - 1));
  }, []);

  const canUndo = ptr > 0;
  return [current, set, undo, canUndo];
}
