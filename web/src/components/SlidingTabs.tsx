'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

// ──────────────────────────────────────────────────────────
// SlidingTabs — Pure CSS sliding underline indicator
//
// HOW IT WORKS:
//   1. Each tab button's DOM node is stored in tabsRef[]
//   2. When activeTab changes, useEffect reads the active
//      button's offsetLeft & offsetWidth from the DOM
//   3. These values are written into tabStyle state
//   4. A SINGLE <div> (the underline) uses inline style
//      { left, width } + CSS transition-all to slide
// ──────────────────────────────────────────────────────────

interface SlidingTabsProps {
  /** Array of tab labels */
  tabs?: string[];
  /** Index of the initially active tab (default: 0) */
  defaultIndex?: number;
  /** Callback when tab changes */
  onChange?: (index: number, label: string) => void;
}

export default function SlidingTabs({
  tabs = ['Core Features', 'AI Grading', 'Progress', 'Resources'],
  defaultIndex = 0,
  onChange,
}: SlidingTabsProps) {
  // ── State: currently active tab index ──
  const [activeTab, setActiveTab] = useState(defaultIndex);

  // ── State: underline position & width ──
  const [tabStyle, setTabStyle] = useState({ width: 0, left: 0 });

  // ── Ref: array of DOM nodes for each tab button ──
  // We store each button element by index so we can
  // read its offsetLeft and offsetWidth later.
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  // ── Calculate underline position from the DOM ──
  // Reads the active button's offsetLeft (distance from
  // the left edge of the relative container) and
  // offsetWidth (rendered pixel width of the button).
  const updateIndicator = useCallback(() => {
    const activeButton = tabsRef.current[activeTab];
    if (activeButton) {
      setTabStyle({
        left: activeButton.offsetLeft,   // px from container left edge
        width: activeButton.offsetWidth,  // px width of the button text
      });
    }
  }, [activeTab]);

  // ── Recalculate whenever activeTab changes ──
  useEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  // ── Also recalculate on window resize (responsive) ──
  useEffect(() => {
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  // ── Tab click handler ──
  const handleTabClick = (index: number) => {
    setActiveTab(index);
    onChange?.(index, tabs[index]);
  };

  return (
    // ── Container: position relative so the absolute
    //    underline is positioned relative to this box ──
    <div className="relative w-full">

      {/* ── Tab Buttons Row ── */}
      <div className="flex items-center gap-8 border-b border-slate-200">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            // Store each button's DOM node into the ref array
            ref={(el) => { tabsRef.current[index] = el; }}
            onClick={() => handleTabClick(index)}
            className={`
              pb-3 text-sm whitespace-nowrap cursor-pointer
              transition-colors duration-200
              ${index === activeTab
                ? 'text-black font-semibold'       // Active state
                : 'text-slate-500 font-medium hover:text-black' // Inactive + hover
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Sliding Underline Indicator ──
          ONE single div, positioned absolutely at the
          bottom of the container. Its left & width are
          driven by inline style from tabStyle state.
          transition-all + duration-300 makes it SLIDE
          smoothly instead of jumping.                   */}
      <div
        className="absolute bottom-0 h-[2px] bg-black transition-all duration-300 ease-out"
        style={{
          left: tabStyle.left,
          width: tabStyle.width,
        }}
      />

      {/* ── Content Area (placeholder) ── */}
      <div className="mt-6">
        <p className="text-sm text-slate-600">
          Currently viewing: <strong className="text-slate-900">{tabs[activeTab]}</strong>
        </p>
      </div>
    </div>
  );
}
