"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "../components/ui";
import { OfferFilterPanel, offerTypeOptions } from "./offer-filter-panel";
import type { MarketplaceOffer } from "@/lib/marketplace/marketplace-types";

type MarketplaceOfferBrowserProps = {
  offers: MarketplaceOffer[];
};

function OfferDetailModal({
  offer,
  onClose,
  onBuy,
}: {
  offer: MarketplaceOffer | null;
  onClose: () => void;
  onBuy: (offer: MarketplaceOffer) => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!offer) return;

    previouslyFocusedElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previouslyFocusedElementRef.current?.focus();
    };
  }, [offer, onClose]);

  if (!offer) return null;

  return (
    <div
      className="offer-modal-overlay"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-modal-title"
        className="offer-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="offer-modal-header">
          <div>
            <p className="offer-modal-kicker">Offer detail</p>
            <h3 id="offer-modal-title" className="offer-modal-title">
              {offer.business}
            </h3>
            <p className="mt-2 text-sm text-white/56">
              {offer.id} · {offer.category} · {offer.industry}
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            className="offer-modal-close"
            onClick={onClose}
            aria-label="Close offer detail"
          >
            Done
          </button>
        </div>

        <div className="mt-7 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="offer-modal-panel">
            <div className="offer-modal-panel-title">
              <span>Overview</span>
              <strong>{offer.status}</strong>
            </div>
            <p className="mt-4 leading-7 text-white/70">{offer.summary}</p>

            <dl className="offer-modal-metrics">
              <div>
                <dt>Receivable</dt>
                <dd>{offer.amount}</dd>
              </div>
              <div>
                <dt>Purchase price</dt>
                <dd>{offer.fundingPrice}</dd>
              </div>
              <div>
                <dt>Expected repayment</dt>
                <dd>{offer.expectedRepayment}</dd>
              </div>
              <div>
                <dt>Due</dt>
                <dd>{offer.due}</dd>
              </div>
            </dl>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="offer-modal-chip">
                <span>Verification</span>
                <strong>{offer.verification}</strong>
              </div>
              <div className="offer-modal-chip">
                <span>Acknowledgement</span>
                <strong>{offer.acknowledgement}</strong>
              </div>
              <div className="offer-modal-chip">
                <span>Risk</span>
                <strong>{offer.risk} risk</strong>
              </div>
              <div className="offer-modal-chip">
                <span>Repayment asset</span>
                <strong>{offer.repaymentAsset}</strong>
              </div>
            </div>
          </section>

          <section className="offer-modal-panel">
            <div className="offer-modal-panel-title">
              <span>Repayment timeline</span>
              <strong>{offer.term}</strong>
            </div>

            <div className="mt-4 space-y-3">
              {offer.timeline.map((item) => (
                <div
                  key={item.label}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                >
                  <span className="text-sm text-white/58">{item.label}</span>
                  <strong className="text-sm text-white">{item.value}</strong>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/58">
                  Supporting notes
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-white/68">
                  {offer.notes.map((note) => (
                    <li key={note} className="rounded-2xl border border-white/10 bg-black/18 px-4 py-3">
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/58">
                  Proof items
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-white/68">
                  {offer.proof.map((item) => (
                    <li key={item} className="rounded-2xl border border-white/10 bg-black/18 px-4 py-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                className="star-button inline-flex min-h-12 items-center justify-center rounded-full bg-cyan-200 px-6 text-sm font-semibold text-cyan-950 transition hover:bg-lime-200 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-[#020504]"
                onClick={() => onBuy(offer)}
              >
                Request allocation
              </button>
              <p className="text-sm leading-6 text-white/56">
                Starts an allocation request for {offer.id} at {offer.fundingPrice}.
              </p>
            </div>

            {offer.contractId || offer.onchainOfferId ? (
              <div className="mt-5 rounded-2xl border border-cyan-200/12 bg-cyan-200/5 px-4 py-3 text-xs leading-5 text-cyan-50/62">
                {offer.onchainOfferId ? (
                  <p>On-chain Offer ID: {offer.onchainOfferId}</p>
                ) : null}
                {offer.contractId ? <p>Marketplace contract: {offer.contractId}</p> : null}
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}

import { useRouter } from "next/navigation";

export function MarketplaceOfferBrowser({ offers }: MarketplaceOfferBrowserProps) {
  const router = useRouter();
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState(offerTypeOptions[0]);

  const filteredOffers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const typeFilterActive = selectedType !== offerTypeOptions[0];

    return offers.filter((offer) => {
      const matchesType = !typeFilterActive || offer.category === selectedType;
      const searchableText = [
        offer.id,
        offer.business,
        offer.debtor,
        offer.category,
        offer.industry,
        offer.summary,
        offer.risk,
        offer.status,
      ]
        .join(" ")
        .toLowerCase();

      return matchesType && (!normalizedQuery || searchableText.includes(normalizedQuery));
    });
  }, [offers, query, selectedType]);

  const selectedOffer = useMemo(
    () => offers.find((offer) => offer.id === selectedOfferId) ?? null,
    [offers, selectedOfferId],
  );

  const handleBuyOffer = (offer: MarketplaceOffer) => {
    router.push(`/dashboard/investor?offer=${encodeURIComponent(offer.id)}&action=Fund+Offer#operations`);
  };

  return (
    <>
      <section className="parallax-section mx-auto max-w-7xl px-5 py-24">
        <h2 className="sr-only">Offer marketplace</h2>
        <Card variant="glass" padding="sm">
          <div className="mb-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100/70">
                Offer marketplace
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                Search listed Offers
              </p>
            </div>
          </div>
          <OfferFilterPanel
            query={query}
            selectedType={selectedType}
            onQueryChange={setQuery}
            onSelectedTypeChange={setSelectedType}
          />
        </Card>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {filteredOffers.map((offer) => (
            <Card key={offer.id} variant="glass" className="offer-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-sm text-cyan-200">{offer.id}</p>
                  <h3 className="mt-3 text-2xl font-semibold">
                    {offer.business}
                  </h3>
                  <p className="mt-2 text-sm font-semibold text-cyan-100/70">
                    {offer.category}
                  </p>
                </div>
                <span className="rounded-full border border-cyan-200/24 bg-cyan-200/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                  {offer.status}
                </span>
              </div>
              <dl className="offer-metrics">
                <div>
                  <dt>Receivable</dt>
                  <dd>{offer.amount}</dd>
                </div>
                <div>
                  <dt>Purchase price</dt>
                  <dd>{offer.fundingPrice}</dd>
                </div>
                <div>
                  <dt>Expected repayment</dt>
                  <dd>{offer.expectedRepayment}</dd>
                </div>
                <div>
                  <dt>Due</dt>
                  <dd>{offer.due}</dd>
                </div>
              </dl>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="offer-badge">{offer.verification}</span>
                <span className="offer-badge">{offer.acknowledgement}</span>
                <span className="offer-badge">{offer.risk} risk</span>
                <span className="offer-badge">{offer.repaymentAsset}</span>
                {offer.onchainOfferId ? (
                  <span className="offer-badge">On-chain #{offer.onchainOfferId}</span>
                ) : null}
              </div>
              <p className="mt-4 line-clamp-2 text-sm leading-6 text-white/50">{offer.summary}</p>
              <div className="mt-6 border-t border-white/8 pt-5">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/8 px-5 py-2.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/40 hover:bg-cyan-200/14 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-200/40"
                  onClick={() => setSelectedOfferId(offer.id)}
                >
                  View details
                  <span aria-hidden="true" className="opacity-70">→</span>
                </button>
              </div>
            </Card>
          ))}
        </div>
        {filteredOffers.length === 0 ? (
          <Card variant="glass" className="marketplace-empty-state mt-6">
            <p>No Offers match those filters.</p>
            <button
              type="button"
              className="mini-action"
              onClick={() => {
                setQuery("");
                setSelectedType(offerTypeOptions[0]);
              }}
            >
              Reset filters
            </button>
          </Card>
        ) : null}
      </section>

      <OfferDetailModal
        offer={selectedOffer}
        onClose={() => setSelectedOfferId(null)}
        onBuy={handleBuyOffer}
      />
    </>
  );
}
