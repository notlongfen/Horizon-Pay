"use client";

import { useId, useState } from "react";

const offerTypeOptions = [
  "All offer types",
  "Invoice",
  "Service receivable",
  "Subscription",
  "Product sale",
  "Pay-later",
  "B2B terms",
];

type OfferFilterPanelProps = {
  query: string;
  selectedType: string;
  onQueryChange: (query: string) => void;
  onSelectedTypeChange: (type: string) => void;
};

export { offerTypeOptions };

export function OfferFilterPanel({
  query,
  selectedType,
  onQueryChange,
  onSelectedTypeChange,
}: OfferFilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const listboxId = useId();

  return (
    <form
      className="marketplace-filter-grid"
      aria-label="Offer filters"
      onSubmit={(event) => event.preventDefault()}
    >
      <label className="marketplace-search">
        <span>Search</span>
        <input
          type="search"
          name="search"
          placeholder="Business name or Offer ID"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </label>

      <div className="offer-type-picker">
        <span className="offer-type-label">Offer type</span>
        <input type="hidden" name="offerType" value={selectedType} />
        <button
          type="button"
          className="offer-type-trigger"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          onClick={() => setIsOpen((current) => !current)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setIsOpen(false);
          }}
        >
          <span>
            <small>Type</small>
            <strong>{selectedType}</strong>
          </span>
          <i aria-hidden="true" />
        </button>

        {isOpen ? (
          <div
            id={listboxId}
            className="offer-type-menu"
            role="listbox"
            aria-label="Offer type"
          >
            {offerTypeOptions.map((option) => (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={option === selectedType}
                className={option === selectedType ? "is-selected" : undefined}
                onClick={() => {
                  onSelectedTypeChange(option);
                  setIsOpen(false);
                }}
              >
                <span>{option}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </form>
  );
}
