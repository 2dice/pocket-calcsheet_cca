import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { SheetList } from '@/components/sheets/SheetList'
import { useUIStore, useSheetsStore } from '@/store'
import { validateSheetName } from '@/types/sheet'

export function TopPage() {
  const [editingNewItem, setEditingNewItem] = useState(false)
  const [showEmptyNameAlert, setShowEmptyNameAlert] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { isEditMode, toggleEditMode, setCurrentSheetId } = useUIStore()
  const {
    sheets,
    addSheet,
    removeSheet,
    reorderSheets,
    updateSheet,
    storageError,
    setStorageError,
    persistenceError,
    setPersistenceError,
  } = useSheetsStore()

  const handleEditButtonClick = () => {
    toggleEditMode()
    if (editingNewItem) {
      setEditingNewItem(false)
    }
  }

  const handleAddButtonClick = () => {
    setEditingNewItem(true)
  }

  const handleNewItemConfirm = (value: string) => {
    if (value.trim() === '') {
      setShowEmptyNameAlert(true)
      return
    }

    addSheet(value.trim())
    setEditingNewItem(false)
  }

  const handleNewItemCancel = () => {
    setEditingNewItem(false)
  }

  const handleSheetClick = (id: string) => {
    setCurrentSheetId(id)
  }

  const handleDeleteSheet = (id: string) => {
    removeSheet(id)
  }

  const handleUpdateSheet = (id: string, name: string) => {
    const validatedName = validateSheetName(name)
    if (!validatedName) {
      setShowEmptyNameAlert(true)
      return
    }
    updateSheet(id, validatedName)
  }

  const handleEmptyNameAlertOk = useCallback(() => {
    setShowEmptyNameAlert(false)
    inputRef.current?.focus()
  }, [])

  return (
    <div data-testid="top-page" className="min-h-svh bg-gray-50">
      {/* ヘッダー */}
      <div className="px-4 py-3 flex items-center justify-between bg-gray-50 sticky top-0 z-10">
        {/* 左側 - 編集モード時に+ボタン表示 */}
        <div className="flex-1">
          {isEditMode && (
            <Button
              size="sm"
              variant="outline"
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
              onClick={handleAddButtonClick}
              aria-label="新しいシートを追加"
            >
              +
            </Button>
          )}
        </div>

        {/* 中央 - アプリ名 */}
        <h1 className="text-xl font-semibold text-gray-900">ぽけっと計算表</h1>

        {/* 右側 - 編集/完了ボタン */}
        <div className="flex-1 flex justify-end">
          <Button
            data-testid="edit-button"
            variant="outline"
            size="sm"
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
            onClick={handleEditButtonClick}
          >
            {isEditMode ? '完了' : '編集'}
          </Button>
        </div>
      </div>

      {/* リスト部分 */}
      <div className="p-4">
        <SheetList
          sheets={sheets}
          isEditMode={isEditMode}
          editingNewItem={editingNewItem}
          onSheetClick={handleSheetClick}
          onDeleteSheet={handleDeleteSheet}
          onUpdateSheet={handleUpdateSheet}
          onNewItemConfirm={handleNewItemConfirm}
          onNewItemCancel={handleNewItemCancel}
          onReorderSheets={reorderSheets}
          inputRef={inputRef}
        />
      </div>

      {/* 空欄確定時の警告ダイアログ */}
      <AlertDialog
        open={showEmptyNameAlert}
        onOpenChange={setShowEmptyNameAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>名前を入力してください</AlertDialogTitle>
            <AlertDialogDescription>
              シート名を空欄にすることはできません。名前を入力してください。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleEmptyNameAlertOk}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ストレージエラーダイアログ */}
      <AlertDialog open={storageError} onOpenChange={setStorageError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ストレージ容量が不足しています</AlertDialogTitle>
            <AlertDialogDescription>
              ブラウザのストレージ容量が上限に達しました。
              不要なシートを削除してから再度お試しください。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setStorageError(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 永続化エラーダイアログ */}
      <AlertDialog open={persistenceError} onOpenChange={setPersistenceError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ストレージ保護の設定</AlertDialogTitle>
            <AlertDialogDescription>
              データの長期保存リクエストが却下されました。長期保存するにはダウンロードして使用してください
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
