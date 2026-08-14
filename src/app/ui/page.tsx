'use client'

import { useState } from 'react'
import { StackingSheet } from '@/components/ui/StackingSheet'

// ============================================================================
// Demo data
// ============================================================================

const DRINKS = [
  { id: 1, name: 'Espresso Martini', tag: 'Strong', desc: 'Vodka, coffee liqueur, fresh espresso, simple syrup.' },
  { id: 2, name: 'Old Fashioned', tag: 'Classic', desc: 'Bourbon, Angostura bitters, sugar cube, orange peel.' },
  { id: 3, name: 'Negroni', tag: 'Bitter', desc: 'Gin, sweet vermouth, Campari, orange twist.' },
  { id: 4, name: 'Aperol Spritz', tag: 'Light', desc: 'Aperol, prosecco, splash of soda, orange slice.' },
]

type Drink = typeof DRINKS[0]

// ============================================================================
// Page
// ============================================================================

export default function UIPage() {
  const [showMenu, setShowMenu] = useState(false)
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  function handleSelectDrink(drink: Drink) {
    setSelectedDrink(drink)
  }

  function handleDetailDismiss(presented: boolean) {
    if (!presented) setSelectedDrink(null)
  }

  function handleOrder() {
    const name = selectedDrink?.name ?? ''
    setShowConfirm(false)
    setSelectedDrink(null)
    setShowMenu(false)
    setSuccessMsg(`${name} ordered!`)
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  return (
    <div style={styles.page}>

      {/* ── Header ────────────────────────────────────────── */}
      <div style={styles.header}>
        <h1 style={styles.title}>StackingSheet</h1>
        <p style={styles.subtitle}>
          N-layer stacking demo — each drawer scales back as the next opens on top
        </p>
      </div>

      {/* ── Layer diagram ─────────────────────────────────── */}
      <div style={styles.diagram}>
        {[
          { label: 'Layer 3', sub: 'Confirm order', active: showConfirm },
          { label: 'Layer 2', sub: 'Drink detail', active: !!selectedDrink },
          { label: 'Layer 1', sub: 'Drinks menu', active: showMenu },
        ].map(({ label, sub, active }) => (
          <div key={label} style={{ ...styles.diagramRow, opacity: active ? 1 : 0.35 }}>
            <span style={{ ...styles.diagramDot, background: active ? '#4ade80' : '#444' }} />
            <span style={styles.diagramLabel}>{label}</span>
            <span style={styles.diagramSub}>{sub}</span>
          </div>
        ))}
      </div>

      {/* ── Trigger ───────────────────────────────────────── */}
      <button style={styles.openButton} onClick={() => setShowMenu(true)}>
        Open Drinks Menu
      </button>

      {successMsg && (
        <p style={styles.successMsg}>✓ {successMsg}</p>
      )}

      {/* ================================================================
          StackingSheet — 3 sibling layers sharing one stack
          ================================================================ */}
      <StackingSheet.Root>

        {/* ── Layer 1: Drinks menu ─────────────────────────── */}
        <StackingSheet.Layer
          presented={showMenu}
          onPresentedChange={setShowMenu}
        >
          <StackingSheet.Layer.Portal>
            <StackingSheet.Layer.View>
              <StackingSheet.Layer.Backdrop />
              <StackingSheet.Layer.Content>
                <div style={styles.frame}>
                  <StackingSheet.Layer.Handle />
                  <div style={styles.sheetHeader}>
                    <StackingSheet.Layer.Title asChild>
                      <p style={styles.sheetTitle}>Drinks</p>
                    </StackingSheet.Layer.Title>
                    <p style={styles.sheetSubtitle}>Tap a drink to see details</p>
                  </div>

                  <div style={styles.drinkList}>
                    {DRINKS.map((drink) => (
                      <button
                        key={drink.id}
                        style={styles.drinkRow}
                        onClick={() => handleSelectDrink(drink)}
                      >
                        <div>
                          <p style={styles.drinkName}>{drink.name}</p>
                          <p style={styles.drinkDesc}>{drink.desc}</p>
                        </div>
                        <span style={styles.drinkTag}>{drink.tag}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </StackingSheet.Layer.Content>
            </StackingSheet.Layer.View>
          </StackingSheet.Layer.Portal>
        </StackingSheet.Layer>

        {/* ── Layer 2: Drink detail ────────────────────────── */}
        <StackingSheet.Layer
          presented={!!selectedDrink}
          onPresentedChange={handleDetailDismiss}
        >
          <StackingSheet.Layer.Portal>
            <StackingSheet.Layer.View>
              <StackingSheet.Layer.Backdrop />
              <StackingSheet.Layer.Content>
                <div style={styles.frame}>
                  <StackingSheet.Layer.Handle />
                  <div style={styles.sheetHeader}>
                    <StackingSheet.Layer.Title asChild>
                      <p style={styles.sheetTitle}>{selectedDrink?.name}</p>
                    </StackingSheet.Layer.Title>
                    <p style={styles.sheetSubtitle}>{selectedDrink?.tag}</p>
                  </div>

                  <p style={styles.detailDesc}>{selectedDrink?.desc}</p>

                  <button
                    style={styles.primaryButton}
                    onClick={() => setShowConfirm(true)}
                  >
                    Order this drink
                  </button>
                </div>
              </StackingSheet.Layer.Content>
            </StackingSheet.Layer.View>
          </StackingSheet.Layer.Portal>
        </StackingSheet.Layer>

        {/* ── Layer 3: Confirmation ────────────────────────── */}
        <StackingSheet.Layer
          presented={showConfirm}
          onPresentedChange={setShowConfirm}
        >
          <StackingSheet.Layer.Portal>
            <StackingSheet.Layer.View>
              <StackingSheet.Layer.Backdrop />
              <StackingSheet.Layer.Content>
                <div style={styles.frame}>
                  <StackingSheet.Layer.Handle />
                  <div style={styles.sheetHeader}>
                    <StackingSheet.Layer.Title asChild>
                      <p style={styles.sheetTitle}>Confirm Order</p>
                    </StackingSheet.Layer.Title>
                    <p style={styles.sheetSubtitle}>
                      Place your order for {selectedDrink?.name}?
                    </p>
                  </div>

                  <div style={styles.confirmActions}>
                    <button style={styles.primaryButton} onClick={handleOrder}>
                      Yes, order it
                    </button>
                    <button
                      style={styles.ghostButton}
                      onClick={() => setShowConfirm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </StackingSheet.Layer.Content>
            </StackingSheet.Layer.View>
          </StackingSheet.Layer.Portal>
        </StackingSheet.Layer>

      </StackingSheet.Root>
    </div>
  )
}

// ============================================================================
// Styles
// ============================================================================

const styles = {
  page: {
    minHeight: '100dvh',
    background: '#0a0a0a',
    color: '#fff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '48px 24px 80px',
    gap: '32px',
  },
  header: {
    textAlign: 'center' as const,
    maxWidth: 420,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    margin: 0,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
    lineHeight: 1.5,
  },
  diagram: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
    width: '100%',
    maxWidth: 320,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: '16px 20px',
  },
  diagramRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    transition: 'opacity 200ms ease',
  },
  diagramDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
    transition: 'background 200ms ease',
  },
  diagramLabel: {
    fontSize: 13,
    fontWeight: 600,
    minWidth: 56,
  },
  diagramSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
  },
  openButton: {
    background: '#fff',
    color: '#000',
    border: 'none',
    borderRadius: 14,
    padding: '14px 28px',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '-0.2px',
  },
  successMsg: {
    color: '#4ade80',
    fontSize: 14,
    fontWeight: 600,
    margin: 0,
  },
  // Sheet content styles
  frame: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: 400,
    paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
  },
  sheetHeader: {
    padding: '16px 20px 8px',
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: 700,
    margin: 0,
    letterSpacing: '-0.3px',
  },
  sheetSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    margin: '4px 0 0',
  },
  drinkList: {
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '8px 12px 0',
    gap: 4,
    flex: 1,
    overflowY: 'auto' as const,
  },
  drinkRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '12px 8px',
    borderRadius: 12,
    border: 'none',
    background: 'transparent',
    color: '#fff',
    textAlign: 'left' as const,
    cursor: 'pointer',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    WebkitTapHighlightColor: 'transparent',
  },
  drinkName: {
    fontSize: 15,
    fontWeight: 600,
    margin: 0,
  },
  drinkDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    margin: '3px 0 0',
  },
  drinkTag: {
    fontSize: 11,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.55)',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: 6,
    padding: '3px 8px',
    flexShrink: 0,
  },
  detailDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 1.6,
    margin: '0 20px 24px',
  },
  primaryButton: {
    margin: '8px 20px 0',
    padding: '14px 20px',
    background: '#fff',
    color: '#000',
    border: 'none',
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '-0.2px',
  },
  confirmActions: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
    padding: '8px 20px 0',
  },
  ghostButton: {
    padding: '14px 20px',
    background: 'transparent',
    color: 'rgba(255,255,255,0.5)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
} satisfies Record<string, React.CSSProperties>
