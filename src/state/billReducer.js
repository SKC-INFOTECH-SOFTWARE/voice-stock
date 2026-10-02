export const initialBill = { lines: [] }

/**
 * A line: { item_id, code, name, unit_rate, quantity, line_total }
 * Adding an item already on the bill merges into that row (quantity increments).
 */
export function billReducer(state, action) {
  switch (action.type) {
    case 'ADD_LINE': {
      const incoming = action.line
      const idx = state.lines.findIndex((l) => l.item_id === incoming.item_id)
      if (idx === -1) {
        return { lines: [...state.lines, incoming] }
      }
      const lines = state.lines.slice()
      const merged = lines[idx]
      const quantity = round2(merged.quantity + incoming.quantity)
      lines[idx] = { ...merged, quantity, line_total: round2(merged.unit_rate * quantity) }
      return { lines }
    }
    case 'UPDATE_QTY': {
      const lines = state.lines.map((l) =>
        l.item_id === action.itemId
          ? { ...l, quantity: action.quantity, line_total: round2(l.unit_rate * action.quantity) }
          : l,
      )
      return { lines }
    }
    case 'REMOVE_LINE':
      return { lines: state.lines.filter((l) => l.item_id !== action.itemId) }
    case 'CLEAR':
      return initialBill
    default:
      return state
  }
}

export function grandTotal(lines) {
  return round2(lines.reduce((sum, l) => sum + Number(l.line_total || 0), 0))
}

function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100
}
