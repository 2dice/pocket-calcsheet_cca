import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { TabBar } from '@/components/layout/TabBar'
import { AppLayout } from '@/components/layout/AppLayout'
import { OverviewTab } from '@/pages/OverviewTab'
import { VariablesTab } from '@/pages/VariablesTab'
import { FormulaTab } from '@/pages/FormulaTab'
import type { SheetMeta } from '@/types/sheet'

// @step3-1

describe('TabNavigation', () => {
  const mockSheet: SheetMeta = {
    id: 'test-sheet-1',
    name: 'テストシート',
    order: 1,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  }

  describe('Header', () => {
    it('戻るボタンが表示される', () => {
      const mockOnBack = vi.fn()
      render(<Header sheet={mockSheet} onBack={mockOnBack} />)

      const backButton = screen.getByRole('button', { name: /戻る|back/i })
      expect(backButton).toBeInTheDocument()
    })

    it('戻るボタンクリックのコールバック呼び出し', () => {
      const mockOnBack = vi.fn()
      render(<Header sheet={mockSheet} onBack={mockOnBack} />)

      const backButton = screen.getByRole('button', { name: /戻る|back/i })
      fireEvent.click(backButton)

      expect(mockOnBack).toHaveBeenCalledTimes(1)
    })

    it('シート名が表示される', () => {
      const mockOnBack = vi.fn()
      render(<Header sheet={mockSheet} onBack={mockOnBack} />)

      expect(screen.getByText('テストシート')).toBeInTheDocument()
    })
  })

  describe('TabBar', () => {
    it('3つのタブが表示される', () => {
      const mockOnTabChange = vi.fn()
      render(
        <MemoryRouter
          initialEntries={['/test-sheet/overview']}
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route
              path="/:id/:tab"
              element={<TabBar onTabChange={mockOnTabChange} />}
            />
          </Routes>
        </MemoryRouter>
      )

      expect(screen.getByText('Overview')).toBeInTheDocument()
      expect(screen.getByText('Variables')).toBeInTheDocument()
      expect(screen.getByText('Formula')).toBeInTheDocument()
    })

    it('各タブのアイコンとラベルが正しい', () => {
      const mockOnTabChange = vi.fn()
      render(
        <MemoryRouter
          initialEntries={['/test-sheet/overview']}
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route
              path="/:id/:tab"
              element={<TabBar onTabChange={mockOnTabChange} />}
            />
          </Routes>
        </MemoryRouter>
      )

      // アイコンの確認（alt属性で確認）
      expect(screen.getByAltText('Overview')).toBeInTheDocument()
      expect(screen.getByAltText('Variables')).toBeInTheDocument()
      expect(screen.getByAltText('Formula')).toBeInTheDocument()
    })

    it('タブクリックで選択状態が変わる', () => {
      const mockOnTabChange = vi.fn()
      render(
        <MemoryRouter
          initialEntries={['/test-sheet/overview']}
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route
              path="/:id/:tab"
              element={<TabBar onTabChange={mockOnTabChange} />}
            />
          </Routes>
        </MemoryRouter>
      )

      const variablesTab = screen.getByRole('tab', { name: /variables/i })
      fireEvent.click(variablesTab)

      expect(mockOnTabChange).toHaveBeenCalledWith('variables')
    })

    it('現在のタブが視覚的に強調される', () => {
      const mockOnTabChange = vi.fn()
      render(
        <MemoryRouter
          initialEntries={['/test-sheet/variables']}
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route
              path="/:id/:tab"
              element={<TabBar onTabChange={mockOnTabChange} />}
            />
          </Routes>
        </MemoryRouter>
      )

      const variablesTab = screen.getByRole('tab', { name: /variables/i })
      expect(variablesTab).toHaveAttribute('data-selected', 'true')
    })
  })

  describe('Tab Pages', () => {
    it('OverviewTabが正常にレンダリングされる', () => {
      render(<OverviewTab />)
      expect(screen.getByText('Overview')).toBeInTheDocument()
    })

    it('VariablesTabが正常にレンダリングされる', () => {
      render(<VariablesTab />)
      expect(screen.getByText('Variables')).toBeInTheDocument()
    })

    it('FormulaTabが正常にレンダリングされる', () => {
      render(<FormulaTab />)
      expect(screen.getByText('Formula')).toBeInTheDocument()
    })
  })

  describe('AppLayout', () => {
    it('Header、コンテンツ、TabBarが正しく配置される', () => {
      const mockOnBack = vi.fn()
      const mockOnTabChange = vi.fn()

      render(
        <MemoryRouter
          initialEntries={['/test-sheet/overview']}
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route
              path="/:id/:tab"
              element={
                <AppLayout
                  sheet={mockSheet}
                  onBack={mockOnBack}
                  onTabChange={mockOnTabChange}
                >
                  <div data-testid="content">テストコンテンツ</div>
                </AppLayout>
              }
            />
          </Routes>
        </MemoryRouter>
      )

      // Header要素が存在する
      expect(screen.getByText('テストシート')).toBeInTheDocument()
      // TabBar要素が存在する
      expect(screen.getByText('Overview')).toBeInTheDocument()
      expect(screen.getByText('Variables')).toBeInTheDocument()
      expect(screen.getByText('Formula')).toBeInTheDocument()
      // コンテンツが存在する
      expect(screen.getByTestId('content')).toBeInTheDocument()
    })
  })
})
