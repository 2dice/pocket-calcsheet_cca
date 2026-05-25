import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockCalculateAll = vi.fn()
const mockStoreState = {
  entities: {} as Record<string, unknown>,
  updateOverviewData: vi.fn(),
  initializeSheet: vi.fn(),
}

vi.mock('@/components/calculator/ExpressionRenderer', () => ({
  ExpressionRenderer: ({ expression }: { expression: string }) => (
    <div>{expression}</div>
  ),
}))
vi.mock('@/hooks/useCalculation', () => ({
  useCalculation: () => ({ calculateAll: mockCalculateAll }),
}))
vi.mock('@/store', () => ({ useSheetsStore: () => mockStoreState }))
import { OverviewTab } from '@/pages/OverviewTab'

describe('OverviewTab - Result表示', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  const renderOverviewTab = () =>
    render(
      <MemoryRouter
        initialEntries={['/sheet-1/overview']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route path="/:id/overview" element={<OverviewTab />} />
        </Routes>
      </MemoryRouter>
    )

  it('result表示', () => {
    mockStoreState.entities = {
      'sheet-1': {
        overviewData: { description: 'd' },
        formulaData: { inputExpr: '1+2', result: 1234567, error: null },
      },
    }
    renderOverviewTab()
    expect(screen.getByTestId('result-latex').textContent).toContain(
      '1.234567000000000'
    )
  })

  it('error表示', () => {
    mockStoreState.entities = {
      'sheet-1': {
        overviewData: { description: 'd' },
        formulaData: { inputExpr: '1/0', result: null, error: 'Error' },
      },
    }
    renderOverviewTab()
    expect(screen.getByText('= Error')).toBeInTheDocument()
  })
})
