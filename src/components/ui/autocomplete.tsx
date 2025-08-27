"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";

export interface AutocompleteOption {
  value: string;
  label: string;
}

interface AutocompleteProps {
  options: AutocompleteOption[];
  value?: AutocompleteOption | null;
  onChange: (value?: AutocompleteOption | null) => void;
  onInputChange: (search: string) => void;
  placeholder?: string;
  emptyMessage?: string;
}

export function Autocomplete({
  options,
  value,
  onChange,
  onInputChange,
  placeholder,
  emptyMessage
}: AutocompleteProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = React.useState(value?.label || "");
  const [isListOpen, setListOpen] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);

  React.useEffect(() => {
    setInputValue(value?.label || "");
  }, [value]);

  React.useEffect(() => {
    if (isListOpen) {
      setHighlightedIndex(-1);
    }
  }, [isListOpen]);

  React.useEffect(() => {
    if (highlightedIndex !== -1 && listRef.current) {
      const item = listRef.current.querySelector(`[data-index="${highlightedIndex}"]`);
      if (item) {
        item.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  const handleInputChange = (search: string) => {
    setInputValue(search);
    onInputChange(search);
    if (!isListOpen) {
        setListOpen(true);
    }
    if (value) {
      onChange(null);
    }
  };

  const handleSelect = (option: AutocompleteOption) => {
    setInputValue(option.label);
    onChange(option);
    setTimeout(() => setListOpen(false), 0);
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (inputRef.current && !inputRef.current.contains(document.activeElement)) {
        if (!value && inputValue) {
            onChange({ value: inputValue, label: inputValue });
        }
        setListOpen(false);
      }
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isListOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev => (prev + 1) % options.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => (prev - 1 + options.length) % options.length);
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex !== -1) {
          handleSelect(options[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setListOpen(false);
        break;
    }
  };

  return (
    <div className="relative w-full" onBlur={handleBlur}>
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setListOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {isListOpen && options.length > 0 && (
          <div ref={listRef} className="absolute top-full z-10 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
            <Command>
              <CommandList>
                <CommandEmpty>{emptyMessage || "No results found."}</CommandEmpty>
                <CommandGroup>
                  {options.map((option, index) => (
                    <CommandItem
                      key={option.value}
                      data-index={index}
                      value={option.label}
                      onSelect={() => handleSelect(option)}
                      className={cn(
                        highlightedIndex === index && "bg-muted"
                      )}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value?.value === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        )}
    </div>
  );
}