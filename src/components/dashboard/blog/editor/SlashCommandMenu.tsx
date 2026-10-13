"use client";

import type { SlashCommand } from "@/lib/cms/blogBlocks";

type SlashCommandMenuProps = {
  commands: SlashCommand[];
  onSelect: (cmd: SlashCommand) => void;
  onClose: () => void;
};

export function SlashCommandMenu({
  commands,
  onSelect,
  onClose,
}: SlashCommandMenuProps) {
  if (!commands.length) {
    return (
      <div className="blog-slash-menu">
        <p className="px-3 py-2 text-xs text-white/40">No matching blocks</p>
      </div>
    );
  }

  return (
    <div className="blog-slash-menu" role="listbox">
      {commands.map((cmd) => (
        <button
          key={cmd.id}
          type="button"
          role="option"
          className="blog-slash-menu-item"
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(cmd);
            onClose();
          }}
        >
          <span className="font-manrope text-sm text-white">{cmd.label}</span>
          <span className="text-xs text-white/40">{cmd.description}</span>
        </button>
      ))}
    </div>
  );
}
