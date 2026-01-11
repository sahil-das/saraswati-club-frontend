import React from 'react';
import { Button } from './ui/Button';

export default function NoticeBoardWidget() {
  return (
    <aside
      className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-color)] p-6 space-y-4"
      role="region"
      aria-labelledby="notice-title"
    >
      <h2 id="notice-title" className="font-bold text-lg text-[var(--text-main)]">
        Notice Board
      </h2>

      <p className="text-sm text-[var(--text-muted)]">
        Share important announcements with all club members.
      </p>

      <Button size="sm" variant="primary">
        Post Notice
      </Button>
    </aside>
  );
}